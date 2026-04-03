import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const Legal = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/lovable-uploads/5C4500CB-B0E1-418B-84A5-E1972203A123.png" alt="Pendly Logo" className="h-8" />
          <span className="text-lg font-semibold text-foreground">Pendly</span>
        </Link>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <a href="#impressum" className="hover:text-foreground transition-colors">Impressum</a>
          <a href="#datenschutz" className="hover:text-foreground transition-colors">Datenschutz</a>
          <a href="#agb" className="hover:text-foreground transition-colors">AGB</a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-16">
        {/* IMPRESSUM */}
        <section id="impressum" className="scroll-mt-20 space-y-6">
          <h1 className="text-3xl font-bold text-primary">Impressum</h1>
          <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Betreiber</h3>
              <p className="text-foreground leading-relaxed">
                Lucas Denecke<br />
                LMD Commerce<br />
                Mellingerstraße 54<br />
                31141 Hildesheim<br />
                Deutschland
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Kontakt</h3>
              <p>E-Mail: <a href="mailto:lucas@pendly.app" className="text-primary hover:underline">lucas@pendly.app</a></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mt-6">Verantwortlich für den Inhalt</h3>
              <p>Lucas Denecke, Mellingerstraße 54, 31141 Hildesheim</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mt-6">Streitschlichtung</h3>
              <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a></p>
              <p className="mt-2">Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mt-6">Haftung für Inhalte</h3>
              <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mt-6">Haftung für Links</h3>
              <p>Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mt-6">Urheberrecht</h3>
              <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors.</p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* DATENSCHUTZ */}
        <section id="datenschutz" className="scroll-mt-20 space-y-6">
          <h2 className="text-3xl font-bold text-primary">Datenschutz</h2>
          <p className="text-lg text-muted-foreground">Datenschutzerklärung gemäß DSGVO</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">1. Verantwortlicher</h3>
              <p className="mt-2">
                Lucas Denecke · LMD Commerce<br />
                Mellingerstraße 54 · 31141 Hildesheim<br />
                E-Mail: <a href="mailto:lucas@pendly.app" className="text-primary hover:underline">lucas@pendly.app</a>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Welche Daten wir erheben</h3>

              <h4 className="font-medium mt-4 mb-2">Bei der Registrierung</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>E-Mail-Adresse</li>
                <li>Verschlüsseltes Passwort</li>
                <li>Registrierungszeitpunkt</li>
              </ul>

              <h4 className="font-medium mt-4 mb-2">Bei der App-Nutzung</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Gespeicherte Routen (Start- und Zielhaltestellen)</li>
                <li>Gewählte Abfahrtszeiten</li>
                <li>Notification-Einstellungen</li>
                <li>Geräteinformationen für Push-Benachrichtigungen</li>
              </ul>

              <h4 className="font-medium mt-4 mb-2">Bei der Zahlung</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Zahlungsdaten werden ausschließlich von Stripe verarbeitet</li>
                <li>Wir speichern keine Kreditkartendaten</li>
                <li>Stripe Datenschutz: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/de/privacy</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Zweck der Datenverarbeitung</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Bereitstellung der App-Funktionen (Routen, Alerts)</li>
                <li>Versand von Push-Benachrichtigungen bei Störungen</li>
                <li>Abwicklung des Abonnements</li>
                <li>Kundensupport</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Rechtsgrundlage</h3>
              <p className="mt-2">Die Verarbeitung erfolgt auf Basis von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren Bereitstellung des Dienstes).</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Drittanbieter</h3>
              <div className="mt-2 space-y-3">
                <div>
                  <h4 className="font-medium">Supabase</h4>
                  <p className="text-muted-foreground">Datenbank und Authentifizierung. Server in der EU. Datenschutz: <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">supabase.com/privacy</a></p>
                </div>
                <div>
                  <h4 className="font-medium">Stripe</h4>
                  <p className="text-muted-foreground">Zahlungsabwicklung. Datenschutz: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">stripe.com/de/privacy</a></p>
                </div>
                <div>
                  <h4 className="font-medium">Deutsche Bahn / transport.rest</h4>
                  <p className="text-muted-foreground">Echtzeit-Fahrplandaten. Es werden keine personenbezogenen Daten an diese Dienste übermittelt.</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Speicherdauer</h3>
              <p className="mt-2">Deine Daten werden gespeichert solange du ein aktives Konto hast. Nach Kündigung werden alle personenbezogenen Daten innerhalb von 30 Tagen gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten bestehen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. Deine Rechte</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung deiner Daten (Art. 17 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
              </ul>
              <p className="mt-2">Kontakt: <a href="mailto:lucas@pendly.app" className="text-primary hover:underline">lucas@pendly.app</a></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Beschwerderecht</h3>
              <p className="mt-2">Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig ist die Landesbeauftragte für den Datenschutz Niedersachsen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Cookies</h3>
              <p className="mt-2">Wir verwenden ausschließlich technisch notwendige Cookies für die Authentifizierung. Es werden keine Tracking- oder Marketing-Cookies eingesetzt.</p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* AGB */}
        <section id="agb" className="scroll-mt-20 space-y-6">
          <h2 className="text-3xl font-bold text-primary">AGB</h2>
          <p className="text-lg text-muted-foreground">Allgemeine Geschäftsbedingungen · Stand: April 2025</p>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">1. Geltungsbereich</h3>
              <p className="mt-2">Diese AGB gelten für die Nutzung von Pendly, betrieben von Lucas Denecke, LMD Commerce, Mellingerstraße 54, 31141 Hildesheim.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">2. Leistungsbeschreibung</h3>
              <p className="mt-2">Pendly ist ein digitaler Dienst für Echtzeit-Informationen zu Zugverbindungen, Verspätungen, Ausfällen und Gleisänderungen.</p>
              <p className="mt-2 p-3 rounded-lg bg-card border border-border text-sm"><strong>Wichtig:</strong> Pendly ist ein Informationsdienst. Wir übernehmen keine Garantie für die Vollständigkeit oder Richtigkeit der Fahrplandaten. Diese liegen im Verantwortungsbereich der jeweiligen Verkehrsunternehmen.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">3. Registrierung & Konto</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground mt-2">
                <li>Die Nutzung erfordert eine Registrierung mit gültiger E-Mail-Adresse</li>
                <li>Du bist verpflichtet, deine Zugangsdaten geheim zu halten</li>
                <li>Pro Person ist nur ein Konto erlaubt</li>
                <li>Du musst mindestens 16 Jahre alt sein</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold">4. Testphase & Abonnement</h3>

              <h4 className="font-medium mt-4 mb-2">Kostenlose Testphase</h4>
              <p className="text-muted-foreground">Nach der Registrierung erhältst du 7 Tage kostenlosen Vollzugang. Es ist keine Zahlungsmethode für die Testphase erforderlich.</p>

              <h4 className="font-medium mt-4 mb-2">Preise</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Monatlich: 4,99 € / Monat</li>
                <li>Jährlich: 39,99 € / Jahr (3,33 € / Monat)</li>
              </ul>

              <p className="mt-3 text-muted-foreground">Das Abonnement verlängert sich automatisch. Die Abrechnung erfolgt über Stripe.</p>

              <h4 className="font-medium mt-4 mb-2">Kündigung</h4>
              <p className="text-muted-foreground">Jederzeit in den App-Einstellungen möglich. Wirksam zum Ende des aktuellen Abrechnungszeitraums. Keine anteilige Rückerstattung.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">5. Widerrufsrecht</h3>
              <p className="mt-2">Als Verbraucher hast du ein 14-tägiges Widerrufsrecht ab Vertragsschluss. Widerruf per E-Mail an: <a href="mailto:lucas@pendly.app" className="text-primary hover:underline">lucas@pendly.app</a></p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">6. Haftungsbeschränkung</h3>
              <p className="mt-2">Der Anbieter haftet nicht für Schäden durch fehlerhafte oder verspätete Fahrplaninformationen. Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen, außer bei Verletzung von Leben, Körper oder Gesundheit.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">7. Änderungen der AGB</h3>
              <p className="mt-2">Wesentliche Änderungen werden per E-Mail angekündigt. Ohne Widerspruch innerhalb von 30 Tagen gilt die Änderung als akzeptiert.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">8. Anwendbares Recht</h3>
              <p className="mt-2">Es gilt deutsches Recht. Gerichtsstand ist Hildesheim.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold">9. Kontakt</h3>
              <p className="mt-2">
                Lucas Denecke · LMD Commerce<br />
                Mellingerstraße 54 · 31141 Hildesheim<br />
                E-Mail: <a href="mailto:lucas@pendly.app" className="text-primary hover:underline">lucas@pendly.app</a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © 2025 Pendly · LMD Commerce · Lucas Denecke
      </footer>
    </div>
  );
};

export default Legal;
