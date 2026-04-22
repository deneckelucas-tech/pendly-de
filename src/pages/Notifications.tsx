import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';

export default function Notifications() {
  const navigate = useNavigate();

  return (
    <div className="px-5 pt-5 pb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 -ml-2 rounded-full hover:bg-secondary/50 transition-colors">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </button>
          <h1 className="font-display text-2xl text-foreground">MELDUNGEN</h1>
        </div>
      </div>

      <EmptyState
        icon="train"
        title="Keine Meldungen"
        description="Wenn es Änderungen an deinen Routen gibt, wirst du hier benachrichtigt."
      />

      <div className="mt-6 card-amber-border bg-card rounded-[16px] p-4 flex items-start gap-3">
        <Bell className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Push- und E-Mail-Benachrichtigungen werden automatisch gesendet, sobald sich der Status einer deiner Routen ändert.
        </p>
      </div>
    </div>
  );
}
