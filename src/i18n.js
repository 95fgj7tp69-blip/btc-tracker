// ── i18n.js — Trackoshi ──────────────────────────────────────────────────────
// Alle sichtbaren Texte der App in DE und EN.
// Verwendung: import { translations, tr } from "./i18n";
//             const t = tr(translations, language);
//             <span>{t("nav.verlauf")}</span>

export const translations = {
  de: {
    // ── Navigation ──────────────────────────────────────────────────────────────
    nav: {
      dashboard:    "Dashboard",
      analyse:      "Analyse",
      verlauf:      "Verlauf",
      tools:        "Tools",
    },

    // ── Header ──────────────────────────────────────────────────────────────────
    header: {
      portfolio:       "Trackoshi BTC",
      aktualisiere:    "Aktualisiere...",
      aktualisiert:    "Aktualisiert",
    },

    // ── Auth Screen ─────────────────────────────────────────────────────────────
    auth: {
      tagline:          "Bitcoin Portfolio Tracker",
      login:            "Anmelden",
      register:         "Konto erstellen",
      reset:            "Passwort zurücksetzen",
      btnLogin:         "Anmelden",
      btnRegister:      "Registrieren",
      btnReset:         "Link senden",
      email:            "E-MAIL",
      emailPlaceholder: "name@beispiel.ch",
      password:         "PASSWORT",
      passwordPlaceholder: "••••••••",
      passwordRegisterPlaceholder: "Mindestens 6 Zeichen",
      agbText:          "Ich akzeptiere die",
      agbLink:          "AGB",
      andThe:           "und die",
      privacyLink:      "Datenschutzerklärung",
      loading:          "Bitte warten...",
      forgotPassword:   "Passwort vergessen?",
      noAccount:        "Noch kein Konto? Registrieren",
      backToLogin:      "← Zurück zur Anmeldung",
      confirmationSent: "Bestätigungsmail gesendet! Bitte E-Mail prüfen.",
      resetSent:        "Passwort-Reset E-Mail gesendet!",
      fillAll:          "Bitte alle Felder ausfüllen.",
      acceptAgb:        "Bitte AGB und Datenschutzerklärung akzeptieren.",
      passwordTooShort: "Passwort muss mindestens 6 Zeichen haben.",
      agbTitle:         "AGB & Datenschutz",
      close:            "Schliessen",
    },

    // ── Portfolio Card ──────────────────────────────────────────────────────────
    portfolio: {
      gesamtwert:   "Gesamtwert",
      seitKauf:     "seit Kauf",
      gewinn:       "Gewinn",
      verlust:      "Verlust",
      investiert:   "Investiert",
      portfoliowert: "Portfoliowert",
      heute:        "Heute",
    },

    // ── Position Card ───────────────────────────────────────────────────────────
    position: {
      title:          "Deine Position",
      bestand:        "Bestand",
      investiert:     "Investiert",
      einstandspreis: "Einstandspreis",
      proBtc:         "pro BTC",
    },

    // ── Market Card ─────────────────────────────────────────────────────────────
    market: {
      lade:    "Lade...",
      fearGreedLabel: "Fear & Greed",
      fearGreedDaysAgo: "T zuvor",
      fearGreedExtremeAngst: "Extreme Angst",
      fearGreedAngst: "Angst",
      fearGreedNeutral: "Neutral",
      fearGreedGier: "Gier",
      fearGreedExtremeGier: "Extreme Gier",
    },

    // ── Price Chart ─────────────────────────────────────────────────────────────
    priceChart: {
      title:          "Kursverlauf vs. Einstand",
      einstand:       "Einstand",
      kauf:           "Kauf",
      fingerHint:     "Finger ziehen zum Ablesen",
    },

    // ── Break-Even Card ─────────────────────────────────────────────────────────
    breakEven: {
      title:       "Break-even Analyse",
      aktuellerKurs: "Aktueller Kurs",
      einstandspreis: "Einstandspreis",
      differenz:    "Differenz",
      breakEvenAt:  "Break-Even bei",
      imGewinn:     "Im Gewinn",
      imVerlust:    "Im Verlust",
      nochNoetig:   "noch nötig",
      bereits:      "bereits",
      ueber:        "über Einstand",
    },

    // ── Realized PnL Card ───────────────────────────────────────────────────────
    realizedPnl: {
      title:         "Realisierter Gewinn/Verlust",
      keinVerkauf:   "Noch keine Verkäufe erfasst.",
      gesamt:        "Gesamt",
      transaktionen: "Transaktionen",
      gewinn:        "Gewinn",
      verlust:       "Verlust",
    },

    // ── DCA Efficiency Chart ────────────────────────────────────────────────────
    dcaChart: {
      title:         "DCA-EFFIZIENZ",
      keineDaten:    "Noch keine Daten.",
    },

    // ── DCA Calculator ──────────────────────────────────────────────────────────
    dca: {
      title:           "Einstandsrechner",
      chartTitle:      "EINSTANDSRECHNER",
      betrag:          "Betrag",
      berechnen:       "Berechnen",
      neuerEinstand:   "Neuer Einstandspreis",
      neueBtc:         "Neue BTC",
      neuesInvestiert: "Neu investiert",
      close:           "Schliessen",
      einstandBerechnen: "Neuen Einstandspreis beim Aufstocken berechnen",
    },

    // ── Verlauf ─────────────────────────────────────────────────────────────────
    verlauf: {
      alle:              "Alle",
      keineTx:           "Keine Transaktionen",
      csvExportTitle:    "CSV exportieren",
      gebuehr:           "Geb.",
    },

    // ── Transaction Types ───────────────────────────────────────────────────────
    txType: {
      buy:          "Erworben",
      sell:         "Veräussert",
      transfer_in:  "Einbuchen",
      transfer_out: "Ausbuchen",
    },

    // ── Transaction Modal ───────────────────────────────────────────────────────
    txModal: {
      titelNeu:        "Transaktion erfassen",
      praeambel:       "Trage eine bereits getätigte Bitcoin-Transaktion in dein Portfolio ein. Trackoshi führt keine Käufe oder Verkäufe aus.",
      titelEdit:       "Transaktion bearbeiten",
      datum:           "DATUM",
      typ:             "TYP",
      betrag:          "BETRAG",
      btcMenge:        "BTC-MENGE",
      gebuehr:         "GEBÜHR",
      notiz:           "NOTIZ",
      notizPlaceholder: "Optional",
      preisPro:        "Preis pro BTC",
      abbrechen:       "Abbrechen",
      speichern:       "Speichern",
      speichernLaed:   "Wird gespeichert...",
      typErklaerungLink:        "Was bedeuten diese?",
      typErklaerungTitel:       "Transaktions-Typen erklärt",
      typErklaerungSchliessen:  "Verstanden",
      typErklaerungErworben:    "**Erworben** — Du hast Bitcoin gekauft (Kaufpreis und Gebühren beeinflussen deinen Einstandspreis).",
      typErklaerungVeraeussert: "**Veräussert** — Du hast Bitcoin verkauft (realisierter Gewinn oder Verlust wird berechnet).",
      typErklaerungEinbuchen:   "**Einbuchen** — Du hast Bitcoin auf deine Wallet erhalten, ohne Kauf (z.B. Transfer von einer anderen Wallet). Bestand erhöht sich, Einstandspreis bleibt unverändert.",
      typErklaerungAusbuchen:   "**Ausbuchen** — Du hast Bitcoin aus deiner Wallet entnommen, ohne Verkauf. Bestand verringert sich, Einstandspreis bleibt unverändert.",
      typErklaerungFooter:      "Trackoshi führt selbst keine Käufe oder Verkäufe aus. Du erfasst hier nur Transaktionen, die du bereits getätigt hast.",
      validierung: {
        btcRequired:   "BTC-Menge eingeben",
        betragRequired: "Betrag eingeben",
        datumRequired: "Datum wählen",
      },
    },

    // ── Delete Confirm Modal ────────────────────────────────────────────────────
    deleteModal: {
      title:         "Transaktion löschen?",
      irreversible:  "Diese Aktion kann nicht rückgängig gemacht werden.",
      abbrechen:     "Abbrechen",
      loeschen:      "Löschen",
    },

    // ── Settings ────────────────────────────────────────────────────────────────
    settings: {
      title:            "Einstellungen",
      close:            "Schliessen",

      konto:            "KONTO",
      eingeloggtAls:    "Eingeloggt als",
      passwortAendern:  "Passwort ändern",
      abmelden:         "Abmelden",

      portfolioWaehrung:    "PORTFOLIO-WÄHRUNG",
      portfolioWaehrungHint: "Alle Beträge werden in dieser Währung angezeigt und erfasst",

      sekundaerkurs:        "SEKUNDÄRKURS",
      sekundaerkursHint:    "Zweiten Kurs im Header anzeigen",
      sekundaerkursAus:     "Aus",
      fearGreedHint:        "Fear & Greed Index im Dashboard anzeigen",
      fearGreedAn:          "An",
      marktChart:           "Markt-Chart",
      marktChartHint:       "BTC-Kurschart anzeigen",
      positionCard:         "Position",
      positionCardHint:     "BTC Bestand & Einstandspreis anzeigen",
      anzeigesprache:       "Anzeigesprache",

      einstandsMethode:     "EINSTANDSPREIS-METHODE",

      darstellung:      "Darstellung",
      dashboard:        "Dashboard",
      darkMode:         "Dark Mode",
      lightMode:        "Light Mode",
      darkModeAktiv:    "Dunkles Design aktiv",
      lightModeAktiv:   "Helles Design aktiv",

      sprache:          "SPRACHE",

      daten:            "DATEN",
      importieren:      "Transaktionen importieren",
      importierenHint:  "CSV-Datei im App-Format",
      importBtn:        "↑ Import",
      importLaedt:      "Lädt...",
      demoLaden:        "Demo-Daten laden",
      demoLadenHint:    "Beispiel-Transaktionen importieren",
      demoLadenBtn:     "Laden",
      alleLoeschen:     "Alle Transaktionen löschen",
      alleLoeschenHint: "Konto bleibt erhalten",
      alleLoeschenBtn:  "Löschen",
      importiert:       "importiert",
      uebersprungen:    "übersprungen",
      fehler:           "Fehler",

      appInfo:          "APP INFO",
      version:          "Version",
      datenbank:        "Datenbank",
      kursApi:          "Kurs-API",
      onboardingReset:  "Einführung nochmals zeigen",

      rechtliches:      "RECHTLICHES",
      agb:              "AGB",
      datenschutz:      "Datenschutzerklärung",
      agbTitle:         "AGB & Datenschutz",

      kontoLoeschenSection: "KONTO LÖSCHEN",
      kontoLoeschen:    "Konto löschen",
    },

    // ── Password Modal ──────────────────────────────────────────────────────────
    pwModal: {
      title:          "Passwort ändern",
      neuesPasswort:  "NEUES PASSWORT",
      bestaetigen:    "PASSWORT BESTÄTIGEN",
      placeholder:    "Mindestens 6 Zeichen",
      placeholderRepeat: "Wiederholen",
      nichtUebereinstimmend: "Passwörter stimmen nicht überein.",
      zuKurz:         "Mindestens 6 Zeichen erforderlich.",
      speichern:      "Speichern",
      speichernLaed:  "Wird gespeichert...",
      erfolg:         "✓ Passwort erfolgreich geändert",
      abbrechen:      "Abbrechen",
    },

    // ── Delete Account Modal ────────────────────────────────────────────────────
    deleteAccount: {
      title:          "Konto löschen?",
      beschreibung:   "Alle Transaktionen und Kontodaten werden unwiderruflich gelöscht.",
      warnung:        "Diese Aktion kann nicht rückgängig gemacht werden.",
      hinweis:        "Tippe",
      hinweisWort:    "LÖSCHEN",
      hinweisRest:    "zur Bestätigung",
      placeholder:    "LÖSCHEN",
      confirmWord:    "LÖSCHEN",
      abbrechen:      "Abbrechen",
      loeschen:       "Konto löschen",
      loeschenLaed:   "Wird gelöscht...",
      fehler:         "Fehler beim Löschen",
    },

    // ── Clear Data Modal ────────────────────────────────────────────────────────
    clearData: {
      title:          "Alle Transaktionen löschen?",
      beschreibung:   "Alle erfassten Transaktionen werden unwiderruflich gelöscht. Dein Konto bleibt bestehen.",
      warnung:        "Diese Aktion kann nicht rückgängig gemacht werden.",
      hinweis:        "Tippe",
      hinweisWort:    "LÖSCHEN",
      hinweisRest:    "zur Bestätigung",
      placeholder:    "LÖSCHEN",
      confirmWord:    "LÖSCHEN",
      abbrechen:      "Abbrechen",
      loeschen:       "Alle löschen",
      loeschenLaed:   "Wird gelöscht...",
    },

    // ── Einstandspreis-Info Modal ───────────────────────────────────────────────
    costInfo: {
      title:      "Einstandspreis-Methode",
      fifoTitle:  "FIFO – First In, First Out",
      fifoText:   "Die zuerst gekauften BTC gelten als zuerst verkauft. Jeder Kauf wird als einzelnes Lot gespeichert. Beim Verkauf werden die ältesten Lots zuerst aufgebraucht. Der verbleibende Einstandspreis entspricht den neueren, oft teureren Käufen.",
      avcoTitle:  "AVCO – Weighted Average Cost",
      avcoText:   "Bei jedem Kauf wird der gewichtete Durchschnittspreis aller BTC neu berechnet. Verkäufe verändern den Einstandspreis nicht, nur den Bestand. Alle gehaltenen BTC haben immer denselben Einstandspreis.",
      close:      "Schliessen",
    },

    // ── Datenschutz ─────────────────────────────────────────────────────────────
    privacy: {
      title: "Datenschutzerklärung",
      sections: [
        { title: "Was gespeichert wird", text: "Deine E-Mail-Adresse (für Login) sowie deine erfassten Transaktionen: Datum, BTC-Menge, Betrag, Gebühren und Notiz." },
        { title: "Wo", text: "Alle Daten werden verschlüsselt in der EU gespeichert — auf AWS-Servern in Irland (eu-west-1), betrieben über Supabase." },
        { title: "Wer hat Zugriff", text: "Nur du. Dank Row-Level Security sieht ausschliesslich dein Account deine Daten." },
        { title: "Löschen", text: "Du kannst dein Konto und alle Daten jederzeit unter Einstellungen → Konto löschen vollständig entfernen." },
        { title: "Kontakt", text: "support [at] bluebubble [dot] ch" },
      ],
      close: "Schliessen",
    },

    // ── Onboarding ──────────────────────────────────────────────────────────────
    onboarding: {
      ueberspringen:    "Überspringen",
      weiter:           "Weiter →",
      loslegen:         "Loslegen 🚀",
      datenschutzLink:  "Vollständige Datenschutzerklärung lesen",
      datenGehoeren:    "Deine Daten gehören dir.",
      slides: [
        {
          title: "Dein BTC-Portfolio.\nAuf einen Blick.",
          text:  "Dein persönlicher Bitcoin-Tracker in CHF, EUR oder USD. Erfasse deine Transaktionen und behalte den Überblick — ohne Handel, ohne Wallet-Verbindung.",
        },
        {
          title: "Dashboard,\ndas alles zeigt.",
          text:  "Live BTC-Kurs, dein Portfolio, Fear & Greed Index — alles auf einer Seite, immer aktuell.",
        },
        {
          title: "Analyse, die\nehrlich ist.",
          text:  "Break-even, realisierter Gewinn, DCA-Effizienz — sieh genau wo du stehst.",
        },
        {
          title: "Tools, die\nrechnen.",
          text:  "Einstandsrechner und Szenario-Rechner — plane deine Strategie und sieh, wie sich dein Portfolio entwickeln kann.",
        },
        {
          title: "Sicher.\nPrivat. Deins.",
          text:  "Alle Daten werden sicher in der EU gespeichert. CSV-Export, vollständige Kontrolle, jederzeit löschbar.",
        },
      ],
    },

    // ── Tools ───────────────────────────────────────────────────────────────────
    tools: {
      finanzTools:    "Tools",
      kaufSimulator:  "Einstandsrechner",
      kaufSimulatorHint: "Neuen Einstandspreis beim Aufstocken berechnen",

      szenarioHilfe:  "Wie wird berechnet?",
      szenarioHilfeTitle: "Berechnungsmethode",
      szenarioHilfeText: "Der Sparplan verwendet den DCA-Durchschnittskurs: den Mittelwert zwischen dem heutigen BTC-Kurs und dem Zielkurs. Damit wird angenommen, dass du über den Zeitraum zu steigenden Preisen kaufst — realistischer als der reine Zielkurs.",
      szenarioHilfeFormel: "Ø Kaufkurs = (heute + Zielkurs) ÷ 2",
      szenarioHilfeClose: "Verstanden",
    },

    // ── Demo Import Modal ───────────────────────────────────────────────────────
    demoImport: {
      title:       "Demo-Daten laden?",
      beschreibung: "Es werden Beispiel-Transaktionen importiert, damit du die App ausprobieren kannst.",
      abbrechen:   "Abbrechen",
      laden:       "Laden",
      laed:        "Lädt...",
    },

    // ── CSV Export ──────────────────────────────────────────────────────────────
    csv: {
      datum:          "Datum",
      typ:            "Typ",
      btc:            "BTC",
      betrag:         "Betrag",
      gebuehr:        "Gebuehr",
      notiz:          "Notiz",
      portfoliowert:  "Portfoliowert heute",
    },

    // ── Allgemein ───────────────────────────────────────────────────────────────
    common: {
      speichern:    "Speichern",
      abbrechen:    "Abbrechen",
      loeschen:     "Löschen",
      schliessen:   "Schliessen",
      laden:        "Laden",
      fehler:       "Fehler",
      ok:           "OK",
    },

    // ── Premium / Paywall ───────────────────────────────────────────────────────
    premium: {
      // Sektion in Einstellungen
      sectionTitle:           "PREMIUM",
      planPremium:            "Trackoshi BTC Premium",
      planFree:               "Free-Plan",
      statusActive:           "Aktiv",
      transactionsCount:      "Transaktionen",
      manageInAppStore:       "Einmalkauf — kein Abo. Wiederherstellen über den Button unten.",
      upgradeBtn:             "Auf Premium upgraden",
      restoreBtn:             "Käufe wiederherstellen",

      // Paywall-Modal
      paywallLimitTitle:      "Transaktions-Limit erreicht",
      paywallFeatureTitle:    "Premium-Funktion",
      paywallLimitBody:       "Du hast das kostenlose Limit von {limit} Transaktionen erreicht. Bestehende Transaktionen bleiben sichtbar. Schalte mit einem einmaligen Kauf unbegrenzte Transaktionen frei.",
      paywallFeatureBody:     "Schalte unbegrenzte Transaktionen frei — einmal zahlen, für immer behalten.",
      paywallIncludes:        "Premium beinhaltet",
      featureUnlimited:       "Unbegrenzte Transaktionen",
      featureOneTime:         "Einmaliger Kauf, kein Abo",
      featureUpdates:         "Alle zukünftigen Updates inklusive",
      webNoticeTitle:         "App holen",
      webNoticeText:          "Premium ist nur in der iOS-App verfügbar. Lade Trackoshi BTC im App Store, um freizuschalten.",
      planLifetime:           "Premium freischalten",
      planLifetimeHint:       "Einmal zahlen, für immer behalten",
      maybeLater:             "Vielleicht später",

      // Free-Limit Banner im Verlauf
      bannerLimitReached:     "Free-Limit erreicht ({limit})",
      bannerLimitSubtitle:    "Upgrade für unbegrenzte Transaktionen",
      bannerUpgradeBtn:       "Upgrade",

      // Tools-Tab Premium-Badge
      premiumBadge:           "★ Premium",

      // Restore Purchases Feedback
      restoreWebOnly:         "Wiederherstellen ist nur in der iOS-App verfügbar.",
      restoreNothingFound:    "Keine früheren Käufe gefunden.",
      restoreSuccess:         "Käufe erfolgreich wiederhergestellt — Premium ist aktiv.",
      restoreError:           "Wiederherstellen fehlgeschlagen. Bitte später erneut versuchen.",

      // Purchase Feedback
      mockPurchaseSuccess:    "Premium aktiviert (Testmodus).",
      purchaseSuccess:        "Premium ist jetzt aktiv. Vielen Dank!",
      purchaseError:          "Kauf konnte nicht abgeschlossen werden.",
      purchaseNoPackage:      "Dieses Angebot ist gerade nicht verfügbar. Bitte später erneut versuchen.",
      purchaseNotActive:      "Kauf erfolgt, aber Premium ist noch nicht aktiv. Bitte App neu starten oder Käufe wiederherstellen.",
      purchasing:             "Kauf wird verarbeitet…",
    },
  },

  // ════════════════════════════════════════════════════════════════════════════
  en: {
    nav: {
      dashboard:    "Dashboard",
      analyse:      "Analysis",
      verlauf:      "History",
      tools:        "Tools",
    },

    header: {
      portfolio:       "Trackoshi BTC",
      aktualisiere:    "Updating...",
      aktualisiert:    "Updated",
    },

    auth: {
      tagline:          "Bitcoin Portfolio Tracker",
      login:            "Sign In",
      register:         "Create Account",
      reset:            "Reset Password",
      btnLogin:         "Sign In",
      btnRegister:      "Register",
      btnReset:         "Send Link",
      email:            "EMAIL",
      emailPlaceholder: "name@example.com",
      password:         "PASSWORD",
      passwordPlaceholder: "••••••••",
      passwordRegisterPlaceholder: "At least 6 characters",
      agbText:          "I accept the",
      agbLink:          "Terms of Service",
      andThe:           "and the",
      privacyLink:      "Privacy Policy",
      loading:          "Please wait...",
      forgotPassword:   "Forgot password?",
      noAccount:        "No account yet? Register",
      backToLogin:      "← Back to sign in",
      confirmationSent: "Confirmation email sent! Please check your inbox.",
      resetSent:        "Password reset email sent!",
      fillAll:          "Please fill in all fields.",
      acceptAgb:        "Please accept the Terms of Service and Privacy Policy.",
      passwordTooShort: "Password must be at least 6 characters.",
      agbTitle:         "Terms & Privacy",
      close:            "Close",
    },

    portfolio: {
      gesamtwert:    "Total Value",
      seitKauf:      "since purchase",
      gewinn:        "Gain",
      verlust:       "Loss",
      investiert:    "Invested",
      portfoliowert: "Portfolio Value",
      heute:         "Today",
    },

    position: {
      title:          "Your Position",
      bestand:        "Holdings",
      investiert:     "Invested",
      einstandspreis: "Avg. Cost",
      proBtc:         "per BTC",
    },

    market: {
      lade:    "Loading...",
      fearGreedLabel: "Fear & Greed",
      fearGreedDaysAgo: "d ago",
      fearGreedExtremeAngst: "Extreme Fear",
      fearGreedAngst: "Fear",
      fearGreedNeutral: "Neutral",
      fearGreedGier: "Greed",
      fearGreedExtremeGier: "Extreme Greed",
    },

    priceChart: {
      title:          "Price history vs. cost basis",
      einstand:       "Cost Basis",
      kauf:           "Buy",
      fingerHint:     "Drag to read values",
    },

    breakEven: {
      title:          "Break-even analysis",
      aktuellerKurs:  "Current Price",
      einstandspreis: "Cost Basis",
      differenz:      "Difference",
      breakEvenAt:    "Break-even at",
      imGewinn:       "In profit",
      imVerlust:      "At a loss",
      nochNoetig:     "still needed",
      bereits:        "already",
      ueber:          "above cost basis",
    },

    realizedPnl: {
      title:         "Realized gain/loss",
      keinVerkauf:   "No sales recorded yet.",
      gesamt:        "Total",
      transaktionen: "Transactions",
      gewinn:        "Gain",
      verlust:       "Loss",
    },

    dcaChart: {
      title:         "DCA EFFICIENCY",
      keineDaten:    "No data available.",
    },

    dca: {
      title:           "Cost Basis Calculator",
      chartTitle:      "COST BASIS CALCULATOR",
      betrag:          "Amount",
      berechnen:       "Calculate",
      neuerEinstand:   "New Cost Basis",
      neueBtc:         "New BTC",
      neuesInvestiert: "New Total Invested",
      close:           "Close",
      einstandBerechnen: "Calculate new cost basis when adding to your position",
    },

    verlauf: {
      alle:              "All",
      keineTx:           "No transactions",
      csvExportTitle:    "Export CSV",
      gebuehr:           "Fee",
    },

    txType: {
      buy:          "Acquired",
      sell:         "Disposed",
      transfer_in:  "Transfer In",
      transfer_out: "Transfer Out",
    },

    txModal: {
      titelNeu:        "Add Transaction",
      praeambel:       "Record a Bitcoin transaction you have already made into your portfolio. Trackoshi does not buy or sell anything.",
      titelEdit:       "Edit Transaction",
      datum:           "DATE",
      typ:             "TYPE",
      betrag:          "AMOUNT",
      btcMenge:        "BTC AMOUNT",
      gebuehr:         "FEE",
      notiz:           "NOTE",
      notizPlaceholder: "Optional",
      preisPro:        "Price per BTC",
      abbrechen:       "Cancel",
      speichern:       "Save",
      speichernLaed:   "Saving...",
      typErklaerungLink:        "What do these mean?",
      typErklaerungTitel:       "Transaction types explained",
      typErklaerungSchliessen:  "Got it",
      typErklaerungErworben:    "**Acquired** — You bought Bitcoin (purchase price and fees affect your cost basis).",
      typErklaerungVeraeussert: "**Disposed** — You sold Bitcoin (realised gain or loss is calculated).",
      typErklaerungEinbuchen:   "**Transfer In** — You received Bitcoin into your wallet without a purchase (e.g. transfer from another wallet). Holdings increase, cost basis stays the same.",
      typErklaerungAusbuchen:   "**Transfer Out** — You moved Bitcoin out of your wallet without a sale. Holdings decrease, cost basis stays the same.",
      typErklaerungFooter:      "Trackoshi does not execute any buys or sells. You only record transactions you have already made.",
      validierung: {
        btcRequired:    "Enter BTC amount",
        betragRequired: "Enter amount",
        datumRequired:  "Select date",
      },
    },

    deleteModal: {
      title:         "Delete Transaction?",
      irreversible:  "This action cannot be undone.",
      abbrechen:     "Cancel",
      loeschen:      "Delete",
    },

    settings: {
      title:            "Settings",
      close:            "Close",

      konto:            "ACCOUNT",
      eingeloggtAls:    "Signed in as",
      passwortAendern:  "Change Password",
      abmelden:         "Sign Out",

      portfolioWaehrung:     "PORTFOLIO CURRENCY",
      portfolioWaehrungHint: "All amounts are displayed and entered in this currency",

      sekundaerkurs:        "SECONDARY PRICE",
      sekundaerkursHint:    "Show a second currency in the header",
      sekundaerkursAus:     "Off",
      fearGreedHint:        "Show Fear & Greed Index on dashboard",
      fearGreedAn:          "On",
      marktChart:           "Market chart",
      marktChartHint:       "Show BTC price chart",
      positionCard:         "Position",
      positionCardHint:     "Show BTC balance & cost basis",
      anzeigesprache:       "Display language",

      einstandsMethode:      "COST BASIS METHOD",

      darstellung:      "Appearance",
      dashboard:        "Dashboard",
      darkMode:         "Dark Mode",
      lightMode:        "Light Mode",
      darkModeAktiv:    "Dark theme active",
      lightModeAktiv:   "Light theme active",

      sprache:          "LANGUAGE",

      daten:            "DATA",
      importieren:      "Import Transactions",
      importierenHint:  "CSV file in app format",
      importBtn:        "↑ Import",
      importLaedt:      "Loading...",
      demoLaden:        "Load Demo Data",
      demoLadenHint:    "Import example transactions",
      demoLadenBtn:     "Load",
      alleLoeschen:     "Delete All Transactions",
      alleLoeschenHint: "Account is kept",
      alleLoeschenBtn:  "Delete",
      importiert:       "imported",
      uebersprungen:    "skipped",
      fehler:           "Error",

      appInfo:          "APP INFO",
      version:          "Version",
      datenbank:        "Database",
      kursApi:          "Price API",
      onboardingReset:  "Show intro again",

      rechtliches:      "LEGAL",
      agb:              "Terms of Service",
      datenschutz:      "Privacy Policy",
      agbTitle:         "Terms & Privacy",

      kontoLoeschenSection: "DELETE ACCOUNT",
      kontoLoeschen:    "Delete Account",
    },

    pwModal: {
      title:          "Change Password",
      neuesPasswort:  "NEW PASSWORD",
      bestaetigen:    "CONFIRM PASSWORD",
      placeholder:    "At least 6 characters",
      placeholderRepeat: "Repeat",
      nichtUebereinstimmend: "Passwords do not match.",
      zuKurz:         "At least 6 characters required.",
      speichern:      "Save",
      speichernLaed:  "Saving...",
      erfolg:         "✓ Password changed successfully",
      abbrechen:      "Cancel",
    },

    deleteAccount: {
      title:          "Delete Account?",
      beschreibung:   "All transactions and account data will be permanently deleted.",
      warnung:        "This action cannot be undone.",
      hinweis:        "Type",
      hinweisWort:    "DELETE",
      hinweisRest:    "to confirm",
      placeholder:    "DELETE",
      confirmWord:    "DELETE",
      abbrechen:      "Cancel",
      loeschen:       "Delete Account",
      loeschenLaed:   "Deleting...",
      fehler:         "Error deleting account",
    },

    clearData: {
      title:          "Delete All Transactions?",
      beschreibung:   "All recorded transactions will be permanently deleted. Your account will remain.",
      warnung:        "This action cannot be undone.",
      hinweis:        "Type",
      hinweisWort:    "DELETE",
      hinweisRest:    "to confirm",
      placeholder:    "DELETE",
      confirmWord:    "DELETE",
      abbrechen:      "Cancel",
      loeschen:       "Delete All",
      loeschenLaed:   "Deleting...",
    },

    costInfo: {
      title:      "Cost Basis Method",
      fifoTitle:  "FIFO – First In, First Out",
      fifoText:   "The first BTC purchased are considered the first sold. Each purchase is stored as an individual lot. When selling, the oldest lots are used first. The remaining cost basis reflects the newer, often more expensive purchases.",
      avcoTitle:  "AVCO – Weighted Average Cost",
      avcoText:   "With each purchase, the weighted average price of all BTC is recalculated. Sales do not change the cost basis, only the holdings. All held BTC always share the same cost basis.",
      close:      "Close",
    },

    privacy: {
      title: "Privacy Policy",
      sections: [
        { title: "What is stored", text: "Your email address (for login) and your recorded transactions: date, BTC amount, value, fees and note." },
        { title: "Where", text: "All data is stored encrypted in the EU — on AWS servers in Ireland (eu-west-1), operated via Supabase." },
        { title: "Who has access", text: "Only you. Thanks to Row-Level Security, only your account can see your data." },
        { title: "Deletion", text: "You can permanently delete your account and all data at any time under Settings → Delete Account." },
        { title: "Contact", text: "support [at] bluebubble [dot] ch" },
      ],
      close: "Close",
    },

    onboarding: {
      ueberspringen:    "Skip",
      weiter:           "Next →",
      loslegen:         "Get Started 🚀",
      datenschutzLink:  "Read full Privacy Policy",
      datenGehoeren:    "Your data belongs to you.",
      slides: [
        {
          title: "Your BTC portfolio.\nAt a glance.",
          text:  "Your personal Bitcoin tracker in CHF, EUR or USD. Record your transactions and keep track — no trading, no wallet connection.",
        },
        {
          title: "Dashboard that\nshows everything.",
          text:  "Live BTC price, your portfolio, Fear & Greed Index — all on one page, always up to date.",
        },
        {
          title: "Analysis that\nis honest.",
          text:  "Break-even, realized gain, DCA efficiency — see exactly where you stand.",
        },
        {
          title: "Tools that\ndo the math.",
          text:  "Cost basis calculator and scenario calculator — plan your strategy and see how your portfolio could develop.",
        },
        {
          title: "Secure.\nPrivate. Yours.",
          text:  "All data stored securely in the EU. CSV export, full control, deletable at any time.",
        },
      ],
    },

    tools: {
      finanzTools:        "Tools",
      kaufSimulator:      "Cost Basis Calculator",
      kaufSimulatorHint:  "Calculate new cost basis when adding to your position",

      szenarioHilfe:  "How is this calculated?",
      szenarioHilfeTitle: "Calculation method",
      szenarioHilfeText: "The savings plan uses the DCA average price: the midpoint between today's BTC price and the target price. This assumes you buy at rising prices over time — more realistic than using the target price alone.",
      szenarioHilfeFormel: "Avg. price = (today + target) ÷ 2",
      szenarioHilfeClose: "Got it",
    },

    demoImport: {
      title:        "Load Demo Data?",
      beschreibung: "Example transactions will be imported so you can try out the app.",
      abbrechen:    "Cancel",
      laden:        "Load",
      laed:         "Loading...",
    },

    csv: {
      datum:         "Date",
      typ:           "Type",
      btc:           "BTC",
      betrag:        "Amount",
      gebuehr:       "Fee",
      notiz:         "Note",
      portfoliowert: "Portfolio Value Today",
    },

    common: {
      speichern:    "Save",
      abbrechen:    "Cancel",
      loeschen:     "Delete",
      schliessen:   "Close",
      laden:        "Load",
      fehler:       "Error",
      ok:           "OK",
    },

    // ── Premium / Paywall ───────────────────────────────────────────────────────
    premium: {
      // Section in Settings
      sectionTitle:           "PREMIUM",
      planPremium:            "Trackoshi BTC Premium",
      planFree:               "Free Plan",
      statusActive:           "Active",
      transactionsCount:      "transactions",
      manageInAppStore:       "One-time purchase — no subscription. Restore via the button below.",
      upgradeBtn:             "Upgrade to Premium",
      restoreBtn:             "Restore Purchases",

      // Paywall modal
      paywallLimitTitle:      "Transaction Limit Reached",
      paywallFeatureTitle:    "Premium Feature",
      paywallLimitBody:       "You've reached the free limit of {limit} transactions. Existing transactions stay visible. Unlock unlimited transactions with a single one-time purchase.",
      paywallFeatureBody:     "Unlock unlimited transactions — pay once, keep forever.",
      paywallIncludes:        "Premium includes",
      featureUnlimited:       "Unlimited transactions",
      featureOneTime:         "One-time purchase, no subscription",
      featureUpdates:         "All future updates included",
      webNoticeTitle:         "Get the App",
      webNoticeText:          "Premium is only available in the iOS app. Download Trackoshi BTC from the App Store to unlock.",
      planLifetime:           "Unlock Premium",
      planLifetimeHint:       "Pay once, keep forever",
      maybeLater:             "Maybe later",

      // Free limit banner in history
      bannerLimitReached:     "Free limit reached ({limit})",
      bannerLimitSubtitle:    "Upgrade for unlimited transactions",
      bannerUpgradeBtn:       "Upgrade",

      // Tools tab Premium badge
      premiumBadge:           "★ Premium",

      // Restore Purchases feedback
      restoreWebOnly:         "Restore is only available in the iOS app.",
      restoreNothingFound:    "No previous purchases found.",
      restoreSuccess:         "Purchases restored successfully — Premium is now active.",
      restoreError:           "Restore failed. Please try again later.",

      // Purchase feedback
      mockPurchaseSuccess:    "Premium activated (test mode).",
      purchaseSuccess:        "Premium is now active. Thank you!",
      purchaseError:          "Purchase could not be completed.",
      purchaseNoPackage:      "This offer is currently unavailable. Please try again later.",
      purchaseNotActive:      "Purchase completed, but Premium is not yet active. Please restart the app or restore purchases.",
      purchasing:             "Processing purchase…",
    },
  },
};

// ── Helper: gebundene t()-Funktion ────────────────────────────────────────────
// Verwendung:
//   const t = tr(translations, language);
//   t("nav.verlauf")          => "Verlauf" | "History"
//   t("auth.fillAll")         => "Bitte alle Felder ausfüllen." | "Please fill in all fields."
export const tr = (dict, lang) => (key) => {
  const parts = key.split(".");
  let node = dict[lang] ?? dict["de"];
  for (const p of parts) {
    if (node == null) return key;
    node = node[p];
  }
  return node ?? key;
};
