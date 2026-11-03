import {
  ErrorAcademico,
  inscribirEstudianteApi,
  listarCursosDeEstudianteApi,
  listarEstudiantesApi,
  listarEstudiantesDeCursoApi,
  retirarEstudianteApi,
} from "../../src/services/academicoApi";

describe("API academico - estudiantes 200", () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      (globalThis as any).fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
  });

  it("lista estudiantes con mock fetch 200", async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              id: "EST-1",
              nombre: "Ana",
              email: "ana@duoc.cl",
              carrera: "Informática",
            },
          ],
        }),
    };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    const res = await listarEstudiantesApi("token-test-123");
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe("EST-1");
  });

  it("lista estudiantes de curso con mock fetch 200", async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: [
            {
              id: "EST-2",
              nombre: "Luis",
              email: null,
              carrera: null,
            },
          ],
        }),
    };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    const res = await listarEstudiantesDeCursoApi(5, "token-test-123");
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
    expect(res[0].id).toBe("EST-2");
  });

  it("lista cursos de estudiante con mock fetch 200", async () => {
    const mockResp = {
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          success: true,
          data: [{ id: 7, codigo: "X", nombre: "Curso", descripcion: null, docente: "D", docenteId: null, estado: "Activo", estudiantes: 1 }],
        }),
    };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    const res = await listarCursosDeEstudianteApi("EST-1", "token-test-123");
    expect(Array.isArray(res)).toBe(true);
    expect(res.length).toBe(1);
  });
});

describe("API academico - inscripcion 204", () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      (globalThis as any).fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
  });

  it("inscribe estudiante con respuesta 204", async () => {
    const mockResp = { ok: true, status: 204, json: () => Promise.resolve({}) };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    await expectAsync(
      inscribirEstudianteApi(5, "EST-1", "token-test-123")
    ).toBeResolved();
  });

  it("retira estudiante con respuesta 204", async () => {
    const mockResp = { ok: true, status: 204, json: () => Promise.resolve({}) };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    await expectAsync(
      retirarEstudianteApi(5, "EST-1", "token-test-123")
    ).toBeResolved();
  });
});

describe("API academico - error 403", () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = (globalThis as any).fetch;
  });

  afterEach(() => {
    if (originalFetch) {
      (globalThis as any).fetch = originalFetch;
    } else {
      delete (globalThis as any).fetch;
    }
  });

  it("lanza ErrorAcademico tipo permisos", async () => {
    const mockResp = { ok: false, status: 403, json: () => Promise.resolve({}) };
    spyOn(globalThis, "fetch").and.returnValue(
      Promise.resolve(mockResp as any)
    );
    try {
      await listarEstudiantesApi("token-test-123");
      fail("deberia lanzar error");
    } catch (e: any) {
      expect(e instanceof ErrorAcademico).toBe(true);
      expect(e.tipo).toBe("permisos");
    }
  });
});
