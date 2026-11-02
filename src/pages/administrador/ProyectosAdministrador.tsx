import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAuth } from "react-oidc-context";
import { useRoles } from "../../auth/roles";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
  Paginacion,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { useProyectosApi } from "../../hooks/useProyectosApi";
import {
  actualizarProyectoApi,
  crearProyectoApi,
  eliminarProyectoApi,
  ErrorProyectos,
  type EstadoProyectoSolicitud,
  type ProyectoApi,
  type ProyectoSolicitud,
} from "../../services/proyectosApi";
import { normalizarTexto } from "../../utils/format";
import styles from "../participantes/Participantes.module.css";

type FormularioProyecto = {
  nombre: string;
  descripcion: string;
  estado: EstadoProyectoSolicitud;
};

type ErroresFormularioProyecto = Partial<Record<keyof FormularioProyecto, string>>;

type AccionApi = "listar" | "crear" | "actualizar" | "eliminar";

const TAMANO_PAGINA = 8;
const ESTADOS: EstadoProyectoSolicitud[] = ["ACTIVO", "INACTIVO", "FINALIZADO"];

const formularioInicial: FormularioProyecto = {
  nombre: "",
  descripcion: "",
  estado: "ACTIVO",
};

function convertirError(fallo: unknown): ErrorProyectos {
  if (fallo instanceof ErrorProyectos) {
    return fallo;
  }

  return new ErrorProyectos(
    "red",
    "No fue posible completar la operación con proyectos."
  );
}

function mensajeDeError(error: ErrorProyectos, accion: AccionApi): string {
  const mensaje = error.message;

  switch (error.tipo) {
    case "permisos":
      return `${mensaje} La operación requiere una cuenta del grupo administrador de Cognito.`;
    case "sesion":
      return `${mensaje} Vuelve a iniciar sesión para continuar.`;
    case "red":
      return `${mensaje} Revisa tu conexión y que VITE_API_URL apunte al backend disponible.`;
    case "solicitud":
      return `${mensaje} Revisa los datos del proyecto.`;
    case "no-encontrado":
      return accion === "actualizar" || accion === "eliminar"
        ? "El proyecto ya no existe en el servidor. Se actualizará el listado."
        : mensaje;
    case "cancelado":
      return "";
    default:
      return mensaje;
  }
}

function tonoEstadoProyecto(estado: string) {
  const normalizado = normalizarTexto(estado);

  if (normalizado.includes("activ")) {
    return "exito" as const;
  }
  if (normalizado.includes("final") || normalizado.includes("cerrad")) {
    return "neutral" as const;
  }
  if (normalizado.includes("inactiv") || normalizado.includes("cancel")) {
    return "peligro" as const;
  }

  return "info" as const;
}

export function ProyectosAdministrador() {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;
  const { roles } = useRoles();
  const esAdministrador = roles.includes("administrador");

  const {
    proyectos,
    estado: estadoProyectos,
    error: errorProyectos,
    recargar: recargarProyectos,
  } = useProyectosApi(esAdministrador, accessToken);

  const cargandoListado =
    estadoProyectos === "inactivo" || estadoProyectos === "cargando";
  const errorListado = errorProyectos
    ? mensajeDeError(errorProyectos, "listar")
    : "";

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [proyectoEditando, setProyectoEditando] = useState<ProyectoApi | null>(
    null
  );
  const [formulario, setFormulario] = useState<FormularioProyecto>(formularioInicial);
  const [erroresFormulario, setErroresFormulario] = useState<ErroresFormularioProyecto>({});
  const [eliminando, setEliminando] = useState<ProyectoApi | null>(null);

  const [guardando, setGuardando] = useState(false);
  const [procesandoEliminacion, setProcesandoEliminacion] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");

  const montadoRef = useRef(true);
  const operacionRef = useRef(false);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return proyectos.filter((proyecto) => {
      const contenido = normalizarTexto(
        [
          proyecto.nombre,
          proyecto.descripcion ?? "",
          proyecto.estado,
          String(proyecto.id),
        ].join(" ")
      );

      const coincideBusqueda = !texto || contenido.includes(texto);
      const coincideEstado =
        filtroEstado === "Todos" ||
        proyecto.estado.toUpperCase() === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [proyectos, busqueda, filtroEstado]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / TAMANO_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todos");
    setPagina(1);
  }

  function abrirNuevo() {
    if (!esAdministrador || !accessToken) {
      setErrorOperacion(
        "No hay una sesión administrativa autorizada para crear proyectos."
      );
      return;
    }

    setMensaje("");
    setErrorOperacion("");
    setProyectoEditando(null);
    setFormulario(formularioInicial);
    setErroresFormulario({});
    setFormularioAbierto(true);
  }

  function abrirEdicion(proyecto: ProyectoApi) {
    if (!esAdministrador || !accessToken) {
      setErrorOperacion(
        "No hay una sesión administrativa autorizada para editar proyectos."
      );
      return;
    }

    setMensaje("");
    setErrorOperacion("");
    setProyectoEditando(proyecto);
    setFormulario({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion ?? "",
      estado: proyecto.estado.toUpperCase() as EstadoProyectoSolicitud,
    });
    setErroresFormulario({});
    setFormularioAbierto(true);
  }

  function pedirEliminar(proyecto: ProyectoApi) {
    setMensaje("");
    setErrorOperacion("");
    setEliminando(proyecto);
  }

  function validarFormulario(): ErroresFormularioProyecto {
    const errores: ErroresFormularioProyecto = {};
    const nombre = formulario.nombre.trim();

    if (!nombre) {
      errores.nombre = "El nombre del proyecto es obligatorio.";
    } else if (nombre.length < 3) {
      errores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    const descripcion = formulario.descripcion.trim();
    if (descripcion.length > 500) {
      errores.descripcion = "La descripción no puede superar los 500 caracteres.";
    }

    if (!ESTADOS.includes(formulario.estado)) {
      errores.estado = "Selecciona un estado válido.";
    }

    return errores;
  }

  async function guardarProyecto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (operacionRef.current) {
      return;
    }

    setMensaje("");
    setErrorOperacion("");

    if (!esAdministrador || !accessToken) {
      setErrorOperacion(
        "No hay una sesión administrativa de Cognito disponible para guardar."
      );
      return;
    }

    const errores = validarFormulario();

    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }

    const datos: ProyectoSolicitud = {
      nombre: formulario.nombre.trim(),
      descripcion: formulario.descripcion.trim() || null,
      estado: formulario.estado,
    };

    const estabaEditando = Boolean(proyectoEditando);

    operacionRef.current = true;
    setGuardando(true);

    try {
      if (proyectoEditando) {
        const actualizado = await actualizarProyectoApi(
          proyectoEditando.id,
          datos,
          accessToken
        );

        if (!montadoRef.current) {
          return;
        }

        setMensaje(`Proyecto "${actualizado.nombre}" actualizado correctamente.`);
      } else {
        const creado = await crearProyectoApi(datos, accessToken);

        if (!montadoRef.current) {
          return;
        }

        setMensaje(`Proyecto "${creado.nombre}" creado correctamente.`);
      }

      setFormularioAbierto(false);
      setProyectoEditando(null);
      setErroresFormulario({});
      setPagina(1);
      recargarProyectos();
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const error = convertirError(fallo);

      setErrorOperacion(
        mensajeDeError(error, estabaEditando ? "actualizar" : "crear")
      );

      if (error.tipo === "no-encontrado") {
        recargarProyectos();
      }
    } finally {
      operacionRef.current = false;

      if (montadoRef.current) {
        setGuardando(false);
      }
    }
  }

  async function confirmarEliminacion() {
    if (operacionRef.current || !eliminando) {
      return;
    }

    setMensaje("");
    setErrorOperacion("");

    if (!esAdministrador || !accessToken) {
      setErrorOperacion(
        "No hay una sesión administrativa de Cognito disponible para eliminar."
      );
      return;
    }

    const proyecto = eliminando;

    operacionRef.current = true;
    setProcesandoEliminacion(true);

    try {
      await eliminarProyectoApi(proyecto.id, accessToken);

      if (!montadoRef.current) {
        return;
      }

      setMensaje(`Proyecto "${proyecto.nombre}" eliminado correctamente.`);
      setEliminando(null);
      recargarProyectos();
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const error = convertirError(fallo);

      setErrorOperacion(mensajeDeError(error, "eliminar"));

      if (error.tipo === "no-encontrado") {
        setEliminando(null);
        recargarProyectos();
      }
    } finally {
      operacionRef.current = false;

      if (montadoRef.current) {
        setProcesandoEliminacion(false);
      }
    }
  }

  if (!esAdministrador) {
    return (
      <PageLayout
        titulo="Proyectos"
        descripcion="Administración de proyectos"
        volverA="/administrador/dashboard"
        volverEtiqueta="Volver al panel de administración"
        rol="◈ Administrador"
        demo="DUOC UC · ADMINISTRACIÓN"
      >
        <Aviso tono="peligro">
          <strong>Acceso restringido.</strong> La administración de proyectos
          requiere una sesión de Cognito con el grupo{" "}
          <strong>administrador</strong>.
        </Aviso>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      titulo="Proyectos"
      descripcion="Gestión de proyectos del sistema"
      volverA="/administrador/dashboard"
      volverEtiqueta="Volver al panel de administración"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <Aviso tono="info">
        <strong>Modo administrador real.</strong> Las operaciones se realizan
        sobre <strong>GET/POST/PUT/DELETE /api/proyectos</strong> con el token
        de Cognito. Solo el grupo administrador puede crear, editar o
        eliminar proyectos.
      </Aviso>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de proyectos reales"
      >
        <TarjetaResumen
          etiqueta="Total"
          valor={proyectos.length}
          detalle="Proyectos devueltos por la API"
          icono="▤"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Activos"
          valor={
            proyectos.filter((p) => normalizarTexto(p.estado).includes("activ"))
              .length
          }
          detalle="Proyectos en ejecución/activos"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Finalizados"
          valor={
            proyectos.filter((p) => normalizarTexto(p.estado).includes("final"))
              .length
          }
          detalle="Proyectos finalizados/cerrados"
          icono="◈"
          tono="neutral"
        />
        <TarjetaResumen
          etiqueta="Inactivos/Suspendidos"
          valor={
            proyectos.filter((p) => {
              const n = normalizarTexto(p.estado);
              return n.includes("inactiv") || n.includes("cancel") || n.includes("suspend");
            }).length
          }
          detalle="Proyectos no activos"
          icono="◌"
          tono="advertencia"
        />
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {errorOperacion && <Aviso tono="peligro">{errorOperacion}</Aviso>}

      <section className={ui.panel} aria-labelledby="proyectos-admin-listado">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="proyectos-admin-listado" className={ui.panelTitulo}>
              Listado de proyectos
            </h2>
            <p className={ui.panelDescripcion}>
              Crea, edita y elimina proyectos reales del backend.
            </p>
          </div>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={recargarProyectos}
              disabled={cargandoListado}
            >
              ↻ Actualizar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={abrirNuevo}
              disabled={!esAdministrador || !accessToken || guardando}
            >
              + Nuevo proyecto
            </button>
          </div>
        </div>

        <div className={`${styles.filtros} ${styles.filtrosAdmin}`}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-proyecto-admin"
              etiqueta="Buscar proyecto"
              valor={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, descripción, estado o ID"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="filtro-estado-admin">
              Estado
            </label>
            <select
              id="filtro-estado-admin"
              value={filtroEstado}
              onChange={(evento) => {
                setFiltroEstado(evento.target.value);
                setPagina(1);
              }}
            >
              <option value="Todos">Todos</option>
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={ui.resultadoCabecera}>
          <p className={ui.resultadoConteo} role="status">
            {filtrados.length}{" "}
            {filtrados.length === 1 ? "proyecto encontrado" : "proyectos encontrados"}{" "}
            de {proyectos.length}
          </p>

          {(busqueda || filtroEstado !== "Todos") && (
            <button
              type="button"
              className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {errorListado && (
          <Aviso tono="peligro">
            <strong>No fue posible cargar los proyectos.</strong> {errorListado}{" "}
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={recargarProyectos}
            >
              Reintentar
            </button>
          </Aviso>
        )}

        {cargandoListado && proyectos.length > 0 && (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Actualizando proyectos...
          </div>
        )}

        {cargandoListado && proyectos.length === 0 ? (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Consultando proyectos en la API...
          </div>
        ) : proyectos.length === 0 ? (
          <EstadoVacio
            titulo={errorListado ? "No se pudo cargar el listado" : "No hay proyectos registrados"}
            descripcion={
              errorListado
                ? "La API no entregó el listado de proyectos. Revisa el mensaje y vuelve a intentarlo."
                : "Crea el primer proyecto real para que aparezca en el selector de Participantes."
            }
            accion={
              errorListado ? (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonSecundario}`}
                  onClick={recargarProyectos}
                >
                  Reintentar consulta
                </button>
              ) : (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonPrimario}`}
                  onClick={abrirNuevo}
                  disabled={!esAdministrador || !accessToken}
                >
                  + Nuevo proyecto
                </button>
              )
            }
          />
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="No hay proyectos que coincidan"
            descripcion="Prueba con otro término de búsqueda o cambia el filtro de estado."
            accion={
              <button
                type="button"
                className={`${ui.boton} ${ui.botonSecundario}`}
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            }
          />
        ) : (
          <>
            <div className={ui.tablaWrap}>
              <table className={ui.tabla}>
                <caption className={ui.srOnly}>
                  Proyectos reales con sus datos
                </caption>
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Descripción</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((proyecto) => (
                    <tr key={proyecto.id}>
                      <td data-label="ID">#{proyecto.id}</td>
                      <td data-label="Nombre">
                        <div className={ui.celdaPrincipal}>
                          <strong>{proyecto.nombre}</strong>
                        </div>
                      </td>
                      <td data-label="Descripción">
                        <span className={styles.correo}>
                          {proyecto.descripcion && proyecto.descripcion.trim()
                            ? proyecto.descripcion
                            : "Sin descripción"}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <Etiqueta tono={tonoEstadoProyecto(proyecto.estado)}>
                          {proyecto.estado}
                        </Etiqueta>
                      </td>
                      <td data-label="Acciones">
                        <div className={ui.celdaAcciones}>
                          <button
                            type="button"
                            className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                            onClick={() => abrirEdicion(proyecto)}
                            disabled={!esAdministrador || !accessToken}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`${ui.boton} ${ui.botonPeligro} ${ui.botonPequeno}`}
                            onClick={() => pedirEliminar(proyecto)}
                            disabled={!esAdministrador || !accessToken}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Paginacion
              pagina={paginaActual}
              totalPaginas={totalPaginas}
              onCambiar={setPagina}
            />
          </>
        )}
      </section>

      <p className={ui.metaTexto}>
        Se utilizan únicamente los campos entregados por el backend: id, nombre,
        descripción y estado. Las operaciones respetan los permisos del servidor.
      </p>

      <Modal
        abierto={formularioAbierto}
        titulo={proyectoEditando ? "Editar proyecto" : "Nuevo proyecto"}
        onCerrar={() => {
          if (!guardando) {
            setFormularioAbierto(false);
          }
        }}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => {
                if (!guardando) {
                  setFormularioAbierto(false);
                }
              }}
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-proyecto-admin"
              className={`${ui.boton} ${ui.botonPrimario}`}
              disabled={guardando || !esAdministrador || !accessToken}
            >
              {guardando
                ? "Guardando..."
                : proyectoEditando
                  ? "Guardar cambios"
                  : "Crear proyecto"}
            </button>
          </>
        }
      >
        <form
          id="form-proyecto-admin"
          className={styles.formulario}
          onSubmit={guardarProyecto}
          noValidate
        >
          {errorOperacion && <Aviso tono="peligro">{errorOperacion}</Aviso>}

          <div className={styles.formularioGrid}>
            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label className={ui.campoEtiqueta} htmlFor="proyecto-admin-nombre">
                Nombre del proyecto *
              </label>
              <input
                id="proyecto-admin-nombre"
                value={formulario.nombre}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    nombre: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.nombre)}
                aria-describedby={
                  erroresFormulario.nombre
                    ? "error-proyecto-admin-nombre"
                    : undefined
                }
                maxLength={120}
                disabled={guardando}
                required
              />
              {erroresFormulario.nombre && (
                <p
                  id="error-proyecto-admin-nombre"
                  className={ui.campoError}
                >
                  {erroresFormulario.nombre}
                </p>
              )}
            </div>

            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label className={ui.campoEtiqueta} htmlFor="proyecto-admin-descripcion">
                Descripción
              </label>
              <textarea
                id="proyecto-admin-descripcion"
                value={formulario.descripcion}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    descripcion: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.descripcion)}
                aria-describedby={
                  erroresFormulario.descripcion
                    ? "error-proyecto-admin-descripcion"
                    : undefined
                }
                maxLength={500}
                disabled={guardando}
                rows={4}
              />
              {erroresFormulario.descripcion && (
                <p
                  id="error-proyecto-admin-descripcion"
                  className={ui.campoError}
                >
                  {erroresFormulario.descripcion}
                </p>
              )}
              <p className={ui.metaTexto}>
                {formulario.descripcion.length}/500 caracteres
              </p>
            </div>

            <div className={ui.campo}>
              <label className={ui.campoEtiqueta} htmlFor="proyecto-admin-estado">
                Estado *
              </label>
              <select
                id="proyecto-admin-estado"
                value={formulario.estado}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    estado: evento.target.value as EstadoProyectoSolicitud,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.estado)}
                aria-describedby={
                  erroresFormulario.estado
                    ? "error-proyecto-admin-estado"
                    : undefined
                }
                disabled={guardando}
              >
                {ESTADOS.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {erroresFormulario.estado && (
                <p
                  id="error-proyecto-admin-estado"
                  className={ui.campoError}
                >
                  {erroresFormulario.estado}
                </p>
              )}
            </div>
          </div>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(eliminando)}
        titulo="Eliminar proyecto"
        onCerrar={() => {
          if (!procesandoEliminacion) {
            setEliminando(null);
          }
        }}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setEliminando(null)}
              disabled={procesandoEliminacion}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPeligro}`}
              onClick={() => void confirmarEliminacion()}
              disabled={procesandoEliminacion}
            >
              {procesandoEliminacion ? "Eliminando..." : "Eliminar definitivamente"}
            </button>
          </>
        }
      >
        {errorOperacion && <Aviso tono="peligro">{errorOperacion}</Aviso>}

        <p className={ui.textoSuave}>
          ¿Confirmas la eliminación de{" "}
          <strong>{eliminando?.nombre}</strong>? Se ejecutará DELETE
          /api/proyectos/{eliminando?.id} y la acción no se puede deshacer.
        </p>

        <p className={ui.metaTexto}>
          Si hay participantes vinculados, el backend aplicará su propia validación
          de permisos/reglas.
        </p>
      </Modal>
    </PageLayout>
  );
}
