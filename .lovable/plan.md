# Pendly — Plan bis Marktreife

> Stand: 2026-04-28 · Push-Infrastruktur fertiggestellt

---

## ✅ Erledigt in dieser Session

### Push-Notifications Backend ✓
- **DB**: `push_tokens`, `notification_log`, `user_preferences.push_enabled` + `pre_departure_minutes`
- **Edge Function `register-push-token`**: Token-Upsert mit Auth-Check
- **Edge Function `send-push`**: FCM (Android) + APNs (iOS) mit JWT-Caching, Dedup via `notification_log`
- **Edge Function `schedule-notifications`**: läuft jede Minute via pg_cron, prüft heutige Verbindungen, respektiert Quiet Hours, sendet Pre-Departure / Verspätung / Ausfall / Gleiswechsel
- **Capacitor**: `@capacitor/push-notifications`, `local-notifications`, `device`, `app` installiert; Plugin-Config in `capacitor.config.ts`
- **Frontend**: `src/lib/push-service.ts` (Init, Permission, Token-Upload), `usePushPermission` Hook
- **Settings UI**: Push-Toggle mit Permission-Flow + Slider für Vorab-Check-Window (15-120 Min.)
- **main.tsx**: ruft `initPushNotifications()` beim App-Start auf (no-op auf Web)

---

## 🔴 BLOCKER

### 1. Push-Secrets eintragen — *du bist dran*
Ohne diese Keys versendet `send-push` nichts. Schritte siehe Chat-Anleitung.
- `FCM_SERVICE_ACCOUNT_JSON` (Firebase Service Account, Android)
- `APNS_AUTH_KEY` (.p8 Inhalt, iOS)
- `APNS_KEY_ID`, `APNS_TEAM_ID`, `APNS_BUNDLE_ID`
- Optional: `APNS_USE_SANDBOX=true` für Dev-Builds

### 2. Capacitor Native Builds (lokal)
- `git pull` lokal → `npm install` → `npx cap add ios` + `npx cap add android`
- iOS: `Info.plist` `NSUserNotificationsUsageDescription` ergänzen
- iOS: Push Notifications & Background Modes Capability in Xcode
- Android: `google-services.json` aus Firebase ins `android/app/` legen
- App-Icon + Splash für beide Stores
- Server-URL in `capacitor.config.ts` für Production-Build entfernen (oder via Env)

### 3. Email-Domain & Auth-E-Mails
- Custom Sender-Domain für Auth-Emails (Branding fehlt)

### 4. Legal & DSGVO
- Impressum, Datenschutz, AGB Inhalte (User muss Texte liefern)

---

## 🟡 WICHTIG

5. **Account-Management**: Account löschen (DSGVO), E-Mail/Passwort ändern UI
6. **Subscription-UX**: Trial-Banner mit Restlaufzeit prominenter
7. **Code-Splitting**: Bundle 790 KB → Lazy-Load Routes
8. **Sentry/PostHog**: Error-Tracking
9. **Echte Onboarding-Tour**: aktuell nur Redirect

---

## 🟢 NICE-TO-HAVE

- i18next (Mehrsprachigkeit)
- Apple/Google Sign-In
- Widget (iOS/Android)
- Karten-Ansicht
- Verbindungs-Historie

---

## 📋 Nächste Schritte

1. **Du**: Firebase + Apple Developer einrichten, Secrets liefern
2. **Ich**: Secrets per `add_secret` einbinden, send-push live testen
3. **Du**: lokaler Capacitor-Build, Test auf echtem Gerät
4. **Wir**: Custom Auth-Emails + Legal + Account-Mgmt
