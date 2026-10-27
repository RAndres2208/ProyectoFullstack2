
import { EscanerQR } from "./pages/escaner/EscanerQR";
import { ConfirmacionAsistencia } from "./pages/escaner/ConfirmacionAsistencia";
import { Link, Route, Switch, Redirect } from "wouter";
import { Login } from "./pages/login/Login";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { Proyectos } from "./pages/proyectos/Proyectos";
import { DetalleProyecto } from "./pages/proyectos/DetalleProyecto";
import { DetalleEvento } from "./pages/eventos/DetalleEvento";
import { ModoOffline } from "./pages/offline/ModoOffline";
import { Participantes } from "./pages/participantes/Participantes";
import { Reportes } from "./pages/reportes/Reportes";
import { Perfil } from "./pages/perfil/Perfil";
import { Quorum } from "./pages/quorum/Quorum";
import { Encuestas } from "./pages/encuestas/Encuestas";
import { Historial } from "./pages/historial/Historial";
import { useAuth } from "react-oidc-context";

function App() {
  const auth = useAuth();

  // Mientras Cognito comprueba la sesión
  if (auth.isLoading || auth.activeNavigator) {
    return (
      <main className="auth-estado">
        <section className="auth-tarjeta" aria-live="polite">
          <div className="auth-marca">
            <span aria-hidden="true">▣</span>
            SyncPass
          </div>

          <h1>Verificando autenticación</h1>
          <p>
            Estamos validando tu sesión con Amazon Cognito. Esto puede
            tardar unos segundos.
          </p>

          <span className="auth-spinner" aria-hidden="true" />
        </section>
      </main>
    );
  }

  // Si Cognito devuelve un error
  if (auth.error) {
    return (
      <main className="auth-estado">
        <section className="auth-tarjeta" role="alert">
          <div className="auth-marca">
            <span aria-hidden="true">▣</span>
            SyncPass
          </div>

          <h1>No pudimos validar tu sesión</h1>
          <p>
            Cognito no completó la autenticación. Puedes intentarlo de
            nuevo sin perder los datos de demostración.
          </p>
          <p className="auth-detalle">{auth.error.message}</p>

          <button
            type="button"
            className="auth-boton"
            onClick={() => void auth.signinRedirect()}
          >
            Intentar iniciar sesión nuevamente
          </button>
        </section>
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
        path="/proyectos/:id"
        component={DetalleProyecto}
      />

      <Route
        path="/participantes"
        component={Participantes}
      />

      <Route
        path="/reportes"
        component={Reportes}
      />

      <Route
        path="/perfil"
        component={Perfil}
      />

      <Route
        path="/quorum"
        component={Quorum}
      />

      <Route
        path="/encuestas"
        component={Encuestas}
      />

      <Route
        path="/historial"
        component={Historial}
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

      <Route
        path="/eventos/:id"
        component={DetalleEvento}
      />

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
