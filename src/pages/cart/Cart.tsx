import { Link } from "wouter";
import { useCart } from "../../context/CartContext";

export function Cart() {
  const { items, removeProduct, clearCart } = useCart();

  const totalUnits = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <main>
      <h1>Carrito</h1>

      {items.length === 0 ? (
        <p>
          Tu carrito está vacío.{" "}
          <Link href="/productos">Ver productos</Link>
        </p>
      ) : (
        <>
          <ul>
            {items.map((item) => (
              <li key={item.product.id}>
                <h2>{item.product.nombre}</h2>

                <p>Cantidad: {item.quantity}</p>

                <button
                  type="button"
                  onClick={() => removeProduct(item.product.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>

          <p>Total de unidades: {totalUnits}</p>

          <button type="button" onClick={clearCart}>
            Vaciar carrito
          </button>
        </>
      )}
    </main>
  );
}