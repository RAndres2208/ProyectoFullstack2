import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
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

  const masActivo = enlacesGestion.some((enlace) =>
    esRutaActiva(location, enlace.href)
  );

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

          <div className={styles.group}>
            <p className={styles.groupLabel}>Gestión</p>
            <ul className={styles.links}>
              {enlacesGestion.map((enlace) => (
                <li key={enlace.href}>{renderEnlace(enlace)}</li>
              ))}
            </ul>
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <strong>Docente · Coordinador</strong>
          <span>Duoc UC · SyncPass</span>
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
          className={`${styles.mobileLink} ${styles.mobileMas} ${
            masActivo ? styles.mobileActive : ""
          }`}
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
