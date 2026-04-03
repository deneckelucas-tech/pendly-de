import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.1/cors";

// Multiple HAFAS endpoints for fallback
const ENDPOINTS = [
  "https://v6.db.transport.rest",
  "https://v6.vbb.transport.rest",
];

// Cache TTL in seconds per endpoint type
const CACHE_TTL: Record<string, number> = {
  locations: 86400,   // 24h — stations rarely change
  journeys: 300,      // 5 min — journeys change frequently
  departures: 120,    // 2 min — departures are real-time
};

function getCacheTTL(endpoint: string): number {
  return CACHE_TTL[endpoint] || 300;
}

function generateCacheKey(endpoint: string, params: Record<string, string>): string {
  const sorted = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join("&");
  return `${endpoint}:${sorted}`;
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function fetchFromHAFAS(path: string, params: URLSearchParams): Promise<any> {
  for (const base of ENDPOINTS) {
    try {
      const url = `${base}/${path}?${params}`;
      const res = await fetchWithTimeout(url, 8000);
      if (res.ok) {
        return await res.json();
      }
      // If 503 or server error, try next endpoint
      if (res.status >= 500) continue;
      // Client error — don't retry on different endpoint
      throw new Error(`API error: ${res.status}`);
    } catch (err: any) {
      if (err.name === "AbortError") continue; // timeout, try next
      if (err.message?.includes("API error")) throw err;
      continue; // network error, try next
    }
  }
  throw new Error("All HAFAS endpoints failed");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint || !["locations", "journeys", "departures"].includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint. Use: locations, journeys, departures" }),
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
    
    // Try to serve stale cache as last resort
    try {
      const url = new URL(req.url);
      const endpoint = url.searchParams.get("endpoint") || "";
      const params: Record<string, string> = {};
      for (const [k, v] of url.searchParams.entries()) {
        if (k !== "endpoint") params[k] = v;
      }
      const cacheKey = generateCacheKey(endpoint, params);
      
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: stale } = await supabase
        .from("transport_cache")
        .select("response_data")
        .eq("cache_key", cacheKey)
        .single();
      
      if (stale) {
        return new Response(
          JSON.stringify(stale.response_data),
          { 
            headers: { 
              ...corsHeaders, 
              "Content-Type": "application/json",
              "X-Cache": "STALE",
            } 
          }
        );
      }
    } catch {
      // ignore stale cache errors
    }

    return new Response(
      JSON.stringify({ error: "Transport API temporarily unavailable. Please try again later." }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
