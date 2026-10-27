# Contratos de API — SyncPass Frontend

Documento de integración entre el frontend React + TypeScript de SyncPass y el
backend Spring Boot desplegado en AWS EC2.

> Estado: **Etapa 2 (consolidación del frontend)**.
> Este documento no implementa endpoints nuevos en Spring Boot. Solo describe
> lo que el frontend ya consume y lo que necesita del backend para las demás
> pantallas.

## 1. Convenciones generales

| Aspecto | Convención |
| --- | --- |
| URL base | `VITE_API_URL` (sin barra final; el frontend la normaliza) |
| Formato | JSON UTF-8 |
| Autenticación | `Authorization: Bearer <access_token>` emitido por Amazon Cognito |
| Cabeceras del frontend | `Accept: application/json` |
| Caché del navegador | `cache: "no-store"` en `fetch` |
| Fechas | ISO 8601 (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`) |
| Identificadores | `number` entero positivo para entidades persistidas |
| Envoltura de éxito | `{ "success": true, "data": ... }` |
| Envoltura de error | `{ "success": false, "mensaje": "..." }` (propuesta) |
| Zona horaria | `America/Santiago` para presentación; el backend entrega ISO 8601 |

### Seguridad

- El frontend **nunca** registra el `access_token` en consola, en mensajes de
  error ni en el DOM.
- El token se envía únicamente en la cabecera `Authorization`.
- Las variables `VITE_*` son públicas en la build de Vite: **no deben contener
  secretos**. La configuración de Cognito usa el `client_id` público y el
  `authority`; no se incluye `client_secret` en el frontend.
- El backend es responsable de validar la firma, el emisor, la audiencia y la
  expiración del token de Cognito, además de aplicar autorización por rol.

## 2. Endpoints confirmados

Estos endpoints ya fueron utilizados previamente y son la base de la integración
actual.

### 2.1 Listar proyectos

```http
GET {VITE_API_URL}/api/proyectos
Authorization: Bearer <access_token>
Accept: application/json
```

**Respuesta exitosa — `200 OK`**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Comunidad Activa",
      "estado": "Activo",
      "participantes": 35
    }
  ]
}
```

**Campos confirmados**

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `success` | `boolean` | Sí | Debe ser `true` para considerar válida la respuesta |
| `data` | `array` | Sí | Listado de proyectos |
| `data[].id` | `number` entero > 0 | Sí | Identificador numérico usado en `/proyectos/:id` |
| `data[].nombre` | `string` no vacío | Sí | Nombre visible del proyecto |
| `data[].estado` | `string` no vacío | Sí | Estado entregado por el backend (por ejemplo `Activo`) |
| `data[].participantes` | `number` entero >= 0 | Sí | Cantidad de participantes |

**Importante:** el contrato confirmado **no** incluye descripción, fechas,
responsable, unidad vecinal, sector, categoría, métricas, eventos ni
estadísticas. El frontend no inventa esos campos ni los presenta como reales.
Cuando se muestran secciones complementarias, están marcadas explícitamente como
**Demostración**.

**Estados HTTP esperados**

| Código | Interpretación en el frontend |
| --- | --- |
| `200` | Listado válido; se valida el contrato y se deduplican IDs |
| `401` | Sesión de Cognito expirada o inválida; se ofrece renovar sesión |
| `403` | La cuenta no tiene permisos; no se reintenta automáticamente |
| `404` | La ruta del servicio no existe en la URL configurada |
| `5xx` | Error del servidor; se ofrece reintentar |
| Error de red / timeout | Se informa y se ofrece reintentar; no se usan datos demo automáticamente |

**Comportamiento del cliente**

- Timeout de 15 segundos con `AbortController`.
- Deduplicación de solicitudes idénticas en curso.
- Deduplicación de proyectos por `id` si el backend repite alguno.
- Validación estricta de tipos antes de renderizar.
- Los errores no exponen el token ni el cuerpo completo de la respuesta.

## 3. Endpoints propuestos

> **Propuestos, no implementados.** Requieren acuerdo con el responsable del
> backend. El frontend actual funciona con datos locales de demostración en
> estas pantallas.

### 3.1 Detalle de proyecto

```http
GET {VITE_API_URL}/api/proyectos/{id}
```

**Respuesta propuesta — `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Comunidad Activa",
    "estado": "Activo",
    "participantes": 35,
    "descripcion": "Texto breve del proyecto",
    "responsable": "Nombre del responsable",
    "unidadVecinal": "Unidad vecinal 12",
    "sector": "Los Aromos",
    "fechaInicio": "2026-10-01",
    "fechaTermino": "2026-11-30",
    "categoria": "Inclusión digital"
  }
}
```

Campos adicionales propuestos como **opcionales**; el frontend debe seguir
funcionando si solo llegan `id`, `nombre`, `estado` y `participantes`.

Estados: `200`, `401`, `403`, `404` (proyecto inexistente), `5xx`.

### 3.2 Eventos

```http
GET {VITE_API_URL}/api/eventos?proyectoId={id}&estado={estado}
GET {VITE_API_URL}/api/eventos/{id}
GET {VITE_API_URL}/api/proyectos/{id}/eventos
```

Respuesta propuesta por evento:

```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "nombre": "Alfabetización digital",
      "proyectoId": 1,
      "proyectoNombre": "Comunidad Activa",
      "estado": "En curso",
      "fecha": "2026-10-16",
      "horario": "10:00-12:00",
      "lugar": "Sede vecinal Los Aromos",
      "cuposMaximos": 40,
      "inscritos": 32,
      "asistentes": 24
    }
  ]
}
```

Estados: `200`, `401`, `403`, `404`, `5xx`.

### 3.3 Participantes

```http
GET {VITE_API_URL}/api/participantes?proyectoId={id}&estado={estado}
GET {VITE_API_URL}/api/participantes/{id}
POST {VITE_API_URL}/api/participantes
PATCH {VITE_API_URL}/api/participantes/{id}
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "nombre": "Ana Torres",
      "correo": "ana.torres@ejemplo.cl",
      "telefono": "+56 9 6123 4501",
      "estado": "Activo",
      "proyectoId": 1,
      "proyectoNombre": "Comunidad Activa",
      "fechaRegistro": "2026-02-10",
      "asistencias": 8,
      "eventosInscritos": 9
    }
  ]
}
```

Estados: `200`, `201`, `400` (datos inválidos), `401`, `403`, `404`, `409`
(duplicado), `5xx`.

### 3.4 Asistencias y quórum

```http
GET {VITE_API_URL}/api/eventos/{id}/quorum
POST {VITE_API_URL}/api/eventos/{id}/asistencias
```

Respuesta propuesta de quórum:

```json
{
  "success": true,
  "data": {
    "eventoId": 16,
    "umbral": 70,
    "asistentes": 24,
    "ausentes": 5,
    "justificados": 3,
    "total": 32,
    "registros": [
      {
        "participanteId": 101,
        "estado": "Asistió",
        "hora": "10:02"
      }
    ]
  }
}
```

Estados: `200`, `201`, `400`, `401`, `403`, `404`, `409`, `5xx`.

### 3.5 Encuestas

```http
GET {VITE_API_URL}/api/encuestas?proyectoId={id}&estado={estado}
GET {VITE_API_URL}/api/encuestas/{id}
POST {VITE_API_URL}/api/encuestas
POST {VITE_API_URL}/api/encuestas/{id}/respuestas
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "titulo": "Evaluación del taller",
    "descripcion": "Cuéntanos cómo fue tu experiencia.",
    "proyectoId": 1,
    "estado": "Activa",
    "fechaCreacion": "2026-10-16",
    "fechaCierre": "2026-10-30",
    "habilitados": 32,
    "respondidas": 24,
    "preguntas": [
      {
        "id": 1,
        "texto": "¿Cómo calificas el taller?",
        "tipo": "unica",
        "requerida": true,
        "opciones": [
          { "id": 1, "texto": "Excelente", "votos": 10 }
        ]
      }
    ]
  }
}
```

Estados: `200`, `201`, `400`, `401`, `403`, `404`, `409` (encuesta cerrada o
respuesta duplicada), `5xx`.

### 3.6 Reportes

```http
GET {VITE_API_URL}/api/reportes?proyectoId={id}&desde={ISO}&hasta={ISO}
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": [
    {
      "eventoId": 16,
      "fecha": "2026-10-16",
      "proyectoId": 1,
      "proyectoNombre": "Comunidad Activa",
      "nombre": "Alfabetización digital",
      "inscritos": 32,
      "asistentes": 24,
      "encuestas": 18
    }
  ]
}
```

Estados: `200`, `400` (rango inválido), `401`, `403`, `5xx`.

### 3.7 Historial de actividad

```http
GET {VITE_API_URL}/api/historial?page=1&size=20&tipo={tipo}
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": [
    {
      "id": 21,
      "fecha": "2026-10-26T09:42:00",
      "tipo": "Sesión",
      "descripcion": "Inicio de sesión con Cognito",
      "actor": "Robinson — Docente",
      "estado": "Completado",
      "detalle": "Sesión iniciada mediante Amazon Cognito.",
      "referencia": "Sesión actual"
    }
  ],
  "meta": {
    "page": 1,
    "size": 20,
    "total": 21
  }
}
```

Estados: `200`, `400`, `401`, `403`, `5xx`.

### 3.8 Perfil del usuario

Opción recomendada: obtener los datos desde los claims de Cognito ya presentes
en la sesión del frontend (sin endpoint adicional para datos básicos).

Si el backend necesita datos de perfil persistidos:

```http
GET {VITE_API_URL}/api/usuarios/me
PATCH {VITE_API_URL}/api/usuarios/me
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": {
    "id": "cognito-sub",
    "nombre": "Robinson",
    "correo": "usuario@ejemplo.cl",
    "rol": "Docente",
    "institucion": "DUOC UC"
  }
}
```

Estados: `200`, `400`, `401`, `403`, `5xx`.

### 3.9 Resumen del panel principal

```http
GET {VITE_API_URL}/api/dashboard/resumen
```

Respuesta propuesta:

```json
{
  "success": true,
  "data": {
    "proyectosActivos": 3,
    "eventosEnCurso": 1,
    "participantes": 120,
    "asistencias": 24,
    "sincronizados": 21,
    "pendientes": 3
  }
}
```

Estados: `200`, `401`, `403`, `5xx`.

### 3.10 Sincronización de registros offline

```http
POST {VITE_API_URL}/api/sincronizacion/lote
```

Solicitud propuesta:

```json
{
  "registros": [
    {
      "idLocal": "demo-a-1",
      "tipo": "asistencia",
      "eventoId": 16,
      "identificador": "LOC-A022",
      "creadoEn": "2026-10-16T10:31:00"
    }
  ]
}
```

Respuesta propuesta — `200 OK`:

```json
{
  "success": true,
  "data": {
    "aceptados": 1,
    "rechazados": 0,
    "detalles": []
  }
}
```

Estados: `200`, `400`, `401`, `403`, `409` (duplicado idempotente), `5xx`.

## 4. Responsabilidades

| Responsabilidad | Frontend | Backend Spring Boot |
| --- | --- | --- |
| Iniciar sesión y obtener `access_token` | Sí (Cognito / OIDC) | — |
| Enviar `Authorization: Bearer` | Sí | — |
| Validar firma, emisor, audiencia y expiración | — | Sí |
| Aplicar roles y permisos | Presentación y bloqueo de UI | Sí (autorización real) |
| Validar y tipar respuestas | Sí | — |
| Validar datos de entrada | Validación de formularios | Sí (fuente de verdad) |
| Persistencia PostgreSQL / Supabase | — | Sí |
| Manejo de errores HTTP y reintentos manuales | Sí | Mensajes y códigos consistentes |
| Datos de demostración | Sí (solo con modo demo explícito) | No participa |
| Timeout y cancelación | Sí (`AbortController`) | — |
| CORS para el dominio del frontend | — | Sí |
| Contrato y versionado de endpoints | Consumo | Definición y documentación |

## 5. Manejo de errores en el frontend

El cliente `src/services/proyectosApi.ts` distingue:

| Tipo | Origen | Acción en la interfaz |
| --- | --- | --- |
| `configuracion` | Falta `VITE_API_URL` | Mensaje de configuración; sin reintento automático |
| `sesion` | HTTP 401 o token ausente | “Sesión expirada”; botón explícito para renovar con Cognito |
| `permisos` | HTTP 403 | Mensaje de permisos; no se reintenta en bucle |
| `no-encontrado` | HTTP 404 | Ruta o servicio no disponible |
| `servidor` | HTTP 5xx u otros rechazos | Mensaje genérico y botón “Reintentar” |
| `red` | `fetch` rechazado | Mensaje de conexión y botón “Reintentar” |
| `tiempo` | Timeout de 15 s | Mensaje de timeout y botón “Reintentar” |
| `respuesta` | JSON inválido o contrato incumplido | Mensaje de respuesta inválida |
| `cancelado` | `AbortController` externo | Se ignora si la vista ya se desmontó |

Ningún error activa el modo demostración de forma automática. Tampoco se elimina
la sesión de Cognito ni se redirige en bucle.

## 6. Pendientes que dependen del backend

1. Confirmar si `/api/proyectos/{id}` existirá y con qué campos.
2. Confirmar los endpoints de eventos, participantes, encuestas, quórum,
   reportes, historial y dashboard.
3. Acordar la envoltura de error (`success: false` + `mensaje`) y los códigos
   usados para validación (`400`), duplicados (`409`) y permisos (`403`).
4. Confirmar paginación (`page`/`size`/`meta.total`) para historial y reportes.
5. Confirmar CORS para el dominio de producción del frontend.
6. Confirmar si la cantidad de `participantes` será un contador agregado o si se
   obtendrá desde el endpoint de participantes.
7. Definir la estrategia de idempotencia para la sincronización offline.

## 7. Cómo verificar el contrato desde el frontend

1. Configurar `VITE_API_URL` en el entorno local (sin subir el archivo `.env`).
2. Iniciar sesión con Cognito.
3. Abrir `/proyectos` en modo conectado.
4. Verificar que las tarjetas muestran nombre, estado y participantes de la API.
5. Revisar la consola del navegador: no debe aparecer el token.
6. Simular errores (401, 5xx, timeout) y comprobar los mensajes y el botón de
   reintento.
7. Activar el modo demostración solo de forma manual y comprobar que el listado
   cambia por completo a datos locales etiquetados.
