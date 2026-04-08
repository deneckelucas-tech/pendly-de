import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './landing.css';

const testimonials1 = [
  { quote: 'Ich fahre jeden Morgen die S3 nach Hamburg und weiss jetzt immer vorher ob sie Verspätung hat. Kein Stress mehr.', name: 'Thomas W.', initials: 'TW', route: 'Stade → Hamburg Hbf' },
  { quote: 'Vorher hab ich den DB Navigator 20x täglich geöffnet. Jetzt macht Pendly das. Verändert wirklich den Morgen.', name: 'Petra M.', initials: 'PM', route: 'Augsburg → München' },
  { quote: 'Der Alert kam, ich bin zur S-Bahn – alles gut. Vorher hab ich Ausfälle immer zu spät erfahren.', name: 'Julia K.', initials: 'JK', route: 'Bremen → Verden' },
  { quote: 'Endlich muss ich morgens nicht mehr checken. Pendly schreibt mir wenn was ist. Genial simpel.', name: 'Markus K.', initials: 'MK', route: 'Köln → Düsseldorf' },
];

const testimonials2 = [
  { quote: 'Mein RE10 fällt ständig aus. Pendly hat mich noch nie im Stich gelassen.', name: 'Leon S.', initials: 'LS', route: 'Hildesheim → Hannover' },
  { quote: 'Ich hab Pendly meiner ganzen Abteilung empfohlen. Alle pendeln, alle lieben es.', name: 'Anna B.', initials: 'AB', route: 'Düsseldorf → Essen' },
  { quote: 'Push-Notification kam, bevor die DB selbst die Verspätung angezeigt hat. Krass.', name: 'Felix H.', initials: 'FH', route: 'Berlin → Potsdam' },
  { quote: 'Die 4,99 im Monat sind absolut gerechtfertigt. Spart jeden Morgen Stress und Zeit.', name: 'Michael T.', initials: 'MT', route: 'Stuttgart → Ludwigsburg' },
];

const faqs = [
  { q: 'Funktioniert Pendly auch mit Bussen und S-Bahnen?', a: 'Ja! Pendly nutzt die offizielle HAFAS-Schnittstelle und unterstützt alle Verkehrsmittel des deutschen ÖPNV – ICE, IC, RE, RB, S-Bahn, U-Bahn, Tram und Bus.' },
  { q: 'Was passiert nach den 7 Tagen Testphase?', a: 'Nach der Testphase wählst du zwischen Monats- (4,99 €) oder Jahresabo (39,99 €). Keine automatische Verlängerung ohne deine Zustimmung.' },
  { q: 'Wie schnell kommen die Benachrichtigungen?', a: 'Pendly prüft deine Routen alle 60 Sekunden. Sobald eine Störung erkannt wird, bekommst du sofort eine Nachricht – oft schneller als die offizielle DB-App.' },
  { q: 'Kann ich mehrere Routen speichern?', a: 'Ja, du kannst beliebig viele Routen mit Hin- und Rückweg anlegen. Pendly überwacht alle gleichzeitig.' },
  { q: 'Werden meine Daten gespeichert?', a: 'Nur das Nötigste: deine Routen und dein Account. Keine Tracking-Daten, keine Werbung, keine Weitergabe an Dritte. Server in Deutschland.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const renderTestimonial = (t: typeof testimonials1[0], i: number) => (
    <div className="lp-testimonial" key={i}>
      <div className="lp-t-stars">★★★★★</div>
      <div className="lp-t-quote">„{t.quote}"</div>
      <div className="lp-t-author">
        <div className="lp-t-avatar">{t.initials}</div>
        <div>
          <div className="lp-t-name">{t.name}</div>
          <div className="lp-t-route">{t.route}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lp-root">
      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </div>
          <div className="lp-logo-text">Pend<span>ly</span></div>
        </div>
        <button onClick={() => navigate('/auth')} className="lp-btn lp-btn-nav">Kostenlos testen</button>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-sky" />
        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <div className="lp-badge-pulse" />
            Echtzeit · DB &amp; Regionalverkehr
          </div>

          <div className="lp-hero-stars">
            <span className="lp-star">★★★★★</span>
            <span className="lp-hero-stars-text">14.000 Pendler vertrauen Pendly</span>
          </div>

          <h1>Hör auf<br />zu <em>hoffen.</em></h1>

          <p className="lp-hero-sub">
            Pendly überwacht deine Strecke und meldet sich nur, wenn <strong>wirklich etwas los ist</strong>. Kein manuelles Checken mehr.
          </p>

          <button onClick={() => navigate('/auth')} className="lp-btn-hero">
            Jetzt kostenlos herunterladen
          </button>
          <p className="lp-hero-meta">
            <span className="green">7 Tage kostenlos testen</span> · 4,99 €/Monat oder 39,99 €/Jahr
          </p>
        </div>

        {/* HERO SCENE WITH SVG */}
        <div className="lp-hero-scene">
          <div className="lp-hero-mockup-wrap">
            <div className="lp-mockup-card">
              <div className="lp-mockup-header">
                <div className="lp-mockup-logo">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </div>
                <div className="lp-mockup-app-name">Pendly</div>
              </div>
              <div className="lp-mockup-notif">
                <div className="lp-mockup-notif-icon">⚠️</div>
                <div>
                  <div className="lp-mockup-notif-title">RE 10 fällt aus</div>
                  <div className="lp-mockup-notif-sub">Alt: S3 · 07:52 · pünktlich</div>
                </div>
              </div>
              <div className="lp-mockup-notif good">
                <div className="lp-mockup-notif-icon">✅</div>
                <div>
                  <div className="lp-mockup-notif-title">Zug pünktlich</div>
                  <div className="lp-mockup-notif-sub">S3 · 17:45 · Gleis 2</div>
                </div>
              </div>
              <div className="lp-mockup-time-row">
                <div className="lp-mockup-time">07:12</div>
                <div className="lp-mockup-status">Pünktlich</div>
              </div>
            </div>
          </div>

          {/* City SVG illustration */}
          <svg className="lp-scene-svg" viewBox="0 0 400 200" preserveAspectRatio="xMidYMax slice">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="400" height="200" fill="url(#skyGrad)" />

            {/* Buildings */}
            <rect x="10" y="90" width="28" height="110" rx="2" fill="rgba(255,255,255,0.08)" />
            <rect x="14" y="96" width="5" height="6" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="22" y="96" width="5" height="6" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="14" y="108" width="5" height="6" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="22" y="108" width="5" height="6" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="14" y="120" width="5" height="6" rx="1" fill="rgba(255,200,100,0.3)" />

            <rect x="45" y="60" width="35" height="140" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="50" y="66" width="6" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="59" y="66" width="6" height="7" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="68" y="66" width="6" height="7" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="50" y="80" width="6" height="7" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="59" y="80" width="6" height="7" rx="1" fill="rgba(255,200,100,0.2)" />
            <rect x="68" y="80" width="6" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="50" y="94" width="6" height="7" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="59" y="94" width="6" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="68" y="94" width="6" height="7" rx="1" fill="rgba(255,200,100,0.4)" />

            <rect x="90" y="100" width="22" height="100" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="94" y="106" width="5" height="6" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="102" y="106" width="5" height="6" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="94" y="118" width="5" height="6" rx="1" fill="rgba(255,200,100,0.5)" />

            <rect x="120" y="70" width="30" height="130" rx="2" fill="rgba(255,255,255,0.05)" />
            <rect x="125" y="76" width="5" height="7" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="133" y="76" width="5" height="7" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="141" y="76" width="5" height="7" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="125" y="90" width="5" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="133" y="90" width="5" height="7" rx="1" fill="rgba(255,200,100,0.4)" />

            <rect x="160" y="85" width="25" height="115" rx="2" fill="rgba(255,255,255,0.08)" />
            <rect x="164" y="91" width="5" height="6" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="172" y="91" width="5" height="6" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="164" y="103" width="5" height="6" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="172" y="103" width="5" height="6" rx="1" fill="rgba(255,200,100,0.5)" />

            {/* Church/spire */}
            <rect x="195" y="75" width="18" height="125" rx="2" fill="rgba(255,255,255,0.06)" />
            <polygon points="204,45 195,75 213,75" fill="rgba(255,255,255,0.06)" />
            <rect x="202" y="35" width="4" height="12" fill="rgba(255,255,255,0.08)" />

            <rect x="220" y="95" width="32" height="105" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="225" y="101" width="6" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="234" y="101" width="6" height="7" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="243" y="101" width="6" height="7" rx="1" fill="rgba(255,200,100,0.4)" />

            <rect x="260" y="110" width="20" height="90" rx="2" fill="rgba(255,255,255,0.05)" />
            <rect x="265" y="116" width="5" height="6" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="265" y="128" width="5" height="6" rx="1" fill="rgba(255,200,100,0.6)" />

            <rect x="288" y="65" width="28" height="135" rx="2" fill="rgba(255,255,255,0.06)" />
            <rect x="293" y="71" width="5" height="7" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="301" y="71" width="5" height="7" rx="1" fill="rgba(255,200,100,0.3)" />
            <rect x="309" y="71" width="5" height="7" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="293" y="85" width="5" height="7" rx="1" fill="rgba(255,200,100,0.6)" />

            <rect x="325" y="100" width="22" height="100" rx="2" fill="rgba(255,255,255,0.07)" />
            <rect x="329" y="106" width="5" height="6" rx="1" fill="rgba(255,200,100,0.5)" />
            <rect x="337" y="106" width="5" height="6" rx="1" fill="rgba(255,200,100,0.3)" />

            <rect x="355" y="80" width="35" height="120" rx="2" fill="rgba(255,255,255,0.05)" />
            <rect x="360" y="86" width="6" height="7" rx="1" fill="rgba(255,200,100,0.4)" />
            <rect x="369" y="86" width="6" height="7" rx="1" fill="rgba(255,200,100,0.6)" />
            <rect x="378" y="86" width="6" height="7" rx="1" fill="rgba(255,200,100,0.3)" />

            {/* Platform */}
            <rect x="0" y="180" width="400" height="20" fill="rgba(255,255,255,0.04)" />
            <text x="200" y="194" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="11" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="700">Gleis 3</text>

            {/* Tracks */}
            <line x1="0" y1="198" x2="400" y2="198" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <line x1="0" y1="196" x2="400" y2="196" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
            {[0,30,60,90,120,150,180,210,240,270,300,330,360].map(x => (
              <line key={x} x1={x} y1="195" x2={x+20} y2="195" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
            ))}

            {/* Train */}
            <g>
              <rect x="60" y="160" width="180" height="18" rx="4" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <rect x="62" y="162" width="30" height="10" rx="2" fill="rgba(96,165,250,0.3)" />
              <rect x="96" y="162" width="22" height="10" rx="2" fill="rgba(96,165,250,0.2)" />
              <rect x="122" y="162" width="22" height="10" rx="2" fill="rgba(96,165,250,0.2)" />
              <rect x="148" y="162" width="22" height="10" rx="2" fill="rgba(96,165,250,0.2)" />
              <rect x="174" y="162" width="22" height="10" rx="2" fill="rgba(96,165,250,0.2)" />
              <rect x="200" y="162" width="38" height="14" rx="3" fill="rgba(255,255,255,0.15)" />
              <circle cx="80" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="100" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="160" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="180" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="220" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <circle cx="235" cy="178" r="4" fill="rgba(255,255,255,0.15)" />
              <rect x="55" y="163" width="6" height="12" rx="2" fill="rgba(255,255,255,0.15)" />
              <circle cx="58" cy="166" r="2" fill="rgba(252,211,77,0.7)" />
            </g>
          </svg>
        </div>
      </section>

      {/* TRUST BANNER */}
      <div className="lp-trust-banner">
        <div className="lp-trust-stat">
          <div className="lp-trust-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="lp-trust-stat-num">14.000+</div>
          <div className="lp-trust-stat-label">Pendler</div>
        </div>
        <div className="lp-trust-divider" />
        <div className="lp-trust-stat">
          <div className="lp-trust-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div className="lp-trust-stat-num">4.8/5</div>
          <div className="lp-trust-stat-label">Bewertung</div>
        </div>
        <div className="lp-trust-divider" />
        <div className="lp-trust-stat">
          <div className="lp-trust-stat-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div className="lp-trust-stat-num">&lt;60s</div>
          <div className="lp-trust-stat-label">Alert-Zeit</div>
        </div>
      </div>

      {/* 9 vs 1 */}
      <section className="lp-nine-one-section">
        <div className="lp-eyebrow">☕ Dein Morgen, neu gedacht</div>
        <h2>9 von 10 Pendlern<br />machen das hier.</h2>

        <div className="lp-nine-card">
          <div className="lp-nine-card-header">
            <div className="lp-nine-number">9<span>/10</span></div>
            <div className="lp-nine-label">Pendler ohne Pendly</div>
          </div>
          <div className="lp-nine-steps">
            {[
              ['😴', 'Aufwachen. Direkt zum Handy greifen.'],
              ['📱', 'DB Navigator öffnen. Warten bis er lädt.'],
              ['🔍', 'Route manuell checken. Verspätungen suchen.'],
              ['🤞', 'Hoffen dass heute alles normal läuft.'],
              ['😤', 'Am Bahnsteig merken: Zug fällt aus.'],
            ].map(([icon, text], i) => (
              <div className="lp-nine-step" key={i}>
                <div className="lp-nine-step-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-one-card">
          <div className="lp-one-card-header">
            <div className="lp-one-number">1<span>/10</span></div>
            <div className="lp-one-label">Pendler mit Pendly</div>
          </div>
          <div className="lp-one-steps">
            {[
              ['😴', 'Aufwachen.'],
              ['📲', 'Einmal aufs Handy schauen – keine Nachricht von Pendly.'],
              ['☕', 'Entspannt Kaffee trinken. Pendly hat alles im Blick.'],
            ].map(([icon, text], i) => (
              <div className="lp-one-step" key={i}>
                <div className="lp-one-step-icon">{icon}</div>
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="lp-one-card-footer">
            Pendly überwacht deine gespeicherten Routen rund um die Uhr – und meldet sich nur, wenn wirklich etwas los ist.
          </div>
        </div>
      </section>

      {/* USP / FEATURES */}
      <section className="lp-usp-section">
        <div className="lp-eyebrow">✨ Was Pendly für dich tut</div>
        <h2>Dein stiller<br /><em>Zugwächter.</em></h2>

        <div className="lp-usp-cards">
          {[
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Routen einmal speichern', desc: 'Leg deine täglichen Strecken an – Pendly überwacht sie ab sofort automatisch, jeden Tag.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title: 'Echtzeit-Überwachung', desc: 'Verspätungen, Ausfälle, Gleisänderungen – Pendly erkennt es bevor die DB es offiziell anzeigt.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>, title: 'Nur eine Nachricht', desc: 'Kein Rauschen. Du wirst nur benachrichtigt wenn du wirklich handeln musst – sonst: Stille.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>, title: 'Alternative sofort dabei', desc: 'Fällt dein Zug aus, zeigt Pendly die beste Alternative – inklusive ob du es noch rechtzeitig schaffst.' },
            { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E4ED8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title: 'Stammzüge & Puffer', desc: 'Speichere die 7:12, die 6:58 als Backup und die 8:00 für schlechte Tage. Pendly kennt deinen Rhythmus.' },
          ].map((f, i) => (
            <div className="lp-usp-card" key={i}>
              <div className="lp-usp-ico">{f.icon}</div>
              <div>
                <div className="lp-usp-title">{f.title}</div>
                <div className="lp-usp-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="lp-section lp-how-section">
        <div className="lp-eyebrow">🚀 So funktioniert's</div>
        <h2>In 3 Minuten<br /><em>eingerichtet.</em></h2>

        <div className="lp-steps">
          {[
            { title: 'Route einrichten', desc: 'Start- und Zielhaltestelle eingeben. Pendly findet alle Verbindungen automatisch – DB, S-Bahn, RE, Bus.' },
            { title: 'Stammzüge wählen', desc: 'Deine täglichen Züge speichern – plus die Verbindung davor als Backup für stressige Morgen.' },
            { title: 'Handy weglegen', desc: 'Pendly überwacht alles. Du bekommst nur eine Nachricht, wenn wirklich etwas los ist.' },
          ].map((s, i) => (
            <div className="lp-step" key={i}>
              <div className="lp-step-num">{i + 1}</div>
              <div className="lp-step-body">
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="lp-proof-section">
        <div className="lp-proof-inner">
          <div className="lp-eyebrow">💬 Stimmen</div>
          <h2>Pendler<br /><em>lieben es.</em></h2>
        </div>

        <div className="lp-marquee-wrap">
          <div className="lp-marquee-fade-left" />
          <div className="lp-marquee-fade-right" />

          <div className="lp-marquee-track">
            <div className="lp-marquee-inner lp-marquee-left">
              {[...testimonials1, ...testimonials1].map(renderTestimonial)}
            </div>
          </div>

          <div className="lp-marquee-track">
            <div className="lp-marquee-inner lp-marquee-right">
              {[...testimonials2, ...testimonials2].map(renderTestimonial)}
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="lp-section lp-pricing-section">
        <div className="lp-eyebrow">💰 Faire Preise</div>
        <h2>Ein Preis.<br /><em>Alles drin.</em></h2>

        <div className="lp-pricing-card">
          <div className="lp-trial-badge">✓ 7 Tage kostenlos testen</div>
          <div className="lp-price-row">
            <div className="lp-price-big">4,99</div>
            <div className="lp-price-unit">€ / Monat</div>
          </div>
          <div className="lp-price-annual">oder 39,99 € / Jahr (spare 33%)</div>

          <ul className="lp-feature-checklist">
            {['Unbegrenzte Routen', 'Echtzeit-Monitoring 24/7', 'Push-Benachrichtigungen', 'Gleis- & Alternativ-Alerts', 'Keine Werbung, nie'].map((f, i) => (
              <li key={i}><span className="lp-chk">✓</span>{f}</li>
            ))}
          </ul>

          <button onClick={() => navigate('/auth')} className="lp-btn lp-btn-primary">
            Jetzt 7 Tage kostenlos testen
          </button>
          <div className="lp-pricing-footer">Jederzeit kündbar · Keine Kreditkarte nötig</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="lp-faq-section">
        <div className="lp-eyebrow">❓ Häufige Fragen</div>
        <h2>Noch <em>Fragen?</em></h2>

        <div className="lp-faq-items">
          {faqs.map((faq, i) => (
            <div
              className={`lp-faq-item ${openFaq === i ? 'open' : ''}`}
              key={i}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="lp-faq-q">
                <span>{faq.q}</span>
                <svg className="lp-faq-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
              <div className="lp-faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="lp-final-cta">
        <h2>Bereit für<br /><em>stressfreies Pendeln?</em></h2>
        <p>Schließe dich <strong>14.000 Pendlern</strong> an, die morgens entspannt bleiben – weil Pendly aufpasst.</p>

        <div className="lp-trust-line lp-trust-line-light">
          <div className="lp-trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            DSGVO-konform
          </div>
          <div className="lp-trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Server in DE
          </div>
          <div className="lp-trust-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Jederzeit kündbar
          </div>
        </div>

        <button onClick={() => navigate('/auth')} className="lp-btn lp-btn-primary">
          Kostenlos starten
        </button>
        <div className="lp-pricing-footer" style={{ marginTop: 14 }}>Keine Kreditkarte · 7 Tage gratis · Sofort loslegen</div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        © 2025 Pendly · <Link to="/legal">Impressum</Link> · <Link to="/legal">Datenschutz</Link> · <Link to="/legal">AGB</Link>
      </footer>
    </div>
  );
}
