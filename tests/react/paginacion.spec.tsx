import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Paginacion } from "../../src/components/ui/Ui";

describe("React - Componente Paginacion", () => {
  let contenedor: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    contenedor = document.createElement("div");
    document.body.appendChild(contenedor);
    root = createRoot(contenedor);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    if (contenedor.parentNode) {
      document.body.removeChild(contenedor);
    }
  });

  it("R04: llama onCambiar con 3 al hacer clic en pagina siguiente", async () => {
    const spyCambiar = jasmine.createSpy("onCambiar");
    await act(async () => {
      root.render(createElement(Paginacion, { pagina: 2, totalPaginas: 5, onCambiar: spyCambiar }));
    });
    const botones = Array.from(contenedor.querySelectorAll("button"));
    const botonSiguiente = botones.find((b) => b.getAttribute("aria-label") === "Página siguiente");
    expect(botonSiguiente).not.toBeNull();
    await act(async () => {
      botonSiguiente!.click();
    });
    expect(spyCambiar).toHaveBeenCalledWith(3);
  });
});
