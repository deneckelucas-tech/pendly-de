/**
 * Transport API placeholder
 * 
 * This module will be replaced with real German transport API integrations:
 * - Deutsche Bahn API (db-rest / HAFAS)
 * - Regional transport providers (VBB, MVV, HVV, RMV, etc.)
 * - DELFI / TRIAS interfaces
 * 
 * For now, it returns mock data for demo purposes.
 */

import { generateMockStatus } from './mock-data';
import type { RouteStatusData } from './types';

export async function fetchRouteStatus(routeId: string): Promise<RouteStatusData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  return generateMockStatus(routeId);
}

export async function searchStations(query: string): Promise<string[]> {
  const { GERMAN_STATIONS } = await import('./mock-data');
  const q = query.toLowerCase();
  return GERMAN_STATIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 8);
}
