import type { CommuteRoute, RouteStatusData, Alert, RouteStatus, AlertType } from './types';

const MOCK_ROUTES: CommuteRoute[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Zur Arbeit',
    origin: 'Berlin Hbf',
    destination: 'Berlin Friedrichstraße',
    preferred_departure: '07:45',
    preferred_arrival: '08:05',
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    transport_type: 'sbahn',
    notification_type: 'both',
    is_favorite: true,
    is_paused: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'Nach Hause',
    origin: 'Berlin Friedrichstraße',
    destination: 'Berlin Hbf',
    preferred_departure: '17:30',
    preferred_arrival: '17:50',
    weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    transport_type: 'sbahn',
    notification_type: 'email',
    is_favorite: true,
    is_paused: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'demo',
    name: 'Wochenendbesuch',
    origin: 'Hannover Hbf',
    destination: 'Hildesheim Hbf',
    preferred_departure: '10:00',
    weekdays: ['sat'],
    transport_type: 'regional',
    notification_type: 'push',
    is_favorite: false,
    is_paused: true,
    created_at: new Date().toISOString(),
  },
];

const MOCK_MESSAGES: Record<RouteStatus, string[]> = {
  on_time: ['S-Bahn fährt planmäßig', 'RE2 pünktlich', 'Fahrt nach Plan'],
  minor_delay: ['RE2 ca. 8 Min. Verspätung', 'S3 verzögert sich um ca. 5 Min.', 'Kurzer Halt wegen Verspätung im Betriebsablauf'],
  major_delay: ['RE2 ca. 25 Min. Verspätung', 'ICE 579 verspätet sich voraussichtlich um 40 Min.', 'Erhebliche Verspätung wegen Signalstörung'],
  cancelled: ['Zug fällt aus zwischen Hannover Hbf und Hildesheim Hbf', 'S3 fällt heute aus', 'RE5 ersatzlos gestrichen'],
  disruption: ['S-Bahn-Störung wegen Signalstörung', 'Schienenersatzverkehr aktiv', 'Streckensperrung zwischen Potsdam und Berlin'],
  platform_change: ['Gleisänderung von Gleis 4 auf Gleis 7', 'Abfahrt heute von Gleis 12', 'Achtung: Gleisänderung!'],
  no_data: ['Keine Echtzeitdaten verfügbar', 'Daten werden geladen...'],
};

export function generateMockStatus(routeId: string): RouteStatusData {
  const statuses: RouteStatus[] = ['on_time', 'on_time', 'on_time', 'minor_delay', 'minor_delay', 'major_delay', 'cancelled', 'disruption', 'platform_change', 'no_data'];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const messages = MOCK_MESSAGES[status];
  const message = messages[Math.floor(Math.random() * messages.length)];

  return {
    id: `status-${routeId}-${Date.now()}`,
    route_id: routeId,
    status,
    delay_minutes: status === 'minor_delay' ? Math.floor(Math.random() * 10) + 3 : status === 'major_delay' ? Math.floor(Math.random() * 30) + 15 : undefined,
    message,
    platform_info: status === 'platform_change' ? `Gleis ${Math.floor(Math.random() * 14) + 1}` : undefined,
    checked_at: new Date().toISOString(),
  };
}

export function getMockRoutes(): CommuteRoute[] {
  return MOCK_ROUTES;
}

export function generateMockAlerts(routes: CommuteRoute[]): Alert[] {
  const alertTypes: AlertType[] = ['delay', 'cancellation', 'disruption', 'platform_change', 'alternative_route', 'daily_summary'];
  const alerts: Alert[] = [
    {
      id: 'a1',
      user_id: 'demo',
      route_id: '1',
      route_name: 'Zur Arbeit',
      type: 'delay',
      title: 'Verspätung auf deiner Strecke',
      message: 'S-Bahn S3 Richtung Friedrichstraße hat ca. 12 Min. Verspätung.',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'a2',
      user_id: 'demo',
      route_id: '3',
      route_name: 'Wochenendbesuch',
      type: 'cancellation',
      title: 'Zugausfall',
      message: 'RE2 zwischen Hannover Hbf und Hildesheim Hbf fällt heute aus. Nächste Alternative: 10:30 Uhr.',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'a3',
      user_id: 'demo',
      route_id: '1',
      route_name: 'Zur Arbeit',
      type: 'platform_change',
      title: 'Gleisänderung',
      message: 'Dein Zug fährt heute von Gleis 7 statt Gleis 4 ab.',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
    {
      id: 'a4',
      user_id: 'demo',
      route_id: '2',
      route_name: 'Nach Hause',
      type: 'daily_summary',
      title: 'Tägliche Zusammenfassung',
      message: 'Deine Abendverbindung um 17:30 fährt planmäßig. Keine Störungen gemeldet.',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
    {
      id: 'a5',
      user_id: 'demo',
      route_id: '1',
      route_name: 'Zur Arbeit',
      type: 'disruption',
      title: 'Streckenstörung',
      message: 'Schienenersatzverkehr zwischen Hauptbahnhof und Ostbahnhof wegen Bauarbeiten.',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
  ];
  return alerts;
}

export const GERMAN_STATIONS = [
  'Berlin Hbf', 'Berlin Friedrichstraße', 'Berlin Ostbahnhof', 'Berlin Südkreuz',
  'München Hbf', 'München Ost', 'München Pasing',
  'Hamburg Hbf', 'Hamburg-Altona', 'Hamburg Dammtor',
  'Frankfurt (Main) Hbf', 'Frankfurt (Main) Süd',
  'Köln Hbf', 'Köln Messe/Deutz',
  'Stuttgart Hbf', 'Hannover Hbf', 'Hildesheim Hbf',
  'Düsseldorf Hbf', 'Dortmund Hbf', 'Essen Hbf',
  'Leipzig Hbf', 'Dresden Hbf', 'Nürnberg Hbf',
  'Potsdam Hbf', 'Bonn Hbf', 'Mannheim Hbf',
  'Karlsruhe Hbf', 'Freiburg (Breisgau) Hbf', 'Augsburg Hbf',
];
