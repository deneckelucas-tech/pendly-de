/**
 * Preferences Service — lädt und speichert die Nutzereinstellungen aus public.user_preferences.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Weekday } from './types';

export interface UserPreferences {
  notifyDelays: boolean;
  notifyCancellations: boolean;
  notifyDisruptions: boolean;
  notifyPlatformChanges: boolean;
  notifyAlternatives: boolean;
  notifyDailySummary: boolean;
  quietHoursStart: string; // HH:mm
  quietHoursEnd: string;   // HH:mm
  defaultWeekdays: Weekday[];
  darkMode: boolean;
  timeFormat: '24h' | '12h';
  language: string;
  pushEnabled: boolean;
  preDepartureMinutes: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  notifyDelays: true,
  notifyCancellations: true,
  notifyDisruptions: true,
  notifyPlatformChanges: true,
  notifyAlternatives: false,
  notifyDailySummary: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '06:00',
  defaultWeekdays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  darkMode: false,
  timeFormat: '24h',
  language: 'de',
  pushEnabled: true,
  preDepartureMinutes: 60,
};

function rowToPrefs(row: any): UserPreferences {
  return {
    notifyDelays: row.notify_delays,
    notifyCancellations: row.notify_cancellations,
    notifyDisruptions: row.notify_disruptions,
    notifyPlatformChanges: row.notify_platform_changes,
    notifyAlternatives: row.notify_alternatives,
    notifyDailySummary: row.notify_daily_summary,
    quietHoursStart: row.quiet_hours_start,
    quietHoursEnd: row.quiet_hours_end,
    defaultWeekdays: (row.default_weekdays as Weekday[]) || [],
    darkMode: row.dark_mode,
    timeFormat: (row.time_format as '24h' | '12h') || '24h',
    language: row.language || 'de',
    pushEnabled: row.push_enabled ?? true,
    preDepartureMinutes: row.pre_departure_minutes ?? 60,
  };
}

function prefsToRow(prefs: Partial<UserPreferences>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (prefs.notifyDelays !== undefined) out.notify_delays = prefs.notifyDelays;
  if (prefs.notifyCancellations !== undefined) out.notify_cancellations = prefs.notifyCancellations;
  if (prefs.notifyDisruptions !== undefined) out.notify_disruptions = prefs.notifyDisruptions;
  if (prefs.notifyPlatformChanges !== undefined) out.notify_platform_changes = prefs.notifyPlatformChanges;
  if (prefs.notifyAlternatives !== undefined) out.notify_alternatives = prefs.notifyAlternatives;
  if (prefs.notifyDailySummary !== undefined) out.notify_daily_summary = prefs.notifyDailySummary;
  if (prefs.quietHoursStart !== undefined) out.quiet_hours_start = prefs.quietHoursStart;
  if (prefs.quietHoursEnd !== undefined) out.quiet_hours_end = prefs.quietHoursEnd;
  if (prefs.defaultWeekdays !== undefined) out.default_weekdays = prefs.defaultWeekdays;
  if (prefs.darkMode !== undefined) out.dark_mode = prefs.darkMode;
  if (prefs.timeFormat !== undefined) out.time_format = prefs.timeFormat;
  if (prefs.language !== undefined) out.language = prefs.language;
  if (prefs.pushEnabled !== undefined) out.push_enabled = prefs.pushEnabled;
  if (prefs.preDepartureMinutes !== undefined) out.pre_departure_minutes = prefs.preDepartureMinutes;
  return out;
}

/** Lädt die Einstellungen des aktuellen Nutzers; legt einen Default-Eintrag an, falls keiner existiert. */
export async function fetchPreferences(): Promise<UserPreferences | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Preferences laden fehlgeschlagen:', error);
    return DEFAULT_PREFERENCES;
  }

  if (!data) {
    // Defensiv: Default-Eintrag anlegen, falls Trigger nicht gegriffen hat.
    const { data: inserted, error: insertErr } = await supabase
      .from('user_preferences')
      .insert({ user_id: user.id })
      .select('*')
      .maybeSingle();
    if (insertErr || !inserted) return DEFAULT_PREFERENCES;
    return rowToPrefs(inserted);
  }

  return rowToPrefs(data);
}

/** Speichert geänderte Einstellungen (Upsert auf user_id). */
export async function updatePreferences(patch: Partial<UserPreferences>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Nicht eingeloggt');

  const row = prefsToRow(patch);
  const { error } = await supabase
    .from('user_preferences')
    .upsert({ user_id: user.id, ...row }, { onConflict: 'user_id' });

  if (error) throw error;
}
