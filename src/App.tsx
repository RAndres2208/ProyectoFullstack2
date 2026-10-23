
import { EscanerQR } from "./pages/escaner/EscanerQR";
import { ConfirmacionAsistencia } from "./pages/escaner/ConfirmacionAsistencia";
import { Link, Route, Switch, Redirect } from "wouter";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Proyectos } from "./pages/proyectos/Proyectos";
import { Menu } from "./components/menu/Menu";
import { DetalleEvento } from "./pages/eventos/DetalleEvento";
import { ModoOffline } from "./pages/offline/ModoOffline";
import { useAuth } from "react-oidc-context";

const paginasPendientes = [
  { ruta: "/reportes", titulo: "Reportes de impacto" },
  { ruta: "/perfil", titulo: "Perfil y preferencias" },
  { ruta: "/participantes", titulo: "Participantes" },
  { ruta: "/quorum", titulo: "Control de quórum" },
  { ruta: "/encuestas", titulo: "Encuestas" },
  { ruta: "/historial", titulo: "Historial de sincronización" },
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

function DetalleProyecto({ id }: { id: string }) {
  return (
    <PaginaPendiente
      titulo={`Detalle del proyecto: ${id}`}
    />
  );
}

function App() {
  const auth = useAuth();

  // Mientras Cognito comprueba la sesión
  if (auth.isLoading || auth.activeNavigator) {
    return <div>Verificando autenticación...</div>;
  }

  // Si Cognito devuelve un error
  if (auth.error) {
    return (
      <main>
        <h1>Error de autenticación</h1>
        <p>{auth.error.message}</p>

        <button
          type="button"
          onClick={() => void auth.signinRedirect()}
        >
          Intentar iniciar sesión nuevamente
        </button>
      </main>
    );
  }

  // Los usuarios sin sesión no pueden acceder
  // a las páginas privadas de SyncPass
  if (!auth.isAuthenticated) {
    return <Login />;
  }

  // Solo los usuarios autenticados llegan aquí
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      <Route
        path="/dashboard"
        component={Dashboard}
      />

      <Route
        path="/proyectos"
        component={Proyectos}
      />

      <Route
        path="/offline"
        component={ModoOffline}
      />

      <Route
        path="/escaner"
        component={EscanerQR}
      />

      <Route
        path="/asistencia/confirmacion/:id"
        component={ConfirmacionAsistencia}
      />

      <Route path="/proyectos/:id">
        {(params) => (
          <DetalleProyecto id={params.id} />
        )}
      </Route>

      <Route
        path="/eventos/:id"
        component={DetalleEvento}
      />

      {paginasPendientes.map((pagina) => (
        <Route
          key={pagina.ruta}
          path={pagina.ruta}
        >
          <PaginaPendiente titulo={pagina.titulo} />
        </Route>
      ))}

      <Route>
        <main className="pending-content">
          <h1>Página no encontrada</h1>

          <Link href="/dashboard">
            Volver al inicio
          </Link>
        </main>
      </Route>
    </Switch>
  );
}

export default App;
