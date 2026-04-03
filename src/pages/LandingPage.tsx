import { useEffect, useRef } from "react";

export default function LandingPage() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const reveal = (i: number) => (el: HTMLElement | null) => {
    if (el) revealRefs.current[i] = el;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        .bf-root * { box-sizing: border-box; margin: 0; padding: 0; }

        .bf-root {
          background: #0A0A0A;
          color: #F1F5F9;
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .bf-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px;
          background: rgba(10,10,10,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #1A1A1A;
        }

        .bf-logo {
          display: flex; align-items: center; gap: 8px;
        }
        .bf-logo img { height: 32px; width: auto; }

        .bf-nav-cta {
          background: #F59E0B; color: #000;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 14px;
          padding: 10px 20px; border-radius: 100px;
          border: none; cursor: pointer; text-decoration: none;
          transition: opacity 0.2s;
        }
        .bf-nav-cta:hover { opacity: 0.85; }

        .bf-hero {
          min-height: 100svh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 120px 24px 60px;
          text-align: center; position: relative; overflow: hidden;
        }

        .bf-hero-glow {
          position: absolute; top: 20%; left: 50%;
          transform: translateX(-50%);
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .bf-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 100px; padding: 6px 14px;
          font-size: 13px; color: #F59E0B; font-weight: 500;
          margin-bottom: 32px;
          animation: bfFadeUp 0.6s ease both;
        }

        .bf-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #F59E0B;
          animation: bfPulse 2s infinite;
        }

        .bf-h1 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 14vw, 96px);
          letter-spacing: 2px; line-height: 0.95;
          margin-bottom: 20px;
          animation: bfFadeUp 0.6s 0.1s ease both;
        }
        .bf-h1 em { font-style: normal; color: #F59E0B; }

        .bf-hero-sub {
          font-size: 18px; color: #6B7280;
          max-width: 300px; margin: 0 auto 40px;
          font-weight: 300; line-height: 1.7;
          animation: bfFadeUp 0.6s 0.2s ease both;
        }

        .bf-actions {
          display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          animation: bfFadeUp 0.6s 0.3s ease both;
        }

        .bf-btn {
          display: inline-block;
          background: #F59E0B; color: #000;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600; font-size: 17px;
          padding: 18px 40px; border-radius: 100px;
          border: none; cursor: pointer; text-decoration: none;
          width: 100%; max-width: 320px; text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 32px rgba(245,158,11,0.25);
        }
        .bf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 48px rgba(245,158,11,0.35);
        }

        .bf-trial-note { font-size: 13px; color: #6B7280; }

        .bf-mock {
          position: relative;
          background: #131313;
          border: 1px solid rgba(245,158,11,0.08);
          border-radius: 24px; padding: 24px;
          width: 100%; max-width: 340px;
          margin: 48px auto 0;
          box-shadow: 0 0 60px rgba(245,158,11,0.06), 0 32px 64px rgba(0,0,0,0.5);
          animation: bfFadeUp 0.6s 0.4s ease both;
          text-align: left;
        }

        .bf-toast {
          position: absolute; top: -18px; right: -8px;
          background: #1A1A1A;
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 12px; padding: 10px 14px;
          font-size: 12px; color: #F1F5F9;
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          white-space: nowrap;
          animation: bfToast 0.4s 1.2s ease both;
          opacity: 0;
        }

        .bf-mock-label {
          font-size: 11px; color: #6B7280;
          text-transform: uppercase; letter-spacing: 0.1em;
          margin-bottom: 8px;
        }

        .bf-mock-time-row {
          display: flex; align-items: baseline;
          justify-content: space-between; margin-bottom: 4px;
        }

        .bf-mock-time {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 56px; color: #F1F5F9;
          letter-spacing: 2px; line-height: 1;
        }

        .bf-badge-red {
          background: #EF4444; color: #fff;
          font-size: 12px; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
        }

        .bf-mock-route {
          font-size: 14px; color: #6B7280; margin-bottom: 20px;
        }
        .bf-mock-route strong { color: #F1F5F9; font-weight: 500; }

        .bf-progress-track {
          height: 3px; background: #1A1A1A;
          border-radius: 2px; overflow: hidden; margin-bottom: 6px;
        }

        .bf-progress-bar {
          height: 100%; width: 30%; background: #F59E0B;
          border-radius: 2px;
          box-shadow: 0 0 8px rgba(245,158,11,0.4);
          animation: bfProgress 4s linear infinite;
        }

        .bf-progress-labels {
          display: flex; justify-content: space-between;
          font-size: 11px; color: #6B7280;
        }

        .bf-stats {
          display: flex; justify-content: center;
          padding: 0 24px 60px; position: relative; z-index: 1;
        }

        .bf-stat {
          flex: 1; text-align: center; padding: 20px 12px;
          border-right: 1px solid #1A1A1A; max-width: 120px;
        }
        .bf-stat:last-child { border-right: none; }

        .bf-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 30px; color: #F59E0B;
          letter-spacing: 1px; line-height: 1; margin-bottom: 4px;
        }

        .bf-stat-label { font-size: 12px; color: #6B7280; line-height: 1.3; }

        .bf-section { position: relative; z-index: 1; padding: 60px 24px; }

        .bf-section-label {
          font-size: 11px; text-transform: uppercase;
          letter-spacing: 0.15em; color: #F59E0B;
          font-weight: 600; margin-bottom: 12px;
        }

        .bf-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(42px, 10vw, 64px);
          letter-spacing: 1px; line-height: 1.0;
          margin-bottom: 16px;
        }

        .bf-section-sub {
          font-size: 16px; color: #6B7280;
          line-height: 1.7; max-width: 320px;
        }

        .bf-features { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }

        .bf-feature {
          background: #131313;
          border: 1px solid rgba(245,158,11,0.08);
          border-radius: 20px; padding: 24px;
          position: relative; overflow: hidden;
          transition: border-color 0.3s;
        }
        .bf-feature:hover { border-color: rgba(245,158,11,0.2); }
        .bf-feature::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent);
        }

        .bf-feature-icon {
          width: 44px; height: 44px;
          background: rgba(245,158,11,0.15);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px; font-size: 20px;
        }

        .bf-feature-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .bf-feature-desc { font-size: 15px; color: #6B7280; line-height: 1.6; }

        .bf-steps { display: flex; flex-direction: column; margin-top: 40px; }

        .bf-step {
          display: flex; gap: 20px;
          padding-bottom: 36px; position: relative;
        }
        .bf-step:not(:last-child)::before {
          content: '';
          position: absolute; left: 19px; top: 44px; bottom: 0;
          width: 1px; background: #1A1A1A;
        }

        .bf-step-num {
          width: 40px; height: 40px; min-width: 40px;
          border-radius: 50%;
          background: #131313;
          border: 1px solid rgba(245,158,11,0.08);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 18px; color: #F59E0B; letter-spacing: 1px;
        }

        .bf-step-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 20px; letter-spacing: 0.5px;
          margin-bottom: 4px; padding-top: 8px;
        }

        .bf-step-desc { font-size: 15px; color: #6B7280; line-height: 1.6; }

        .bf-pricing-card {
          background: #131313;
          border: 1px solid rgba(245,158,11,0.2);
          border-radius: 24px; padding: 32px 24px;
          position: relative; overflow: hidden; margin-top: 40px;
          box-shadow: 0 0 40px rgba(245,158,11,0.05);
        }
        .bf-pricing-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, #F59E0B, transparent);
        }

        .bf-pricing-badge {
          display: inline-block;
          background: rgba(245,158,11,0.15);
          color: #F59E0B; font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 100px;
          margin-bottom: 20px;
          border: 1px solid rgba(245,158,11,0.2);
        }

        .bf-price-row { display: flex; align-items: baseline; gap: 4px; margin-bottom: 8px; }

        .bf-price-amount {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px; color: #F1F5F9;
          letter-spacing: 2px; line-height: 1;
        }

        .bf-price-period { font-size: 16px; color: #6B7280; }
        .bf-price-trial { font-size: 14px; color: #22C55E; margin-bottom: 28px; font-weight: 500; }

        .bf-pricing-list { list-style: none; display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }

        .bf-pricing-list li { display: flex; align-items: center; gap: 12px; font-size: 15px; }

        .bf-check {
          width: 22px; height: 22px; min-width: 22px;
          background: rgba(34,197,94,0.1);
          border-radius: 50%; display: flex; align-items: center;
          justify-content: center; color: #22C55E; font-size: 12px;
        }

        .bf-yearly {
          background: #0F0F0F; border: 1px solid #1A1A1A;
          border-radius: 16px; padding: 16px 20px; margin-top: 16px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .bf-yearly h4 { font-size: 15px; font-weight: 600; margin-bottom: 2px; }
        .bf-yearly p { font-size: 13px; color: #6B7280; }

        .bf-save {
          background: rgba(34,197,94,0.1); color: #22C55E;
          font-size: 12px; font-weight: 600;
          padding: 4px 10px; border-radius: 100px;
        }

        .bf-testimonials { display: flex; flex-direction: column; gap: 16px; margin-top: 40px; }

        .bf-testimonial {
          background: #131313;
          border: 1px solid rgba(245,158,11,0.08);
          border-radius: 20px; padding: 20px;
        }

        .bf-stars { color: #F59E0B; font-size: 13px; margin-bottom: 12px; }
        .bf-testimonial-text { font-size: 15px; line-height: 1.6; margin-bottom: 16px; }

        .bf-author { display: flex; align-items: center; gap: 12px; }

        .bf-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(245,158,11,0.15);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 15px; color: #F59E0B; letter-spacing: 1px;
        }

        .bf-author-name { font-size: 14px; font-weight: 600; }
        .bf-author-route { font-size: 12px; color: #6B7280; }

        .bf-final {
          padding: 60px 24px 80px;
          text-align: center; position: relative; z-index: 1;
        }

        .bf-final-glow {
          position: absolute; bottom: 0; left: 50%;
          transform: translateX(-50%);
          width: 400px; height: 300px;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .bf-final-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(44px, 10vw, 72px);
          letter-spacing: 2px; line-height: 1.0; margin-bottom: 16px;
        }

        .bf-final-sub {
          font-size: 16px; color: #6B7280;
          margin-bottom: 36px; line-height: 1.6;
        }

        .bf-divider { height: 1px; background: #1A1A1A; margin: 0 24px; position: relative; z-index: 1; }

        .bf-footer {
          border-top: 1px solid #1A1A1A; padding: 24px;
          text-align: center; position: relative; z-index: 1;
        }
        .bf-footer p { font-size: 13px; color: #6B7280; }
        .bf-footer a { color: #6B7280; text-decoration: none; }

        .bf-reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s ease; }
        .bf-reveal.visible { opacity: 1; transform: translateY(0); }

        @keyframes bfFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bfPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes bfProgress {
          from { width: 10%; }
          to { width: 85%; }
        }
        @keyframes bfToast {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="bf-root">
        {/* NAV */}
        <nav className="bf-nav">
          <div className="bf-logo">
            <img src="/lovable-uploads/5C4500CB-B0E1-418B-84A5-E1972203A123.png" alt="Pendly Logo" />
          </div>
          <button className="bf-nav-cta">Kostenlos testen</button>
        </nav>

        {/* HERO */}
        <section className="bf-hero">
          <div className="bf-hero-glow" />

          <div className="bf-badge">
            <span className="bf-dot" />
            Echtzeit-Daten · Deutsche Bahn &amp; Regionalverkehr
          </div>

          <h1 className="bf-h1">
            Nie wieder<br />
            die <em>Bahn</em><br />
            verpassen.
          </h1>

          <p className="bf-hero-sub">
            Pendly warnt dich bevor dein Zug ausfällt – nicht danach.
          </p>

          <div className="bf-actions">
            <button className="bf-btn">Jetzt kostenlos herunterladen</button>
            <span className="bf-trial-note">
              7 Tage gratis · Dann 4,99 €/Monat · Jederzeit kündbar
            </span>
          </div>

          <div className="bf-mock">
            <div className="bf-toast">
              ⚠ RE10 fällt aus – jetzt handeln
            </div>
            <div className="bf-mock-label">Nächste Abfahrt</div>
            <div className="bf-mock-time-row">
              <div className="bf-mock-time">07:39</div>
              <span className="bf-badge-red">Ausfall</span>
            </div>
            <div className="bf-mock-route">
              <strong>RE 10</strong> · Hildesheim Ost → Hannover Hbf
            </div>
            <div className="bf-progress-track">
              <div className="bf-progress-bar" />
            </div>
            <div className="bf-progress-labels">
              <span>Jetzt</span>
              <span>Abfahrt</span>
            </div>
          </div>
        </section>

        {/* STATS */}
        <div className="bf-stats">
          <div className="bf-stat">
            <div className="bf-stat-num">34%</div>
            <div className="bf-stat-label">aller Züge verspätet</div>
          </div>
          <div className="bf-stat">
            <div className="bf-stat-num">8 Min</div>
            <div className="bf-stat-label">Ø Verspätung täglich</div>
          </div>
          <div className="bf-stat">
            <div className="bf-stat-num">0 s</div>
            <div className="bf-stat-label">Reaktionszeit Pendly</div>
          </div>
        </div>

        <div className="bf-divider" />

        {/* FEATURES */}
        <section className="bf-section bf-reveal" ref={reveal(0)}>
          <div className="bf-section-label">Warum Pendly</div>
          <h2 className="bf-section-title">
            Du erfährst es<br />
            als Erster.
          </h2>
          <p className="bf-section-sub">
            Kein manuelles Checken mehr. Pendly überwacht deine Strecken rund
            um die Uhr.
          </p>
          <div className="bf-features">
            {[
              {
                icon: "⚡",
                title: "Sofort-Alerts",
                desc: "Du wirst benachrichtigt, sobald auf deiner Linie etwas passiert – Verspätung, Ausfall, Gleisänderung. Direkt aufs Handy.",
              },
              {
                icon: "🗺",
                title: "Deine Routen, dein Rhythmus",
                desc: "Speichere mehrere Verbindungen – die 7:12, die 6:58 als Backup, die 8:00 falls du mal länger schläfst.",
              },
              {
                icon: "🔀",
                title: "Automatische Alternativen",
                desc: "Fällt dein Zug aus? Pendly zeigt dir sofort die beste Alternative – inkl. ob du es noch rechtzeitig schaffst.",
              },
              {
                icon: "📊",
                title: "Verspätungs-Verlauf",
                desc: "Wie zuverlässig ist deine Linie wirklich? Sieh die echte Pünktlichkeitsquote deiner Strecke – Woche für Woche.",
              },
            ].map((f, i) => (
              <div className="bf-feature" key={i}>
                <div className="bf-feature-icon">{f.icon}</div>
                <h3 className="bf-feature-title">{f.title}</h3>
                <p className="bf-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="bf-divider" />

        {/* HOW IT WORKS */}
        <section className="bf-section bf-reveal" ref={reveal(1)}>
          <div className="bf-section-label">So funktioniert's</div>
          <h2 className="bf-section-title">
            In 3 Minuten<br />
            eingerichtet.
          </h2>
          <div className="bf-steps">
            {[
              {
                n: "1",
                title: "Route einrichten",
                desc: "Gib deine Start- und Zielhaltestelle ein. Pendly findet deine Verbindungen automatisch.",
              },
              {
                n: "2",
                title: "Abfahrtszeiten wählen",
                desc: "Wähle deine Stammzüge – und ruhig auch die Verbindungen davor und danach als Puffer.",
              },
              {
                n: "3",
                title: "Entspannt pendeln",
                desc: "Pendly überwacht alles. Du bekommst nur eine Nachricht, wenn wirklich etwas los ist.",
              },
            ].map((s, i) => (
              <div className="bf-step" key={i}>
                <div className="bf-step-num">{s.n}</div>
                <div>
                  <h3 className="bf-step-title">{s.title}</h3>
                  <p className="bf-step-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="bf-divider" />

        {/* PRICING */}
        <section className="bf-section bf-reveal" ref={reveal(2)}>
          <div className="bf-section-label">Preise</div>
          <h2 className="bf-section-title">
            Einfach.<br />
            Fair. Klar.
          </h2>
          <div className="bf-pricing-card">
            <div className="bf-pricing-badge">7 Tage kostenlos testen</div>
            <div className="bf-price-row">
              <span className="bf-price-amount">4,99</span>
              <span className="bf-price-period">€ / Monat</span>
            </div>
            <div className="bf-price-trial">
              ✓ Erste 7 Tage vollständig gratis
            </div>
            <ul className="bf-pricing-list">
              {[
                "Unbegrenzte Routen",
                "Echtzeit Push-Benachrichtigungen",
                "Gleisänderungs-Alerts",
                "Automatische Alternativen",
                "Verspätungs-Verlauf & Statistiken",
                "Alle Linien – DB, S-Bahn, RE, Bus, Tram",
              ].map((item, i) => (
                <li key={i}>
                  <span className="bf-check">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button className="bf-btn" style={{ maxWidth: "100%" }}>
              Jetzt kostenlos herunterladen
            </button>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#6B7280",
                marginTop: 12,
              }}
            >
              Keine Kreditkarte. Keine Werbung. Jederzeit kündbar.
            </p>
            <div className="bf-yearly">
              <div>
                <h4>Jahresabo</h4>
                <p>39,99 € / Jahr · 3,33 € pro Monat</p>
              </div>
              <span className="bf-save">–33%</span>
            </div>
          </div>
        </section>

        <div className="bf-divider" />

        {/* TESTIMONIALS */}
        <section className="bf-section bf-reveal" ref={reveal(3)}>
          <div className="bf-section-label">Stimmen</div>
          <h2 className="bf-section-title">
            Pendler<br />
            lieben es.
          </h2>
          <div className="bf-testimonials">
            {[
              {
                text: "Endlich muss ich morgens nicht mehr den DB Navigator checken. Pendly schreibt mir einfach wenn was schiefläuft.",
                initials: "MK",
                name: "Markus K.",
                route: "Pendler · Frankfurt → Darmstadt",
              },
              {
                text: "Die Gleisänderungs-Warnung hat mich schon zweimal gerettet. Hätte sonst am falschen Gleis gestanden.",
                initials: "SL",
                name: "Sara L.",
                route: "Pendlerin · Hannover → Hildesheim",
              },
            ].map((t, i) => (
              <div className="bf-testimonial" key={i}>
                <div className="bf-stars">★★★★★</div>
                <p className="bf-testimonial-text">"{t.text}"</p>
                <div className="bf-author">
                  <div className="bf-avatar">{t.initials}</div>
                  <div>
                    <div className="bf-author-name">{t.name}</div>
                    <div className="bf-author-route">{t.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bf-final">
          <div className="bf-final-glow" />
          <h2 className="bf-final-title">
            Dein Morgen.<br />
            Dein Zeitplan.
          </h2>
          <p className="bf-final-sub">
            Hör auf, jeden Morgen die Bahn-App zu checken.
            <br />
            Pendly macht das für dich.
          </p>
          <button className="bf-btn">Jetzt kostenlos herunterladen</button>
          <p className="bf-trial-note" style={{ marginTop: 12 }}>
            7 Tage gratis · Dann 4,99 €/Monat
          </p>
        </section>

        {/* FOOTER */}
        <footer className="bf-footer">
          <p>
            © 2025 Pendly ·{" "}
            <a href="#">Datenschutz</a> ·{" "}
            <a href="#">Impressum</a> ·{" "}
            <a href="#">AGB</a>
          </p>
        </footer>
      </div>
    </>
  );
}
