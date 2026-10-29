import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { TarjetaResumen } from "../../src/components/ui/Ui";

describe("React - Componente TarjetaResumen", () => {
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

  it("R03: renderiza props y actualiza al cambiar valor", async () => {
    await act(async () => {
      root.render(createElement(TarjetaResumen, { etiqueta: "Participantes", valor: 35, detalle: "Inscritos" }));
    });
    expect(contenedor.textContent).toContain("Participantes");
    expect(contenedor.textContent).toContain("35");
    expect(contenedor.textContent).toContain("Inscritos");

    await act(async () => {
      root.render(createElement(TarjetaResumen, { etiqueta: "Participantes", valor: 50, detalle: "Inscritos" }));
    });
    expect(contenedor.textContent).toContain("50");
  });
});
