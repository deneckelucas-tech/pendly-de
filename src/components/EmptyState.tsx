import { Train, MapPin, Route } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'train' | 'pin' | 'route';
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon = 'train', title, description, children }: EmptyStateProps) {
  const IconComponent = icon === 'train' ? Train : icon === 'pin' ? MapPin : Route;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-card card-amber-border flex items-center justify-center mb-4">
        <IconComponent className="h-8 w-8 text-primary" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-[260px] mb-4">{description}</p>
      {children}
    </div>
  );
}
