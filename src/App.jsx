import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabase.js';

const initialAnimal = {
  ringNr: '',
  art: 'Huhn',
  rasse: '',
  farbschlag: '',
  geschlecht: 'unbekannt',
  geburtsjahr: String(new Date().getFullYear()),
  status: 'aktiv',
  zuchtstamm: '',
  vaterRingNr: '',
  mutterRingNr: '',
  zugangVon: '',
  abgangNach: '',
  notizen: '',
  photos: []
};

const initialEggEntry = {
  date: new Date().toISOString().slice(0, 10),
  count: '',
  notes: ''
};
function toAnimalRow(form, imageUrls = []) {
  return {
    ring_nr: form.ringNr,
    art: form.art,
    rasse: form.rasse,
    farbschlag: form.farbschlag,
    geschlecht: form.geschlecht,
    geburtsjahr: form.geburtsjahr,
    status: form.status,
    zuchtstamm: form.zuchtstamm,
    vater_ring_nr: form.vaterRingNr,
    mutter_ring_nr: form.mutterRingNr,
    zugang_von: form.zugangVon,
    abgang_nach: form.abgangNach,
    bild_url: imageUrls[0] || null,
    bild_url_2: imageUrls[1] || null,
    bild_url_3: imageUrls[2] || null,
    bild_url_4: imageUrls[3] || null,
    notizen: form.notizen
  };
}

function fromAnimalRow(row) {
  return {
    id: row.id,
    ringNr: row.ring_nr || '',
    art: row.art || 'Huhn',
    rasse: row.rasse || '',
    farbschlag: row.farbschlag || '',
    geschlecht: row.geschlecht || 'unbekannt',
    geburtsjahr: row.geburtsjahr || '',
    status: row.status || 'aktiv',
    zuchtstamm: row.zuchtstamm || '',
    vaterRingNr: row.vater_ring_nr || '',
    mutterRingNr: row.mutter_ring_nr || '',
    zugangVon: row.zugang_von || '',
    abgangNach: row.abgang_nach || '',
    notizen: row.notizen || '',
    photos: [row.bild_url, row.bild_url_2, row.bild_url_3, row.bild_url_4].filter(Boolean)
  };
}

async function resizeImageFile(file) {
  const maxSize = 1200;
  const quality = 0.75;

  if (!file.type.startsWith('image/')) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0, width, height);

  URL.revokeObjectURL(imageUrl);

  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  if (!blob) {
    return file;
  }

  return new File(
    [blob],
    file.name.replace(/\.[^.]+$/, '.jpg'),
    { type: 'image/jpeg' }
  );
}

export default function App() {
  const [animals, setAnimals] = useState([]);
  const [eggEntries, setEggEntries] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [eggCount, setEggCount] = useState('');
  const [form, setForm] = useState(initialAnimal);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [activePage, setActivePage] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const animalCount = animals.length;

  const activeCount = useMemo(() => {
    return animals.filter(animal => animal.status === 'aktiv').length;
  }, [animals]);
const eggTotal = useMemo(() => {
  return eggEntries.reduce((sum, entry) => sum + Number(entry.count || 0), 0);
}, [eggEntries]);
  useEffect(() => {
    loadAnimals();
  }, []);

  function updateForm(field, value) {
    setForm(current => ({
      ...current,
      [field]: value
    }));
  }

  async function loadAnimals() {
    setLoading(true);
const { data: sessionData } = await supabase.auth.getSession();
const currentUser = sessionData.session?.user;

if (!currentUser) {
  setLoading(false);
  return;
}
 const { data: profileData } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', currentUser.id)
  .single();

let query = supabase
  .from('animals')
  .select('*')
  .order('created_at', { ascending: false });

if (profileData?.role?.trim().toLowerCase() !== 'admin') {
  query = query.eq('owner_id', currentUser.id);
}

const { data, error } = await query;

console.log('SUPABASE DATA', data);
    if (error) {
      setMessage(`Laden fehlgeschlagen: ${error.message}`);
      setLoading(false);
      return;
    }

    setAnimals((data || []).map(fromAnimalRow));
    setLoading(false);
  }
  async function loadEggEntries() {
  const { data: sessionData } = await supabase.auth.getSession();
  const currentUser = sessionData.session?.user;

  if (!currentUser) return;

  const { data, error } = await supabase
    .from('egg_entries')
    .select('*')
    .eq('owner_id', currentUser.id)
    .order('date', { ascending: false });

  if (error) {
    setMessage(`Eierbuch laden fehlgeschlagen: ${error.message}`);
    return;
  }

  setEggEntries(data || []);
}

async function saveEggEntry(event) {
  event.preventDefault();

  const { data: sessionData } = await supabase.auth.getSession();
  const currentUser = sessionData.session?.user;

  if (!currentUser) return;

  const { error } = await supabase
    .from('egg_entries')
    .insert({
      owner_id: currentUser.id,
      date: eggForm.date,
      count: Number(eggForm.count),
      notes: eggForm.notes
    });

  if (error) {
    setMessage(`Eier speichern fehlgeschlagen: ${error.message}`);
    return;
  }

  setEggForm(initialEggEntry);
  
}
async function handleAuth() {
  setMessage('');

  const result =
    authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

  if (result.error) {
    setMessage(result.error.message);
    return;
  }

  setUser(result.data.user);
  await loadAnimals();
  await loadEggEntries();
}
   async function handleForgotPassword() {
  if (!email) {
    setMessage('Bitte E-Mail eingeben.');
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage('Passwort-Link versendet.');
 }

 async function handleLogout() {
  await supabase.auth.signOut();
  setUser(null);
 }

  async function uploadPhotos(files) {
    const selectedFiles = Array.from(files || []).slice(0, 4);
    const urls = [];

    for (let index = 0; index < selectedFiles.length; index += 1) {
      const resizedFile = await resizeImageFile(selectedFiles[index]);
      const fileName = `${Date.now()}-${index}-${resizedFile.name}`;

      const { error } = await supabase.storage
        .from('animal-photos')
        .upload(fileName, resizedFile, {
          upsert: true,
          contentType: resizedFile.type
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from('animal-photos')
        .getPublicUrl(fileName);

      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function saveAnimal(event) {
  event.preventDefault();
  setLoading(true);
  setMessage('');

  try {
  const imageUrls = await uploadPhotos(form.photos);

  const animalRow = toAnimalRow(form, imageUrls);

  const { data: sessionData } = await supabase.auth.getSession();
console.log("USER ID:", sessionData.session.user.id);
  animalRow.owner_id = sessionData.session.user.id;

    if (editingId) {
      const { error } = await supabase
        .from('animals')
        .update(animalRow)
        .eq('id', editingId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('animals')
        .insert(animalRow);

      if (error) throw error;
    }

    setForm(initialAnimal);
    setEditingId(null);
    await loadAnimals();
    setMessage('Tier gespeichert.');
  } catch (error) {
    console.error(error);
    setMessage(`Speichern fehlgeschlagen: ${error.message}`);
  } finally {
    setLoading(false);
  }
}

if (!user) {
  return (
  <div className="appShell">
  <main className="main">
    <article className="authCard">
      <h2>Login</h2>

      <input
        type="email"
        placeholder="E-Mail"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Passwort"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleAuth}>
  {authMode === 'login' ? 'Einloggen' : 'Registrieren'}
</button>

<button
  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
>
  {authMode === 'login' ? 'Konto erstellen' : 'Zum Login'}
</button>

<button onClick={handleForgotPassword}>
  Passwort vergessen
</button>

</article>
</main>
</div>
);
}
return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">🐔 <strong>GeflügelManager</strong></div>

        <nav>
  <button
    className={activePage === 'dashboard' ? 'active' : ''}
    onClick={() => setActivePage('dashboard')}
  >
    Dashboard
  </button>

  <button
    className={activePage === 'tiere' ? 'active' : ''}
    onClick={() => setActivePage('tiere')}
  >
    Tiere
  </button>
<button
  className={activePage === 'eierbuch' ? 'active' : ''}
  onClick={() => setActivePage('eierbuch')}
>
  Eierbuch
</button>
  <button
  className={activePage === 'impfungen' ? 'active' : ''}
  onClick={() => setActivePage('impfungen')}
>
  Impfungen
</button>
  <button>Export</button>
  <button>Einstellungen</button>
</nav>
        <div style={{ marginBottom: '10px', fontSize: '14px' }}>
  Angemeldet als:<br />
  <strong>{user?.email}</strong>
</div>
        <button
  onClick={async () => {
    await supabase.auth.signOut();
    setUser(null);
  }}

>
  Abmelden
</button>
  
      </aside>

      <main className="main">
        {activePage === 'dashboard' && (
  <>
    <section className="dashboardHeader">
      <div>
        <h1>Dashboard</h1>
        <p>Willkommen zurück im GeflügelManager</p>
      </div>
    </section>

    <section className="dashboardStats">
      <article className="statCard">
        <div className="statIcon">🐔</div>
        <div>
          <span>Gesamtzahl Tiere</span>
          <strong>{animalCount}</strong>
          <small>alle registrierten Tiere</small>
        </div>
      </article>

      <article className="statCard">
        <div className="statIcon">🐓</div>
        <div>
          <span>Aktive Tiere</span>
          <strong>{activeCount}</strong>
          <small>aktuell aktiv</small>
        </div>
      </article>

      <article className="statCard">
        <div className="statIcon">🥚</div>
        <div>
          <span>Eier heute</span>
          <strong>{eggEntries.reduce((sum, entry) => sum + entry.count, 0)}</strong>
          <small>frische Eier</small>
        </div>
      </article>

      <article className="statCard">
        <div className="statIcon">📈</div>
        <div>
          <span>Eier diese Woche</span>
          <strong>{eggEntries.reduce((sum, entry) => sum + entry.count, 0)}</strong>
          <small>gesamt gesammelt</small>
        </div>
      </article>
    </section>

    <section className="dashboardGrid">
      <article className="dashboardCard">
        <h2>Letzte Aktivitäten</h2>
        <p>Neues Tier hinzugefügt</p>
        <p>Eierbuch vorbereitet</p>
        <p>Tierverwaltung aktualisiert</p>
      </article>

      <article className="dashboardCard">
        <h2>Eierstatistik</h2>
        <p>Die Eierstatistik wird später eingebaut.</p>
      </article>

      <article className="dashboardCard">
        <h2>Tiere verwalten</h2>
        <p>Deine Tiere erfassen, anzeigen und verwalten.</p>
        <button onClick={() => setActivePage('tiere')}>
          Zu den Tieren →
        </button>
      </article>

      <article className="dashboardCard">
        <h2>Eierbuch</h2>
        <p>Eier erfassen, Übersicht einsehen und Statistiken.</p>
        <button onClick={() => setActivePage('eierbuch')}>
          Zum Eierbuch →
        </button>
      </article>

      <article className="dashboardCard">
        <h2>Impfungen</h2>
        <p>Impfungen und Behandlungen erfassen und verwalten.</p>
        <button onClick={() => setActivePage('impfungen')}>
          Zu den Impfungen →
        </button>
      </article>
    </section>
  </>
)}

        {message && (
          <div className="message">
            {message}
          </div>
        )}
{activePage === 'eierbuch' && (
  <section className="grid">
    <article className="card">
  <h2>Eierbuch</h2>

<label style={{ display: 'block', marginBottom: '8px' }}>
  Tier auswählen
</label>

<select
  value={selectedAnimal}
  onChange={(event) => setSelectedAnimal(event.target.value)}
  style={{ width: '100%', marginBottom: '16px' }}
>
  <option value="">Tier wählen</option>

{animals.map((animal) => (
  <option key={animal.id} value={animal.ringNr}>
    {animal.ringNr}
  </option>
))}
</select>

<label>Anzahl Eier</label>

<input
  type="number"
  placeholder="Anzahl eingeben"
  value={eggCount}
  onChange={(event) => setEggCount(event.target.value)}
  style={{ width: '100%' }}
/>

<button
  onClick={() => {
    setEggEntries([
      ...eggEntries,
      {
        id: Date.now(),
        ringNr: selectedAnimal,
        count: Number(eggCount),
        date: new Date().toISOString().slice(0, 10)
      }
    ]);

    setEggCount('');
    setSelectedAnimal('');
  }}
>
  Eier speichern
</button>
      <h3>Einträge</h3>

{eggEntries.length === 0 ? (
  <p>Noch keine Eier eingetragen.</p>
) : (
  <div style={{ marginTop: '20px' }}>
    {eggEntries.map((entry) => (
      <div
        key={entry.id}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          marginBottom: '10px',
          background: '#18233f',
          borderRadius: '12px'
        }}
      >
        <div>
          <strong>{entry.ringNr}</strong>
          <br />
          {entry.count} Eier
          <br />
          <small>{entry.date}</small>
        </div>

        <button
          onClick={() =>
            setEggEntries(
              eggEntries.filter((item) => item.id !== entry.id)
            )
          }
        >
          Löschen
        </button>
      </div>
    ))}
  </div>
)}
  </article>
  </section>
)}
 {activePage === 'impfungen' && (
  <section className="grid">
    <article className="card">
      <h2>Impfungen</h2>
      <p>Hier erfassen wir später Impfungen und Behandlungen.</p>
    </article>
  </section>
)}       
        {activePage === 'tiere' && (
<section className="grid">
          <article className="card">
            <h2>Tier erfassen</h2>

            <form className="animalForm" onSubmit={saveAnimal}>
              <label>
                Ringnummer
                <input
                  value={form.ringNr}
                  onChange={event => updateForm('ringNr', event.target.value)}
                />
              </label>

              <label>
                Tierart
                <select
                  value={form.art}
                  onChange={event => updateForm('art', event.target.value)}
                >
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
  <input
    value={form.rasse}
    onChange={(event) => updateForm('rasse', event.target.value)}
    placeholder="Rasse eingeben"
  />
</label>

<label>
  Farbschlag
  <input
    value={form.farbschlag}
    onChange={(event) => updateForm('farbschlag', event.target.value)}
    placeholder="Farbschlag eingeben"
  />
</label>

<label>
  Geschlecht
                <select
                  value={form.geschlecht}
                  onChange={event => updateForm('geschlecht', event.target.value)}
                >
                  <option>unbekannt</option>
                  <option>Hahn</option>
                  <option>Henne</option>
                </select>
              </label>

              <label>
                Jahr
                <select
                  value={form.geburtsjahr}
                  onChange={event => updateForm('geburtsjahr', event.target.value)}
                >
                  {Array.from({ length: 16 }, (_, index) => {
                    const year = String(new Date().getFullYear() - index);
                    return (
                      <option key={year}>{year}</option>
                    );
                  })}
                </select>
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={event => updateForm('status', event.target.value)}
                >
                  <option>aktiv</option>
                  <option>verkauft</option>
                  <option>abgegeben</option>
                  <option>verstorben</option>
                </select>
              </label>

              <label>
                Zuchtstamm
                <input
                  value={form.zuchtstamm}
                  onChange={event => updateForm('zuchtstamm', event.target.value)}
                />
              </label>

              <label>
                Vater Ringnr.
                <input
                  value={form.vaterRingNr}
                  onChange={event => updateForm('vaterRingNr', event.target.value)}
                />
              </label>

              <label>
                Mutter Ringnr.
                <input
                  value={form.mutterRingNr}
                  onChange={event => updateForm('mutterRingNr', event.target.value)}
                />
              </label>

              <label>
                Zugang: von wem / woher
                <input
                  value={form.zugangVon}
                  onChange={event => updateForm('zugangVon', event.target.value)}
                />
              </label>

              <label>
                Abgang: an wen / wohin
                <input
                  value={form.abgangNach}
                  onChange={event => updateForm('abgangNach', event.target.value)}
                />
              </label>

              <label className="full">
                Bis zu 4 Fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={event => updateForm('photos', event.target.files)}
                />
              </label>

              <label className="full">
                Notizen
                <textarea
                  value={form.notizen}
                  onChange={event => updateForm('notizen', event.target.value)}
                />
              </label>

              <button className="primary" type="submit" disabled={loading}>
                {loading ? 'Speichert ...' : 'Tier speichern'}
              </button>
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
                    <div className="photoStrip">
                      {animal.photos.length ? (
                        animal.photos.map(photo => (
                          <img key={photo} src={photo} alt="" />
                        ))
                      ) : (
                        <div className="photoPlaceholder">🐔</div>
                      )}
                    </div>

                    <div>
                      <strong>{animal.ringNr || 'ohne Ringnummer'}</strong>
                      <span>{animal.art} · {animal.rasse || 'keine Rasse'} · {animal.geschlecht}</span>
                      <small>
  Status: {animal.status} ...
</small>

<button
  onClick={() => {
    setForm(animal);
    setEditingId(animal.id);
  }}
>
  Bearbeiten
</button>

<button
  onClick={async () => {
    if (!confirm('Tier wirklich löschen?')) return;

    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', animal.id);
  
    if (error) {
      alert(error.message);
      return;
    }

    await loadAnimals();
  }}
>
  Löschen
</button>

</div>
                  </div>
                ))}
              </div>
            )}
</article>
        </section>
      )}
        </main>
    </div>
  );
}
  
