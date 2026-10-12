import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { PRODUCTS } from "../data/products";
import type { Product } from "../data/products";
import { CartContext } from "./CartContext";
import type { CartItem } from "./CartContext";

interface CartProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "tienda-carrito";

function loadCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    const data: unknown = JSON.parse(savedCart);

    if (!Array.isArray(data)) {
      return [];
    }

    const items: CartItem[] = [];

    for (const entry of data) {
      if (typeof entry !== "object" || entry === null) {
        continue;
      }

      if (!("productId" in entry) || !("quantity" in entry)) {
        continue;
      }

      const product = PRODUCTS.find(
        (product) => product.id === entry.productId
      );

      const quantity = entry.quantity;

      if (
        !product ||
        typeof quantity !== "number" ||
        !Number.isSafeInteger(quantity) ||
        quantity <= 0
      ) {
        continue;
      }

      const existingItem = items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        const total = existingItem.quantity + quantity;

        if (Number.isSafeInteger(total)) {
          existingItem.quantity = total;
        }
      } else {
        items.push({ product, quantity });
      }
    }

    return items;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    const data = items.map((item) => ({
      productId: item.product.id,
      quantity: item.quantity,
    }));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.warn(
        "No se pudo guardar el carrito en este navegador."
      );
    }
  }, [items]);

  function addProduct(product: Product) {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentItems, { product, quantity: 1 }];
    });
  }

  function removeProduct(id: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== id)
    );
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{ items, addProduct, removeProduct, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}