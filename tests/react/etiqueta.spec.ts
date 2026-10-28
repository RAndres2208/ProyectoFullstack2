
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Etiqueta } from "../../src/components/ui/Ui";

describe("React - Componente Etiqueta", () => {
  let contenedor: HTMLDivElement;
  let root: Root;

  beforeAll(() => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
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

    contenedor.remove();
  });

  it("R01: muestra correctamente el texto recibido mediante props", async () => {
    await act(async () => {
      root.render(
        createElement(
          Etiqueta,
          { tono: "exito" },
          "Proyecto activo"
        )
      );
    });

    const etiqueta = contenedor.querySelector("span");

    expect(etiqueta).not.toBeNull();
    expect(etiqueta?.textContent).toBe("Proyecto activo");
  });
});
