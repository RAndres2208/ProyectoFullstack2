import {
  act,
  createElement,
  type ComponentProps,
} from "react";
import { createRoot, type Root } from "react-dom/client";
import { ListaUsuariosAdmin } from "../../src/pages/administrador/ListaUsuariosAdmin";

type PropsLista = ComponentProps<typeof ListaUsuariosAdmin>;

type RespuestaMock = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type Llamada = {
  url: string;
  metodo: string;
  pagina: number | null;
};

type ManejadoresFetch = {
  listar?: (pagina: number, llamada: Llamada) => RespuestaMock;
  consultar?: (id: string) => RespuestaMock;
  eliminar?: (
    id: string
  ) => RespuestaMock | Promise<RespuestaMock>;
};

const ANA = {
  id: 'sub-ana',
  nombre: 'Ana Pérez',
  email: 'ana.perez@duoc.cl',
  roles: ['ESTUDIANTE', 'PROFESOR'],
};

const LUIS = {
  id: 'sub-luis',
  nombre: 'Luis Soto',
  email: 'luis.soto@duoc.cl',
  roles: ['COORDINADOR'],
};

const CARLA = {
  id: 'sub-carla',
  nombre: 'Carla Rojas',
  email: 'carla.rojas@duoc.cl',
  roles: ['ESTUDIANTE'],
};

function respuestaOk(data: unknown): RespuestaMock {
  return {
    ok: true,
    status: 200,
    json: () =>
      Promise.resolve({
        success: true,
        data,
        message: 'ok',
        timestamp: '2026-01-01T00:00:00Z',
      }),
  };
}

function respuestaError(
  status: number,
  mensaje = 'Error del backend'
): RespuestaMock {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ mensaje }),
  };
}

function construirPagina(
  content: unknown[],
  page = 0,
  totalPages = 1,
  totalElements = content.length
) {
  return {
    content,
    page,
    size: 20,
    totalElements,
    totalPages,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
  };
}

function construirRespuestaEliminacion(id: string) {
  return respuestaOk({
    usuarioId: id,
    estado: 'ELIMINADO',
    cognitoEliminado: true,
    postgresEliminado: true,
  });
}

describe('React - Lista administrativa de usuarios', () => {
  let contenedor: HTMLDivElement;
  let root: Root;
  let llamadas: Llamada[] = [];

  beforeAll(() => {
    (
      globalThis as typeof globalThis & {
        IS_REACT_ACT_ENVIRONMENT?: boolean;
      }
    ).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    contenedor = document.createElement('div');
    document.body.appendChild(contenedor);
    root = createRoot(contenedor);
    llamadas = [];
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });

    if (contenedor.parentNode) {
      document.body.removeChild(contenedor);
    }
  });

  function instalarFetch(manejadores: ManejadoresFetch) {
    spyOn(globalThis, 'fetch').and.callFake(
      (entrada: any, init: any) => {
        const url = new URL(String(entrada));
        const metodo = String(init?.method ?? 'GET');
        const pagina = url.searchParams.has('page')
          ? Number(url.searchParams.get('page'))
          : null;
        const llamada: Llamada = {
          url: String(entrada),
          metodo,
          pagina,
        };

        llamadas.push(llamada);

        if (metodo === 'DELETE') {
          const id = decodeURIComponent(
            url.pathname.split('/').pop() ?? ''
          );

          return Promise.resolve(
            manejadores.eliminar?.(id) ??
              construirRespuestaEliminacion(id)
          );
        }

        if (url.pathname === '/api/usuarios') {
          return Promise.resolve(
            manejadores.listar?.(pagina ?? 0, llamada) ??
              respuestaOk(construirPagina([], 0, 0, 0))
          );
        }

        const id = decodeURIComponent(
          url.pathname.split('/').pop() ?? ''
        );

        return Promise.resolve(
          manejadores.consultar?.(id) ?? respuestaOk(ANA)
        );
      }
    );
  }

  async function vaciarPromesas() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }

  async function renderizar(props: Partial<PropsLista> = {}) {
    await act(async () => {
      root.render(
        createElement(ListaUsuariosAdmin, {
          accessToken: 'token-test-123',
          autorizado: true,
          ...props,
        })
      );
    });

    await vaciarPromesas();
  }

  function texto(): string {
    return contenedor.textContent ?? '';
  }

  function buscarBoton(etiqueta: string): HTMLButtonElement | undefined {
    return Array.from(
      contenedor.querySelectorAll('button')
    ).find(
      (boton) => boton.textContent?.trim() === etiqueta
    ) as HTMLButtonElement | undefined;
  }

  function buscarBotonEnFila(
    nombre: string,
    etiqueta: string
  ): HTMLButtonElement | undefined {
    const fila = Array.from(
      contenedor.querySelectorAll('tbody tr')
    ).find((item) => item.textContent?.includes(nombre));

    if (!fila) {
      return undefined;
    }

    return Array.from(
      fila.querySelectorAll('button')
    ).find(
      (boton) => boton.textContent?.trim() === etiqueta
    ) as HTMLButtonElement | undefined;
  }

  async function hacerClic(
    boton: HTMLButtonElement | undefined
  ) {
    if (!boton) {
      throw new Error('Botón no encontrado');
    }

    await act(async () => {
      boton.click();
    });
    await vaciarPromesas();
  }

  it('R-USA01: muestra la carga inicial con nombre, correo, roles y totales', async () => {
    instalarFetch({
      listar: (pagina) =>
        respuestaOk(
          construirPagina([ANA, LUIS], pagina, 1, 2)
        ),
    });

    await renderizar();

    expect(texto()).toContain('Ana Pérez');
    expect(texto()).toContain('ana.perez@duoc.cl');
    expect(texto()).toContain('ESTUDIANTE');
    expect(texto()).toContain('PROFESOR');
    expect(texto()).toContain('Luis Soto');
    expect(texto()).toContain('2 usuarios');
    expect(texto()).toContain('Página 1 de 1');
    expect(llamadas.length).toBe(1);
    expect(llamadas[0].url).toContain(
      '/api/usuarios?page=0&size=20'
    );
    expect(llamadas[0].metodo).toBe('GET');
  });

  it('R-USA02: navega entre páginas y deshabilita los extremos', async () => {
    instalarFetch({
      listar: (pagina) =>
        pagina === 0
          ? respuestaOk(
              construirPagina([ANA, LUIS], 0, 2, 3)
            )
          : respuestaOk(construirPagina([CARLA], 1, 2, 3)),
    });

    await renderizar();

    const anterior = buscarBoton('Anterior');
    const siguiente = buscarBoton('Siguiente');

    expect(anterior?.disabled).toBe(true);
    expect(siguiente?.disabled).toBe(false);

    await hacerClic(siguiente);

    expect(texto()).toContain('Carla Rojas');
    expect(texto()).toContain('Página 2 de 2');
    expect(
      llamadas.some((llamada) => llamada.pagina === 1)
    ).toBe(true);
    expect(buscarBoton('Siguiente')?.disabled).toBe(true);

    await hacerClic(buscarBoton('Anterior'));

    expect(texto()).toContain('Ana Pérez');
    expect(texto()).toContain('Página 1 de 2');
    expect(
      llamadas.filter(
        (llamada) =>
          llamada.metodo === 'GET' && llamada.pagina !== null
      ).length
    ).toBe(3);
  });

  it('R-USA02b: retrocede a la página anterior si la solicitada queda vacía', async () => {
    let consultasPaginaUno = 0;

    instalarFetch({
      listar: (pagina) => {
        if (pagina === 0) {
          return respuestaOk(
            construirPagina([ANA, LUIS], 0, 3, 5)
          );
        }

        if (pagina === 1) {
          consultasPaginaUno += 1;

          return respuestaOk(
            construirPagina(
              [CARLA],
              1,
              consultasPaginaUno === 1 ? 3 : 2,
              consultasPaginaUno === 1 ? 5 : 4
            )
          );
        }

        return respuestaOk(construirPagina([], 2, 2, 4));
      },
    });

    await renderizar();

    await hacerClic(buscarBoton('Siguiente'));
    await hacerClic(buscarBoton('Siguiente'));

    expect(texto()).toContain('Carla Rojas');
    expect(texto()).toContain('Página 2 de 2');
    expect(
      llamadas.some(
        (llamada) =>
          llamada.metodo === 'GET' && llamada.pagina === 1
      )
    ).toBe(true);
  });

  it('R-USA03: muestra un estado vacío cuando no hay usuarios', async () => {
    instalarFetch({
      listar: () => respuestaOk(construirPagina([], 0, 0, 0)),
    });

    await renderizar();

    expect(texto()).toContain('Sin usuarios registrados');
    expect(texto()).toContain('Página 0 de 0');
    expect(texto()).toContain('0 usuarios');
    expect(buscarBoton('Anterior')?.disabled).toBe(true);
    expect(buscarBoton('Siguiente')?.disabled).toBe(true);
  });

  it('R-USA04: recarga desde el backend tras registrar un usuario', async () => {
    let consultas = 0;

    instalarFetch({
      listar: () => {
        consultas += 1;

        return respuestaOk(
          construirPagina(
            consultas === 1 ? [ANA] : [ANA, LUIS],
            0,
            1,
            consultas === 1 ? 1 : 2
          )
        );
      },
    });

    await renderizar({ recargaExterna: 0 });

    expect(texto()).toContain('Ana Pérez');
    expect(texto()).not.toContain('Luis Soto');
    expect(consultas).toBe(1);

    await renderizar({ recargaExterna: 1 });

    expect(consultas).toBe(2);
    expect(texto()).toContain('Luis Soto');
    expect(texto()).toContain('2 usuarios');
  });

  it('R-USA05: confirma la eliminación y refresca el listado sin retiro optimista', async () => {
    let usuarios = [ANA, LUIS];
    let resolverEliminacion:
      | ((respuesta: RespuestaMock) => void)
      | undefined;

    const eliminacionPendiente = new Promise<RespuestaMock>(
      (resolve) => {
        resolverEliminacion = resolve;
      }
    );

    instalarFetch({
      listar: () =>
        respuestaOk(
          construirPagina(usuarios, 0, 1, usuarios.length)
        ),
      eliminar: () => eliminacionPendiente,
    });

    await renderizar();

    await hacerClic(buscarBotonEnFila('Ana Pérez', 'Eliminar'));

    expect(texto()).toContain('¿Confirmas la eliminación');
    expect(texto()).toContain('ana.perez@duoc.cl');

    const confirmar = buscarBoton('Eliminar definitivamente');

    await act(async () => {
      confirmar?.click();
    });

    expect(
      llamadas.some((llamada) => llamada.metodo === 'DELETE')
    ).toBe(true);
    expect(texto()).toContain('Ana Pérez');

    usuarios = [LUIS];

    await act(async () => {
      resolverEliminacion?.(
        construirRespuestaEliminacion(ANA.id)
      );
    });
    await vaciarPromesas();

    const cuerpoTabla =
      contenedor.querySelector('tbody')?.textContent ?? '';

    expect(cuerpoTabla).not.toContain('Ana Pérez');
    expect(cuerpoTabla).not.toContain('ana.perez@duoc.cl');
    expect(cuerpoTabla).toContain('Luis Soto');
    expect(texto()).toContain('Eliminación completa confirmada');
    expect(
      llamadas.filter(
        (llamada) =>
          llamada.metodo === 'GET' && llamada.pagina !== null
      ).length
    ).toBe(2);
  });

  it('R-USA06: ante 404 refresca el listado y consulta el estado real', async () => {
    let usuarios = [ANA, LUIS];

    instalarFetch({
      listar: () =>
        respuestaOk(
          construirPagina(usuarios, 0, 1, usuarios.length)
        ),
      eliminar: () => {
        usuarios = [LUIS];
        return respuestaError(404, 'Usuario no encontrado');
      },
      consultar: () => respuestaError(404, 'Usuario no encontrado'),
    });

    await renderizar();

    await hacerClic(buscarBotonEnFila('Ana Pérez', 'Eliminar'));
    await hacerClic(buscarBoton('Eliminar definitivamente'));

    expect(texto()).toContain('también respondió 404');
    expect(texto()).toContain('estado real');

    const cuerpoTabla =
      contenedor.querySelector('tbody')?.textContent ?? '';

    expect(cuerpoTabla).not.toContain('ana.perez@duoc.cl');
    expect(cuerpoTabla).toContain('Luis Soto');
    expect(
      llamadas.some(
        (llamada) =>
          llamada.metodo === 'GET' && llamada.pagina === null
      )
    ).toBe(true);
  });

  it('R-USA07: evita solicitudes DELETE duplicadas', async () => {
    let resolverEliminacion:
      | ((respuesta: RespuestaMock) => void)
      | undefined;

    const eliminacionPendiente = new Promise<RespuestaMock>(
      (resolve) => {
        resolverEliminacion = resolve;
      }
    );

    instalarFetch({
      listar: () =>
        respuestaOk(construirPagina([ANA], 0, 1, 1)),
      eliminar: () => eliminacionPendiente,
    });

    await renderizar();

    await hacerClic(buscarBotonEnFila('Ana Pérez', 'Eliminar'));

    const confirmar = buscarBoton('Eliminar definitivamente');

    await act(async () => {
      confirmar?.click();
      confirmar?.click();
    });

    expect(
      llamadas.filter(
        (llamada) => llamada.metodo === 'DELETE'
      ).length
    ).toBe(1);

    await act(async () => {
      resolverEliminacion?.(
        construirRespuestaEliminacion(ANA.id)
      );
    });
    await vaciarPromesas();
  });

  it('R-USA08: conserva el listado al recargar la vista y consultar de nuevo', async () => {
    instalarFetch({
      listar: () =>
        respuestaOk(construirPagina([ANA, LUIS], 0, 1, 2)),
    });

    await renderizar();

    expect(texto()).toContain('Ana Pérez');
    expect(texto()).toContain('Luis Soto');

    await act(async () => {
      root.unmount();
    });

    root = createRoot(contenedor);
    await renderizar();

    expect(texto()).toContain('Ana Pérez');
    expect(texto()).toContain('Luis Soto');
    expect(
      llamadas.filter(
        (llamada) =>
          llamada.metodo === 'GET' && llamada.pagina !== null
      ).length
    ).toBe(2);
  });

  it('R-USA09: impide eliminar la cuenta administrativa activa en la interfaz', async () => {
    const anaAdministradora = {
      ...ANA,
      roles: ['ADMINISTRADOR'],
    };

    instalarFetch({
      listar: () =>
        respuestaOk(
          construirPagina([anaAdministradora, LUIS], 0, 1, 2)
        ),
    });

    await renderizar({
      idUsuarioActivo: anaAdministradora.id,
      emailUsuarioActivo: anaAdministradora.email,
    });

    const eliminarActiva = buscarBotonEnFila(
      'Ana Pérez',
      'Eliminar'
    );
    const eliminarOtra = buscarBotonEnFila(
      'Luis Soto',
      'Eliminar'
    );

    expect(eliminarActiva?.disabled).toBe(true);
    expect(eliminarOtra?.disabled).toBe(false);
    expect(texto()).toContain('Tu cuenta activa');

    await hacerClic(eliminarActiva);

    expect(texto()).not.toContain('¿Confirmas la eliminación');
    expect(
      llamadas.some((llamada) => llamada.metodo === 'DELETE')
    ).toBe(false);
  });

  it('R-USA10: ante 401 en DELETE activa el flujo de autenticación', async () => {
    const alExpirarSesion = jasmine.createSpy('sesionExpirada');

    instalarFetch({
      listar: () =>
        respuestaOk(construirPagina([ANA, LUIS], 0, 1, 2)),
      eliminar: () => respuestaError(401, 'Sesión expirada'),
    });

    await renderizar({
      onSesionExpirada: alExpirarSesion,
    });

    await hacerClic(buscarBotonEnFila('Ana Pérez', 'Eliminar'));
    await hacerClic(buscarBoton('Eliminar definitivamente'));

    expect(alExpirarSesion).toHaveBeenCalled();
    expect(texto()).toContain('sesión de Cognito');
    expect(texto()).toContain('Ana Pérez');
  });

  it('R-USA11: muestra el error de permisos del listado sin datos sensibles', async () => {
    instalarFetch({
      listar: () => respuestaError(403, 'Acceso denegado'),
    });

    await renderizar();

    expect(texto()).toContain('ROLE_ADMINISTRADOR');
    expect(texto()).toContain('Reintentar consulta');
    expect(texto()).not.toContain('Acceso denegado');
  });
});
