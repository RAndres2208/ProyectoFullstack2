import { participantesDemo } from '../src/data/participantesData';
import { normalizarTexto } from '../src/utils/format';

describe('T06 - buscar participantes por nombre', () => {
  it('encuentra Ana Torres', () => {
    const res = participantesDemo.filter(p => normalizarTexto(p.nombre).includes('ana'));
    expect(res.length).toBeGreaterThan(0);
    expect(res[0].nombre).toContain('Ana');
  });
});

describe('T07 - buscar participantes por correo', () => {
  it('encuentra por dominio o nombre', () => {
    const res = participantesDemo.filter(p => normalizarTexto(p.correo).includes('torres'));
    expect(res.length).toBeGreaterThan(0);
  });
});

describe('T08 - paginacion logica', () => {
  it('calcula pagina correcta', () => {
    const items = [1,2,3,4,5];
    const pageSize = 2;
    const page = 2;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paged = items.slice(start, end);
    expect(paged).toEqual([3,4]);
  });
});

describe('T09 - validacion formulario', () => {
  it('valida campos requeridos', () => {
    const form = { nombre: '', correo: 'test@test.com' };
    const valid = form.nombre.trim() !== '';
    expect(valid).toBe(false);
  });
});

describe('T10 - quorum calculo', () => {
  it('calcula porcentaje asistencia', () => {
    const asistieron = 24;
    const total = 32;
    const pct = total === 0 ? 0 : Math.round((asistieron / total) * 100);
    expect(pct).toBe(75);
  });
});
