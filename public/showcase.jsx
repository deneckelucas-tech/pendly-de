/* Showcase — three real app screens; horizontal snap carousel on mobile */

function Showcase() {
  const [activeIdx, setActiveIdx] = React.useState(1);
  const gridRef = React.useRef(null);

  const items = [
    { variant: 'routes', tilt: -3, num: '01 · Setup', title: 'Routen einmal anlegen', desc: 'Stammstrecke, Stammzüge, Wochentage. Pendly findet alles automatisch — DB, S-Bahn, RE, Bus.' },
    { variant: 'today', tilt: 0, num: '02 · Heute', title: 'Status auf einen Blick', desc: 'Deine nächste Verbindung mit Echtzeit-Status. Grün heißt: Handy weglegen und Kaffee trinken.' },
    { variant: 'notif', tilt: 3, num: '03 · Alert', title: 'Nur wenn\'s zählt', desc: 'Fällt dein Zug aus, kommt Pendly mit Alternative — bevor du am Bahnsteig stehst.' },
  ];

  // Track active item on scroll (mobile only)
  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const onScroll = () => {
      if (window.innerWidth >= 768) return;
      const cards = grid.querySelectorAll('.showcase-item');
      const center = grid.scrollLeft + grid.clientWidth / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      cards.forEach((c, i) => {
        const cardCenter = c.offsetLeft + c.clientWidth / 2;
        const d = Math.abs(cardCenter - center);
        if (d < closestDist) { closestDist = d; closestIdx = i; }
      });
      setActiveIdx(closestIdx);
    };
    grid.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => grid.removeEventListener('scroll', onScroll);
  }, []);

  // Initial scroll to middle card on mobile
  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || window.innerWidth >= 768) return;
    const middleCard = grid.querySelectorAll('.showcase-item')[1];
    if (middleCard) {
      grid.scrollLeft = middleCard.offsetLeft - (grid.clientWidth - middleCard.clientWidth) / 2;
    }
  }, []);

  const goToDot = (i) => {
    const grid = gridRef.current;
    if (!grid) return;
    const card = grid.querySelectorAll('.showcase-item')[i];
    if (card) {
      grid.scrollTo({ left: card.offsetLeft - (grid.clientWidth - card.clientWidth) / 2, behavior: 'smooth' });
    }
  };

  return (
    <section className="showcase-section">
      <div className="showcase-bg"/>
      <div className="showcase-inner">
        <div className="showcase-head">
          <div className="eyebrow fu">📱 So sieht Pendly aus</div>
          <h2 className="fu">Eine App.<br/><em>Drei Momente.</em></h2>
          <p className="section-sub fu" style={{ margin: '0 auto', textAlign: 'center' }}>
            Vom Anlegen deiner Strecke bis zur Push-Nachricht im richtigen Moment.
          </p>
        </div>

        <div className="showcase-grid" ref={gridRef}>
          {items.map((item, i) => (
            <div className="showcase-item fu" key={item.variant}>
              <div className="showcase-phone-wrap">
                <PendlyMockup variant={item.variant} width={240} height={500} tilt={item.tilt}/>
              </div>
              <div className="showcase-caption">
                <div className="showcase-num">{item.num}</div>
                <div className="showcase-title">{item.title}</div>
                <div className="showcase-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="showcase-dots">
          {items.map((_, i) => (
            <button
              key={i}
              className={`showcase-dot ${i === activeIdx ? 'active' : ''}`}
              onClick={() => goToDot(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

window.Showcase = Showcase;
