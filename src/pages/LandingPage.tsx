import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './landing.css';

const faqs = [
  { q: 'Was wenn Pendly mir nichts schickt?', a: 'Dann läuft heute alles perfekt. Das ist der Punkt – kein Rauschen, keine unnötigen Pings. Stille bedeutet: dein Zug fährt.' },
  { q: 'Woher kommen die Daten?', a: 'Pendly nutzt offizielle Echtzeit-Daten der Deutschen Bahn und des Deutschlandweiten Regionalverkehrs – dieselbe Quelle wie der DB Navigator, nur schneller ausgewertet.' },
  { q: 'Muss ich die App täglich öffnen?', a: 'Nein. Das ist der Kern von Pendly. Du richtest es einmal ein und vergisst es. Pendly arbeitet im Hintergrund und meldet sich nur wenn nötig.' },
  { q: 'Funktioniert das auch für Bus & Tram?', a: 'Ja. Pendly unterstützt alle Linien im deutschen ÖPNV – DB Fernverkehr, S-Bahn, RE, RB, Bus und Tram.' },
  { q: 'Was passiert nach den 7 Tagen?', a: 'Du wirst gefragt ob du weitermachen möchtest. Keine automatische Abbuchung, keine versteckten Kosten. Nur wenn du aktiv zustimmst geht\'s weiter – für 4,99 €/Monat oder 39,99 €/Jahr.' },
  { q: 'Warum kostet Pendly 4,99 €?', a: 'Pendly fragt sekündlich Echtzeit-Daten von DB und Regionalverkehr ab – das verursacht laufende API-Kosten. Dazu kommen Serverinfrastruktur, Weiterentwicklung und Support für tausende Verbindungen täglich. Auf den Tag gerechnet sind das 16 Cent – für die Optimierung deines Pendler-Alltags.' },
];

const testimonialsRow1 = [
  { quote: '„Ich fahre jeden Morgen die S3 nach Hamburg und weiß jetzt immer vorher ob sie Verspätung hat. Kein Stress mehr."', initials: 'TW', name: 'Thomas W.', route: 'Stade → Hamburg Hbf' },
  { quote: '„Vorher hab ich den DB Navigator 20x täglich geöffnet. Jetzt macht Pendly das. Verändert wirklich den Morgen."', initials: 'PM', name: 'Petra M.', route: 'Augsburg → München' },
  { quote: '„Der Alert kam, ich bin zur S-Bahn – alles gut. Vorher hab ich Ausfälle immer zu spät erfahren."', initials: 'JK', name: 'Julia K.', route: 'Bremen → Verden' },
  { quote: '„Endlich muss ich morgens nicht mehr checken. Pendly schreibt mir wenn was ist. Genial simpel."', initials: 'MK', name: 'Markus K.', route: 'Köln → Düsseldorf' },
];

const testimonialsRow2 = [
  { quote: '„Gleisänderung kurz vor Abfahrt – Pendly hat mich rechtzeitig informiert. Ohne die App hätte ich den falschen Zug genommen."', initials: 'SR', name: 'Sandra R.', route: 'Frankfurt → Darmstadt' },
  { quote: '„5 Minuten nach dem Aufwachen weiß ich ob mein Zug fährt. Das hat meinen Morgen komplett entspannt."', initials: 'LB', name: 'Lars B.', route: 'Hannover → Hildesheim' },
  { quote: '„Ich pendle seit 8 Jahren. Das ist die erste App die mir das Gefühl gibt, dass jemand mitdenkt."', initials: 'AH', name: 'Anna H.', route: 'Stuttgart → Ludwigsburg' },
  { quote: '„Die Alternative war sofort da als mein RE ausfiel. Ich war sogar früher im Büro als sonst."', initials: 'FM', name: 'Felix M.', route: 'München → Augsburg' },
];

function Testimonial({ t }: { t: typeof testimonialsRow1[0] }) {
  return (
    <div className="testimonial">
      <div className="t-stars">★★★★★</div>
      <div className="t-quote">{t.quote}</div>
      <div className="t-author">
        <div className="t-avatar">{t.initials}</div>
        <div>
          <div className="t-name">{t.name}</div>
          <div className="t-route">{t.route}</div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const goAuth = () => navigate('/auth');

  return (
    <div className="lp">
      {/* NAV */}
      <nav className="lp-nav">
        <a href="#" className="logo" onClick={e => e.preventDefault()}>
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
              <line x1="4" y1="22" x2="4" y2="15"/>
            </svg>
          </div>
          <div className="logo-text">Pend<span>ly</span></div>
        </a>
        <button className="btn btn-nav" onClick={goAuth}>Kostenlos testen</button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-sky" />
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-pulse" />
            Echtzeit · DB &amp; Regionalverkehr
          </div>
          <div className="hero-stars">
            <span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span><span className="star">★</span>
            <span className="hero-stars-text">14.000 Pendler vertrauen Pendly</span>
          </div>
          <h1>Hör auf<br />zu <em>hoffen.</em></h1>
          <p className="hero-sub">Pendly überwacht deine Strecke und meldet sich nur, wenn <strong>wirklich etwas los ist</strong>. Kein manuelles Checken mehr.</p>
          <button className="btn-hero" onClick={goAuth}>Jetzt kostenlos herunterladen</button>
          <p className="hero-meta"><span className="green">7 Tage kostenlos testen</span> · 4,99 €/Monat oder 39,99 €/Jahr</p>
        </div>

        <div className="hero-scene">
          <div className="hero-mockup-wrap">
            <div className="mockup-card">
              <div className="mockup-header">
                <div className="mockup-logo">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </div>
                <div className="mockup-app-name">Pendly</div>
              </div>
              <div className="mockup-notif">
                <div className="mockup-notif-icon">⚠️</div>
                <div>
                  <div className="mockup-notif-title">RE 10 fällt aus</div>
                  <div className="mockup-notif-sub">Alt: S3 · 07:52 · pünktlich</div>
                </div>
              </div>
              <div className="mockup-notif good">
                <div className="mockup-notif-icon">✅</div>
                <div>
                  <div className="mockup-notif-title">Zug pünktlich</div>
                  <div className="mockup-notif-sub">S3 · 17:45 · Gleis 2</div>
                </div>
              </div>
            </div>
          </div>

          <svg className="scene-svg" viewBox="0 0 800 260" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="transparent"/><stop offset="100%" stopColor="rgba(0,0,0,0.15)"/></linearGradient>
              <linearGradient id="trainGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FCD34D"/><stop offset="100%" stopColor="#F59E0B"/></linearGradient>
            </defs>
            <rect x="0" y="220" width="800" height="40" fill="#0f2a6b"/>
            <rect x="40" y="110" width="55" height="110" rx="2" fill="#1a3a7a" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="48" y="120" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="62" y="120" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="76" y="120" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="48" y="140" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="62" y="140" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.9"/>
            <rect x="76" y="140" width="10" height="14" rx="1" fill="#FCD34D" opacity="0.3"/>
            <rect x="120" y="80" width="70" height="140" rx="2" fill="#162f6b" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="130" y="90" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="150" y="90" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="170" y="90" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="130" y="110" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="150" y="110" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="170" y="110" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.3"/>
            <rect x="130" y="130" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.9"/>
            <rect x="150" y="130" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="170" y="130" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="130" y="150" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="150" y="150" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="170" y="150" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.3"/>
            <rect x="210" y="130" width="50" height="90" rx="2" fill="#1a3578" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="218" y="140" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="238" y="140" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="218" y="162" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="238" y="162" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="290" y="60" width="80" height="160" rx="2" fill="#152d68" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="300" y="70" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="322" y="70" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="344" y="70" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.3"/>
            <rect x="300" y="90" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="322" y="90" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="344" y="90" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.9"/>
            <rect x="300" y="110" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="322" y="110" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="344" y="110" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <polygon points="330,60 290,60 370,60 330,30" fill="#1a3578"/>
            <rect x="400" y="100" width="60" height="120" rx="2" fill="#183270" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="410" y="110" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="432" y="110" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="410" y="130" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="432" y="130" width="14" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="490" y="140" width="50" height="80" rx="2" fill="#1a3578" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="498" y="150" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="518" y="150" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="570" y="90" width="70" height="130" rx="2" fill="#162f6b" stroke="#2a4a9a" strokeWidth="0.5"/>
            <rect x="580" y="100" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.6"/>
            <rect x="600" y="100" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.4"/>
            <rect x="620" y="100" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.8"/>
            <rect x="580" y="122" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.5"/>
            <rect x="600" y="122" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.7"/>
            <rect x="620" y="122" width="12" height="14" rx="1" fill="#FCD34D" opacity="0.3"/>
            <rect x="670" y="120" width="55" height="100" rx="2" fill="#1a3a7a" stroke="#2a4a9a" strokeWidth="0.5"/>
            <line x1="0" y1="222" x2="800" y2="222" stroke="#3a5ab0" strokeWidth="1.5"/>
            <line x1="0" y1="226" x2="800" y2="226" stroke="#3a5ab0" strokeWidth="1.5"/>
            {Array.from({ length: 20 }).map((_, i) => (
              <rect key={`tie-${i}`} x={i * 42} y="220" width="8" height="8" rx="1" fill="#2a4a9a" opacity="0.5"/>
            ))}
            <text x="330" y="244" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="'Plus Jakarta Sans',sans-serif" fontWeight="600" textAnchor="middle">Gleis 3</text>
            <g>
              <rect x="500" y="200" width="120" height="24" rx="6" fill="url(#trainGrad)"/>
              <rect x="615" y="202" width="30" height="20" rx="4" fill="#F59E0B"/>
              <rect x="508" y="206" width="16" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
              <rect x="530" y="206" width="16" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
              <rect x="552" y="206" width="16" height="10" rx="2" fill="rgba(255,255,255,0.9)"/>
              <circle cx="515" cy="228" r="5" fill="#0f2a6b"/>
              <circle cx="535" cy="228" r="5" fill="#0f2a6b"/>
              <circle cx="600" cy="228" r="5" fill="#0f2a6b"/>
              <rect x="622" y="208" width="16" height="8" rx="2" fill="rgba(255,255,255,0.8)"/>
            </g>
          </svg>
        </div>
      </section>

      {/* 9 vs 1 */}
      <section className="nine-one-section">
        <div className="eyebrow">☕ Dein Morgen, neu gedacht</div>
        <h2>9 von 10 Pendlern<br />machen <em>das hier.</em></h2>
        <div className="nine-card">
          <div className="nine-card-header">
            <div className="nine-number">9<span>/10</span></div>
            <div className="nine-label">Pendler ohne Pendly</div>
          </div>
          <div className="nine-steps">
            <div className="nine-step"><span className="nine-step-icon">😴</span>Aufwachen. Direkt zum Handy greifen.</div>
            <div className="nine-step"><span className="nine-step-icon">📱</span>DB Navigator öffnen. Warten bis er lädt.</div>
            <div className="nine-step"><span className="nine-step-icon">🔍</span>Route manuell checken. Verspätungen suchen.</div>
            <div className="nine-step"><span className="nine-step-icon">🤞</span>Hoffen dass heute alles normal läuft.</div>
            <div className="nine-step"><span className="nine-step-icon">😤</span>Am Bahnsteig merken: Zug fällt aus.</div>
          </div>
        </div>
        <div className="one-card">
          <div className="one-card-header">
            <div className="one-number">1<span>/10</span></div>
            <div className="one-label">Pendler mit Pendly</div>
          </div>
          <div className="one-steps">
            <div className="one-step"><span className="one-step-icon">😴</span>Aufwachen.</div>
            <div className="one-step"><span className="one-step-icon">📲</span>Einmal aufs Handy schauen – keine Nachricht von Pendly.</div>
            <div className="one-step"><span className="one-step-icon">☕</span>Entspannt Kaffee trinken. Pendly hat alles im Blick.</div>
          </div>
          <div className="one-card-footer">Pendly überwacht deine gespeicherten Routen rund um die Uhr – und meldet sich nur, wenn wirklich etwas los ist.</div>
        </div>
      </section>

      {/* USP */}
      <section className="usp-section">
        <div className="eyebrow">✨ Was Pendly für dich tut</div>
        <h2>Dein stiller<br /><em>Zugwächter.</em></h2>
        <div className="usp-cards">
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Routen einmal speichern', desc: 'Leg deine täglichen Strecken an – Pendly überwacht sie ab sofort automatisch, jeden Tag.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Echtzeit-Überwachung', desc: 'Verspätungen, Ausfälle, Gleisänderungen – Pendly erkennt es bevor die DB es offiziell anzeigt.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, title: 'Nur eine Nachricht', desc: 'Kein Rauschen. Du wirst nur benachrichtigt wenn du wirklich handeln musst – sonst: Stille.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 12H12L9 15"/><path d="M12 8v4"/></svg>, title: 'Alternative sofort dabei', desc: 'Fällt dein Zug aus, zeigt Pendly die beste Alternative – inklusive ob du es noch rechtzeitig schaffst.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>, title: 'Stammzüge & Puffer', desc: 'Speichere die 7:12, die 6:58 als Backup und die 8:00 für schlechte Tage. Pendly kennt deinen Rhythmus.' },
          ].map((u, i) => (
            <div className="usp-card" key={i}>
              <div className="usp-ico">{u.icon}</div>
              <div>
                <div className="usp-title">{u.title}</div>
                <div className="usp-desc">{u.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW */}
      <section className="how-section">
        <div className="eyebrow">🚀 So funktioniert's</div>
        <h2>In 3 Minuten<br /><em>eingerichtet.</em></h2>
        <div className="steps">
          {[
            { n: '1', t: 'Route einrichten', d: 'Start- und Zielhaltestelle eingeben. Pendly findet alle Verbindungen automatisch – DB, S-Bahn, RE, Bus.' },
            { n: '2', t: 'Stammzüge wählen', d: 'Deine täglichen Züge speichern – plus die Verbindung davor als Backup für stressige Morgen.' },
            { n: '3', t: 'Handy weglegen', d: 'Pendly überwacht alles. Du bekommst nur eine Nachricht, wenn wirklich etwas los ist.' },
          ].map((s, i) => (
            <div className="step" key={i}>
              <div className="step-num">{s.n}</div>
              <div className="step-body">
                <div className="step-title">{s.t}</div>
                <div className="step-desc">{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROOF */}
      <section className="proof-section">
        <div className="proof-inner">
          <div className="eyebrow">💬 Stimmen</div>
          <h2>Pendler<br /><em>lieben es.</em></h2>
        </div>
        <div className="marquee-wrap">
          <div className="marquee-fade-left" />
          <div className="marquee-fade-right" />
          <div className="marquee-track">
            <div className="marquee-inner marquee-left">
              {[...testimonialsRow1, ...testimonialsRow1].map((t, i) => <Testimonial key={`r1-${i}`} t={t} />)}
            </div>
          </div>
          <div className="marquee-track">
            <div className="marquee-inner marquee-right">
              {[...testimonialsRow2, ...testimonialsRow2].map((t, i) => <Testimonial key={`r2-${i}`} t={t} />)}
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BANNER */}
      <div className="trust-banner">
        <div className="trust-stat">
          <div className="trust-stat-num">14.000+</div>
          <div className="trust-stat-label">Pendler</div>
        </div>
        <div className="trust-divider" />
        <div className="trust-stat">
          <div className="trust-stat-num">7 Tage</div>
          <div className="trust-stat-label">Gratis testen</div>
        </div>
        <div className="trust-divider" />
        <div className="trust-stat">
          <div className="trust-stat-num">🇩🇪</div>
          <div className="trust-stat-label">Deutsches</div>
          <div className="trust-stat-label">Startup</div>
        </div>
        <div className="trust-divider" />
        <div className="trust-stat">
          <div className="trust-stat-num">Flexibel</div>
          <div className="trust-stat-label">Kündbar</div>
        </div>
      </div>

      {/* PRICING */}
      <section className="pricing-section">
        <div className="eyebrow">💰 Preise</div>
        <h2>Einfach.<br /><em>Fair. Klar.</em></h2>
        <div className="pricing-card">
          <div className="trial-badge">🎁 7 Tage kostenlos – keine Kreditkarte</div>
          <div className="price-row">
            <div className="price-big">4,99</div>
            <div className="price-unit">€ / Monat</div>
          </div>
          <div className="price-annual">oder 39,99 € / Jahr – 2 Monate geschenkt</div>
          <ul className="feature-checklist">
            <li><span className="chk">✓</span> Unbegrenzte Routen &amp; Stammzüge</li>
            <li><span className="chk">✓</span> Echtzeit Push-Benachrichtigungen</li>
            <li><span className="chk">✓</span> Gleisänderungs-Alerts</li>
            <li><span className="chk">✓</span> Automatische Alternativen bei Ausfall</li>
            <li><span className="chk">✓</span> Verspätungs-Verlauf &amp; Statistiken</li>
            <li><span className="chk">✓</span> DB, S-Bahn, RE, Bus, Tram</li>
          </ul>
          <button className="btn-primary" onClick={goAuth}>Jetzt kostenlos herunterladen</button>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section">
        <div className="eyebrow">🤔 Häufige Fragen</div>
        <h2>Deine Fragen.<br /><em>Unsere Antworten.</em></h2>
        <div className="faq-items">
          {faqs.map((f, i) => (
            <div className={`faq-item${openFaq === i ? ' open' : ''}`} key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="faq-q">
                {f.q}
                <svg className="faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="faq-a">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <h2>Hör auf zu hoffen.<br /><em>Fang an zu wissen.</em></h2>
        <p>Morgen früh steht einer von zehn Pendlern entspannt am Bahnsteig.<br /><strong>Weil Pendly für ihn schaut.</strong></p>
        <button className="btn-primary" onClick={goAuth} style={{ maxWidth: 400, margin: '0 auto 14px' }}>Jetzt kostenlos herunterladen</button>
        <p>4,99 €/Monat oder 39,99 €/Jahr</p>
      </section>

      {/* FOOTER */}
      <footer>
        © 2025 Pendly · LMD Commerce<br />
        <Link to="/legal">Impressum</Link> · <Link to="/legal">Datenschutz</Link> · <Link to="/legal">AGB</Link>
      </footer>
    </div>
  );
}
