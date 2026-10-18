
import { Link, useLocation } from "wouter";
import styles from "./Menu.module.css";

const links = [
  { href: "/dashboard", label: "Inicio", icon: "⌂" },
  { href: "/proyectos", label: "Proyectos", icon: "▤" },
  { href: "/reportes", label: "Reportes", icon: "▥" },
  { href: "/perfil", label: "Perfil", icon: "♙" },
];

export function Menu() {
  const [location] = useLocation();

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

        <nav aria-label="Navegación principal">
          <ul className={styles.links}>
            {links.map((link) => {
              const active = location === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.link} ${
                      active ? styles.active : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={styles.icon}>
                      {link.icon}
                    </span>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <strong>Docente · Coordinador</strong>
          <span>Duoc UC · SyncPass</span>
        </div>
      </aside>

      <nav
        className={styles.mobileNavigation}
        aria-label="Navegación móvil"
      >
        {links.map((link) => {
          const active = location === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${
                active ? styles.mobileActive : ""
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className={styles.mobileIcon}>
                {link.icon}
              </span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
