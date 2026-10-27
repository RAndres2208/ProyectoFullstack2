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
  type DetalleProyectoDemo,
} from "../../data/proyectoDetalleData";
import {
  proyectosData,
  type Proyecto,
} from "../../data/proyectosData";
import { useModoDemo } from "../../hooks/useModoDemo";
import { useProyectosApi } from "../../hooks/useProyectosApi";
import type {
  ErrorProyectos,
  ProyectoApi,
} from "../../services/proyectosApi";
import {
  formatearFecha,
  porcentaje,
} from "../../utils/format";
import styles from "./DetalleProyecto.module.css";

function tonoEstado(estado: string) {
  const normalizado = estado
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

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

  if (
    normalizado.includes("error") ||
    normalizado.includes("cancel")
  ) {
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

function EstadoCarga({ id }: { id: string }) {
  return (
    <PageLayout
      titulo="Detalle del proyecto"
      descripcion="Consultando la información del proyecto."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos"
      demo="DUOC UC · API"
    >
      <div className={ui.panel}>
        <div className={ui.cargando} role="status">
          <span className={ui.spinner} aria-hidden="true" />
          Consultando el proyecto {id} en Spring Boot...
        </div>
      </div>
    </PageLayout>
  );
}

function VistaError({
  error,
  onReintentar,
  onRenovarSesion,
  onActivarDemo,
  demoDisponible,
}: {
  error: ErrorProyectos | null;
  onReintentar: () => void;
  onRenovarSesion: () => void;
  onActivarDemo: () => void;
  demoDisponible: boolean;
}) {
  const esErrorSesion = error?.tipo === "sesion";

  return (
    <PageLayout
      titulo="No fue posible consultar el proyecto"
      descripcion="La API de Spring Boot no entregó una respuesta válida."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos"
      demo="DUOC UC · API"
    >
      <Aviso tono="peligro">
        <strong>
          {esErrorSesion
            ? "Sesión de Cognito expirada o inválida."
            : "Error de conexión con Spring Boot."}
        </strong>{" "}
        {error?.message ??
          "No fue posible consultar el proyecto en este momento."}
      </Aviso>

      <div className={ui.botonesFila}>
        <button
          type="button"
          className={`${ui.boton} ${ui.botonSecundario}`}
          onClick={onReintentar}
        >
          Reintentar consulta
        </button>

        {esErrorSesion && (
          <button
            type="button"
            className={`${ui.boton} ${ui.botonPrimario}`}
            onClick={onRenovarSesion}
          >
            Renovar sesión con Cognito
          </button>
        )}

        {demoDisponible && (
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={onActivarDemo}
          >
            Ver datos de demostración
          </button>
        )}

        <Link
          href="/proyectos"
          className={`${ui.boton} ${ui.botonSecundario}`}
        >
          Volver a proyectos
        </Link>
      </div>

      <p className={ui.metaTexto}>
        No se reemplazaron los datos reales por información local. El
        modo demostración solo se activa de forma explícita.
      </p>
    </PageLayout>
  );
}

function VistaNoEncontrado({
  id,
  esRutaNumerica,
  modoDemo,
  demoDisponible,
  onActivarDemo,
}: {
  id: string;
  esRutaNumerica: boolean;
  modoDemo: boolean;
  demoDisponible: boolean;
  onActivarDemo: () => void;
}) {
  if (modoDemo) {
    return (
      <PageLayout
        titulo="Proyecto no encontrado"
        descripcion="No existe una coincidencia en el catálogo de demostración."
        volverA="/proyectos"
        volverEtiqueta="Volver a proyectos"
        demo="DUOC UC · DEMO"
      >
        <div className={styles.estadoVacio}>
          <EstadoVacio
            titulo={`No encontramos “${id}” en la demostración`}
            descripcion="El identificador no existe en el catálogo local. No se consultó Spring Boot porque el modo demostración está activo."
            accion={
              <div className={ui.botonesFila}>
                <Link
                  href="/proyectos"
                  className={`${ui.boton} ${ui.botonPrimario}`}
                >
                  Volver a proyectos
                </Link>
              </div>
            }
          />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      titulo="Proyecto no encontrado"
      descripcion="No existe una coincidencia para este identificador."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos"
      demo="DUOC UC · API"
    >
      <div className={styles.estadoVacio}>
        <EstadoVacio
          titulo={
            esRutaNumerica
              ? `No encontramos el proyecto ${id}`
              : "Esta ruta no existe en la API"
          }
          descripcion={
            esRutaNumerica
              ? "Spring Boot respondió correctamente, pero no devolvió un proyecto con este identificador. No se muestran datos locales como reemplazo."
              : "La API de proyectos usa identificadores numéricos. Los identificadores con nombre pertenecen al modo demostración."
          }
          accion={
            <div className={ui.botonesFila}>
              <Link
                href="/proyectos"
                className={`${ui.boton} ${ui.botonPrimario}`}
              >
                Volver a proyectos
              </Link>

              {!esRutaNumerica && demoDisponible && (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonSecundario}`}
                  onClick={onActivarDemo}
                >
                  Activar modo demostración
                </button>
              )}
            </div>
          }
        />
      </div>
    </PageLayout>
  );
}

function VistaRutaDemo({
  id,
  demoDisponible,
  onActivarDemo,
  onDesactivarDemo,
}: {
  id: string;
  demoDisponible: boolean;
  onActivarDemo: () => void;
  onDesactivarDemo: () => void;
}) {
  return (
    <PageLayout
      titulo="Ruta de demostración"
      descripcion="Este identificador corresponde a datos locales de SyncPass."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos"
    >
      <Aviso tono="advertencia">
        <strong>El modo demostración está desactivado.</strong> La ruta
        “{id}” existe únicamente en el conjunto local de demostración y
        no fue consultada en Spring Boot.{" "}
        {demoDisponible
          ? "Actívalo de forma explícita para verla."
          : "El modo demostración está deshabilitado en esta compilación (VITE_ENABLE_DEMO_MODE)."}
      </Aviso>

      <div className={ui.botonesFila}>
        {demoDisponible && (
          <button
            type="button"
            className={`${ui.boton} ${ui.botonPrimario}`}
            onClick={onActivarDemo}
          >
            Activar modo demostración
          </button>
        )}

        <button
          type="button"
          className={`${ui.boton} ${ui.botonSecundario}`}
          onClick={onDesactivarDemo}
        >
          Mantener modo conectado
        </button>

        <Link
          href="/proyectos"
          className={`${ui.boton} ${ui.botonSecundario}`}
        >
          Volver a proyectos
        </Link>
      </div>
    </PageLayout>
  );
}

function VistaIdentificadorDemo({
  id,
  onDesactivarDemo,
}: {
  id: string;
  onDesactivarDemo: () => void;
}) {
  return (
    <PageLayout
      titulo="Proyecto de Spring Boot"
      descripcion="El identificador solicitado pertenece a la API real."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos"
    >
      <Aviso tono="info">
        <strong>Estás en modo demostración.</strong> El proyecto{" "}
        {id} es un identificador numérico de Spring Boot. El modo
        demostración no consulta la API, por lo que no se muestran datos
        reales ni locales para esta ruta.
      </Aviso>

      <div className={ui.botonesFila}>
        <button
          type="button"
          className={`${ui.boton} ${ui.botonPrimario}`}
          onClick={onDesactivarDemo}
        >
          Desactivar modo demostración
        </button>

        <Link
          href="/proyectos"
          className={`${ui.boton} ${ui.botonSecundario}`}
        >
          Volver a proyectos
        </Link>
      </div>
    </PageLayout>
  );
}

function PanelDescripcionDemo({
  demo,
  local,
}: {
  demo: DetalleProyectoDemo;
  local?: Proyecto;
}) {
  return (
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

      <p className={styles.descripcion}>{demo.descripcion}</p>

      <dl className={styles.datosDemo}>
        <div>
          <dt>Responsable</dt>
          <dd>{demo.responsable}</dd>
        </div>
        <div>
          <dt>Unidad vecinal</dt>
          <dd>{local?.unidadVecinal ?? demo.unidadVecinal}</dd>
        </div>
        <div>
          <dt>Sector</dt>
          <dd>{local?.sector ?? demo.sector}</dd>
        </div>
        <div>
          <dt>Categoría</dt>
          <dd>{local?.categoria ?? "No disponible"}</dd>
        </div>
        <div>
          <dt>Inicio</dt>
          <dd>{fechaDemo(demo.fechaInicio, local?.fechaInicio)}</dd>
        </div>
        <div>
          <dt>Término</dt>
          <dd>
            {fechaDemo(demo.fechaTermino, local?.fechaTermino)}
          </dd>
        </div>
      </dl>

      <h3 className={styles.subtitulo}>Objetivos</h3>
      <ul className={styles.objetivos}>
        {demo.objetivos.map((objetivo) => (
          <li key={objetivo}>{objetivo}</li>
        ))}
      </ul>
    </section>
  );
}

function PanelIndicadoresDemo({
  demo,
}: {
  demo: DetalleProyectoDemo;
}) {
  return (
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
        <Etiqueta tono="advertencia">Demostración</Etiqueta>
      </div>

      <div className={styles.indicadores}>
        <div>
          <strong>{demo.estadisticas.inscritos}</strong>
          <span>Inscripciones demo</span>
        </div>
        <div>
          <strong>{demo.estadisticas.asistencias}</strong>
          <span>Asistencias demo</span>
        </div>
        <div>
          <strong>{demo.estadisticas.encuestas}</strong>
          <span>Encuestas demo</span>
        </div>
        <div>
          <strong>{demo.estadisticas.quorumPromedio}%</strong>
          <span>Quórum promedio demo</span>
        </div>
      </div>

      <div className={ui.divisor} />

      <p className={ui.textoSuave}>
        Asistencia respecto de inscripciones:{" "}
        <strong>
          {porcentaje(
            demo.estadisticas.asistencias,
            demo.estadisticas.inscritos
          )}
          %
        </strong>
      </p>

      <p className={ui.metaTexto}>
        Estas cifras no provienen del backend y no deben interpretarse
        como resultados oficiales.
      </p>
    </section>
  );
}

function PanelEventosDemo({
  demo,
}: {
  demo: DetalleProyectoDemo;
}) {
  return (
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

      {demo.eventos.length > 0 ? (
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
                <th scope="col" className={ui.tablaNumero}>
                  Inscritos
                </th>
                <th scope="col" className={ui.tablaNumero}>
                  Asistentes
                </th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {demo.eventos.map((evento) => (
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
          descripcion="No hay actividades de demostración vinculadas a este proyecto."
        />
      )}
    </section>
  );
}

function ContenidoProyectoApi({
  proyecto,
  demo,
  local,
}: {
  proyecto: ProyectoApi;
  demo?: DetalleProyectoDemo;
  local?: Proyecto;
}) {
  return (
    <PageLayout
      titulo={proyecto.nombre}
      descripcion="Información del proyecto, participantes y actividades vinculadas."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos comunitarios"
      demo="DUOC UC · API"
    >
      <Aviso tono="exito">
        <strong>Datos reales de Spring Boot.</strong> El identificador,
        el nombre, el estado y la cantidad de participantes provienen de
        GET /api/proyectos. Las secciones marcadas como demostración son
        complementarias y no oficiales.
      </Aviso>

      <section className={styles.hero} aria-labelledby="proyecto-titulo">
        <div className={styles.heroPrincipal}>
          <span className={styles.heroIcono} aria-hidden="true">
            ▤
          </span>

          <div className={styles.heroTexto}>
            <div className={styles.heroEtiquetas}>
              <Etiqueta tono="exito">Datos de API</Etiqueta>
            </div>

            <h2 id="proyecto-titulo">{proyecto.nombre}</h2>

            <p>Proyecto entregado por el servicio de proyectos.</p>
          </div>
        </div>

        <div className={styles.heroEstado}>
          <span className={ui.metaTexto}>Estado</span>
          <Etiqueta tono={tonoEstado(proyecto.estado)}>
            {proyecto.estado}
          </Etiqueta>
        </div>
      </section>

      <section
        className={ui.resumenGrid}
        aria-label="Datos del proyecto entregados por la API"
      >
        <TarjetaResumen
          etiqueta="Identificador API"
          valor={proyecto.id}
          detalle="Campo real de SyncPass API"
          icono="#"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Participantes"
          valor={proyecto.participantes.toLocaleString("es-CL")}
          detalle="Campo real de SyncPass API"
          icono="♧"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Estado API"
          valor={proyecto.estado}
          detalle="Campo real de SyncPass API"
          icono="◈"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Origen"
          valor="Spring Boot"
          detalle="Consulta autenticada con Cognito"
          icono="↗"
          tono="neutral"
        />
      </section>

      {demo ? (
        <>
          <div className={styles.paneles}>
            <PanelDescripcionDemo demo={demo} local={local} />
            <PanelIndicadoresDemo demo={demo} />
          </div>

          <PanelEventosDemo demo={demo} />
        </>
      ) : (
        <>
          <Aviso tono="info">
            <strong>Información complementaria no disponible.</strong>{" "}
            La API actual solo expone identificador, nombre, estado y
            participantes. No hay descripción, fechas, responsable,
            unidad vecinal ni métricas adicionales para este proyecto.
          </Aviso>

          <div className={styles.paneles}>
            <section className={ui.panel}>
              <EstadoVacio
                titulo="Sin datos complementarios"
                descripcion="SyncPass no inventa información que el backend no entrega. Cuando el contrato incluya más campos, esta sección podrá mostrarlos."
              />
            </section>

            <section className={ui.panel}>
              <EstadoVacio
                titulo="Sin actividades vinculadas"
                descripcion="El endpoint actual de proyectos no devuelve eventos asociados."
              />
            </section>
          </div>
        </>
      )}

      <p className={ui.metaTexto}>
        El identificador {proyecto.id} y los campos de API son reales.
        La información marcada como “Demostración” no proviene del
        backend y no debe interpretarse como oficial.
      </p>
    </PageLayout>
  );
}

function ContenidoProyectoDemo({
  demo,
  local,
  onDesactivarDemo,
}: {
  demo: DetalleProyectoDemo;
  local?: Proyecto;
  onDesactivarDemo: () => void;
}) {
  const estado = local?.estado ?? "No disponible";

  return (
    <PageLayout
      titulo={demo.nombre}
      descripcion="Vista de demostración con datos locales de SyncPass."
      volverA="/proyectos"
      volverEtiqueta="Volver a proyectos comunitarios"
    >
      <AvisoDemo>
        <strong>Modo demostración activo.</strong> Toda la información
        de esta vista es local y no proviene de Spring Boot. No se
        consultó la API mientras este modo está activo.
      </AvisoDemo>

      <section className={styles.hero} aria-labelledby="proyecto-titulo">
        <div className={styles.heroPrincipal}>
          <span className={styles.heroIcono} aria-hidden="true">
            ▤
          </span>

          <div className={styles.heroTexto}>
            <div className={styles.heroEtiquetas}>
              <Etiqueta tono="advertencia">Demostración</Etiqueta>
              {local?.categoria && (
                <Etiqueta tono="info">{local.categoria}</Etiqueta>
              )}
            </div>

            <h2 id="proyecto-titulo">{demo.nombre}</h2>

            <p>Datos locales de demostración, sin consulta al backend.</p>
          </div>
        </div>

        <div className={styles.heroEstado}>
          <span className={ui.metaTexto}>Estado local</span>
          <Etiqueta tono={tonoEstado(estado)}>{estado}</Etiqueta>
        </div>
      </section>

      <section
        className={ui.resumenGrid}
        aria-label="Datos de demostración"
      >
        <TarjetaResumen
          etiqueta="Origen"
          valor="Datos locales"
          detalle="Modo demostración activo"
          icono="◈"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Inscripciones demo"
          valor={demo.estadisticas.inscritos}
          detalle="Cifra de demostración, no de la API"
          icono="♧"
          tono="neutral"
        />
        <TarjetaResumen
          etiqueta="Estado local"
          valor={estado}
          detalle="Dato de demostración"
          icono="◷"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Identificador demo"
          valor={demo.proyectoId}
          detalle="Ruta local, no identificador de API"
          icono="#"
          tono="neutral"
        />
      </section>

      <div className={ui.botonesFila}>
        <button
          type="button"
          className={`${ui.boton} ${ui.botonSecundario}`}
          onClick={onDesactivarDemo}
        >
          Volver al modo conectado
        </button>
      </div>

      <div className={styles.paneles}>
        <PanelDescripcionDemo demo={demo} local={local} />
        <PanelIndicadoresDemo demo={demo} />
      </div>

      <PanelEventosDemo demo={demo} />

      <p className={ui.metaTexto}>
        Ningún dato de esta vista proviene de Spring Boot. El
        identificador “{demo.proyectoId}” es una ruta local de
        demostración.
      </p>
    </PageLayout>
  );
}

export function DetalleProyecto() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "";
  const auth = useAuth();
  const accessToken = auth.user?.access_token;
  const { modoDemo, cambiarModoDemo, demoDisponible } = useModoDemo();

  const esRutaNumerica = /^\d+$/.test(id);
  const apiHabilitada = !modoDemo && esRutaNumerica;

  const {
    proyectos,
    estado: estadoApi,
    error: errorApi,
    recargar,
  } = useProyectosApi(apiHabilitada, accessToken);

  const proyectoLocal = proyectosData.find(
    (proyecto) => proyecto.id === id
  );

  const proyectoApi =
    estadoApi === "exito" && esRutaNumerica
      ? proyectos.find(
          (proyecto) => String(proyecto.id) === id
        )
      : undefined;

  const proyectoDemo = buscarDetalleProyectoDemo(
    id,
    proyectoApi?.nombre ?? proyectoLocal?.nombre
  );

  const cargando =
    apiHabilitada &&
    (estadoApi === "inactivo" || estadoApi === "cargando");

  if (modoDemo) {
    if (proyectoDemo) {
      return (
        <ContenidoProyectoDemo
          demo={proyectoDemo}
          local={proyectoLocal}
          onDesactivarDemo={() => cambiarModoDemo(false)}
        />
      );
    }

    if (esRutaNumerica) {
      return (
        <VistaIdentificadorDemo
          id={id}
          onDesactivarDemo={() => cambiarModoDemo(false)}
        />
      );
    }

    return (
      <VistaNoEncontrado
        id={id}
        esRutaNumerica={false}
        modoDemo
        demoDisponible={demoDisponible}
        onActivarDemo={() => cambiarModoDemo(true)}
      />
    );
  }

  if (!esRutaNumerica) {
    if (proyectoDemo) {
      return (
        <VistaRutaDemo
          id={id}
          demoDisponible={demoDisponible}
          onActivarDemo={() => cambiarModoDemo(true)}
          onDesactivarDemo={() => cambiarModoDemo(false)}
        />
      );
    }

    return (
      <VistaNoEncontrado
        id={id}
        esRutaNumerica={false}
        modoDemo={false}
        demoDisponible={demoDisponible}
        onActivarDemo={() => cambiarModoDemo(true)}
      />
    );
  }

  if (cargando) {
    return <EstadoCarga id={id} />;
  }

  if (estadoApi === "error") {
    return (
      <VistaError
        error={errorApi}
        onReintentar={recargar}
        onRenovarSesion={() => void auth.signinRedirect()}
        onActivarDemo={() => cambiarModoDemo(true)}
        demoDisponible={demoDisponible}
      />
    );
  }

  if (!proyectoApi) {
    return (
      <VistaNoEncontrado
        id={id}
        esRutaNumerica
        modoDemo={false}
        demoDisponible={demoDisponible}
        onActivarDemo={() => cambiarModoDemo(true)}
      />
    );
  }

  return (
    <ContenidoProyectoApi
      proyecto={proyectoApi}
      demo={proyectoDemo}
      local={proyectoLocal}
    />
  );
}
