import { Link } from "wouter";
import { PRODUCTS } from "../../data/products";
import { useCart } from "../../context/CartContext";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const { items } = useCart();

  const totalUnits = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      <header>
        <p className={styles.subtitle}>Resumen de tu tienda</p>
        <h1>Dashboard</h1>
        <p>Consulta el catálogo y el estado actual de tu carrito.</p>
      </header>

      <section className={styles.stats} aria-label="Resumen">
        <article className={styles.stat}>
          <h2>Productos disponibles</h2>
          <p className={styles.number}>{PRODUCTS.length}</p>
          <p>En el catálogo</p>
        </article>

        <article className={styles.stat}>
          <h2>Productos en carrito</h2>
          <p className={styles.number}>{items.length}</p>
          <p>Productos diferentes</p>
        </article>

        <article className={styles.stat}>
          <h2>Total de unidades</h2>
          <p className={styles.number}>{totalUnits}</p>
          <p>Sumando las cantidades</p>
        </article>
      </section>

      <section className={styles.panel}>
        <h2>Tu carrito</h2>

        {items.length === 0 ? (
          <p>Todavía no has agregado productos.</p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.product.id}>
                <span>{item.product.nombre}</span>
                <strong>{item.quantity} unidades</strong>
              </li>
            ))}
          </ul>
        )}

        <Link className={styles.link} href="/carrito">
          Ver carrito
        </Link>
      </section>

      <section className={styles.panel}>
        <h2>Accesos rápidos</h2>

        <div className={styles.actions}>
          <Link className={styles.link} href="/productos">
            Explorar productos
          </Link>

          <Link className={styles.link} href="/contacto">
            Ir a contacto
          </Link>
        </div>
      </section>
    </>
  );
}