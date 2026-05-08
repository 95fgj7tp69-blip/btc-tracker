# Trackoshi — App Store Checkliste
## Capacitor / iOS & Android Vorbereitung

---

## Phase 1 — Codebasis vorbereiten ✅ ABGESCHLOSSEN

### API-URLs ✅
- [x] Intelligente `API_BASE` Konstante — relativ im Browser, absolut in nativer App
- [x] Protokoll-Erkennung: `window.location.protocol.startsWith("capacitor")`
- [x] Korrekte Produktions-URL: `https://trackoshi.netlify.app`
- [x] Alle 10 fetch-Aufrufe umgestellt
- [x] CORS-Problem gelöst

### vite.config.js ✅
- [x] `base: './'` im Root (nicht in src/)
- [x] `build: { outDir: 'dist' }`

### Capacitor Setup ✅
- [x] Capacitor installiert (`@capacitor/core`, `@capacitor/cli`, `@capacitor/ios`, `@capacitor/android`)
- [x] `npx cap init "Trackoshi" "com.bluebubble.trackoshi" --web-dir dist`
- [x] `npx cap add ios` — `ios/` Ordner vorhanden
- [x] App läuft im iOS Simulator (iPhone 17 Pro, iOS 26.4.1) 🎉
- [x] Transaktionen und Charts laden korrekt

### Infrastruktur ✅
- [x] Node.js v24.15.0 auf Mac installiert
- [x] Xcode 26.4.1 installiert
- [x] iOS 26.4.1 Simulator installiert
- [x] Netlify Functions auf main deployed (5 Functions aktiv)
- [x] Repo geklont: `~/Documents/btc-tracker`

---

## Phase 2 — Vor Store-Submit

### Apple Developer Account
- [x] Apple ID erstellt: `stefan.vongunten@bluebubble.ch`
- [x] D-U-N-S Nummer für Blue Bubble GmbH erhalten
- [x] Enrollment gestartet als Organization (Blue Bubble GmbH)
- [ ] ⏳ Apple verifiziert Firma — E-Mail abwarten (2–5 Werktage)
- [ ] USD 99 bezahlen (nach Apple-Bestätigung)
- [ ] App Store Connect: neue App anlegen
- [ ] Bundle ID `com.bluebubble.trackoshi` registrieren
- [ ] Xcode: Signing & Capabilities konfigurieren
- [ ] App direkt auf iPhone laden (ohne Simulator)

### Sign in with Apple (Apple-Pflicht bei IAP)
- [ ] Supabase: Apple OAuth Provider aktivieren
- [ ] Capacitor Plugin installieren: `npm install @capacitor/sign-in-with-apple`
- [ ] Login-Screen: "Sign in with Apple" Button
- [ ] i18n.js: Text DE + EN

### Rechtliches & Compliance
- [ ] Disclaimer: "Trackoshi dient ausschliesslich zur persönlichen Portfolio-Übersicht und stellt keine Finanzberatung dar."
- [ ] Datenschutzerklärung prüfen / aktualisieren
- [ ] Privacy Nutrition Label ausfüllen (E-Mail, Finanzdaten)

### App-Assets
- [ ] App Icon finalisieren (1024×1024px PNG, kein Alpha-Kanal)
- [ ] Screenshots im Simulator (iPhone 6.7")
- [ ] App-Beschreibung DE + EN (max. 4000 Zeichen)
- [ ] Kurzbeschreibung DE + EN (max. 80 Zeichen)
- [ ] Keywords ASO

### Google Play Console (später)
- [ ] Google Play Developer Account (USD 25, einmalig)
- [ ] Neue App anlegen
- [ ] App-Signatur konfigurieren

### In-App Purchase / Freemium (nach erstem Release)
- [ ] Freemium-Grenze definieren
- [ ] IAP Plugin: `npm install cordova-plugin-purchase`
- [ ] App Store Connect + Play Console: Produkt anlegen
- [ ] IAP-Logik einbauen

---

## Phase 3 — Nice to have

- [ ] Haptic Feedback: `npm install @capacitor/haptics`
- [ ] Biometrie-Login: `npm install @capacitor/biometrics`
- [ ] Push Notifications: `npm install @capacitor/push-notifications`
- [ ] Error Boundary (weisser Bildschirm verhindern)
- [ ] Offline-Modus: letzte Preise cachen

---

## Zu bereinigen
- [ ] `src/netlify.toml` löschen (fälschlicherweise in src/ erstellt — gehört ins Root)

---

## Build-Workflow (lokal Mac)

```bash
# Projektordner: ~/Documents/btc-tracker (Branch: dev)

npm run build        # Vite Build
npx cap sync         # Assets in iOS-Projekt kopieren
npx cap open ios     # Xcode öffnen → Play ▶
```

---

## Kosten-Übersicht

| Posten | Kosten | Rhythmus | Status |
|--------|--------|----------|--------|
| Apple Developer Account | USD 99 | jährlich | ⏳ In Bearbeitung |
| Google Play Developer | USD 25 | einmalig | — |
| Capacitor | kostenlos | — | ✅ |
| Supabase | kostenlos | — | ✅ |
| Netlify | kostenlos | — | ✅ |
| Store-Gebühr Apple | 15–30% | pro Kauf | — |
| Store-Gebühr Google | 15–30% | pro Kauf | — |

---

## Wichtige Infos

- **iOS-Build**: Mac + Xcode zwingend → Mac Mini von Stefan ✅
- **Android-Build**: Mac/Windows/Linux möglich
- **IAP über Stripe**: nicht erlaubt im App Store — nur Apple IAP
- **MwSt.**: wird von Apple/Google automatisch abgeführt
- **Store-Review Apple**: 1–3 Tage / **Google**: wenige Stunden
- **Supabase**: main + dev teilen dieselbe Datenbank
- **Apple ID**: `stefan.vongunten@bluebubble.ch` (Organization: Blue Bubble GmbH)
- **Bundle ID**: `com.bluebubble.trackoshi`
- **Netlify Functions URL**: `trackoshi.netlify.app` (nicht `bb-btc-tracker.netlify.app`)

---

*Stand: 08. Mai 2026 — Trackoshi v2.8.0*
