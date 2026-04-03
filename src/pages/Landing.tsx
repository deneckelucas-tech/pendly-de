import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Radio, Train, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col px-5 pt-6 pb-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl card-amber-glow p-6 flex flex-col justify-between"
        style={{ minHeight: '42vh' }}
      >
        {/* Animated gradient background */}
        <div
          className="absolute inset-0 -z-0"
          style={{
            background: 'linear-gradient(135deg, #131313 0%, #0A0A0A 40%, #131313 70%, #0A0A0A 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradientShift 12s ease infinite',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between h-full">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em]" style={{ color: '#6B7280' }}>Nächste Abfahrt</p>

          <div className="flex-1 flex flex-col items-center justify-center py-6">
            <span className="text-[64px] leading-none font-extrabold text-foreground tracking-tight">
              07:12
            </span>
            <p className="text-sm font-medium text-foreground/80 mt-3">
              RE 5 · Hamburg Hbf → Hannover Hbf
            </p>
          </div>

          <div className="flex justify-end">
            <span
              className="text-xs font-semibold bg-status-ontime/15 text-status-ontime px-3 py-1.5 rounded-lg"
              style={{ boxShadow: '0 0 12px hsl(152 60% 42% / 0.25)' }}
            >
              Pünktlich
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-3 mb-8"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: '#6B7280' }}>Abfahrt in 8 Min.</span>
        </div>
        <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '72%' }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary rounded-full progress-glow"
          />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">
          Nie wieder die Bahn verpassen.
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
          Bahnfrei hält dich informiert – bevor es zu spät ist.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/auth')}
          className="w-full h-14 bg-primary text-primary-foreground font-bold text-base rounded-2xl hover:bg-primary/90 transition-colors"
        >
          Kostenlos starten
        </button>
        <p className="text-center text-xs mt-3" style={{ color: '#6B7280' }}>
          Keine Kreditkarte. Keine Werbung.
        </p>
      </motion.div>

      <div className="flex-1" />

      {/* Trust Strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center justify-center gap-1.5"
        style={{ color: '#6B7280' }}
      >
        <Radio className="h-3.5 w-3.5" />
        <span className="text-[11px]">Echtzeit-Daten</span>
        <span className="text-[11px]">·</span>
        <Train className="h-3.5 w-3.5" />
        <span className="text-[11px]">Alle Linien</span>
        <span className="text-[11px]">·</span>
        <Zap className="h-3.5 w-3.5" />
        <span className="text-[11px]">Sofort-Alerts</span>
      </motion.div>
    </div>
  );
}
