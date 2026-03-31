import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StationSearch } from '@/components/StationSearch';
import { JourneyCard } from '@/components/JourneyCard';
import { useNavigate } from 'react-router-dom';
import { searchJourneys } from '@/lib/transport-api';
import {
  WEEKDAY_LABELS, TRANSPORT_LABELS,
  type Weekday, type TransportType, type NotificationType, type Station, type Journey,
} from '@/lib/types';
import { cn } from '@/lib/utils';
import { Train, ArrowRight, Check, Loader2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const ALL_TRANSPORT: TransportType[] = ['nationalExpress', 'national', 'regionalExpress', 'regional', 'suburban', 'bus', 'subway', 'tram'];
const NOTIFICATION_OPTIONS: { value: NotificationType; label: string }[] = [
  { value: 'email', label: 'E-Mail' },
  { value: 'push', label: 'Push' },
  { value: 'both', label: 'Beides' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  // Step 1
  const [name, setName] = useState('');
  // Step 2
  const [origin, setOrigin] = useState<Station | null>(null);
  const [destination, setDestination] = useState<Station | null>(null);
  // Step 3
  const [transportTypes, setTransportTypes] = useState<TransportType[]>(['regional', 'suburban']);
  // Step 4
  const [weekdays, setWeekdays] = useState<Weekday[]>(['mon', 'tue', 'wed', 'thu', 'fri']);
  const [notification, setNotification] = useState<NotificationType>('both');
  // Step 5 — connection search
  const [departureTime, setDepartureTime] = useState('07:30');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourneys, setSelectedJourneys] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);

  const toggleTransport = (t: TransportType) => {
    setTransportTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const toggleWeekday = (day: Weekday) => {
    setWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleJourney = (id: string) => {
    setSelectedJourneys(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSearchConnections = async () => {
    if (!origin || !destination) return;
    setSearching(true);
    setJourneys([]);
    setSelectedJourneys(new Set());

    // Build departure datetime for today
    const now = new Date();
    const [h, m] = departureTime.split(':').map(Number);
    const dep = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);

    // Build product filter from selected transport types
    const products: Partial<Record<TransportType, boolean>> = {};
    for (const t of ALL_TRANSPORT) {
      products[t] = transportTypes.includes(t);
    }

    const results = await searchJourneys(origin.id, destination.id, {
      departure: dep.toISOString(),
      results: 8,
      products,
    });

    setJourneys(results);
    setSearching(false);
  };

  const handleFinish = () => {
    // TODO: Save to Supabase
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
          Lass uns deine Pendelroute einrichten. Du kannst echte Verbindungen suchen und genau die auswählen, mit denen du fährst.
        </p>
        <Button onClick={() => setStep(1)} className="font-semibold gap-2">
          Los geht's <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 1: Name + Stations
    <motion.div key="stations" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div className="space-y-2">
        <Label>Routenname</Label>
        <Input placeholder="z.B. Zur Arbeit" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <StationSearch
        label="Startbahnhof"
        placeholder="z.B. Hildesheim Ost"
        value={origin}
        onChange={setOrigin}
      />
      <StationSearch
        label="Zielbahnhof"
        placeholder="z.B. Hannover Hbf"
        value={destination}
        onChange={setDestination}
      />
    </motion.div>,

    // Step 2: Transport types (multi-select)
    <motion.div key="transport" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div>
        <Label className="mb-1 block">Verkehrsmittel (mehrere möglich)</Label>
        <p className="text-xs text-muted-foreground mb-3">Wähle alle Verkehrsmittel, die du nutzt.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {ALL_TRANSPORT.map(t => (
          <button
            key={t}
            type="button"
            onClick={() => toggleTransport(t)}
            className={cn(
              'px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left flex items-center gap-2',
              transportTypes.includes(t)
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary text-secondary-foreground hover:bg-accent'
            )}
          >
            {transportTypes.includes(t) && <Check className="h-3.5 w-3.5 shrink-0" />}
            {TRANSPORT_LABELS[t]}
          </button>
        ))}
      </div>
    </motion.div>,

    // Step 3: Weekdays + Notifications
    <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
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

    // Step 4: Search & select connections
    <motion.div key="connections" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
      <div>
        <Label className="mb-1 block">Verbindungen suchen</Label>
        <p className="text-xs text-muted-foreground mb-3">
          Suche nach Verbindungen ab deinem Startbahnhof und wähle die aus, mit denen du normalerweise fährst.
        </p>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <Label className="text-xs text-muted-foreground mb-1 block">Ab wann?</Label>
          <Input type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)} />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearchConnections} disabled={searching || !origin || !destination} className="gap-1.5 font-semibold">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Suchen
          </Button>
        </div>
      </div>

      {origin && destination && (
        <p className="text-xs text-muted-foreground">
          {origin.name} → {destination.name}
        </p>
      )}

      {journeys.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium">{journeys.length} Verbindungen gefunden — wähle deine aus:</p>
          {journeys.map(journey => (
            <JourneyCard
              key={journey.id}
              journey={journey}
              selected={selectedJourneys.has(journey.id)}
              onToggle={() => toggleJourney(journey.id)}
            />
          ))}
        </div>
      )}

      {!searching && journeys.length === 0 && departureTime && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Klicke auf "Suchen" um Verbindungen zu laden.
        </p>
      )}
    </motion.div>,

    // Step 5: Done
    <motion.div key="done" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="text-center py-6">
        <div className="h-14 w-14 bg-status-ontime rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-7 w-7 text-status-ontime-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Route gespeichert!</h2>
        <p className="text-muted-foreground text-sm mb-1">
          <span className="font-semibold text-foreground">{name || 'Deine Route'}</span>
        </p>
        <p className="text-muted-foreground text-xs mb-1">
          {origin?.name} → {destination?.name}
        </p>
        <p className="text-muted-foreground text-xs mb-6">
          {selectedJourneys.size} Verbindung{selectedJourneys.size !== 1 ? 'en' : ''} ausgewählt
        </p>
        <Button onClick={handleFinish} className="font-semibold w-full">
          Zum Dashboard
        </Button>
      </div>
    </motion.div>,
  ];

  const stepTitles = ['', 'Stationen wählen', 'Verkehrsmittel', 'Zeitplan', 'Verbindungen', ''];
  const maxStep = steps.length - 1;

  const canProceed = () => {
    if (step === 1) return !!name && !!origin && !!destination;
    if (step === 2) return transportTypes.length > 0;
    if (step === 3) return weekdays.length > 0;
    if (step === 4) return selectedJourneys.size > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background py-8">
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-2">
          {step > 0 && step < maxStep && (
            <>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4].map(s => (
                  <div key={s} className={cn('h-1 flex-1 rounded-full transition-colors', s <= step ? 'bg-primary' : 'bg-secondary')} />
                ))}
              </div>
              <CardTitle className="text-lg">{stepTitles[step]}</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">{steps[step]}</AnimatePresence>
          {step > 0 && step < maxStep && (
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Zurück</Button>
              <Button
                onClick={() => setStep(step + 1)}
                className="flex-1 font-semibold"
                disabled={!canProceed()}
              >
                {step === maxStep - 1 ? 'Speichern' : 'Weiter'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
