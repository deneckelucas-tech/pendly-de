import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { WEEKDAY_LABELS, type Weekday } from '@/lib/types';
import { ArrowLeft, LogOut, Moon, Sun, Bell, Clock, Globe, Calendar, CreditCard, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ALL_WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const inputStyle = { backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A' };

export default function Settings() {
  const navigate = useNavigate();
  const { user, subscription, signOut } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>('24h');
  const [language, setLanguage] = useState('de');
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('06:00');
  const [defaultDays, setDefaultDays] = useState<Weekday[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [notifications, setNotifications] = useState({
    delays: true, cancellations: true, disruptions: true, platformChanges: true, alternatives: false, dailySummary: true,
  });

  const toggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    document.documentElement.classList.toggle('dark', enabled);
  };

  const toggleDay = (day: Weekday) => {
    setDefaultDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="px-4 pt-4 pb-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-bold text-lg">Einstellungen</h1>
      </div>

      <Card className="mb-4 card-amber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Konto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">E-Mail</Label>
            <p className="text-sm">demo@pendleralert.de</p>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 card-amber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Benachrichtigungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries({
            delays: 'Verspätungen', cancellations: 'Ausfälle', disruptions: 'Störungen',
            platformChanges: 'Gleisänderungen', alternatives: 'Alternative Routen', dailySummary: 'Tägliche Zusammenfassung',
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between">
              <Label className="text-sm">{label}</Label>
              <Switch
                checked={notifications[key as keyof typeof notifications]}
                onCheckedChange={v => setNotifications(prev => ({ ...prev, [key]: v }))}
              />
            </div>
          ))}
          <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: '12px' }}>
            <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
              <Clock className="h-3 w-3" /> Ruhezeiten
            </Label>
            <div className="flex gap-2 items-center">
              <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-24 h-9 rounded-xl px-2 text-sm text-foreground outline-none focus:border-primary" style={inputStyle} />
              <span className="text-muted-foreground text-sm">bis</span>
              <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-24 h-9 rounded-xl px-2 text-sm text-foreground outline-none focus:border-primary" style={inputStyle} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4 card-amber-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2">
              {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              Dark Mode
            </Label>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Zeitformat</Label>
            <div className="flex gap-1">
              {(['24h', '12h'] as const).map(f => (
                <button key={f} onClick={() => setTimeFormat(f)} className={cn(
                  'px-3 py-1 rounded-xl text-xs font-medium transition-colors',
                  timeFormat === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
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
                  'h-8 w-8 rounded-xl text-[10px] font-semibold transition-colors',
                  defaultDays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                )}>{WEEKDAY_LABELS[day]}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full gap-2 text-destructive card-amber-border hover:bg-destructive/5 rounded-xl" onClick={handleLogout}>
        <LogOut className="h-4 w-4" /> Abmelden
      </Button>
    </div>
  );
}
