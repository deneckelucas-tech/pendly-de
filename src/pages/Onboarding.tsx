import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { WEEKDAY_LABELS, TRANSPORT_LABELS, type Weekday, type TransportType, type NotificationType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Train, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TRANSPORT_OPTIONS: TransportType[] = ['regional', 'long_distance', 'sbahn', 'ubahn', 'tram', 'bus', 'mixed'];
const NOTIFICATION_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'email', label: 'E-Mail' },
  { value: 'push', label: 'Push' },
  { value: 'both', label: 'Beides' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departure, setDeparture] = useState('07:30');
  const [arrival, setArrival] = useState('');
  const [weekdays, setWeekdays] = useState<Weekday[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [transport, setTransport] = useState<TransportType>('sbahn');
  const [notification, setNotification] = useState<NotificationType>('both');

  const toggleWeekday = (day: Weekday) => {
    setWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleFinish = () => {
    // TODO: Save route to Supabase
    navigate('/dashboard');
  };

  const steps = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="text-center py-8">
        <div className="h-16 w-16 gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Train className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Willkommen bei PendlerAlert!</h2>
        <p className="text-muted-foreground text-sm mb-6 max-w-[280px] mx-auto">
          Lass uns deine erste Pendelroute einrichten. Das dauert nur eine Minute.
        </p>
        <Button onClick={() => setStep(1)} className="font-semibold gap-2">
          Los geht's <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 1: Route name + stations
    <motion.div key="route" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Routenname</Label>
        <Input id="name" placeholder="z.B. Zur Arbeit" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="origin">Starthaltestelle</Label>
        <Input id="origin" placeholder="z.B. Berlin Hbf" value={origin} onChange={e => setOrigin(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dest">Zielhaltestelle</Label>
        <Input id="dest" placeholder="z.B. Friedrichstraße" value={destination} onChange={e => setDestination(e.target.value)} />
      </div>
    </motion.div>,

    // Step 2: Schedule
    <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="space-y-2">
        <Label>Abfahrtszeit</Label>
        <Input type="time" value={departure} onChange={e => setDeparture(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Ankunftszeit (optional)</Label>
        <Input type="time" value={arrival} onChange={e => setArrival(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Wochentage</Label>
        <div className="flex gap-1.5">
          {ALL_WEEKDAYS.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => toggleWeekday(day)}
              className={cn(
                'h-9 w-9 rounded-lg text-xs font-semibold transition-colors',
                weekdays.includes(day) ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {WEEKDAY_LABELS[day]}
            </button>
          ))}
        </div>
      </div>
    </motion.div>,

    // Step 3: Transport + Notifications
    <motion.div key="prefs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="space-y-2">
        <Label>Verkehrsmittel</Label>
        <div className="grid grid-cols-2 gap-2">
          {TRANSPORT_OPTIONS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTransport(t)}
              className={cn(
                'px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                transport === t ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {TRANSPORT_LABELS[t]}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Benachrichtigungen</Label>
        <div className="flex gap-2">
          {NOTIFICATION_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setNotification(opt.value)}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                notification === opt.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>,

    // Step 4: Done
    <motion.div key="done" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="text-center py-6">
        <div className="h-14 w-14 bg-status-ontime rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-status-ontime-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Route gespeichert!</h2>
        <p className="text-muted-foreground text-sm mb-2">
          <span className="font-semibold text-foreground">{name || 'Deine Route'}</span>
        </p>
        <p className="text-muted-foreground text-xs mb-6">
          {origin} → {destination} · {departure}
        </p>
        <Button onClick={handleFinish} className="font-semibold w-full">
          Zum Dashboard
        </Button>
      </div>
    </motion.div>,
  ];

  const stepTitles = ['', 'Route benennen', 'Zeitplan', 'Einstellungen', ''];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          {step > 0 && step < 4 && (
            <>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-secondary')} />
                ))}
              </div>
              <CardTitle className="text-lg">{stepTitles[step]}</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
          {step > 0 && step < 4 && (
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Zurück</Button>
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 font-semibold"
                disabled={step === 1 && (!name || !origin || !destination)}
              >
                {step === 3 ? 'Speichern' : 'Weiter'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
