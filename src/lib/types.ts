export type RouteStatus = 'on_time' | 'minor_delay' | 'major_delay' | 'cancelled' | 'disruption' | 'platform_change' | 'no_data';

export type TransportType = 'nationalExpress' | 'national' | 'regionalExpress' | 'regional' | 'suburban' | 'bus' | 'ferry' | 'subway' | 'tram';

export type NotificationType = 'email' | 'push' | 'both';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type AlertType = 'delay' | 'cancellation' | 'disruption' | 'platform_change' | 'alternative_route' | 'daily_summary';

/** A verified station from the transport.rest API */
export interface Station {
  id: string;
  name: string;
  type: string;
  products: Partial<Record<TransportType, boolean>>;
}

/** A single leg of a journey (e.g. erixx Hildesheim Ost → Hannover Hbf) */
export interface JourneyLeg {
  origin: Station;
  destination: Station;
  departure: string; // ISO datetime
  arrival: string;
  plannedDeparture?: string;
  plannedArrival?: string;
  departureDelay?: number | null; // seconds
  arrivalDelay?: number | null;
  departurePlatform?: string | null;
  plannedDeparturePlatform?: string | null;
  line?: {
    id?: string;
    name?: string;
    productName?: string;
    mode?: string;
    operator?: { name?: string };
  };
  direction?: string;
  cancelled?: boolean;
}

/** A full journey with one or more legs */
export interface Journey {
  id: string;
  legs: JourneyLeg[];
}

/** A saved connection that a user wants to be notified about */
export interface SavedConnection {
  id: string;
  routeId: string;
  weekdays: Weekday[];
  legs: SavedLeg[];
  notificationsEnabled: boolean;
}

/** A saved leg — stores the key info to match against live data */
export interface SavedLeg {
  originId: string;
  originName: string;
  destinationId: string;
  destinationName: string;
  plannedDeparture: string; // HH:mm
  plannedArrival: string;   // HH:mm
  lineName: string;
  productName: string;
}

/** A user's commute route (group of saved connections) */
export interface CommuteRoute {
  id: string;
  user_id: string;
  name: string;
  origin: Station;
  destination: Station;
  transportTypes: TransportType[];
  notification_type: NotificationType;
  is_favorite: boolean;
  is_paused: boolean;
  connections: SavedConnection[];
  created_at: string;
}

export interface RouteStatusData {
  id: string;
  route_id: string;
  status: RouteStatus;
  delay_minutes?: number;
  message?: string;
  platform_info?: string;
  checked_at: string;
}

export interface Alert {
  id: string;
  user_id: string;
  route_id: string;
  route_name: string;
  type: AlertType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  preferred_language: string;
  default_commute_days: Weekday[];
  time_format: '12h' | '24h';
  dark_mode: boolean;
}

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: 'Mo',
  tue: 'Di',
  wed: 'Mi',
  thu: 'Do',
  fri: 'Fr',
  sat: 'Sa',
  sun: 'So',
};

export const TRANSPORT_LABELS: Record<TransportType, string> = {
  nationalExpress: 'ICE/IC',
  national: 'Fernverkehr',
  regionalExpress: 'RE/IRE',
  regional: 'RB/erixx',
  suburban: 'S-Bahn',
  bus: 'Bus',
  ferry: 'Fähre',
  subway: 'U-Bahn',
  tram: 'Straßenbahn',
};

export const STATUS_CONFIG: Record<RouteStatus, { label: string; colorClass: string }> = {
  on_time: { label: 'Pünktlich', colorClass: 'bg-status-ontime text-status-ontime-foreground' },
  minor_delay: { label: 'Leichte Verspätung', colorClass: 'bg-status-minor-delay text-status-minor-delay-foreground' },
  major_delay: { label: 'Große Verspätung', colorClass: 'bg-status-major-delay text-status-major-delay-foreground' },
  cancelled: { label: 'Ausfall', colorClass: 'bg-status-cancelled text-status-cancelled-foreground' },
  disruption: { label: 'Störung', colorClass: 'bg-status-disruption text-status-disruption-foreground' },
  platform_change: { label: 'Gleisänderung', colorClass: 'bg-status-platform text-status-platform-foreground' },
  no_data: { label: 'Keine Daten', colorClass: 'bg-status-nodata text-status-nodata-foreground' },
};
