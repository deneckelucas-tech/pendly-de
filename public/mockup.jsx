/* Pendly App Mockup — authentic phone screens lifted from the real app.
   Three variants: 'today' (HEUTE view), 'notif' (lock-screen alert),
   'routes' (route management). All sized 280×590 by default. */

const MockupColors = {
  bg: '#FDF8F2',
  card: '#FFFFFF',
  ink: '#1E1A17',
  muted: '#79736E',
  border: '#DFD7CB',
  secondary: '#E9E1D7',
  primary: '#1E4ED8',
  primaryFaint: 'rgba(30,78,216,0.10)',
  green: '#16A34A',
  greenFaint: 'rgba(22,163,74,0.15)',
  red: '#DC2626',
  redFaint: 'rgba(220,38,38,0.15)',
  orange: '#F97316',
  orangeFaint: 'rgba(249,115,22,0.15)',
};

function StatusBar({ time = '8:42', dark = false }) {
  const ink = dark ? '#fff' : '#1E1A17';
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 22px 6px',
      fontFamily: '-apple-system, "SF Pro Text", system-ui, sans-serif',
      fontSize: '14px',
      fontWeight: 600,
      color: ink,
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        {/* Signal */}
        <svg width="16" height="11" viewBox="0 0 16 11" fill={ink}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </svg>
        {/* Wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill={ink}>
          <path d="M7.5 2c2.6 0 5 1 6.8 2.7l-1.4 1.4A7 7 0 0 0 7.5 4 7 7 0 0 0 2.1 6.1L.7 4.7C2.5 3 4.9 2 7.5 2zm0 3.5c1.6 0 3 .6 4.2 1.7l-1.5 1.5A4 4 0 0 0 7.5 7.5a4 4 0 0 0-2.7 1.2L3.3 7.2A6 6 0 0 1 7.5 5.5zm0 3.5c.9 0 1.7.4 2.3 1L7.5 11 5.2 9c.6-.6 1.4-1 2.3-1z"/>
        </svg>
        {/* Battery */}
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
          <rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke={ink} strokeOpacity="0.4" />
          <rect x="2" y="2" width="19" height="8" rx="1.5" fill={ink} />
          <rect x="23.5" y="3.5" width="1.5" height="5" rx="0.75" fill={ink} fillOpacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}

/* HEUTE — main screen, "next train + status" */
function MockTodayScreen() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: MockupColors.bg,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: MockupColors.ink,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: MockupColors.secondary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MockupColors.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 20, fontWeight: 800, letterSpacing: '0.01em', lineHeight: 1,
          }}>HEUTE</div>
          <div style={{ fontSize: 10, color: MockupColors.muted, marginTop: 3 }}>
            Dienstag, 15. Oktober
          </div>
        </div>
        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: MockupColors.card,
          border: `1.5px solid ${MockupColors.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MockupColors.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </div>
      </div>

      {/* Next connection card — primary */}
      <div style={{
        margin: '0 14px 10px',
        background: MockupColors.card,
        border: `1.5px solid rgba(30,78,216,0.20)`,
        borderRadius: 18,
        padding: '14px 14px 12px',
        boxShadow: '0 4px 24px rgba(30,78,216,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{
              fontSize: 8, fontWeight: 700, color: MockupColors.primary,
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3,
            }}>Nächste Verbindung</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontSize: 32, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em',
              }}>09:14</span>
              <span style={{ fontSize: 9, color: MockupColors.muted, fontWeight: 500 }}>Stade → HH Hbf</span>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: MockupColors.greenFaint, color: MockupColors.green,
            fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Pünktlich
          </div>
        </div>

        {/* Legs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Leg time="09:14" line="S3" delay={null} from="Stade" to="HH-Harburg" platform="2" />
          <Leg time="09:42" line="RE 5" delay={null} from="HH-Harburg" to="HH Hbf" last platform="6" />
        </div>

        <div style={{
          fontSize: 8, color: MockupColors.muted, marginTop: 10, paddingTop: 8,
          borderTop: `1px solid ${MockupColors.border}`,
        }}>
          Zuletzt geprüft: 08:42:14
        </div>
      </div>

      {/* Second connection — ALTERNATIVE */}
      <div style={{
        margin: '0 14px 10px',
        background: MockupColors.card,
        border: `1.5px solid ${MockupColors.border}`,
        borderRadius: 18,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: 22, fontWeight: 800, lineHeight: 1,
            }}>09:42</span>
            <span style={{ fontSize: 9, color: MockupColors.muted, fontWeight: 500 }}>Stade → HH Hbf</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: MockupColors.orangeFaint, color: MockupColors.orange,
            fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 100,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            +6 Min
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: MockupColors.muted }}>
          <span style={{
            background: MockupColors.secondary, color: MockupColors.ink,
            padding: '1px 5px', borderRadius: 4, fontSize: 8, fontWeight: 700,
          }}>S3</span>
          <span>Verspätung Bremen</span>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        marginTop: 'auto',
        background: '#F0E8DC',
        borderTop: `1.5px solid ${MockupColors.border}`,
        padding: '10px 24px 24px',
        display: 'flex',
        justifyContent: 'space-around',
      }}>
        {['home', 'today', 'bell', 'gear'].map((k, i) => (
          <NavIcon key={k} icon={k} active={i === 1} />
        ))}
      </div>
    </div>
  );
}

function Leg({ time, line, delay, from, to, platform, last }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 4 }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%',
          background: MockupColors.green,
        }}/>
        {!last && <div style={{ width: 1, height: 24, background: MockupColors.border, marginTop: 2 }}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 11, fontWeight: 700 }}>{time}</span>
          <span style={{
            background: MockupColors.secondary, padding: '1px 5px',
            borderRadius: 4, fontSize: 8, fontWeight: 700,
          }}>{line}</span>
          <span style={{ fontSize: 8, color: MockupColors.muted, marginLeft: 'auto' }}>Gl. {platform}</span>
        </div>
        <div style={{ fontSize: 9, color: MockupColors.muted, marginTop: 2 }}>{from} → {to}</div>
      </div>
    </div>
  );
}

function NavIcon({ icon, active }) {
  const c = active ? MockupColors.primary : MockupColors.muted;
  const paths = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4a1 1 0 0 1-1-1v-6h-4v6a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z"/></>,
    today: <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></>,
    gear: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.4.4 1 .7 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[icon]}
      </svg>
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: active ? MockupColors.primary : 'transparent' }}/>
    </div>
  );
}

/* ============ NOTIFICATION (lock-screen-style) ============ */
function MockNotifScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, #1a3a8f 0%, #1E4ED8 60%, #3d6ef5 100%)',
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 60% 40% at 50% 10%, rgba(255,200,100,0.18) 0%, transparent 60%)',
      }}/>
      <StatusBar dark />

      {/* Big clock */}
      <div style={{ textAlign: 'center', marginTop: 22, position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, letterSpacing: '0.05em' }}>DIENSTAG, 15. OKTOBER</div>
        <div style={{
          fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif',
          fontSize: 76, fontWeight: 200, lineHeight: 1, marginTop: 4,
          letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
        }}>06:42</div>
      </div>

      {/* Notification stack */}
      <div style={{
        marginTop: 38, padding: '0 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
        position: 'relative', zIndex: 1,
      }}>
        {/* Pendly alert */}
        <div style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: '12px 14px',
          color: MockupColors.ink,
          boxShadow: '0 8px 28px rgba(0,0,0,0.18)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 18, height: 18, borderRadius: 5,
              background: MockupColors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </div>
            <div style={{ flex: 1, fontSize: 10, fontWeight: 600 }}>PENDLY</div>
            <div style={{ fontSize: 9, color: MockupColors.muted }}>jetzt</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.3, marginBottom: 3 }}>
            ⚠️ RE 5 um 09:42 fällt aus
          </div>
          <div style={{ fontSize: 10, color: MockupColors.muted, lineHeight: 1.45 }}>
            Alternative gefunden: S3 um 09:14 → Umstieg HH-Harburg → RE 4 um 09:38. Du bist um 10:18 da. Tippe für Details.
          </div>
        </div>

        {/* Earlier — DB Navigator (envy) */}
        <div style={{
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.25)',
          borderRadius: 16,
          padding: '10px 14px',
          fontSize: 10,
          opacity: 0.9,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: '#EC0016' }}/>
            <span style={{ fontWeight: 700, fontSize: 9, opacity: 0.8 }}>DB NAVIGATOR</span>
            <span style={{ marginLeft: 'auto', fontSize: 9, opacity: 0.7 }}>vor 18 Min</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600 }}>Push-Nachricht: Aktion verfügbar</div>
        </div>
      </div>

      {/* Bottom hint */}
      <div style={{ marginTop: 'auto', paddingBottom: 22, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 9, opacity: 0.55, marginBottom: 10 }}>Wischen für Details</div>
        <div style={{ width: 110, height: 4, background: 'rgba(255,255,255,0.5)', borderRadius: 2, margin: '0 auto' }}/>
      </div>
    </div>
  );
}

/* ============ ROUTES (saved routes screen) ============ */
function MockRoutesScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: MockupColors.bg,
      fontFamily: '"DM Sans", system-ui, sans-serif',
      color: MockupColors.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <StatusBar />

      <div style={{ padding: '8px 20px 14px' }}>
        <div style={{
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          fontSize: 22, fontWeight: 800, letterSpacing: '0.01em',
        }}>MEINE ROUTEN</div>
        <div style={{ fontSize: 10, color: MockupColors.muted, marginTop: 3 }}>3 aktiv überwacht</div>
      </div>

      {/* Route cards */}
      <div style={{ padding: '0 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <RouteCard from="Stade" to="HH Hbf" times={['07:14', '07:42', '08:14']} active />
        <RouteCard from="HH Hbf" to="Stade" times={['17:42', '18:14']} />
        <RouteCard from="Stade" to="Lüneburg" times={['10:30']} weekend />
      </div>

      {/* Add route CTA */}
      <button style={{
        margin: '14px 14px 0',
        background: 'transparent',
        border: `1.5px dashed ${MockupColors.border}`,
        borderRadius: 16,
        padding: '14px',
        color: MockupColors.muted,
        fontSize: 11, fontWeight: 600,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontFamily: 'inherit',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Neue Route
      </button>

      <div style={{
        marginTop: 'auto',
        background: '#F0E8DC',
        borderTop: `1.5px solid ${MockupColors.border}`,
        padding: '10px 24px 24px',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {['home', 'today', 'bell', 'gear'].map((k, i) => (
          <NavIcon key={k} icon={k} active={i === 0} />
        ))}
      </div>
    </div>
  );
}

function RouteCard({ from, to, times, active, weekend }) {
  return (
    <div style={{
      background: MockupColors.card,
      border: active ? `1.5px solid rgba(30,78,216,0.20)` : `1.5px solid ${MockupColors.border}`,
      borderRadius: 16,
      padding: '12px 14px',
      boxShadow: active ? '0 4px 24px rgba(30,78,216,0.06)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: active ? MockupColors.primaryFaint : MockupColors.secondary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? MockupColors.primary : MockupColors.muted} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="3"/>
            <path d="M4 14h16"/><path d="M8 19l-2 2"/><path d="M16 19l2 2"/>
            <circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>
            {from} <span style={{ color: MockupColors.muted, fontWeight: 400 }}>→</span> {to}
          </div>
          <div style={{ fontSize: 9, color: MockupColors.muted, marginTop: 2 }}>
            {weekend ? 'Sa, So' : 'Mo–Fr'} · {times.length} Stammzug{times.length > 1 ? 'e' : ''}
          </div>
        </div>
        {active && (
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: MockupColors.green, boxShadow: `0 0 0 3px ${MockupColors.greenFaint}`,
          }}/>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {times.map(t => (
          <span key={t} style={{
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            fontSize: 11, fontWeight: 700,
            background: MockupColors.secondary,
            color: MockupColors.ink,
            padding: '3px 8px', borderRadius: 6,
          }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ============ PHONE FRAME ============ */
function PhoneFrame({ children, width = 280, height = 590, scale = 1, tilt = 0, glow = false }) {
  return (
    <div style={{
      width: width * scale,
      height: height * scale,
      transform: tilt ? `rotate(${tilt}deg)` : undefined,
      filter: glow ? 'drop-shadow(0 30px 80px rgba(0,0,0,0.45)) drop-shadow(0 8px 20px rgba(30,78,216,0.25))' : 'drop-shadow(0 18px 40px rgba(0,0,0,0.28))',
      transition: 'transform 0.4s ease',
    }}>
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 42 * scale,
        background: 'linear-gradient(145deg, #2a2a2c, #0a0a0c)',
        padding: 4 * scale,
        position: 'relative',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }}>
        {/* Inner bezel */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: 38 * scale,
          background: '#000',
          padding: 2 * scale,
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Screen */}
          <div style={{
            width: '100%', height: '100%',
            borderRadius: 36 * scale,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {children}
            {/* Dynamic island */}
            <div style={{
              position: 'absolute',
              top: 8 * scale,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 86 * scale,
              height: 24 * scale,
              borderRadius: 100,
              background: '#000',
              zIndex: 10,
            }}/>
          </div>
        </div>
        {/* Side buttons */}
        <div style={{ position: 'absolute', left: -2 * scale, top: 100 * scale, width: 2 * scale, height: 28 * scale, background: '#1a1a1c', borderRadius: '2px 0 0 2px' }}/>
        <div style={{ position: 'absolute', left: -2 * scale, top: 140 * scale, width: 2 * scale, height: 50 * scale, background: '#1a1a1c', borderRadius: '2px 0 0 2px' }}/>
        <div style={{ position: 'absolute', left: -2 * scale, top: 200 * scale, width: 2 * scale, height: 50 * scale, background: '#1a1a1c', borderRadius: '2px 0 0 2px' }}/>
        <div style={{ position: 'absolute', right: -2 * scale, top: 130 * scale, width: 2 * scale, height: 80 * scale, background: '#1a1a1c', borderRadius: '0 2px 2px 0' }}/>
      </div>
    </div>
  );
}

/* Public exports */
function PendlyMockup({ variant = 'today', ...frameProps }) {
  const Screen = variant === 'notif' ? MockNotifScreen
              : variant === 'routes' ? MockRoutesScreen
              : MockTodayScreen;
  return (
    <PhoneFrame {...frameProps}>
      <Screen />
    </PhoneFrame>
  );
}

Object.assign(window, { PendlyMockup, PhoneFrame, MockTodayScreen, MockNotifScreen, MockRoutesScreen });
