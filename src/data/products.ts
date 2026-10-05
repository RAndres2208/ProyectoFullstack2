export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    nombre: "Plancha 10mm",
    descripcion:
      "Plancha de 10 milímetros de 1 metro de ancho por 3 metros de largo.",
    imagen: "/imgs/plancha.jfif",
  },
];