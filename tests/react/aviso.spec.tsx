import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Aviso } from "../../src/components/ui/Ui";

describe("React - Componente Aviso", () => {
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

  it("R02: renderiza children y aplica role alert para tono peligro", async () => {
    await act(async () => {
      root.render(createElement(Aviso, { tono: "peligro" }, "Error de sesión"));
    });
    expect(contenedor.textContent).toContain("Error de sesión");
    const alerta = contenedor.querySelector('[role="alert"]');
    expect(alerta).not.toBeNull();
  });
});
