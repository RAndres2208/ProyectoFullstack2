import { useAuth } from "react-oidc-context";
import { Link, Redirect, Route, Switch, useLocation } from "wouter";
import { useDemoRole } from "./auth/demoRole";
import { usePerfilActivo } from "./auth/perfilActivo";
import {
  ROLES,
  useRoles,
  type RolSyncPass,
} from "./auth/roles";
import { useVistaPrevia } from "./auth/vistaPrevia";
import { AccesoDenegado } from "./pages/acceso/AccesoDenegado";
import {
  ConfiguracionAdministrador,
  CursosAdministrador,
  DashboardAdministrador,
  RolesAdministrador,
  UsuariosAdministrador,
} from "./pages/administrador/Administrador";
import { AsistenciaCoordinador } from "./pages/coordinador/AsistenciaCoordinador";
import { CursosCoordinador } from "./pages/coordinador/CursosCoordinador";
import { DashboardCoordinador } from "./pages/coordinador/DashboardCoordinador";
import { DocentesCoordinador } from "./pages/coordinador/DocentesCoordinador";
import { VistasRol } from "./pages/demo/VistasRol";
import { AsistenciaDocente } from "./pages/docente/AsistenciaDocente";
import { CursosDocente } from "./pages/docente/CursosDocente";
import { DashboardDocente } from "./pages/docente/DashboardDocente";
import { EstudiantesDocente } from "./pages/docente/EstudiantesDocente";
import { Encuestas } from "./pages/encuestas/Encuestas";
import { ConfirmacionAsistencia } from "./pages/escaner/ConfirmacionAsistencia";
import { EscanerQR } from "./pages/escaner/EscanerQR";
import { DashboardEstudiante } from "./pages/estudiante/DashboardEstudiante";
import { MiAsistencia } from "./pages/estudiante/MiAsistencia";
import { MisCursos } from "./pages/estudiante/MisCursos";
import { PerfilEstudiante } from "./pages/estudiante/PerfilEstudiante";
import { DetalleEvento } from "./pages/eventos/DetalleEvento";
import { Historial } from "./pages/historial/Historial";
import { Login } from "./pages/login/Login";
import { ModoOffline } from "./pages/offline/ModoOffline";
import { Participantes } from "./pages/participantes/Participantes";
import { Perfil } from "./pages/perfil/Perfil";
import { Proyectos } from "./pages/proyectos/Proyectos";
import { DetalleProyecto } from "./pages/proyectos/DetalleProyecto";
import { Quorum } from "./pages/quorum/Quorum";
import { Reportes } from "./pages/reportes/Reportes";
import { SeleccionRol } from "./pages/seleccion/SeleccionRol";
import { VistaPreviaSeleccion } from "./pages/vista-previa/VistaPreviaSeleccion";

function App() {
  const auth = useAuth();
  const [, setLocation] = useLocation();
  const { roles, cargando: rolesCargando } = useRoles();
  const { rolActivo } = usePerfilActivo();
  const { rolDemo, esModoDemo, limpiarRolDemo } = useDemoRole();
  const {
    activo: vistaPreviaActiva,
    rol: rolVistaPrevia,
    salir: salirVistaPrevia,
  } = useVistaPrevia();

  const rutaInicio = rolActivo
    ? ROLES[rolActivo].rutaInicio
    : "/seleccion-rol";

  const puedeAcceder = (...requeridos: RolSyncPass[]) =>
    requeridos.some((rol) => roles.includes(rol));

  // Mientras Cognito comprueba la sesión
  if (auth.isLoading || auth.activeNavigator || rolesCargando) {
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

  // Las personas sin sesión solo pueden entrar al login o a la demo aislada.
  if (!auth.isAuthenticated) {
    if (esModoDemo && rolDemo) {
      return (
        <VistasRol
          rol={rolDemo}
          tipo="demo"
          onSalir={() => {
            limpiarRolDemo();
            setLocation("/");
          }}
          onCambiar={() => {
            setLocation("/seleccion-rol");
          }}
        />
      );
    }

    return <Login />;
  }

  // La vista previa se mantiene separada de la sesión real.
  if (vistaPreviaActiva && rolVistaPrevia) {
    return (
      <VistasRol
        rol={rolVistaPrevia}
        tipo="vista-previa"
        onSalir={() => {
          salirVistaPrevia();
          setLocation("/");
        }}
        onCambiar={() => {
          setLocation("/vista-previa");
        }}
      />
    );
  }

  // Una sesión sin grupos de SyncPass no accede a rutas privadas.
  if (roles.length === 0) {
    if (esModoDemo && rolDemo) {
      return (
        <VistasRol
          rol={rolDemo}
          tipo="demo"
          onSalir={() => {
            limpiarRolDemo();
            setLocation("/");
          }}
          onCambiar={() => {
            setLocation("/seleccion-rol");
          }}
        />
      );
    }

    return <SeleccionRol />;
  }

  return (
    <Switch>
      <Route path="/">
        <Redirect to={rutaInicio} />
      </Route>

      <Route path="/vista-previa" component={VistaPreviaSeleccion} />
      <Route path="/seleccion-rol">
        <Redirect to={rutaInicio} />
      </Route>

      <Route
        path="/docente/dashboard"
        component={
          puedeAcceder("profesor") ? DashboardDocente : AccesoDenegado
        }
      />
      <Route
        path="/docente/cursos"
        component={puedeAcceder("profesor") ? CursosDocente : AccesoDenegado}
      />
      <Route
        path="/docente/estudiantes"
        component={
          puedeAcceder("profesor") ? EstudiantesDocente : AccesoDenegado
        }
      />
      <Route
        path="/docente/asistencia"
        component={
          puedeAcceder("profesor") ? AsistenciaDocente : AccesoDenegado
        }
      />

      <Route
        path="/estudiante/dashboard"
        component={
          puedeAcceder("estudiante") ? DashboardEstudiante : AccesoDenegado
        }
      />
      <Route
        path="/estudiante/mis-cursos"
        component={puedeAcceder("estudiante") ? MisCursos : AccesoDenegado}
      />
      <Route
        path="/estudiante/mi-asistencia"
        component={
          puedeAcceder("estudiante") ? MiAsistencia : AccesoDenegado
        }
      />
      <Route
        path="/estudiante/perfil"
        component={
          puedeAcceder("estudiante") ? PerfilEstudiante : AccesoDenegado
        }
      />

      <Route
        path="/coordinador/dashboard"
        component={
          puedeAcceder("coordinador") ? DashboardCoordinador : AccesoDenegado
        }
      />
      <Route
        path="/coordinador/cursos"
        component={
          puedeAcceder("coordinador") ? CursosCoordinador : AccesoDenegado
        }
      />
      <Route
        path="/coordinador/docentes"
        component={
          puedeAcceder("coordinador") ? DocentesCoordinador : AccesoDenegado
        }
      />
      <Route
        path="/coordinador/asistencia"
        component={
          puedeAcceder("coordinador")
            ? AsistenciaCoordinador
            : AccesoDenegado
        }
      />

      <Route
        path="/administrador/dashboard"
        component={
          puedeAcceder("administrador")
            ? DashboardAdministrador
            : AccesoDenegado
        }
      />
      <Route path="/administrador/usuarios">
        {puedeAcceder("administrador") ? (
          <UsuariosAdministrador />
        ) : (
          <AccesoDenegado />
        )}
      </Route>
      <Route
        path="/administrador/roles"
        component={
          puedeAcceder("administrador")
            ? RolesAdministrador
            : AccesoDenegado
        }
      />
      <Route
        path="/administrador/cursos"
        component={
          puedeAcceder("administrador")
            ? CursosAdministrador
            : AccesoDenegado
        }
      />
      <Route
        path="/administrador/configuracion"
        component={
          puedeAcceder("administrador")
            ? ConfiguracionAdministrador
            : AccesoDenegado
        }
      />

      <Route path="/dashboard">
        <Redirect to={rutaInicio} />
      </Route>
      <Route
        path="/proyectos"
        component={
          puedeAcceder("estudiante", "profesor", "coordinador")
            ? Proyectos
            : AccesoDenegado
        }
      />
      <Route
        path="/proyectos/:id"
        component={
          puedeAcceder("estudiante", "profesor", "coordinador")
            ? DetalleProyecto
            : AccesoDenegado
        }
      />
      <Route
        path="/participantes"
        component={
          puedeAcceder("estudiante", "profesor")
            ? Participantes
            : AccesoDenegado
        }
      />
      <Route
        path="/reportes"
        component={
          puedeAcceder("profesor", "coordinador")
            ? Reportes
            : AccesoDenegado
        }
      />
      <Route path="/perfil" component={Perfil} />
      <Route
        path="/quorum"
        component={
          puedeAcceder("estudiante", "profesor") ? Quorum : AccesoDenegado
        }
      />
      <Route
        path="/encuestas"
        component={
          puedeAcceder("estudiante", "profesor") ? Encuestas : AccesoDenegado
        }
      />
      <Route
        path="/historial"
        component={
          puedeAcceder("estudiante", "profesor") ? Historial : AccesoDenegado
        }
      />
      <Route
        path="/offline"
        component={
          puedeAcceder("estudiante", "profesor") ? ModoOffline : AccesoDenegado
        }
      />

      <Route
        path="/escaner"
        component={puedeAcceder("estudiante") ? EscanerQR : AccesoDenegado}
      />

      <Route
        path="/asistencia/confirmacion/:id"
        component={
          puedeAcceder("estudiante")
            ? ConfirmacionAsistencia
            : AccesoDenegado
        }
      />

      <Route
        path="/eventos/:id"
        component={
          puedeAcceder("estudiante", "profesor")
            ? DetalleEvento
            : AccesoDenegado
        }
      />

      <Route>
        <main className="pending-content">
          <h1>Página no encontrada</h1>

          <Link href={rutaInicio}>Volver al inicio</Link>
        </main>
      </Route>
    </Switch>
  );
}

export default App;
