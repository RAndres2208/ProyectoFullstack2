import { useMemo, useState, type FormEvent } from "react";
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
  type EstadoCurso,
} from "../../types/academico";
import { normalizarTexto } from "../../utils/format";
import styles from "./Academico.module.css";

type GestionCursosProps = {
  cursos: Curso[];
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
  cursos,
  puedeGestionar,
  docentePredeterminadoId = null,
  titulo = "Cursos del ámbito",
  descripcion = "Crea cursos, asigna docentes e inscribe estudiantes.",
}: GestionCursosProps) {
  const {
    cursos: todosLosCursos,
    docentes,
    estudiantes,
    obtenerEstudiantesDeCurso,
    crearCurso,
    actualizarCurso,
    eliminarCurso,
    inscribirEstudiante,
    retirarEstudiante,
  } = useAcademico();

  const [busqueda, setBusqueda] = useState("");
  const [filtroDocente, setFiltroDocente] = useState("Todos");
  const [mensaje, setMensaje] = useState("");
  const [errorOperacion, setErrorOperacion] = useState("");

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

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return cursos.filter((curso) => {
      const contenido = normalizarTexto(
        `${curso.nombre} ${curso.codigo} ${curso.docente}`
      );
      const coincideTexto = !texto || contenido.includes(texto);
      const coincideDocente =
        filtroDocente === "Todos" || curso.docenteId === filtroDocente;

      return coincideTexto && coincideDocente;
    });
  }, [busqueda, cursos, filtroDocente]);

  const inscritos = useMemo(
    () =>
      cursoInscripcion
        ? obtenerEstudiantesDeCurso(cursoInscripcion.id)
        : [],
    [cursoInscripcion, obtenerEstudiantesDeCurso]
  );

  const idsInscritos = useMemo(
    () => new Set(inscritos.map((estudiante) => estudiante.id)),
    [inscritos]
  );

  const estudiantesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busquedaEstudiante);

    return estudiantes.filter((estudiante) => {
      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${estudiante.nombre} ${estudiante.email} ${estudiante.carrera}`
      ).includes(texto);
    });
  }, [busquedaEstudiante, estudiantes]);

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
        errores.codigo = "Ya existe un curso de demostración con este código.";
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

  function guardarCurso(evento: FormEvent<HTMLFormElement>) {
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

    try {
      if (cursoEditando) {
        const actualizado = actualizarCurso(cursoEditando.id, datos);

        if (!actualizado) {
          throw new Error("El curso ya no existe en la demostración.");
        }

        setMensaje(
          `Curso "${actualizado.nombre}" actualizado en la memoria de esta sesión.`
        );
      } else {
        const creado = crearCurso(datos);
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
          : "No fue posible guardar el curso de demostración."
      );
    }
  }

  function confirmarEliminacion() {
    if (!cursoEliminando) {
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

  function alternarInscripcion(estudianteId: string) {
    if (!cursoInscripcion || !puedeGestionar) {
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

  return (
    <section className={ui.panel} aria-labelledby="gestion-cursos-titulo">
      <div className={ui.panelCabecera}>
        <div>
          <h2 id="gestion-cursos-titulo" className={ui.panelTitulo}>
            {titulo}
          </h2>
          <p className={ui.panelDescripcion}>{descripcion}</p>
        </div>

        <div className={ui.botonesFila}>
          <span className={ui.metaTexto}>
            {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
          </span>
          <button
            type="button"
            className={`${ui.boton} ${ui.botonPrimario}`}
            onClick={abrirNuevo}
            disabled={!puedeGestionar}
          >
            + Nuevo curso
          </button>
        </div>
      </div>

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
          {cursos.length}
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

      {cursos.length === 0 ? (
        <EstadoVacio
          titulo="Sin cursos registrados"
          descripcion="Crea un curso de demostración para comenzar a asignar docentes e inscribir estudiantes."
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
              Cursos de demostración con docente, inscritos y estado
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
                        disabled={!puedeGestionar}
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
        Los cambios se mantienen solo en la memoria de esta sesión. No se
        envían a PostgreSQL ni a la API: el backend todavía no publica un
        contrato académico.
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
              disabled={!puedeGestionar}
            >
              {cursoEditando ? "Guardar cambios" : "Crear curso"}
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
            El curso se guarda solo en la demostración de esta sesión.
          </p>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(cursoInscripcion)}
        titulo={`Estudiantes inscritos${
          cursoInscripcion ? ` · ${cursoInscripcion.nombre}` : ""
        }`}
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
              Inscripción de demostración: se guarda solo en la memoria de esta
              sesión. La API no dispone todavía de un endpoint de inscripciones.
            </Aviso>

            <p className={ui.textoSuave}>
              <strong>{inscritos.length}</strong>{" "}
              {inscritos.length === 1 ? "estudiante inscrito" : "estudiantes inscritos"}{" "}
              · Docente: <strong>{cursoInscripcion.docente}</strong>
            </p>

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
                        onClick={() => alternarInscripcion(estudiante.id)}
                        disabled={!puedeGestionar}
                      >
                        {estaInscrito ? "Retirar" : "Inscribir"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </Modal>

      <Modal
        abierto={Boolean(cursoEliminando)}
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
