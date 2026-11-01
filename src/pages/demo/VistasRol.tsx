import { Redirect, Route, Switch } from "wouter";
import { ROLES, type RolSyncPass } from "../../auth/roles";
import { BannerModo } from "../../components/banner-modo/BannerModo";
import {
  ConfiguracionAdministrador,
  CursosAdministrador,
  DashboardAdministrador,
  RolesAdministrador,
  UsuariosAdministrador,
} from "../administrador/Administrador";
import { DashboardCoordinador } from "../coordinador/DashboardCoordinador";
import { CursosCoordinador } from "../coordinador/CursosCoordinador";
import { DocentesCoordinador } from "../coordinador/DocentesCoordinador";
import { AsistenciaCoordinador } from "../coordinador/AsistenciaCoordinador";
import { AsistenciaDocente } from "../docente/AsistenciaDocente";
import { CursosDocente } from "../docente/CursosDocente";
import { DashboardDocente } from "../docente/DashboardDocente";
import { EstudiantesDocente } from "../docente/EstudiantesDocente";
import { Encuestas } from "../encuestas/Encuestas";
import { ConfirmacionAsistencia } from "../escaner/ConfirmacionAsistencia";
import { EscanerQR } from "../escaner/EscanerQR";
import { DashboardEstudiante } from "../estudiante/DashboardEstudiante";
import { MiAsistencia } from "../estudiante/MiAsistencia";
import { MisCursos } from "../estudiante/MisCursos";
import { PerfilEstudiante } from "../estudiante/PerfilEstudiante";
import { DetalleEvento } from "../eventos/DetalleEvento";
import { Historial } from "../historial/Historial";
import { ModoOffline } from "../offline/ModoOffline";
import { Participantes } from "../participantes/Participantes";
import { Perfil } from "../perfil/Perfil";
import { Quorum } from "../quorum/Quorum";
import { Reportes } from "../reportes/Reportes";
import { SeleccionRol } from "../seleccion/SeleccionRol";
import { VistaPreviaSeleccion } from "../vista-previa/VistaPreviaSeleccion";

type VistasRolProps = {
  rol: RolSyncPass;
  tipo: "demo" | "vista-previa";
  onSalir: () => void;
  onCambiar: () => void;
};

/**
 * Recorrido aislado para demostración y vista previa. Solo monta pantallas
 * con datos locales: no incluye el listado de proyectos conectado a la API.
 */
export function VistasRol({
  rol,
  tipo,
  onSalir,
  onCambiar,
}: VistasRolProps) {
  const inicio = ROLES[rol].rutaInicio;

  return (
    <>
      <BannerModo tipo={tipo} onSalir={onSalir} onCambiar={onCambiar} />

      <Switch>
        <Route path="/">
          <Redirect to={inicio} />
        </Route>

        <Route path="/seleccion-rol" component={SeleccionRol} />
        <Route path="/vista-previa" component={VistaPreviaSeleccion} />

        <Route path="/estudiante/dashboard">
          {rol === "estudiante" ? (
            <DashboardEstudiante />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/estudiante/mis-cursos">
          {rol === "estudiante" ? <MisCursos /> : <Redirect to={inicio} />}
        </Route>
        <Route path="/estudiante/mi-asistencia">
          {rol === "estudiante" ? (
            <MiAsistencia />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/estudiante/perfil">
          {rol === "estudiante" ? (
            <PerfilEstudiante />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/escaner">
          {rol === "estudiante" ? <EscanerQR /> : <Redirect to={inicio} />}
        </Route>
        <Route path="/asistencia/confirmacion/:id">
          {rol === "estudiante" ? (
            <ConfirmacionAsistencia />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/eventos/:id">
          {rol === "estudiante" ? (
            <DetalleEvento />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>

        <Route path="/docente/dashboard">
          {rol === "profesor" ? <DashboardDocente /> : <Redirect to={inicio} />}
        </Route>
        <Route path="/docente/cursos">
          {rol === "profesor" ? <CursosDocente /> : <Redirect to={inicio} />}
        </Route>
        <Route path="/docente/estudiantes">
          {rol === "profesor" ? (
            <EstudiantesDocente />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/docente/asistencia">
          {rol === "profesor" ? (
            <AsistenciaDocente />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>

        <Route path="/coordinador/dashboard">
          {rol === "coordinador" ? (
            <DashboardCoordinador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/coordinador/cursos">
          {rol === "coordinador" ? (
            <CursosCoordinador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/coordinador/docentes">
          {rol === "coordinador" ? (
            <DocentesCoordinador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/coordinador/asistencia">
          {rol === "coordinador" ? (
            <AsistenciaCoordinador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>

        <Route path="/administrador/dashboard">
          {rol === "administrador" ? (
            <DashboardAdministrador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/administrador/usuarios">
          {rol === "administrador" ? (
            <UsuariosAdministrador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/administrador/roles">
          {rol === "administrador" ? (
            <RolesAdministrador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/administrador/cursos">
          {rol === "administrador" ? (
            <CursosAdministrador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>
        <Route path="/administrador/configuracion">
          {rol === "administrador" ? (
            <ConfiguracionAdministrador />
          ) : (
            <Redirect to={inicio} />
          )}
        </Route>

        <Route path="/reportes" component={Reportes} />
        <Route path="/encuestas" component={Encuestas} />
        <Route path="/offline" component={ModoOffline} />
        <Route path="/historial" component={Historial} />
        <Route path="/quorum" component={Quorum} />
        <Route path="/participantes" component={Participantes} />
        <Route path="/perfil" component={Perfil} />

        <Route>
          <Redirect to={inicio} />
        </Route>
      </Switch>
    </>
  );
}
