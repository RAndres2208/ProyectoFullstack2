
import { EscanerQR } from "./pages/escaner/EscanerQR";
import { ConfirmacionAsistencia } from "./pages/escaner/ConfirmacionAsistencia";
import { Link, Route, Switch, Redirect } from "wouter";
import { Login } from "./pages/login/Login";
import { SeleccionRol } from "./pages/seleccion/SeleccionRol";
import { VistaPreviaSeleccion } from "./pages/vista-previa/VistaPreviaSeleccion";
import { Dashboard } from "./pages/dashboard/Dashboard";
import { DashboardDocente } from "./pages/docente/DashboardDocente";
import { CursosDocente } from "./pages/docente/CursosDocente";
import { EstudiantesDocente } from "./pages/docente/EstudiantesDocente";
import { AsistenciaDocente } from "./pages/docente/AsistenciaDocente";
import { DashboardEstudiante } from "./pages/estudiante/DashboardEstudiante";
import { MisCursos } from "./pages/estudiante/MisCursos";
import { MiAsistencia } from "./pages/estudiante/MiAsistencia";
import { PerfilEstudiante } from "./pages/estudiante/PerfilEstudiante";
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
import { useRol } from "./auth/roles";
import { useDemoRole } from "./auth/demoRole";
import { useVistaPrevia } from "./auth/vistaPrevia";

function App() {
  const auth = useAuth();
  const { rol, cargando: rolCargando, esDocente, esEstudiante } = useRol();
  const { rolDemo, esModoDemo } = useDemoRole();
  const { activo: vistaPreviaActiva, rol: rolVistaPrevia } = useVistaPrevia();

  // Mientras Cognito comprueba la sesión
  if (auth.isLoading || auth.activeNavigator || rolCargando) {
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
  // a las páginas privadas de SyncPass (excepto modo demo pre-autenticación)
  if (!auth.isAuthenticated) {
    // Permitir modo demo sin autenticación si hay rolDemo guardado
    if (esModoDemo && rolDemo) {
      const rutaDashboard = rolDemo === "docente" ? "/docente/dashboard" : "/estudiante/dashboard";
      return (
        <Switch>
          <Route path="/">
            <Redirect to={rutaDashboard} />
          </Route>
          <Route path="/docente/dashboard"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><DashboardDocente/></></Route>
          <Route path="/docente/cursos"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><CursosDocente/></></Route>
          <Route path="/docente/estudiantes"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><EstudiantesDocente/></></Route>
          <Route path="/docente/asistencia"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><AsistenciaDocente/></></Route>
          <Route path="/estudiante/dashboard"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><DashboardEstudiante/></></Route>
          <Route path="/estudiante/mis-cursos"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><MisCursos/></></Route>
          <Route path="/estudiante/mi-asistencia"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><MiAsistencia/></></Route>
          <Route path="/estudiante/perfil"><><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><PerfilEstudiante/></></Route>
          <Route path="/login"><Login /></Route>
          <Route><Login /></Route>
        </Switch>
      );
    }
    return <Login />;
  }

  // Solo los usuarios autenticados llegan aquí
  const tieneRolReal = esDocente || esEstudiante;
  
  if (vistaPreviaActiva && rolVistaPrevia) {
    const rutaDashboard = rolVistaPrevia === "docente" ? "/docente/dashboard" : "/estudiante/dashboard";
    return (
      <Switch>
        <Route path="/">
          <Redirect to={rutaDashboard} />
        </Route>
        <Route path="/vista-previa" component={VistaPreviaSeleccion} />
        <Route path="/docente/dashboard">{rolVistaPrevia === "docente" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><DashboardDocente/></> : <Redirect to="/" />}</Route>
        <Route path="/docente/cursos">{rolVistaPrevia === "docente" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><CursosDocente/></> : <Redirect to="/" />}</Route>
        <Route path="/docente/estudiantes">{rolVistaPrevia === "docente" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><EstudiantesDocente/></> : <Redirect to="/" />}</Route>
        <Route path="/docente/asistencia">{rolVistaPrevia === "docente" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><AsistenciaDocente/></> : <Redirect to="/" />}</Route>
        <Route path="/estudiante/dashboard">{rolVistaPrevia === "estudiante" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><DashboardEstudiante/></> : <Redirect to="/" />}</Route>
        <Route path="/estudiante/mis-cursos">{rolVistaPrevia === "estudiante" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><MisCursos/></> : <Redirect to="/" />}</Route>
        <Route path="/estudiante/mi-asistencia">{rolVistaPrevia === "estudiante" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><MiAsistencia/></> : <Redirect to="/" />}</Route>
        <Route path="/estudiante/perfil">{rolVistaPrevia === "estudiante" ? <><div style={{position:"fixed",top:0,left:0,right:0,background:"#782f40",color:"#fff",textAlign:"center",padding:"0.25rem",fontSize:"0.75rem",zIndex:1000}}>VISTA PREVIA — DATOS DE DEMOSTRACIÓN</div><PerfilEstudiante/></> : <Redirect to="/" />}</Route>
      </Switch>
    );
  }
  
  if (!tieneRolReal && rol === "desconocido" && !esModoDemo) {
    return <SeleccionRol />;
  }

  // Si hay rol real en Cognito, este SIEMPRE tiene prioridad
  const rolEfectivo = tieneRolReal ? rol : rolDemo;
  const rutaDashboard = rolEfectivo === "docente" ? "/docente/dashboard" : rolEfectivo === "estudiante" ? "/estudiante/dashboard" : "/dashboard";
  
  return (
    <Switch>
      <Route path="/">
        <Redirect to={rutaDashboard} />
      </Route>

      <Route path="/vista-previa" component={VistaPreviaSeleccion} />
      <Route path="/seleccion-rol" component={SeleccionRol} />

      <Route path="/docente/dashboard" component={rolEfectivo === "docente" ? DashboardDocente : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/docente/cursos" component={rolEfectivo === "docente" ? CursosDocente : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/docente/estudiantes" component={rolEfectivo === "docente" ? EstudiantesDocente : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/docente/asistencia" component={rolEfectivo === "docente" ? AsistenciaDocente : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      
      <Route path="/estudiante/dashboard" component={rolEfectivo === "estudiante" ? DashboardEstudiante : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/estudiante/mis-cursos" component={rolEfectivo === "estudiante" ? MisCursos : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/estudiante/mi-asistencia" component={rolEfectivo === "estudiante" ? MiAsistencia : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />
      <Route path="/estudiante/perfil" component={rolEfectivo === "estudiante" ? PerfilEstudiante : () => <Redirect to={tieneRolReal ? rutaDashboard : "/seleccion-rol"} />} />

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
