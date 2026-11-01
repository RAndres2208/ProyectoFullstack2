
import { Link } from "wouter";
import { useAuth } from "react-oidc-context";
import { obtenerNombreUsuario, ORDEN_ROLES } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import { cursosDemo, estudiantesDemo } from "../../data/cursosData";
import dashboardStyles from "../dashboard/Dashboard.module.css";

const modulos = [
  {
    nombre: "Usuarios",
    descripcion: "Consulta y administración de cuentas institucionales",
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
];

const estadoModulos = [
  {
    modulo: "Registro administrativo de usuarios",
    estado: "Pendiente de integrar formulario",
  },
  {
    modulo: "Listado de usuarios",
    estado: "Sin endpoint",
  },
  {
    modulo: "Modificación o baja de cuentas",
    estado: "Sin endpoint",
  },
  {
    modulo: "Asignación de roles a cuentas existentes",
    estado: "Sin endpoint",
  },
  {
    modulo: "Configuración general",
    estado: "Sin endpoint",
  },
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
          <p className={dashboardStyles.welcomeLabel}>
            Bienvenido/a,
          </p>
          <h2 className={dashboardStyles.welcomeName}>
            {nombre}
          </h2>
          <p className={dashboardStyles.welcomeSubtitle}>
            Administración de usuarios, roles, cursos y configuración
          </p>
        </div>
      </section>

      <AvisoDemo>
        Los indicadores de este panel son de demostración.
        Los módulos administrativos indican cuáles tienen
        integración disponible y cuáles continúan pendientes.
      </AvisoDemo>

      <section className={dashboardStyles.stats}>
        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>👥</div>
          <div>
            <p className={dashboardStyles.statLabel}>
              Usuarios de referencia
            </p>
            <p className={dashboardStyles.statValue}>
              {estudiantesDemo.length}
            </p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>🛡️</div>
          <div>
            <p className={dashboardStyles.statLabel}>
              Roles del sistema
            </p>
            <p className={dashboardStyles.statValue}>
              {ORDEN_ROLES.length}
            </p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>📚</div>
          <div>
            <p className={dashboardStyles.statLabel}>
              Cursos de referencia
            </p>
            <p className={dashboardStyles.statValue}>
              {cursosDemo.length}
            </p>
          </div>
        </article>

        <article className={dashboardStyles.statCard}>
          <div className={dashboardStyles.statIcon}>⚙️</div>
          <div>
            <p className={dashboardStyles.statLabel}>
              Módulos por integrar
            </p>
            <p className={dashboardStyles.statValue}>4</p>
          </div>
        </article>
      </section>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Módulos de administración</h3>
            <p>
              Cada módulo indica claramente su estado de disponibilidad
            </p>
          </div>
        </header>

        <div className={dashboardStyles.actionsGrid}>
          {modulos.map((modulo) => (
            <Link
              key={modulo.ruta}
              href={modulo.ruta}
              className={dashboardStyles.actionCard}
            >
              <span
                className={dashboardStyles.actionIcon}
                aria-hidden="true"
              >
                {modulo.icono}
              </span>
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
            <p>
              Contratos administrativos confirmados para el frontend
            </p>
          </div>
        </header>

        <div className={dashboardStyles.tableWrapper}>
          <table className={dashboardStyles.table}>
            <thead>
              <tr>
                <th>Funcionalidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {estadoModulos.map((item) => (
                <tr key={item.modulo}>
                  <td>{item.modulo}</td>
                  <td>
                    <Etiqueta tono="advertencia">
                      {item.estado}
                    </Etiqueta>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Aviso tono="advertencia">
        <strong>Registro de usuarios:</strong> el backend dispone de
        POST /api/auth/registro, reservado a Administrador.
        La interfaz de registro todavía está pendiente de integración.
        No existen endpoints confirmados para listar, modificar
        o eliminar cuentas existentes.
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

function ModuloPendiente({
  titulo,
  descripcion,
  detalle,
  motivo,
}: ModuloPendienteProps) {
  return (
    <PageLayout
      titulo={titulo}
      descripcion={descripcion}
      volverA="/administrador/dashboard"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <Aviso tono="advertencia">
        <strong>Módulo pendiente de integración.</strong>{" "}
        {motivo}
      </Aviso>

      <section className={dashboardStyles.section}>
        <EstadoVacio
          titulo="Sin operaciones disponibles"
          descripcion={detalle}
        />
      </section>

      <Aviso tono="info">
        No se muestran formularios ni botones de guardado
        para evitar simular acciones que no llegarían a la API.
      </Aviso>
    </PageLayout>
  );
}

type UsuariosAdministradorProps = {
  soloLectura?: boolean;
};

export function UsuariosAdministrador({
  soloLectura = false,
}: UsuariosAdministradorProps) {
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
    <ModuloPendiente
      titulo="Gestión de usuarios"
      descripcion="Administración de cuentas institucionales"
      motivo="El registro administrativo está disponible en el backend, pero el formulario todavía no se encuentra integrado."
      detalle="La API permite crear cuentas mediante POST /api/auth/registro. El listado, la modificación y la eliminación de cuentas siguen pendientes porque no existen endpoints confirmados."
    />
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
