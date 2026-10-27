import { useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import { Link } from "wouter";
import { Menu } from "../../components/menu/Menu";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  proyectosData,
  type Proyecto,
} from "../../data/proyectosData";
import { useModoDemo } from "../../hooks/useModoDemo";
import { useProyectosApi } from "../../hooks/useProyectosApi";
import { normalizarTexto } from "../../utils/format";
import styles from "./Proyectos.module.css";

type Filtro = "Todos" | "En ejecución" | "Finalizados";

const filtros: Filtro[] = [
  "Todos",
  "En ejecución",
  "Finalizados",
];

type ProyectoVista = {
  clave: string;
  idRuta: string;
  nombre: string;
  estado: string;
  origen: "api" | "demo";
  participantes: number | null;
  categoria?: string;
  unidadVecinal?: string;
  sector?: string;
  fechas?: string;
  informacionEventos?: string;
  icono?: Proyecto["icono"];
};

function clasificarEstado(
  estado: string
): "ejecucion" | "finalizado" | "otro" {
  const normalizado = normalizarTexto(estado);

  if (
    normalizado.includes("final") ||
    normalizado.includes("cerrad") ||
    normalizado.includes("complet")
  ) {
    return "finalizado";
  }

  // "inactivo" contiene la cadena "activ", por eso se descarta primero.
  if (
    normalizado.includes("inactiv") ||
    normalizado.includes("cancel") ||
    normalizado.includes("suspend")
  ) {
    return "otro";
  }

  if (
    normalizado.includes("ejec") ||
    normalizado.includes("activ") ||
    normalizado.includes("curso") ||
    normalizado.includes("progres") ||
    normalizado.includes("abiert")
  ) {
    return "ejecucion";
  }

  return "otro";
}

function IconoProyecto({
  tipo,
}: {
  tipo?: Proyecto["icono"];
}) {
  if (tipo === "computador") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="4" width="16" height="12" rx="2" />
        <path d="M2 20h20l-2-4H4l-2 4Z" />
      </svg>
    );
  }

  if (tipo === "planta") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21V11" />
        <path d="M12 16c-5 0-8-3-8-8 5 0 8 3 8 8Z" />
        <path d="M12 12c0-5 3-8 8-8 0 5-3 8-8 8Z" />
        <path d="M5 21h14" />
      </svg>
    );
  }

  if (tipo === "salud") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 5.5a5.5 5.5 0 0 0-8.5-.6 5.5 5.5 0 0 0-8.5.6c-3 4 0 8 8.5 15 8.5-7 11.5-11 8.5-15Z" />
        <path d="M3 12h5l2-3 3 7 2-4h6" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 20V9l8-5 8 5v11" />
      <path d="M9 20v-6h6v6" />
      <path d="M2 20h20" />
    </svg>
  );
}

function IconoBuscar() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </svg>
  );
}

function TarjetaProyecto({
  proyecto,
}: {
  proyecto: ProyectoVista;
}) {
  const clasificacion = clasificarEstado(proyecto.estado);
  const estadoClase =
    clasificacion === "ejecucion"
      ? styles.estadoEjecucion
      : clasificacion === "finalizado"
        ? styles.estadoFinalizado
        : styles.estadoProgramado;

  return (
    <Link
      href={`/proyectos/${proyecto.idRuta}`}
      className={styles.tarjeta}
      aria-label={`Ver proyecto ${proyecto.nombre}`}
    >
      <div className={styles.tarjetaEncabezado}>
        <span className={styles.iconoProyecto}>
          <IconoProyecto tipo={proyecto.icono} />
        </span>

        <div className={styles.nombreGrupo}>
          <div className={styles.tarjetaEtiquetas}>
            <Etiqueta
              tono={proyecto.origen === "api" ? "exito" : "advertencia"}
            >
              {proyecto.origen === "api" ? "API" : "Demostración"}
            </Etiqueta>
          </div>

          <h2>{proyecto.nombre}</h2>
          <p>
            {proyecto.origen === "api"
              ? "Datos entregados por Spring Boot"
              : proyecto.categoria ?? "Proyecto de demostración"}
          </p>
        </div>

        <span className={styles.flecha} aria-hidden="true">
          ›
        </span>
      </div>

      {proyecto.origen === "demo" && (
        <>
          <p className={styles.ubicacion}>
            {proyecto.unidadVecinal} · {proyecto.sector}
          </p>
          <p className={styles.fechas}>{proyecto.fechas}</p>
        </>
      )}

      <div className={styles.tarjetaPie}>
        <span className={`${styles.estado} ${estadoClase}`}>
          <span className={styles.estadoPunto} aria-hidden="true" />
          {proyecto.estado}
        </span>

        {proyecto.origen === "api" ? (
          <span className={styles.participantes}>
            <span aria-hidden="true">♧</span>{" "}
            <strong>{proyecto.participantes ?? "—"}</strong>{" "}
            participantes
          </span>
        ) : (
          <span className={styles.eventos}>
            {proyecto.informacionEventos}
          </span>
        )}
      </div>
    </Link>
  );
}

export function Proyectos() {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;
  const { modoDemo, cambiarModoDemo, demoDisponible } = useModoDemo();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  const {
    proyectos,
    estado: estadoApi,
    error: errorApi,
    recargar,
  } = useProyectosApi(!modoDemo, accessToken);

  const proyectosDemoVista = useMemo<ProyectoVista[]>(
    () =>
      proyectosData.map((proyecto) => ({
        clave: `demo-${proyecto.id}`,
        idRuta: proyecto.id,
        nombre: proyecto.nombre,
        estado: proyecto.estado,
        origen: "demo",
        participantes: null,
        categoria: proyecto.categoria,
        unidadVecinal: proyecto.unidadVecinal,
        sector: proyecto.sector,
        fechas: `${proyecto.fechaInicio} – ${proyecto.fechaTermino}`,
        informacionEventos: proyecto.informacionEventos,
        icono: proyecto.icono,
      })),
    []
  );

  const proyectosApiVista = useMemo<ProyectoVista[]>(
    () =>
      proyectos.map((proyecto) => ({
        clave: `api-${proyecto.id}`,
        idRuta: String(proyecto.id),
        nombre: proyecto.nombre,
        estado: proyecto.estado,
        origen: "api",
        participantes: proyecto.participantes,
      })),
    [proyectos]
  );

  const proyectosFuente = modoDemo
    ? proyectosDemoVista
    : proyectosApiVista;

  const proyectosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return proyectosFuente.filter((proyecto) => {
      const contenido = normalizarTexto(
        [
          proyecto.nombre,
          proyecto.estado,
          proyecto.categoria ?? "",
          proyecto.unidadVecinal ?? "",
          proyecto.sector ?? "",
        ].join(" ")
      );

      const coincideBusqueda =
        !texto || contenido.includes(texto);

      const clasificacion = clasificarEstado(proyecto.estado);

      const coincideFiltro =
        filtro === "Todos" ||
        (filtro === "En ejecución" &&
          clasificacion === "ejecucion") ||
        (filtro === "Finalizados" &&
          clasificacion === "finalizado");

      return coincideBusqueda && coincideFiltro;
    });
  }, [proyectosFuente, busqueda, filtro]);

  const cargandoApi =
    !modoDemo &&
    (estadoApi === "inactivo" || estadoApi === "cargando");

  const hayErrorApi = !modoDemo && estadoApi === "error";
  const listoParaMostrar =
    modoDemo || estadoApi === "exito";

  return (
    <div className={styles.layout}>
      <Menu />

      <div className={styles.workspace}>
        <div className={styles.contenedor}>
          <header className={styles.encabezado}>
            <Link
              href="/dashboard"
              className={styles.volver}
              aria-label="Volver al panel principal"
            >
              ←
            </Link>

            <h1>Proyectos comunitarios</h1>

            <span
              className={styles.menuDecorativo}
              aria-hidden="true"
            >
              ⋮
            </span>
          </header>

          <main className={styles.contenido}>
            <div className={styles.institucion}>
              <span className={styles.rol}>
                ◈ Docente · Coordinador
              </span>

              <span className={styles.demo}>
                {modoDemo ? "DUOC UC · DEMO" : "DUOC UC · API"}
              </span>
            </div>

            <section
              className={styles.modoControl}
              aria-labelledby="modo-datos-titulo"
            >
              <div className={styles.modoControlTexto}>
                <strong id="modo-datos-titulo">
                  {modoDemo ? "Modo demostración" : "Modo conectado"}
                </strong>
                <p>
                  {modoDemo
                    ? "Las tarjetas son datos locales identificados como demostración. No se consulta Spring Boot."
                    : "Las tarjetas se obtienen de GET /api/proyectos con tu sesión de Cognito."}
                </p>
              </div>

              {demoDisponible ? (
                <button
                  type="button"
                  role="switch"
                  aria-checked={modoDemo}
                  aria-label={
                    modoDemo
                      ? "Desactivar modo demostración"
                      : "Activar modo demostración"
                  }
                  className={`${styles.switch} ${
                    modoDemo ? styles.switchActivo : ""
                  }`}
                  onClick={() => cambiarModoDemo(!modoDemo)}
                >
                  <span className={styles.switchPista} aria-hidden="true">
                    <span className={styles.switchPunto} />
                  </span>
                  <span>{modoDemo ? "Demo" : "API"}</span>
                </button>
              ) : (
                <Etiqueta tono="neutral">
                  Demo no disponible
                </Etiqueta>
              )}
            </section>

            {modoDemo && (
              <AvisoDemo>
                <strong>Modo demostración activo.</strong> Este listado
                usa datos locales de SyncPass y no proviene de Spring
                Boot. Para volver a los datos reales, cambia el
                interruptor a “API”.
              </AvisoDemo>
            )}

            {cargandoApi && (
              <div className={ui.panel}>
                <div className={ui.cargando} role="status">
                  <span className={ui.spinner} aria-hidden="true" />
                  Consultando proyectos en Spring Boot...
                </div>
              </div>
            )}

            {hayErrorApi && (
              <>
                <Aviso tono="peligro">
                  <strong>No fue posible cargar los proyectos.</strong>{" "}
                  {errorApi?.message}
                </Aviso>

                <div className={styles.accionesApi}>
                  <button
                    type="button"
                    className={`${ui.boton} ${ui.botonSecundario}`}
                    onClick={recargar}
                  >
                    Reintentar consulta
                  </button>

                  {errorApi?.tipo === "sesion" && (
                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonPrimario}`}
                      onClick={() => void auth.signinRedirect()}
                    >
                      Renovar sesión con Cognito
                    </button>
                  )}

                  {demoDisponible && (
                    <button
                      type="button"
                      className={`${ui.boton} ${ui.botonSecundario}`}
                      onClick={() => cambiarModoDemo(true)}
                    >
                      Usar modo demostración
                    </button>
                  )}
                </div>

                <p className={ui.metaTexto}>
                  No se reemplazaron los datos reales por información
                  local. El modo demostración solo se activa de forma
                  explícita.
                </p>
              </>
            )}

            {listoParaMostrar && (
              <>
                <div className={styles.buscador}>
                  <IconoBuscar />

                  <input
                    type="search"
                    value={busqueda}
                    onChange={(evento) =>
                      setBusqueda(evento.target.value)
                    }
                    placeholder={
                      modoDemo
                        ? "Buscar proyecto, unidad vecinal o sector"
                        : "Buscar proyecto por nombre o estado"
                    }
                    aria-label="Buscar proyectos"
                  />
                </div>

                <div
                  className={styles.filtros}
                  role="group"
                  aria-label="Filtrar proyectos por estado"
                >
                  {filtros.map((opcion) => (
                    <button
                      key={opcion}
                      type="button"
                      className={`${styles.filtro} ${
                        filtro === opcion
                          ? styles.filtroActivo
                          : ""
                      }`}
                      onClick={() => setFiltro(opcion)}
                      aria-pressed={filtro === opcion}
                    >
                      {opcion}
                    </button>
                  ))}
                </div>

                <p className={styles.resumen} role="status">
                  {proyectosFiltrados.length} de{" "}
                  {proyectosFuente.length}{" "}
                  {proyectosFuente.length === 1
                    ? "proyecto"
                    : "proyectos"}{" "}
                  · {modoDemo ? "Demostración" : "Spring Boot"}
                </p>

                {!modoDemo && (
                  <p className={ui.metaTexto}>
                    La API entrega nombre, estado y participantes. Los
                    campos que no están en el contrato no se inventan.
                  </p>
                )}

                {proyectosFuente.length === 0 ? (
                  <EstadoVacio
                    titulo={
                      modoDemo
                        ? "No hay proyectos de demostración"
                        : "El servidor no devolvió proyectos"
                    }
                    descripcion={
                      modoDemo
                        ? "El catálogo local de demostración está vacío. Desactiva el modo demostración para consultar Spring Boot."
                        : "Spring Boot respondió correctamente, pero el listado está vacío. No se muestran datos locales automáticamente."
                    }
                    accion={
                      modoDemo ? (
                        <button
                          type="button"
                          className={`${ui.boton} ${ui.botonSecundario}`}
                          onClick={() => cambiarModoDemo(false)}
                        >
                          Volver al modo conectado
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={`${ui.boton} ${ui.botonSecundario}`}
                          onClick={recargar}
                        >
                          Volver a consultar
                        </button>
                      )
                    }
                  />
                ) : proyectosFiltrados.length > 0 ? (
                  <section
                    className={styles.lista}
                    aria-label="Listado de proyectos"
                  >
                    {proyectosFiltrados.map((proyecto) => (
                      <TarjetaProyecto
                        key={proyecto.clave}
                        proyecto={proyecto}
                      />
                    ))}
                  </section>
                ) : (
                  <div className={styles.sinResultados}>
                    <h2>No encontramos proyectos</h2>

                    <p>
                      Prueba con otro término o cambia el filtro.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setBusqueda("");
                        setFiltro("Todos");
                      }}
                    >
                      Limpiar búsqueda
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
