import { useState } from "react";
import { Link } from "wouter";
import type { Product } from "../../data/products";
import { useCart } from "../../context/CartContext";
import styles from "./CardProduct.module.css";

interface CardProductProps {
  product: Product;
}

export function CardProduct({ product }: CardProductProps) {
  const { addProduct } = useCart();
  const [message, setMessage] = useState("");

  function handleAddProduct() {
    addProduct(product);
    setMessage(`${product.nombre} agregado al carrito.`);
  }

  return (
    <article className={styles.card}>
      <h4>{product.nombre}</h4>

      <img
        src={product.imagen}
        alt={product.nombre}
      />

      <p>{product.descripcion}</p>

      <Link
        className={styles.detailLink}
        href={`/productos/${product.id}`}
      >
        Ver detalle
      </Link>

      <button
        type="button"
        className={styles.agregarCarrito}
        onClick={handleAddProduct}
      >
        Agregar al carrito
      </button>

      <p role="status">{message}</p>
    </article>
  );
}