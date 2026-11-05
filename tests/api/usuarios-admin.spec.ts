import {
  ErrorUsuariosAdmin,
  eliminarUsuarioAdministrativoApi,
  listarUsuariosAdministrativosApi,
  mensajeConsultaUsuario,
  mensajeEliminacionUsuario,
  mensajeListadoUsuarios,
  obtenerUsuarioAdministrativoApi,
  validarPaginaUsuariosAdmin,
} from '../../src/services/usuariosAdminApi';

type RespuestaMock = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
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

function restaurarFetch(originalFetch: any) {
  if (originalFetch) {
    (globalThis as any).fetch = originalFetch;
  } else {
    delete (globalThis as any).fetch;
  }
}

function ultimaSolicitud(): any {
  return (globalThis.fetch as jasmine.Spy).calls.mostRecent();
}

const USUARIO_ANA = {
  id: 'sub-de-cognito',
  nombre: 'Ana Pérez',
  email: 'ana.perez@duoc.cl',
  roles: ['ESTUDIANTE', 'PROFESOR'],
};

const USUARIO_LUIS = {
  id: 'sub-de-cognito-2',
  nombre: 'Luis Soto',
  email: 'luis.soto@duoc.cl',
  roles: ['COORDINADOR'],
};

const PAGINA_UNO = {
  content: [USUARIO_ANA, USUARIO_LUIS],
  page: 0,
  size: 20,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

describe('Usuarios admin - listado persistente', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    restaurarFetch(originalFetch);
  });

  it('USR01: carga la primera página y valida el contrato del backend', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaOk(PAGINA_UNO) as any)
    );

    const pagina = await listarUsuariosAdministrativosApi(
      0,
      20,
      'token-test-123'
    );

    const solicitud = ultimaSolicitud();

    expect(pagina.content.length).toBe(2);
    expect(pagina.content[0].nombre).toBe('Ana Pérez');
    expect(pagina.totalElements).toBe(2);
    expect(pagina.totalPages).toBe(1);
    expect(solicitud.args[0]).toBe(
      'https://syncpass.test.invalid/api/usuarios?page=0&size=20'
    );
    expect(solicitud.args[1].method).toBe('GET');
    expect(solicitud.args[1].headers.Authorization).toBe(
      'Bearer token-test-123'
    );
  });

  it('USR02: envía la página solicitada y limita size a 100', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaOk({ ...PAGINA_UNO, page: 2 }) as any)
    );

    await listarUsuariosAdministrativosApi(
      2,
      500,
      'token-test-123'
    );

    expect(ultimaSolicitud().args[0]).toBe(
      'https://syncpass.test.invalid/api/usuarios?page=2&size=100'
    );
  });

  it('USR03: normaliza una página negativa a 0', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaOk(PAGINA_UNO) as any)
    );

    await listarUsuariosAdministrativosApi(
      -4,
      20,
      'token-test-123'
    );

    expect(ultimaSolicitud().args[0]).toContain('page=0');
  });

  it('USR04: acepta una página vacía sin inventar usuarios', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        }) as any
      )
    );

    const pagina = await listarUsuariosAdministrativosApi(
      0,
      20,
      'token-test-123'
    );

    expect(pagina.content).toEqual([]);
    expect(pagina.totalElements).toBe(0);
  });

  it('USR05: rechaza una paginación incompleta', () => {
    try {
      validarPaginaUsuariosAdmin({
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        first: true,
      });
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo instanceof ErrorUsuariosAdmin).toBe(true);
      expect(fallo.tipo).toBe('respuesta');
    }
  });

  it('USR06: traduce el 403 del listado sin exponer datos sensibles', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(403) as any)
    );

    try {
      await listarUsuariosAdministrativosApi(
        0,
        20,
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(403);
      expect(mensajeListadoUsuarios(fallo)).toContain(
        'ROLE_ADMINISTRADOR'
      );
    }
  });
});

describe('Usuarios admin - consulta individual', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    restaurarFetch(originalFetch);
  });

  it('USR07: obtiene una cuenta por su ID real y codifica la ruta', async () => {
    const id = 'sub-con-slash/123';

    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({ ...USUARIO_ANA, id }) as any
      )
    );

    const usuario = await obtenerUsuarioAdministrativoApi(
      id,
      'token-test-123'
    );

    expect(usuario.id).toBe(id);
    expect(ultimaSolicitud().args[0]).toBe(
      'https://syncpass.test.invalid/api/usuarios/sub-con-slash%2F123'
    );
  });

  it('USR08: informa que la cuenta ya no existe ante un 404', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(404) as any)
    );

    try {
      await obtenerUsuarioAdministrativoApi(
        'usuario-404',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(404);
      expect(mensajeConsultaUsuario(fallo)).toContain(
        'ya no existe'
      );
    }
  });
});

describe('Usuarios admin - eliminación', () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    restaurarFetch(originalFetch);
  });

  it('USR09: valida el objeto exacto de eliminación completa', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({
          usuarioId: 'sub-de-cognito',
          estado: 'ELIMINADO',
          cognitoEliminado: true,
          postgresEliminado: true,
        }) as any
      )
    );

    const resultado = await eliminarUsuarioAdministrativoApi(
      'sub-de-cognito',
      'token-test-123'
    );

    expect(resultado).toEqual({
      usuarioId: 'sub-de-cognito',
      estado: 'ELIMINADO',
      cognitoEliminado: true,
      postgresEliminado: true,
    });
    expect(ultimaSolicitud().args[1].method).toBe('DELETE');
    expect(ultimaSolicitud().args[0]).toBe(
      'https://syncpass.test.invalid/api/usuarios/sub-de-cognito'
    );
  });

  it('USR10: acepta una reconciliación residual de PostgreSQL', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({
          usuarioId: 'sub-de-cognito',
          estado: 'RECONCILIADO',
          cognitoEliminado: false,
          postgresEliminado: true,
        }) as any
      )
    );

    const resultado = await eliminarUsuarioAdministrativoApi(
      'sub-de-cognito',
      'token-test-123'
    );

    expect(resultado.estado).toBe('RECONCILIADO');
    expect(resultado.cognitoEliminado).toBe(false);
  });

  it('USR11: rechaza un 200 sin el objeto de eliminación esperado', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({ usuarioId: 'sub-de-cognito' }) as any
      )
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo instanceof ErrorUsuariosAdmin).toBe(true);
      expect(fallo.tipo).toBe('respuesta');
    }
  });

  it('USR12: rechaza una confirmación de otro usuario', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaOk({
          usuarioId: 'otro-usuario',
          estado: 'ELIMINADO',
          cognitoEliminado: true,
          postgresEliminado: true,
        }) as any
      )
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.tipo).toBe('respuesta');
    }
  });

  it('USR13: un 404 exige refrescar y consultar el estado real', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(404) as any)
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(404);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'No se puede concluir'
      );
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'estado real'
      );
    }
  });

  it('USR14: un 409 explica las dependencias que impiden eliminar', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(
        respuestaError(
          409,
          'El usuario tiene cursos y asistencias asociadas'
        ) as any
      )
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(409);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'datos relacionados'
      );
    }
  });

  it('USR15: un 500 advierte reconciliación y reintento controlado', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(500) as any)
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(500);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'reconciliación'
      );
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'reintentar'
      );
    }
  });

  it('USR16: un 503 no afirma que la cuenta fue eliminada', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(503) as any)
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(503);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'Amazon Cognito'
      );
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'no se eliminó'
      );
    }
  });

  it('USR17: un 401 indica renovar la sesión de Cognito', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(401) as any)
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(401);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'sesión de Cognito'
      );
    }
  });

  it('USR18: un 403 informa falta de permisos', async () => {
    spyOn(globalThis, 'fetch').and.returnValue(
      Promise.resolve(respuestaError(403) as any)
    );

    try {
      await eliminarUsuarioAdministrativoApi(
        'sub-de-cognito',
        'token-test-123'
      );
      fail('debería lanzar error');
    } catch (fallo: any) {
      expect(fallo.status).toBe(403);
      expect(mensajeEliminacionUsuario(fallo)).toContain(
        'ROLE_ADMINISTRADOR'
      );
    }
  });
});
