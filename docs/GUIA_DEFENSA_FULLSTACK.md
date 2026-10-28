# GUIA DEFENSA FULLSTACK

## Cómo ejecutar las pruebas desde PowerShell
```powershell
$env:CHROME_BIN='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npm run test
```

## Conceptos
- **Jasmine**: Framework de testing (describe, it, expect)
- **Karma**: Ejecutor que lanza navegador y corre pruebas
- **esbuild**: Precompila TypeScript a JS para navegador
- **Mock**: Simula dependencia externa
- **Spy**: Espía llamadas a función/método
- **Assertion**: Verificación con expect
- **Cobertura**: % de código ejecutado por pruebas

## Resultado real
```text
Edge 155.0.0.0 (Windows 10): Executed 10 of 10 SUCCESS
TOTAL: 10 SUCCESS
```

## Archivos de pruebas
- tests/all.spec.ts
- tests/01-05.spec.ts
- tests/06-10.spec.ts

## Comandos completos
```powershell
npx tsc -p tsconfig.app.json --noEmit
npm run lint
npm run build
$env:CHROME_BIN='C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'; npm run test
```
