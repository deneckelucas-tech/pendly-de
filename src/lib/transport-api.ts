/**
 * Transport API — v6.db.transport.rest (HAFAS-based, free, no API key)
 * 
 * Provides real Deutsche Bahn data including:
 * - Station search (verified stations)
 * - Journey search with transfers
 * - Departure/arrival information
 * - Delays, cancellations, platform changes
 * 
 * Future: Replace with official DB API or DELFI/TRIAS if needed.
 */

import type { Station, Journey, JourneyLeg, TransportType } from './types';

const BASE_URL = 'https://v6.db.transport.rest';

async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 503 && i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      return res;
    } catch (err) {
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        continue;
      }
      throw err;
    }
  }
  throw new Error('Max retries reached');
}

export async function searchStations(query: string): Promise<Station[]> {
  if (!query || query.length < 2) return [];

  const params = new URLSearchParams({
    query,
    results: '8',
    fuzzy: 'true',
    stops: 'true',
    addresses: 'false',
    poi: 'false',
  });

  try {
    const res = await fetchWithRetry(`${BASE_URL}/locations?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    return data
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
    departure?: string; // ISO datetime
    results?: number;
    transfers?: number;
    products?: Partial<Record<TransportType, boolean>>;
  }
): Promise<Journey[]> {
  const params = new URLSearchParams({
    from: fromId,
    to: toId,
    results: String(options?.results || 6),
    stopovers: 'false',
    transferTime: '0',
    language: 'de',
  });

  if (options?.departure) {
    params.set('departure', options.departure);
  }

  // Set product filters
  if (options?.products) {
    const allProducts: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'ferry', 'subway', 'tram'];
    for (const p of allProducts) {
      if (options.products[p] !== undefined) {
        params.set(p, String(options.products[p]));
      }
    }
  }

  try {
    const res = await fetchWithRetry(`${BASE_URL}/journeys?${params}`);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();

    return (data.journeys || []).map((j: any, idx: number): Journey => ({
      id: j.id || `journey-${idx}`,
      legs: (j.legs || [])
        .filter((leg: any) => leg.walking !== true) // filter out walking legs
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
