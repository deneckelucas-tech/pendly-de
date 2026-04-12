import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Train } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/dashboard');
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (signUpData.session) {
          navigate('/onboarding');
        } else {
          toast({
            title: 'Konto erstellt!',
            description: 'Bitte überprüfe deine E-Mail zur Bestätigung.',
          });
        }
      }
    } catch (error: any) {
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm card-amber-border shadow-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-9 w-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
              <Train className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-xl">{isLogin ? 'Anmelden' : 'Konto erstellen'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Melde dich an, um deine Routen zu sehen.' : 'Erstelle ein Konto, um deine Pendelrouten zu speichern.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <input
                id="email"
                type="email"
                placeholder="max@beispiel.de"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full h-10 rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors bg-muted border border-border focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-10 rounded-xl px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors bg-muted border border-border focus:border-primary"
              />
            </div>
            <Button type="submit" className="w-full font-semibold h-12 rounded-xl" disabled={loading}>
              {loading ? '...' : isLogin ? 'Anmelden' : 'Registrieren'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
