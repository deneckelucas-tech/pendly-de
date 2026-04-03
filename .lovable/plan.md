## Neuer Verbindungs-Wizard Flow

### Step 4: Ankunftszeit (NEU)
- Frage: "Wann musst du am Ziel sein?"
- Time-Picker für die gewünschte Ankunftszeit
- API wird mit `arrival` statt `departure` gesucht → optimale Routen

### Step 5: Verbindungen wählen (ÜBERARBEITET)  
- Zeigt die besten Verbindungen basierend auf Ankunftszeit
- User kann eine oder mehrere auswählen
- **Neuer Button unten: "Route manuell zusammenstellen"**

### Step 5b: Manuelle Verbindung (NEU)
- User kann einzelne Legs selbst zusammenbauen:
  1. Startbahnhof (vorausgefüllt mit Route-Start)
  2. Abfahrtszeit eingeben
  3. Linie/Zug suchen → zeigt Abfahrten ab dieser Haltestelle
  4. Zielbahnhof wählen
  5. "Umstieg hinzufügen" → neues Leg ab dem letzten Zielbahnhof
- Kann mehrere Legs aneinanderreihen

### Technische Änderungen
- `searchJourneys` mit `arrival` Parameter erweitern
- Neuer Step `ArrivalTimeStep` 
- Neuer Step `ManualJourneyBuilder`
- `JourneySelectStep` um manuellen Modus erweitern
