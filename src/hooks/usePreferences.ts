/**
 * usePreferences — lädt Nutzereinstellungen, ermöglicht optimistisches Speichern
 * mit debouncedem Schreiben in die Datenbank. Wendet darkMode automatisch an.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPreferences,
  updatePreferences,
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from '@/lib/preferences-service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export function usePreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const pendingPatchRef = useRef<Partial<UserPreferences>>({});
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initial load
  useEffect(() => {
    if (!user) {
      setPrefs(DEFAULT_PREFERENCES);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchPreferences()
      .then(p => {
        if (cancelled) return;
        const next = p ?? DEFAULT_PREFERENCES;
        setPrefs(next);
        document.documentElement.classList.toggle('dark', next.darkMode);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user]);

  const flush = useCallback(async () => {
    const patch = pendingPatchRef.current;
    if (Object.keys(patch).length === 0) return;
    pendingPatchRef.current = {};
    setSaving(true);
    try {
      await updatePreferences(patch);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Speichern fehlgeschlagen';
      toast({ title: 'Einstellungen', description: message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }, []);

  const update = useCallback((patch: Partial<UserPreferences>) => {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      if (patch.darkMode !== undefined) {
        document.documentElement.classList.toggle('dark', patch.darkMode);
      }
      return next;
    });
    pendingPatchRef.current = { ...pendingPatchRef.current, ...patch };
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flush, 500);
  }, [flush]);

  // Flush on unmount / tab hide
  useEffect(() => {
    const onHide = () => { if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); flush(); } };
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('beforeunload', onHide);
      document.removeEventListener('visibilitychange', onHide);
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); flush(); }
    };
  }, [flush]);

  return { prefs, loading, saving, update };
}
