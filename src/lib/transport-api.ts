/**
 * Transport API — Routed through Pendly Backend Proxy
 * 
 * All requests go through our edge function which provides:
 * - Automatic failover between multiple HAFAS endpoints
 * - Response caching (24h for stations, 5min for journeys, 2min for departures)
 * - Stale cache serving when all upstream APIs are down
 */

import type { Station, Journey, JourneyLeg, TransportType } from './types';

const PROXY_BASE = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/transport-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function proxyFetch(endpoint: string, params: Record<string, string>): Promise<any> {
  const searchParams = new URLSearchParams({ endpoint, ...params });
  const res = await fetch(`${PROXY_BASE}?${searchParams}`, {
    headers: {
      'apikey': ANON_KEY,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Proxy error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function searchStations(query: string): Promise<Station[]> {
  if (!query || query.length < 2) return [];

  try {
    const data = await proxyFetch('locations', {
      query,
      results: '8',
      fuzzy: 'true',
      stops: 'true',
      addresses: 'false',
      poi: 'false',
    });

    return (Array.isArray(data) ? data : [])
      .filter((loc: any) => loc.type === 'station' || loc.type === 'stop')
      .map((loc: any): Station => ({
        id: loc.id,
        name: loc.name,
        type: loc.type,
        products: loc.products || {},
      }));
  } catch (err) {
    console.error('Station search failed:', err);
    return [];
  }
}

export async function searchJourneys(
  fromId: string,
  toId: string,
  options?: {
    departure?: string;
    arrival?: string;
    results?: number;
    transfers?: number;
    products?: Partial<Record<TransportType, boolean>>;
  }
): Promise<Journey[]> {
  const params: Record<string, string> = {
    from: fromId,
    to: toId,
    results: String(options?.results || 6),
    stopovers: 'false',
    transferTime: '0',
    language: 'de',
  };

  if (options?.departure) params.departure = options.departure;
  if (options?.arrival) params.arrival = options.arrival;

  if (options?.products) {
    const allProducts: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'ferry', 'subway', 'tram'];
    for (const p of allProducts) {
      if (options.products[p] !== undefined) {
        params[p] = String(options.products[p]);
      }
    }
  }

  try {
    const data = await proxyFetch('journeys', params);

    return (data.journeys || []).map((j: any, idx: number): Journey => ({
      id: j.id || `journey-${idx}`,
      legs: (j.legs || [])
        .filter((leg: any) => leg.walking !== true)
        .map((leg: any): JourneyLeg => ({
          origin: {
            id: leg.origin?.id || '',
            name: leg.origin?.name || '',
            type: leg.origin?.type || 'station',
            products: leg.origin?.products || {},
          },
          destination: {
            id: leg.destination?.id || '',
            name: leg.destination?.name || '',
            type: leg.destination?.type || 'station',
            products: leg.destination?.products || {},
          },
          departure: leg.departure || '',
          arrival: leg.arrival || '',
          plannedDeparture: leg.plannedDeparture || leg.departure,
          plannedArrival: leg.plannedArrival || leg.arrival,
          departureDelay: leg.departureDelay,
          arrivalDelay: leg.arrivalDelay,
          departurePlatform: leg.departurePlatform,
          plannedDeparturePlatform: leg.plannedDeparturePlatform,
          line: leg.line ? {
            id: leg.line.id,
            name: leg.line.name,
            productName: leg.line.productName,
            mode: leg.line.mode,
            operator: leg.line.operator,
          } : undefined,
          direction: leg.direction,
          cancelled: leg.cancelled || false,
        })),
    }));
  } catch (err) {
    console.error('Journey search failed:', err);
    return [];
  }
}

/** Format time from ISO string to HH:mm */
export function formatTime(iso: string): string {
  if (!iso) return '--:--';
  const d = new Date(iso);
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

/** Format delay in seconds to "+X Min." */
export function formatDelay(seconds: number | null | undefined): string | null {
  if (!seconds || seconds < 60) return null;
  const minutes = Math.round(seconds / 60);
  return `+${minutes} Min.`;
}

export interface Departure {
  tripId: string;
  direction: string;
  line: { id: string; name: string; productName: string; mode: string };
  when: string;
  plannedWhen: string;
  delay: number | null;
  platform: string | null;
  destination?: { id: string; name: string };
}

/** Fetch departures from a station */
export async function getDepartures(
  stationId: string,
  options?: { when?: string; duration?: number; results?: number }
): Promise<Departure[]> {
  const params: Record<string, string> = {
    stationId,
    duration: String(options?.duration || 120),
    results: String(options?.results || 20),
    language: 'de',
  };
  if (options?.when) params.when = options.when;

  try {
    const data = await proxyFetch('departures', params);
    return (data.departures || []).map((d: any): Departure => ({
      tripId: d.tripId || '',
      direction: d.direction || '',
      line: {
        id: d.line?.id || '',
        name: d.line?.name || '',
        productName: d.line?.productName || '',
        mode: d.line?.mode || '',
      },
      when: d.when || d.plannedWhen || '',
      plannedWhen: d.plannedWhen || '',
      delay: d.delay,
      platform: d.platform,
      destination: d.destination ? { id: d.destination.id, name: d.destination.name } : undefined,
    }));
  } catch (err) {
    console.error('Departures fetch failed:', err);
    return [];
  }
}

export interface Remark {
  id: string;
  type: string; // 'warning' | 'status' | 'hint'
  summary: string;
  text: string;
  validFrom?: string;
  validUntil?: string;
  modified?: string;
  company?: string;
  categories?: string[];
  affectedLines?: Array<{ id: string; name: string; productName: string }>;
}

/** Fetch remarks/disruptions for a geographic area or line */
export async function getRemarks(options?: {
  from?: string;
  to?: string;
  results?: number;
}): Promise<Remark[]> {
  const params: Record<string, string> = {
    language: 'de',
    results: String(options?.results || 100),
  };
  if (options?.from) params.from = options.from;
  if (options?.to) params.to = options.to;

  try {
    const data = await proxyFetch('remarks', params);
    return (data.remarks || []).map((r: any): Remark => ({
      id: r.id || `remark-${Math.random()}`,
      type: r.type || 'warning',
      summary: r.summary || '',
      text: r.text || r.summary || '',
      validFrom: r.validFrom,
      validUntil: r.validUntil,
      modified: r.modified,
      company: r.company,
      categories: r.categories,
      affectedLines: (r.affectedLines || []).map((l: any) => ({
        id: l.id || '',
        name: l.name || '',
        productName: l.productName || '',
      })),
    }));
  } catch (err) {
    console.error('Remarks fetch failed:', err);
    return [];
  }
}
