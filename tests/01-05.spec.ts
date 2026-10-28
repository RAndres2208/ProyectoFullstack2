import { normalizarTexto, porcentaje } from '../src/utils/format';

describe('T01 - normalizarTexto elimina acentos', () => {
  it('convierte a minusculas sin acentos', () => {
    expect(normalizarTexto('Comunicación')).toBe('comunicacion');
  });
});

describe('T02 - normalizarTexto recorta espacios', () => {
  it('recorta espacios al inicio y fin', () => {
    expect(normalizarTexto('  Prueba  ')).toBe('prueba');
  });
});

describe('T03 - porcentaje calculo correcto', () => {
  it('calcula 24 de 32 = 75', () => {
    expect(porcentaje(24, 32)).toBe(75);
  });
});

describe('T04 - porcentaje con total 0', () => {
  it('retorna 0 cuando total es 0', () => {
    expect(porcentaje(10, 0)).toBe(0);
  });
});

describe('T05 - filtrar proyectos por busqueda', () => {
  it('encuentra proyecto con nombre Semillas', () => {
    const data = [
      { id: 'a', nombre: 'Conecta Barrio' },
      { id: 'b', nombre: 'Semillas de comunidad' }
    ];
    const res = data.filter(p => normalizarTexto(p.nombre).includes('semillas'));
    expect(res.length).toBe(1);
    expect(res[0].id).toBe('b');
  });
});
