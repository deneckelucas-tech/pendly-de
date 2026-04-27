/* Main app entry — wires Hero, Showcase, Tweaks */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "heroVariant": "aurora",
  "showOrbits": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <>
      <Hero variant={tweaks.heroVariant}/>
      <TweaksPanel title="Tweaks">
        <TweakSection title="Hero">
          <TweakRadio
            label="Treatment"
            value={tweaks.heroVariant}
            options={[
              { value: 'aurora', label: 'Aurora' },
              { value: 'midnight', label: 'Midnight' },
              { value: 'cream', label: 'Cream' },
            ]}
            onChange={v => setTweak('heroVariant', v)}
          />
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

function ShowcaseMount() { return <Showcase/>; }

ReactDOM.createRoot(document.getElementById('hero-root')).render(<App/>);
ReactDOM.createRoot(document.getElementById('showcase-root')).render(<ShowcaseMount/>);
