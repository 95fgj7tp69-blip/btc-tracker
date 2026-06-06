# BTC Portfolio App — Projektstand

## Stack
- **Frontend**: React (JSX) + Vite, Recharts
- **iOS-Wrapper**: Capacitor (App im App Store live)
- **Backend**: Netlify Functions (Node.js)
- **Datenbank**: Supabase (PostgreSQL, EU/Irland)
- **IAP**: RevenueCat (Entitlement `premium`)
- **Hosting**: Netlify (PWA), cyon.ch (Marketing-Site trackoshi.com)
- **Live URL (App Store/PWA)**: `https://trackoshi.netlify.app`
- **DEV/Staging**: `https://dev--trackoshi.netlify.app`
- **GitHub**: `95fgj7tp69-blip/btc-tracker`
- **Lokaler Mac-Pfad**: `~/Documents/btc-tracker/`

## App Store / iOS
- **App-Name**: Trackoshi BTC (Blue Bubble GmbH, Schweiz)
- **Bundle ID**: `com.bluebubble.trackoshi`
- **App Store ID**: `6770056556` | **Apple Team ID**: `3RD76SZLYB`
- **Apple Reviewer-Account**: `applereview@bluebubble.ch`
- **Live seit**: 2. Juni 2026 (erst 1.0.1, dann 1.1.0)
- **AKTUELL LIVE**: Version 1.1.0, Build 7 (von Apple akzeptiert, im Store ausgeliefert)
- **Info.plist**: `ITSAppUsesNonExemptEncryption = NO` gesetzt (keine Export-Compliance-Frage mehr)
- **Zahlende Kunden**: bisher keine (Stand 6. Juni 2026)

## Monetarisierung (RevenueCat)
- **Modell**: Einmalkauf (Non-Consumable) statt Abo — Umstellung in v1.1
- **Produkt**: `com.bluebubble.trackoshi.premium.lifetime` (Apple-ID `6776755516`), USD 14.99
- **Entitlement**: `premium` (einziges Entitlement)
- **Offering**: `default`, Package `$rc_lifetime`
- **RevenueCat iOS Public Key**: `appl_dvzVFNnKTWODZDzgjvTZmJxURVm` | **Project ID**: `projeaf3fcad`
- **Alte Abo-Produkte** (`.premium.monthly`, `.premium.yearly`): AUFGERÄUMT (6. Juni 2026) — aus `default`-Offering entfernt, vom `premium`-Entitlement detacht (nur noch Lifetime dran), in ASC beide auf "Aus Verkauf entfernen" (0 von 175 Ländern). Produkte liegen in RevenueCat noch als verwaiste Karteileichen (bewusst, schaden nicht — können später gelöscht werden).

## Supabase
- **Project ID**: `xjkomserewmxktwvmoaa`
- **URL**: `https://xjkomserewmxktwvmoaa.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa29tc2VyZXdteGt0d3Ztb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjEzNTMsImV4cCI6MjA5MjUzNzM1M30.4GVJpwwQUCwhFGgMPFFYr_H23RUbX_3TpRAYpbvy9Es`
- **Tabelle**: `transactions` (id, date, btc, chf, fee, type, note, user_id, created_at)
- **RLS**: aktiviert mit Policies (jeder User sieht nur eigene Daten)
- **Auth**: E-Mail + Passwort, Redirect URL auf Netlify gesetzt
- **Region**: AWS eu-west-1 (Irland) — DSGVO-konform

## Supabase Constraint (erledigt auf dev + main)
```sql
ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
CHECK (type IN ('buy', 'sell', 'transfer_in', 'transfer_out'));
```

## Repo-Struktur
```
btc-tracker/
  src/
    App.jsx        <- Haupt-React-Komponente
    i18n.js        <- Übersetzungen DE/EN
  netlify/functions/
    transactions.js
    prices.js      <- Preis-Proxy mit 60s Cache
    history.js     <- Historische Kurse mit 24h Cache
    (claude.js     <- in v1.1 GELÖSCHT, KI-Tools entfernt)
  ios/             <- Capacitor iOS-Projekt (Xcode baut von hier)
  public/
    manifest.json           <- PWA Manifest
    demo-transaktionen.csv  <- Demo-Daten (45 Transaktionen 2022-2026)
    icons/
      icon-512.png
      icon-192.png
      icon-180.png
  index.html, package.json, vite.config.js, netlify.toml
```
Marketing-Site auf cyon (trackoshi.com): `bestaetigt.html` (Auth-Bestätigung), `passwort-reset.html` (Passwort-Reset, löst Recovery-Token ein), `agb.html`, `datenschutz.html`, `kontakt.html`. App-Assets müssen unter `/img/` liegen — `/icons/` ist auf cyon ein reservierter Apache-Alias.

## App-Features (aktueller Stand)
- [x] Login / Register / Passwort-Reset (Supabase Auth)
- [x] Mehrbenutzerfähig (RLS, jeder sieht nur eigene Daten)
- [x] JWT-Token in allen API-Calls
- [x] Dark/Light Mode (localStorage) — Standard: Light Mode
- [x] Dark Mode kontrastreicher (Apple iOS Dark Mode Stil)
- [x] Live BTC-Kurs (via Netlify Proxy /api/prices, 60s Cache)
- [x] Live Wechselkurse USD/CHF und EUR/USD von CoinGecko (via Proxy)
- [x] Portfolio-Währung wählbar: CHF / EUR / USD (gespeichert in localStorage)
- [x] Alle Anzeigen in gewählter Währung (Portfolio, Position, Markt, Break-Even, DCA)
- [x] Transaktionseingabe in gewählter Währung, Speicherung immer in CHF
- [x] CSV-Export in gewählter Währung + Spalte "Portfoliowert heute"
- [x] CSV-Import mit Duplikaterkennung (Einstellungen → DATEN)
- [x] Dashboard: PortfolioCard, PositionCard, MarketCard
- [x] Analyse-Tab: PriceChart, BreakEvenCard, Realisierter P&L, DCA-Effizienz Chart
- [x] Navigation: 5 Tabs (Dashboard / Analyse / + / Verlauf / Tools)
- [x] Transaktionen: Kauf / Verkauf / Einbuchung / Ausbuchung
- [x] Einbuchung (transfer_in): BTC Bestand +, Einstandspreis unverändert
- [x] Ausbuchung (transfer_out): BTC Bestand −, Einstandspreis unverändert
- [x] FIFO-Methode für Einstandspreis (Standard, Lot-Verwaltung)
- [x] AVCO-Methode für Einstandspreis (Weighted Average Cost)
- [x] Einstandspreis-Methode wählbar in Einstellungen (localStorage)
- [x] Info-Modal zur Erklärung der Methoden (Fragezeichen-Icon)
- [x] Portfolio-Chart: Investiert + Portfoliowert, gemeinsame Y-Achse ab 0
- [x] Portfolio-Chart Tabs: nur verfügbare Tabs angezeigt (1T/7T/30T/Alle)
- [x] Realisierter Gewinn/Verlust (Analyse-Tab)
- [x] DCA-Effizienz Chart (Analyse-Tab): Ø Kaufpreis pro Jahr
- [x] Kauf-Simulator als Bottom-Sheet Modal im Tools-Tab
- [x] Szenario-Rechner im Tools-Tab (Portfoliowert bei Zielkurs)
- [x] Paywall: ein Einmalkauf-Button (`offerings.current.lifetime`, Fallback `FALLBACK_PRICE_LIFETIME="USD 14.99"`), Feature-Liste, **Restore-Button** (Apple-Pflicht bei Non-Consumables)
- [x] `isNativePlatform()`-Schutz: RevenueCat (`Purchases.configure`) wird im Browser übersprungen (App.jsx Zeile ~51, 2815, 2880). Im Web zeigt die Paywall "Premium nur in der iOS-App verfügbar" statt Kauf-Button — Web-PWA bricht NICHT
- [x] Free-Limit: max. 25 Transaktionen, Premium = unbegrenzt
- [x] KI-Tools ENTFERNT in v1.1 (Portfolio-Analyse, Markt-Kommentar, BTC-News) — States, callClaudeAI, renderMarkdown, Tools-Buttons, i18n ai*-Keys, claude.js, /api/claude-Redirect alle raus
- [x] BTC-Kurs im Header (Preis + 24h-Änderung, in gewählter Währung)
- [x] Einstellungen via Zahnrad-Icon im Header (Modal)
- [x] Onboarding: 5 Slides mit SVG-Illustrationen (Slide 3 in v1.1 neu: Taschenrechner-SVG "Tools, die rechnen", bewusst ohne Wort "Kauf"/"Buy" wegen Apple 1.1.6)
- [x] Demo-Daten laden (Einstellungen → DATEN)
- [x] Alle Transaktionen löschen (mit Fortschrittsbalken, Konto bleibt erhalten)
- [x] Passwort ändern (Modal in Einstellungen)
- [x] Passwort-Reset end-to-end gefixt (v1.1): `PASSWORD_RESET_URL="https://trackoshi.com/passwort-reset.html"`, App sendet `redirectTo` darauf; Seite löst Recovery-Token via updateUser ein; Supabase Redirect-Whitelist erweitert
- [x] Konto löschen (Modal mit Bestätigungstext)
- [x] AGB & Datenschutz: Checkbox bei Registrierung + Modal in Einstellungen
- [x] PWA: manifest.json, Icons (512/192/180px), Apple-Touch-Icon Meta-Tags
- [x] Splash Screen beim App-Start
- [x] Netlify Proxy für Preisdaten (60s Cache) und historische Kurse (24h Cache)
- [x] Verlauf-Filter: Alle / Kauf / Verkauf / Einbuchung / Ausbuchung
- [x] DEV-Banner (lila) auf dev--trackoshi.netlify.app
- [x] iPhone Safe-Area, Viewport-Meta
- [x] Mehrsprachigkeit DE/EN: i18n.js, Systemsprache-Erkennung, Umschalter in Einstellungen

## Transaktions-Typen
| Typ | Label DE | Label EN | Farbe | Wirkung |
|-----|----------|----------|-------|---------|
| buy | Kauf | Buy | Grün | BTC +, Investiert +, Einstand neu |
| sell | Verkauf | Sell | Rot | BTC −, Investiert − (Erlös) |
| transfer_in | Einbuchung | Transfer In | Blau | BTC +, Einstand unverändert |
| transfer_out | Ausbuchung | Transfer Out | Orange | BTC −, Einstand unverändert |

## Finanzberechnungen
```js
const totalBtc = buyBtc - sellBtc + transferInBtc - transferOutBtc
const buyInvested = sum(buy.chf + buy.fee)       // immer in CHF
const sellProceeds = sum(sell.chf - sell.fee)
const totalInvested = buyInvested - sellProceeds
const pnlChf = portfolioChf - totalInvested
const pnlPct = (pnlChf / buyInvested) * 100

// Anzeige-Umrechnung
const toDisplay = (chfAmount, currency, usdChf, eurUsd) => {
  if (currency === "CHF") return chfAmount;
  if (currency === "USD") return chfAmount / usdChf;
  if (currency === "EUR") return (chfAmount / usdChf) * eurUsd;
}
```

## Einstandspreis-Methoden
**FIFO — First In, First Out (Standard)**
- Jeder Kauf = eigenes Lot; beim Verkauf älteste Lots zuerst
- Kompatibel mit Parqet

**AVCO — Weighted Average Cost**
- Bei Kauf: `avco = (poolBtc * avco + kosten) / (poolBtc + btc)`
- Bei Verkauf / Transfer: AVCO unverändert

## Mehrsprachigkeit
- **Datei**: `src/i18n.js` — alle sichtbaren Texte in DE + EN
- **Spracherkennung beim ersten Start**: `navigator.language` — Deutsch (de, de-CH, de-AT etc.) → DE, alles andere → EN
- **Danach**: localStorage `"language"` hat Vorrang
- **Umschalten**: Einstellungen → SPRACHE → DE / EN
- **Neue Features**: Texte immer zuerst in i18n.js (de + en), dann `t("key")` im JSX
- **Test**: App auf EN stellen und durchklicken — alles noch Deutsch = fehlt in i18n.js

## CSV Import/Export Format
```
Datum,Typ,BTC,CHF Betrag,CHF Gebühren,Notiz
2024-01-15,buy,0.25,9875,15,DCA Start
2024-05-10,sell,0.1,7820,10,Teilgewinn
2026-02-02,transfer_in,0.00485224,0,0,Einbuchung
2026-03-17,transfer_out,0.00019247,0,0,Ausbuchung
```
- Import: Einstellungen → DATEN → Import
- Duplikaterkennung: Datum + Typ + BTC
- Rückwärtskompatibel: type=transfer + note=TransferIn/Out wird gemappt

## Preis-Architektur
```
App --> /api/prices  (Netlify Function, 60s Cache) --> CoinGecko
App --> /api/history (Netlify Function, 24h Cache) --> CoinGecko
         --> [[YYYY-MM-DD, usdPrice], ...] für letzte 730 Tage
```

## Versionshistorie
| Version | Datum | Änderungen |
|---------|-------|------------|
| 1.0.0 | 2026-04 | Initiale Version |
| 1.1.x | 2026-04 | UI/UX Basics (Modals, Nummernpad, DEV-Banner) |
| 1.2.x | 2026-04 | Passwort ändern, Konto löschen |
| 1.3.x | 2026-04 | Währungswahl CHF/EUR/USD, Live-Kurse |
| 1.4.0 | 2026-04 | Onboarding, Datenschutzerklärung |
| 1.5.x | 2026-04 | Portfolio-Chart, CSV-Fixes |
| 1.6.0 | 2026-04 | Netlify Proxy für Preisdaten |
| 1.7.0 | 2026-04 | Portfolio-Chart: Investiert-Linie + Heute-Punkt |
| 1.8.0 | 2026-04 | CSV-Import mit Duplikaterkennung |
| 1.9.0 | 2026-04 | Transfer → Einbuchung / Ausbuchung |
| 1.10.0 | 2026-04 | AVCO-Methode |
| 1.10.1 | 2026-04 | Verlauf-Filter kompakter (5 Typen) |
| 1.11.0 | 2026-04 | Portfolio-Chart: echte Portfoliowert-Linie via /api/history |
| 1.12.0 | 2026-04 | Einstandspreis-Methode wählbar: FIFO + AVCO |
| 1.12.1 | 2026-04 | UI: Info-Modal mit Fragezeichen |
| 1.13.x | 2026-04 | Demo-Daten laden, Alle TX löschen (Fortschrittsbalken) |
| 1.14.x | 2026-04 | Portfolio-Chart: Tabs dynamisch, Y-Achse ab 0 |
| 1.14.6 | 2026-04 | Portfolio-Chart ALL-Tab: dynamisches Label |
| 1.15.0 | 2026-04 | Analyse: Realisierter P&L + DCA-Effizienz Chart |
| 1.15.1 | 2026-04 | Splash Screen beim App-Start |
| 1.15.2 | 2026-04 | Splash Screen auch bei DB-Laden |
| 1.15.3 | 2026-04 | Kauf-Simulator als Modal im Tools-Tab |
| 1.15.4 | 2026-04 | DCA-Rechner → Kauf-Simulator umbenannt |
| 1.15.5 | 2026-04 | DCA-Effizienz Chart: Achsenbeschriftung fix |
| 1.15.6 | 2026-04 | BTC-Kurs im Header |
| 1.16.0 | 2026-04 | Navigation: Einstellungen-Tab → Tools-Tab, Zahnrad im Header |
| 1.16.1 | 2026-04 | Kauf-Simulator: Kostenbasis-Fix |
| 1.16.2 | 2026-04 | Kauf-Simulator: Gebühren-Handling korrigiert |
| 1.16.3 | 2026-04 | safe-area-inset-top auf main |
| 1.16.4 | 2026-04 | PWA Icons deployed |
| 1.17.0 | 2026-04 | Pull-to-Refresh entfernt (iOS Konflikt) |
| 1.17.1 | 2026-05 | AGB & Datenschutz (Registrierung + Einstellungen) |
| 1.18.0 | 2026-05 | Mehrsprachigkeit DE/EN: i18n.js, Systemsprache-Erkennung, Umschalter in Einstellungen |
| 1.0(5) | 2026-06-02 | App-Store-Launch (nach 2 Apple-Ablehnungen unter 1.1.6: Trading-Vokabular → Accounting-Begriffe Acquired/Disposed/Transfer In/Out + Info-Modal) |
| 1.0.1 | 2026-06 | App-Store-Darstellung aktualisiert (Metadaten-only) |
| 1.1.0 (Build 7) | 2026-06-05 | Abo → Einmalkauf (Non-Consumable USD 14.99), KI-Tools entfernt, Paywall neu (Restore-Button), Passwort-Reset gefixt, ASC-Texte/Screenshots erneuert |
| — | 2026-06-06 | 1.1.0 von Apple akzeptiert & live. RevenueCat/ASC aufgeräumt (Abos entfernt). Marketing-Site trackoshi.com aktualisiert |

## Aktuelle Version
**1.1.0 (Build 7)** — LIVE im App Store (akzeptiert 6. Juni 2026). Aufräumen abgeschlossen.

## Geänderte Dateien in Version 1.1.0
- `src/App.jsx` (Version `1.1.0`, KI-States/Funktionen raus, Paywall neu, Passwort-Reset-URL, Onboarding-Slide 3)
- `src/i18n.js` (ai*-Keys raus, neue Paywall/Onboarding-Texte DE+EN)
- `netlify/functions/claude.js` (gelöscht)
- `netlify.toml` (`/api/claude`-Redirect entfernt)
- `ios/App/App/Info.plist` (`ITSAppUsesNonExemptEncryption = NO`)
- cyon: `passwort-reset.html` (neu)
- Git: Branch `dev`, HEAD `d9dc9b8`

## Erledigt (6. Juni 2026)
- [x] RevenueCat/ASC aufgeräumt: Abos aus Offering, vom Entitlement detacht, in ASC aus Verkauf
- [x] Marketing-Site trackoshi.com aktualisiert (KI raus, Einmalkauf, live-Status, Apple-Badge, neue Mockups, Pricing konsistent)
- [x] `dev` → `main` Merge: OBSOLET, wird NICHT gemacht (siehe Branch-Workflow unten)

## Offene Punkte (für später — Richtung A: iOS-Weiterentwicklung)
1. App Store Connect API-Key (P8) in RevenueCat-Dashboard hochladen (vollständige Produkt-Integration)
2. Hardcodierte USD-Preis-Strings in Paywall durch RevenueCat `priceString` ersetzen
3. Vollständiges Deep Linking (Custom URL Scheme / Universal Link für Supabase-Auth-Redirect zurück in iOS-App)
4. Login-Screen UX (freundlicherer Willkommenstext, aktuell nur "Anmelden")
5. "Lade…"-Indikator als sticky Floating-Toast (scrollt bei grossen iOS-Schriftgrössen weg)
6. Hero-Mockup auf trackoshi.com bei nächster GRÜNER Marktlage neu in Canva (aktuell noch altes dashboard.png mit "t"-Logo; bei BTC-Minus sieht rote Kurve schlecht aus)
7. Falls je Premium-only-Feature dazukommt: Webseiten-Pricing-Text wieder offener formulieren (aktuell "Premium hebt nur das Transaktionslimit auf")

## Mögliche Richtung B: Google Play Store
- Code ~90% wiederverwendbar: Capacitor baut denselben Web-Build für Android (`npx cap add android`). UI/Supabase/Berechnungen unverändert.
- ABER Monetarisierung eigene Baustelle: Apple-Non-Consumable funktioniert NICHT auf Android. Nötig: eigenes managed product in Google Play Console → in RevenueCat als 2. Store-Produkt ans selbe `premium`-Entitlement → RevenueCat-Android-Public-Key in App → `isNativePlatform()` auf iOS/Android-Unterscheidung erweitern.
- Zusätzlich: Google-Play-Developer-Account (einmalig 25 USD), Android-Store-Assets, Datenschutz-Deklaration, App-Signing.
- Empfehlung: erst iOS-Daten sammeln (Downloads/Käufe/Friktion), bevor Android-Aufwand investiert wird.

## Nächste mögliche Features
- [ ] PWA App-Icon: finales Icon mit echtem ₿-Symbol (Figma/Canva)
- [ ] Swipe to delete im Verlauf
- [ ] Error Boundary (weisser Bildschirm verhindern)
- [ ] Offline-Modus: letzte Preise cachen
- [ ] Sats-Anzeige (1 BTC = 100'000'000 Sats)
- [ ] Stack Progress Tracker (Ziel-BTC setzen)
- [ ] Floating/sticky "Lade..."-Indikator (scrollt bei grossen iOS-Schriftgrössen weg)
- [ ] Freundlicherer Login-Screen

## Workflow (GitHub Branches) — WICHTIG, geändert 6. Juni 2026
- **dev** → aktive Entwicklung UND Quelle für iOS-Builds (dev--trackoshi.netlify.app). Enthält Paywall + RevenueCat + 25-Transaktionen-Limit. Xcode baut aus dem Arbeitsverzeichnis (dev-Stand).
- **main** → ALTER Web-PWA-Stand VOR der Paywall, ohne Limit. Nirgends beworben/downloadbar = praktisch private Altversion.
- **KEIN Merge dev → main mehr.** Der frühere "dev testen → main spiegeln"-Workflow ist OBSOLET. dev und main sind bewusst zwei getrennte Editionen geworden (dev = iOS-App mit Paywall, main = altes Gratis-Web ohne Limit). Würde man dev → main mergen, bekäme die Web-Version das 25-Limit OHNE Kaufmöglichkeit (Kauf nur via iOS) → würde Web-Nutzer aussperren. Daher: main in Ruhe lassen.

Ablauf für iOS-Builds:
1. Änderungen auf `dev` pushen → testen (dev--trackoshi.netlify.app)
2. Vor Archive: `npm run build && npx cap sync ios`
3. Xcode: Archive → Upload → TestFlight → echtes Gerät → ASC zur Review

## Best Practices (immer einbauen)
- **Versionsnummer**: bei jeder Änderung in App.jsx mitanpassen (Patch = Bugfix, Minor = neues Feature)
- **Mehrsprachigkeit**: neue Texte immer zuerst in i18n.js (de + en), dann `t("key")` im JSX
- **netlify.toml**: Cache-Header für index.html (no-store) und /assets/* (immutable)
- **Kommentare in JSX**: immer `//` oder `/* */`, nie `<!-- -->` — sonst Build-Fehler
- **Dateien auf GitHub**: immer auf dem Mac, nie auf iPhone (iOS wandelt Anführungszeichen um)
- **JSX return mit Modals**: immer in `<>...</>` Fragment wrappen
- **exportCSV**: immer im Haupt-App-Kontext definieren (braucht currency, usdChf, eurUsd, btcUsd, btcChf)
- **Währungslogik**: Anzeige und Eingabe in gewählter Währung, Speicherung immer in CHF
- **Preise**: immer über /api/prices (Proxy), nie direkt CoinGecko
- **Supabase Constraint**: bei neuen Typen zuerst DROP, dann ADD CONSTRAINT

## Technische Hinweise
- **Netlify Build Credits**: Free Plan = 300/Monat, pro Deploy ~1–2 Credits
- **Auto-Publishing**: aktiviert auf main und dev
- **Supabase Service Role Key**: für "Konto löschen" — in Netlify als SUPABASE_SECRET_KEY hinterlegt
- **Supabase**: beide Branches teilen dieselbe Datenbank
- **SemVer**: MAJOR.MINOR.PATCH — Patch für Bugfix, Minor für neue Features
- **CoinGecko API**: liefert BTC in usd, chf und eur gleichzeitig — kein separater FX-Feed nötig
- **FIFO**: Standard-Methode, Lots in Array, shift() beim Verkauf
- **Demo-CSV**: public/demo-transaktionen.csv — 45 Transaktionen 2022–2026
- **Datenschutz**: support [at] bluebubble [dot] ch
- **Marketing-Site (trackoshi.com auf cyon)**: aktualisiert 6. Juni — KI raus, Einmalkauf, live-Status, echte App-Store-Links (`https://apps.apple.com/app/id6770056556`), offizieller weisser Apple-Badge. Screenshots-Grid = 3 Canva-Mockups (Analyse/Verlauf/Einstellungen, Cache-Buster `?v=4`). CSS-Fix: `.phone-frame img { width:100% }` (sonst Hero in Edge riesig). Bild-Cache auf cyon via `?v=`-Versionsnummer brechen (cyon ≠ Netlify-Cache-Header).

## iOS / App Store — Erfahrungswerte
- **Guideline 1.1.6**: Screenshots & UI-Vokabular werden genau geprüft. Trading-Sprache ("Kauf/Verkauf") triggert Ablehnung auch bei Tracker-Apps. Accounting-Begriffe (Acquired/Disposed/Transfer In/Out) gehen durch.
- **Screenshots**: 6,9"-Slot hochladen (1290×2796 PNG) — Apple leitet 6,5" automatisch ab. Simulator-Screenshots ggf. auf echte PNG-Maße konvertieren.
- **Code nie auf iPhone editieren**: iOS-Autokorrektur zerstört Anführungszeichen. Mac = Quelle der Wahrheit.
- **TestFlight-Käufe laufen immer in der Sandbox** — belasten nie eine echte Karte. Non-Consumable bleibt an der Apple-ID "kleben"; Erstkauf-Dialog erscheint nur bei Apple-ID, die nie gekauft hat. Premium hängt an der Apple-ID, NICHT am Supabase-Konto (überlebt Kontowechsel — korrekt).
- **IAP-Einreichung (neueres ASC-UI)**: IAP nicht mehr auf der Versionsseite anhängbar; separat "Zur Prüfung übermitteln", Apple koppelt automatisch an die nächste App-Einreichung. IAP braucht konfigurierte **Verfügbarkeit** (Länder), sonst Ablehnung beim Übermitteln. Status `MISSING_METADATA` vor Genehmigung ist normal.
- **Build-Zuweisung**: Build muss auf der Versionsseite unter "Build" hinzugefügt werden, bevor "Zur Prüfung hinzufügen" geht.
- **Export-Compliance**: `ITSAppUsesNonExemptEncryption = NO` in Info.plist eliminiert die Frage bei jedem Build.
- **Supabase Data API**: neue Tabellen im public-Schema brauchen ab 30.10.2026 explizites GRANT — nicht-dringend für bestehende Tabellen.
