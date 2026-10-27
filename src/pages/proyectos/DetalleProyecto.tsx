import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link, useParams } from "wouter";
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
  buscarDetalleProyectoDemo,
} from "../../data/proyectoDetalleData";
import { proyectosData } from "../../data/proyectosData";
import {
  obtenerProyectosApi,
  type ProyectoApi,
} from "../../services/proyectosApi";
import {
  formatearFecha,
  normalizarTexto,
  porcentaje,
} from "../../utils/format";
import styles from "./DetalleProyecto.module.css";

function tonoEstado(estado: string) {
  const normalizado = normalizarTexto(estado);

  if (
    normalizado.includes("ejec") ||
    normalizado.includes("activ") ||
    normalizado.includes("curso")
  ) {
    return "exito" as const;
  }

  if (
    normalizado.includes("final") ||
    normalizado.includes("cerrad")
  ) {
    return "neutral" as const;
  }

  if (normalizado.includes("error") || normalizado.includes("cancel")) {
    return "peligro" as const;
  }

  return "info" as const;
}

function fechaDemo(
  valor: string | undefined,
  fallback?: string
): string {
  if (valor) {
    return formatearFecha(valor);
  }

  return fallback ?? "No disponible";
}

export function DetalleProyecto() {
  const { id } = useParams<{ id: string }>();
  const auth = useAuth();
  const accessToken = auth.user?.access_token;

  const [proyectosApi, setProyectosApi] = useState<ProyectoApi[]>([]);
  const [cargandoApi, setCargandoApi] = useState(true);
  const [errorApiEstado, setErrorApiEstado] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    let cancelado = false;

    async function cargarProyecto() {
      try {
        const datos = await obtenerProyectosApi(accessToken!);

        if (cancelado) {
          return;
        }

        setProyectosApi(datos);
      } catch (error) {
        if (cancelado) {
          return;
        }

        setProyectosApi([]);
        setErrorApiEstado(
          error instanceof Error
            ? error.message
            : "No fue posible consultar la API de proyectos."
        );
      } finally {
        if (!cancelado) {
          setCargandoApi(false);
        }
      }
    }

    void cargarProyecto();

    return () => {
      cancelado = true;
    };
  }, [accessToken, intento]);

  const errorApi = accessToken
    ? errorApiEstado
    : "No hay un access token disponible para consultar la API.";

  const cargando = Boolean(accessToken) && cargandoApi;

  const proyectosApiDisponibles = accessToken ? proyectosApi : [];

  const proyectoLocal = proyectosData.find(
    (proyecto) => proyecto.id === id
  );

  const proyectoApiPorId = proyectosApiDisponibles.find(
    (proyecto) => String(proyecto.id) === id
  );

  const proyectoApiPorNombre = proyectoLocal
    ? proyectosApiDisponibles.find(
        (proyecto) =>
          normalizarTexto(proyecto.nombre) ===
          normalizarTexto(proyectoLocal.nombre)
      )
    : undefined;

  const proyectoApi = proyectoApiPorId ?? proyectoApiPorNombre;

  const proyectoDemo = buscarDetalleProyectoDemo(
    id,
    proyectoApi?.nombre ?? proyectoLocal?.nombre
  );

  const nombre =
    proyectoApi?.nombre ??
    proyectoLocal?.nombre ??
    proyectoDemo?.nombre;

  const esRutaNumerica = /^\d+$/.test(id);
  const hayContenido = Boolean(
    proyectoApi || proyectoLocal || proyectoDemo
  );

  if (cargando) {
    return (
      <PageLayout
        titulo="Detalle del proyecto"
        descripcion="Consultando la información del proyecto."
        volverA="/proyectos"
        volverEtiqueta="Volver a proyectos"
      >
        <div className={ui.panel}>
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Consultando proyectos en SyncPass API...
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!hayContenido) {
    return (
      <PageLayout
        titulo="Detalle del proyecto"
        descripcion="No fue posible mostrar la información solicitada."
        volverA="/proyectos"
        volverEtiqueta="Volver a proyectos"
      >
        {errorApi && (
          <>
            <Aviso tono="peligro">
              <strong>No fue posible consultar la API.</strong>{" "}
              {errorApi}
            </Aviso>

            <div className={ui.botonesFila}>
              <button
                type="button"
                className={`${ui.boton} ${ui.botonSecundario}`}
                onClick={() => {
                  setCargandoApi(true);
                  setErrorApiEstado("");
                  setIntento((actual) => actual + 1);
                }}
              >
                Reintentar consulta
              </button>
            </div>
          </>
        )}

        <div className={styles.estadoVacio}>
          <EstadoVacio
            titulo={
              esRutaNumerica
                ? "Proyecto no encontrado"
                : "No existe un proyecto local con este identificador"
            }
            descripcion={
              esRutaNumerica
                ? "La API no devolvió un proyecto con este identificador y no existe un detalle local equivalente."
                : "Revisa el enlace o vuelve al listado de proyectos comunitarios."
            }
            accion={
              <Link
                href="/proyectos"
                className={`${ui.boton} ${ui.botonPrimario}`}
              >
                Volver a proyectos
              </Link>
            }
          />
        </div>
      </PageLayout>
    );
  }

  const participantes =
    proyectoApi?.participantes ?? null;

  return (
    <PageLayout
      titulo={nombre ?? "Detalle del proyecto"}
      descripcion="Información del proyecto, participantes y actividades vinculadas."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos comunitarios"
    >
      {proyectoApi ? (
        <Aviso tono="exito">
          Los campos <strong>identificador, nombre, estado y
          participantes</strong> provienen de SyncPass API. La
          información complementaria que aparece más abajo está
          claramente marcada como demostración.
        </Aviso>
      ) : (
        <AvisoDemo>
          <strong>Vista de demostración.</strong> No se encontró un
          proyecto equivalente en la API. Los datos locales no
          representan información real del backend.
        </AvisoDemo>
      )}

      {errorApi && (
        <>
          <Aviso tono="peligro">
            <strong>Consulta a la API fallida.</strong> {errorApi}
          </Aviso>

          <div className={styles.reintento}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => {
                setCargandoApi(true);
                setErrorApiEstado("");
                setIntento((actual) => actual + 1);
              }}
            >
              Reintentar consulta
            </button>
          </div>
        </>
      )}

      <section className={styles.hero} aria-labelledby="proyecto-titulo">
        <div className={styles.heroPrincipal}>
          <span className={styles.heroIcono} aria-hidden="true">
            ▤
          </span>

          <div className={styles.heroTexto}>
            <div className={styles.heroEtiquetas}>
              <Etiqueta tono={proyectoApi ? "exito" : "advertencia"}>
                {proyectoApi
                  ? "Datos de API"
                  : "Datos de demostración"}
              </Etiqueta>
              {proyectoLocal?.categoria && (
                <Etiqueta tono="info">
                  {proyectoLocal.categoria}
                </Etiqueta>
              )}
            </div>

            <h2 id="proyecto-titulo">
              {nombre ?? "Nombre no disponible"}
            </h2>

            <p>
              {proyectoApi
                ? "Proyecto entregado por el servicio de proyectos."
                : "No se encontró un proyecto equivalente en la API."}
            </p>
          </div>
        </div>

        <div className={styles.heroEstado}>
          <span className={ui.metaTexto}>Estado</span>
          <Etiqueta
            tono={
              proyectoApi
                ? tonoEstado(proyectoApi.estado)
                : proyectoLocal
                  ? tonoEstado(proyectoLocal.estado)
                  : "neutral"
            }
          >
            {proyectoApi?.estado ??
              proyectoLocal?.estado ??
              "No disponible"}
          </Etiqueta>
        </div>
      </section>

      <section
        className={ui.resumenGrid}
        aria-label="Datos del proyecto entregados por la API"
      >
        <TarjetaResumen
          etiqueta="Identificador API"
          valor={proyectoApi ? proyectoApi.id : "—"}
          detalle={
            proyectoApi
              ? "Campo real de SyncPass API"
              : "No disponible sin conexión a la API"
          }
          icono="#"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Participantes"
          valor={participantes ?? "—"}
          detalle={
            participantes === null
              ? "No disponible sin conexión a la API"
              : "Campo real de SyncPass API"
          }
          icono="♧"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Estado API"
          valor={proyectoApi?.estado ?? "—"}
          detalle={
            proyectoApi
              ? "Campo real de SyncPass API"
              : "No disponible sin conexión a la API"
          }
          icono="◈"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Ruta local"
          valor={proyectoLocal ? "Vinculada" : "Sin vínculo"}
          detalle="Relación entre el slug local y la API"
          icono="↗"
          tono="neutral"
        />
      </section>

      {!proyectoApi && (
        <Aviso tono="advertencia">
          Los campos ID, participantes y estado de la API no están
          disponibles. Se muestran solo los datos de demostración
          marcados como tales.
        </Aviso>
      )}

      <div className={styles.paneles}>
        <section
          className={ui.panel}
          aria-labelledby="proyecto-descripcion"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="proyecto-descripcion" className={ui.panelTitulo}>
                Descripción del proyecto
              </h2>
              <p className={ui.panelDescripcion}>
                Información complementaria de demostración.
              </p>
            </div>
            <Etiqueta tono="advertencia">Demostración</Etiqueta>
          </div>

          {proyectoDemo ? (
            <>
              <p className={styles.descripcion}>
                {proyectoDemo.descripcion}
              </p>

              <dl className={styles.datosDemo}>
                <div>
                  <dt>Responsable</dt>
                  <dd>{proyectoDemo.responsable}</dd>
                </div>
                <div>
                  <dt>Unidad vecinal</dt>
                  <dd>
                    {proyectoLocal?.unidadVecinal ??
                      proyectoDemo.unidadVecinal}
                  </dd>
                </div>
                <div>
                  <dt>Sector</dt>
                  <dd>
                    {proyectoLocal?.sector ?? proyectoDemo.sector}
                  </dd>
                </div>
                <div>
                  <dt>Categoría</dt>
                  <dd>
                    {proyectoLocal?.categoria ?? "No disponible"}
                  </dd>
                </div>
                <div>
                  <dt>Inicio</dt>
                  <dd>
                    {fechaDemo(
                      proyectoDemo.fechaInicio,
                      proyectoLocal?.fechaInicio
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Término</dt>
                  <dd>
                    {fechaDemo(
                      proyectoDemo.fechaTermino,
                      proyectoLocal?.fechaTermino
                    )}
                  </dd>
                </div>
              </dl>

              <h3 className={styles.subtitulo}>Objetivos</h3>
              <ul className={styles.objetivos}>
                {proyectoDemo.objetivos.map((objetivo) => (
                  <li key={objetivo}>{objetivo}</li>
                ))}
              </ul>
            </>
          ) : (
            <div className={styles.sinDatos}>
              <p className={ui.textoSuave}>
                No hay información complementaria de demostración para
                este proyecto.
              </p>
              <p className={ui.metaTexto}>
                La API solo entrega id, nombre, estado y participantes.
              </p>
            </div>
          )}
        </section>

        <section
          className={ui.panel}
          aria-labelledby="proyecto-indicadores"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="proyecto-indicadores" className={ui.panelTitulo}>
                Indicadores del proyecto
              </h2>
              <p className={ui.panelDescripcion}>
                Cifras complementarias de demostración.
              </p>
            </div>
          </div>

          {proyectoDemo ? (
            <>
              <div className={styles.indicadores}>
                <div>
                  <strong>{proyectoDemo.estadisticas.inscritos}</strong>
                  <span>Inscripciones demo</span>
                </div>
                <div>
                  <strong>{proyectoDemo.estadisticas.asistencias}</strong>
                  <span>Asistencias demo</span>
                </div>
                <div>
                  <strong>{proyectoDemo.estadisticas.encuestas}</strong>
                  <span>Encuestas demo</span>
                </div>
                <div>
                  <strong>
                    {proyectoDemo.estadisticas.quorumPromedio}%
                  </strong>
                  <span>Quórum promedio demo</span>
                </div>
              </div>

              <div className={ui.divisor} />

              <p className={ui.textoSuave}>
                Asistencia respecto de inscripciones:{" "}
                <strong>
                  {porcentaje(
                    proyectoDemo.estadisticas.asistencias,
                    proyectoDemo.estadisticas.inscritos
                  )}
                  %
                </strong>
              </p>

              <p className={ui.metaTexto}>
                Estas cifras no provienen del backend y no deben
                interpretarse como resultados oficiales.
              </p>
            </>
          ) : (
            <p className={ui.textoSuave}>
              Los indicadores no están disponibles para este proyecto.
            </p>
          )}

          {proyectoApi && (
            <>
              <div className={ui.divisor} />
              <div className={styles.apiDestacado}>
                <span className={ui.metaTexto}>
                  Participantes informados por la API
                </span>
                <strong>{proyectoApi.participantes}</strong>
                <span className={ui.metaTexto}>
                  Campo real de SyncPass API
                </span>
              </div>
            </>
          )}
        </section>
      </div>

      <section
        className={`${ui.panel} ${styles.panelEventos}`}
        aria-labelledby="proyecto-eventos"
      >
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="proyecto-eventos" className={ui.panelTitulo}>
              Actividades vinculadas
            </h2>
            <p className={ui.panelDescripcion}>
              Actividades complementarias de demostración.
            </p>
          </div>
          <Etiqueta tono="advertencia">Demostración</Etiqueta>
        </div>

        {proyectoDemo && proyectoDemo.eventos.length > 0 ? (
          <div className={ui.tablaWrap}>
            <table className={ui.tabla}>
              <caption className={ui.srOnly}>
                Actividades vinculadas de demostración para el proyecto
              </caption>
              <thead>
                <tr>
                  <th scope="col">Actividad</th>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Inscritos</th>
                  <th scope="col">Asistentes</th>
                  <th scope="col">Acción</th>
                </tr>
              </thead>
              <tbody>
                {proyectoDemo.eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td data-label="Actividad">
                      <div className={ui.celdaPrincipal}>
                        <strong>{evento.nombre}</strong>
                        <span>{evento.id}</span>
                      </div>
                    </td>
                    <td data-label="Fecha">
                      {formatearFecha(evento.fecha)}
                    </td>
                    <td data-label="Estado">
                      <Etiqueta
                        tono={
                          evento.estado === "Finalizado"
                            ? "neutral"
                            : evento.estado === "En curso"
                              ? "exito"
                              : "info"
                        }
                      >
                        {evento.estado}
                      </Etiqueta>
                    </td>
                    <td data-label="Inscritos">{evento.inscritos}</td>
                    <td data-label="Asistentes">
                      {evento.asistentes}
                    </td>
                    <td data-label="Acción">
                      {evento.enlace ? (
                        <Link
                          href={evento.enlace}
                          className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                        >
                          Ver evento
                        </Link>
                      ) : (
                        <span className={ui.metaTexto}>
                          Sin detalle local
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EstadoVacio
            titulo="Sin actividades complementarias"
            descripcion="No hay actividades de demostración vinculadas a este proyecto. La API no entrega eventos en este endpoint."
          />
        )}
      </section>

      <p className={ui.metaTexto}>
        {proyectoApi
          ? `El identificador ${proyectoApi.id} y los campos de API son reales. La ruta local solicitada es “${id}”.`
          : `No se pudo verificar el proyecto “${id}” con la API. Esta vista solo contiene datos de demostración.`}
      </p>
    </PageLayout>
  );
}
