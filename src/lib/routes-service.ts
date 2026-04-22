/**
 * Routes Service — CRUD-Operationen für gespeicherte Pendelrouten via Supabase.
 */

import { supabase } from '@/integrations/supabase/client';
import type { CommuteRoute, Journey, Station, Weekday, TransportType, SavedConnection, SavedLeg } from './types';

/** Konvertiert eine HH:mm:ss oder ISO-Zeit zu HH:mm */
function toHHMM(value?: string | null): string {
  if (!value) return '--:--';
  if (/^\d{2}:\d{2}/.test(value)) return value.substring(0, 5);
  const d = new Date(value);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export interface CreateRouteInput {
  name: string;
  origin: Station;
  destination: Station;
  transportTypes?: TransportType[];
  notificationType?: 'email' | 'push' | 'both';
  /** Hinweg-Verbindungen */
  outboundJourneys: Journey[];
  /** Rückweg-Verbindungen */
  returnJourneys?: Journey[];
  weekdays: Weekday[];
}

/** Speichert eine neue Route inkl. Verbindungen + Legs in Supabase */
export async function createRoute(input: CreateRouteInput): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');

  // 1) route anlegen
  const { data: route, error: routeErr } = await supabase
    .from('routes')
    .insert({
      user_id: user.id,
      name: input.name,
      origin_id: input.origin.id,
      origin_name: input.origin.name,
      destination_id: input.destination.id,
      destination_name: input.destination.name,
      transport_types: input.transportTypes || [],
      notification_type: input.notificationType || 'both',
      is_favorite: false,
      is_paused: false,
    })
    .select('id')
    .single();

  if (routeErr || !route) throw routeErr || new Error('Route konnte nicht erstellt werden');

  // 2) Verbindungen + Legs speichern
  const allJourneys = [
    ...input.outboundJourneys.map(j => ({ j, isReturn: false })),
    ...(input.returnJourneys || []).map(j => ({ j, isReturn: true })),
  ];

  for (let i = 0; i < allJourneys.length; i++) {
    const { j } = allJourneys[i];
    const { data: conn, error: connErr } = await supabase
      .from('saved_connections')
      .insert({
        route_id: route.id,
        user_id: user.id,
        weekdays: input.weekdays,
        notifications_enabled: true,
        sort_order: i,
      })
      .select('id')
      .single();

    if (connErr || !conn) throw connErr || new Error('Verbindung konnte nicht erstellt werden');

    const realLegs = j.legs.filter(l => l.line && l.line.productName !== 'walking');
    if (realLegs.length === 0) continue;

    const legsPayload = realLegs.map((leg, idx) => ({
      connection_id: conn.id,
      user_id: user.id,
      leg_index: idx,
      origin_id: leg.origin?.id || '',
      origin_name: leg.origin?.name || '',
      destination_id: leg.destination?.id || '',
      destination_name: leg.destination?.name || '',
      planned_departure: toHHMM(leg.plannedDeparture || leg.departure),
      planned_arrival: toHHMM(leg.plannedArrival || leg.arrival),
      line_name: leg.line?.name || '',
      product_name: leg.line?.productName || '',
    }));

    const { error: legErr } = await supabase.from('saved_legs').insert(legsPayload);
    if (legErr) throw legErr;
  }

  return route.id;
}

/** Lädt alle Routen des aktuellen Nutzers inkl. Verbindungen + Legs */
export async function fetchUserRoutes(): Promise<CommuteRoute[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: routes, error: routesErr } = await supabase
    .from('routes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (routesErr) {
    console.error('Routen laden fehlgeschlagen:', routesErr);
    return [];
  }
  if (!routes || routes.length === 0) return [];

  const routeIds = routes.map(r => r.id);

  const { data: connections } = await supabase
    .from('saved_connections')
    .select('*')
    .in('route_id', routeIds)
    .order('sort_order', { ascending: true });

  const connectionIds = (connections || []).map(c => c.id);
  const { data: legs } = connectionIds.length > 0
    ? await supabase
        .from('saved_legs')
        .select('*')
        .in('connection_id', connectionIds)
        .order('leg_index', { ascending: true })
    : { data: [] as any[] };

  return routes.map((r): CommuteRoute => {
    const routeConnections: SavedConnection[] = (connections || [])
      .filter(c => c.route_id === r.id)
      .map((c): SavedConnection => ({
        id: c.id,
        routeId: r.id,
        weekdays: (c.weekdays as Weekday[]) || [],
        notificationsEnabled: c.notifications_enabled,
        legs: (legs || [])
          .filter(l => l.connection_id === c.id)
          .map((l): SavedLeg => ({
            originId: l.origin_id,
            originName: l.origin_name,
            destinationId: l.destination_id,
            destinationName: l.destination_name,
            plannedDeparture: l.planned_departure,
            plannedArrival: l.planned_arrival,
            lineName: l.line_name,
            productName: l.product_name,
          })),
      }));

    return {
      id: r.id,
      user_id: r.user_id,
      name: r.name,
      origin: { id: r.origin_id, name: r.origin_name, type: 'station', products: {} },
      destination: { id: r.destination_id, name: r.destination_name, type: 'station', products: {} },
      transportTypes: (r.transport_types as TransportType[]) || [],
      notification_type: (r.notification_type as 'email' | 'push' | 'both') || 'both',
      is_favorite: r.is_favorite,
      is_paused: r.is_paused,
      connections: routeConnections,
      created_at: r.created_at,
    };
  });
}

/** Lädt eine einzelne Route */
export async function fetchRoute(routeId: string): Promise<CommuteRoute | null> {
  const all = await fetchUserRoutes();
  return all.find(r => r.id === routeId) || null;
}

export async function setRoutePaused(routeId: string, paused: boolean): Promise<void> {
  const { error } = await supabase
    .from('routes')
    .update({ is_paused: paused })
    .eq('id', routeId);
  if (error) throw error;
}

export async function deleteRoute(routeId: string): Promise<void> {
  const { error } = await supabase.from('routes').delete().eq('id', routeId);
  if (error) throw error;
}
