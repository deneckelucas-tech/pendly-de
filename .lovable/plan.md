# Pendly — Plan bis Marktreife

> Stand: 2026-04-27 · Aktueller Status nach umfassendem Test

---

## ✅ Was bereits funktioniert

- **Build & TypeScript**: Kompiliert sauber (nach Fix der fehlenden `@tanstack/query-core` Dependency)
- **Auth**: Supabase Auth mit E-Mail/Passwort, Subscription-Check via Stripe
- **Datenbank**: Routen, Verbindungen, Legs, User Preferences mit RLS
- **Wizard**: Stationen → Verbindungen → Rückfahrt → Zusammenfassung (inkl. manueller Builder)
- **Live-Status**: Polling-Hook für Verspätungen/Ausfälle/Gleiswechsel
- **Notifications-Center**: In-App-Benachrichtigungen aggregieren HAFAS-Remarks + Live-Status
- **Transport-Proxy**: Caching, Retry, Failover gegen `v6.db.transport.rest`
- **Stripe**: Checkout, Customer Portal, Webhook, Subscription-Status
- **E-Mail-Infrastruktur**: Queue-basiertes System für Auth-E-Mails
- **Design**: Cream/Blue-Theme aus GitHub gemerged, Plus Jakarta Sans, Landing fertig

---

## 🔴 BLOCKER (vor Marktstart zwingend)

### 1. Push-Notifications (Native iOS/Android) — *größter offener Brocken*
**Anforderung des Users**: Native Push, 60 min vor Abfahrt → minütliches Tracking, Ausfall = "Nächste Linie nehmen?"-Prompt.

**Was fehlt komplett:**
- `@capacitor/push-notifications` + `@capacitor/local-notifications` Plugins
- Tabelle `push_tokens` (user_id, token, platform, last_seen)
- Edge Function `register-push-token` (Token-Upsert beim App-Start)
- Edge Function `schedule-notifications` (cron: alle 60s, scannt heutige Verbindungen)
- Edge Function `send-push` (FCM für Android, APNs für iOS)
- Logik:
  - **T-60 min**: 1× Pre-Check, ob Verbindung planmäßig
  - **T-1 min Schritte**: minütliches Polling bis Abfahrt
  - **Bei Verspätung**: Tracking weiter bis Zug abgefahren
  - **Bei Ausfall**: Push mit Action „Nächste Linie nehmen?" → Deep-Link öffnet Alternative
- Secrets: `FCM_SERVER_KEY`, `APNS_AUTH_KEY`, `APNS_KEY_ID`, `APNS_TEAM_ID`
- Quiet Hours respektieren (`user_preferences.quiet_hours_*`)

### 2. Capacitor Build vorbereiten
- Push-Plugin in `capacitor.config.ts` registrieren
- `Info.plist` (iOS): NSUserNotificationsUsageDescription
- `AndroidManifest.xml`: Notification permissions, FCM Service
- App-Icon + Splash-Screen für beide Plattformen
- Anleitung in README für `npx cap sync` + Store-Build

### 3. Email-Domain & Auth-E-Mails
- Aktuell wahrscheinlich Default-Templates → Branding fehlt
- Domain-Setup (`pendly.app`) für Sender-Adresse
- Custom Templates für Signup, Password-Reset, Magic Link

### 4. Legal & DSGVO
- `Legal.tsx` existiert — Inhalt prüfen: **Impressum**, **Datenschutz**, **AGB**
- Cookie-Banner / Tracking-Consent (falls Analytics geplant)
- Auftragsverarbeitungsvertrag-Hinweis (Supabase, Stripe, Lovable, DB API)
- Hinweis: Daten von `transport.rest` (Open-Source HAFAS-Proxy)

---

## 🟡 WICHTIG (vor Launch sehr empfohlen)

### 5. Error-Tracking & Observability
- Sentry oder PostHog einbauen — aktuell nur `console.error` (15 Stellen)
- Edge-Function-Logs zentral monitoren

### 6. Onboarding-Flow überarbeiten
- `Onboarding.tsx` ist nur ein Redirect → echtes Welcome-Onboarding fehlt
- 3-Step Walkthrough: Was ist Pendly? → Erste Route → Push erlauben

### 7. Performance
- Bundle ist 790 KB (231 KB gzip) → Code-Splitting via dynamic imports einführen
- Routes (`/dashboard`, `/route-setup`, `/settings` …) lazy laden

### 8. Empty / Error States
- Was passiert wenn HAFAS down ist? Klare Fallback-UI
- Was wenn keine Routen gespeichert? (`EmptyState` existiert — überall genutzt?)

### 9. Subscription-UX
- Trial-Banner überall sichtbar wenn nahe am Ende
- Klare Anzeige im Settings (Restlaufzeit, Wechsel-Plan, Kündigung)

### 10. Account-Management
- Account löschen (DSGVO Recht auf Vergessen)
- E-Mail ändern, Passwort ändern UI

---

## 🟢 NICE-TO-HAVE (Post-Launch möglich)

- **Mehrsprachigkeit**: aktuell nur DE — `language` in `user_preferences` ist da, aber kein i18next
- **Apple/Google Sign-In** (statt nur E-Mail)
- **Widget** (iOS/Android) für nächste Verbindung
- **Wear OS / Apple Watch** Companion
- **Verbindungs-Historie** (Statistik: durchschnittliche Verspätung)
- **Karten-Ansicht** für Bahnhöfe / Routen
- **Sharing**: Verbindung mit Freunden teilen
- **Dark Mode** voll testen (Switch existiert in Settings)

---

## 🧪 Test-Befunde (heute durchgeführt)

| Bereich | Status | Befund |
|---|---|---|
| `bun run build` | ✅ behoben | Fehlte `@tanstack/query-core` — installiert |
| `tsc --noEmit` | ✅ | Keine Fehler |
| `vitest run` | ⚠️ | Nur 1 Beispiel-Test — **keine echten Tests** |
| ESLint | nicht geprüft | Sollte in CI laufen |
| Datenbank | ✅ | RLS auf allen User-Tabellen, 29 abgelaufene Cache-Einträge |
| Edge Functions | ✅ deployt | 7 Funktionen, alle aktiv |
| Routes | 4 Verbindungen, 7 Legs in Test-Daten |

---

## 📋 Empfohlene Reihenfolge

1. **Push-Notifications komplett** (Schritt 1+2) — 2-3 Iterationen
2. **Custom Auth-E-Mails + Domain** — 1 Iteration
3. **Legal-Inhalte + DSGVO** — 1 Iteration (User muss Texte liefern)
4. **Account-Management + Subscription-UX** — 1 Iteration
5. **Onboarding + Empty States** — 1 Iteration
6. **Code-Splitting + Sentry** — 1 Iteration
7. **Capacitor-Sync + Store-Submission-Doku** — 1 Iteration

→ **Realistisch 6-8 Build-Iterationen bis store-ready.**
