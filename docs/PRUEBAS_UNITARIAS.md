# PRUEBAS UNITARIAS - SyncPass

## Estado
- Framework: Jasmine
- Ejecutor: Karma
- Precompilador: esbuild
- Navegador: Microsoft Edge Headless
- Resultado: **10 SUCCESS, 0 FAILED**

## Listado de 10 pruebas
| ID | Archivo | Suite/It | Propósito | Entrada | Esperado | Obtenido |
|---|---------|----------|-----------|---------|----------|----------|
| T01 | tests/01-05.spec.ts | T01 - normalizarTexto elimina acentos / elimina acentos y pasa a minúsculas | Verificar normalización | 'Comunicación' | 'comunicacion' | OK |
| T02 | tests/01-05.spec.ts | T02 - normalizarTexto recorta espacios / recorta espacios al inicio y fin | Verificar trim | '  Prueba  ' | 'prueba' | OK |
| T03 | tests/01-05.spec.ts | T03 - porcentaje calculo correcto / calcula 24 de 32 = 75 | Cálculo porcentaje | 24,32 | 75 | OK |
| T04 | tests/01-05.spec.ts | T04 - porcentaje con total 0 / retorna 0 cuando total es 0 | Edge case | 10,0 | 0 | OK |
| T05 | tests/01-05.spec.ts | T05 - filtrar proyectos por busqueda / encuentra proyecto con nombre Semillas | Filtrado con lógica real | array proyectos | filtra Semillas | OK |
| T06 | tests/06-10.spec.ts | T06 - buscar participantes por nombre / encuentra Ana Torres | Búsqueda con datos reales | participantesDemo | encuentra Ana | OK |
| T07 | tests/06-10.spec.ts | T07 - buscar participantes por correo / encuentra por dominio o nombre | Búsqueda por correo | participantesDemo | encuentra Torres | OK |
| T08 | tests/06-10.spec.ts | T08 - paginacion logica / calcula pagina correcta | Paginación | [1,2,3,4,5], pageSize 2, page 2 | [3,4] | OK |
| T09 | tests/06-10.spec.ts | T09 - validacion formulario / valida campos requeridos | Validación | {nombre:'',correo:'x'} | false | OK |
| T10 | tests/06-10.spec.ts | T10 - quorum calculo / calcula porcentaje asistencia | Cálculo quórum | 24,32 | 75 | OK |

## Mocks y Spies
No se usan mocks complejos en esta suite estable. Las pruebas usan datos reales del proyecto.

## Comandos
```bash
npm run test:build
npm run test
```
