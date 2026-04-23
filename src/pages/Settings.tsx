import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WEEKDAY_LABELS, type Weekday } from '@/lib/types';
import { ArrowLeft, LogOut, Moon, Sun, Bell, Clock, Globe, Calendar, CreditCard, Crown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferences } from '@/hooks/usePreferences';

const ALL_WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const NOTIFICATION_FIELDS: Array<{ key: keyof Pick<ReturnType<typeof usePreferences>['prefs'],
  'notifyDelays' | 'notifyCancellations' | 'notifyDisruptions' | 'notifyPlatformChanges' | 'notifyAlternatives' | 'notifyDailySummary'>; label: string }> = [
  { key: 'notifyDelays', label: 'Verspätungen' },
  { key: 'notifyCancellations', label: 'Ausfälle' },
  { key: 'notifyDisruptions', label: 'Störungen' },
  { key: 'notifyPlatformChanges', label: 'Gleisänderungen' },
  { key: 'notifyAlternatives', label: 'Alternative Routen' },
  { key: 'notifyDailySummary', label: 'Tägliche Zusammenfassung' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, subscription, signOut } = useAuth();
  const { prefs, loading, saving, update } = usePreferences();
  const [portalLoading, setPortalLoading] = useState(false);

  const toggleDay = (day: Weekday) => {
    const next = prefs.defaultWeekdays.includes(day)
      ? prefs.defaultWeekdays.filter(d => d !== day)
      : [...prefs.defaultWeekdays, day];
    update({ defaultWeekdays: next });
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Portal error:', err);
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl text-foreground">Einstellungen</h1>
        </div>
        {saving && (
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Speichern…
          </span>
        )}
      </div>

      {/* Account */}
      <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Konto</p>
        <div>
          <Label className="text-xs text-muted-foreground">E-Mail</Label>
          <p className="text-sm text-foreground">{user?.email ?? '--'}</p>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-card rounded-[20px] card-amber-border p-5 mb-4 shadow-sm">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-primary" /> Abo
        </p>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-foreground">
              {subscription.status === 'active' ? 'Pendly Pro' : subscription.status === 'trialing' ? 'Testphase' : 'Kein Abo'}
            </p>
            {subscription.status === 'trialing' && (
              <p className="text-xs text-muted-foreground">Noch {subscription.trialDaysRemaining} Tage kostenlos</p>
            )}
          </div>
          <span className={cn(
            'text-[10px] font-semibold px-2.5 py-1 rounded-full',
            subscription.status === 'active' ? 'bg-status-ontime/15 text-status-ontime' :
            subscription.status === 'trialing' ? 'bg-primary/15 text-primary' :
            'bg-destructive/15 text-destructive'
          )}>
            {subscription.status === 'active' ? 'Aktiv' : subscription.status === 'trialing' ? 'Trial' : 'Abgelaufen'}
          </span>
        </div>
        {subscription.status === 'active' && (
          <button
            onClick={handleManageSubscription}
            disabled={portalLoading}
            className="w-full h-12 rounded-full bg-secondary text-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            {portalLoading ? 'Wird geladen...' : 'Abo verwalten'}
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className={cn('bg-card rounded-[20px] card-amber-border p-5 mb-4 shadow-sm transition-opacity', loading && 'opacity-60 pointer-events-none')}>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3 flex items-center gap-2">
          <Bell className="h-4 w-4" /> Benachrichtigungen
        </p>
        <div className="space-y-3">
          {NOTIFICATION_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-sm">{label}</Label>
              <Switch
                checked={prefs[key]}
                onCheckedChange={v => update({ [key]: v } as Partial<typeof prefs>)}
              />
            </div>
          ))}
          <div className="h-px bg-border" />
          <div>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Clock className="h-3 w-3" /> Ruhezeiten
            </Label>
            <div className="flex gap-2 items-center">
              <input
                type="time"
                value={prefs.quietHoursStart}
                onChange={e => update({ quietHoursStart: e.target.value })}
                className="w-24 h-11 rounded-2xl px-3 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary"
              />
              <span className="text-muted-foreground text-sm">bis</span>
              <input
                type="time"
                value={prefs.quietHoursEnd}
                onChange={e => update({ quietHoursEnd: e.target.value })}
                className="w-24 h-11 rounded-2xl px-3 text-sm text-foreground outline-none border border-border bg-muted focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className={cn('bg-card rounded-[20px] card-amber-border p-5 mb-4 shadow-sm transition-opacity', loading && 'opacity-60 pointer-events-none')}>
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-3">Allgemein</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2">
              {prefs.darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Dark Mode
            </Label>
            <Switch checked={prefs.darkMode} onCheckedChange={v => update({ darkMode: v })} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Zeitformat</Label>
            <div className="flex gap-1">
              {(['24h', '12h'] as const).map(f => (
                <button key={f} onClick={() => update({ timeFormat: f })} className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                  prefs.timeFormat === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>{f}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" /> Sprache</Label>
            <span className="text-sm text-muted-foreground">Deutsch</span>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Standard-Pendeltage
            </Label>
            <div className="flex gap-1.5">
              {ALL_WEEKDAYS.map(day => (
                <button key={day} onClick={() => toggleDay(day)} className={cn(
                  'h-9 w-9 rounded-full text-[10px] font-semibold transition-colors',
                  prefs.defaultWeekdays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                )}>{WEEKDAY_LABELS[day]}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full h-14 rounded-full border border-destructive/30 text-destructive font-semibold text-sm flex items-center justify-center gap-2 hover:bg-destructive/5 transition-colors"
      >
        <LogOut className="h-4 w-4" /> Abmelden
      </button>
    </div>
  );
}
