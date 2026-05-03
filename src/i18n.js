// ── i18n.js — BTC Portfolio App ──────────────────────────────────────────────
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
      portfolio:       "Portfolio",
      aktualisiere:    "Aktualisiere...",
      aktualisiert:    "Aktualisiert",  // + Uhrzeit danach
    },

    // ── Auth Screen ─────────────────────────────────────────────────────────────
    auth: {
      tagline:          "Dein Bitcoin-Tracker",
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
    },

    // ── Price Chart ─────────────────────────────────────────────────────────────
    priceChart: {
      title:          "KURSVERLAUF VS. EINSTAND",
      einstand:       "Einstand",
      kauf:           "Kauf",
      fingerHint:     "Finger ziehen zum Ablesen",
    },

    // ── Break-Even Card ─────────────────────────────────────────────────────────
    breakEven: {
      title:       "BREAK-EVEN ANALYSE",
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
      title:         "REALISIERTER GEWINN/VERLUST",
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
      title:           "Kauf-Simulator",
      betrag:          "Kaufbetrag",
      berechnen:       "Berechnen",
      neuerEinstand:   "Neuer Einstandspreis",
      neueBtc:         "Neue BTC",
      neuesInvestiert: "Neu investiert",
      close:           "Schliessen",
      einstandBerechnen: "Einstandspreis bei Nachkauf berechnen",
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
      buy:          "Kauf",
      sell:         "Verkauf",
      transfer_in:  "Einbuchung",
      transfer_out: "Ausbuchung",
    },

    // ── Transaction Modal ───────────────────────────────────────────────────────
    txModal: {
      titelNeu:        "Transaktion erfassen",
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

      einstandsMethode:     "EINSTANDSPREIS-METHODE",

      darstellung:      "DARSTELLUNG",
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
      slides: [
        {
          title: "Willkommen bei BTC Portfolio",
          text:  "Dein persönlicher Bitcoin-Tracker. Erfasse Käufe, verfolge deinen Einstandspreis und behalte den Überblick.",
        },
        {
          title: "Transaktionen erfassen",
          text:  "Tippe auf + um Käufe, Verkäufe oder Transfers einzutragen. Gebühren werden automatisch berücksichtigt.",
        },
        {
          title: "Deine Währung wählen",
          text:  "Alle Beträge in CHF, EUR oder USD — wählbar in den Einstellungen. Deine Daten bleiben immer in CHF gespeichert.",
        },
        {
          title: "Alles im Griff",
          text:  "Dashboard, Analyse, Verlauf und Tools geben dir den vollen Überblick über dein Portfolio.",
        },
        {
          title: "Deine Daten gehören dir",
          text:  "Alle Daten werden sicher in der EU gespeichert. CSV-Export jederzeit möglich. Konto löschbar.",
        },
      ],
    },

    // ── Tools ───────────────────────────────────────────────────────────────────
    tools: {
      finanzTools:    "FINANZ-TOOLS",
      kaufSimulator:  "Kauf-Simulator",
      kaufSimulatorHint: "Einstandspreis bei Nachkauf berechnen",

      // KI-Tools
      aiTools:        "KI-TOOLS",
      aiPortfolioBtn: "Portfolio analysieren",
      aiPortfolioBtnHint: "Stärken, Risiken & aktuelle Position",
      aiMarketBtn:    "Markt-Kommentar",
      aiMarketBtnHint: "Aktuelle BTC-Marktlage & Ausblick",
      aiLoading:      "Claude denkt...",
      aiError:        "Fehler beim Laden. Bitte erneut versuchen.",
      aiPoweredBy:    "Powered by Claude AI",
      aiDisclaimer:   "Keine Anlageberatung.",
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
      portfolio:       "Portfolio",
      aktualisiere:    "Updating...",
      aktualisiert:    "Updated",
    },

    auth: {
      tagline:          "Your Bitcoin Tracker",
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
    },

    priceChart: {
      title:          "PRICE HISTORY VS. COST BASIS",
      einstand:       "Cost Basis",
      kauf:           "Buy",
      fingerHint:     "Drag to read values",
    },

    breakEven: {
      title:          "BREAK-EVEN ANALYSIS",
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
      title:         "REALIZED GAIN/LOSS",
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
      title:           "Buy Simulator",
      betrag:          "Purchase Amount",
      berechnen:       "Calculate",
      neuerEinstand:   "New Cost Basis",
      neueBtc:         "New BTC",
      neuesInvestiert: "New Total Invested",
      close:           "Close",
      einstandBerechnen: "Calculate cost basis after additional purchase",
    },

    verlauf: {
      alle:              "All",
      keineTx:           "No transactions",
      csvExportTitle:    "Export CSV",
      gebuehr:           "Fee",
    },

    txType: {
      buy:          "Buy",
      sell:         "Sell",
      transfer_in:  "Transfer In",
      transfer_out: "Transfer Out",
    },

    txModal: {
      titelNeu:        "Add Transaction",
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

      einstandsMethode:      "COST BASIS METHOD",

      darstellung:      "APPEARANCE",
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
      slides: [
        {
          title: "Welcome to BTC Portfolio",
          text:  "Your personal Bitcoin tracker. Record purchases, track your cost basis, and stay on top of your portfolio.",
        },
        {
          title: "Record Transactions",
          text:  "Tap + to add buys, sells or transfers. Fees are automatically taken into account.",
        },
        {
          title: "Choose Your Currency",
          text:  "All amounts in CHF, EUR or USD — selectable in Settings. Your data is always stored in CHF.",
        },
        {
          title: "Everything Under Control",
          text:  "Dashboard, Analysis, History and Tools give you a complete overview of your portfolio.",
        },
        {
          title: "Your Data Belongs to You",
          text:  "All data is stored securely in the EU. CSV export available at any time. Account can be deleted.",
        },
      ],
    },

    tools: {
      finanzTools:        "FINANCIAL TOOLS",
      kaufSimulator:      "Buy Simulator",
      kaufSimulatorHint:  "Calculate cost basis after additional purchase",

      // AI Tools
      aiTools:        "AI TOOLS",
      aiPortfolioBtn: "Analyse Portfolio",
      aiPortfolioBtnHint: "Strengths, risks & current position",
      aiMarketBtn:    "Market Commentary",
      aiMarketBtnHint: "Current BTC market situation & outlook",
      aiLoading:      "Claude is thinking...",
      aiError:        "Error loading. Please try again.",
      aiPoweredBy:    "Powered by Claude AI",
      aiDisclaimer:   "Not financial advice.",
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
