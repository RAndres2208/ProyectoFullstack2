import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useDemoRole } from "../../auth/demoRole";
import { useRol } from "../../auth/roles";
import { useVistaPrevia } from "../../auth/vistaPrevia";
import styles from "./Menu.module.css";

type Enlace = {
  href: string;
  label: string;
  icon: string;
};

const enlacesPrincipales: Enlace[] = [
  { href: "/dashboard", label: "Inicio", icon: "⌂" },
  { href: "/proyectos", label: "Proyectos", icon: "▤" },
  { href: "/escaner", label: "Escáner", icon: "▦" },
  { href: "/offline", label: "Modo offline", icon: "⌁" },
];

const enlacesGestion: Enlace[] = [
  { href: "/participantes", label: "Participantes", icon: "♧" },
  { href: "/quorum", label: "Quórum", icon: "◉" },
  { href: "/encuestas", label: "Encuestas", icon: "✓" },
  { href: "/reportes", label: "Reportes", icon: "▥" },
  { href: "/historial", label: "Historial", icon: "◷" },
  { href: "/perfil", label: "Perfil", icon: "♙" },
];

const enlacesMovilesPrincipales: Enlace[] = [
  { href: "/dashboard", label: "Inicio", icon: "⌂" },
  { href: "/proyectos", label: "Proyectos", icon: "▤" },
  { href: "/escaner", label: "Escáner", icon: "▦" },
  { href: "/offline", label: "Offline", icon: "⌁" },
];

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
  const [location] = useLocation();
  const [masAbierto, setMasAbierto] = useState(false);
  const { esModoDemo, limpiarRolDemo, rolDemo } = useDemoRole();
  const { esDocente: esDocenteReal, esEstudiante: esEstudianteReal } = useRol();
  const { activo: vistaPreviaActiva, rol: rolVistaPrevia, salir: salirVistaPrevia } = useVistaPrevia();
  const isDev = import.meta.env.DEV;
  
  const esDocente = vistaPreviaActiva ? rolVistaPrevia === "docente" : (esDocenteReal || rolDemo === "docente");
  const esEstudiante = vistaPreviaActiva ? rolVistaPrevia === "estudiante" : (esEstudianteReal || rolDemo === "estudiante");

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
        className={`${styles.link} ${
          active ? styles.active : ""
        }`}
        aria-current={active ? "page" : undefined}
      >
        <span className={styles.icon}>{enlace.icon}</span>
        <span>{enlace.label}</span>
      </Link>
    );
  }

  return (
    <>
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brand}>
          <span className={styles.brandIcon}>▣</span>
          SyncPass
        </Link>

        <p className={styles.description}>
          PLATAFORMA INSTITUCIONAL
        </p>

        <nav
          className={styles.desktopNav}
          aria-label="Navegación principal"
        >
          <div className={styles.group}>
            <p className={styles.groupLabel}>Principal</p>
            <ul className={styles.links}>
              {enlacesPrincipales.map((enlace) => (
                <li key={enlace.href}>{renderEnlace(enlace)}</li>
              ))}
            </ul>
          </div>

          {esDocente && (
            <div className={styles.group}>
              <p className={styles.groupLabel}>Docente</p>
              <ul className={styles.links}>
                <li><Link href="/docente/dashboard" className={`${styles.link} ${esRutaActiva(location, "/docente/dashboard") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/docente/dashboard") ? "page" : undefined}><span className={styles.icon}>📊</span><span>Dashboard docente</span></Link></li>
                <li><Link href="/docente/cursos" className={`${styles.link} ${esRutaActiva(location, "/docente/cursos") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/docente/cursos") ? "page" : undefined}><span className={styles.icon}>📚</span><span>Administrar cursos</span></Link></li>
                <li><Link href="/docente/estudiantes" className={`${styles.link} ${esRutaActiva(location, "/docente/estudiantes") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/docente/estudiantes") ? "page" : undefined}><span className={styles.icon}>👥</span><span>Administrar estudiantes</span></Link></li>
                <li><Link href="/docente/asistencia" className={`${styles.link} ${esRutaActiva(location, "/docente/asistencia") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/docente/asistencia") ? "page" : undefined}><span className={styles.icon}>✓</span><span>Gestionar asistencia</span></Link></li>
              </ul>
            </div>
          )}

          {esEstudiante && (
            <div className={styles.group}>
              <p className={styles.groupLabel}>Estudiante</p>
              <ul className={styles.links}>
                <li><Link href="/estudiante/dashboard" className={`${styles.link} ${esRutaActiva(location, "/estudiante/dashboard") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/estudiante/dashboard") ? "page" : undefined}><span className={styles.icon}>🏠</span><span>Mi inicio</span></Link></li>
                <li><Link href="/estudiante/mis-cursos" className={`${styles.link} ${esRutaActiva(location, "/estudiante/mis-cursos") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/estudiante/mis-cursos") ? "page" : undefined}><span className={styles.icon}>📚</span><span>Mis cursos</span></Link></li>
                <li><Link href="/estudiante/mi-asistencia" className={`${styles.link} ${esRutaActiva(location, "/estudiante/mi-asistencia") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/estudiante/mi-asistencia") ? "page" : undefined}><span className={styles.icon}>✓</span><span>Mi asistencia</span></Link></li>
                <li><Link href="/estudiante/perfil" className={`${styles.link} ${esRutaActiva(location, "/estudiante/perfil") ? styles.active : ""}`} aria-current={esRutaActiva(location, "/estudiante/perfil") ? "page" : undefined}><span className={styles.icon}>👤</span><span>Mi perfil</span></Link></li>
              </ul>
            </div>
          )}

          <div className={styles.group}>
            <p className={styles.groupLabel}>Opciones generales</p>
            <ul className={styles.links}>
              {enlacesGestion.map((enlace) => (
                <li key={enlace.href}>{renderEnlace(enlace)}</li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <strong>{esDocente ? "Docente · Coordinador" : esEstudiante ? "Estudiante" : "Usuario"}</strong>
          <span>Duoc UC · SyncPass</span>
          {(isDev || import.meta.env.VITE_ENABLE_VISTA_PREVIA === "true") && (
            <Link href="/vista-previa" style={{ display: "block", marginTop: "0.5rem", color: "#fff", textDecoration: "underline", fontSize: "0.75rem" }}>
              Vista previa de roles
            </Link>
          )}
          {vistaPreviaActiva && (
            <button type="button" onClick={() => { salirVistaPrevia(); window.location.href = "/"; }} style={{ display: "block", marginTop: "0.25rem", background: "transparent", border: "none", color: "#fff", textDecoration: "underline", fontSize: "0.75rem", cursor: "pointer", padding: 0 }}>
              Salir de vista previa
            </button>
          )}
          {esModoDemo && (esDocente || esEstudiante) && !vistaPreviaActiva && (
            <Link href="/seleccion-rol" onClick={() => { limpiarRolDemo(); window.location.href = "/seleccion-rol"; }} style={{ display: "block", marginTop: "0.25rem", color: "#fff", textDecoration: "underline", fontSize: "0.75rem" }}>
              Cambiar vista DEMO
            </Link>
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
            <span>Gestión y seguimiento</span>
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

        <nav aria-label="Secciones adicionales">
          <ul className={styles.moreLinks}>
            {enlacesGestion.map((enlace) => {
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
      </section>

      <nav
        className={styles.mobileNavigation}
        aria-label="Navegación móvil"
      >
        {enlacesMovilesPrincipales.map((enlace) => {
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
              <span className={styles.mobileIcon}>
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
