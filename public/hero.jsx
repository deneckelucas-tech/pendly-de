/* Hero — premium aurora composition with authentic phone mockup. */

function HeroRailArt({ variant }) {
  // Architectural geometric line-art: receding rails, station hint
  const lineColor = variant === 'cream' ? 'rgba(30,78,216,0.12)' : 'rgba(255,255,255,0.10)';
  const accentColor = variant === 'cream' ? 'rgba(30,78,216,0.20)' : 'rgba(252,211,77,0.30)';
  const fillColor = variant === 'cream' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.04)';

  return (
    <svg className="hero-railart" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" fill="none">
      <defs>
        <linearGradient id="railFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0"/>
          <stop offset="60%" stopColor={lineColor} stopOpacity="1"/>
          <stop offset="100%" stopColor={lineColor} stopOpacity="0.4"/>
        </linearGradient>
        <linearGradient id="horizonGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0"/>
          <stop offset="100%" stopColor={accentColor} stopOpacity="0.5"/>
        </linearGradient>
        <radialGradient id="sunSpot" cx="0.5" cy="1" r="0.6">
          <stop offset="0%" stopColor={accentColor} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={accentColor} stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Horizon glow */}
      <ellipse cx="720" cy="780" rx="900" ry="140" fill="url(#sunSpot)" opacity="0.7"/>

      {/* Distant landscape silhouette */}
      <path d="M0 720 Q200 695 380 710 Q520 720 720 700 Q900 685 1080 705 Q1260 720 1440 695 L1440 900 L0 900 Z"
            fill={fillColor} opacity="0.5"/>
      <path d="M0 760 Q300 745 600 755 Q900 765 1200 750 Q1320 745 1440 755 L1440 900 L0 900 Z"
            fill={fillColor} opacity="0.7"/>

      {/* Vanishing rails — perspective lines */}
      <g opacity="0.9">
        {/* Left rail */}
        <path d="M-80 900 L680 720" stroke="url(#railFade)" strokeWidth="2" strokeLinecap="round"/>
        {/* Right rail */}
        <path d="M1520 900 L760 720" stroke="url(#railFade)" strokeWidth="2" strokeLinecap="round"/>
        {/* Inner left */}
        <path d="M280 900 L700 720" stroke="url(#railFade)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        {/* Inner right */}
        <path d="M1160 900 L740 720" stroke="url(#railFade)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </g>

      {/* Sleepers — receding */}
      <g opacity="0.5">
        {[
          [840, -180, 1620], [820, -100, 1540], [800, -30, 1470],
          [780, 30, 1410], [770, 80, 1360], [760, 120, 1320],
          [750, 155, 1285], [745, 180, 1260], [740, 200, 1240],
        ].map(([y, x1, x2], i) => (
          <line key={i} x1={x1} y1={y} x2={x2} y2={y}
                stroke={lineColor} strokeWidth={1.5 - i * 0.1}
                strokeLinecap="round" opacity={0.8 - i * 0.07}/>
        ))}
      </g>

      {/* Catenary mast silhouettes — minimalist */}
      <g opacity="0.4" stroke={lineColor} strokeWidth="1.2" strokeLinecap="round" fill="none">
        <path d="M120 880 L120 750 L320 745"/>
        <path d="M1320 880 L1320 750 L1120 745"/>
        <path d="M340 800 L340 740 L500 738"/>
        <path d="M1100 800 L1100 740 L940 738"/>
      </g>

      {/* Distant station marker — sign */}
      <g opacity="0.45">
        <line x1="700" y1="720" x2="700" y2="685" stroke={lineColor} strokeWidth="1"/>
        <rect x="675" y="675" width="50" height="14" rx="2"
              fill={fillColor} stroke={lineColor} strokeWidth="0.8" opacity="0.8"/>
      </g>

      {/* Subtle pendly-blue highlight on horizon */}
      <rect x="0" y="700" width="1440" height="80" fill="url(#horizonGlow)"/>

      {/* Floating geometric accents — abstract */}
      <g opacity="0.25">
        <circle cx="180" cy="320" r="3" fill={accentColor}/>
        <circle cx="1260" cy="280" r="2" fill={accentColor}/>
        <circle cx="1340" cy="420" r="4" fill={accentColor}/>
        <circle cx="100" cy="500" r="2.5" fill={accentColor}/>
      </g>
    </svg>
  );
}

function Hero({ variant = 'aurora' }) {
  const isDark = variant !== 'cream';

  React.useEffect(() => {
    document.body.classList.toggle('hero-dark', isDark);
  }, [isDark]);

  return (
    <section className={`hero v-${variant}`}>
      <div className="hero-stars-bg"/>
      <div className="hero-aurora"/>
      <HeroRailArt variant={variant}/>

      <div className="hero-content-wrap">
        {/* TEXT */}
        <div className="hero-text">
          <div className="hero-badge fu">
            <div className="badge-pulse"/>
            Echtzeit · DB &amp; Regionalverkehr
          </div>

          <div className="hero-stars-row fu">
            <div className="star-row">
              <span className="star">★</span><span className="star">★</span>
              <span className="star">★</span><span className="star">★</span>
              <span className="star">★</span>
            </div>
            <span className="hero-stars-text">14.000 Pendler vertrauen Pendly</span>
          </div>

          <h1 className="fu">Hör auf<br/>zu <em>hoffen.</em></h1>

          <p className="hero-sub fu">
            Pendly überwacht deine Strecke und meldet sich nur, wenn{' '}
            <strong>wirklich etwas los ist</strong>. Kein manuelles Checken mehr.
          </p>

          <div className="hero-cta-group fu">
            <a href="#pricing" className="btn-hero">Jetzt 7 Tage kostenlos testen</a>
            <p className="hero-meta">
              <span className="green">● Keine Kreditkarte</span>
              <span className="hero-meta-dot">·</span>
              <span>4,99 €/Monat oder 39,99 €/Jahr</span>
            </p>
          </div>
        </div>

        {/* MOCKUP */}
        <div className="hero-mockup-stage">
          <div className="mockup-glow"/>
          <div className="mockup-orbit"/>
          <div className="mockup-orbit small"/>

          <div className="mockup-tag mockup-tag-1">
            <div className="dot" style={{ background: '#16A34A' }}/>
            <div>
              <div style={{ fontSize: 11, color: '#78716C', fontWeight: 500 }}>Status</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>S3 · pünktlich</div>
            </div>
          </div>

          <div className="mockup-tag mockup-tag-2">
            <div className="dot" style={{ background: '#1E4ED8' }}/>
            <div>
              <div style={{ fontSize: 11, color: '#78716C', fontWeight: 500 }}>Live geprüft</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>vor 8 Sek.</div>
            </div>
          </div>

          <div className="mockup-floater">
            <PendlyMockup variant="today" width={280} height={590} glow/>
          </div>
        </div>
      </div>
    </section>
  );
}

window.Hero = Hero;
