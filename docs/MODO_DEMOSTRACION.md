# Modo demostración — SyncPass

## Objetivo

Permitir presentar SyncPass cuando la instancia de Spring Boot en AWS EC2 no
está disponible, **sin mezclar** datos locales con datos reales y **sin activar**
datos inventados de forma silenciosa ante un error.

## Regla principal

| Modo | Fuente de datos | Etiqueta visual |
| --- | --- | --- |
| Conectado (por defecto) | `GET /api/proyectos` con `access_token` de Cognito | `API`, `DUOC UC · API` |
| Demostración (explícito) | Catálogos locales de `src/data/` | `Demostración`, `DUOC UC · DEMO` |

- En modo conectado **solo** se muestran proyectos del servidor.
- En modo demostración **solo** se muestran datos locales.
- Nunca se combinan ambos conjuntos en el mismo listado.
- Si la API falla, se muestra el error y se ofrece **Reintentar**. El modo
  demostración solo se activa si la persona lo decide.

## Cómo se activa

1. Abrir `/proyectos`.
2. Localizar el bloque “Modo conectado / Modo demostración”.
3. Usar el interruptor **API / Demo**.

La preferencia se guarda en `localStorage` con la clave:

```text
syncpass.modo-demo
```

- Valor inicial: desactivado.
- `"true"` activa la demostración en ese navegador.
- `"false"` o ausencia de la clave mantiene el modo conectado.
- El cambio se sincroniza entre pestañas mediante el evento `storage`.

El detalle de un proyecto respeta el mismo modo:

- IDs numéricos (`/proyectos/1`) → API real.
- Rutas con nombre (`/proyectos/conecta-barrio`) → demostración.
- Si una ruta demo se abre con el modo desactivado, se informa y se ofrece
  activarlo explícitamente.
- Si un ID numérico se abre en modo demo, se informa que ese identificador
  pertenece a Spring Boot y se ofrece volver al modo conectado.

## Cómo desactivarlo por completo

Definir en el entorno de compilación:

```text
VITE_ENABLE_DEMO_MODE=false
```

Con ese valor:

- El interruptor desaparece y se muestra “Demo no disponible”.
- `leerModoDemo()` siempre devuelve `false`.
- Las rutas demo no se pueden activar desde la interfaz.
- Los datos locales permanecen en el código, pero no son accesibles desde la UI.

Para volver a habilitarlo, eliminar la variable o definirla con cualquier valor
distinto de `"false"`.

> `VITE_*` es público en la build de Vite. Esta variable no es un secreto y no
> debe usarse para credenciales.

## Comportamiento ante errores

| Situación | Resultado |
| --- | --- |
| 401 | “Sesión de Cognito expirada o inválida” + opción explícita de renovar |
| 403 | Mensaje de permisos |
| 404 | Servicio o proyecto no encontrado |
| 5xx | Error del servidor + “Reintentar” |
| Timeout (15 s) | Mensaje de timeout + “Reintentar” |
| Error de red | Mensaje de conexión + “Reintentar” |
| JSON inválido | Mensaje de respuesta inválida |
| Listado vacío | Estado vacío; no se cargan datos demo automáticamente |

El modo demostración **no** se activa al fallar la API, no elimina la sesión de
Cognito y no provoca redirecciones en bucle.

## Estructura técnica

| Archivo | Función |
| --- | --- |
| `src/config/demo.ts` | Clave de `localStorage`, lectura/escritura y flag `VITE_ENABLE_DEMO_MODE` |
| `src/hooks/useModoDemo.ts` | Estado reactivo del modo y sincronización entre pestañas |
| `src/hooks/useProyectosApi.ts` | Carga del listado real, estados de carga/error y reintento |
| `src/services/proyectosApi.ts` | Cliente HTTP, validación, timeout, deduplicación y errores tipados |
| `src/data/proyectosData.ts` | Catálogo local del listado |
| `src/data/proyectoDetalleData.ts` | Detalle y actividades complementarias locales |
| `src/pages/proyectos/Proyectos.tsx` | Conmutador y renderizado según el modo |
| `src/pages/proyectos/DetalleProyecto.tsx` | Separación entre detalle API, detalle demo y estados de error |

## Verificación manual

1. Entrar a `/proyectos` con el modo demo desactivado.
2. Comprobar que las tarjetas muestran datos de la API y la etiqueta `API`.
3. Activar el interruptor: el listado debe reemplazarse por completo por datos
   locales con la etiqueta `Demostración`.
4. Recargar la página: la preferencia debe mantenerse.
5. Desactivar el interruptor: debe volver a consultarse Spring Boot.
6. Abrir `/proyectos/1` en modo conectado y `/proyectos/conecta-barrio` en modo
   demo.
7. Con `VITE_ENABLE_DEMO_MODE=false`, comprobar que el interruptor no aparece y
   que las rutas demo no ofrecen activación.

## Limitaciones

- Los datos de demostración no representan información real del backend ni de
  Supabase.
- Las cifras, fechas, responsables y actividades demo son ficticias y están
  etiquetadas como tales.
- La disponibilidad real de la API depende de la instancia EC2 y de la sesión de
  Cognito; este entorno no puede garantizar una prueba contra producción.
