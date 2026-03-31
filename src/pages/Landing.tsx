import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Train, Bell, Shield, Zap, Clock, MapPin } from 'lucide-react';

const features = [
  { icon: Bell, title: 'Sofortige Benachrichtigungen', desc: 'Verspätungen, Ausfälle und Störungen in Echtzeit.' },
  { icon: Clock, title: 'Dein Zeitplan', desc: 'Speichere deine täglichen Pendlerrouten und Abfahrtszeiten.' },
  { icon: MapPin, title: 'Gleisänderungen', desc: 'Erfahre sofort, wenn sich dein Gleis ändert.' },
  { icon: Zap, title: 'Schnell & einfach', desc: 'Alle wichtigen Infos auf einen Blick – ohne Umwege.' },
  { icon: Shield, title: 'Zuverlässig', desc: 'Vorbereitet für Deutsche Bahn und regionale Verkehrsverbünde.' },
  { icon: Train, title: 'Alle Verkehrsmittel', desc: 'S-Bahn, U-Bahn, RE, RB, ICE, Bus und Tram.' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="gradient-hero px-6 pt-14 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
              <Train className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-primary-foreground font-bold text-xl">PendlerAlert</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-4 leading-tight max-w-md mx-auto">
            Dein Pendelalarm für Deutschland
          </h1>
          <p className="text-primary-foreground/85 text-sm sm:text-base max-w-sm mx-auto mb-8 leading-relaxed">
            Speichere deine tägliche Pendelstrecke und werde bei Verspätungen, Ausfällen oder Störungen sofort benachrichtigt.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
            >
              Kostenlos starten
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/auth?mode=login')}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Anmelden
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Preview Cards */}
      <section className="px-6 -mt-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card rounded-2xl shadow-lg border p-4 max-w-sm mx-auto"
        >
          <div className="text-xs text-muted-foreground mb-2 font-medium">Beispiel-Route</div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold text-sm">Berlin Hbf → Friedrichstraße</div>
              <div className="text-xs text-muted-foreground">S-Bahn · 07:45</div>
            </div>
            <span className="text-xs font-semibold bg-status-ontime text-status-ontime-foreground px-2 py-0.5 rounded-full">
              Pünktlich
            </span>
          </div>
          <div className="border-t pt-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Hannover → Hildesheim</div>
              <div className="text-xs text-muted-foreground">RE · 10:00</div>
            </div>
            <span className="text-xs font-semibold bg-status-minor-delay text-status-minor-delay-foreground px-2 py-0.5 rounded-full">
              +8 Min.
            </span>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 py-12">
        <h2 className="text-lg font-bold text-center mb-8">Alles für deinen Pendelalltag</h2>
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="bg-card border rounded-xl p-4"
            >
              <div className="h-9 w-9 rounded-lg gradient-hero-subtle flex items-center justify-center mb-3">
                <Icon className="h-4.5 w-4.5 text-primary" />
              </div>
              <h3 className="font-semibold text-xs mb-1">{title}</h3>
              <p className="text-muted-foreground text-[11px] leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16 text-center">
        <div className="gradient-hero-subtle rounded-2xl p-8 max-w-sm mx-auto">
          <h2 className="font-bold text-lg mb-2">Jetzt starten</h2>
          <p className="text-muted-foreground text-sm mb-6">Kostenlos registrieren und deine erste Route einrichten.</p>
          <Button size="lg" onClick={() => navigate('/auth')} className="font-semibold w-full">
            Route einrichten
          </Button>
        </div>
      </section>
    </div>
  );
}
