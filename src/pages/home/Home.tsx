import { PRODUCTS } from "../../data/products";
import { CardProduct } from "../../components/card-product/CardProduct";
import styles from "./Home.module.css";

export function Home() {
  return (
    <>
      <header>
        <h1 className={styles.header}>Tienda Online</h1>

        <p>Esta es mi tienda</p>

        <section className={styles.descripcionHeader}>
          <h2>Descripción</h2>

          <p>
            Es una tienda online que quiere implementar los últimos conceptos
            de IA.
          </p>
        </section>
      </header>

      <main>
        <section className={styles.productos}>
          <section className={styles.planchas}>
            <h3>Productos Destacados</h3>

            <section className={styles.video}>
              <video controls>
                <source
                  src="/video/relatedvideo.htm"
                  type="video/mp4"
                />

                Tu navegador no soporta el elemento de video.
              </video>
            </section>

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