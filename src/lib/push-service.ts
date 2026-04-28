/**
 * Push-Service — registriert Geräte-Tokens, fragt Permissions an und leitet
 * eingehende Pushes an den Router weiter. Funktioniert nur in der nativen App
 * (Capacitor); im Browser sind alle Methoden no-ops.
 */
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Device } from '@capacitor/device';
import { App } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';

const isNative = Capacitor.isNativePlatform();

export type PushPermissionState = 'granted' | 'denied' | 'prompt' | 'unsupported';

/** Aktueller Permission-Status des Geräts */
export async function getPushPermission(): Promise<PushPermissionState> {
  if (!isNative) return 'unsupported';
  try {
    const result = await PushNotifications.checkPermissions();
    return result.receive as PushPermissionState;
  } catch {
    return 'unsupported';
  }
}

/** Fragt aktiv nach Permission. Gibt finalen Status zurück. */
export async function requestPushPermission(): Promise<PushPermissionState> {
  if (!isNative) return 'unsupported';
  const result = await PushNotifications.requestPermissions();
  if (result.receive === 'granted') {
    await PushNotifications.register();
  }
  return result.receive as PushPermissionState;
}

/** Sendet Token an Backend (wird vom Listener aufgerufen). */
async function uploadToken(token: string) {
  try {
    const info = await Device.getInfo();
    const id = await Device.getId();
    const appInfo = await App.getInfo().catch(() => ({ version: 'unknown' }));

    await supabase.functions.invoke('register-push-token', {
      body: {
        token,
        platform: info.platform === 'ios' ? 'ios' : info.platform === 'android' ? 'android' : 'web',
        device_id: id.identifier,
        app_version: appInfo.version,
      },
    });
  } catch (err) {
    console.error('[push] token upload failed:', err);
  }
}

let initialized = false;

/**
 * Einmalig beim App-Start aufrufen. Setzt Listener für Token, eingehende
 * Pushes und Tap-Actions auf. Idempotent.
 */
export async function initPushNotifications(opts?: {
  onNotification?: (n: PushNotificationSchema) => void;
  onAction?: (a: ActionPerformed) => void;
}) {
  if (!isNative || initialized) return;
  initialized = true;

  await PushNotifications.addListener('registration', (token: Token) => {
    uploadToken(token.value);
  });

  await PushNotifications.addListener('registrationError', (err) => {
    console.error('[push] registration error:', err);
  });

  await PushNotifications.addListener('pushNotificationReceived', (n) => {
    opts?.onNotification?.(n);
  });

  await PushNotifications.addListener('pushNotificationActionPerformed', (a) => {
    opts?.onAction?.(a);
  });

  // Local notifications permission (für In-App Reminder)
  try {
    await LocalNotifications.requestPermissions();
  } catch {
    /* ignore */
  }

  // Falls bereits granted: direkt registrieren
  const status = await getPushPermission();
  if (status === 'granted') {
    await PushNotifications.register();
  }
}

/** Nur native Plattform? Wird vom UI gebraucht für „nur in App"-Hinweise. */
export function isPushSupported(): boolean {
  return isNative;
}
