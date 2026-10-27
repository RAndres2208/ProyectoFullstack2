import { useMemo, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  actividadesDemo,
  type EstadoActividad,
  type TipoActividad,
} from "../../data/historialData";
import { useRecargaDemo } from "../../hooks/useRecargaDemo";
import {
  descargarCsv,
  formatearFechaHora,
  normalizarTexto,
} from "../../utils/format";
import styles from "./Historial.module.css";

type OrdenHistorial = "recientes" | "antiguos" | "tipo";

const TIPOS: Array<TipoActividad | "Todos"> = [
  "Todos",
  "Asistencia",
  "Proyecto",
  "Encuesta",
  "Participante",
  "Sincronización",
  "Sesión",
];

const ICONOS: Record<TipoActividad, string> = {
  Asistencia: "✓",
  Proyecto: "▤",
  Encuesta: "▥",
  Participante: "♧",
  Sincronización: "⇅",
  Sesión: "⌘",
};

const CLASES_ICONO: Record<TipoActividad, string> = {
  Asistencia: styles.iconoAsistencia,
  Proyecto: styles.iconoProyecto,
  Encuesta: styles.iconoEncuesta,
  Participante: styles.iconoParticipante,
  Sincronización: styles.iconoSincronizacion,
  Sesión: styles.iconoSesion,
};

function tonoEstado(estado: EstadoActividad) {
  if (estado === "Completado") {
    return "exito" as const;
  }

  if (estado === "Pendiente") {
    return "advertencia" as const;
  }

  return "peligro" as const;
}

export function Historial() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<
    TipoActividad | "Todos"
  >("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [orden, setOrden] = useState<OrdenHistorial>("recientes");
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const { cargando, recargar } = useRecargaDemo();

  const rangoInvalido = Boolean(desde && hasta && desde > hasta);

  const filtradas = useMemo(() => {
    if (rangoInvalido) {
      return [];
    }

    const texto = normalizarTexto(busqueda);

    const resultado = actividadesDemo.filter((actividad) => {
      const contenido = normalizarTexto(
        [
          actividad.id,
          actividad.descripcion,
          actividad.actor,
          actividad.detalle,
          actividad.referencia ?? "",
          actividad.tipo,
        ].join(" ")
      );

      const fecha = actividad.fecha.slice(0, 10);
      const coincideBusqueda = !texto || contenido.includes(texto);
      const coincideTipo =
        filtroTipo === "Todos" || actividad.tipo === filtroTipo;
      const coincideDesde = !desde || fecha >= desde;
      const coincideHasta = !hasta || fecha <= hasta;

      return (
        coincideBusqueda &&
        coincideTipo &&
        coincideDesde &&
        coincideHasta
      );
    });

    return [...resultado].sort((a, b) => {
      if (orden === "tipo") {
        const porTipo = a.tipo.localeCompare(b.tipo, "es");

        return porTipo !== 0
          ? porTipo
          : b.fecha.localeCompare(a.fecha);
      }

      return orden === "recientes"
        ? b.fecha.localeCompare(a.fecha)
        : a.fecha.localeCompare(b.fecha);
    });
  }, [busqueda, filtroTipo, desde, hasta, orden, rangoInvalido]);

  const resumen = useMemo(
    () => ({
      total: filtradas.length,
      completados: filtradas.filter(
        (actividad) => actividad.estado === "Completado"
      ).length,
      pendientes: filtradas.filter(
        (actividad) => actividad.estado === "Pendiente"
      ).length,
      errores: filtradas.filter(
        (actividad) => actividad.estado === "Error"
      ).length,
    }),
    [filtradas]
  );

  const actividadDetalle = actividadesDemo.find(
    (actividad) => actividad.id === idDetalle
  );

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroTipo("Todos");
    setDesde("");
    setHasta("");
    setOrden("recientes");
    setError("");
  }

  function exportar() {
    setError("");
    setMensaje("");

    if (filtradas.length === 0) {
      setError(
        "No hay registros visibles para exportar. Ajusta los filtros e inténtalo nuevamente."
      );
      return;
    }

    try {
      descargarCsv(
        `syncpass-historial-${desde || "inicio"}-${hasta || "fin"}.csv`,
        [
          "Fecha y hora",
          "Tipo",
          "Descripción",
          "Actor",
          "Estado",
          "Referencia",
          "Detalle",
          "Origen",
        ],
        filtradas.map((actividad) => [
          actividad.fecha,
          actividad.tipo,
          actividad.descripcion,
          actividad.actor,
          actividad.estado,
          actividad.referencia ?? "",
          actividad.detalle,
          "Datos de demostración",
        ])
      );

      setMensaje(
        "CSV generado con los registros visibles. El contenido es de demostración."
      );
    } catch {
      setError(
        "No fue posible generar el archivo CSV en este navegador."
      );
    }
  }

  return (
    <PageLayout
      titulo="Historial"
      descripcion="Actividad reciente de la plataforma y de la sincronización local."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <AvisoDemo>
        <strong>Historial de demostración.</strong> Los registros no
        provienen de una auditoría real del backend. Los inicios de sesión
        con Cognito, las asistencias, los cambios de estado, las
        sincronizaciones y los errores simulados se identifican como datos
        de demostración en cada registro.
      </AvisoDemo>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen del historial visible"
      >
        <TarjetaResumen
          etiqueta="Registros"
          valor={resumen.total}
          detalle="Coinciden con los filtros actuales"
          icono="◷"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Completados"
          valor={resumen.completados}
          detalle="Acciones finalizadas en la demostración"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Pendientes"
          valor={resumen.pendientes}
          detalle="Sin integración real con el backend"
          icono="◌"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Errores"
          valor={resumen.errores}
          detalle="Estados simulados para probar la interfaz"
          icono="!"
          tono="peligro"
        />
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {error && <Aviso tono="peligro">{error}</Aviso>}

      <section className={ui.panel} aria-labelledby="historial-filtros">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="historial-filtros" className={ui.panelTitulo}>
              Filtrar actividad
            </h2>
            <p className={ui.panelDescripcion}>
              Combina búsqueda, tipo, rango de fechas y orden cronológico.
            </p>
          </div>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={() =>
                recargar(() =>
                  setMensaje(
                    "Historial actualizado con los registros de demostración."
                  )
                )
              }
              disabled={cargando}
            >
              ↻ Actualizar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={limpiarFiltros}
            >
              Restablecer filtros
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={exportar}
              disabled={rangoInvalido || filtradas.length === 0}
            >
              ↓ Exportar CSV
            </button>
          </div>
        </div>

        <div className={styles.filtros}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-historial"
              etiqueta="Buscar en el historial"
              valor={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por acción, actor, referencia o identificador"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="historial-tipo">
              Tipo
            </label>
            <select
              id="historial-tipo"
              value={filtroTipo}
              onChange={(evento) =>
                setFiltroTipo(
                  evento.target.value as TipoActividad | "Todos"
                )
              }
            >
              {TIPOS.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo === "Todos" ? "Todos los tipos" : tipo}
                </option>
              ))}
            </select>
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="historial-desde">
              Desde
            </label>
            <input
              id="historial-desde"
              type="date"
              value={desde}
              onChange={(evento) => setDesde(evento.target.value)}
              min="2026-01-01"
              max="2026-12-31"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="historial-hasta">
              Hasta
            </label>
            <input
              id="historial-hasta"
              type="date"
              value={hasta}
              onChange={(evento) => setHasta(evento.target.value)}
              min="2026-01-01"
              max="2026-12-31"
              aria-invalid={rangoInvalido}
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="historial-orden">
              Orden
            </label>
            <select
              id="historial-orden"
              value={orden}
              onChange={(evento) =>
                setOrden(evento.target.value as OrdenHistorial)
              }
            >
              <option value="recientes">Más recientes primero</option>
              <option value="antiguos">Más antiguos primero</option>
              <option value="tipo">Agrupar por tipo</option>
            </select>
          </div>
        </div>

        {rangoInvalido && (
          <div className={styles.avisoRango}>
            <Aviso tono="peligro">
              La fecha “Desde” no puede ser posterior a la fecha “Hasta”.
              Corrige el rango para ver registros.
            </Aviso>
          </div>
        )}

        <div className={ui.resultadoCabecera}>
          <p className={ui.resultadoConteo} role="status">
            {filtradas.length}{" "}
            {filtradas.length === 1
              ? "registro visible"
              : "registros visibles"}
          </p>

          {(busqueda ||
            filtroTipo !== "Todos" ||
            desde ||
            hasta ||
            orden !== "recientes") && (
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
            Actualizando el historial de demostración...
          </div>
        ) : filtradas.length === 0 ? (
          <EstadoVacio
            titulo="No hay actividad para estos filtros"
            descripcion="Cambia el tipo, ajusta el rango de fechas o busca otro término para volver a ver registros."
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
          <ol className={styles.lineaTiempo}>
            {filtradas.map((actividad) => (
              <li key={actividad.id}>
                <article className={styles.registro}>
                  <div
                    className={`${styles.icono} ${
                      CLASES_ICONO[actividad.tipo]
                    }`}
                    aria-hidden="true"
                  >
                    {ICONOS[actividad.tipo]}
                  </div>

                  <div className={styles.registroContenido}>
                    <div className={styles.registroCabecera}>
                      <div className={styles.registroTitulo}>
                        <strong>{actividad.descripcion}</strong>
                        <span>
                          {formatearFechaHora(actividad.fecha)} ·{" "}
                          {actividad.actor}
                        </span>
                      </div>

                      <div className={styles.registroEtiquetas}>
                        <Etiqueta tono="neutral">
                          {actividad.tipo}
                        </Etiqueta>
                        <Etiqueta tono={tonoEstado(actividad.estado)}>
                          {actividad.estado}
                        </Etiqueta>
                        <Etiqueta tono="info">
                          Dato de demostración
                        </Etiqueta>
                      </div>
                    </div>

                    <p className={styles.registroDetalle}>
                      {actividad.detalle}
                    </p>

                    <div className={styles.registroPie}>
                      <span>
                        {actividad.referencia ?? "Sin referencia"} ·{" "}
                        {actividad.id}
                      </span>
                      <button
                        type="button"
                        className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                        onClick={() => setIdDetalle(actividad.id)}
                      >
                        Ver detalle
                      </button>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className={ui.metaTexto}>
        La exportación incluye solo los registros visibles. No se
        registran tokens, credenciales ni información de Cognito.
      </p>

      <Modal
        abierto={Boolean(actividadDetalle)}
        titulo="Detalle del registro"
        onCerrar={() => setIdDetalle(null)}
        pie={
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={() => setIdDetalle(null)}
          >
            Cerrar
          </button>
        }
      >
        {actividadDetalle && (
          <div className={styles.detalle}>
            <div className={styles.detalleEncabezado}>
              <div
                className={`${styles.iconoGrande} ${
                  CLASES_ICONO[actividadDetalle.tipo]
                }`}
                aria-hidden="true"
              >
                {ICONOS[actividadDetalle.tipo]}
              </div>

              <div>
                <h3>{actividadDetalle.descripcion}</h3>
                <p>
                  {formatearFechaHora(actividadDetalle.fecha)}
                </p>
              </div>
            </div>

            <div className={styles.detalleEtiquetas}>
              <Etiqueta tono="neutral">
                {actividadDetalle.tipo}
              </Etiqueta>
              <Etiqueta tono={tonoEstado(actividadDetalle.estado)}>
                {actividadDetalle.estado}
              </Etiqueta>
              <Etiqueta tono="info">Dato de demostración</Etiqueta>
            </div>

            <dl className={styles.detalleLista}>
              <div>
                <dt>Identificador</dt>
                <dd>{actividadDetalle.id}</dd>
              </div>
              <div>
                <dt>Actor</dt>
                <dd>{actividadDetalle.actor}</dd>
              </div>
              <div>
                <dt>Referencia</dt>
                <dd>
                  {actividadDetalle.referencia ?? "No informada"}
                </dd>
              </div>
              <div>
                <dt>Fecha y hora</dt>
                <dd>{formatearFechaHora(actividadDetalle.fecha)}</dd>
              </div>
              <div className={styles.detalleCompleto}>
                <dt>Descripción completa</dt>
                <dd>{actividadDetalle.detalle}</dd>
              </div>
              <div className={styles.detalleCompleto}>
                <dt>Origen</dt>
                <dd>
                  Datos locales de demostración. No corresponde a una
                  auditoría del backend.
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
}
