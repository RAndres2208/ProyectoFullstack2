import { createContext, useContext } from "react";
import type { Product } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addProduct: (product: Product) => void;
  removeProduct: (id: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

export function useCart() {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error("useCart debe utilizarse dentro de CartProvider.");
  }

  return context;
}