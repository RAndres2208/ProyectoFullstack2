
import { Link, Route, Switch } from "wouter";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Menu } from "./components/menu/Menu";

const paginasPendientes = [
  { ruta: "/proyectos", titulo: "Proyectos comunitarios" },
  { ruta: "/reportes", titulo: "Reportes de impacto" },
  { ruta: "/perfil", titulo: "Perfil y preferencias" },
  { ruta: "/participantes", titulo: "Participantes" },
  { ruta: "/quorum", titulo: "Control de quórum" },
  { ruta: "/encuestas", titulo: "Encuestas" },
  { ruta: "/offline", titulo: "Modo offline" },
  { ruta: "/historial", titulo: "Historial de sincronización" },
  { ruta: "/eventos/evt-016", titulo: "Detalle del evento" },
];

function PaginaPendiente({ titulo }: { titulo: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        minHeight: "100vh",
        background: "#f4f7fb",
      }}
    >
      <style>
        {`
          @media (min-width: 900px) {
            .pending-layout {
              grid-template-columns: 245px minmax(0, 1fr) !important;
            }
          }
        `}
      </style>

      <div
        className="pending-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          minHeight: "100vh",
        }}
      >
        <Menu />

        <main
          style={{
            padding: "64px 24px 120px",
            maxWidth: "850px",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <h1 style={{ fontSize: "30px", marginBottom: "16px" }}>
            {titulo}
          </h1>

          <p style={{ color: "#60728e", lineHeight: 1.6 }}>
            Esta pantalla será implementada siguiendo
            los mockups de SyncPass.
          </p>

          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "24px",
              color: "#00877e",
              fontWeight: 700,
            }}
          >
            ← Volver al panel principal
          </Link>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />

      {paginasPendientes.map((pagina) => (
        <Route key={pagina.ruta} path={pagina.ruta}>
          <PaginaPendiente titulo={pagina.titulo} />
        </Route>
      ))}

      <Route>
        <main style={{ padding: "40px" }}>
          <h1>Página no encontrada</h1>
          <Link href="/dashboard">Volver al inicio</Link>
        </main>
      </Route>
    </Switch>
  );
}

export default App;
