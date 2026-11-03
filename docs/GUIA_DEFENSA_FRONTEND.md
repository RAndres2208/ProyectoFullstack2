# Guía breve para la defensa técnica de SyncPass

## 1. Qué es y qué resuelve

SyncPass es una interfaz web para organizar información académica y gestionar cursos, estudiantes, docentes, proyectos, participantes y asistencia según el rol de la persona. Busca reunir esas tareas en una aplicación con vistas diferenciadas. Este repositorio implementa el **frontend**: pantallas, navegación, autenticación OIDC con Cognito, modo de demostración y clientes HTTP que integran algunas funciones con una API. No contiene la implementación del servidor Spring Boot ni el esquema de base de datos.

En la interfaz, el **Administrador** dispone de paneles de usuarios, roles, cursos, proyectos y participantes; el **Coordinador** consulta paneles, cursos, docentes y asistencia; el **Docente** tiene vistas de cursos, estudiantes y asistencia; y el **Estudiante** consulta panel, cursos, asistencia y perfil. Las rutas y nombres de rol están en el código; esto no demuestra por sí solo que cada operación esté habilitada en el servidor. Algunas pantallas y datos funcionan en modo demostración local, claramente separado de la API.

## 2. Arquitectura y recorrido de una petición

El proyecto usa React y TypeScript para la interfaz. Vite compila la aplicación; `vercel.json` establece la reescritura SPA y `src/main.tsx` tiene una URL de retorno de producción en Vercel. Cognito se integra mediante OIDC. Después de iniciar sesión, las pantallas pueden pasar el `access_token` al cliente HTTP, que realiza `fetch` a la URL configurada en `VITE_API_URL` y envía el token en `Authorization`.

**Recorrido previsto para una operación autenticada:** Usuario → React → inicio de sesión OIDC en Cognito (antes de la llamada, si aún no hay sesión) → petición HTTP con token → endpoint de API → lógica y persistencia del backend → respuesta JSON → React. El cliente implementa el envío del token y trata respuestas 401/403. En un backend, la API debe verificar firma, emisor, audiencia y expiración del JWT y aplicar permisos; esa validación no puede inspeccionarse aquí porque el código Spring no está en este repositorio. `src/auth/roles.ts` decodifica claims para elegir y proteger vistas, pero advierte que no valida la firma: no es una frontera de seguridad del servidor.

La documentación local describe un backend Spring Boot en EC2 y persistencia PostgreSQL/Supabase. Sin embargo, no hay código de despliegue de ese backend, configuración de PostgreSQL, Caddyfile ni pruebas de conectividad a la instancia en este repositorio. Caddy podría actuar como proxy inverso y terminar HTTPS si así está configurado en la infraestructura, pero aquí no se verifica. Tampoco se encontró implementación de AWS API Gateway; no debe confundirse un proxy inverso con API Gateway ni afirmarse que se usa este servicio. Vercel sí está reflejado por `vercel.json`, aunque el archivo no acredita el estado actual del despliegue.

## 3. Archivos importantes

| Archivo | Función comprobable |
|---|---|
| `src/main.tsx` | Monta React, configura `AuthProvider` OIDC/Cognito y los proveedores de contexto. |
| `vite.config.ts` | Configura los plugins React y Tailwind para Vite. |
| `vercel.json` | Reescribe las rutas hacia `index.html` para navegación SPA. |
| `src/App.tsx` | Declara rutas y vistas; compara el rol disponible antes de mostrar áreas privadas. |
| `src/auth/roles.ts` | Interpreta grupos/claims y define los cuatro roles y sus rutas iniciales. |
| `src/services/apiClient.ts` | Centraliza `fetch`, URL base, cabecera de autorización, timeout y errores HTTP. |
| `src/services/proyectosApi.ts` | Valida y solicita listado, detalle y operaciones de proyectos. |
| `src/services/participantesApi.ts` | Valida y solicita operaciones CRUD de participantes. |
| `src/services/academicoApi.ts` | Cliente de cursos, docentes, estudiantes e inscripciones. |
| `src/services/asistenciaApi.ts` | Consulta asistencia y envía sesiones de asistencia. |
| `src/services/registroAdminApi.ts` | Envía la creación de usuarios al endpoint administrativo. |
| `src/pages/administrador/ProyectosAdministrador.tsx` | Usa el cliente de proyectos para crear, editar y eliminar desde la vista administrativa. |
| `src/pages/participantes/ParticipantesAdmin.tsx` | Usa los endpoints CRUD de participantes desde la pantalla de administración. |
| `src/pages/docente/AsistenciaDocenteApi.tsx` | Consume el cliente de asistencia desde la vista docente. |
| `package.json` | Declara dependencias y scripts de desarrollo, build, lint y pruebas. |

`src/pages/administrador/RegistroUsuarioAdmin.tsx` consume el servicio de registro. `src/pages/estudiante/MisCursosApi.tsx` es una variante de consulta real; existen también pantallas de demostración, por lo que hay que distinguirlas al exponer el flujo.

## 4. CRUD e integración con la API

Las rutas siguientes están implementadas en los **clientes frontend** y se conectan con pantallas cuando se indica. “Controlador”, “Service” de Spring, repositorio JPA y entidad persistente no se pueden nombrar: sus clases fuente no están presentes. Los tipos `*Api` son DTO/modelos TypeScript, no entidades JPA. Los tests API del proyecto usan `fetch` simulado; prueban el comportamiento del cliente, no la disponibilidad pública real. Los contratos documentados son evidencia de integración esperada, no una prueba de que cada endpoint esté hoy activo.

| Recurso y operación | Endpoint HTTP y uso |
|---|---|
| **Proyectos** | READ: `GET /api/proyectos` y `GET /api/proyectos/{id}`; CREATE: `POST /api/proyectos`; UPDATE: `PUT /api/proyectos/{id}`; DELETE: `DELETE /api/proyectos/{id}` (204). Servicio `proyectosApi.ts`; CRUD invocado por la pantalla de administración. |
| **Participantes** | READ: `GET /api/participantes`, `GET /api/participantes?proyectoId={id}` y `GET /api/participantes/{id}`; CREATE: `POST /api/participantes`; UPDATE: `PUT /api/participantes/{id}`; DELETE: `DELETE /api/participantes/{id}` (204). Servicio `participantesApi.ts`; se usa en administración. |
| **Cursos** | READ: `GET /api/cursos`, `GET /api/cursos/{id}`; CREATE: `POST /api/cursos`; UPDATE: `PUT /api/cursos/{id}` y `PUT /api/cursos/{id}/docente`. Servicio `academicoApi.ts`, utilizado por pantallas académicas. **No hay DELETE de curso** en el contrato de este cliente. |
| **Matrículas** | READ: `GET /api/cursos/{cursoId}/estudiantes` y `GET /api/cursos/estudiante/{estudianteId}`; alta: `POST /api/cursos/{cursoId}/estudiantes`; baja: `DELETE /api/cursos/{cursoId}/estudiantes/{estudianteId}`. Servicio `academicoApi.ts`; algunas pantallas de curso usan esta integración. |
| **Asistencia** | READ: `GET /api/asistencias?cursoId={id}&fecha={fecha}` y `GET /api/asistencias/estudiante/{sub}`; registro de sesión: `POST /api/asistencias/sesiones`. Servicio `asistenciaApi.ts`; la vista docente de asistencia lo consume. No se ofrece UPDATE/DELETE general. |
| **Usuarios** | CREATE: `POST /api/auth/registro` vía `registroAdminApi.ts`. El código declara que no implementa listado, edición ni eliminación de cuentas. |

En proyectos, participantes y cursos el término CRUD es parcial si faltan operaciones: usuarios solo tienen creación y asistencia registra/consulta, no un CRUD completo. Para las rutas accesibles desde fuera, la evidencia de tests disponible es simulada; confirmar producción requiere ejecutar una prueba autorizada contra la API configurada.

## 5. Tecnologías relevantes

| Tecnología | Uso en este repositorio |
|---|---|
| React 19 y React DOM | Componentes y montaje de la interfaz. |
| TypeScript 6 | Tipos para vistas, datos y respuestas del cliente. |
| Vite 8 y `@vitejs/plugin-react` | Desarrollo y compilación del frontend. |
| Wouter | Enrutamiento declarado en `src/App.tsx`. |
| `oidc-client-ts` y `react-oidc-context` | Flujo OIDC, sesión y acceso a tokens de Cognito. |
| Tailwind CSS 4 y `@tailwindcss/vite` | Estilos y plugin de integración con Vite. |
| Fetch API | Solicitudes HTTP centralizadas en `apiClient.ts`; no hay dependencia Axios. |
| Karma, Jasmine y Testing Library | Infraestructura de pruebas declarada en `package.json`. |
| Vercel | Configuración de reescritura de SPA en `vercel.json`. |

## 6. Cómo utilizamos inteligencia artificial para desarrollar SyncPass

El repositorio no contiene evidencia verificable que atribuya tareas concretas a GitHub Copilot u otra herramienta de IA (por ejemplo, registro de prompts o declaración del equipo). Por tanto, antes de presentar este punto, el equipo debe confirmar qué herramientas usó y en qué actividades. Si se utilizaron, pueden describirse como apoyo para generar o revisar código, crear componentes, explicar errores, refactorizar, proponer pruebas, documentar o asistir en integración y despliegue, siempre según la experiencia real del equipo.

La IA como **herramienta de apoyo al desarrollo** no equivale a una funcionalidad del producto. No se encontró código que conecte SyncPass en producción con un modelo de IA; no se debe decir que la plataforma incorpora IA generativa.

## 7. Preguntas frecuentes del profesor

1. **¿Qué es SyncPass?** Una interfaz web para organizar tareas académicas y administrativas por rol, con algunas funciones conectadas a una API y otras disponibles como demostración.
2. **¿Por qué React?** Permite construir pantallas con componentes reutilizables y actualizar la interfaz según la sesión, el rol y los datos recibidos.
3. **¿Qué es Spring Boot?** Un framework Java para construir aplicaciones y APIs. Está descrito como backend de SyncPass, pero su código no forma parte de este repositorio.
4. **¿Qué es una API REST?** Una interfaz HTTP donde recursos se consultan o modifican con métodos como GET, POST, PUT y DELETE; el frontend usa rutas `/api/...`.
5. **¿Dónde están los CRUD?** Los clientes de `src/services/` ejecutan las solicitudes y las pantallas administrativas los usan. No están los controladores ni repositorios de Spring.
6. **¿Qué función cumplen los controladores?** En una API Spring reciben rutas HTTP, coordinan la solicitud y devuelven una respuesta; su implementación aquí no se puede verificar.
7. **¿Qué hace la capa Service?** En una arquitectura por capas concentra reglas de negocio entre controladores y persistencia. No hay clases `@Service` en este frontend.
8. **¿Qué es JPA?** Una especificación/API Java para mapear objetos a tablas relacionales. Este proyecto frontend no declara ni configura JPA.
9. **¿Cómo se conecta el backend a PostgreSQL?** El documento de contratos describe persistencia PostgreSQL/Supabase, pero aquí no están las credenciales ni configuración JDBC; debe explicarlo el equipo backend.
10. **¿Cómo se comunica React con Spring Boot?** Los servicios construyen la URL desde `VITE_API_URL`, envían JSON con `fetch` y añaden el token de sesión en `Authorization`.
11. **¿Para qué sirve Cognito?** Para autenticar usuarios mediante OIDC y entregar tokens/claims que el frontend usa para la sesión y la selección de rol.
12. **¿Qué es JWT?** Un formato de token con claims que permite transportar información firmada. El backend debe validar firma y vigencia; el frontend solo decodifica claims para navegación.
13. **¿Qué hace Caddy?** Si se instala delante de la API, puede actuar como proxy inverso y gestionar HTTPS; este repositorio no contiene su configuración ni acredita su uso.
14. **¿Utilizaron API Gateway?** No hay implementación ni configuración de AWS API Gateway en este repositorio; no debe afirmarse su uso sin evidencia externa.
15. **¿Cómo utilizaron inteligencia artificial?** El repositorio no lo documenta. El equipo debe confirmar las herramientas y tareas efectivamente realizadas; no hay evidencia de IA como función del producto.

## 8. Límites y puntos por confirmar

- La existencia y disponibilidad pública de los endpoints requiere verificación en el entorno real; las pruebas API actuales usan respuestas simuladas.
- Las clases Java, validaciones del servidor, entidades, tablas y permisos efectivos no se pueden describir desde este repositorio.
- La configuración exacta de EC2, Caddy, HTTPS, Supabase PostgreSQL y el estado de Vercel necesita evidencia del despliegue.
- Algunas vistas usan datos de demostración en memoria o catálogos locales; no deben presentarse como persistencia real.
- Las tareas de IA durante el desarrollo requieren confirmación explícita del equipo.
