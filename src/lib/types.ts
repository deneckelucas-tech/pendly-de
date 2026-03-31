export type RouteStatus = 'on_time' | 'minor_delay' | 'major_delay' | 'cancelled' | 'disruption' | 'platform_change' | 'no_data';

export type TransportType = 'regional' | 'long_distance' | 'sbahn' | 'ubahn' | 'tram' | 'bus' | 'mixed';

export type NotificationType = 'email' | 'push' | 'both';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type AlertType = 'delay' | 'cancellation' | 'disruption' | 'platform_change' | 'alternative_route' | 'daily_summary';

export interface CommuteRoute {
  id: string;
  user_id: string;
  name: string;
  origin: string;
  destination: string;
  preferred_departure: string;
  preferred_arrival?: string;
  weekdays: Weekday[];
  transport_type: TransportType;
  notification_type: NotificationType;
  is_favorite: boolean;
  is_paused: boolean;
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
  regional: 'Regionalbahn',
  long_distance: 'Fernverkehr',
  sbahn: 'S-Bahn',
  ubahn: 'U-Bahn',
  tram: 'Straßenbahn',
  bus: 'Bus',
  mixed: 'Gemischt',
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
