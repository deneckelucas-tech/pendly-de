/**
 * useNotifications — Aggregiert relevante Meldungen für den Nutzer:
 *  - HAFAS-Remarks (Störungen, Bauarbeiten) gefiltert nach gespeicherten Linien
 *  - Live-Status-Issues (Verspätungen ≥3 Min, Ausfälle, Schienenersatzverkehr) für die heutigen Verbindungen
 *
 * Gelesene IDs werden in localStorage persistiert.
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { fetchUserRoutes } from '@/lib/routes-service';
import { getRemarks, type Remark } from '@/lib/transport-api';
import { useLiveStatus } from '@/hooks/useLiveStatus';
import type { CommuteRoute, SavedLeg, Weekday, RouteStatus } from '@/lib/types';

export type NotificationKind = 'delay' | 'cancellation' | 'disruption' | 'replacement' | 'remark';
export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  severity: NotificationSeverity;
  title: string;
  message: string;
  routeName?: string;
  routeId?: string;
  lineName?: string;
  timestamp: Date;
}

const STORAGE_KEY = 'pendly:read-notifications';
const WEEKDAY_KEYS: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    /* ignore */
  }
}

function filterRelevantRemarks(remarks: Remark[], routes: CommuteRoute[]): Remark[] {
  const savedLineNames = new Set<string>();
  routes.forEach(r => {
    r.connections.forEach(c => {
      c.legs.forEach(l => savedLineNames.add(l.lineName.toLowerCase().trim()));
    });
  });

  return remarks.filter(remark => {
    if (remark.affectedLines && remark.affectedLines.length > 0) {
      return remark.affectedLines.some(line =>
        savedLineNames.has(line.name.toLowerCase().trim())
      );
    }
    const text = (remark.text + ' ' + remark.summary).toLowerCase();
    for (const lineName of savedLineNames) {
      if (text.includes(lineName)) return true;
    }
    return false;
  });
}

function severityFromStatus(status: RouteStatus): NotificationSeverity {
  if (status === 'cancelled' || status === 'major_delay') return 'critical';
  if (status === 'minor_delay' || status === 'disruption' || status === 'platform_change') return 'warning';
  return 'info';
}

export function useNotifications() {
  const [routes, setRoutes] = useState<CommuteRoute[]>([]);
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds());

  // Load routes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetchUserRoutes();
        if (!cancelled) setRoutes(r);
      } catch (err) {
        console.error('Routes load for notifications failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Load remarks once routes are known
  useEffect(() => {
    if (routes.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const all = await getRemarks({ results: 100 });
        if (!cancelled) setRemarks(filterRelevantRemarks(all, routes));
      } catch {
        if (!cancelled) setRemarks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [routes]);

  // Today's connections for live status
  const todayConnections = useMemo(() => {
    const now = new Date();
    const todayKey = WEEKDAY_KEYS[now.getDay()];
    const conns: Array<{ connectionId: string; routeId: string; routeName: string; legs: SavedLeg[] }> = [];
    routes.forEach(route => {
      if (route.is_paused) return;
      route.connections.forEach(conn => {
        if (!conn.weekdays.includes(todayKey)) return;
        if (conn.legs.length === 0) return;
        conns.push({
          connectionId: conn.id,
          routeId: route.id,
          routeName: route.name,
          legs: conn.legs,
        });
      });
    });
    return conns;
  }, [routes]);

  const { statuses } = useLiveStatus({
    connections: todayConnections,
    enabled: todayConnections.length > 0,
  });

  // Build notification list
  const notifications = useMemo<AppNotification[]>(() => {
    const list: AppNotification[] = [];

    // From live status: only problematic legs
    statuses.forEach(connStatus => {
      connStatus.legs.forEach((legStatus, idx) => {
        const s = legStatus.status;
        if (s === 'on_time' || s === 'no_data') return;

        let kind: NotificationKind = 'delay';
        let title = '';

        if (s === 'cancelled') {
          kind = 'cancellation';
          title = `${legStatus.leg.lineName} fällt aus`;
        } else if (legStatus.replacementInfo) {
          kind = 'replacement';
          title = 'Schienenersatzverkehr';
        } else if (s === 'major_delay') {
          kind = 'delay';
          title = `Große Verspätung · ${legStatus.delayMinutes} Min.`;
        } else if (s === 'minor_delay') {
          kind = 'delay';
          title = `Verspätung · ${legStatus.delayMinutes} Min.`;
        } else if (s === 'platform_change') {
          kind = 'disruption';
          title = 'Gleiswechsel';
        } else {
          kind = 'disruption';
          title = 'Störung';
        }

        list.push({
          id: `live:${connStatus.connectionId}:${idx}:${s}:${legStatus.delayMinutes}`,
          kind,
          severity: severityFromStatus(s),
          title,
          message: `${legStatus.leg.originName} → ${legStatus.leg.destinationName} · ${legStatus.message}`,
          routeName: connStatus.routeName,
          routeId: connStatus.routeId,
          lineName: legStatus.leg.lineName,
          timestamp: legStatus.lastChecked,
        });
      });
    });

    // From HAFAS remarks
    remarks.forEach(r => {
      const lineName = r.affectedLines?.[0]?.name;
      const sev: NotificationSeverity = r.type === 'warning' ? 'warning' : 'info';
      list.push({
        id: `remark:${r.id}`,
        kind: 'remark',
        severity: sev,
        title: r.summary || 'Hinweis zu deiner Linie',
        message: r.text || r.summary || '',
        lineName,
        timestamp: r.modified ? new Date(r.modified) : new Date(),
      });
    });

    // Sort: critical → warning → info, then newest first
    const sevRank: Record<NotificationSeverity, number> = { critical: 0, warning: 1, info: 2 };
    list.sort((a, b) => {
      const r = sevRank[a.severity] - sevRank[b.severity];
      if (r !== 0) return r;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return list;
  }, [statuses, remarks]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !readIds.has(n.id)).length,
    [notifications, readIds]
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(prev => {
      const next = new Set(prev);
      notifications.forEach(n => next.add(n.id));
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const isRead = useCallback((id: string) => readIds.has(id), [readIds]);

  return {
    notifications,
    unreadCount,
    loading,
    isRead,
    markAsRead,
    markAllAsRead,
  };
}
