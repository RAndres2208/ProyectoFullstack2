import { useState } from "react";
import { Link, useParams } from "wouter";
import { PRODUCTS } from "../../data/products";
import { useCart } from "../../context/CartContext";
import styles from "./ProductDetail.module.css";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addProduct } = useCart();
  const [message, setMessage] = useState("");

  const product = PRODUCTS.find(
    (product) => product.id.toString() === id
  );

  if (!product) {
    return (
      <section>
        <h1>Producto no encontrado</h1>
        <p>No existe un producto con ese identificador.</p>

        <Link href="/productos">Volver al catálogo</Link>
      </section>
    );
  }

  return (
    <section>
      <Link className={styles.back} href="/productos">
        ← Volver a productos
      </Link>

      <div className={styles.detail}>
        <img
          className={styles.image}
          src={product.imagen}
          alt={product.nombre}
        />

        <div>
          <p className={styles.identifier}>
            Producto #{product.id}
          </p>

          <h1>{product.nombre}</h1>
          <p>{product.descripcion}</p>

          <button
            type="button"
            onClick={() => {
              addProduct(product);
              setMessage(`${product.nombre} agregado al carrito.`);
            }}
          >
            Agregar al carrito
          </button>

          <Link className={styles.cartLink} href="/carrito">
            Ver carrito
          </Link>

          <p className={styles.message} role="status">
            {message}
          </p>
        </div>
      </div>
    </section>
  );
}