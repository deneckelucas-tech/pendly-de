/**
 * send-push — versendet Push-Nachrichten an einen Nutzer (alle seine Geräte).
 *
 * Aufruf nur durch andere Edge Functions oder via service-role JWT.
 *
 * Body:
 *   {
 *     user_id: string,
 *     title: string,
 *     body: string,
 *     data?: Record<string, string>,
 *     dedup_key?: string,         // Wenn gesetzt → notification_log Insert (unique)
 *     kind?: string,              // 'pre_departure' | 'delay' | 'cancellation' | 'platform_change' | ...
 *     severity?: 'info' | 'warning' | 'critical',
 *   }
 *
 * Benötigte Secrets:
 *   FCM_SERVICE_ACCOUNT_JSON  — kompletter JSON-Inhalt des Firebase Service Accounts (für Android)
 *   APNS_AUTH_KEY             — kompletter Inhalt der .p8 Datei (für iOS)
 *   APNS_KEY_ID               — z.B. "ABC1234567"
 *   APNS_TEAM_ID              — z.B. "XYZ9876543"
 *   APNS_BUNDLE_ID            — z.B. "app.lovable.dd7c08af3db746ed85956570d08c946a"
 *   APNS_USE_SANDBOX          — "true" für Dev-Builds, sonst weglassen oder "false"
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { create as createJwt, getNumericDate } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  dedup_key?: string;
  kind?: string;
  severity?: 'info' | 'warning' | 'critical';
  connection_id?: string;
  route_id?: string;
}

interface PushToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

// ----------------- FCM (Android) -----------------

let fcmTokenCache: { token: string; expiresAt: number; projectId: string } | null = null;

async function getFcmAccessToken(): Promise<{ token: string; projectId: string } | null> {
  const json = Deno.env.get('FCM_SERVICE_ACCOUNT_JSON');
  if (!json) return null;

  if (fcmTokenCache && fcmTokenCache.expiresAt > Date.now() + 60_000) {
    return { token: fcmTokenCache.token, projectId: fcmTokenCache.projectId };
  }

  const sa = JSON.parse(json);
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  // Import RSA private key
  const pem = sa.private_key.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyData,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false, ['sign'],
  );

  const jwt = await createJwt({ alg: 'RS256', typ: 'JWT' }, claims, cryptoKey);

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    console.error('FCM token fetch failed:', await tokenRes.text());
    return null;
  }
  const { access_token, expires_in } = await tokenRes.json();
  fcmTokenCache = {
    token: access_token,
    expiresAt: Date.now() + (expires_in * 1000),
    projectId: sa.project_id,
  };
  return { token: access_token, projectId: sa.project_id };
}

async function sendFcm(token: string, title: string, body: string, data: Record<string, string>): Promise<boolean> {
  const auth = await getFcmAccessToken();
  if (!auth) return false;

  const message = {
    message: {
      token,
      notification: { title, body },
      data,
      android: { priority: 'HIGH' as const },
    },
  };

  const res = await fetch(`https://fcm.googleapis.com/v1/projects/${auth.projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`FCM send failed (${res.status}):`, text);
    return false;
  }
  return true;
}

// ----------------- APNs (iOS) -----------------

let apnsTokenCache: { token: string; expiresAt: number } | null = null;

async function getApnsToken(): Promise<string | null> {
  const key = Deno.env.get('APNS_AUTH_KEY');
  const keyId = Deno.env.get('APNS_KEY_ID');
  const teamId = Deno.env.get('APNS_TEAM_ID');
  if (!key || !keyId || !teamId) return null;

  if (apnsTokenCache && apnsTokenCache.expiresAt > Date.now() + 60_000) {
    return apnsTokenCache.token;
  }

  // Import EC P-256 private key (.p8 format)
  const pem = key.replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '').replace(/\s/g, '');
  const keyData = Uint8Array.from(atob(pem), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyData,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );

  const claims = { iss: teamId, iat: getNumericDate(0) };
  const jwt = await createJwt({ alg: 'ES256', kid: keyId }, claims, cryptoKey);

  apnsTokenCache = { token: jwt, expiresAt: Date.now() + 50 * 60 * 1000 };
  return jwt;
}

async function sendApns(deviceToken: string, title: string, body: string, data: Record<string, string>): Promise<boolean> {
  const jwt = await getApnsToken();
  const bundleId = Deno.env.get('APNS_BUNDLE_ID');
  if (!jwt || !bundleId) return false;

  const useSandbox = Deno.env.get('APNS_USE_SANDBOX') === 'true';
  const host = useSandbox ? 'api.sandbox.push.apple.com' : 'api.push.apple.com';

  const payload = {
    aps: {
      alert: { title, body },
      sound: 'default',
      'mutable-content': 1,
    },
    ...data,
  };

  const res = await fetch(`https://${host}/3/device/${deviceToken}`, {
    method: 'POST',
    headers: {
      'authorization': `bearer ${jwt}`,
      'apns-topic': bundleId,
      'apns-push-type': 'alert',
      'apns-priority': '10',
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`APNs send failed (${res.status}):`, text);
    return false;
  }
  return true;
}

// ----------------- Handler -----------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json() as Body;
    if (!body.user_id || !body.title || !body.body) {
      return new Response(JSON.stringify({ error: 'invalid body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Dedup-Check
    if (body.dedup_key) {
      const { data: existing } = await admin
        .from('notification_log')
        .select('id')
        .eq('user_id', body.user_id)
        .eq('dedup_key', body.dedup_key)
        .maybeSingle();
      if (existing) {
        return new Response(JSON.stringify({ skipped: 'duplicate' }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Tokens holen
    const { data: tokens, error: tokErr } = await admin
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', body.user_id);

    if (tokErr) throw tokErr;
    if (!tokens || tokens.length === 0) {
      return new Response(JSON.stringify({ skipped: 'no_tokens' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = body.data ?? {};
    let sent = 0;
    let failed = 0;

    for (const t of tokens as PushToken[]) {
      const ok = t.platform === 'ios'
        ? await sendApns(t.token, body.title, body.body, data)
        : t.platform === 'android'
          ? await sendFcm(t.token, body.title, body.body, data)
          : false;
      if (ok) sent++; else failed++;
    }

    // Log
    if (body.dedup_key) {
      await admin.from('notification_log').insert({
        user_id: body.user_id,
        connection_id: body.connection_id ?? null,
        route_id: body.route_id ?? null,
        kind: body.kind ?? 'generic',
        severity: body.severity ?? 'info',
        dedup_key: body.dedup_key,
        title: body.title,
        body: body.body,
        data,
        sent_count: sent,
        failed_count: failed,
      });
    }

    return new Response(JSON.stringify({ sent, failed, total: tokens.length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-push error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
