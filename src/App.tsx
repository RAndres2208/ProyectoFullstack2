
import { Link, Route, Switch } from "wouter";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Proyectos } from "./pages/proyectos/Proyectos";
import { Menu } from "./components/menu/Menu";

const paginasPendientes = [
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
    <div className="pending-layout">
      <Menu />

      <main className="pending-content">
        <h1>{titulo}</h1>
        <p>
          Esta pantalla será implementada siguiendo
          los mockups de SyncPass.
        </p>

        <Link href="/dashboard">
          ← Volver al panel principal
        </Link>
      </main>
    </div>
  );
}

function DetalleProyecto({
  id,
}: {
  id: string;
}) {
  return (
    <PaginaPendiente
      titulo={`Detalle del proyecto: ${id}`}
    />
  );
}

function App() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />

      <Route path="/proyectos" component={Proyectos} />

      <Route path="/proyectos/:id">
        {(params) => <DetalleProyecto id={params.id} />}
      </Route>

      {paginasPendientes.map((pagina) => (
        <Route key={pagina.ruta} path={pagina.ruta}>
          <PaginaPendiente titulo={pagina.titulo} />
        </Route>
      ))}

      <Route>
        <main className="pending-content">
          <h1>Página no encontrada</h1>
          <Link href="/dashboard">Volver al inicio</Link>
        </main>
      </Route>
    </Switch>
  );
}

export default App;
