import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Aviso,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
} from "../ui/Ui";
import ui from "../ui/Ui.module.css";
import { useAcademico } from "../../context/AcademicoContext";
import {
  ESTADOS_CURSO,
  type Curso,
  type CursoSolicitud,
  type DocenteAcademico,
  type EstudianteAcademico,
  type EstadoCurso,
} from "../../types/academico";
import { normalizarTexto } from "../../utils/format";
import styles from "./Academico.module.css";

/**
 * Controlador opcional para las pantallas de coordinación conectadas a la API.
 * Cuando se entrega, `GestionCursos` deja de usar cursos/docentes locales.
 * La eliminación no se expone porque el backend no publica DELETE de cursos.
 */
export type ControladorCursosApi = {
  cursos: Curso[];
  docentes: DocenteAcademico[];
  cargando: boolean;
  error: string | null;
  onReintentar: () => void;
  crearCurso: (datos: CursoSolicitud) => Promise<Curso>;
  actualizarCurso: (id: string, datos: CursoSolicitud) => Promise<Curso>;
  listarEstudiantes: () => Promise<EstudianteAcademico[]>;
  listarEstudiantesDeCurso: (cursoId: string) => Promise<EstudianteAcademico[]>;
  inscribirEstudiante: (cursoId: string, estudianteId: string) => Promise<void>;
  retirarEstudiante: (cursoId: string, estudianteId: string) => Promise<void>;
};

type GestionCursosProps = {
  cursos?: Curso[];
  api?: ControladorCursosApi;
  puedeGestionar: boolean;
  docentePredeterminadoId?: string | null;
  titulo?: string;
  descripcion?: string;
};

type FormularioCurso = {
  nombre: string;
  codigo: string;
  descripcion: string;
  estado: EstadoCurso;
  docenteId: string;
};

type ErroresFormulario = Partial<Record<keyof FormularioCurso, string>>;

function formularioInicial(docenteId: string): FormularioCurso {
  return {
    nombre: "",
    codigo: "",
    descripcion: "",
    estado: "Activo",
    docenteId,
  };
}

function tonoEstadoCurso(estado: EstadoCurso) {
  if (estado === "Activo") {
    return "exito" as const;
  }

  if (estado === "Finalizado") {
    return "neutral" as const;
  }

  return "advertencia" as const;
}

export function GestionCursos({
  cursos: cursosProp,
  api,
  puedeGestionar,
  docentePredeterminadoId = null,
  titulo = "Cursos del ámbito",
  descripcion = "Crea cursos, asigna docentes e inscribe estudiantes.",
}: GestionCursosProps) {
  const {
    cursos: cursosContexto,
    docentes: docentesContexto,
    estudiantes,
    obtenerEstudiantesDeCurso,
    crearCurso: crearCursoLocal,
    actualizarCurso: actualizarCursoLocal,
    eliminarCurso,
    inscribirEstudiante,
    retirarEstudiante,
  } = useAcademico();

  const cursosDemo = cursosProp ?? [];
  const cursosFuente = api ? api.cursos : cursosDemo;
  const docentes = api ? api.docentes : docentesContexto;
  const todosLosCursos = api ? api.cursos : cursosContexto;

  const [busqueda, setBusqueda] = useState("");
  const [filtroDocente, setFiltroDocente] = useState("Todos");
  const [mensaje, setMensaje] = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");
  const [guardando, setGuardando] = useState(false);

  const docenteFijo = useMemo(
    () =>
      docentePredeterminadoId
        ? docentes.find((docente) => docente.id === docentePredeterminadoId) ??
          null
        : null,
    [docentePredeterminadoId, docentes]
  );

  const docentesDisponibles = useMemo(
    () => (docenteFijo ? [docenteFijo] : docentes),
    [docenteFijo, docentes]
  );

  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [formulario, setFormulario] = useState<FormularioCurso>(() =>
    formularioInicial(docentePredeterminadoId ?? "")
  );
  const [erroresFormulario, setErroresFormulario] =
    useState<ErroresFormulario>({});

  const [cursoEliminando, setCursoEliminando] = useState<Curso | null>(null);
  const [cursoInscripcion, setCursoInscripcion] = useState<Curso | null>(null);
  const [busquedaEstudiante, setBusquedaEstudiante] = useState("");
  const [estudiantesApi, setEstudiantesApi] = useState<EstudianteAcademico[]>([]);
  const [inscritosApi, setInscritosApi] = useState<EstudianteAcademico[]>([]);
  const [cargandoEstudiantesApi, setCargandoEstudiantesApi] = useState(false);
  const [cargandoInscritosApi, setCargandoInscritosApi] = useState(false);
  const [errorInscripcionApi, setErrorInscripcionApi] = useState("");
  const [operacionPendiente, setOperacionPendiente] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return cursosFuente.filter((curso) => {
      const contenido = normalizarTexto(
        `${curso.nombre} ${curso.codigo} ${curso.docente}`
      );
      const coincideTexto = !texto || contenido.includes(texto);
      const coincideDocente =
        filtroDocente === "Todos" || curso.docenteId === filtroDocente;

      return coincideTexto && coincideDocente;
    });
  }, [busqueda, cursosFuente, filtroDocente]);

  const inscritos = useMemo(
    () =>
      api
        ? inscritosApi
        : cursoInscripcion
          ? obtenerEstudiantesDeCurso(cursoInscripcion.id)
          : [],
    [api, inscritosApi, cursoInscripcion, obtenerEstudiantesDeCurso]
  );

  const idsInscritos = useMemo(
    () => new Set(inscritos.map((estudiante) => estudiante.id)),
    [inscritos]
  );

  const listaEstudiantes = api ? estudiantesApi : estudiantes;

  const estudiantesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busquedaEstudiante);

    return listaEstudiantes.filter((estudiante) => {
      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${estudiante.nombre} ${estudiante.email} ${estudiante.carrera}`
      ).includes(texto);
    });
  }, [busquedaEstudiante, listaEstudiantes]);

  useEffect(() => {
    if (!cursoInscripcion) {
      return;
    }

    if (!api) {
      return;
    }

    let cancelado = false;
    setCargandoEstudiantesApi(true);
    setCargandoInscritosApi(true);
    setErrorInscripcionApi("");

    Promise.all([
      api.listarEstudiantes(),
      api.listarEstudiantesDeCurso(cursoInscripcion.id),
    ])
      .then(([estudiantes, inscritos]) => {
        if (cancelado) return;
        setEstudiantesApi(estudiantes);
        setInscritosApi(inscritos);
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;
        setErrorInscripcionApi(
          fallo instanceof Error
            ? fallo.message
            : "No fue posible consultar estudiantes."
        );
      })
      .finally(() => {
        if (cancelado) return;
        setCargandoEstudiantesApi(false);
        setCargandoInscritosApi(false);
      });

    return () => {
      cancelado = true;
    };
  }, [api, cursoInscripcion]);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroDocente("Todos");
  }

  function abrirNuevo() {
    setMensaje("");
    setErrorOperacion("");
    setCursoEditando(null);
    setFormulario(formularioInicial(docentePredeterminadoId ?? ""));
    setErroresFormulario({});
    setCursoEliminando(null);
    setCursoInscripcion(null);
    setFormularioAbierto(true);
  }

  function abrirEdicion(curso: Curso) {
    setMensaje("");
    setErrorOperacion("");
    setCursoEditando(curso);
    setFormulario({
      nombre: curso.nombre,
      codigo: curso.codigo,
      descripcion: curso.descripcion,
      estado: curso.estado,
      docenteId: curso.docenteId ?? "",
    });
    setErroresFormulario({});
    setCursoEliminando(null);
    setCursoInscripcion(null);
    setFormularioAbierto(true);
  }

  function abrirInscripciones(curso: Curso) {
    setMensaje("");
    setErrorOperacion("");
    setBusquedaEstudiante("");
    setCursoEliminando(null);
    setFormularioAbierto(false);
    setCursoInscripcion(curso);
  }

  function validarFormulario(): ErroresFormulario {
    const errores: ErroresFormulario = {};
    const nombre = formulario.nombre.trim();
    const codigo = formulario.codigo.trim();

    if (nombre.length < 3) {
      errores.nombre = "El nombre debe tener al menos 3 caracteres.";
    }

    if (codigo.length < 3) {
      errores.codigo = "El código debe tener al menos 3 caracteres.";
    } else {
      const repetido = todosLosCursos.some(
        (curso) =>
          curso.id !== cursoEditando?.id &&
          normalizarTexto(curso.codigo) === normalizarTexto(codigo)
      );

      if (repetido) {
        errores.codigo = api
          ? "Ya existe un curso con este código en SyncPass."
          : "Ya existe un curso de demostración con este código.";
      }
    }

    if (formulario.descripcion.trim().length > 500) {
      errores.descripcion =
        "La descripción no puede superar los 500 caracteres.";
    }

    if (!ESTADOS_CURSO.includes(formulario.estado)) {
      errores.estado = "Selecciona un estado válido.";
    }

    return errores;
  }

  async function guardarCurso(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!puedeGestionar) {
      setErrorOperacion(
        "Tu perfil no tiene permisos para modificar cursos en esta vista."
      );
      return;
    }

    const errores = validarFormulario();

    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }

    const datos: CursoSolicitud = {
      nombre: formulario.nombre.trim(),
      codigo: formulario.codigo.trim().toUpperCase(),
      descripcion: formulario.descripcion.trim(),
      estado: formulario.estado,
      docenteId: docenteFijo ? docenteFijo.id : formulario.docenteId || null,
    };

    setGuardando(true);
    setErrorOperacion("");

    try {
      if (api) {
        const guardado = cursoEditando
          ? await api.actualizarCurso(cursoEditando.id, datos)
          : await api.crearCurso(datos);

        setMensaje(
          `Curso "${guardado.nombre}" ${
            cursoEditando ? "actualizado" : "creado"
          } en PostgreSQL mediante SyncPass API.`
        );
      } else if (cursoEditando) {
        const actualizado = actualizarCursoLocal(cursoEditando.id, datos);

        if (!actualizado) {
          throw new Error("El curso ya no existe en la demostración.");
        }

        setMensaje(
          `Curso "${actualizado.nombre}" actualizado en la memoria de esta sesión.`
        );
      } else {
        const creado = crearCursoLocal(datos);
        setMensaje(
          `Curso "${creado.nombre}" creado en la memoria de esta sesión.`
        );
      }

      setFormularioAbierto(false);
      setCursoEditando(null);
      setErroresFormulario({});
      setErrorOperacion("");
    } catch (fallo) {
      setErrorOperacion(
        fallo instanceof Error
          ? fallo.message
          : "No fue posible guardar el curso."
      );
    } finally {
      setGuardando(false);
    }
  }

  function confirmarEliminacion() {
    if (!cursoEliminando) {
      return;
    }

    if (api) {
      setCursoEliminando(null);
      setErrorOperacion(
        "La API de SyncPass no publica un endpoint para eliminar cursos."
      );
      return;
    }

    const nombre = cursoEliminando.nombre;

    if (!puedeGestionar || !eliminarCurso(cursoEliminando.id)) {
      setErrorOperacion("El curso ya no existe en la demostración.");
      setCursoEliminando(null);
      return;
    }

    setCursoEliminando(null);
    setErrorOperacion("");
    setMensaje(`Curso "${nombre}" eliminado de la memoria de esta sesión.`);
  }

  async function alternarInscripcion(estudianteId: string) {
    if (!cursoInscripcion || !puedeGestionar) {
      return;
    }

    if (api) {
      if (operacionPendiente) {
        return;
      }

      const estabaInscrito = idsInscritos.has(estudianteId);
      setOperacionPendiente(estudianteId);
      setErrorInscripcionApi("");

      try {
        if (estabaInscrito) {
          await api.retirarEstudiante(cursoInscripcion.id, estudianteId);
          setInscritosApi((actuales) =>
            actuales.filter((estudiante) => estudiante.id !== estudianteId)
          );
        } else {
          await api.inscribirEstudiante(cursoInscripcion.id, estudianteId);
          setInscritosApi((actuales) => {
            if (actuales.some((estudiante) => estudiante.id === estudianteId)) {
              return actuales;
            }
            const estudiante = estudiantesApi.find(
              (item) => item.id === estudianteId
            );
            return estudiante ? [...actuales, estudiante] : actuales;
          });
        }

        setMensaje(
          estabaInscrito
            ? "Estudiante retirado del curso en SyncPass API."
            : "Estudiante inscrito en el curso en SyncPass API."
        );
      } catch (fallo) {
        setErrorInscripcionApi(
          fallo instanceof Error
            ? fallo.message
            : "No fue posible actualizar la inscripción."
        );
      } finally {
        setOperacionPendiente(null);
      }

      return;
    }

    const estabaInscrito = idsInscritos.has(estudianteId);

    const cambio = estabaInscrito
      ? retirarEstudiante(cursoInscripcion.id, estudianteId)
      : inscribirEstudiante(cursoInscripcion.id, estudianteId);

    if (cambio) {
      setMensaje(
        estabaInscrito
          ? "Estudiante retirado del curso en la memoria de esta sesión."
          : "Estudiante inscrito en el curso en la memoria de esta sesión."
      );
    }
  }

  const cabeceraPanel = (
    <div className={ui.panelCabecera}>
      <div>
        <h2 id="gestion-cursos-titulo" className={ui.panelTitulo}>
          {titulo}
        </h2>
        <p className={ui.panelDescripcion}>{descripcion}</p>
      </div>

      <div className={ui.botonesFila}>
        <span className={ui.metaTexto}>
          {cursosFuente.length}{" "}
          {cursosFuente.length === 1 ? "curso" : "cursos"}
        </span>
        <button
          type="button"
          className={`${ui.boton} ${ui.botonPrimario}`}
          onClick={abrirNuevo}
          disabled={!puedeGestionar || Boolean(api?.error)}
        >
          + Nuevo curso
        </button>
      </div>
    </div>
  );

  if (api?.cargando) {
    return (
      <section className={ui.panel} aria-labelledby="gestion-cursos-titulo">
        {cabeceraPanel}
        <EstadoVacio
          titulo="Cargando cursos y docentes"
          descripcion="Consultando GET /api/cursos y GET /api/docentes con tu sesión de Cognito."
        />
      </section>
    );
  }

  if (api?.error) {
    return (
      <section className={ui.panel} aria-labelledby="gestion-cursos-titulo">
        {cabeceraPanel}
        <Aviso tono="peligro">
          <strong>No fue posible cargar los cursos.</strong> {api.error}
          <div className={ui.botonesFila} style={{ marginTop: 12 }}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={api.onReintentar}
            >
              Reintentar
            </button>
          </div>
        </Aviso>
      </section>
    );
  }

  return (
    <section className={ui.panel} aria-labelledby="gestion-cursos-titulo">
      {cabeceraPanel}

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {errorOperacion && !formularioAbierto && (
        <Aviso tono="peligro">{errorOperacion}</Aviso>
      )}

      <div className={styles.filtros}>
        <Buscador
          id="buscar-cursos-academico"
          etiqueta="Buscar cursos"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre, código o docente"
        />

        <div className={ui.campo}>
          <label className={ui.campoEtiqueta} htmlFor="filtro-docente-cursos">
            Docente asignado
          </label>
          <select
            id="filtro-docente-cursos"
            value={docenteFijo ? docenteFijo.id : filtroDocente}
            onChange={(evento) => setFiltroDocente(evento.target.value)}
            disabled={Boolean(docenteFijo)}
          >
            {docenteFijo ? (
              <option value={docenteFijo.id}>{docenteFijo.nombre}</option>
            ) : (
              <>
                <option value="Todos">Todos</option>
                {docentes.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>

      <div className={ui.resultadoCabecera}>
        <p className={ui.resultadoConteo} role="status">
          {filtrados.length}{" "}
          {filtrados.length === 1 ? "curso encontrado" : "cursos encontrados"} de{" "}
          {cursosFuente.length}
        </p>

        {(busqueda || filtroDocente !== "Todos") && (
          <button
            type="button"
            className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {cursosFuente.length === 0 ? (
        <EstadoVacio
          titulo="Sin cursos registrados"
          descripcion={
            api
              ? "La API de SyncPass no devolvió cursos. Crea el primero para asignarle docentes."
              : "Crea un curso de demostración para comenzar a asignar docentes e inscribir estudiantes."
          }
          accion={
            puedeGestionar ? (
              <button
                type="button"
                className={`${ui.boton} ${ui.botonPrimario}`}
                onClick={abrirNuevo}
              >
                + Nuevo curso
              </button>
            ) : undefined
          }
        />
      ) : filtrados.length === 0 ? (
        <EstadoVacio
          titulo="Sin cursos coincidentes"
          descripcion="Ajusta la búsqueda o el filtro de docente para ver otros cursos."
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
        <div className={ui.tablaWrap}>
          <table className={ui.tabla}>
            <caption className={ui.srOnly}>
              {api
                ? "Cursos de SyncPass con docente, estudiantes y estado"
                : "Cursos de demostración con docente, inscritos y estado"}
            </caption>
            <thead>
              <tr>
                <th scope="col">Código</th>
                <th scope="col">Curso</th>
                <th scope="col">Docente</th>
                <th scope="col">Estudiantes</th>
                <th scope="col">Estado</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((curso) => (
                <tr key={curso.id}>
                  <td>
                    <span className={styles.codigo}>{curso.codigo}</span>
                  </td>
                  <td>
                    <div className={ui.celdaPrincipal}>
                      <strong>{curso.nombre}</strong>
                      <span>{curso.descripcion || "Sin descripción"}</span>
                    </div>
                  </td>
                  <td>{curso.docente}</td>
                  <td>{curso.estudiantes}</td>
                  <td>
                    <Etiqueta tono={tonoEstadoCurso(curso.estado)}>
                      {curso.estado}
                    </Etiqueta>
                  </td>
                  <td>
                    <div className={ui.celdaAcciones}>
                      <button
                        type="button"
                        className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                        onClick={() => abrirInscripciones(curso)}
                      >
                        Estudiantes
                      </button>
                      <button
                        type="button"
                        className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                        onClick={() => abrirEdicion(curso)}
                        disabled={!puedeGestionar}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={`${ui.boton} ${ui.botonPeligro} ${ui.botonPequeno}`}
                        onClick={() => {
                          setMensaje("");
                          setErrorOperacion("");
                          setCursoEliminando(curso);
                        }}
                        disabled={!puedeGestionar || Boolean(api)}
                        title={
                          api
                            ? "La API de SyncPass no publica eliminación de cursos."
                            : undefined
                        }
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
      )}

      <p className={ui.metaTexto} style={{ marginTop: 14 }}>
        {api
          ? "Los cursos y docentes se consultan y guardan en PostgreSQL mediante SyncPass API. La eliminación no está disponible porque el backend no publica DELETE /api/cursos/{id}."
          : "Los cambios se mantienen solo en la memoria de esta vista de demostración; no se envían a la API ni a PostgreSQL."}
      </p>

      <Modal
        abierto={formularioAbierto}
        titulo={cursoEditando ? "Editar curso" : "Nuevo curso"}
        onCerrar={() => setFormularioAbierto(false)}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setFormularioAbierto(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-curso-academico"
              className={`${ui.boton} ${ui.botonPrimario}`}
              disabled={!puedeGestionar || guardando}
            >
              {guardando
                ? "Guardando..."
                : cursoEditando
                  ? "Guardar cambios"
                  : "Crear curso"}
            </button>
          </>
        }
      >
        <form
          id="form-curso-academico"
          onSubmit={guardarCurso}
          noValidate
        >
          {errorOperacion && <Aviso tono="peligro">{errorOperacion}</Aviso>}

          <div className={styles.formularioGrid}>
            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-academico-nombre"
              >
                Nombre del curso *
              </label>
              <input
                id="curso-academico-nombre"
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
                    ? "error-curso-academico-nombre"
                    : undefined
                }
                maxLength={120}
                required
              />
              {erroresFormulario.nombre && (
                <p
                  id="error-curso-academico-nombre"
                  className={ui.campoError}
                >
                  {erroresFormulario.nombre}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-academico-codigo"
              >
                Código *
              </label>
              <input
                id="curso-academico-codigo"
                value={formulario.codigo}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    codigo: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.codigo)}
                aria-describedby={
                  erroresFormulario.codigo
                    ? "error-curso-academico-codigo"
                    : undefined
                }
                maxLength={40}
                required
              />
              {erroresFormulario.codigo && (
                <p
                  id="error-curso-academico-codigo"
                  className={ui.campoError}
                >
                  {erroresFormulario.codigo}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-academico-estado"
              >
                Estado
              </label>
              <select
                id="curso-academico-estado"
                value={formulario.estado}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    estado: evento.target.value as EstadoCurso,
                  }))
                }
              >
                {ESTADOS_CURSO.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-academico-docente"
              >
                Docente asignado
              </label>
              <select
                id="curso-academico-docente"
                value={docenteFijo ? docenteFijo.id : formulario.docenteId}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    docenteId: evento.target.value,
                  }))
                }
                disabled={Boolean(docenteFijo)}
              >
                {!docenteFijo && (
                  <option value="">Sin docente asignado</option>
                )}
                {docentesDisponibles.map((docente) => (
                  <option key={docente.id} value={docente.id}>
                    {docente.nombre}
                  </option>
                ))}
              </select>
              {docenteFijo && (
                <p className={ui.metaTexto}>
                  El curso queda asignado a tu ficha docente. La reasignación
                  entre docentes corresponde al perfil coordinador.
                </p>
              )}
            </div>

            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="curso-academico-descripcion"
              >
                Descripción
              </label>
              <textarea
                id="curso-academico-descripcion"
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
                    ? "error-curso-academico-descripcion"
                    : undefined
                }
                maxLength={500}
                rows={3}
              />
              {erroresFormulario.descripcion && (
                <p
                  id="error-curso-academico-descripcion"
                  className={ui.campoError}
                >
                  {erroresFormulario.descripcion}
                </p>
              )}
              <p className={ui.metaTexto}>
                {formulario.descripcion.length}/500 caracteres
              </p>
            </div>
          </div>

          <p className={ui.metaTexto} style={{ marginTop: 12 }}>
            {api
              ? "El curso se guarda en PostgreSQL mediante POST/PUT /api/cursos."
              : "El curso se guarda solo en la demostración de esta sesión."}
          </p>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(cursoInscripcion)}
        titulo={`${
          api ? "Inscripción local de demostración" : "Estudiantes inscritos"
        }${cursoInscripcion ? ` · ${cursoInscripcion.nombre}` : ""}`}
        onCerrar={() => setCursoInscripcion(null)}
        amplio
        pie={
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={() => setCursoInscripcion(null)}
          >
            Cerrar
          </button>
        }
      >
        {cursoInscripcion && (
          <>
            <Aviso tono="info">
              {api
                ? "Inscripción real: los cambios se envían a SyncPass API (POST/DELETE /api/cursos/{id}/estudiantes) y actualizan PostgreSQL."
                : "Inscripción de demostración: se guarda solo en la memoria de esta vista y no está conectada a la API de SyncPass."}
            </Aviso>

            {errorInscripcionApi && (
              <Aviso tono="peligro">{errorInscripcionApi}</Aviso>
            )}

            <p className={ui.textoSuave}>
              <strong>{inscritos.length}</strong>{" "}
              {api
                ? inscritos.length === 1
                  ? "estudiante inscrito"
                  : "estudiantes inscritos"
                : inscritos.length === 1
                  ? "estudiante inscrito"
                  : "estudiantes inscritos"}{" "}
              · Docente: <strong>{cursoInscripcion.docente}</strong>
            </p>

            {api && (cargandoEstudiantesApi || cargandoInscritosApi) ? (
              <EstadoVacio
                titulo="Cargando estudiantes"
                descripcion="Consultando GET /api/estudiantes y GET /api/cursos/{id}/estudiantes con tu sesión de Cognito."
              />
            ) : (
              <>
            <Buscador
              id="buscar-estudiante-inscripcion"
              etiqueta="Buscar estudiantes para inscribir"
              valor={busquedaEstudiante}
              onChange={setBusquedaEstudiante}
              placeholder="Buscar por nombre, correo o carrera"
            />

            {estudiantesFiltrados.length === 0 ? (
              <EstadoVacio
                titulo="Sin estudiantes coincidentes"
                descripcion="Ajusta la búsqueda para encontrar otras fichas de demostración."
              />
            ) : (
              <ul className={styles.listaInscritos}>
                {estudiantesFiltrados.map((estudiante) => {
                  const estaInscrito = idsInscritos.has(estudiante.id);

                  return (
                    <li key={estudiante.id} className={styles.itemInscrito}>
                      <div>
                        <strong>{estudiante.nombre}</strong>
                        <span>
                          {estudiante.email} · {estudiante.carrera}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={`${ui.boton} ${
                          estaInscrito ? ui.botonPeligro : ui.botonSecundario
                        } ${ui.botonPequeno}`}
                        onClick={() => void alternarInscripcion(estudiante.id)}
                        disabled={
                          !puedeGestionar || operacionPendiente !== null
                        }
                      >
                        {operacionPendiente === estudiante.id
                          ? "Procesando..."
                          : estaInscrito
                            ? "Retirar"
                            : "Inscribir"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
              </>
            )}
          </>
        )}
      </Modal>

      <Modal
        abierto={!api && Boolean(cursoEliminando)}
        titulo="Eliminar curso"
        onCerrar={() => setCursoEliminando(null)}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setCursoEliminando(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPeligro}`}
              onClick={confirmarEliminacion}
              disabled={!puedeGestionar}
            >
              Eliminar de la demostración
            </button>
          </>
        }
      >
        <p className={ui.textoSuave}>
          ¿Confirmas la eliminación de{" "}
          <strong>{cursoEliminando?.nombre}</strong>? También se quitarán sus
          inscripciones y registros de asistencia de esta sesión.
        </p>
        <p className={ui.metaTexto}>
          Esta acción no afecta a PostgreSQL ni al backend.
        </p>
      </Modal>
    </section>
  );
}
