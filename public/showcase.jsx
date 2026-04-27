/* Showcase — three real app screens side-by-side */

function Showcase() {
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

        <div className="showcase-grid">
          <div className="showcase-item fu">
            <div className="showcase-phone-wrap">
              <PendlyMockup variant="routes" width={240} height={500} tilt={-3}/>
            </div>
            <div className="showcase-caption">
              <div className="showcase-num">01 · Setup</div>
              <div className="showcase-title">Routen einmal anlegen</div>
              <div className="showcase-desc">Stammstrecke, Stammzüge, Wochentage. Pendly findet alles automatisch — DB, S-Bahn, RE, Bus.</div>
            </div>
          </div>

          <div className="showcase-item fu">
            <div className="showcase-phone-wrap">
              <PendlyMockup variant="today" width={240} height={500}/>
            </div>
            <div className="showcase-caption">
              <div className="showcase-num">02 · Heute</div>
              <div className="showcase-title">Status auf einen Blick</div>
              <div className="showcase-desc">Deine nächste Verbindung mit Echtzeit-Status. Grün heißt: Handy weglegen und Kaffee trinken.</div>
            </div>
          </div>

          <div className="showcase-item fu">
            <div className="showcase-phone-wrap">
              <PendlyMockup variant="notif" width={240} height={500} tilt={3}/>
            </div>
            <div className="showcase-caption">
              <div className="showcase-num">03 · Alert</div>
              <div className="showcase-title">Nur wenn's zählt</div>
              <div className="showcase-desc">Fällt dein Zug aus, kommt Pendly mit Alternative — bevor du am Bahnsteig stehst.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

window.Showcase = Showcase;
