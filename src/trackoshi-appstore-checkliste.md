# Trackoshi — App Store Checkliste
## Capacitor / iOS & Android Vorbereitung

---

## Phase 1 — Jetzt (Codebasis vorbereiten)

### Capacitor Setup
- [ ] Capacitor installieren
  ```bash
  npm install @capacitor/core @capacitor/cli
  npm install @capacitor/ios @capacitor/android
  npx cap init "Trackoshi" "com.bluebubble.trackoshi"
  npx cap add ios
  npx cap add android
  ```
- [ ] `ios/` und `android/` Ordner im Repo vorhanden

### vite.config.js anpassen
- [ ] `base: './'` hinzufügen (Capacitor braucht relative Pfade)
  ```js
  export default {
    base: './',
    build: { outDir: 'dist' }
  }
  ```

### API-URLs auf absolut umstellen ⚠️ Wichtigste Änderung
- [ ] `VITE_API_BASE` Umgebungsvariable definieren
  ```js
  const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://bb-btc-tracker.netlify.app'
  ```
- [ ] Alle `fetch('/api/...')` auf `fetch(`${API_BASE}/api/...`)` umstellen
  - `/api/prices`
  - `/api/history`
  - `/api/transactions` (Netlify Functions)

---

## Phase 2 — Vor Store-Submit

### Sign in with Apple (Apple-Pflicht)
- [ ] Supabase: Apple OAuth Provider aktivieren (Supabase Dashboard → Auth → Providers)
- [ ] Capacitor Plugin installieren
  ```bash
  npm install @capacitor/sign-in-with-apple
  ```
- [ ] Login-Screen: "Sign in with Apple" Button hinzufügen
- [ ] In i18n.js: Text für DE + EN hinzufügen

### In-App Purchase (IAP) für Freemium
- [ ] Freemium-Grenze definieren (was ist kostenlos, was Premium?)
- [ ] IAP Plugin installieren
  ```bash
  npm install cordova-plugin-purchase
  ```
- [ ] Apple App Store Connect: Produkt anlegen (Abo oder Einmalkauf)
- [ ] Google Play Console: Produkt anlegen
- [ ] IAP-Logik in App einbauen (Kauf, Restore, Status prüfen)
- [ ] Premium-Features hinter IAP-Check sperren

### Rechtliches & Compliance
- [ ] Disclaimer hinzufügen (Onboarding oder Einstellungen):
  > "Trackoshi dient ausschliesslich zur persönlichen Portfolio-Übersicht und stellt keine Finanzberatung dar."
- [ ] Datenschutzerklärung: support@bluebubble.ch prüfen / aktualisieren
- [ ] App Store Connect: Privacy Nutrition Label ausfüllen
  - E-Mail-Adresse (verknüpft mit Nutzer-ID)
  - Finanzdaten / Transaktionen (verknüpft mit Nutzer-ID)

### Apple Developer Account
- [ ] Apple Developer Account registrieren (USD 99/Jahr)
  → https://developer.apple.com/programs/enroll/
- [ ] App Store Connect: neue App anlegen
- [ ] Bundle ID `com.bluebubble.trackoshi` registrieren
- [ ] Xcode: Signing & Capabilities konfigurieren

### Google Play Console
- [ ] Google Play Developer Account registrieren (USD 25, einmalig)
  → https://play.google.com/console/signup
- [ ] Neue App anlegen
- [ ] App-Signatur konfigurieren

### App-Assets
- [ ] App Icon finalisieren (echtes ₿-Symbol, kein generiertes)
  - iOS: 1024×1024px PNG (kein Alpha-Kanal)
  - Android: Adaptive Icon (512×512px)
- [ ] Screenshots erstellen (iPhone 6.7", iPhone 6.5", iPad wenn nötig)
- [ ] Screenshots erstellen Android (Phone, Tablet)
- [ ] App-Beschreibung DE + EN schreiben (max. 4000 Zeichen)
- [ ] Kurzbeschreibung DE + EN (max. 80 Zeichen)
- [ ] Keywords für App Store Optimierung (ASO) definieren

---

## Phase 3 — Nice to have (nach erstem Launch)

### Native Features
- [ ] Haptic Feedback bei Transaktionen
  ```bash
  npm install @capacitor/haptics
  ```
- [ ] Biometrie-Login (Face ID / Touch ID / Fingerprint)
  ```bash
  npm install @capacitor/biometrics
  ```
- [ ] Push Notifications für Kurs-Alerts
  ```bash
  npm install @capacitor/push-notifications
  ```

### PWA parallel behalten
- [ ] Netlify-Version weiterhin unter `bb-btc-tracker.netlify.app` aktiv lassen
- [ ] Web-Version als Fallback / Demo-Zugang nutzen

---

## Build-Workflow (nach Capacitor Setup)

```bash
# 1. Vite Build
npm run build

# 2. Capacitor sync
npx cap sync

# 3. iOS öffnen (Mac + Xcode erforderlich)
npx cap open ios

# 4. Android öffnen
npx cap open android
```

---

## Kosten-Übersicht

| Posten | Kosten | Rhythmus |
|--------|--------|----------|
| Apple Developer Account | USD 99 | jährlich |
| Google Play Developer | USD 25 | einmalig |
| Capacitor | kostenlos | — |
| Supabase (aktuell) | kostenlos | — |
| Netlify (aktuell) | kostenlos | — |
| Store-Gebühr Apple | 15–30% | pro Kauf |
| Store-Gebühr Google | 15–30% | pro Kauf |

---

## Wichtige Hinweise

- **iOS-Build braucht zwingend einen Mac** mit Xcode
- **Android-Build** geht auch auf Mac/Windows/Linux
- **IAP über Stripe ist nicht erlaubt** im App Store — nur Apple IAP
- **MwSt.** wird von Apple/Google automatisch abgeführt — kein EU OSS-Aufwand
- **Store-Review Apple**: 1–3 Tage, **Google**: wenige Stunden
- **Beide Stores teilen dieselbe Supabase-Datenbank** — kein Mehraufwand

---

*Stand: Mai 2026 — Trackoshi v1.18.0*
