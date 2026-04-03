import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import pendlyLogo from "@/assets/logo.png";

export default function LandingPage() {
  const revealRefs = useRef<(HTMLElement | null)[]>([]);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ pct: 0, min: 0, fails: 0, sec: 0 });

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

  useEffect(() => {
    if (!statsRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { pct: 34, min: 8, fails: 147, sec: 0 };
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounters({
        pct: Math.round(targets.pct * ease),
        min: Math.round(targets.min * ease),
        fails: Math.round(targets.fails * ease),
        sec: 0,
      });
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [statsVisible]);

  const reveal = (i: number) => (el: HTMLElement | null) => {
    if (el) revealRefs.current[i] = el;
  };

  const row1Reviews = [
    { text: 'Endlich muss ich morgens nicht mehr den DB Navigator checken. Pendly schreibt mir wenn was schiefläuft.', name: 'Markus K.', initials: 'MK', route: 'Frankfurt → Darmstadt' },
    { text: 'Die Gleisänderungs-Warnung hat mich zweimal gerettet. Hätte sonst am falschen Gleis gestanden.', name: 'Sara L.', initials: 'SL', route: 'Hannover → Hildesheim' },
    { text: 'Ich nehme jeden Morgen die S3 und seit Pendly weiß ich immer vorher ob sie Verspätung hat. Mega.', name: 'Jonas W.', initials: 'JW', route: 'Hamburg → Harburg' },
    { text: 'Einfach die beste Pendler-App die ich kenne. Klar, schnell, zuverlässig.', name: 'Petra M.', initials: 'PM', route: 'München → Augsburg' },
    { text: 'Endlich eine App die mir sagt was ich wissen muss – ohne dass ich selbst suchen muss.', name: 'Tobias R.', initials: 'TR', route: 'Köln → Bonn' },
  ];

  const row2Reviews = [
    { text: 'Mein RE10 fällt ständig aus. Pendly hat mich noch nie im Stich gelassen wenn das passiert.', name: 'Leon S.', initials: 'LS', route: 'Hildesheim → Hannover' },
    { text: 'Ich hab Pendly meiner ganzen Abteilung empfohlen. Alle pendeln, alle lieben es.', name: 'Anna B.', initials: 'AB', route: 'Düsseldorf → Essen' },
    { text: 'Die 4,99 im Monat sind absolut gerechtfertigt. Ich spare damit jeden Morgen Stress und Zeit.', name: 'Michael T.', initials: 'MT', route: 'Stuttgart → Ludwigsburg' },
    { text: 'Push-Notification kam, bevor die DB selbst die Verspätung angezeigt hat. Krass.', name: 'Felix H.', initials: 'FH', route: 'Berlin → Potsdam' },
    { text: 'Habe vorher immer zu spät von Ausfällen erfahren. Mit Pendly ist das Geschichte.', name: 'Julia K.', initials: 'JK', route: 'Bremen → Verden' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

        .lp *,.lp *::before,.lp *::after{box-sizing:border-box;margin:0;padding:0}

        .lp {
          --bg:#000000;
          --card:#0A0A0A;
          --card2:#0D0D0D;
          --amber:#F59E0B;
          --amber-dim:rgba(245,158,11,0.12);
          --amber-glow:rgba(245,158,11,0.06);
          --amber-border:rgba(245,158,11,0.15);
          --text:#F1F5F9;
          --muted:#6B7280;
          --divider:#1A1A1A;
          --green:#22C55E;
          --red:#EF4444;

          background:var(--bg);
          color:var(--text);
          font-family:'DM Sans',sans-serif;
          overflow-x:hidden;
          max-width:100vw;
          -webkit-font-smoothing:antialiased;
          min-height:100vh;
        }

        /* NAV */
        .lp-nav{
          position:fixed;top:0;left:0;right:0;z-index:100;
          display:flex;align-items:center;justify-content:space-between;
          padding:18px 24px;
          background:rgba(10,10,10,0.8);
          backdrop-filter:blur(24px);
          border-bottom:1px solid var(--divider);
        }
        .lp-logo{display:flex;align-items:center;gap:10px}
        .lp-logo img{height:46px;width:auto}
        .lp-logo-text{
          font-family:'Bebas Neue',sans-serif;
          font-size:28px;letter-spacing:2px;color:var(--text);
        }
        .lp-nav-cta{
          background:var(--amber);color:#000;
          font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;
          padding:10px 22px;border-radius:100px;border:none;
          cursor:pointer;text-decoration:none;
          transition:all .2s;
          box-shadow:0 0 20px rgba(245,158,11,0.2);
        }
        .lp-nav-cta:hover{transform:translateY(-1px);box-shadow:0 0 32px rgba(245,158,11,0.35)}

        /* HERO */
        .lp-hero{
          min-height:100svh;
          display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          padding:110px 24px 60px;
          text-align:center;
          position:relative;overflow:hidden;
        }
        .lp-live-pill{
          display:inline-flex;align-items:center;gap:8px;
          background:var(--amber-dim);
          border:1px solid var(--amber-border);
          border-radius:100px;padding:6px 16px;
          font-size:13px;color:var(--amber);font-weight:500;
          margin-bottom:28px;
          animation:lpFadeUp .5s ease both;
        }
        .lp-live-dot{
          width:7px;height:7px;border-radius:50%;
          background:var(--amber);
          animation:lpPulse 2s infinite;
        }
        .lp-h1{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(52px,15vw,100px);
          line-height:.95;
          letter-spacing:2px;
          margin-bottom:12px;
          animation:lpFadeUp .5s .08s ease both;
        }
        .lp-h1 .line2{color:var(--amber);display:block}
        .lp-hero-sub{
          font-size:clamp(15px,3.5vw,20px);
          color:var(--muted);font-weight:300;
          max-width:340px;margin:0 auto 36px;
          line-height:1.6;
          animation:lpFadeUp .5s .16s ease both;
        }
        .lp-hero-sub strong{color:var(--text);font-weight:500}
        .lp-hero-cta-wrap{
          display:flex;flex-direction:column;align-items:center;gap:14px;
          animation:lpFadeUp .5s .24s ease both;
        }
        .lp-btn-main{
          display:inline-block;
          background:var(--amber);color:#000;
          font-family:'DM Sans',sans-serif;font-weight:700;font-size:18px;
          padding:20px 40px;border-radius:100px;
          border:none;cursor:pointer;text-decoration:none;
          width:100%;max-width:340px;text-align:center;
          transition:all .2s;
          box-shadow:0 0 40px rgba(245,158,11,0.3);
          position:relative;overflow:hidden;
        }
        .lp-btn-main::after{
          content:'';position:absolute;inset:0;
          background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.12) 50%,transparent 100%);
          transform:translateX(-100%);transition:transform .5s;
        }
        .lp-btn-main:hover::after{transform:translateX(100%)}
        .lp-btn-main:hover{transform:translateY(-2px);box-shadow:0 0 56px rgba(245,158,11,0.45)}
        .lp-trial-note{font-size:13px;color:var(--green)}
        .lp-trial-note span{color:var(--green);font-weight:500}

        /* MOCK CARD */
        .lp-mock-wrap{
          position:relative;width:100%;max-width:360px;
          margin:48px auto 0;padding:28px 12px;
          animation:lpFadeUp .5s .32s ease both;
        }
        .lp-mock-card{
          background:var(--card);
          border:1px solid var(--amber-border);
          border-radius:24px;padding:24px;
          box-shadow:0 0 40px rgba(245,158,11,0.04),0 40px 80px rgba(0,0,0,0.6);
          text-align:left;position:relative;overflow:hidden;
        }
        .lp-mock-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(245,158,11,0.3),transparent);
        }
        .lp-mock-lbl{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}
        .lp-mock-row{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:4px}
        .lp-mock-time{
          font-family:'Bebas Neue',sans-serif;
          font-size:60px;letter-spacing:2px;line-height:1;color:var(--text);
        }
        .lp-badge-red{background:var(--red);color:#fff;font-size:12px;font-weight:700;padding:5px 12px;border-radius:100px}
        .lp-badge-green{background:rgba(34,197,94,0.15);color:var(--green);border:1px solid rgba(34,197,94,0.3);font-size:12px;font-weight:600;padding:5px 12px;border-radius:100px}
        .lp-mock-route{font-size:14px;color:var(--muted);margin-bottom:18px}
        .lp-mock-route strong{color:var(--text);font-weight:500}
        .lp-progress-track{height:3px;background:var(--divider);border-radius:2px;overflow:hidden;margin-bottom:6px}
        .lp-progress-bar{
          height:100%;width:35%;background:var(--amber);border-radius:2px;
          box-shadow:0 0 10px rgba(245,158,11,0.5);
          animation:lpProgress 5s linear infinite;
        }
        .lp-progress-labels{display:flex;justify-content:space-between;font-size:11px;color:var(--muted)}

        /* Toast */
        .lp-mock-toast{
          position:absolute;top:-4px;right:8px;
          background:#181818;border:1px solid rgba(239,68,68,0.25);
          border-radius:12px;padding:10px 14px;
          font-size:12px;color:var(--text);
          box-shadow:0 8px 32px rgba(0,0,0,0.5);
          white-space:nowrap;
          animation:lpToastIn .5s 1.4s ease both;opacity:0;
          max-width:calc(100% - 16px);
        }
        .lp-toast-icon{color:var(--red);margin-right:6px}
        /* Next connection */
        .lp-mock-next{
          position:absolute;bottom:-4px;left:8px;
          background:#181818;border:1px solid var(--amber-border);
          border-radius:12px;padding:10px 16px;
          font-size:12px;box-shadow:0 8px 32px rgba(0,0,0,0.5);
          animation:lpToastIn .5s 1.8s ease both;opacity:0;
          display:flex;align-items:center;gap:10px;
        }
        .lp-mock-next-label{color:var(--muted);font-size:11px}
        .lp-mock-next-val{color:var(--text);font-weight:600}
        .lp-mock-next-badge{background:rgba(34,197,94,0.12);color:var(--green);font-size:11px;font-weight:600;padding:2px 8px;border-radius:100px;border:1px solid rgba(34,197,94,0.2)}

        /* PAIN */
        .lp-pain{padding:80px 24px;text-align:center;position:relative;z-index:1}
        .lp-pain-label{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--red);font-weight:600;margin-bottom:16px}
        .lp-pain-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(36px,8vw,56px);letter-spacing:1px;line-height:1;margin-bottom:20px;
        }
        .lp-pain-sub{font-size:16px;color:var(--muted);line-height:1.7;max-width:320px;margin:0 auto 48px}
        .lp-pain-cards{display:flex;flex-direction:column;gap:12px}
        .lp-pain-card{
          background:var(--card);border:1px solid var(--divider);
          border-radius:16px;padding:20px;
          display:flex;gap:16px;align-items:flex-start;text-align:left;
        }
        .lp-pain-icon{font-size:22px;min-width:36px;padding-top:2px}
        .lp-pain-card h3{font-size:16px;font-weight:600;margin-bottom:4px;color:var(--text)}
        .lp-pain-card p{font-size:14px;color:var(--muted);line-height:1.5}

        /* STATS */
        .lp-stats{padding:60px 24px;position:relative;z-index:1}
        .lp-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .lp-stat-card{
          background:var(--card);border:1px solid var(--amber-border);
          border-radius:20px;padding:24px 20px;position:relative;overflow:hidden;
        }
        .lp-stat-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(245,158,11,0.25),transparent);
        }
        .lp-stat-card.wide{grid-column:1/-1}
        .lp-stat-number{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(36px,8vw,52px);letter-spacing:2px;
          color:var(--amber);line-height:1;margin-bottom:6px;
        }
        .lp-stat-desc{font-size:13px;color:var(--muted);line-height:1.4}
        .lp-stat-desc strong{color:var(--text);font-weight:500}
        .lp-stat-source{font-size:11px;color:rgba(107,114,128,0.6);margin-top:8px}

        /* HOW */
        .lp-how{padding:60px 24px;position:relative;z-index:1}
        .lp-section-label{font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--amber);font-weight:600;margin-bottom:12px}
        .lp-section-title{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(36px,8vw,56px);letter-spacing:1px;line-height:1;margin-bottom:40px;
        }
        .lp-steps{display:flex;flex-direction:column}
        .lp-step{display:flex;gap:20px;padding-bottom:32px;position:relative}
        .lp-step:not(:last-child)::after{
          content:'';position:absolute;left:19px;top:42px;bottom:0;
          width:1px;background:var(--divider);
        }
        .lp-step-num{
          width:40px;height:40px;min-width:40px;border-radius:50%;
          background:var(--amber-dim);border:1px solid var(--amber-border);
          display:flex;align-items:center;justify-content:center;
          font-family:'Bebas Neue',sans-serif;font-size:18px;color:var(--amber);letter-spacing:1px;
        }
        .lp-step-body h3{font-size:17px;font-weight:600;padding-top:8px;margin-bottom:4px}
        .lp-step-body p{font-size:14px;color:var(--muted);line-height:1.6}

        /* FEATURES */
        .lp-features{padding:20px 24px 60px;position:relative;z-index:1}
        .lp-features-grid{display:flex;flex-direction:column;gap:12px;margin-top:40px}
        .lp-feature{
          background:var(--card);border:1px solid var(--divider);
          border-radius:20px;padding:22px;position:relative;overflow:hidden;
          transition:border-color .3s;
        }
        .lp-feature:hover{border-color:var(--amber-border)}
        .lp-feature::before{
          content:'';position:absolute;top:0;left:0;right:0;height:1px;
          background:linear-gradient(90deg,transparent,rgba(245,158,11,0.15),transparent);
        }
        .lp-feature-top{display:flex;align-items:center;gap:12px;margin-bottom:10px}
        .lp-feature-icon{
          width:40px;height:40px;min-width:40px;
          background:var(--amber-dim);border-radius:10px;
          display:flex;align-items:center;justify-content:center;font-size:18px;
        }
        .lp-feature-title{font-size:17px;font-weight:600}
        .lp-feature p{font-size:14px;color:var(--muted);line-height:1.6}

        /* TESTIMONIALS */
        .lp-testimonials{padding:60px 0;position:relative;z-index:1;overflow:hidden;max-width:100vw}
        .lp-testimonials-header{padding:0 24px;margin-bottom:32px}
        .lp-ticker-wrap{
          position:relative;overflow:hidden;max-width:100vw;
          -webkit-mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
          mask:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);
        }
        .lp-ticker-row{display:flex;gap:16px;margin-bottom:16px;width:max-content}
        .lp-ticker-row.row1{animation:lpScrollLeft 50s linear infinite}
        .lp-ticker-row.row2{animation:lpScrollRight 55s linear infinite}
        .lp-t-card{
          background:var(--card);border:1px solid var(--divider);
          border-radius:20px;padding:20px;width:280px;min-width:280px;flex-shrink:0;
        }
        .lp-t-stars{color:var(--amber);font-size:13px;margin-bottom:10px;letter-spacing:2px}
        .lp-t-text{font-size:14px;color:var(--text);line-height:1.6;margin-bottom:14px}
        .lp-t-author{display:flex;align-items:center;gap:10px}
        .lp-t-avatar{
          width:32px;height:32px;border-radius:50%;
          background:var(--amber-dim);
          display:flex;align-items:center;justify-content:center;
          font-family:'Bebas Neue',sans-serif;font-size:13px;color:var(--amber);letter-spacing:1px;
          flex-shrink:0;
        }
        .lp-t-name{font-size:13px;font-weight:600;margin-bottom:1px}
        .lp-t-route{font-size:11px;color:var(--muted)}
        .lp-t-verified{
          display:inline-flex;align-items:center;gap:4px;
          background:rgba(34,197,94,0.1);color:var(--green);
          border:1px solid rgba(34,197,94,0.2);
          border-radius:100px;padding:2px 8px;font-size:10px;font-weight:600;
          margin-top:4px;
        }

        /* PRICING */
        .lp-pricing{padding:60px 24px;position:relative;z-index:1}
        .lp-pricing-card{
          background:var(--card);border:1px solid rgba(245,158,11,0.2);
          border-radius:28px;padding:32px 24px;position:relative;overflow:hidden;
          box-shadow:0 0 60px rgba(245,158,11,0.05);margin-top:40px;
        }
        .lp-pricing-card::before{
          content:'';position:absolute;top:0;left:0;right:0;height:2px;
          background:linear-gradient(90deg,transparent,var(--amber),transparent);
        }
        .lp-pricing-pill{
          display:inline-block;background:var(--amber-dim);color:var(--amber);
          font-size:12px;font-weight:600;padding:5px 14px;border-radius:100px;
          border:1px solid var(--amber-border);margin-bottom:20px;
        }
        .lp-price-row{display:flex;align-items:baseline;gap:4px;margin-bottom:4px}
        .lp-price-big{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:2px;line-height:1}
        .lp-price-per{font-size:18px;color:var(--muted)}
        .lp-price-trial{font-size:14px;color:var(--green);font-weight:500;margin-bottom:28px}
        .lp-price-features{list-style:none;display:flex;flex-direction:column;gap:12px;margin-bottom:28px}
        .lp-price-features li{display:flex;align-items:center;gap:12px;font-size:15px}
        .lp-check{
          width:22px;height:22px;min-width:22px;
          background:rgba(34,197,94,0.1);border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          color:var(--green);font-size:12px;
        }
        .lp-yearly-box{
          background:#0D0D0D;border:1px solid var(--divider);
          border-radius:16px;padding:16px 20px;
          display:flex;align-items:center;justify-content:space-between;
          margin-top:16px;
        }
        .lp-yearly-box h4{font-size:15px;font-weight:600;margin-bottom:2px}
        .lp-yearly-box p{font-size:13px;color:var(--muted)}
        .lp-save-badge{
          background:rgba(34,197,94,0.1);color:var(--green);
          font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px;
        }
        .lp-fine-print{text-align:center;font-size:13px;color:var(--muted);margin-top:12px}

        /* FINAL CTA */
        .lp-final{padding:60px 24px 80px;text-align:center;position:relative;z-index:1}
        .lp-final h2{
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(44px,10vw,72px);letter-spacing:2px;line-height:1;margin-bottom:16px;
        }
        .lp-final h2 em{font-style:normal;color:var(--amber)}
        .lp-final p{font-size:16px;color:var(--muted);margin-bottom:36px;line-height:1.6}

        /* FOOTER */
        .lp-footer{
          border-top:1px solid var(--divider);padding:24px;
          text-align:center;position:relative;z-index:1;
        }
        .lp-footer p{font-size:13px;color:var(--muted)}
        .lp-footer a{color:var(--muted);text-decoration:none}
        .lp-footer a:hover{color:var(--amber)}

        /* DIVIDER */
        .lp-divider{height:1px;background:var(--divider);margin:0 24px;position:relative;z-index:1}

        /* REVEAL */
        .lp-reveal{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
        .lp-reveal.visible{opacity:1;transform:translateY(0)}

        /* KEYFRAMES */
        @keyframes lpFadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes lpPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.7)}}
        @keyframes lpProgress{0%{width:5%}100%{width:90%}}
        @keyframes lpToastIn{from{opacity:0;transform:translateY(-10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes lpScrollLeft{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes lpScrollRight{from{transform:translateX(-50%)}to{transform:translateX(0)}}
      `}</style>

      <div className="lp">
        {/* NAV */}
        <nav className="lp-nav">
          <div className="lp-logo">
            <img src={pendlyLogo} alt="Pendly Logo" />
            <span className="lp-logo-text">Pend<span style={{color:'var(--amber)'}}>l</span><span style={{color:'var(--amber)'}}>y</span></span>
          </div>
          <a href="/auth" className="lp-nav-cta">Kostenlos testen</a>
        </nav>

        {/* HERO */}
        <section className="lp-hero">
          <div className="lp-live-pill">
            <span className="lp-live-dot" />
            Echtzeit-Daten · Deutsche Bahn &amp; Regionalverkehr
          </div>

          <h1 className="lp-h1">
            Du checkst nicht mehr.
            <span className="line2">Pendly macht das.</span>
          </h1>

          <p className="lp-hero-sub">
            Pendly überwacht deine Routen rund um die Uhr.
            <br />
            Du bekommst nur eine Nachricht, wenn <strong>wirklich etwas los ist</strong>.
          </p>

          <div className="lp-hero-cta-wrap">
            <a href="/auth" className="lp-btn-main">Jetzt kostenlos herunterladen</a>
            <span className="lp-trial-note">
              7 Tage gratis · Dann 4,99 €/Monat · Jederzeit kündbar
            </span>
          </div>

          <div className="lp-mock-wrap">
            <div className="lp-mock-toast">
              <span className="lp-toast-icon">⚠</span>RE 10 fällt aus – Alternative gefunden
            </div>

            <div className="lp-mock-card">
              <div className="lp-mock-lbl">Nächste Abfahrt</div>
              <div className="lp-mock-row">
                <div className="lp-mock-time">07:39</div>
                <span className="lp-badge-red">Ausfall</span>
              </div>
              <div className="lp-mock-route">
                <strong>RE 10</strong> · Hildesheim Ost → Hannover Hbf
              </div>
              <div className="lp-progress-track">
                <div className="lp-progress-bar" />
              </div>
              <div className="lp-progress-labels">
                <span>Jetzt</span>
                <span>Abfahrt</span>
              </div>
            </div>

            <div className="lp-mock-next">
              <div>
                <div className="lp-mock-next-label">Alternative</div>
                <span className="lp-mock-next-val">07:52 · S3</span>
              </div>
              <span className="lp-mock-next-badge">Pünktlich</span>
            </div>
          </div>
        </section>

        {/* PAIN */}
        <section className="lp-pain lp-reveal" ref={reveal(0)}>
          <div className="lp-pain-label">Das kennt jeder Pendler</div>
          <h2 className="lp-pain-title">Jeden Morgen<br />dasselbe Spiel.</h2>
          <p className="lp-pain-sub">DB Navigator öffnen. Warten. Hoffen. Meistens zu spät informiert werden.</p>
          <div className="lp-pain-cards">
            <div className="lp-pain-card">
              <div className="lp-pain-icon">😤</div>
              <div>
                <h3>Du erfährst es zu spät</h3>
                <p>Die Bahn zeigt Verspätungen oft erst an, wenn der Zug schon weg sein sollte.</p>
              </div>
            </div>
            <div className="lp-pain-card">
              <div className="lp-pain-icon">📱</div>
              <div>
                <h3>Du checkst ständig selbst</h3>
                <p>Jeden Morgen, jeden Abend – öffnest du die App. Manuell. Obwohl dein Handy eigentlich für dich arbeiten sollte.</p>
              </div>
            </div>
            <div className="lp-pain-card">
              <div className="lp-pain-icon">🚉</div>
              <div>
                <h3>Falsches Gleis, falscher Zug</h3>
                <p>Gleisänderungen kommen kurzfristig. Wenn du nicht hinschaust, stehst du am falschen Gleis.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* STATS */}
        <section className="lp-stats lp-reveal" ref={reveal(1)}>
          <div className="lp-section-label">Die Realität</div>
          <div className="lp-section-title" style={{ marginBottom: 32 }}>Zahlen lügen nicht.</div>
          <div className="lp-stats-grid">
            <div className="lp-stat-card">
              <div className="lp-stat-number">0%</div>
              <div className="lp-stat-desc"><strong>aller Fernzüge</strong> kamen 2023 verspätet an</div>
              <div className="lp-stat-source">Quelle: Deutsche Bahn AG</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-number">0 Min</div>
              <div className="lp-stat-desc"><strong>durchschnittliche Verspätung</strong> pro Tag</div>
              <div className="lp-stat-source">Quelle: Statista 2023</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-number">0</div>
              <div className="lp-stat-desc"><strong>Zugausfälle</strong> täglich in Deutschland</div>
              <div className="lp-stat-source">Quelle: Bundesnetzagentur</div>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-number">0 s</div>
              <div className="lp-stat-desc"><strong>Reaktionszeit</strong> von Pendly bei Störungen</div>
              <div className="lp-stat-source">Echtzeit-Monitoring</div>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* HOW */}
        <section className="lp-how lp-reveal" ref={reveal(2)}>
          <div className="lp-section-label">So funktioniert's</div>
          <div className="lp-section-title">In 3 Minuten<br />eingerichtet.</div>
          <div className="lp-steps">
            {[
              { n: '1', title: 'Route einrichten', desc: 'Start- und Zielhaltestelle eingeben. Pendly findet alle deine Verbindungen automatisch.' },
              { n: '2', title: 'Abfahrtszeiten wählen', desc: 'Deine Stammzüge speichern – plus die Verbindungen davor und danach als Puffer.' },
              { n: '3', title: 'Entspannt pendeln', desc: 'Pendly überwacht alles. Du bekommst nur eine Notification, wenn wirklich etwas los ist.' },
            ].map((s, i) => (
              <div className="lp-step" key={i}>
                <div className="lp-step-num">{s.n}</div>
                <div className="lp-step-body">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="lp-divider" />

        {/* FEATURES */}
        <section className="lp-features lp-reveal" ref={reveal(3)}>
          <div className="lp-section-label">Was Pendly kann</div>
          <div className="lp-section-title">Dein stiller<br />Zugwächter.</div>
          <div className="lp-features-grid">
            {[
              { icon: '⚡', title: 'Sofort-Alerts', desc: 'Verspätung, Ausfall, Gleisänderung – du weißt es als Erster. Direkt aufs Handy, bevor die DB es selbst anzeigt.' },
              { icon: '🔀', title: 'Automatische Alternativen', desc: 'Fällt dein Zug aus, zeigt Pendly sofort die beste Alternative – inklusive ob du es noch rechtzeitig schaffst.' },
              { icon: '🗺', title: 'Mehrere Routen & Puffer', desc: 'Speichere die 7:12, die 6:58 als Backup und die 8:00 für schlechte Tage. Pendly kennt deinen Rhythmus.' },
              { icon: '📊', title: 'Verspätungs-Verlauf', desc: 'Wie zuverlässig ist deine Linie wirklich? Sieh die echte Pünktlichkeitsquote – Woche für Woche.' },
            ].map((f, i) => (
              <div className="lp-feature" key={i}>
                <div className="lp-feature-top">
                  <div className="lp-feature-icon">{f.icon}</div>
                  <div className="lp-feature-title">{f.title}</div>
                </div>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="lp-divider" />

        {/* TESTIMONIALS */}
        <section className="lp-testimonials lp-reveal" ref={reveal(4)}>
          <div className="lp-testimonials-header">
            <div className="lp-section-label">Stimmen</div>
            <div className="lp-section-title">Pendler<br />lieben es.</div>
          </div>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker-row row1">
              {[...Array(2)].flatMap((_, dup) =>
                row1Reviews.map((t, i) => (
                  <div className="lp-t-card" key={`r1-${dup}-${i}`}>
                    <div className="lp-t-stars">★★★★★</div>
                    <div className="lp-t-text">"{t.text}"</div>
                    <div className="lp-t-author">
                      <div className="lp-t-avatar">{t.initials}</div>
                      <div>
                        <div className="lp-t-name">{t.name}</div>
                        <div className="lp-t-route">{t.route}</div>
                        <span className="lp-t-verified">✓ Verifiziert</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="lp-ticker-row row2">
              {[...Array(2)].flatMap((_, dup) =>
                row2Reviews.map((t, i) => (
                  <div className="lp-t-card" key={`r2-${dup}-${i}`}>
                    <div className="lp-t-stars">★★★★★</div>
                    <div className="lp-t-text">"{t.text}"</div>
                    <div className="lp-t-author">
                      <div className="lp-t-avatar">{t.initials}</div>
                      <div>
                        <div className="lp-t-name">{t.name}</div>
                        <div className="lp-t-route">{t.route}</div>
                        <span className="lp-t-verified">✓ Verifiziert</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* PRICING */}
        <section className="lp-pricing lp-reveal" ref={reveal(5)}>
          <div className="lp-section-label">Preise</div>
          <div className="lp-section-title">Einfach.<br />Fair. Klar.</div>
          <div className="lp-pricing-card">
            <div className="lp-pricing-pill">7 Tage kostenlos testen</div>
            <div className="lp-price-row">
              <span className="lp-price-big">4,99</span>
              <span className="lp-price-per">€ / Monat</span>
            </div>
            <div className="lp-price-trial">✓ Erste 7 Tage vollständig gratis – keine Kreditkarte nötig</div>
            <ul className="lp-price-features">
              {['Unbegrenzte Routen', 'Echtzeit Push-Benachrichtigungen', 'Gleisänderungs-Alerts', 'Automatische Alternativen bei Ausfall', 'Verspätungs-Verlauf & Statistiken', 'Alle Linien – DB, S-Bahn, RE, Bus, Tram'].map((item, i) => (
                <li key={i}><span className="lp-check">✓</span>{item}</li>
              ))}
            </ul>
            <a href="/auth" className="lp-btn-main" style={{ maxWidth: '100%' }}>Jetzt kostenlos herunterladen</a>
            <p className="lp-fine-print">Keine Kreditkarte. Keine Werbung. Jederzeit kündbar.</p>
            <div className="lp-yearly-box">
              <div>
                <h4>Jahresabo</h4>
                <p>39,99 € / Jahr · 3,33 € pro Monat</p>
              </div>
              <span className="lp-save-badge">–33%</span>
            </div>
          </div>
        </section>

        <div className="lp-divider" />

        {/* FINAL CTA */}
        <section className="lp-final">
          <h2>Dein Morgen.<br />Dein <em>Zeitplan</em>.</h2>
          <p>Hör auf, jeden Morgen die Bahn-App zu checken.<br />Pendly macht das für dich.</p>
          <a href="/auth" className="lp-btn-main">Jetzt kostenlos herunterladen</a>
          <div className="lp-trial-note" style={{ marginTop: 14 }}>
            7 Tage gratis · Dann 4,99 €/Monat
          </div>
        </section>

        {/* FOOTER */}
        <footer className="lp-footer">
          <p>
            © 2025 Pendly · LMD Commerce ·{" "}
            <Link to="/legal#impressum">Impressum</Link> ·{" "}
            <Link to="/legal#datenschutz">Datenschutz</Link> ·{" "}
            <Link to="/legal#agb">AGB</Link>
          </p>
        </footer>
      </div>
    </>
  );
}
