import { useMemo, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  eventosReporteDemo,
  proyectosReporteDemo,
  type EventoReporte,
} from "../../data/reportesData";
import { participantesDemo } from "../../data/participantesData";
import { useRecargaDemo } from "../../hooks/useRecargaDemo";
import {
  descargarCsv,
  formatearFecha,
  porcentaje,
} from "../../utils/format";
import styles from "./Reportes.module.css";

const MESES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

type ResumenMes = {
  clave: string;
  etiqueta: string;
  inscritos: number;
  asistentes: number;
  eventos: number;
};

type ResumenProyecto = {
  proyectoId: string;
  proyectoNombre: string;
  eventos: number;
  inscritos: number;
  asistentes: number;
  tasa: number;
};

function etiquetaMes(fecha: string): string {
  const mes = Number(fecha.slice(5, 7)) - 1;
  return `${MESES[mes] ?? "—"} ${fecha.slice(0, 4)}`;
}

function tonoTasa(tasa: number) {
  if (tasa >= 80) {
    return "exito" as const;
  }

  if (tasa >= 65) {
    return "advertencia" as const;
  }

  return "peligro" as const;
}

export function Reportes() {
  const [desde, setDesde] = useState("2026-01-01");
  const [hasta, setHasta] = useState("2026-12-31");
  const [proyecto, setProyecto] = useState("Todos");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const { cargando, recargar } = useRecargaDemo();

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);

  const eventosFiltrados = useMemo(() => {
    if (rangoInvalido) {
      return [];
    }

    return eventosReporteDemo.filter((evento) => {
      const cumpleDesde = !desde || evento.fecha >= desde;
      const cumpleHasta = !hasta || evento.fecha <= hasta;
      const cumpleProyecto =
        proyecto === "Todos" || evento.proyectoId === proyecto;

      return cumpleDesde && cumpleHasta && cumpleProyecto;
    });
  }, [desde, hasta, proyecto, rangoInvalido]);

  const participantesFiltrados = useMemo(() => {
    if (proyecto === "Todos") {
      return participantesDemo;
    }

    return participantesDemo.filter(
      (participante) => participante.proyectoId === proyecto
    );
  }, [proyecto]);

  const totales = useMemo(() => {
    const inscritos = eventosFiltrados.reduce(
      (total, evento) => total + evento.inscritos,
      0
    );

    const asistentes = eventosFiltrados.reduce(
      (total, evento) => total + evento.asistentes,
      0
    );

    return {
      proyectos:
        proyecto === "Todos"
          ? proyectosReporteDemo.length
          : eventosFiltrados.length > 0
            ? 1
            : 0,
      eventos: eventosFiltrados.length,
      participantes: participantesFiltrados.length,
      inscritos,
      asistentes,
      tasa: porcentaje(asistentes, inscritos),
      encuestas: eventosFiltrados.reduce(
        (total, evento) => total + evento.encuestas,
        0
      ),
    };
  }, [eventosFiltrados, participantesFiltrados, proyecto]);

  const resumenMeses = useMemo<ResumenMes[]>(() => {
    const mapa = new Map<string, ResumenMes>();

    eventosFiltrados.forEach((evento) => {
      const clave = evento.fecha.slice(0, 7);
      const actual = mapa.get(clave);

      if (actual) {
        actual.inscritos += evento.inscritos;
        actual.asistentes += evento.asistentes;
        actual.eventos += 1;
      } else {
        mapa.set(clave, {
          clave,
          etiqueta: etiquetaMes(evento.fecha),
          inscritos: evento.inscritos,
          asistentes: evento.asistentes,
          eventos: 1,
        });
      }
    });

    return [...mapa.values()].sort((a, b) =>
      a.clave.localeCompare(b.clave)
    );
  }, [eventosFiltrados]);

  const resumenProyectos = useMemo<ResumenProyecto[]>(() => {
    const mapa = new Map<string, ResumenProyecto>();

    eventosFiltrados.forEach((evento) => {
      const actual = mapa.get(evento.proyectoId);

      if (actual) {
        actual.eventos += 1;
        actual.inscritos += evento.inscritos;
        actual.asistentes += evento.asistentes;
      } else {
        mapa.set(evento.proyectoId, {
          proyectoId: evento.proyectoId,
          proyectoNombre: evento.proyectoNombre,
          eventos: 1,
          inscritos: evento.inscritos,
          asistentes: evento.asistentes,
          tasa: 0,
        });
      }
    });

    return [...mapa.values()]
      .map((item) => ({
        ...item,
        tasa: porcentaje(item.asistentes, item.inscritos),
      }))
      .sort((a, b) => b.asistentes - a.asistentes);
  }, [eventosFiltrados]);

  const maximoMensual = Math.max(
    1,
    ...resumenMeses.map((mes) =>
      Math.max(mes.inscritos, mes.asistentes)
    )
  );

  const descripcionGrafico = resumenMeses
    .map(
      (mes) =>
        `${mes.etiqueta}: ${mes.asistentes} asistentes de ${mes.inscritos} inscritos`
    )
    .join(". ");

  function exportar() {
    setError("");

    if (eventosFiltrados.length === 0) {
      setError(
        "No hay datos visibles para exportar. Ajusta los filtros e inténtalo nuevamente."
      );
      return;
    }

    try {
      descargarCsv(
        `syncpass-reporte-${desde || "inicio"}-${hasta || "fin"}.csv`,
        [
          "Fecha",
          "Proyecto",
          "Evento",
          "Inscritos",
          "Asistentes",
          "Tasa de asistencia (%)",
          "Encuestas respondidas",
          "Origen",
        ],
        eventosFiltrados.map((evento) => [
          evento.fecha,
          evento.proyectoNombre,
          evento.nombre,
          evento.inscritos,
          evento.asistentes,
          porcentaje(evento.asistentes, evento.inscritos),
          evento.encuestas,
          "Datos de demostración",
        ])
      );

      setMensaje(
        "CSV generado con las filas visibles. Los datos corresponden a la demostración."
      );
    } catch {
      setError(
        "No fue posible generar el archivo CSV en este navegador."
      );
    }
  }

  function restablecerFiltros() {
    setDesde("2026-01-01");
    setHasta("2026-12-31");
    setProyecto("Todos");
    setError("");
  }

  return (
    <PageLayout
      titulo="Reportes"
      descripcion="Indicadores y estadísticas de los proyectos comunitarios."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <AvisoDemo>
        <strong>Reporte de demostración.</strong> Las cifras son
        ejemplos internamente coherentes y no representan resultados
        históricos reales del backend.
      </AvisoDemo>

      <section
        className={ui.resumenGrid}
        aria-label="Indicadores principales"
      >
        <TarjetaResumen
          etiqueta="Proyectos"
          valor={totales.proyectos}
          detalle="Según el filtro de proyecto"
          icono="▤"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Eventos"
          valor={totales.eventos}
          detalle="Actividades dentro del rango"
          icono="◷"
          tono="neutral"
        />
        <TarjetaResumen
          etiqueta="Participantes"
          valor={totales.participantes}
          detalle="Registrados en los proyectos filtrados"
          icono="♧"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Asistencias"
          valor={totales.asistentes}
          detalle={`${totales.inscritos} inscripciones acumuladas`}
          icono="✓"
          tono="advertencia"
        />
      </section>

      <section className={ui.panel} aria-labelledby="reportes-filtros">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="reportes-filtros" className={ui.panelTitulo}>
              Filtros del reporte
            </h2>
            <p className={ui.panelDescripcion}>
              Rango de fechas y proyecto. Los indicadores se recalculan
              automáticamente.
            </p>
          </div>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={() => recargar()}
              disabled={cargando}
            >
              ↻ Actualizar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={restablecerFiltros}
            >
              Restablecer filtros
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={exportar}
              disabled={rangoInvalido || eventosFiltrados.length === 0}
            >
              ↓ Exportar CSV
            </button>
          </div>
        </div>

        <div className={ui.filtrosGrid}>
          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="reporte-desde">
              Desde
            </label>
            <input
              id="reporte-desde"
              type="date"
              value={desde}
              onChange={(evento) => setDesde(evento.target.value)}
              min="2026-01-01"
              max="2026-12-31"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="reporte-hasta">
              Hasta
            </label>
            <input
              id="reporte-hasta"
              type="date"
              value={hasta}
              onChange={(evento) => setHasta(evento.target.value)}
              min="2026-01-01"
              max="2026-12-31"
              aria-invalid={rangoInvalido}
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="reporte-proyecto">
              Proyecto
            </label>
            <select
              id="reporte-proyecto"
              value={proyecto}
              onChange={(evento) => setProyecto(evento.target.value)}
            >
              <option value="Todos">Todos los proyectos</option>
              {proyectosReporteDemo.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {rangoInvalido && (
          <div className={styles.avisoRango}>
            <Aviso tono="peligro">
              La fecha “Desde” no puede ser posterior a la fecha
              “Hasta”. Corrige el rango para ver resultados.
            </Aviso>
          </div>
        )}
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {error && <Aviso tono="peligro">{error}</Aviso>}

      {cargando ? (
        <div className={ui.panel}>
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Preparando el reporte de demostración...
          </div>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <EstadoVacio
          titulo="Sin datos para el período seleccionado"
          descripcion="No hay eventos de demostración dentro del rango y proyecto elegidos. Ajusta los filtros para volver a ver resultados."
          accion={
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={restablecerFiltros}
            >
              Restablecer filtros
            </button>
          }
        />
      ) : (
        <>
          <div className={styles.paneles}>
            <section
              className={ui.panel}
              aria-labelledby="reporte-mensual"
            >
              <div className={ui.panelCabecera}>
                <div>
                  <h2 id="reporte-mensual" className={ui.panelTitulo}>
                    Asistencia por mes
                  </h2>
                  <p className={ui.panelDescripcion}>
                    Comparación entre inscripciones y asistencias.
                  </p>
                </div>

                <Etiqueta tono={tonoTasa(totales.tasa)}>
                  Tasa general: {totales.tasa}%
                </Etiqueta>
              </div>

              <figure className={styles.figura}>
                <div
                  className={styles.grafico}
                  role="img"
                  aria-label={`Gráfico mensual de asistencia. ${descripcionGrafico}`}
                >
                  {resumenMeses.map((mes) => (
                    <div className={styles.columna} key={mes.clave}>
                      <div className={styles.barras}>
                        <span
                          className={styles.barraInscritos}
                          style={{
                            height: `${Math.max(
                              3,
                              (mes.inscritos / maximoMensual) * 100
                            )}%`,
                          }}
                          title={`${mes.etiqueta}: ${mes.inscritos} inscritos`}
                        />
                        <span
                          className={styles.barraAsistentes}
                          style={{
                            height: `${Math.max(
                              3,
                              (mes.asistentes / maximoMensual) * 100
                            )}%`,
                          }}
                          title={`${mes.etiqueta}: ${mes.asistentes} asistentes`}
                        />
                      </div>
                      <span className={styles.mes}>{mes.etiqueta}</span>
                    </div>
                  ))}
                </div>

                <figcaption className={styles.leyenda}>
                  <span>
                    <i className={styles.puntoInscritos} aria-hidden="true" />
                    Inscritos
                  </span>
                  <span>
                    <i className={styles.puntoAsistentes} aria-hidden="true" />
                    Asistentes
                  </span>
                  <span className={styles.leyendaNota}>
                    Datos de demostración
                  </span>
                </figcaption>
              </figure>

              <ul className={ui.srOnly}>
                {resumenMeses.map((mes) => (
                  <li key={mes.clave}>
                    {mes.etiqueta}: {mes.asistentes} asistentes de{" "}
                    {mes.inscritos} inscritos en {mes.eventos} eventos.
                  </li>
                ))}
              </ul>
            </section>

            <section
              className={ui.panel}
              aria-labelledby="reporte-proyectos"
            >
              <div className={ui.panelCabecera}>
                <div>
                  <h2 id="reporte-proyectos" className={ui.panelTitulo}>
                    Resumen por proyecto
                  </h2>
                  <p className={ui.panelDescripcion}>
                    Asistencias acumuladas con los filtros actuales.
                  </p>
                </div>
              </div>

              <div className={ui.tablaWrap}>
                <table className={ui.tabla}>
                  <caption className={ui.srOnly}>
                    Resumen de eventos, inscripciones y asistencias por
                    proyecto
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Proyecto</th>
                      <th scope="col" className={ui.tablaNumero}>
                        Eventos
                      </th>
                      <th scope="col" className={ui.tablaNumero}>
                        Asistencias
                      </th>
                      <th scope="col" className={ui.tablaNumero}>
                        Tasa
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumenProyectos.map((item) => (
                      <tr key={item.proyectoId}>
                        <td data-label="Proyecto">
                          <strong>{item.proyectoNombre}</strong>
                        </td>
                        <td
                          data-label="Eventos"
                          className={ui.tablaNumero}
                        >
                          {item.eventos}
                        </td>
                        <td
                          data-label="Asistencias"
                          className={ui.tablaNumero}
                        >
                          {item.asistentes}/{item.inscritos}
                        </td>
                        <td data-label="Tasa" className={ui.tablaNumero}>
                          <Etiqueta tono={tonoTasa(item.tasa)}>
                            {item.tasa}%
                          </Etiqueta>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section
            className={`${ui.panel} ${styles.resultados}`}
            aria-labelledby="reporte-detalle"
          >
            <div className={ui.panelCabecera}>
              <div>
                <h2 id="reporte-detalle" className={ui.panelTitulo}>
                  Detalle de resultados
                </h2>
                <p className={ui.panelDescripcion}>
                  Filas que se incluirán en la exportación CSV.
                </p>
              </div>

              <p className={ui.resultadoConteo} role="status">
                {eventosFiltrados.length} eventos ·{" "}
                {totales.encuestas} encuestas respondidas
              </p>
            </div>

            <div className={ui.tablaWrap}>
              <table className={ui.tabla}>
                <caption className={ui.srOnly}>
                  Eventos de demostración incluidos en el reporte
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Evento</th>
                    <th scope="col">Proyecto</th>
                    <th scope="col" className={ui.tablaNumero}>
                      Inscritos
                    </th>
                    <th scope="col" className={ui.tablaNumero}>
                      Asistentes
                    </th>
                    <th scope="col" className={ui.tablaNumero}>
                      Tasa
                    </th>
                    <th scope="col" className={ui.tablaNumero}>
                      Encuestas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {eventosFiltrados.map((evento: EventoReporte) => {
                    const tasa = porcentaje(
                      evento.asistentes,
                      evento.inscritos
                    );

                    return (
                      <tr key={evento.id}>
                        <td data-label="Fecha">
                          {formatearFecha(evento.fecha)}
                        </td>
                        <td data-label="Evento">
                          <div className={ui.celdaPrincipal}>
                            <strong>{evento.nombre}</strong>
                            <span>Dato de demostración</span>
                          </div>
                        </td>
                        <td data-label="Proyecto">
                          {evento.proyectoNombre}
                        </td>
                        <td
                          data-label="Inscritos"
                          className={ui.tablaNumero}
                        >
                          {evento.inscritos}
                        </td>
                        <td
                          data-label="Asistentes"
                          className={ui.tablaNumero}
                        >
                          {evento.asistentes}
                        </td>
                        <td
                          data-label="Tasa"
                          className={ui.tablaNumero}
                        >
                          <Etiqueta tono={tonoTasa(tasa)}>
                            {tasa}%
                          </Etiqueta>
                        </td>
                        <td
                          data-label="Encuestas"
                          className={ui.tablaNumero}
                        >
                          {evento.encuestas}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <p className={ui.metaTexto}>
        Los reportes no consultan Spring Boot. La exportación contiene
        únicamente las filas visibles en pantalla.
      </p>
    </PageLayout>
  );
}
