import { ErrorProyectos, obtenerProyectosApi } from '../../src/services/proyectosApi';

describe('API01 - proyectos respuesta 200', () => {
  afterEach(() => {
    if ((globalThis.fetch as any) && typeof (globalThis.fetch as any).calls !== 'undefined') {
      try {
        (globalThis as any).fetch = undefined;
      } catch (e) {}
    }
  });

  it('obtiene proyectos con mock fetch 200', async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: [{ id: 7, nombre: 'Demo', estado: 'Activo', participantes: 4 }] })
    };
    spyOn(globalThis, 'fetch').and.returnValue(Promise.resolve(mockResp as any));
    const res = await obtenerProyectosApi('token-test-123');
    expect((globalThis.fetch as any)).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe(7);
  });
});

describe('API02 - proyectos error 401', () => {
  afterEach(() => {
    try { (globalThis as any).fetch = undefined; } catch (e) {}
  });

  it('lanza ErrorProyectos tipo sesion', async () => {
    const mockResp = { ok: false, status: 401, json: () => Promise.resolve({}) };
    spyOn(globalThis, 'fetch').and.returnValue(Promise.resolve(mockResp as any));
    try {
      await obtenerProyectosApi('token-test-123');
      fail('deberia lanzar error');
    } catch (e: any) {
      expect(e instanceof ErrorProyectos).toBe(true);
      expect(e.tipo).toBe('sesion');
    }
  });
});

describe('API03 - proyectos error 403', () => {
  afterEach(() => {
    try { (globalThis as any).fetch = undefined; } catch (e) {}
  });

  it('lanza ErrorProyectos tipo permisos', async () => {
    const mockResp = { ok: false, status: 403, json: () => Promise.resolve({}) };
    spyOn(globalThis, 'fetch').and.returnValue(Promise.resolve(mockResp as any));
    try {
      await obtenerProyectosApi('token-test-123');
      fail('deberia lanzar error');
    } catch (e: any) {
      expect(e instanceof ErrorProyectos).toBe(true);
      expect(e.tipo).toBe('permisos');
    }
  });
});

describe('API04 - proyectos error 500', () => {
  afterEach(() => {
    try { (globalThis as any).fetch = undefined; } catch (e) {}
  });

  it('lanza ErrorProyectos tipo servidor', async () => {
    const mockResp = { ok: false, status: 500, json: () => Promise.resolve({}) };
    spyOn(globalThis, 'fetch').and.returnValue(Promise.resolve(mockResp as any));
    try {
      await obtenerProyectosApi('token-test-123');
      fail('deberia lanzar error');
    } catch (e: any) {
      expect(e instanceof ErrorProyectos).toBe(true);
      expect(e.tipo).toBe('servidor');
    }
  });
});
