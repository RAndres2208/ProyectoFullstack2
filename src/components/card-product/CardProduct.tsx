import type { Product } from "../../data/products";
import styles from "./CardProduct.module.css";

interface CardProductProps {
  product: Product;
}

export function CardProduct({ product }: CardProductProps) {
  return (
    <article className={styles.card}>
      <h4>{product.nombre}</h4>

      <img
        src={product.imagen}
        alt={product.nombre}
      />

      <p>{product.descripcion}</p>

      <button
        type="button"
        className={styles.agregarCarrito}
      >
        Agregar al carrito
      </button>
    </article>
  );
}