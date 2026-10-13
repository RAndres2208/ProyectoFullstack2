import { Link } from "wouter";
import { PRODUCTS } from "../../data/products";
import { CardProduct } from "../../components/card-product/CardProduct";
import styles from "./Home.module.css";

export function Home() {
  return (
    <>
      <header className={styles.hero}>
        <p className={styles.subtitle}>Bienvenido a Tienda Online</p>

        <h1>Explora nuestro catálogo</h1>

        <p>
          Consulta los productos disponibles y agrega los que
          necesitas a tu carrito.
        </p>

        <Link className={styles.action} href="/productos">
          Ver productos
        </Link>
      </header>

      <section className={styles.products}>
        <h2>Productos destacados</h2>

        <div className={styles.grid}>
          {PRODUCTS.map((product) => (
            <CardProduct
              key={product.id}
              product={product}
            />
          ))}
        </div>
      </section>
    </>
  );
}