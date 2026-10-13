import { Link, useLocation } from "wouter";
import styles from "./Menu.module.css";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/productos", label: "Productos" },
  { href: "/carrito", label: "Carrito" },
  { href: "/contacto", label: "Contacto" },
  { href: "/login", label: "Iniciar sesión" },
];

export function Menu() {
  const [location] = useLocation();

  return (
    <nav className={styles.menu} aria-label="Navegación principal">
      <Link href="/" className={styles.brand}>
        Tienda Online
      </Link>

      <p className={styles.description}>Catálogo y compras</p>

      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={
                location === link.href
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
              aria-current={
                location === link.href ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}