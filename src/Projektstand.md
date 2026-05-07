# BTC Portfolio App — Projektstand

> **Aktuelle Version: 2.7.0** · Letzte Änderung: 2026-05

---

## Inhaltsverzeichnis
1. [Infrastruktur](#infrastruktur)
2. [App-Features](#app-features)
3. [Fachliche Dokumentation](#fachliche-dokumentation)
4. [Versionshistorie](#versionshistorie)
5. [Offene Pendenzen](#offene-pendenzen)
6. [Geplante Features](#geplante-features)
7. [Entwicklung & Workflow](#entwicklung--workflow)

---

## 1. Infrastruktur

### Stack
| Schicht | Technologie |
|---------|-------------|
| Frontend | React (JSX), Recharts |
| Backend | Netlify Functions (Node.js) |
| Datenbank | Supabase (PostgreSQL) |
| Hosting | Netlify |
| Live URL | `bb-btc-tracker.netlify.app` |
| GitHub | `95fgj7tp69-blip/btc-tracker` |

### Supabase
- **Project ID**: `xjkomserewmxktwvmoaa`
- **URL**: `https://xjkomserewmxktwvmoaa.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhqa29tc2VyZXdteGt0d3Ztb2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5NjEzNTMsImV4cCI6MjA5MjUzNzM1M30.4GVJpwwQUCwhFGgMPFFYr_H23RUbX_3TpRAYpbvy9Es`
- **Tabelle**: `transactions` (id, date, btc, chf, fee, type, note, user_id, created_at)
- **RLS**: aktiviert — jeder User sieht nur eigene Daten
- **Auth**: E-Mail + Passwort, Redirect URL auf Netlify gesetzt
- **Region**: AWS eu-west-1 (Irland) — DSGVO-konform
- **Service Role Key**: für "Konto löschen" in Netlify als `SUPABASE_SECRET_KEY` hinterlegt
- **Hinweis**: beide Branches (main + dev) teilen dieselbe Datenbank

### Supabase Constraint (erledigt auf dev + main)
```sql
ALTER TABLE transactions DROP CONSTRAINT transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check
  CHECK (type IN ('buy', 'sell', 'transfer_in', 'transfer_out'));
```

### Preis-Architektur
```
App --> /api/prices  (Netlify Function, 60s Cache)   --> CoinGecko
App --> /api/history (Netlify Function, 24h Cache)   --> CoinGecko
         --> [[YYYY-MM-DD, usdPrice], ...] für letzte 730 Tage
         --> wird auch für monatliche PriceChart-Daten verwendet
App --> /api/market  (Netlify Function, tab-abhängig) --> CoinGecko
         --> 1T: 5min Cache / 1W+: 60min Cache
         --> für MarketCard Live-Chart
App --> /api/claude  (Netlify Function)              --> Anthropic API
```
- CoinGecko liefert BTC in USD — Umrechnung in CHF/EUR via `usdChf` / `eurUsd`
- Alle CoinGecko-Calls laufen durch Proxys (kein direkter Frontend-Zugriff)
- Preise **immer** über Proxy, nie direkt CoinGecko

### Repo-Struktur
```
btc-tracker/
  src/
    App.jsx              ← Haupt-React-Komponente
    i18n.js              ← Übersetzungen DE/EN
  netlify/functions/
    transactions.js
    prices.js            ← Preis-Proxy mit 60s Cache
    history.js           ← Historische Kurse mit 24h Cache
    market.js            ← MarketCard Chart-Proxy (tab-abhängiger Cache)
    claude.js            ← Anthropic API Proxy (KI-Tools)
  public/
    manifest.json        ← PWA Manifest
    demo-transaktionen.csv  ← Demo-Daten (45 Transaktionen 2022–2026)
    icons/
      icon-512.png
      icon-192.png
      icon-180.png
  index.html, package.json, vite.config.js, netlify.toml
```

---

## 2. App-Features

### Auth & Benutzer
- [x] Login / Register / Passwort-Reset (Supabase Auth)
- [x] Passwort-Toggle (Auge-Symbol) in Login, Register und Passwort-Modal
- [x] Mehrbenutzerfähig (RLS, jeder sieht nur eigene Daten)
- [x] JWT-Token in allen API-Calls
- [x] Passwort ändern (Modal in Einstellungen)
- [x] Konto löschen (Modal mit Bestätigungstext)
- [x] AGB & Datenschutz: Checkbox bei Registrierung + Modal in Einstellungen

### UI & Navigation
- [x] Dark/Light Mode (localStorage) — Standard: Light Mode
- [x] Dark Mode kontrastreicher (Apple iOS Dark Mode Stil)
- [x] Navigation: 5 Tabs (Dashboard / Analyse / + / Verlauf / Tools)
- [x] Einstellungen via Zahnrad-Icon im Header (Modal)
- [x] Header verschlankt: nur Logo + Zahnrad + Aktualisierungszeit (kein redundanter Kurs)
- [x] Einstellungen neu strukturiert: KONTO → DARSTELLUNG → PORTFOLIO-WÄHRUNG → SEKUNDÄRKURS → EINSTANDSPREIS → SPRACHE → DATEN
- [x] Schriftgrösse wählbar S/M/L in Einstellungen (zoom-basiert, Standard M)
- [x] Onboarding: 5 Slides mit SVG-Illustrationen
- [x] Splash Screen beim App-Start (inkl. DB-Laden)
- [x] DEV-Banner (lila) auf dev--bb-btc-tracker.netlify.app
- [x] iPhone Safe-Area, Viewport-Meta
- [x] PWA: manifest.json, Icons (512/192/180px), Apple-Touch-Icon Meta-Tags

### Währung & Kurse
- [x] Live BTC-Kurs (via Netlify Proxy /api/prices, 60s Cache)
- [x] Live Wechselkurse USD/CHF und EUR/USD von CoinGecko (via Proxy)
- [x] Portfolio-Währung wählbar: CHF / EUR / USD (gespeichert in localStorage)
- [x] Sekundärkurs wählbar: Aus / CHF / EUR / USD (gespeichert in localStorage)
- [x] Primär- und Sekundärkurs in MarketCard angezeigt (gleich grosse Schrift)
- [x] Alle Anzeigen in gewählter Währung (Portfolio, Position, Markt, Break-Even, DCA)
- [x] Transaktionseingabe in gewählter Währung, Speicherung immer in CHF
- [x] MarketCard Chart-Achsen und Tooltip in gewählter Währung
- [x] PriceChart (Analyse) in gewählter Währung

### Dashboard
- [x] Reihenfolge: MarketCard zuerst, dann PortfolioCard, dann PositionCard
- [x] MarketCard: Dual-Y-Achsen (links: absoluter Kurs, rechts: % seit Periodenstart)
- [x] MarketCard: 0%-Linie (gestrichelt, = Eröffnungskurs des gewählten Zeitraums)
- [x] MarketCard: Tab-%-Änderung im Badge (nicht mehr fix 24h)
- [x] Portfolio-Chart: Investiert + Portfoliowert, gemeinsame Y-Achse ab 0
- [x] Portfolio-Chart Tabs: nur verfügbare Tabs angezeigt (1T / 7T / 30T / Alle)
- [x] Portfolio-Chart: echte Portfoliowert-Linie via /api/history
- [x] MarketCard: Live-Chart via /api/market (gecacht, tab-abhängig)

### Analyse-Tab
- [x] Kursverlauf vs. Einstand (PriceChart) — in gewählter Währung
- [x] PriceChart: Y-Achse schliesst Einstandspreis immer ein
- [x] Break-Even Analyse (BreakEvenCard)
- [x] Realisierter Gewinn/Verlust
- [x] DCA-Effizienz Chart: Ø Kaufpreis pro Jahr
- [x] Chart-Achsen gerundet (niceRound — keine krummen Zahlen)

### Transaktionen & Verlauf
- [x] Typen: Kauf / Verkauf / Einbuchung / Ausbuchung
- [x] Einbuchung (transfer_in): BTC +, Einstandspreis unverändert
- [x] Ausbuchung (transfer_out): BTC −, Einstandspreis unverändert
- [x] Verlauf-Filter: Alle / Kauf / Verkauf / Einbuchung / Ausbuchung
- [x] Swipe-to-delete (iOS-Stil, Halb-Swipe mit Bestätigungs-Dialog)

### Einstandspreis-Methoden
- [x] FIFO — First In, First Out (Standard, Parqet-kompatibel)
- [x] AVCO — Weighted Average Cost
- [x] Methode wählbar in Einstellungen (localStorage)
- [x] Info-Modal zur Erklärung der Methoden (Fragezeichen-Icon)

### Tools-Tab
- [x] Kauf-Simulator (Bottom-Sheet Modal): Einstandspreis bei Nachkauf berechnen
- [x] Szenario-Rechner: Portfoliowert bei Ziel-BTC-Kurs (intern, keine API)
  - Zielkurs in Primär- oder Sekundärwährung eingeben
  - Zeithorizont: 6M / 1J / 2J / 5J / 10J
  - Sparplan: Kein / Wöchentlich / Monatlich
  - Zeigt: BTC-Bestand, Portfoliowert, Investiert total, Gewinn/Verlust
- [x] KI-Tools: Portfolio analysieren (Claude API)
- [x] KI-Tools: Markt-Kommentar (Claude API)

### Daten
- [x] CSV-Export in gewählter Währung + Spalte "Portfoliowert heute"
- [x] CSV-Import mit Duplikaterkennung (Einstellungen → DATEN)
- [x] Demo-Daten laden (Einstellungen → DATEN)
- [x] Alle Transaktionen löschen (mit Fortschrittsbalken, Konto bleibt erhalten)

### Mehrsprachigkeit
- [x] DE/EN: i18n.js, Systemsprache-Erkennung, Umschalter in Einstellungen
- [x] Sprach-Button: 🇩🇪 Deutsch / 🇬🇧 English

---

## 3. Fachliche Dokumentation

### Transaktions-Typen
| Typ | Label DE | Label EN | Farbe | Wirkung |
|-----|----------|----------|-------|---------|
| buy | Kauf | Buy | Grün | BTC +, Investiert +, Einstand neu |
| sell | Verkauf | Sell | Rot | BTC −, Investiert − (Erlös) |
| transfer_in | Einbuchung | Transfer In | Blau | BTC +, Einstand unverändert |
| transfer_out | Ausbuchung | Transfer Out | Orange | BTC −, Einstand unverändert |

### Finanzberechnungen
```js
const totalBtc = buyBtc - sellBtc + transferInBtc - transferOutBtc
const buyInvested = sum(buy.chf + buy.fee)       // immer in CHF
const sellProceeds = sum(sell.chf - sell.fee)
const totalInvested = buyInvested - sellProceeds
const pnlChf = portfolioChf - totalInvested
const pnlPct = (pnlChf / buyInvested) * 100

// Anzeige-Umrechnung (rawPriceData immer in USD)
const toDisplay = (chfAmount, currency, usdChf, eurUsd) => {
  if (currency === "CHF") return chfAmount;
  if (currency === "USD") return chfAmount / usdChf;
  if (currency === "EUR") return (chfAmount / usdChf) * eurUsd;
}

// Chart-Preisumrechnung (historische Daten in USD)
const convertPrice = (usdPrice) => {
  if (currency === "CHF") return usdPrice * usdChf;
  if (currency === "EUR") return usdPrice * eurUsd;
  return usdPrice; // USD
}
```

### Einstandspreis-Methoden

**FIFO — First In, First Out (Standard)**
- Jeder Kauf = eigenes Lot; beim Verkauf älteste Lots zuerst (`shift()`)
- Kompatibel mit Parqet

**AVCO — Weighted Average Cost**
- Bei Kauf: `avco = (poolBtc * avco + kosten) / (poolBtc + btc)`
- Bei Verkauf / Transfer: AVCO unverändert

### Achsen-Rundung
```js
// Rundet auf lesbare Achsenwerte: 81'234 → 80'000, 9'876 → 10'000
const niceRound = (v) => {
  if (!v || v === 0) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(Math.abs(v))) - 1);
  return Math.round(v / mag) * mag;
};
```

### CSV Import/Export Format
```
Datum,Typ,BTC,CHF Betrag,CHF Gebühren,Notiz
2024-01-15,buy,0.25,9875,15,DCA Start
2024-05-10,sell,0.1,7820,10,Teilgewinn
2026-02-02,transfer_in,0.00485224,0,0,Einbuchung
2026-03-17,transfer_out,0.00019247,0,0,Ausbuchung
```
- Import: Einstellungen → DATEN → Import
- Duplikaterkennung: Datum + Typ + BTC
- Rückwärtskompatibel: `type=transfer` + `note=TransferIn/Out` wird gemappt

### Mehrsprachigkeit
- **Datei**: `src/i18n.js` — alle sichtbaren Texte in DE + EN
- **Erkennung beim ersten Start**: `navigator.language` → Deutsch (de, de-CH, de-AT …) → DE, sonst EN
- **Danach**: localStorage `"language"` hat Vorrang
- **Umschalten**: Einstellungen → SPRACHE → DE 🇩🇪 / EN 🇬🇧
- **Neue Features**: Texte immer zuerst in i18n.js (de + en), dann `t("key")` im JSX
- **Test**: App auf EN stellen und durchklicken — alles noch Deutsch = fehlt in i18n.js

---

## 4. Versionshistorie

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
| 1.18.0 | 2026-05 | Mehrsprachigkeit DE/EN: i18n.js, Systemsprache-Erkennung |
| 2.1.1 | 2026-05 | Passwort-Toggle (Auge) in Login + Passwort-Modal |
| 2.1.2 | 2026-05 | PriceChart + Portfolio-Chart: CHF/EUR Umrechnung korrigiert |
| 2.1.3 | 2026-05 | Header-Badge: dynamisches Währungs-Label (CHF/EUR/USD 24h) |
| 2.2.0 | 2026-05 | Sekundärkurs im Header (wählbar, Standard: Aus) |
| 2.2.1 | 2026-05 | Chart-Achsen gerundet (niceRound) |
| 2.2.2 | 2026-05 | MarketCard: Achsen + Tooltip in gewählter Währung |
| 2.2.3 | 2026-05 | i18n: Sekundärkurs-Texte DE/EN, hardcodierte Strings entfernt |
| 2.2.4 | 2026-05 | Gross-/Kleinschreibung: dca.chartTitle statt .toUpperCase() |
| 2.2.4 | 2026-05 | Sprach-Button: 🇨🇭 → 🇩🇪 |
| 2.3.0 | 2026-05 | Swipe-to-delete im Verlauf (iOS-Stil, Halb-Swipe) |
| 2.3.1 | 2026-05 | Alle CoinGecko-Calls via Proxy — neue Netlify Function market.js |
| 2.4.0 | 2026-05 | Kontrast verbessert (DARK + LIGHT), Schriftgrösse S/M/L in Einstellungen |
| 2.4.1 | 2026-05 | Einstellungen neu strukturiert, zoom-Modal-Fix, Schriftgrösse in DARSTELLUNG integriert |
| 2.5.0 | 2026-05 | MarketCard: Dual-Y-Achsen, Tab-%-Änderung im Badge |
| 2.5.1 | 2026-05 | PriceChart: Einstandspreis-Linie immer sichtbar |
| 2.5.2 | 2026-05 | PriceChart: Y-Achse schliesst Einstandspreis ein |
| 2.5.5 | 2026-05 | MarketCard: 0%-Linie via ReferenceLine (korrekte Positionierung) |
| 2.5.6 | 2026-05 | Dashboard: MarketCard nach oben verschoben |
| 2.6.0 | 2026-05 | Header verschlankt, Primär- + Sekundärkurs in MarketCard |
| 2.7.0 | 2026-05 | Szenario-Rechner im Tools-Tab (Zielkurs, Zeithorizont, Sparplan) |

### Geänderte Dateien in Version 2.x
- `src/App.jsx`
- `src/i18n.js`
- `netlify/functions/market.js` *(neu)*
- `netlify.toml` *(+/api/market Redirect)*

---

## 5. Offene Pendenzen

### Technische Schuld

| # | Bereich | Problem | Aufwand |
|---|---------|---------|---------|
| 1 | BreakEvenCard / RealizedPnl / DcaChart | Hardcodierte `language === "en" ? ... : ...` Strings — noch nicht in i18n.js | Mittel |

### UX-Feedback (Mai 2026) — Erledigt ✅

| # | Bereich | Beschreibung | Status |
|---|---------|--------------|--------|
| 2 | MarketCard | %-Änderung auf Tab-Zeitraum | ✅ v2.5.0 |
| 3 | MarketCard | Dual-Y-Achsen + 0%-Linie | ✅ v2.5.0 / v2.5.5 |
| 4 | Allgemein | Kontrast verbessert | ✅ v2.4.0 |
| 5 | Einstellungen | Schriftgrösse S/M/L | ✅ v2.4.0 |
| 6 | Allgemein | CHF/USD gleiche Kurvenform | ℹ️ Korrekt so — historische Wechselkurse nicht kostenlos |
| 7 | Allgemein | Landscape-Modus | ℹ️ Nicht umgesetzt — zu hoher Aufwand |

---

## 6. Geplante Features / App Store Roadmap

### Code — noch offen
| Priorität | Feature |
|-----------|---------|
| 🔴 Hoch | API-URLs absolut (`VITE_API_BASE`) — nötig für Capacitor/Native |
| 🔴 Hoch | `vite.config.js`: `base: './'` — nötig für Capacitor |
| 🔴 Hoch | Capacitor Setup (iOS + Android) |
| 🟡 Mittel | Error Boundary (weisser Bildschirm verhindern) |
| 🟡 Mittel | Offline-Modus: letzte Preise cachen |
| 🟢 Gering | Sats-Anzeige (1 BTC = 100'000'000 Sats) |
| 🟢 Gering | Stack Progress Tracker (Ziel-BTC setzen) |
| 🟢 Gering | Haptic Feedback bei Transaktionen |
| 🟢 Gering | Biometrie-Login (Face ID / Touch ID) |

### Assets & Store
| # | Was |
|---|-----|
| 1 | App Icon finalisieren — 1024×1024px PNG, kein Alpha (iOS) |
| 2 | Screenshots iPhone 6.7" + 6.5" |
| 3 | App-Beschreibung DE + EN (max. 4000 Zeichen) |
| 4 | Kurzbeschreibung DE + EN (max. 80 Zeichen) |
| 5 | Keywords ASO |
| 6 | Apple Developer Account (USD 99/Jahr) |
| 7 | App Store Connect: App anlegen, Bundle ID registrieren |

---

## 7. Entwicklung & Workflow

### GitHub Branches
| Branch | Umgebung | URL |
|--------|----------|-----|
| `main` | Produktiv | bb-btc-tracker.netlify.app |
| `dev` | Test | dev--bb-btc-tracker.netlify.app |

**Ablauf:**
1. Neue Dateien auf `dev` pushen → testen
2. Wenn ok → gleiche Dateien auf `main` pushen → live

### Best Practices
- **Versionsnummer**: bei jeder Änderung in `App.jsx` mitanpassen (SemVer: MAJOR.MINOR.PATCH)
- **Mehrsprachigkeit**: neue Texte immer zuerst in `i18n.js` (de + en), dann `t("key")` im JSX — nie `language === "en" ? ... : ...` direkt im JSX
- **netlify.toml**: Cache-Header für `index.html` (no-store) und `/assets/*` (immutable) — neue Functions immer mit Redirect eintragen
- **Kommentare in JSX**: immer `//` oder `/* */`, nie `<!-- -->` — sonst Build-Fehler
- **Dateien auf GitHub**: immer auf dem Mac, nie auf iPhone (iOS wandelt Anführungszeichen um)
- **JSX return mit Modals**: immer in `<>...</>` Fragment wrappen
- **exportCSV**: immer im Haupt-App-Kontext definieren (braucht `currency`, `usdChf`, `eurUsd`, `btcUsd`, `btcChf`)
- **Währungslogik**: Anzeige und Eingabe in gewählter Währung, Speicherung immer in CHF
- **Preisdaten**: `rawPriceData` und `historicChartData` sind immer in **USD** — Umrechnung beim Rendern via `convertPrice()` oder `toDisplay()`
- **Preise**: immer über Proxy (`/api/prices`, `/api/history`, `/api/market`), nie direkt CoinGecko
- **Supabase Constraint**: bei neuen Typen zuerst DROP, dann ADD CONSTRAINT

### Technische Hinweise
- **Netlify Build Credits**: Free Plan = 300/Monat, pro Deploy ~1–2 Credits
- **Auto-Publishing**: aktiviert auf main und dev
- **Supabase**: beide Branches teilen dieselbe Datenbank
- **CoinGecko Skalierung**: alle Calls gecacht via Proxy — skaliert auf beliebig viele User
- **Datenschutz-Kontakt**: support [at] bluebubble [dot] ch
- **Anthropic API Key**: als `ANTHROPIC_API_KEY` in Netlify hinterlegt
