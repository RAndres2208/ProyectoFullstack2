import styles from "./Products.module.css";
import { PRODUCTS } from "../../data/products";
import { CardProduct } from "../../components/card-product/CardProduct";

export function Products() {
  return (
    <>
      <header>
        <h1 className={styles.titulo}>Productos</h1>
      </header>

      <main>
        <section className={styles.productos}>
          <section className={styles.planchas}>
            <h2>Productos disponibles</h2>

            {PRODUCTS.map((product) => (
              <CardProduct
                key={product.id}
                product={product}
              />
            ))}
          </section>
        </section>
      </main>

      <footer>
        <p>Robinson Rodriguez</p>
        <p>Proyecto Fullstack 2026</p>
      </footer>
    </>
  );
}