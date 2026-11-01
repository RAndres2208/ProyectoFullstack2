import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useLocation } from "wouter";
import { useDemoRole } from "../../auth/demoRole";
import { usePerfilActivo } from "../../auth/perfilActivo";
import {
  ROLES,
  obtenerNombreUsuario,
  type RolSyncPass,
} from "../../auth/roles";
import { useVistaPrevia } from "../../auth/vistaPrevia";
import { SelectorPerfil } from "../selector-perfil/SelectorPerfil";
import styles from "./Menu.module.css";

type Enlace = {
  href: string;
  label: string;
  icon: string;
};

type Grupo = {
  label: string;
  enlaces: Enlace[];
};

type ContextoMenu = "real" | "demo" | "vista-previa";

function construirGrupos(
  rol: RolSyncPass,
  contexto: ContextoMenu
): Grupo[] {
  const esReal = contexto === "real";

  if (rol === "estudiante") {
    return [
      {
        label: "General",
        enlaces: [
          {
            href: "/estudiante/dashboard",
            label: "Inicio personal",
            icon: "⌂",
          },
          ...(esReal
            ? [
                {
                  href: "/proyectos",
                  label: "Proyectos",
                  icon: "▤",
                },
              ]
            : []),
          { href: "/encuestas", label: "Encuestas", icon: "✓" },
          { href: "/escaner", label: "Escáner QR", icon: "▦" },
          { href: "/offline", label: "Modo offline", icon: "⌁" },
        ],
      },
      {
        label: "Estudiante",
        enlaces: [
          {
            href: "/estudiante/mis-cursos",
            label: "Mis cursos",
            icon: "📚",
          },
          {
            href: "/estudiante/mi-asistencia",
            label: "Mi asistencia",
            icon: "✓",
          },
          {
            href: "/estudiante/perfil",
            label: "Mi perfil",
            icon: "👤",
          },
        ],
      },
    ];
  }

  if (rol === "profesor") {
    return [
      {
        label: "General",
        enlaces: [
          {
            href: "/docente/dashboard",
            label: "Inicio docente",
            icon: "⌂",
          },
          ...(esReal
            ? [
                {
                  href: "/proyectos",
                  label: "Proyectos",
                  icon: "▤",
                },
              ]
            : []),
          { href: "/encuestas", label: "Encuestas", icon: "✓" },
          { href: "/offline", label: "Modo offline", icon: "⌁" },
        ],
      },
      {
        label: "Docente",
        enlaces: [
          {
            href: "/docente/cursos",
            label: "Administrar cursos",
            icon: "📚",
          },
          {
            href: "/docente/estudiantes",
            label: "Estudiantes asignados",
            icon: "👥",
          },
          {
            href: "/docente/asistencia",
            label: "Gestionar asistencia",
            icon: "✓",
          },
          {
            href: "/reportes",
            label: "Reportes",
            icon: "▥",
          },
        ],
      },
    ];
  }

  if (rol === "coordinador") {
    return [
      {
        label: "Coordinación",
        enlaces: [
          {
            href: "/coordinador/dashboard",
            label: "Dashboard",
            icon: "⌂",
          },
          {
            href: "/coordinador/cursos",
            label: "Cursos del ámbito",
            icon: "📚",
          },
          {
            href: "/coordinador/docentes",
            label: "Docentes",
            icon: "👥",
          },
          {
            href: "/coordinador/asistencia",
            label: "Asistencia",
            icon: "✓",
          },
          {
            href: "/reportes",
            label: "Reportes",
            icon: "▥",
          },
        ],
      },
    ];
  }

  return [
    {
      label: "Administración",
      enlaces: [
        {
          href: "/administrador/dashboard",
          label: "Dashboard",
          icon: "⌂",
        },
        {
          href: "/administrador/usuarios",
          label: "Usuarios",
          icon: "👤",
        },
        {
          href: "/administrador/roles",
          label: "Roles",
          icon: "🛡️",
        },
        {
          href: "/administrador/cursos",
          label: "Cursos",
          icon: "📚",
        },
        {
          href: "/administrador/configuracion",
          label: "Configuración",
          icon: "⚙️",
        },
      ],
    },
  ];
}

function esRutaActiva(location: string, href: string): boolean {
  if (location === href) {
    return true;
  }

  if (href === "/dashboard") {
    return false;
  }

  return location.startsWith(`${href}/`);
}

export function Menu() {
  const auth = useAuth();
  const [location, setLocation] = useLocation();
  const [masAbierto, setMasAbierto] = useState(false);
  const { esModoDemo, limpiarRolDemo, rolDemo } = useDemoRole();
  const { roles, rolActivo } = usePerfilActivo();
  const {
    activo: vistaPreviaActiva,
    rol: rolVistaPrevia,
    salir: salirVistaPrevia,
  } = useVistaPrevia();
  const isDev = import.meta.env.DEV;

  const contexto: ContextoMenu =
    vistaPreviaActiva && rolVistaPrevia
      ? "vista-previa"
      : roles.length === 0 && esModoDemo && rolDemo
        ? "demo"
        : "real";

  const rolMenu: RolSyncPass | null =
    contexto === "vista-previa"
      ? rolVistaPrevia
      : contexto === "demo"
        ? rolDemo
        : rolActivo;

  const esReal = contexto === "real" && roles.length > 0;
  const inicio = rolMenu ? ROLES[rolMenu].rutaInicio : "/";
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const grupos = rolMenu ? construirGrupos(rolMenu, contexto) : [];

  const todosLosEnlaces = grupos
    .flatMap((grupo) => grupo.enlaces)
    .filter(
      (enlace, indice, arreglo) =>
        arreglo.findIndex((item) => item.href === enlace.href) === indice
    );

  const enlacesMoviles = todosLosEnlaces.slice(0, 4);

  useEffect(() => {
    if (!masAbierto) {
      return;
    }

    function cerrarConEscape(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        setMasAbierto(false);
      }
    }

    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [masAbierto]);

  function renderEnlace(enlace: Enlace) {
    const active = esRutaActiva(location, enlace.href);

    return (
      <Link
        key={enlace.href}
        href={enlace.href}
        className={`${styles.link} ${active ? styles.active : ""}`}
        aria-current={active ? "page" : undefined}
        onClick={() => setMasAbierto(false)}
      >
        <span className={styles.icon} aria-hidden="true">
          {enlace.icon}
        </span>
        <span>{enlace.label}</span>
      </Link>
    );
  }

  const salirDeVistaPrevia = () => {
    salirVistaPrevia();
    setLocation("/");
  };

  const salirDeDemostracion = () => {
    limpiarRolDemo();
    setLocation("/");
  };

  return (
    <>
      <aside className={styles.sidebar}>
        <Link href={inicio} className={styles.brand}>
          <span className={styles.brandIcon}>▣</span>
          SyncPass
        </Link>

        <p className={styles.description}>PLATAFORMA INSTITUCIONAL</p>

        <nav className={styles.desktopNav} aria-label="Navegación principal">
          {grupos.map((grupo) => (
            <div className={styles.group} key={grupo.label}>
              <p className={styles.groupLabel}>{grupo.label}</p>
              <ul className={styles.links}>
                {grupo.enlaces.map((enlace) => (
                  <li key={enlace.href}>{renderEnlace(enlace)}</li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <strong>
            {rolMenu ? ROLES[rolMenu].etiqueta : "Sin perfil activo"}
          </strong>
          <span>
            {esReal
              ? nombre
              : contexto === "demo"
                ? "Modo demostración"
                : "Vista previa aislada"}
          </span>

          {esReal && <SelectorPerfil variante="oscuro" />}

          {!esReal && rolMenu && (
            <span className={styles.footerNote}>
              Datos ficticios · sin permisos reales
            </span>
          )}

          {(isDev || import.meta.env.VITE_ENABLE_VISTA_PREVIA === "true") &&
            esReal && (
              <Link href="/vista-previa" className={styles.footerLink}>
                Vista previa de roles
              </Link>
            )}

          {contexto === "vista-previa" && (
            <button
              type="button"
              className={styles.footerButton}
              onClick={salirDeVistaPrevia}
            >
              Salir de vista previa
            </button>
          )}

          {contexto === "demo" && (
            <>
              <Link
                href="/seleccion-rol"
                className={styles.footerLink}
                onClick={() => setMasAbierto(false)}
              >
                Cambiar vista de demostración
              </Link>
              <button
                type="button"
                className={styles.footerButton}
                onClick={salirDeDemostracion}
              >
                Salir de la demostración
              </button>
            </>
          )}

          {esReal && (
            <button
              type="button"
              className={styles.footerButton}
              onClick={() => void auth.signoutRedirect()}
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </aside>

      {masAbierto && (
        <button
          type="button"
          className={styles.moreBackdrop}
          onClick={() => setMasAbierto(false)}
          aria-label="Cerrar menú Más"
        />
      )}

      <section
        id="menu-mas"
        className={`${styles.morePanel} ${
          masAbierto ? styles.morePanelAbierto : ""
        }`}
        aria-label="Más secciones de SyncPass"
        aria-hidden={!masAbierto}
        hidden={!masAbierto}
      >
        <div className={styles.moreCabecera}>
          <div>
            <strong>Más secciones</strong>
            <span>
              {rolMenu
                ? `Perfil: ${ROLES[rolMenu].etiqueta}`
                : "Navegación SyncPass"}
            </span>
          </div>

          <button
            type="button"
            className={styles.moreCerrar}
            onClick={() => setMasAbierto(false)}
            aria-label="Cerrar menú Más"
          >
            ×
          </button>
        </div>

        {esReal && (
          <div className={styles.moreSelector}>
            <SelectorPerfil variante="claro" />
          </div>
        )}

        <nav aria-label="Secciones adicionales">
          <ul className={styles.moreLinks}>
            {todosLosEnlaces.map((enlace) => {
              const active = esRutaActiva(location, enlace.href);

              return (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className={`${styles.moreLink} ${
                      active ? styles.moreLinkActivo : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMasAbierto(false)}
                  >
                    <span className={styles.moreIcon} aria-hidden="true">
                      {enlace.icon}
                    </span>
                    <span>{enlace.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {!esReal && (
          <p className={styles.moreNota}>
            Las vistas de demostración y vista previa no habilitan operaciones
            protegidas.
          </p>
        )}
      </section>

      <nav className={styles.mobileNavigation} aria-label="Navegación móvil">
        {enlacesMoviles.map((enlace) => {
          const active = esRutaActiva(location, enlace.href);

          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`${styles.mobileLink} ${
                active ? styles.mobileActive : ""
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.mobileIcon} aria-hidden="true">
                {enlace.icon}
              </span>
              <span>{enlace.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          className={`${styles.mobileLink} ${styles.mobileMas}`}
          onClick={() => setMasAbierto((actual) => !actual)}
          aria-expanded={masAbierto}
          aria-controls="menu-mas"
          aria-label={
            masAbierto ? "Cerrar más secciones" : "Abrir más secciones"
          }
        >
          <span className={styles.mobileIcon} aria-hidden="true">
            ⋯
          </span>
          <span>Más</span>
        </button>
      </nav>
    </>
  );
}
