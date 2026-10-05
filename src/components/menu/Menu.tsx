import { Link } from "wouter";
import styles from "./Menu.module.css";

export function Menu() {
  return (
    <nav className={styles.menu}>
      <h1>Menú</h1>

      <ul>
        <li>
          <Link href="/">Inicio</Link>
        </li>

        <li>
          <Link href="/productos">Productos</Link>
        </li>

        <li>
          <Link href="/carrito">Carrito</Link>
        </li>

        <li>
          <Link href="/contacto">Contacto</Link>
        </li>
      </ul>
    </nav>
  );
}