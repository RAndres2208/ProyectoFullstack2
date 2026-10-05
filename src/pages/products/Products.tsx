import styles from "./Products.module.css";

export function Products() {
  return (
    <>
      <header>
        <h1 className={styles.titulo}>Productos</h1>
      </header>

      <main>
        <section className={styles.productos}>
          <section className={styles.planchas}>
            <h3>Productos Disponibles</h3>

            <article>
              <h4>Plancha 10mm</h4>

              <img
                src="/imgs/plancha.jfif"
                alt="Plancha de acero de 10mm"
              />

              <p>
                Plancha de 10 milímetros de 1 metro de ancho por 3 metros de
                largo.
              </p>

              <button
                type="button"
                className={styles.agregarCarrito}
              >
                Agregar al carrito
              </button>
            </article>
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