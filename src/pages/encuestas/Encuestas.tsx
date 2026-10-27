import { useMemo, useState, type FormEvent } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  BarraProgreso,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
  Paginacion,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  cargarEncuestasDemo,
  cargarRespuestasEncuestasDemo,
  guardarEncuestaDemo,
  guardarRespuestaEncuestasDemo,
  type EncuestaDemo,
  type EstadoEncuesta,
  type PreguntaEncuesta,
  type RespuestaLocalEncuesta,
  type TipoPregunta,
} from "../../data/encuestasData";
import { participantesDemo } from "../../data/participantesData";
import { proyectosData } from "../../data/proyectosData";
import { useRecargaDemo } from "../../hooks/useRecargaDemo";
import {
  crearIdDemo,
  formatearFecha,
  normalizarTexto,
  porcentaje,
} from "../../utils/format";
import styles from "./Encuestas.module.css";

type VistaEncuesta = {
  id: string;
  tipo: "detalle" | "responder" | "resultados";
};

type PreguntaBorrador = {
  id: string;
  texto: string;
  tipo: TipoPregunta;
  requerida: boolean;
  opciones: string[];
};

type BorradorEncuesta = {
  titulo: string;
  descripcion: string;
  proyectoId: string;
  fechaCierre: string;
  preguntas: PreguntaBorrador[];
};

type ErroresBorrador = {
  titulo?: string;
  descripcion?: string;
  proyectoId?: string;
  fechaCierre?: string;
};

const TAMANO_PAGINA = 5;
const ESTADOS: Array<EstadoEncuesta | "Todas"> = [
  "Todas",
  "Activa",
  "Pendiente",
  "Cerrada",
];

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function nuevaPregunta(tipo: TipoPregunta = "unica"): PreguntaBorrador {
  return {
    id: crearIdDemo("pregunta"),
    texto: "",
    tipo,
    requerida: true,
    opciones: tipo === "texto" ? [] : ["", ""],
  };
}

function borradorInicial(): BorradorEncuesta {
  return {
    titulo: "",
    descripcion: "",
    proyectoId: "",
    fechaCierre: "",
    preguntas: [nuevaPregunta()],
  };
}

function tonoEstado(estado: EstadoEncuesta) {
  if (estado === "Activa") {
    return "exito" as const;
  }

  if (estado === "Pendiente") {
    return "advertencia" as const;
  }

  return "neutral" as const;
}

function nombreTipo(tipo: TipoPregunta): string {
  if (tipo === "unica") {
    return "Opción única";
  }

  if (tipo === "multiple") {
    return "Selección múltiple";
  }

  return "Respuesta abierta";
}

function totalVotos(pregunta: PreguntaEncuesta): number {
  return pregunta.opciones.reduce(
    (total, opcion) => total + opcion.votos,
    0
  );
}

export function Encuestas() {
  const [encuestas, setEncuestas] = useState<EncuestaDemo[]>(() =>
    cargarEncuestasDemo()
  );
  const [respuestas, setRespuestas] = useState<RespuestaLocalEncuesta[]>(
    () => cargarRespuestasEncuestasDemo()
  );
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<
    EstadoEncuesta | "Todas"
  >("Todas");
  const [filtroProyecto, setFiltroProyecto] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [vista, setVista] = useState<VistaEncuesta | null>(null);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [borrador, setBorrador] =
    useState<BorradorEncuesta>(borradorInicial);
  const [erroresBorrador, setErroresBorrador] =
    useState<ErroresBorrador>({});
  const [erroresPreguntas, setErroresPreguntas] = useState<
    Record<string, string>
  >({});
  const [respuestasFormulario, setRespuestasFormulario] = useState<
    Record<string, string | string[]>
  >({});
  const [erroresRespuestas, setErroresRespuestas] = useState<
    Record<string, string>
  >({});

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const { cargando, recargar } = useRecargaDemo();

  const respuestasPorEncuesta = useMemo(() => {
    const mapa = new Map<string, number>();

    respuestas.forEach((respuesta) => {
      mapa.set(
        respuesta.encuestaId,
        (mapa.get(respuesta.encuestaId) ?? 0) + 1
      );
    });

    return mapa;
  }, [respuestas]);

  const resumen = useMemo(
    () => ({
      total: encuestas.length,
      activas: encuestas.filter(
        (encuesta) => encuesta.estado === "Activa"
      ).length,
      pendientes: encuestas.filter(
        (encuesta) => encuesta.estado === "Pendiente"
      ).length,
      cerradas: encuestas.filter(
        (encuesta) => encuesta.estado === "Cerrada"
      ).length,
      locales: respuestas.length,
    }),
    [encuestas, respuestas]
  );

  const filtradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return [...encuestas]
      .filter((encuesta) => {
        const contenido = normalizarTexto(
          [
            encuesta.id,
            encuesta.titulo,
            encuesta.descripcion,
            encuesta.proyectoNombre,
          ].join(" ")
        );

        const coincideBusqueda = !texto || contenido.includes(texto);
        const coincideEstado =
          filtroEstado === "Todas" ||
          encuesta.estado === filtroEstado;
        const coincideProyecto =
          filtroProyecto === "Todos" ||
          encuesta.proyectoId === filtroProyecto;

        return (
          coincideBusqueda && coincideEstado && coincideProyecto
        );
      })
      .sort((a, b) =>
        b.fechaCreacion.localeCompare(a.fechaCreacion)
      );
  }, [encuestas, busqueda, filtroEstado, filtroProyecto]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / TAMANO_PAGINA)
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  const encuestaVista = encuestas.find(
    (encuesta) => encuesta.id === vista?.id
  );

  const respuestaVista = respuestas.find(
    (respuesta) => respuesta.encuestaId === vista?.id
  );

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todas");
    setFiltroProyecto("Todos");
    setPagina(1);
  }

  function abrirVista(
    encuesta: EncuestaDemo,
    tipo: VistaEncuesta["tipo"]
  ) {
    setError("");

    if (tipo === "responder") {
      const inicial: Record<string, string | string[]> = {};

      encuesta.preguntas.forEach((pregunta) => {
        inicial[pregunta.id] =
          pregunta.tipo === "multiple" ? [] : "";
      });

      setRespuestasFormulario(inicial);
      setErroresRespuestas({});
    }

    setVista({ id: encuesta.id, tipo });
  }

  function abrirCreacion() {
    setBorrador(borradorInicial());
    setErroresBorrador({});
    setErroresPreguntas({});
    setError("");
    setCrearAbierto(true);
  }

  function actualizarPregunta(
    id: string,
    cambios: Partial<PreguntaBorrador>
  ) {
    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.map((pregunta) =>
        pregunta.id === id ? { ...pregunta, ...cambios } : pregunta
      ),
    }));
  }

  function cambiarTipoPregunta(id: string, tipo: TipoPregunta) {
    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.map((pregunta) =>
        pregunta.id === id
          ? {
              ...pregunta,
              tipo,
              opciones:
                tipo === "texto"
                  ? []
                  : pregunta.opciones.length >= 2
                    ? pregunta.opciones
                    : ["", ""],
            }
          : pregunta
      ),
    }));
  }

  function agregarPregunta() {
    setBorrador((actual) => ({
      ...actual,
      preguntas: [...actual.preguntas, nuevaPregunta()],
    }));
  }

  function eliminarPregunta(id: string) {
    setBorrador((actual) => ({
      ...actual,
      preguntas:
        actual.preguntas.length === 1
          ? actual.preguntas
          : actual.preguntas.filter((pregunta) => pregunta.id !== id),
    }));
  }

  function agregarOpcion(id: string) {
    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.map((pregunta) =>
        pregunta.id === id
          ? { ...pregunta, opciones: [...pregunta.opciones, ""] }
          : pregunta
      ),
    }));
  }

  function actualizarOpcion(
    preguntaId: string,
    indice: number,
    valor: string
  ) {
    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.map((pregunta) =>
        pregunta.id === preguntaId
          ? {
              ...pregunta,
              opciones: pregunta.opciones.map((opcion, posicion) =>
                posicion === indice ? valor : opcion
              ),
            }
          : pregunta
      ),
    }));
  }

  function eliminarOpcion(preguntaId: string, indice: number) {
    setBorrador((actual) => ({
      ...actual,
      preguntas: actual.preguntas.map((pregunta) =>
        pregunta.id === preguntaId
          ? {
              ...pregunta,
              opciones:
                pregunta.opciones.length <= 2
                  ? pregunta.opciones
                  : pregunta.opciones.filter(
                      (_, posicion) => posicion !== indice
                    ),
            }
          : pregunta
      ),
    }));
  }

  function validarBorrador(): {
    errores: ErroresBorrador;
    erroresPreguntas: Record<string, string>;
  } {
    const errores: ErroresBorrador = {};
    const erroresPorPregunta: Record<string, string> = {};

    if (borrador.titulo.trim().length < 5) {
      errores.titulo =
        "Ingresa un título de al menos 5 caracteres.";
    }

    if (borrador.descripcion.trim().length < 10) {
      errores.descripcion =
        "Describe el objetivo de la encuesta (mínimo 10 caracteres).";
    }

    if (!borrador.proyectoId) {
      errores.proyectoId = "Selecciona un proyecto.";
    }

    if (!borrador.fechaCierre) {
      errores.fechaCierre = "Selecciona una fecha de cierre.";
    } else if (borrador.fechaCierre < hoyIso()) {
      errores.fechaCierre =
        "La fecha de cierre no puede ser anterior a hoy.";
    }

    borrador.preguntas.forEach((pregunta) => {
      if (pregunta.texto.trim().length < 5) {
        erroresPorPregunta[pregunta.id] =
          "Escribe una pregunta de al menos 5 caracteres.";
        return;
      }

      if (pregunta.tipo !== "texto") {
        const opciones = pregunta.opciones
          .map((opcion) => opcion.trim())
          .filter(Boolean);

        if (opciones.length < 2) {
          erroresPorPregunta[pregunta.id] =
            "Agrega al menos dos opciones con texto.";
          return;
        }

        const normalizadas = opciones.map(normalizarTexto);
        const unicas = new Set(normalizadas);

        if (unicas.size !== normalizadas.length) {
          erroresPorPregunta[pregunta.id] =
            "Las opciones de una pregunta no pueden repetirse.";
        }
      }
    });

    return { errores, erroresPreguntas: erroresPorPregunta };
  }

  function guardarBorrador(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");

    const validacion = validarBorrador();

    setErroresBorrador(validacion.errores);
    setErroresPreguntas(validacion.erroresPreguntas);

    if (
      Object.keys(validacion.errores).length > 0 ||
      Object.keys(validacion.erroresPreguntas).length > 0
    ) {
      return;
    }

    const proyecto = proyectosData.find(
      (item) => item.id === borrador.proyectoId
    );

    if (!proyecto) {
      setErroresBorrador({
        proyectoId: "El proyecto seleccionado no es válido.",
      });
      return;
    }

    const nuevaEncuesta: EncuestaDemo = {
      id: crearIdDemo("ENC"),
      titulo: borrador.titulo.trim(),
      descripcion: borrador.descripcion.trim(),
      proyectoId: proyecto.id,
      proyectoNombre: proyecto.nombre,
      estado: "Pendiente",
      fechaCreacion: hoyIso(),
      fechaCierre: borrador.fechaCierre,
      habilitados: participantesDemo.filter(
        (participante) => participante.proyectoId === proyecto.id
      ).length,
      respondidas: 0,
      preguntas: borrador.preguntas.map((pregunta, indice) => ({
        id: `p${indice + 1}`,
        texto: pregunta.texto.trim(),
        tipo: pregunta.tipo,
        requerida: pregunta.requerida,
        opciones:
          pregunta.tipo === "texto"
            ? []
            : pregunta.opciones
                .map((opcion) => opcion.trim())
                .filter(Boolean)
                .map((opcion, posicion) => ({
                  id: `o${posicion + 1}`,
                  texto: opcion,
                  votos: 0,
                })),
        respuestasTexto: [],
      })),
      demostracion: true,
    };

    const guardado = guardarEncuestaDemo(nuevaEncuesta);

    if (!guardado) {
      setError(
        "No fue posible guardar la encuesta en este navegador. El formulario no se cerró para que puedas reintentar."
      );
      return;
    }

    setEncuestas(cargarEncuestasDemo());
    setCrearAbierto(false);
    setBorrador(borradorInicial());
    setPagina(1);
    setMensaje(
      "Encuesta creada en este navegador como borrador de demostración. No se envió al backend."
    );
  }

  function validarRespuestas(
    encuesta: EncuestaDemo
  ): Record<string, string> {
    const errores: Record<string, string> = {};

    encuesta.preguntas.forEach((pregunta) => {
      if (!pregunta.requerida) {
        return;
      }

      const valor = respuestasFormulario[pregunta.id];

      if (
        pregunta.tipo === "multiple"
          ? !Array.isArray(valor) || valor.length === 0
          : !valor || (typeof valor === "string" && !valor.trim())
      ) {
        errores[pregunta.id] = "Esta pregunta es obligatoria.";
      }
    });

    return errores;
  }

  function guardarRespuesta(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!encuestaVista) {
      return;
    }

    setError("");

    const errores = validarRespuestas(encuestaVista);
    setErroresRespuestas(errores);

    if (Object.keys(errores).length > 0) {
      return;
    }

    const respuesta: RespuestaLocalEncuesta = {
      encuestaId: encuestaVista.id,
      respuestas: respuestasFormulario,
      fecha: new Date().toISOString(),
    };

    const guardado = guardarRespuestaEncuestasDemo(respuesta);

    if (!guardado) {
      setError(
        "No fue posible guardar la respuesta en este navegador. No se envió información al servidor."
      );
      return;
    }

    setRespuestas(cargarRespuestasEncuestasDemo());
    setVista(null);
    setMensaje(
      "Respuesta guardada solo en este navegador. No se envió al backend ni modifica los resultados de demostración."
    );
  }

  function respuestaTexto(
    pregunta: PreguntaEncuesta,
    valor: string | string[]
  ): string {
    if (Array.isArray(valor)) {
      return valor
        .map(
          (id) =>
            pregunta.opciones.find((opcion) => opcion.id === id)
              ?.texto ?? id
        )
        .join(", ");
    }

    if (pregunta.tipo === "unica") {
      return (
        pregunta.opciones.find((opcion) => opcion.id === valor)
          ?.texto ?? valor
      );
    }

    return valor;
  }

  const tituloVista =
    vista?.tipo === "responder"
      ? "Responder encuesta"
      : vista?.tipo === "resultados"
        ? "Resultados de la encuesta"
        : "Vista previa de la encuesta";

  return (
    <PageLayout
      titulo="Encuestas"
      descripcion="Creación, participación y resultados de encuestas comunitarias."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <AvisoDemo>
        <strong>Datos y acciones de demostración.</strong> Las encuestas,
        respuestas y borradores se guardan solo en este navegador. No se
        consultan ni modifican datos del backend.
      </AvisoDemo>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de encuestas"
      >
        <TarjetaResumen
          etiqueta="Total"
          valor={resumen.total}
          detalle="Encuestas disponibles en la demostración"
          icono="▤"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Activas"
          valor={resumen.activas}
          detalle="Aceptan respuestas en la demostración"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Pendientes"
          valor={resumen.pendientes}
          detalle="Borradores o publicaciones futuras"
          icono="◷"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Cerradas"
          valor={resumen.cerradas}
          detalle={`${resumen.locales} respuestas locales guardadas`}
          icono="◌"
          tono="neutral"
        />
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {error && <Aviso tono="peligro">{error}</Aviso>}

      <section className={ui.panel} aria-labelledby="encuestas-listado">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="encuestas-listado" className={ui.panelTitulo}>
              Encuestas del proyecto
            </h2>
            <p className={ui.panelDescripcion}>
              Consulta el estado, abre una vista previa o responde una
              encuesta activa.
            </p>
          </div>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={() =>
                recargar(() =>
                  setMensaje(
                    "Listado actualizado con los datos de demostración."
                  )
                )
              }
              disabled={cargando}
            >
              ↻ Actualizar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={abrirCreacion}
            >
              + Crear encuesta
            </button>
          </div>
        </div>

        <div className={styles.filtros}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-encuesta"
              etiqueta="Buscar encuesta"
              valor={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPagina(1);
              }}
              placeholder="Buscar por título, proyecto o identificador"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="filtro-encuesta-estado">
              Estado
            </label>
            <select
              id="filtro-encuesta-estado"
              value={filtroEstado}
              onChange={(evento) => {
                setFiltroEstado(
                  evento.target.value as EstadoEncuesta | "Todas"
                );
                setPagina(1);
              }}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {estado === "Todas" ? "Todos los estados" : estado}
                </option>
              ))}
            </select>
          </div>

          <div className={ui.campo}>
            <label
              className={ui.campoEtiqueta}
              htmlFor="filtro-encuesta-proyecto"
            >
              Proyecto
            </label>
            <select
              id="filtro-encuesta-proyecto"
              value={filtroProyecto}
              onChange={(evento) => {
                setFiltroProyecto(evento.target.value);
                setPagina(1);
              }}
            >
              <option value="Todos">Todos los proyectos</option>
              {proyectosData.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={ui.resultadoCabecera}>
          <p className={ui.resultadoConteo} role="status">
            {filtradas.length}{" "}
            {filtradas.length === 1
              ? "encuesta encontrada"
              : "encuestas encontradas"}
          </p>

          {(busqueda ||
            filtroEstado !== "Todas" ||
            filtroProyecto !== "Todos") && (
            <button
              type="button"
              className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {cargando ? (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Actualizando las encuestas de demostración...
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="No hay encuestas con estos filtros"
            descripcion="Cambia el estado o el proyecto seleccionado, o crea una nueva encuesta de demostración."
            accion={
              <div className={ui.botonesFila}>
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonSecundario}`}
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonPrimario}`}
                  onClick={abrirCreacion}
                >
                  Crear encuesta
                </button>
              </div>
            }
          />
        ) : (
          <>
            <div className={ui.tablaWrap}>
              <table className={ui.tabla}>
                <caption className={ui.srOnly}>
                  Encuestas de demostración con estado, proyecto y
                  participación
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Encuesta</th>
                    <th scope="col">Proyecto</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Cierre</th>
                    <th scope="col">Respuestas</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((encuesta) => {
                    const locales =
                      respuestasPorEncuesta.get(encuesta.id) ?? 0;

                    return (
                      <tr key={encuesta.id}>
                        <td data-label="Encuesta">
                          <div className={ui.celdaPrincipal}>
                            <strong>{encuesta.titulo}</strong>
                            <span>
                              {encuesta.id} ·{" "}
                              {encuesta.preguntas.length} preguntas
                            </span>
                          </div>
                        </td>
                        <td data-label="Proyecto">
                          {encuesta.proyectoNombre}
                        </td>
                        <td data-label="Estado">
                          <Etiqueta tono={tonoEstado(encuesta.estado)}>
                            {encuesta.estado}
                          </Etiqueta>
                        </td>
                        <td data-label="Cierre">
                          {formatearFecha(encuesta.fechaCierre)}
                        </td>
                        <td data-label="Respuestas">
                          {encuesta.respondidas}/
                          {encuesta.habilitados}
                          {locales > 0 && (
                            <div className={styles.respuestaLocal}>
                              +{locales} local
                              {locales === 1 ? "" : "es"}
                            </div>
                          )}
                        </td>
                        <td data-label="Acciones">
                          <div className={ui.celdaAcciones}>
                            <button
                              type="button"
                              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                              onClick={() => abrirVista(encuesta, "detalle")}
                            >
                              Vista previa
                            </button>
                            <button
                              type="button"
                              className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
                              onClick={() =>
                                abrirVista(encuesta, "resultados")
                              }
                            >
                              Resultados
                            </button>
                            {encuesta.estado === "Activa" && (
                              <button
                                type="button"
                                className={`${ui.boton} ${ui.botonPrimario} ${ui.botonPequeno}`}
                                onClick={() =>
                                  abrirVista(encuesta, "responder")
                                }
                                disabled={locales > 0}
                                title={
                                  locales > 0
                                    ? "Ya guardaste una respuesta local para esta encuesta"
                                    : undefined
                                }
                              >
                                {locales > 0 ? "Respondida" : "Responder"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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
        Las preguntas y resultados pertenecen a la demostración. Las
        respuestas locales no se suman a los totales del backend ni a los
        resultados base.
      </p>

      <Modal
        abierto={Boolean(encuestaVista && vista?.tipo === "detalle")}
        titulo={tituloVista}
        onCerrar={() => setVista(null)}
        amplio
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setVista(null)}
            >
              Cerrar
            </button>
            {encuestaVista?.estado === "Activa" && (
              <button
                type="button"
                className={`${ui.boton} ${ui.botonPrimario}`}
                onClick={() =>
                  encuestaVista && abrirVista(encuestaVista, "responder")
                }
                disabled={Boolean(respuestaVista)}
              >
                {respuestaVista ? "Respuesta local guardada" : "Responder"}
              </button>
            )}
          </>
        }
      >
        {encuestaVista && (
          <div className={styles.detalleEncuesta}>
            <div className={styles.metaEncuesta}>
              <div>
                <span className={ui.metaTexto}>Proyecto</span>
                <strong>{encuestaVista.proyectoNombre}</strong>
              </div>
              <div>
                <span className={ui.metaTexto}>Estado</span>
                <Etiqueta tono={tonoEstado(encuestaVista.estado)}>
                  {encuestaVista.estado}
                </Etiqueta>
              </div>
              <div>
                <span className={ui.metaTexto}>Creada</span>
                <strong>{formatearFecha(encuestaVista.fechaCreacion)}</strong>
              </div>
              <div>
                <span className={ui.metaTexto}>Cierra</span>
                <strong>{formatearFecha(encuestaVista.fechaCierre)}</strong>
              </div>
            </div>

            <p className={styles.descripcionEncuesta}>
              {encuestaVista.descripcion}
            </p>

            <p className={ui.metaTexto}>
              {encuestaVista.respondidas} de {encuestaVista.habilitados}{" "}
              personas han respondido en los datos de demostración.
            </p>

            <ol className={styles.preguntasLista}>
              {encuestaVista.preguntas.map((pregunta, indice) => (
                <li key={pregunta.id}>
                  <div className={styles.preguntaCabecera}>
                    <strong>
                      {indice + 1}. {pregunta.texto}
                    </strong>
                    <Etiqueta tono="info">
                      {nombreTipo(pregunta.tipo)}
                    </Etiqueta>
                  </div>

                  <p className={ui.metaTexto}>
                    {pregunta.requerida
                      ? "Respuesta obligatoria"
                      : "Respuesta opcional"}
                  </p>

                  {pregunta.tipo === "texto" ? (
                    <p className={styles.respuestaAbierta}>
                      Respuesta abierta. Las respuestas de ejemplo no se
                      muestran en la vista previa.
                    </p>
                  ) : (
                    <ul className={styles.opcionesVista}>
                      {pregunta.opciones.map((opcion) => (
                        <li key={opcion.id}>{opcion.texto}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </Modal>

      <Modal
        abierto={Boolean(encuestaVista && vista?.tipo === "resultados")}
        titulo={tituloVista}
        onCerrar={() => setVista(null)}
        amplio
        pie={
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={() => setVista(null)}
          >
            Cerrar
          </button>
        }
      >
        {encuestaVista && (
          <div className={styles.resultados}>
            <Aviso tono="info">
              Resultados base de demostración. No incluyen las respuestas
              guardadas localmente en este navegador.
            </Aviso>

            <div className={styles.metaEncuesta}>
              <div>
                <span className={ui.metaTexto}>Participación</span>
                <strong>
                  {encuestaVista.respondidas}/
                  {encuestaVista.habilitados} (
                  {porcentaje(
                    encuestaVista.respondidas,
                    encuestaVista.habilitados
                  )}
                  %)
                </strong>
              </div>
              <div>
                <span className={ui.metaTexto}>Proyecto</span>
                <strong>{encuestaVista.proyectoNombre}</strong>
              </div>
            </div>

            {encuestaVista.preguntas.map((pregunta) => {
              const votos = totalVotos(pregunta);

              return (
                <section
                  key={pregunta.id}
                  className={styles.resultadoPregunta}
                  aria-labelledby={`resultado-${pregunta.id}`}
                >
                  <h3 id={`resultado-${pregunta.id}`}>
                    {pregunta.texto}
                  </h3>

                  {pregunta.tipo === "texto" ? (
                    pregunta.respuestasTexto.length > 0 ? (
                      <ul className={styles.comentarios}>
                        {pregunta.respuestasTexto.map(
                          (respuesta, indice) => (
                            <li key={`${pregunta.id}-${indice}`}>
                              “{respuesta}”
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className={ui.metaTexto}>
                        No hay comentarios de ejemplo para esta pregunta.
                      </p>
                    )
                  ) : votos === 0 ? (
                    <p className={ui.metaTexto}>
                      Todavía no hay respuestas de demostración.
                    </p>
                  ) : (
                    <div className={styles.barrasResultado}>
                      {pregunta.opciones.map((opcion) => (
                        <BarraProgreso
                          key={opcion.id}
                          etiqueta={`${opcion.texto} · ${opcion.votos} ${
                            opcion.votos === 1 ? "selección" : "selecciones"
                          }`}
                          valor={porcentaje(opcion.votos, votos)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}

            {respuestaVista && (
              <section
                className={styles.respuestaGuardada}
                aria-labelledby="respuesta-local"
              >
                <h3 id="respuesta-local">Respuesta guardada en este navegador</h3>
                <p className={ui.metaTexto}>
                  Guardada el {formatearFecha(respuestaVista.fecha, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  . No se envió al backend.
                </p>

                <dl className={styles.respuestaDetalle}>
                  {encuestaVista.preguntas.map((pregunta) => {
                    const valor = respuestaVista.respuestas[pregunta.id];

                    if (valor === undefined) {
                      return null;
                    }

                    return (
                      <div key={pregunta.id}>
                        <dt>{pregunta.texto}</dt>
                        <dd>
                          {Array.isArray(valor) && valor.length === 0
                            ? "Sin respuesta"
                            : respuestaTexto(
                                pregunta,
                                valor
                              ) || "Sin respuesta"}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </section>
            )}
          </div>
        )}
      </Modal>

      <Modal
        abierto={Boolean(encuestaVista && vista?.tipo === "responder")}
        titulo={tituloVista}
        onCerrar={() => setVista(null)}
        amplio
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setVista(null)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-responder-encuesta"
              className={`${ui.boton} ${ui.botonPrimario}`}
            >
              Guardar respuesta local
            </button>
          </>
        }
      >
        {encuestaVista && (
          <form
            id="form-responder-encuesta"
            className={styles.formulario}
            onSubmit={guardarRespuesta}
            noValidate
          >
            <Aviso tono="advertencia">
              Esta respuesta se guarda solo en este navegador. No se
              envía a Spring Boot ni modifica los resultados base de la
              encuesta.
            </Aviso>

            {encuestaVista.preguntas.map((pregunta, indice) => {
              const valor = respuestasFormulario[pregunta.id];
              const error = erroresRespuestas[pregunta.id];

              return (
                <fieldset
                  key={pregunta.id}
                  className={styles.preguntaFormulario}
                  aria-describedby={
                    error ? `error-${pregunta.id}` : undefined
                  }
                >
                  <legend>
                    {indice + 1}. {pregunta.texto}
                    {pregunta.requerida && (
                      <span className={styles.obligatoria}> *</span>
                    )}
                  </legend>

                  {pregunta.tipo === "texto" ? (
                    <textarea
                      value={typeof valor === "string" ? valor : ""}
                      onChange={(evento) =>
                        setRespuestasFormulario((actual) => ({
                          ...actual,
                          [pregunta.id]: evento.target.value,
                        }))
                      }
                      aria-invalid={Boolean(error)}
                      maxLength={500}
                      placeholder="Escribe tu respuesta"
                    />
                  ) : (
                    <div className={styles.opcionesFormulario}>
                      {pregunta.opciones.map((opcion) => (
                        <label
                          key={opcion.id}
                          className={styles.opcionFormulario}
                        >
                          <input
                            type={
                              pregunta.tipo === "multiple"
                                ? "checkbox"
                                : "radio"
                            }
                            name={
                              pregunta.tipo === "multiple"
                                ? `${pregunta.id}-${opcion.id}`
                                : pregunta.id
                            }
                            checked={
                              pregunta.tipo === "multiple"
                                ? Array.isArray(valor) &&
                                  valor.includes(opcion.id)
                                : valor === opcion.id
                            }
                            onChange={(evento) => {
                              if (pregunta.tipo === "multiple") {
                                setRespuestasFormulario((actual) => {
                                  const actuales = Array.isArray(
                                    actual[pregunta.id]
                                  )
                                    ? (actual[pregunta.id] as string[])
                                    : [];

                                  return {
                                    ...actual,
                                    [pregunta.id]: evento.target.checked
                                      ? [...actuales, opcion.id]
                                      : actuales.filter(
                                          (id) => id !== opcion.id
                                        ),
                                  };
                                });
                              } else {
                                setRespuestasFormulario((actual) => ({
                                  ...actual,
                                  [pregunta.id]: opcion.id,
                                }));
                              }
                            }}
                          />
                          <span>{opcion.texto}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {error && (
                    <p
                      id={`error-${pregunta.id}`}
                      className={ui.campoError}
                    >
                      {error}
                    </p>
                  )}
                </fieldset>
              );
            })}
          </form>
        )}
      </Modal>

      <Modal
        abierto={crearAbierto}
        titulo="Crear encuesta de demostración"
        onCerrar={() => setCrearAbierto(false)}
        amplio
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setCrearAbierto(false)}
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-crear-encuesta"
              className={`${ui.boton} ${ui.botonPrimario}`}
            >
              Guardar encuesta local
            </button>
          </>
        }
      >
        <form
          id="form-crear-encuesta"
          className={styles.formulario}
          onSubmit={guardarBorrador}
          noValidate
        >
          <Aviso tono="info">
            La encuesta se guardará como borrador de demostración en este
            navegador con estado “Pendiente”. No se publica en el backend.
          </Aviso>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="encuesta-titulo">
              Título *
            </label>
            <input
              id="encuesta-titulo"
              value={borrador.titulo}
              onChange={(evento) =>
                setBorrador((actual) => ({
                  ...actual,
                  titulo: evento.target.value,
                }))
              }
              aria-invalid={Boolean(erroresBorrador.titulo)}
              aria-describedby={
                erroresBorrador.titulo
                  ? "error-encuesta-titulo"
                  : undefined
              }
              maxLength={120}
            />
            {erroresBorrador.titulo && (
              <p id="error-encuesta-titulo" className={ui.campoError}>
                {erroresBorrador.titulo}
              </p>
            )}
          </div>

          <div className={ui.campo}>
            <label
              className={ui.campoEtiqueta}
              htmlFor="encuesta-descripcion"
            >
              Descripción *
            </label>
            <textarea
              id="encuesta-descripcion"
              value={borrador.descripcion}
              onChange={(evento) =>
                setBorrador((actual) => ({
                  ...actual,
                  descripcion: evento.target.value,
                }))
              }
              aria-invalid={Boolean(erroresBorrador.descripcion)}
              aria-describedby={
                erroresBorrador.descripcion
                  ? "error-encuesta-descripcion"
                  : undefined
              }
              maxLength={500}
            />
            {erroresBorrador.descripcion && (
              <p
                id="error-encuesta-descripcion"
                className={ui.campoError}
              >
                {erroresBorrador.descripcion}
              </p>
            )}
          </div>

          <div className={styles.formularioGrid}>
            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="encuesta-proyecto"
              >
                Proyecto *
              </label>
              <select
                id="encuesta-proyecto"
                value={borrador.proyectoId}
                onChange={(evento) =>
                  setBorrador((actual) => ({
                    ...actual,
                    proyectoId: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresBorrador.proyectoId)}
                aria-describedby={
                  erroresBorrador.proyectoId
                    ? "error-encuesta-proyecto"
                    : undefined
                }
              >
                <option value="">Selecciona un proyecto</option>
                {proyectosData.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
              {erroresBorrador.proyectoId && (
                <p
                  id="error-encuesta-proyecto"
                  className={ui.campoError}
                >
                  {erroresBorrador.proyectoId}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="encuesta-cierre"
              >
                Fecha de cierre *
              </label>
              <input
                id="encuesta-cierre"
                type="date"
                value={borrador.fechaCierre}
                onChange={(evento) =>
                  setBorrador((actual) => ({
                    ...actual,
                    fechaCierre: evento.target.value,
                  }))
                }
                min={hoyIso()}
                aria-invalid={Boolean(erroresBorrador.fechaCierre)}
                aria-describedby={
                  erroresBorrador.fechaCierre
                    ? "error-encuesta-cierre"
                    : undefined
                }
              />
              {erroresBorrador.fechaCierre && (
                <p id="error-encuesta-cierre" className={ui.campoError}>
                  {erroresBorrador.fechaCierre}
                </p>
              )}
            </div>
          </div>

          <div className={styles.editorPreguntas}>
            <div className={styles.editorCabecera}>
              <div>
                <h3>Preguntas *</h3>
                <p className={ui.metaTexto}>
                  Agrega al menos una pregunta. Las de opción necesitan
                  dos alternativas como mínimo.
                </p>
              </div>

              <button
                type="button"
                className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                onClick={agregarPregunta}
              >
                + Agregar pregunta
              </button>
            </div>

            {borrador.preguntas.map((pregunta, indice) => (
              <fieldset
                key={pregunta.id}
                className={styles.preguntaEditor}
              >
                <legend>Pregunta {indice + 1}</legend>

                <div className={styles.formularioGrid}>
                  <div className={`${ui.campo} ${styles.campoPregunta}`}>
                    <label
                      className={ui.campoEtiqueta}
                      htmlFor={`pregunta-${pregunta.id}`}
                    >
                      Texto de la pregunta *
                    </label>
                    <input
                      id={`pregunta-${pregunta.id}`}
                      value={pregunta.texto}
                      onChange={(evento) =>
                        actualizarPregunta(pregunta.id, {
                          texto: evento.target.value,
                        })
                      }
                      aria-invalid={Boolean(
                        erroresPreguntas[pregunta.id]
                      )}
                      maxLength={180}
                    />
                  </div>

                  <div className={ui.campo}>
                    <label
                      className={ui.campoEtiqueta}
                      htmlFor={`tipo-${pregunta.id}`}
                    >
                      Tipo
                    </label>
                    <select
                      id={`tipo-${pregunta.id}`}
                      value={pregunta.tipo}
                      onChange={(evento) =>
                        cambiarTipoPregunta(
                          pregunta.id,
                          evento.target.value as TipoPregunta
                        )
                      }
                    >
                      <option value="unica">Opción única</option>
                      <option value="multiple">Selección múltiple</option>
                      <option value="texto">Respuesta abierta</option>
                    </select>
                  </div>
                </div>

                <div className={styles.preguntaOpcionesFila}>
                  <label className={styles.checkObligatoria}>
                    <input
                      type="checkbox"
                      checked={pregunta.requerida}
                      onChange={(evento) =>
                        actualizarPregunta(pregunta.id, {
                          requerida: evento.target.checked,
                        })
                      }
                    />
                    <span>Respuesta obligatoria</span>
                  </label>

                  {borrador.preguntas.length > 1 && (
                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonPeligro} ${ui.botonPequeno}`}
                      onClick={() => eliminarPregunta(pregunta.id)}
                    >
                      Eliminar pregunta
                    </button>
                  )}
                </div>

                {pregunta.tipo !== "texto" && (
                  <div className={styles.opcionesEditor}>
                    <span className={ui.campoEtiqueta}>Opciones *</span>

                    {pregunta.opciones.map((opcion, posicion) => (
                      <div
                        className={styles.opcionEditorFila}
                        key={`${pregunta.id}-${posicion}`}
                      >
                        <input
                          value={opcion}
                          onChange={(evento) =>
                            actualizarOpcion(
                              pregunta.id,
                              posicion,
                              evento.target.value
                            )
                          }
                          placeholder={`Opción ${posicion + 1}`}
                          aria-label={`Opción ${posicion + 1} de la pregunta ${
                            indice + 1
                          }`}
                          maxLength={120}
                        />
                        <button
                          type="button"
                          className={`${ui.boton} ${ui.botonIcono}`}
                          onClick={() =>
                            eliminarOpcion(pregunta.id, posicion)
                          }
                          disabled={pregunta.opciones.length <= 2}
                          aria-label={`Eliminar opción ${posicion + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
                      onClick={() => agregarOpcion(pregunta.id)}
                    >
                      + Agregar opción
                    </button>
                  </div>
                )}

                {erroresPreguntas[pregunta.id] && (
                  <p className={ui.campoError} role="alert">
                    {erroresPreguntas[pregunta.id]}
                  </p>
                )}
              </fieldset>
            ))}
          </div>
        </form>
      </Modal>
    </PageLayout>
  );
}
