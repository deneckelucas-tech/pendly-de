import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// DB transport.rest is the only nationwide endpoint
const DB_ENDPOINT = "https://v6.db.transport.rest";

// Cache TTL in seconds per endpoint type
const CACHE_TTL: Record<string, number> = {
  locations: 86400,
  journeys: 300,
  departures: 120,
};

function getCacheTTL(endpoint: string): number {
  return CACHE_TTL[endpoint] || 300;
}

function generateCacheKey(endpoint: string, params: Record<string, string>): string {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return `${endpoint}:${sorted}`;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(id);
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchFromHAFAS(path: string, params: URLSearchParams): Promise<any> {
  const url = `${DB_ENDPOINT}/${path}?${params}`;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[TRANSPORT] Attempt ${attempt}: ${url}`);
      const res = await fetchWithTimeout(url, 15000);
      if (res.ok) {
        console.log(`[TRANSPORT] Success on attempt ${attempt}`);
        return await res.json();
      }
      const body = await res.text().catch(() => "");
      console.log(`[TRANSPORT] HTTP ${res.status} on attempt ${attempt}: ${body.slice(0, 200)}`);
      if (res.status >= 400 && res.status < 500) {
        throw new Error(`API client error ${res.status}: ${body.slice(0, 200)}`);
      }
      // Server error — retry
    } catch (err: any) {
      if (err.message?.startsWith("API client error")) throw err;
      console.log(`[TRANSPORT] Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw new Error(`HAFAS unavailable after ${maxRetries} attempts: ${err.message}`);
    }
    await sleep(1000 * attempt); // backoff: 1s, 2s, 3s
  }
  throw new Error("HAFAS unreachable");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint || !["locations", "journeys", "departures", "remarks"].includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint. Use: locations, journeys, departures, remarks" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build params from query string (minus our 'endpoint' param)
    const params = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== "endpoint" && key !== "stationId") params.set(key, value);
    }

    // For departures, we need station ID in the path
    const stationId = url.searchParams.get("stationId");
    let apiPath: string;
    if (endpoint === "departures") {
      if (!stationId) {
        return new Response(
          JSON.stringify({ error: "stationId required for departures" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      apiPath = `stops/${stationId}/departures`;
    } else if (endpoint === "locations") {
      apiPath = "locations";
    } else if (endpoint === "remarks") {
      apiPath = "remarks";
    } else {
      apiPath = "journeys";
    }

    // Generate cache key
    const cacheParams: Record<string, string> = {};
    for (const [k, v] of params.entries()) cacheParams[k] = v;
    if (stationId) cacheParams["_stationId"] = stationId;
    const cacheKey = generateCacheKey(endpoint, cacheParams);

    // Check cache first
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: cached } = await supabase
      .from("transport_cache")
      .select("response_data, expires_at")
      .eq("cache_key", cacheKey)
      .single();

    if (cached && new Date(cached.expires_at) > new Date()) {
      return new Response(
        JSON.stringify(cached.response_data),
        { 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "X-Cache": "HIT",
          } 
        }
      );
    }

    // Fetch from HAFAS with fallback
    const data = await fetchFromHAFAS(apiPath, params);

    // Store in cache (async, don't wait)
    const ttl = getCacheTTL(endpoint);
    const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
    
    supabase
      .from("transport_cache")
      .upsert({
        cache_key: cacheKey,
        endpoint,
        response_data: data,
        expires_at: expiresAt,
      }, { onConflict: "cache_key" })
      .then(() => {})
      .catch(() => {}); // fire and forget

    // Clean up expired entries occasionally (1% chance)
    if (Math.random() < 0.01) {
      supabase
        .from("transport_cache")
        .delete()
        .lt("expires_at", new Date().toISOString())
        .then(() => {})
        .catch(() => {});
    }

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "X-Cache": "MISS",
        } 
      }
    );
  } catch (err: any) {
    console.error("Transport proxy error:", err);

    return new Response(
      JSON.stringify({ error: "Transport API temporarily unavailable. Please try again later." }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
