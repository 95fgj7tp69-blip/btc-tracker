# BTC Portfolio App — Projektstand

> **Aktuelle Version: 1.18.0** · Letzte Änderung: 2026-05

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
App --> /api/prices  (Netlify Function, 60s Cache)  --> CoinGecko
App --> /api/history (Netlify Function, 24h Cache)  --> CoinGecko
         --> [[YYYY-MM-DD, usdPrice], ...] für letzte 730 Tage
```
- CoinGecko liefert BTC in USD, CHF und EUR gleichzeitig — kein separater FX-Feed nötig
- Preise **immer** über `/api/prices` (Proxy), nie direkt CoinGecko

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
- [x] BTC-Kurs im Header (Preis + 24h-Änderung, in gewählter Währung)
- [x] Onboarding: 5 Slides mit SVG-Illustrationen
- [x] Splash Screen beim App-Start (inkl. DB-Laden)
- [x] DEV-Banner (lila) auf dev--bb-btc-tracker.netlify.app
- [x] iPhone Safe-Area, Viewport-Meta
- [x] PWA: manifest.json, Icons (512/192/180px), Apple-Touch-Icon Meta-Tags

### Währung & Kurse
- [x] Live BTC-Kurs (via Netlify Proxy /api/prices, 60s Cache)
- [x] Live Wechselkurse USD/CHF und EUR/USD von CoinGecko (via Proxy)
- [x] Portfolio-Währung wählbar: CHF / EUR / USD (gespeichert in localStorage)
- [x] Alle Anzeigen in gewählter Währung (Portfolio, Position, Markt, Break-Even, DCA)
- [x] Transaktionseingabe in gewählter Währung, Speicherung immer in CHF

### Dashboard
- [x] PortfolioCard, PositionCard, MarketCard
- [x] Portfolio-Chart: Investiert + Portfoliowert, gemeinsame Y-Achse ab 0
- [x] Portfolio-Chart Tabs: nur verfügbare Tabs angezeigt (1T / 7T / 30T / Alle)
- [x] Portfolio-Chart: echte Portfoliowert-Linie via /api/history

### Analyse-Tab
- [x] Kursverlauf vs. Einstand (PriceChart)
- [x] Break-Even Analyse (BreakEvenCard)
- [x] Realisierter Gewinn/Verlust
- [x] DCA-Effizienz Chart: Ø Kaufpreis pro Jahr

### Transaktionen & Verlauf
- [x] Typen: Kauf / Verkauf / Einbuchung / Ausbuchung
- [x] Einbuchung (transfer_in): BTC +, Einstandspreis unverändert
- [x] Ausbuchung (transfer_out): BTC −, Einstandspreis unverändert
- [x] Verlauf-Filter: Alle / Kauf / Verkauf / Einbuchung / Ausbuchung

### Einstandspreis-Methoden
- [x] FIFO — First In, First Out (Standard, Parqet-kompatibel)
- [x] AVCO — Weighted Average Cost
- [x] Methode wählbar in Einstellungen (localStorage)
- [x] Info-Modal zur Erklärung der Methoden (Fragezeichen-Icon)

### Tools-Tab
- [x] Kauf-Simulator (Bottom-Sheet Modal): Einstandspreis bei Nachkauf berechnen

### Daten
- [x] CSV-Export in gewählter Währung + Spalte "Portfoliowert heute"
- [x] CSV-Import mit Duplikaterkennung (Einstellungen → DATEN)
- [x] Demo-Daten laden (Einstellungen → DATEN)
- [x] Alle Transaktionen löschen (mit Fortschrittsbalken, Konto bleibt erhalten)

### Mehrsprachigkeit
- [x] DE/EN: i18n.js, Systemsprache-Erkennung, Umschalter in Einstellungen

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

// Anzeige-Umrechnung
const toDisplay = (chfAmount, currency, usdChf, eurUsd) => {
  if (currency === "CHF") return chfAmount;
  if (currency === "USD") return chfAmount / usdChf;
  if (currency === "EUR") return (chfAmount / usdChf) * eurUsd;
}
```

### Einstandspreis-Methoden

**FIFO — First In, First Out (Standard)**
- Jeder Kauf = eigenes Lot; beim Verkauf älteste Lots zuerst (`shift()`)
- Kompatibel mit Parqet

**AVCO — Weighted Average Cost**
- Bei Kauf: `avco = (poolBtc * avco + kosten) / (poolBtc + btc)`
- Bei Verkauf / Transfer: AVCO unverändert

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
- **Umschalten**: Einstellungen → SPRACHE → DE / EN
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
| 1.18.0 | 2026-05 | Mehrsprachigkeit DE/EN: i18n.js, Systemsprache-Erkennung, Umschalter in Einstellungen |

### Geänderte Dateien in Version 1.18.x
- `src/App.jsx`
- `src/i18n.js` *(neu)*

---

## 5. Offene Pendenzen

### Bugs & UX-Probleme (aus User-Feedback v1.18.0)

| # | Priorität | Bereich | Problem | Aufwand |
|---|-----------|---------|---------|---------|
| 1 | 🔴 Hoch | Login / Registrierung | Kein Passwort-Toggle (Auge-Symbol) — Tippfehler beim einmaligen Eingeben nicht erkennbar | Gering |
| 2 | 🔴 Hoch | Analyse / Kursverlauf | Historische Kurskurve in USD, obwohl Währung CHF gewählt — Umrechnung via `usdChf` fehlt | Mittel |
| 3 | 🟡 Mittel | Header / 24h-Badge | Unklar ob sich die %-Änderung auf CHF oder USD bezieht — Währungs-Label ergänzen | Gering |
| 4 | 🟡 Mittel | Charts (alle) | Achsenwerte nicht gerundet (z.B. 81'234 statt 80'000, 12:24 statt 12:00) — nice ticks via `tickFormatter` | Mittel |
| 5 | 🟢 Gering | Allgemein / Design | Inkonsistente Gross-/Kleinschreibung prüfen (CAPS-Labels vs. normale Texte) | Gering |

---

## 6. Geplante Features

| Priorität | Feature |
|-----------|---------|
| — | PWA App-Icon: finales Icon mit echtem ₿-Symbol (Figma/Canva) |
| — | Swipe to delete im Verlauf |
| — | Error Boundary (weisser Bildschirm verhindern) |
| — | Offline-Modus: letzte Preise cachen |
| — | Sats-Anzeige (1 BTC = 100'000'000 Sats) |
| — | Stack Progress Tracker (Ziel-BTC setzen) |
| — | Claude API im Tools-Tab (Portfolio-Analyse, Markt-Kommentar) |
| — | App-Name & Branding Due-Diligence |

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
- **Versionsnummer**: bei jeder Änderung in `App.jsx` mitanpassen (Patch = Bugfix, Minor = neues Feature, SemVer: MAJOR.MINOR.PATCH)
- **Mehrsprachigkeit**: neue Texte immer zuerst in `i18n.js` (de + en), dann `t("key")` im JSX
- **netlify.toml**: Cache-Header für `index.html` (no-store) und `/assets/*` (immutable)
- **Kommentare in JSX**: immer `//` oder `/* */`, nie `<!-- -->` — sonst Build-Fehler
- **Dateien auf GitHub**: immer auf dem Mac, nie auf iPhone (iOS wandelt Anführungszeichen um)
- **JSX return mit Modals**: immer in `<>...</>` Fragment wrappen
- **exportCSV**: immer im Haupt-App-Kontext definieren (braucht `currency`, `usdChf`, `eurUsd`, `btcUsd`, `btcChf`)
- **Währungslogik**: Anzeige und Eingabe in gewählter Währung, Speicherung immer in CHF
- **Preise**: immer über `/api/prices` (Proxy), nie direkt CoinGecko
- **Supabase Constraint**: bei neuen Typen zuerst DROP, dann ADD CONSTRAINT

### Technische Hinweise
- **Netlify Build Credits**: Free Plan = 300/Monat, pro Deploy ~1–2 Credits
- **Auto-Publishing**: aktiviert auf main und dev
- **Datenschutz-Kontakt**: support [at] bluebubble [dot] ch
