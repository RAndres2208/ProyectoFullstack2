import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
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
import { useParticipantesApi } from "../../hooks/useParticipantesApi";
import { useProyectosApi } from "../../hooks/useProyectosApi";
import {
  actualizarParticipanteApi,
  crearParticipanteApi,
  eliminarParticipanteApi,
  ErrorParticipantes,
  type ParticipanteApi,
  type ParticipanteSolicitud,
} from "../../services/participantesApi";
import { normalizarTexto } from "../../utils/format";
import styles from "./Participantes.module.css";

type FormularioParticipanteAdmin = {
  nombre: string;
  correo: string;
  proyectoId: string;
};

type ErroresFormularioAdmin = Partial<
  Record<keyof FormularioParticipanteAdmin, string>
>;

type AccionApi = "listar" | "crear" | "actualizar" | "eliminar";

const TAMANO_PAGINA = 8;
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const formularioInicial: FormularioParticipanteAdmin = {
  nombre: "",
  correo: "",
  proyectoId: "",
};

function convertirError(fallo: unknown): ErrorParticipantes {
  if (fallo instanceof ErrorParticipantes) {
    return fallo;
  }

  return new ErrorParticipantes(
    "red",
    "No fue posible completar la operación con participantes."
  );
}

function mensajeDeError(
  error: ErrorParticipantes,
  accion: AccionApi
): string {
  const mensaje = error.message;

  switch (error.tipo) {
    case "permisos":
      return `${mensaje} La operación requiere una cuenta del grupo administrador de Cognito.`;
    case "sesion":
      return `${mensaje} Vuelve a iniciar sesión para continuar.`;
    case "red":
      return `${mensaje} Revisa tu conexión y que VITE_API_URL apunte al backend disponible.`;
    case "solicitud":
      return `${mensaje} Revisa el nombre, el correo y el proyecto seleccionado.`;
    case "no-encontrado":
      return accion === "actualizar" || accion === "eliminar"
        ? "El participante ya no existe en el servidor. Se actualizará el listado."
        : mensaje;
    case "cancelado":
      return "";
    default:
      return mensaje;
  }
}

export function ParticipantesAdmin() {
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

  const {
    participantes,
    estado: estadoParticipantes,
    error: errorParticipantes,
    recargar: recargarParticipantes,
  } = useParticipantesApi(esAdministrador, accessToken);

  const cargandoListado =
    estadoParticipantes === "inactivo" ||
    estadoParticipantes === "cargando";
  const errorListado = errorParticipantes
    ? mensajeDeError(errorParticipantes, "listar")
    : "";

  const [busqueda, setBusqueda] = useState("");
  const [filtroProyecto, setFiltroProyecto] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [idDetalle, setIdDetalle] = useState<number | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [participanteEditando, setParticipanteEditando] =
    useState<ParticipanteApi | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioParticipanteAdmin>(formularioInicial);
  const [erroresFormulario, setErroresFormulario] =
    useState<ErroresFormularioAdmin>({});
  const [eliminando, setEliminando] = useState<ParticipanteApi | null>(
    null
  );

  const [guardando, setGuardando] = useState(false);
  const [procesandoEliminacion, setProcesandoEliminacion] =
    useState(false);
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

  const proyectosPorId = useMemo(
    () => new Map(proyectos.map((proyecto) => [proyecto.id, proyecto])),
    [proyectos]
  );

  const proyectosCargando =
    estadoProyectos === "inactivo" || estadoProyectos === "cargando";
  const proyectosConError = estadoProyectos === "error";
  const sinProyectos =
    estadoProyectos === "exito" && proyectos.length === 0;
  const puedeRegistrar =
    esAdministrador && Boolean(accessToken) && proyectos.length > 0;

  const filtroProyectoActivo =
    filtroProyecto !== "Todos" &&
    proyectos.some(
      (proyecto) => String(proyecto.id) === filtroProyecto
    )
      ? filtroProyecto
      : "Todos";

  function nombreProyecto(proyectoId: number): string {
    return (
      proyectosPorId.get(proyectoId)?.nombre ?? `Proyecto #${proyectoId}`
    );
  }

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return participantes.filter((participante) => {
      const proyecto = proyectosPorId.get(participante.proyectoId);

      const contenido = normalizarTexto(
        [
          participante.nombre,
          participante.email,
          String(participante.id),
          proyecto?.nombre ?? "",
        ].join(" ")
      );

      const coincideBusqueda = !texto || contenido.includes(texto);

      const coincideProyecto =
        filtroProyectoActivo === "Todos" ||
        String(participante.proyectoId) === filtroProyectoActivo;

      return coincideBusqueda && coincideProyecto;
    });
  }, [
    participantes,
    busqueda,
    filtroProyectoActivo,
    proyectosPorId,
  ]);

  const resumen = useMemo(() => {
    const proyectosConParticipantes = new Set(
      participantes.map((participante) => participante.proyectoId)
    );

    const disponibles = new Set(
      proyectos.map((proyecto) => proyecto.id)
    );

    const conProyectoDisponible = Array.from(
      proyectosConParticipantes
    ).filter((id) => disponibles.has(id)).length;

    return {
      total: participantes.length,
      conParticipantes: conProyectoDisponible,
      sinParticipantes: Math.max(
        0,
        proyectos.length - conProyectoDisponible
      ),
      disponibles: proyectos.length,
    };
  }, [participantes, proyectos]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / TAMANO_PAGINA)
  );
  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  const participanteDetalle =
    idDetalle === null
      ? null
      : participantes.find(
          (participante) => participante.id === idDetalle
        ) ?? null;

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroProyecto("Todos");
    setPagina(1);
  }

  function abrirNuevo() {
    if (!puedeRegistrar) {
      setErrorOperacion(
        proyectos.length === 0
          ? "No hay proyectos reales disponibles. No se puede registrar un participante hasta que el servidor devuelva al menos un proyecto."
          : "No hay una sesión administrativa autorizada para registrar participantes."
      );
      return;
    }

    setMensaje("");
    setErrorOperacion("");
    setParticipanteEditando(null);
    setFormulario({
      ...formularioInicial,
      proyectoId:
        proyectos.length === 1 ? String(proyectos[0].id) : "",
    });
    setErroresFormulario({});
    setFormularioAbierto(true);
  }

  function abrirEdicion(participante: ParticipanteApi) {
    if (proyectos.length === 0) {
      setErrorOperacion(
        "No hay proyectos reales disponibles. No se puede editar un participante sin un proyecto válido."
      );
      return;
    }

    setMensaje("");
    setErrorOperacion("");
    setParticipanteEditando(participante);
    setFormulario({
      nombre: participante.nombre,
      correo: participante.email,
      proyectoId: proyectosPorId.has(participante.proyectoId)
        ? String(participante.proyectoId)
        : "",
    });
    setErroresFormulario({});
    setIdDetalle(null);
    setFormularioAbierto(true);
  }

  function pedirEliminar(participante: ParticipanteApi) {
    setMensaje("");
    setErrorOperacion("");
    setIdDetalle(null);
    setEliminando(participante);
  }

  function validarFormulario(): ErroresFormularioAdmin {
    const errores: ErroresFormularioAdmin = {};
    const nombre = formulario.nombre.trim();
    const correo = formulario.correo.trim().toLowerCase();

    if (nombre.length < 3) {
      errores.nombre =
        "Ingresa el nombre completo (mínimo 3 caracteres).";
    }

    if (!PATRON_EMAIL.test(correo)) {
      errores.correo = "Ingresa un correo electrónico válido.";
    } else {
      const repetido = participantes.some(
        (participante) =>
          participante.email.toLowerCase() === correo &&
          participante.id !== participanteEditando?.id
      );

      if (repetido) {
        errores.correo =
          "Ya existe un participante registrado con este correo.";
      }
    }

    const proyectoId = Number(formulario.proyectoId);

    if (
      !Number.isInteger(proyectoId) ||
      proyectoId <= 0 ||
      !proyectosPorId.has(proyectoId)
    ) {
      errores.proyectoId =
        proyectos.length === 0
          ? "No hay proyectos reales disponibles. Recarga el listado antes de guardar."
          : "Selecciona un proyecto válido del listado real.";
    }

    return errores;
  }

  async function guardarParticipante(
    evento: FormEvent<HTMLFormElement>
  ) {
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

    if (proyectos.length === 0) {
      setErrorOperacion(
        "No hay proyectos reales disponibles. El registro y la edición permanecen deshabilitados."
      );
      return;
    }

    const errores = validarFormulario();

    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }

    const datos: ParticipanteSolicitud = {
      nombre: formulario.nombre.trim(),
      email: formulario.correo.trim().toLowerCase(),
      proyectoId: Number(formulario.proyectoId),
    };

    const estabaEditando = Boolean(participanteEditando);

    operacionRef.current = true;
    setGuardando(true);

    try {
      if (participanteEditando) {
        const actualizado = await actualizarParticipanteApi(
          participanteEditando.id,
          datos,
          accessToken
        );

        if (!montadoRef.current) {
          return;
        }

        setMensaje(
          `Participante "${actualizado.nombre}" actualizado en el servidor.`
        );
      } else {
        const creado = await crearParticipanteApi(
          datos,
          accessToken
        );

        if (!montadoRef.current) {
          return;
        }

        setMensaje(
          `Participante "${creado.nombre}" registrado en el servidor.`
        );
      }

      setFormularioAbierto(false);
      setParticipanteEditando(null);
      setErroresFormulario({});
      setPagina(1);
      recargarParticipantes();
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const error = convertirError(fallo);

      setErrorOperacion(
        mensajeDeError(
          error,
          estabaEditando ? "actualizar" : "crear"
        )
      );

      if (error.tipo === "no-encontrado") {
        recargarParticipantes();
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

    const participante = eliminando;

    operacionRef.current = true;
    setProcesandoEliminacion(true);

    try {
      await eliminarParticipanteApi(
        participante.id,
        accessToken
      );

      if (!montadoRef.current) {
        return;
      }

      setMensaje(
        `Participante "${participante.nombre}" eliminado del servidor.`
      );
      setEliminando(null);
      recargarParticipantes();
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const error = convertirError(fallo);

      setErrorOperacion(mensajeDeError(error, "eliminar"));

      if (error.tipo === "no-encontrado") {
        setEliminando(null);
        recargarParticipantes();
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
        titulo="Participantes"
        descripcion="Administración de participantes vinculados a proyectos reales."
        volverA="/administrador/dashboard"
        volverEtiqueta="Volver al panel de administración"
        rol="◈ Administrador"
        demo="DUOC UC · ADMINISTRACIÓN"
      >
        <Aviso tono="peligro">
          <strong>Acceso restringido.</strong> La administración de
          participantes requiere una sesión de Cognito con el grupo{" "}
          <strong>administrador</strong>. El backend vuelve a validar
          los permisos en cada operación.
        </Aviso>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      titulo="Participantes"
      descripcion="Administración de participantes vinculados a proyectos reales."
      volverA="/administrador/dashboard"
      volverEtiqueta="Volver al panel de administración"
      rol="◈ Administrador"
      demo="DUOC UC · ADMINISTRACIÓN"
    >
      <Aviso tono="info">
        <strong>Modo administrador real.</strong> El listado se obtiene
        de <strong>GET /api/participantes</strong> y las altas,
        ediciones y eliminaciones usan POST, PUT y DELETE con el token
        de Cognito. Esta vista no utiliza datos de demostración.
      </Aviso>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de participantes reales"
      >
        <TarjetaResumen
          etiqueta="Total"
          valor={resumen.total}
          detalle="Registros devueltos por la API"
          icono="♧"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Con participantes"
          valor={resumen.conParticipantes}
          detalle="Proyectos con al menos un participante"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Sin participantes"
          valor={resumen.sinParticipantes}
          detalle="Proyectos reales sin participantes"
          icono="◌"
          tono="neutral"
        />
        <TarjetaResumen
          etiqueta="Proyectos"
          valor={resumen.disponibles}
          detalle="Proyectos disponibles en el backend"
          icono="▤"
          tono="advertencia"
        />
      </section>

      {proyectosCargando && (
        <div className={ui.cargando} role="status">
          <span className={ui.spinner} aria-hidden="true" />
          Consultando los proyectos reales en la API...
        </div>
      )}

      {proyectosConError && (
        <Aviso tono="peligro">
          <strong>No fue posible cargar los proyectos.</strong>{" "}
          {errorProyectos?.message ??
            "Spring Boot no devolvió el listado de proyectos."}{" "}
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
            onClick={recargarProyectos}
          >
            Reintentar proyectos
          </button>
        </Aviso>
      )}

      {sinProyectos && (
        <Aviso tono="advertencia">
          <strong>El servidor no devolvió proyectos.</strong> El registro
          y la edición de participantes quedan deshabilitados hasta que
          exista al menos un proyecto válido. No se usan los proyectos de
          demostración en esta vista.
        </Aviso>
      )}

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}

      {errorOperacion && (
        <Aviso tono="peligro">{errorOperacion}</Aviso>
      )}

      <section
        className={ui.panel}
        aria-labelledby="participantes-admin-listado"
      >
        <div className={ui.panelCabecera}>
          <div>
            <h2
              id="participantes-admin-listado"
              className={ui.panelTitulo}
            >
              Listado de participantes
            </h2>
            <p className={ui.panelDescripcion}>
              Busca, filtra y administra los registros reales del
              backend.
            </p>
          </div>

          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={recargarParticipantes}
              disabled={cargandoListado}
            >
              ↻ Actualizar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={abrirNuevo}
              disabled={!puedeRegistrar || guardando}
              title={
                puedeRegistrar
                  ? "Registrar un participante real"
                  : "Requiere una sesión administrativa y al menos un proyecto real"
              }
            >
              + Agregar participante
            </button>
          </div>
        </div>

        <div className={`${styles.filtros} ${styles.filtrosAdmin}`}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-participante-admin"
              etiqueta="Buscar participante real"
              valor={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, correo o identificador"
            />
          </div>

          <div className={ui.campo}>
            <label
              className={ui.campoEtiqueta}
              htmlFor="filtro-proyecto-admin"
            >
              Proyecto
            </label>
            <select
              id="filtro-proyecto-admin"
              value={filtroProyectoActivo}
              onChange={(evento) => {
                setFiltroProyecto(evento.target.value);
                setPagina(1);
              }}
              disabled={proyectos.length === 0}
            >
              <option value="Todos">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id} value={proyecto.id}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={ui.resultadoCabecera}>
          <p className={ui.resultadoConteo} role="status">
            {filtrados.length}{" "}
            {filtrados.length === 1
              ? "participante encontrado"
              : "participantes encontrados"}{" "}
            de {participantes.length}
          </p>

          {(busqueda || filtroProyectoActivo !== "Todos") && (
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
            <strong>No fue posible actualizar el listado.</strong>{" "}
            {errorListado}{" "}
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={recargarParticipantes}
            >
              Reintentar
            </button>
          </Aviso>
        )}

        {cargandoListado && participantes.length > 0 && (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Actualizando participantes...
          </div>
        )}

        {cargandoListado && participantes.length === 0 ? (
          <div className={ui.cargando} role="status">
            <span className={ui.spinner} aria-hidden="true" />
            Consultando participantes en la API...
          </div>
        ) : participantes.length === 0 ? (
          <EstadoVacio
            titulo={
              errorListado
                ? "No se pudo cargar el listado"
                : "No hay participantes registrados"
            }
            descripcion={
              errorListado
                ? "La API no entregó el listado de participantes. Revisa el mensaje y vuelve a intentarlo."
                : proyectos.length === 0
                  ? "El servidor no devolvió proyectos. Crea un proyecto real antes de registrar participantes."
                  : "Registra el primer participante real para este listado."
            }
            accion={
              errorListado ? (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonSecundario}`}
                  onClick={recargarParticipantes}
                >
                  Reintentar consulta
                </button>
              ) : (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonPrimario}`}
                  onClick={abrirNuevo}
                  disabled={!puedeRegistrar}
                >
                  + Agregar participante
                </button>
              )
            }
          />
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="No hay participantes que coincidan"
            descripcion="Prueba con otro término de búsqueda o cambia el proyecto seleccionado."
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
                  Participantes reales con su proyecto asignado
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Participante</th>
                    <th scope="col">Correo</th>
                    <th scope="col">Proyecto</th>
                    <th scope="col">Origen</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((participante) => (
                    <tr key={participante.id}>
                      <td data-label="Participante">
                        <div className={ui.celdaPrincipal}>
                          <strong>{participante.nombre}</strong>
                          <span>#{participante.id}</span>
                        </div>
                      </td>
                      <td data-label="Correo">
                        <span className={styles.correo}>
                          {participante.email}
                        </span>
                      </td>
                      <td data-label="Proyecto">
                        {nombreProyecto(participante.proyectoId)}
                      </td>
                      <td data-label="Origen">
                        <Etiqueta tono="exito">API</Etiqueta>
                      </td>
                      <td data-label="Acciones">
                        <div className={ui.celdaAcciones}>
                          <button
                            type="button"
                            className={`${ui.boton} ${ui.botonTexto} ${ui.botonPequeno}`}
                            onClick={() =>
                              setIdDetalle(participante.id)
                            }
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                            onClick={() =>
                              abrirEdicion(participante)
                            }
                            disabled={!puedeRegistrar}
                            title={
                              puedeRegistrar
                                ? "Editar participante"
                                : "Requiere al menos un proyecto real"
                            }
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className={`${ui.boton} ${ui.botonPeligro} ${ui.botonPequeno}`}
                            onClick={() => pedirEliminar(participante)}
                            disabled={!accessToken}
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
        Esta vista usa únicamente el DTO real de participantes
        (identificador, nombre, correo y proyecto). El teléfono, estado,
        fecha de registro, asistencias y eventos inscritos no existen en
        el contrato actual y no se muestran como datos inventados.
      </p>

      <Modal
        abierto={Boolean(participanteDetalle)}
        titulo={
          participanteDetalle
            ? participanteDetalle.nombre
            : "Detalle del participante"
        }
        onCerrar={() => setIdDetalle(null)}
        pie={
          participanteDetalle && (
            <>
              <button
                type="button"
                className={`${ui.boton} ${ui.botonPeligro}`}
                onClick={() => pedirEliminar(participanteDetalle)}
                disabled={!accessToken}
              >
                Eliminar
              </button>
              <button
                type="button"
                className={`${ui.boton} ${ui.botonSecundario}`}
                onClick={() => setIdDetalle(null)}
              >
                Cerrar
              </button>
              <button
                type="button"
                className={`${ui.boton} ${ui.botonPrimario}`}
                onClick={() => abrirEdicion(participanteDetalle)}
                disabled={!puedeRegistrar}
              >
                Editar participante
              </button>
            </>
          )
        }
      >
        {participanteDetalle && (
          <>
            <dl className={styles.detalleLista}>
              <div>
                <dt>Identificador</dt>
                <dd>#{participanteDetalle.id}</dd>
              </div>
              <div>
                <dt>Origen</dt>
                <dd>API / Spring Boot</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{participanteDetalle.email}</dd>
              </div>
              <div>
                <dt>Proyecto</dt>
                <dd>
                  {nombreProyecto(participanteDetalle.proyectoId)}
                </dd>
              </div>
              <div>
                <dt>Identificador del proyecto</dt>
                <dd>{participanteDetalle.proyectoId}</dd>
              </div>
            </dl>

            <p className={ui.metaTexto}>
              Los datos provienen de GET /api/participantes. La
              eliminación se ejecuta con DELETE y no se simula como un
              cambio de estado.
            </p>
          </>
        )}
      </Modal>

      <Modal
        abierto={formularioAbierto}
        titulo={
          participanteEditando
            ? "Editar participante"
            : "Agregar participante"
        }
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
              form="form-participante-admin"
              className={`${ui.boton} ${ui.botonPrimario}`}
              disabled={guardando || !puedeRegistrar}
            >
              {guardando
                ? "Guardando..."
                : participanteEditando
                  ? "Guardar cambios"
                  : "Registrar participante"}
            </button>
          </>
        }
      >
        <form
          id="form-participante-admin"
          className={styles.formulario}
          onSubmit={guardarParticipante}
          noValidate
        >
          {errorOperacion && (
            <Aviso tono="peligro">{errorOperacion}</Aviso>
          )}

          <div className={styles.formularioGrid}>
            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="participante-admin-nombre"
              >
                Nombre completo *
              </label>
              <input
                id="participante-admin-nombre"
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
                    ? "error-participante-admin-nombre"
                    : undefined
                }
                autoComplete="name"
                maxLength={80}
                disabled={guardando}
              />
              {erroresFormulario.nombre && (
                <p
                  id="error-participante-admin-nombre"
                  className={ui.campoError}
                >
                  {erroresFormulario.nombre}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="participante-admin-correo"
              >
                Correo electrónico *
              </label>
              <input
                id="participante-admin-correo"
                type="email"
                value={formulario.correo}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    correo: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.correo)}
                aria-describedby={
                  erroresFormulario.correo
                    ? "error-participante-admin-correo"
                    : undefined
                }
                autoComplete="email"
                maxLength={120}
                disabled={guardando}
              />
              {erroresFormulario.correo && (
                <p
                  id="error-participante-admin-correo"
                  className={ui.campoError}
                >
                  {erroresFormulario.correo}
                </p>
              )}
            </div>

            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label
                className={ui.campoEtiqueta}
                htmlFor="participante-admin-proyecto"
              >
                Proyecto *
              </label>
              <select
                id="participante-admin-proyecto"
                value={formulario.proyectoId}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    proyectoId: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.proyectoId)}
                aria-describedby={
                  erroresFormulario.proyectoId
                    ? "error-participante-admin-proyecto"
                    : undefined
                }
                disabled={guardando || proyectos.length === 0}
              >
                <option value="">Selecciona un proyecto real</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
              {erroresFormulario.proyectoId ? (
                <p
                  id="error-participante-admin-proyecto"
                  className={ui.campoError}
                >
                  {erroresFormulario.proyectoId}
                </p>
              ) : (
                participanteEditando &&
                !proyectosPorId.has(
                  participanteEditando.proyectoId
                ) && (
                  <p className={ui.campoAyuda}>
                    El proyecto actual (#
                    {participanteEditando.proyectoId}) no está en el
                    listado real. Selecciona uno disponible.
                  </p>
                )
              )}
            </div>
          </div>

          <p className={ui.metaTexto}>
            Se enviarán únicamente nombre, email y proyectoId a la API.
            No se envían teléfono, estado ni campos que el backend no
            reconoce.
          </p>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(eliminando)}
        titulo="Eliminar participante"
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
              {procesandoEliminacion
                ? "Eliminando..."
                : "Eliminar definitivamente"}
            </button>
          </>
        }
      >
        {errorOperacion && (
          <Aviso tono="peligro">{errorOperacion}</Aviso>
        )}

        <p className={ui.textoSuave}>
          ¿Confirmas la eliminación de{" "}
          <strong>{eliminando?.nombre}</strong>
          {eliminando?.email ? ` (${eliminando.email})` : ""}? Se
          ejecutará DELETE /api/participantes/
          {eliminando?.id} y la acción no se puede deshacer.
        </p>

        <p className={ui.metaTexto}>
          No se cambia el estado del participante: se elimina el
          registro real en el backend.
        </p>
      </Modal>
    </PageLayout>
  );
}
