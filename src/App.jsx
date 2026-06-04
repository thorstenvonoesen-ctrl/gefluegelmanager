import { useState } from 'react';

const initialAnimal = {
  ringNr: '',
  tierart: 'Huhn',
  rasse: '',
  farbschlag: '',
  geschlecht: 'unbekannt',
  jahr: String(new Date().getFullYear()),
  status: 'aktiv',
  impfstatus: 'offen',
  zugangVon: '',
  abgangNach: '',
  notizen: ''
};

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [form, setForm] = useState(initialAnimal);

  function updateForm(field, value) {
    setForm({ ...form, [field]: value });
  }

  function saveAnimal(e) {
    e.preventDefault();
    setAnimals([{ ...form, id: Date.now() }, ...animals]);
    setForm(initialAnimal);
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">🐔 <strong>GeflügelManager</strong></div>

        <nav>
          <button className="active">Dashboard</button>
          <button>Tiere</button>
          <button>Impfungen</button>
          <button>Export</button>
          <button>Einstellungen</button>
        </nav>
      </aside>

      <main className="main">
        <section className="hero">
          <div>
            <h1>GeflügelManager</h1>
            <p>Digitale Tier- und Zuchtverwaltung</p>
          </div>
        </section>

        <section className="grid">
          <article className="card">
            <h2>Tier erfassen</h2>

            <form className="animalForm" onSubmit={saveAnimal}>
              <label>
                Ringnummer
                <input value={form.ringNr} onChange={e => updateForm('ringNr', e.target.value)} />
              </label>

              <label>
                Tierart
                <select value={form.tierart} onChange={e => updateForm('tierart', e.target.value)}>
                  <option>Huhn</option>
                  <option>Taube</option>
                  <option>Ente</option>
                  <option>Gans</option>
                  <option>Pute</option>
                  <option>Wachtel</option>
                </select>
              </label>

              <label>
                Rasse
                <select value={form.rasse} onChange={e => updateForm('rasse', e.target.value)}>
                  <option value="">Bitte wählen</option>
                  <option>Ayam Cemani</option>
                  <option>Serama</option>
                  <option>Brahma</option>
                  <option>Zwerg-Wyandotten</option>
                  <option>Seidenhuhn</option>
                  <option>Sonstige</option>
                </select>
              </label>

              <label>
                Farbschlag
                <select value={form.farbschlag} onChange={e => updateForm('farbschlag', e.target.value)}>
                  <option value="">Bitte wählen</option>
                  <option>schwarz</option>
                  <option>weiß</option>
                  <option>wildfarbig</option>
                  <option>goldhalsig</option>
                  <option>silberhalsig</option>
                  <option>sonstige</option>
                </select>
              </label>

              <label>
                Geschlecht
                <select value={form.geschlecht} onChange={e => updateForm('geschlecht', e.target.value)}>
                  <option>unbekannt</option>
                  <option>Hahn</option>
                  <option>Henne</option>
                </select>
              </label>

              <label>
                Jahr
                <input value={form.jahr} onChange={e => updateForm('jahr', e.target.value)} />
              </label>

              <label>
                Status
                <select value={form.status} onChange={e => updateForm('status', e.target.value)}>
                  <option>aktiv</option>
                  <option>verkauft</option>
                  <option>abgegeben</option>
                  <option>verstorben</option>
                </select>
              </label>

              <label>
                Impfstatus
                <select value={form.impfstatus} onChange={e => updateForm('impfstatus', e.target.value)}>
                  <option>offen</option>
                  <option>erledigt</option>
                </select>
              </label>

              <label>
                Zugang: von wem / woher
                <input value={form.zugangVon} onChange={e => updateForm('zugangVon', e.target.value)} />
              </label>

              <label>
                Abgang: an wen / wohin
                <input value={form.abgangNach} onChange={e => updateForm('abgangNach', e.target.value)} />
              </label>

              <label>
                Bis zu 4 Fotos
                <input type="file" accept="image/*" multiple />
              </label>

              <label className="full">
                Notizen
                <textarea value={form.notizen} onChange={e => updateForm('notizen', e.target.value)} />
              </label>

              <button className="primary" type="submit">Tier speichern</button>
            </form>
          </article>

          <article className="card">
            <h2>Tierbestand</h2>

            {animals.length === 0 ? (
              <p>Noch keine Tiere vorhanden.</p>
            ) : (
              <div className="animalList">
                {animals.map(animal => (
                  <div className="animalRow" key={animal.id}>
                    <strong>{animal.ringNr || 'ohne Ringnummer'}</strong>
                    <span>{animal.tierart} · {animal.rasse || 'keine Rasse'} · {animal.geschlecht}</span>
                    <small>Zugang: {animal.zugangVon || '—'} · Abgang: {animal.abgangNach || '—'}</small>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      </main>
    </div>
  );
}
