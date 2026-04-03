import { useState } from 'react';
import { Shield, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MONTHLY_PRICE = '4,99';
const YEARLY_PRICE = '39,99';
const YEARLY_MONTHLY = '3,33';

export default function Paywall() {
  const [loading, setLoading] = useState<string | null>(null);
  const { subscription } = useAuth();

  const handleCheckout = async (plan: 'monthly' | 'yearly') => {
    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  };

  const features = [
    'Unbegrenzte Routen',
    'Echtzeit Push-Benachrichtigungen',
    'Gleisänderungs-Alerts',
    'Automatische Alternativen',
    'Alle Linien – DB, S-Bahn, RE, Bus, Tram',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-card card-amber-border flex items-center justify-center mx-auto">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Deine Testphase ist abgelaufen</h1>
          <p className="text-sm text-muted-foreground">
            Wähle ein Abo, um Pendly weiter zu nutzen.
          </p>
        </div>

        {/* Monthly */}
        <div
          className="rounded-2xl p-5 space-y-4 card-amber-glow"
          style={{ backgroundColor: '#131313' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Monatlich</p>
              <p className="text-2xl font-bold text-foreground">{MONTHLY_PRICE} <span className="text-sm font-normal text-muted-foreground">€/Monat</span></p>
            </div>
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <ul className="space-y-2">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button
            className="w-full h-12 rounded-xl font-semibold"
            onClick={() => handleCheckout('monthly')}
            disabled={loading === 'monthly'}
          >
            {loading === 'monthly' ? 'Wird geladen...' : 'Monatlich abonnieren'}
          </Button>
        </div>

        {/* Yearly */}
        <div
          className="rounded-2xl p-5 space-y-4 card-amber-border relative"
          style={{ backgroundColor: '#131313' }}
        >
          <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
            –33% sparen
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Jährlich</p>
              <p className="text-2xl font-bold text-foreground">{YEARLY_PRICE} <span className="text-sm font-normal text-muted-foreground">€/Jahr</span></p>
              <p className="text-xs text-muted-foreground">{YEARLY_MONTHLY} € pro Monat</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl font-semibold card-amber-border"
            onClick={() => handleCheckout('yearly')}
            disabled={loading === 'yearly'}
          >
            {loading === 'yearly' ? 'Wird geladen...' : 'Jährlich abonnieren'}
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Jederzeit kündbar. Keine versteckten Kosten.
        </p>
      </div>
    </div>
  );
}
