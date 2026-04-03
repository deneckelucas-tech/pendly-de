import type { CommuteRoute, RouteStatusData, Alert, RouteStatus, AlertType, Station } from './types';

const STATIONS: Record<string, Station> = {
  '8002830': { id: '8002830', name: 'Hildesheim Ost', type: 'station', products: { regional: true, bus: true } },
  '8000152': { id: '8000152', name: 'Hannover Hbf', type: 'station', products: { nationalExpress: true, national: true, regionalExpress: true, regional: true, suburban: true, bus: true, tram: true } },
  '8004158': { id: '8004158', name: 'Altwarmbüchen Opelstraße', type: 'station', products: { suburban: true } },
};

const MOCK_ROUTES: CommuteRoute[] = [
  {
    id: '1',
    user_id: 'demo',
    name: 'Zur Arbeit',
    origin: STATIONS['8002830'],
    destination: STATIONS['8004158'],
    transportTypes: ['regional', 'suburban'],
    notification_type: 'both',
    is_favorite: true,
    is_paused: false,
    connections: [
      {
        id: 'c1',
        routeId: '1',
        weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        notificationsEnabled: true,
        legs: [
          { originId: '8002830', originName: 'Hildesheim Ost', destinationId: '8000152', destinationName: 'Hannover Hbf', plannedDeparture: '07:39', plannedArrival: '08:10', lineName: 'RE10', productName: 'erixx' },
          { originId: '8000152', originName: 'Hannover Hbf', destinationId: '8004158', destinationName: 'Altwarmbüchen Opelstraße', plannedDeparture: '08:06', plannedArrival: '08:20', lineName: 'S4', productName: 'S-Bahn' },
        ],
      },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'demo',
    name: 'Nach Hause',
    origin: STATIONS['8004158'],
    destination: STATIONS['8002830'],
    transportTypes: ['suburban', 'regional'],
    notification_type: 'email',
    is_favorite: true,
    is_paused: false,
    connections: [
      {
        id: 'c2',
        routeId: '2',
        weekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
        notificationsEnabled: true,
        legs: [
          { originId: '8004158', originName: 'Altwarmbüchen Opelstraße', destinationId: '8000152', destinationName: 'Hannover Hbf', plannedDeparture: '17:00', plannedArrival: '17:14', lineName: 'S3', productName: 'S-Bahn' },
          { originId: '8000152', originName: 'Hannover Hbf', destinationId: '8002830', destinationName: 'Hildesheim Ost', plannedDeparture: '17:48', plannedArrival: '18:19', lineName: 'RE10', productName: 'erixx' },
        ],
      },
    ],
    created_at: new Date().toISOString(),
  },
];

const MOCK_MESSAGES: Record<RouteStatus, string[]> = {
  on_time: ['S3 fährt planmäßig', 'RE10 pünktlich', 'Fahrt nach Plan'],
  minor_delay: ['RE10 ca. 8 Min. Verspätung', 'S3 verzögert sich um ca. 5 Min.'],
  major_delay: ['RE10 ca. 25 Min. Verspätung', 'Erhebliche Verspätung wegen Signalstörung'],
  cancelled: ['Zug fällt aus zwischen Hannover Hbf und Hildesheim Ost', 'S3 fällt heute aus'],
  disruption: ['S-Bahn-Störung wegen Signalstörung', 'Schienenersatzverkehr aktiv'],
  platform_change: ['Gleisänderung von Gleis 4 auf Gleis 7', 'Abfahrt heute von Gleis 12'],
  no_data: ['Laut Fahrplan planmäßig – keine Echtzeitdaten verfügbar'],
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
  return [
    {
      id: 'a1', user_id: 'demo', route_id: '1', route_name: 'Zur Arbeit', type: 'delay',
      title: 'Verspätung auf deiner Strecke',
      message: 'erixx RE10 Richtung Hannover hat ca. 12 Min. Verspätung.',
      is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: 'a2', user_id: 'demo', route_id: '2', route_name: 'Nach Hause', type: 'platform_change',
      title: 'Gleisänderung',
      message: 'S3 nach Hannover Hbf fährt heute von Gleis 3 statt Gleis 1 ab.',
      is_read: false, created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'a3', user_id: 'demo', route_id: '1', route_name: 'Zur Arbeit', type: 'daily_summary',
      title: 'Tägliche Zusammenfassung',
      message: 'Deine Morgenverbindung um 07:39 fährt planmäßig. Keine Störungen gemeldet.',
      is_read: true, created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    },
  ];
}
