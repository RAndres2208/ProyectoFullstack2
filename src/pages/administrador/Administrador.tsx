import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import {
  decodificarClaimsAccessToken,
  obtenerNombreUsuario,
  ORDEN_ROLES,
  useRoles,
} from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, AvisoDemo, EstadoVacio, Etiqueta } from "../../components/ui/Ui";
import { cursosDemo, estudiantesDemo } from "../../data/cursosData";
import { ListaUsuariosAdmin } from "./ListaUsuariosAdmin";
import { RegistroUsuarioAdmin } from "./RegistroUsuarioAdmin";
import dashboardStyles from "../dashboard/Dashboard.module.css";

function valorTexto(
  registro: unknown,
  clave: string
): string | undefined {
  if (typeof registro !== "object" || registro === null) {
    return undefined;
  }

  const valor = (registro as Record<string, unknown>)[clave];

  return typeof valor === "string" && valor.trim()
    ? valor.trim()
    : undefined;
}

const modulos = [
  {
    nombre: "Usuarios",
    descripcion: "Registro de cuentas institucionales y estado de la gestión de usuarios",
    icono: "👤",
    ruta: "/administrador/usuarios",
  },
  {
    nombre: "Roles y permisos",
    descripcion: "Asignación de grupos de Cognito y alcance de acceso",
    icono: "🛡️",
    ruta: "/administrador/roles",
  },
  {
    nombre: "Cursos",
    descripcion: "Administración global de cursos y docentes",
    icono: "📚",
    ruta: "/administrador/cursos",
  },
  {
    nombre: "Configuración",
    descripcion: "Parámetros generales de la plataforma",
    icono: "⚙️",
    ruta: "/administrador/configuracion",
  },
  {
    nombre: "Proyectos",
    descripcion: "Gestión de proyectos del sistema (API)",
    icono: "▤",
    ruta: "/administrador/proyectos",
  },
];

const estadoModulos = [
  { modulo: "Registro administrativo de usuarios", estado: "Formulario implementado; pendiente de prueba con Cognito" },
  { modulo: "Listado de usuarios", estado: "GET /api/usuarios paginado y persistente" },
  { modulo: "Consulta individual", estado: "GET /api/usuarios/{id} implementado" },
  { modulo: "Baja de cuentas", estado: "DELETE /api/usuarios/{id} con refresco del listado" },
  { modulo: "Modificación de cuentas", estado: "Sin endpoint" },
  { modulo: "Asignación de roles a cuentas existentes", estado: "Sin endpoint" },
  { modulo: "Configuración general", estado: "Sin endpoint" },
];

export function DashboardAdministrador() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);

  return (
    <PageLayout
      titulo="Dashboard Administrador"
      descripcion="Gestión institucional y estado de integración de SyncPass"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <section className={dashboardStyles.welcome}>
        <div>
          <p className={dashboardStyles.welcomeLabel}>Bienvenido/a,</p>
          <h2 className={dashboardStyles.welcomeName}>{nombre}</h2>
          <p className={dashboardStyles.welcomeSubtitle}>
            Administración de usuarios, roles, cursos y configuración
          </p>
        </div>
      </section>

      <AvisoDemo>
        Los indicadores de este panel son de demostración. El formulario de registro
        está implementado para sesiones administrativas reales, pero su funcionamiento
        con Cognito y el backend desplegado aún debe verificarse.
      </AvisoDemo>

      <section className={dashboardStyles.stats}>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>👥</div>
          <div>
            <p className={dashboardStyles.statLabel}>Usuarios de referencia</p>
            <p className={dashboardStyles.statValue}>{estudiantesDemo.length}</p>
          </div>
        </article>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>🛡️</div>
          <div>
            <p className={dashboardStyles.statLabel}>Roles del sistema</p>
            <p className={dashboardStyles.statValue}>{ORDEN_ROLES.length}</p>
          </div>
        </article>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>📚</div>
          <div>
            <p className={dashboardStyles.statLabel}>Cursos de referencia</p>
            <p className={dashboardStyles.statValue}>{cursosDemo.length}</p>
          </div>
        </article>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>⚙️</div>
          <div>
            <p className={dashboardStyles.statLabel}>Módulos por integrar</p>
            <p className={dashboardStyles.statValue}>4</p>
          </div>
        </article>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Módulos de administración</h3>
            <p>Cada módulo indica claramente su estado de disponibilidad</p>
          </div>
        </header>
        <div className={dashboardStyles.actionsGrid}>
          {modulos.map((modulo) => (
            <Link key={modulo.ruta} href={modulo.ruta} className={dashboardStyles.actionCard}>
              <span className={dashboardStyles.actionIcon} aria-hidden="true">{modulo.icono}</span>
              <span>{modulo.nombre}</span>
              <small>{modulo.descripcion}</small>
            </Link>
          ))}
        </div>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Estado de integración</h3>
            <p>Contratos administrativos confirmados para el frontend</p>
          </div>
        </header>
        <div className={dashboardStyles.tableWrapper}>
          <table className={dashboardStyles.table}>
            <thead><tr><th>Funcionalidad</th><th>Estado</th></tr></thead>
            <tbody>
              {estadoModulos.map((item) => (
                <tr key={item.modulo}>
                  <td>{item.modulo}</td>
                  <td><Etiqueta tono="advertencia">{item.estado}</Etiqueta></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Aviso tono="info">
        <strong>Usuarios:</strong> el backend expone GET /api/usuarios para el
        listado paginado, GET /api/usuarios/&#123;id&#125; para la consulta
        individual y DELETE /api/usuarios/&#123;id&#125; para la baja. Todas las
        operaciones requieren ROLE_ADMINISTRADOR. La modificación de cuentas y
        la reasignación de roles siguen sin endpoint confirmado.
      </Aviso>
    </PageLayout>
  );
}

type ModuloPendienteProps = {
  titulo: string;
  descripcion: string;
  detalle: string;
  motivo: string;
};

function ModuloPendiente({ titulo, descripcion, detalle, motivo }: ModuloPendienteProps) {
  return (
    <PageLayout
      titulo={titulo}
      descripcion={descripcion}
      volverA="/administrador/dashboard"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <Aviso tono="advertencia">
        <strong>Módulo pendiente de integración.</strong> {motivo}
      </Aviso>
      <section className={dashboardStyles.section}>
        <EstadoVacio titulo="Sin operaciones disponibles" descripcion={detalle} />
      </section>
      <Aviso tono="info">
        No se muestran formularios ni botones de guardado para evitar simular
        acciones que no llegarían a la API.
      </Aviso>
    </PageLayout>
  );
}

type UsuariosAdministradorProps = {
  soloLectura?: boolean;
};

export function UsuariosAdministrador({ soloLectura = false }: UsuariosAdministradorProps) {
  const auth = useAuth();
  const { roles } = useRoles();
  const accessToken = auth.user?.access_token;
  const claims = decodificarClaimsAccessToken(accessToken);
  const perfil = auth.user?.profile;
  const [versionLista, setVersionLista] = useState(0);

  const autorizado = roles.includes("administrador");
  const idUsuarioActivo =
    valorTexto(claims, "sub") ?? valorTexto(perfil, "sub");
  const emailUsuarioActivo =
    valorTexto(claims, "email") ?? valorTexto(perfil, "email");

  function manejarUsuarioRegistrado() {
    // El alta ya ocurrió en el backend: se consulta nuevamente la API.
    setVersionLista((actual) => actual + 1);
  }

  if (soloLectura) {
    return (
      <ModuloPendiente
        titulo="Gestión de usuarios — Demostración"
        descripcion="Vista previa del módulo administrativo"
        motivo="El registro de usuarios está deshabilitado en modo demostración."
        detalle="Esta vista no permite registrar cuentas reales en AWS Cognito."
      />
    );
  }

  return (
    <PageLayout
      titulo="Gestión de usuarios"
      descripcion="Registro y baja de cuentas institucionales"
      volverA="/administrador/dashboard"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <Aviso tono="info">
        El registro, el listado y la baja requieren una sesión auténtica de
        Cognito con el grupo ADMINISTRADOR. El listado y la consulta individual
        se obtienen desde PostgreSQL mediante la API; la baja se ejecuta con el
        ID real del usuario y refresca la lista al confirmarse.
      </Aviso>
      <RegistroUsuarioAdmin onUsuarioRegistrado={manejarUsuarioRegistrado} />
      <ListaUsuariosAdmin
        accessToken={accessToken}
        autorizado={autorizado}
        idUsuarioActivo={idUsuarioActivo}
        emailUsuarioActivo={emailUsuarioActivo}
        recargaExterna={versionLista}
        onSesionExpirada={() => void auth.signinRedirect()}
      />
    </PageLayout>
  );
}

export function RolesAdministrador() {
  return (
    <ModuloPendiente
      titulo="Roles y permisos"
      descripcion="Asignación de grupos de Cognito"
      motivo="No existe un endpoint confirmado para modificar los roles de cuentas existentes."
      detalle="El backend permite asignar roles durante el registro de usuarios. La modificación posterior de grupos requiere una funcionalidad adicional."
    />
  );
}

export function CursosAdministrador() {
  return (
    <ModuloPendiente
      titulo="Administración de cursos"
      descripcion="Gestión global de cursos y docentes"
      motivo="No hay un endpoint administrativo confirmado para crear, modificar o eliminar cursos globales."
      detalle="La vista docente mantiene un mantenedor de demostración en memoria. La administración global requiere un contrato de API distinto y permisos de alcance institucional."
    />
  );
}

export function ConfiguracionAdministrador() {
  return (
    <ModuloPendiente
      titulo="Configuración general"
      descripcion="Parámetros institucionales de SyncPass"
      motivo="La API no dispone de un endpoint de configuración general confirmado."
      detalle="Los parámetros institucionales, umbrales y opciones globales permanecen pendientes de definición e integración."
    />
  );
}
