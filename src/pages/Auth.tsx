import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Train, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') === 'login');
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: 'Code gesendet', description: 'Prüfe deine SMS.' });
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth('apple', {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (!result.redirected) navigate('/dashboard');
    } catch (error: any) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
      setLoading(false);
    }
  };

  const inputClass =
    'w-full h-12 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors bg-muted border border-border focus:border-primary';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 bg-background">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center shadow-md mb-3">
            <Train className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Bahnfrei</h1>
        </div>

        <Card className="card-amber-border shadow-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">
              {isLogin ? 'Willkommen zurück' : 'Konto erstellen'}
            </CardTitle>
            <CardDescription className="text-xs">
              {isLogin
                ? 'Melde dich an, um deine Routen zu sehen.'
                : 'Erstelle ein Konto und starte sofort.'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* Social Login Buttons */}
            <div className="space-y-2.5">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-medium gap-3 border-border"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Mit Google fortfahren
              </Button>

              <Button
                variant="outline"
                className="w-full h-12 rounded-xl font-medium gap-3 border-border"
                onClick={handleAppleSignIn}
                disabled={loading}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Mit Apple fortfahren
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">oder</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Method Tabs */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setMethod('email'); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                  method === 'email'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground border border-transparent'
                }`}
              >
                <Mail className="h-4 w-4" />
                E-Mail
              </button>
              <button
                type="button"
                onClick={() => { setMethod('phone'); setOtpSent(false); }}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors ${
                  method === 'phone'
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'bg-muted text-muted-foreground border border-transparent'
                }`}
              >
                <Phone className="h-4 w-4" />
                Telefon
              </button>
            </div>

            {/* Email Form */}
            {method === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">E-Mail</Label>
                  <input
                    id="email"
                    type="email"
                    placeholder="max@beispiel.de"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Passwort</Label>
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className={inputClass}
                  />
                </div>
                <Button type="submit" className="w-full font-semibold h-12 rounded-xl" disabled={loading}>
                  {loading ? '...' : isLogin ? 'Anmelden' : 'Registrieren'}
                </Button>
              </form>
            )}

            {/* Phone Form */}
            {method === 'phone' && !otpSent && (
              <form onSubmit={handlePhoneSendOtp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Telefonnummer</Label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="+49 170 1234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <Button type="submit" className="w-full font-semibold h-12 rounded-xl" disabled={loading}>
                  {loading ? '...' : 'Code senden'}
                </Button>
              </form>
            )}

            {method === 'phone' && otpSent && (
              <form onSubmit={handlePhoneVerifyOtp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-xs">SMS-Code</Label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                    className={inputClass}
                  />
                </div>
                <Button type="submit" className="w-full font-semibold h-12 rounded-xl" disabled={loading}>
                  {loading ? '...' : 'Bestätigen'}
                </Button>
              </form>
            )}

            {/* Toggle Login/Register */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs text-primary hover:underline"
              >
                {isLogin ? 'Noch kein Konto? Registrieren' : 'Schon ein Konto? Anmelden'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
