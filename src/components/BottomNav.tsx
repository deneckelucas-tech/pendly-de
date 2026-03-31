import { NavLink, useLocation } from 'react-router-dom';
import { Home, Route, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Start' },
  { to: '/routes', icon: Route, label: 'Routen' },
  { to: '/notifications', icon: Bell, label: 'Meldungen' },
  { to: '/settings', icon: User, label: 'Profil' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[60px]',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
