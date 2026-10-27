import { useMemo, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  BarraProgreso,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Paginacion,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  eventosQuorumDemo,
  type EstadoQuorumParticipante,
  type EventoQuorum,
} from "../../data/quorumData";
import {
  participantesDemo,
  type Participante,
} from "../../data/participantesData";
import { useRecargaDemo } from "../../hooks/useRecargaDemo";
import {
  formatearFecha,
  normalizarTexto,
  porcentaje,
} from "../../utils/format";
import styles from "./Quorum.module.css";

type FilaQuorum = {
  participante: Participante;
  estado: EstadoQuorumParticipante;
  hora?: string;
};

const TAMANO_PAGINA = 8;

function tonoAsistencia(estado: EstadoQuorumParticipante) {
  if (estado === "Asistió") {
    return "exito" as const;
  }

  if (estado === "Justificado") {
    return "advertencia" as const;
  }

  return "peligro" as const;
}

export function Quorum() {
  const eventoInicial =
    eventosQuorumDemo[eventosQuorumDemo.length - 1];

  const [eventoId, setEventoId] = useState(eventoInicial.id);
  const [umbral, setUmbral] = useState(eventoInicial.umbralDemo);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [pagina, setPagina] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const { cargando, recargar } = useRecargaDemo();

  const eventoCargado: EventoQuorum =
    eventosQuorumDemo.find((evento) => evento.id === eventoId) ??
    eventosQuorumDemo[0];

  const filas = useMemo<FilaQuorum[]>(() => {
    return eventoCargado.registros.flatMap((registro) => {
      const participante = participantesDemo.find(
        (item) => item.id === registro.participanteId
      );

      return participante
        ? [
            {
              participante,
              estado: registro.estado,
              hora: registro.hora,
            },
          ]
        : [];
    });
  }, [eventoCargado]);

  const resumen = useMemo(() => {
    const asistentes = filas.filter(
      (fila) => fila.estado === "Asistió"
    ).length;
    const ausentes = filas.filter(
      (fila) => fila.estado === "Ausente"
    ).length;
    const justificados = filas.filter(
      (fila) => fila.estado === "Justificado"
    ).length;
    const habilitados = filas.length;

    return {
      habilitados,
      asistentes,
      ausentes,
      justificados,
      participacion: porcentaje(asistentes, habilitados),
    };
  }, [filas]);

  const filtradas = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return filas.filter((fila) => {
      const contenido = normalizarTexto(
        [
          fila.participante.nombre,
          fila.participante.correo,
          fila.participante.id,
        ].join(" ")
      );

      const coincideBusqueda =
        !texto || contenido.includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" || fila.estado === filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }, [filas, busqueda, filtroEstado]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / TAMANO_PAGINA)
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const visibles = filtradas.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  const alcanzado = resumen.participacion >= umbral;
  const estadoQuorum = alcanzado
    ? "Quórum alcanzado"
    : eventoCargado.estado === "Finalizado"
      ? "Quórum no alcanzado"
      : "Quórum pendiente";

  const tonoQuorum = alcanzado
    ? "exito"
    : eventoCargado.estado === "Finalizado"
      ? "peligro"
      : "advertencia";

  const registrosSinParticipante =
    eventoCargado.registros.length - filas.length;

  function cambiarEvento(id: string) {
    const evento = eventosQuorumDemo.find((item) => item.id === id);

    if (!evento) {
      setError("No fue posible encontrar el evento seleccionado.");
      return;
    }

    setEventoId(evento.id);
    setUmbral(evento.umbralDemo);
    setBusqueda("");
    setFiltroEstado("Todos");
    setPagina(1);
    setMensaje("");
    setError("");
  }

  function restablecerUmbral() {
    setUmbral(eventoCargado.umbralDemo);
    setMensaje(
      `Umbral restablecido al valor de demostración: ${eventoCargado.umbralDemo}%.`
    );
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todos");
    setPagina(1);
  }

  return (
    <PageLayout
      titulo="Control de quórum"
      descripcion="Seguimiento visual de asistencia y participación por actividad."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <AvisoDemo>
        <strong>Datos de demostración.</strong> El porcentaje requerido
        es un valor configurable de ejemplo. No representa una regla
        legal, estatutaria ni institucional universal.
      </AvisoDemo>

      <section className={ui.panel} aria-labelledby="quorum-evento">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="quorum-evento" className={ui.panelTitulo}>
              Evento o actividad
            </h2>
            <p className={ui.panelDescripcion}>
              Selecciona una actividad para revisar su quórum de
              demostración.
            </p>
          </div>

          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
            onClick={() =>
              recargar(() =>
                setMensaje(
                  "Vista actualizada con los datos de demostración."
                )
              )
            }
            disabled={cargando}
          >
            ↻ Actualizar
          </button>
        </div>

        <div className={styles.selector}>
          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="quorum-evento-select">
              Actividad
            </label>
            <select
              id="quorum-evento-select"
              value={eventoCargado.id}
              onChange={(evento) => cambiarEvento(evento.target.value)}
            >
              {eventosQuorumDemo.map((evento) => (
                <option key={evento.id} value={evento.id}>
                  {evento.nombre} · {formatearFecha(evento.fecha, {
                    day: "2-digit",
                    month: "short",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.eventoMeta}>
            <div>
              <span className={ui.metaTexto}>Proyecto</span>
              <strong>{eventoCargado.proyectoNombre}</strong>
            </div>
            <div>
              <span className={ui.metaTexto}>Fecha y horario</span>
              <strong>
                {formatearFecha(eventoCargado.fecha)} ·{" "}
                {eventoCargado.horario}
              </strong>
            </div>
            <div>
              <span className={ui.metaTexto}>Lugar</span>
              <strong>{eventoCargado.lugar}</strong>
            </div>
            <div>
              <span className={ui.metaTexto}>Estado del evento</span>
              <Etiqueta
                tono={
                  eventoCargado.estado === "En curso"
                    ? "info"
                    : "neutral"
                }
              >
                {eventoCargado.estado}
              </Etiqueta>
            </div>
          </div>
        </div>
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {error && <Aviso tono="peligro">{error}</Aviso>}

      {registrosSinParticipante > 0 && (
        <Aviso tono="peligro">
          {registrosSinParticipante}{" "}
          {registrosSinParticipante === 1
            ? "registro no tiene un participante asociado"
            : "registros no tienen un participante asociado"}{" "}
          en los datos de demostración. Los totales se calcularon
          solo con los registros válidos.
        </Aviso>
      )}

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de quórum"
      >
        <TarjetaResumen
          etiqueta="Habilitados"
          valor={resumen.habilitados}
          detalle="Participantes con registro en la actividad"
          icono="♧"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Asistentes"
          valor={resumen.asistentes}
          detalle={`${resumen.participacion}% de participación`}
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Ausentes"
          valor={resumen.ausentes}
          detalle="Sin registro de asistencia"
          icono="✕"
          tono="peligro"
        />
        <TarjetaResumen
          etiqueta="Justificados"
          valor={resumen.justificados}
          detalle="Ausencias informadas"
          icono="◷"
          tono="advertencia"
        />
      </section>

      <div className={styles.paneles}>
        <section
          className={ui.panel}
          aria-labelledby="quorum-progreso"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="quorum-progreso" className={ui.panelTitulo}>
                Participación registrada
              </h2>
              <p className={ui.panelDescripcion}>
                Asistentes sobre participantes habilitados.
              </p>
            </div>

            <Etiqueta tono={tonoQuorum}>{estadoQuorum}</Etiqueta>
          </div>

          <BarraProgreso
            valor={resumen.participacion}
            umbral={umbral}
            etiqueta="Participación"
          />

          <div className={styles.detalleQuorum}>
            <div>
              <strong>{resumen.asistentes}</strong>
              <span>Asistentes</span>
            </div>
            <div>
              <strong>{resumen.habilitados}</strong>
              <span>Habilitados</span>
            </div>
            <div>
              <strong>{umbral}%</strong>
              <span>Umbral demo</span>
            </div>
            <div>
              <strong>
                {alcanzado
                  ? `+${(resumen.participacion - umbral).toFixed(1)}%`
                  : `${(umbral - resumen.participacion).toFixed(1)}%`}
              </strong>
              <span>
                {alcanzado ? "Sobre el umbral" : "Por alcanzar"}
              </span>
            </div>
          </div>

          <p className={ui.metaTexto}>
            La marca vertical del gráfico representa el umbral
            configurado. Los datos no provienen de la API.
          </p>
        </section>

        <section
          className={ui.panel}
          aria-labelledby="quorum-umbral"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="quorum-umbral" className={ui.panelTitulo}>
                Umbral configurable
              </h2>
              <p className={ui.panelDescripcion}>
                Ajusta el porcentaje solo para esta demostración.
              </p>
            </div>
          </div>

          <div className={styles.controlUmbral}>
            <label htmlFor="quorum-umbral-rango">
              Porcentaje requerido:{" "}
              <strong>{umbral}%</strong>
            </label>
            <input
              id="quorum-umbral-rango"
              type="range"
              min="1"
              max="100"
              step="1"
              value={umbral}
              onChange={(evento) =>
                setUmbral(Number(evento.target.value))
              }
              aria-describedby="quorum-umbral-ayuda"
            />

            <div className={styles.marcasRango}>
              <span>1%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <p id="quorum-umbral-ayuda" className={ui.campoAyuda}>
            Valor de demostración configurable. No es una regla legal
            ni una disposición institucional universal.
          </p>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={restablecerUmbral}
            >
              Restablecer a {eventoCargado.umbralDemo}%
            </button>
          </div>

          <div className={ui.divisor} />

          <p className={ui.textoSuave}>
            {alcanzado
              ? "Con el umbral actual, la actividad alcanza el quórum de demostración."
              : "Con el umbral actual, la actividad todavía no alcanza el quórum de demostración."}
          </p>
        </section>
      </div>

      <section
        className={`${ui.panel} ${styles.panelTabla}`}
        aria-labelledby="quorum-participantes"
      >
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="quorum-participantes" className={ui.panelTitulo}>
              Participantes de la actividad
            </h2>
            <p className={ui.panelDescripcion}>
              Asistencia registrada en los datos de demostración.
            </p>
          </div>
        </div>

        <div className={styles.filtros}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-quorum"
              etiqueta="Buscar participante en el quórum"
              valor={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, correo o identificador"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="quorum-filtro">
              Estado
            </label>
            <select
              id="quorum-filtro"
              value={filtroEstado}
              onChange={(evento) => {
                setFiltroEstado(evento.target.value);
                setPagina(1);
              }}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Asistió">Asistió</option>
              <option value="Ausente">Ausente</option>
              <option value="Justificado">Justificado</option>
            </select>
          </div>
        </div>

        <div className={ui.resultadoCabecera}>
          <p className={ui.resultadoConteo} role="status">
            {filtradas.length}{" "}
            {filtradas.length === 1
              ? "registro encontrado"
              : "registros encontrados"}
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

        {cargando ? (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Actualizando la asistencia de demostración...
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="No hay registros con estos filtros"
            descripcion="Cambia el estado seleccionado o busca otro nombre para ver participantes."
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
                  Participantes habilitados y estado de asistencia en el
                  evento seleccionado
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Participante</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Hora de registro</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((fila) => (
                    <tr
                      key={`${eventoCargado.id}-${fila.participante.id}`}
                    >
                      <td data-label="Participante">
                        <div className={ui.celdaPrincipal}>
                          <strong>{fila.participante.nombre}</strong>
                          <span>{fila.participante.id}</span>
                        </div>
                      </td>
                      <td data-label="Correo">
                        <span className={styles.correo}>
                          {fila.participante.correo}
                        </span>
                      </td>
                      <td data-label="Estado">
                        <Etiqueta tono={tonoAsistencia(fila.estado)}>
                          {fila.estado}
                        </Etiqueta>
                      </td>
                      <td data-label="Hora de registro">
                        {fila.hora ?? "—"}
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
        La asistencia y el umbral son datos locales de demostración. No
        se consulta ni se modifica información del backend.
      </p>
    </PageLayout>
  );
}
