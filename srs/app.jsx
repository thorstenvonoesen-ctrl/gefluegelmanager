export default function App() {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          🐔 <strong>GeflügelManager</strong>
        </div>

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
            <p>Formular kommt im nächsten Schritt.</p>
          </article>

          <article className="card">
            <h2>Tierbestand</h2>
            <p>Noch keine Tiere vorhanden.</p>
          </article>
        </section>
      </main>
    </div>
  );
}
