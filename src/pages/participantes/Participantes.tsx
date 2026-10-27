import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  Buscador,
  EstadoVacio,
  Etiqueta,
  Modal,
  Paginacion,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import {
  cargarParticipantesDemo,
  guardarParticipantesDemo,
  restablecerParticipantesDemo,
  type EstadoParticipante,
  type Participante,
} from "../../data/participantesData";
import { proyectosData } from "../../data/proyectosData";
import { useRecargaDemo } from "../../hooks/useRecargaDemo";
import { crearIdDemo, normalizarTexto } from "../../utils/format";
import styles from "./Participantes.module.css";

type CampoOrden =
  | "nombre"
  | "correo"
  | "proyecto"
  | "estado"
  | "registro";

type DireccionOrden = "asc" | "desc";

type FormularioParticipante = {
  nombre: string;
  correo: string;
  telefono: string;
  estado: EstadoParticipante;
  proyectoId: string;
};

type ErroresFormulario = Partial<
  Record<keyof FormularioParticipante, string>
>;

type Confirmacion =
  | { tipo: "inactivar"; participanteId: string }
  | { tipo: "restablecer" };

const TAMANO_PAGINA = 6;

const formularioInicial: FormularioParticipante = {
  nombre: "",
  correo: "",
  telefono: "",
  estado: "Pendiente",
  proyectoId: "",
};

function tonoEstado(estado: EstadoParticipante) {
  if (estado === "Activo") {
    return "exito" as const;
  }

  if (estado === "Pendiente") {
    return "advertencia" as const;
  }

  return "neutral" as const;
}

function EncabezadoOrden({
  campo,
  etiqueta,
  orden,
  onOrdenar,
}: {
  campo: CampoOrden;
  etiqueta: string;
  orden: { campo: CampoOrden; direccion: DireccionOrden };
  onOrdenar: (campo: CampoOrden) => void;
}) {
  const activo = orden.campo === campo;

  return (
    <th
      scope="col"
      aria-sort={
        activo
          ? orden.direccion === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        className={`${ui.botonOrden} ${
          activo ? ui.ordenActivo : ""
        }`}
        onClick={() => onOrdenar(campo)}
      >
        {etiqueta}
        <span aria-hidden="true">
          {activo ? (orden.direccion === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </button>
    </th>
  );
}

export function Participantes() {
  const [participantes, setParticipantes] = useState<Participante[]>(
    () => cargarParticipantesDemo()
  );

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");
  const [filtroProyecto, setFiltroProyecto] = useState("Todos");
  const [pagina, setPagina] = useState(1);

  const [orden, setOrden] = useState<{
    campo: CampoOrden;
    direccion: DireccionOrden;
  }>({ campo: "nombre", direccion: "asc" });

  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [participanteEditando, setParticipanteEditando] =
    useState<Participante | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioParticipante>(formularioInicial);
  const [erroresFormulario, setErroresFormulario] =
    useState<ErroresFormulario>({});
  const [confirmacion, setConfirmacion] =
    useState<Confirmacion | null>(null);

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const { cargando, recargar } = useRecargaDemo();

  const resumen = useMemo(
    () => ({
      total: participantes.length,
      activos: participantes.filter(
        (participante) => participante.estado === "Activo"
      ).length,
      pendientes: participantes.filter(
        (participante) => participante.estado === "Pendiente"
      ).length,
      inactivos: participantes.filter(
        (participante) => participante.estado === "Inactivo"
      ).length,
    }),
    [participantes]
  );

  const filtrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    const resultado = participantes.filter((participante) => {
      const contenido = normalizarTexto(
        [
          participante.nombre,
          participante.correo,
          participante.id,
          participante.proyectoNombre,
        ].join(" ")
      );

      const coincideBusqueda =
        !texto || contenido.includes(texto);

      const coincideEstado =
        filtroEstado === "Todos" ||
        participante.estado === filtroEstado;

      const coincideProyecto =
        filtroProyecto === "Todos" ||
        participante.proyectoId === filtroProyecto;

      return (
        coincideBusqueda && coincideEstado && coincideProyecto
      );
    });

    return [...resultado].sort((a, b) => {
      let comparacion = 0;

      if (orden.campo === "nombre") {
        comparacion = a.nombre.localeCompare(b.nombre, "es");
      } else if (orden.campo === "correo") {
        comparacion = a.correo.localeCompare(b.correo, "es");
      } else if (orden.campo === "proyecto") {
        comparacion = a.proyectoNombre.localeCompare(
          b.proyectoNombre,
          "es"
        );
      } else if (orden.campo === "estado") {
        comparacion = a.estado.localeCompare(b.estado, "es");
      } else {
        comparacion = a.fechaRegistro.localeCompare(
          b.fechaRegistro
        );
      }

      return orden.direccion === "asc" ? comparacion : -comparacion;
    });
  }, [participantes, busqueda, filtroEstado, filtroProyecto, orden]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / TAMANO_PAGINA)
  );

  const paginaActual = Math.min(pagina, totalPaginas);

  const visibles = filtrados.slice(
    (paginaActual - 1) * TAMANO_PAGINA,
    paginaActual * TAMANO_PAGINA
  );

  const participanteDetalle = participantes.find(
    (participante) => participante.id === idDetalle
  );

  function cambiarOrden(campo: CampoOrden) {
    setOrden((actual) =>
      actual.campo === campo
        ? {
            campo,
            direccion: actual.direccion === "asc" ? "desc" : "asc",
          }
        : { campo, direccion: "asc" }
    );
    setPagina(1);
  }

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroEstado("Todos");
    setFiltroProyecto("Todos");
    setPagina(1);
  }

  function abrirNuevo() {
    setParticipanteEditando(null);
    setFormulario(formularioInicial);
    setErroresFormulario({});
    setFormularioAbierto(true);
  }

  function abrirEdicion(participante: Participante) {
    setParticipanteEditando(participante);
    setFormulario({
      nombre: participante.nombre,
      correo: participante.correo,
      telefono: participante.telefono ?? "",
      estado: participante.estado,
      proyectoId: participante.proyectoId,
    });
    setErroresFormulario({});
    setIdDetalle(null);
    setFormularioAbierto(true);
  }

  function validarFormulario(): ErroresFormulario {
    const errores: ErroresFormulario = {};

    if (formulario.nombre.trim().length < 3) {
      errores.nombre =
        "Ingresa el nombre completo (mínimo 3 caracteres).";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        formulario.correo.trim()
      )
    ) {
      errores.correo = "Ingresa un correo electrónico válido.";
    } else {
      const correoNormalizado = formulario.correo
        .trim()
        .toLowerCase();

      const repetido = participantes.some(
        (participante) =>
          participante.correo.toLowerCase() === correoNormalizado &&
          participante.id !== participanteEditando?.id
      );

      if (repetido) {
        errores.correo =
          "Ya existe un participante con este correo.";
      }
    }

    if (
      formulario.telefono.trim() &&
      !/^[+0-9][0-9 ()-]{6,19}$/.test(
        formulario.telefono.trim()
      )
    ) {
      errores.telefono =
        "Usa entre 7 y 20 caracteres: números, espacios, +, - o paréntesis.";
    }

    if (!formulario.proyectoId) {
      errores.proyectoId = "Selecciona un proyecto.";
    }

    return errores;
  }

  function guardarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setError("");
    setMensaje("");

    const errores = validarFormulario();

    if (Object.keys(errores).length > 0) {
      setErroresFormulario(errores);
      return;
    }

    const proyecto = proyectosData.find(
      (item) => item.id === formulario.proyectoId
    );

    if (!proyecto) {
      setErroresFormulario({
        proyectoId: "El proyecto seleccionado no es válido.",
      });
      return;
    }

    const datosBase = {
      nombre: formulario.nombre.trim(),
      correo: formulario.correo.trim().toLowerCase(),
      telefono: formulario.telefono.trim() || undefined,
      estado: formulario.estado,
      proyectoId: proyecto.id,
      proyectoNombre: proyecto.nombre,
    };

    let actualizados: Participante[];

    if (participanteEditando) {
      actualizados = participantes.map((participante) =>
        participante.id === participanteEditando.id
          ? { ...participante, ...datosBase }
          : participante
      );
    } else {
      const nuevo: Participante = {
        id: crearIdDemo("SP"),
        ...datosBase,
        fechaRegistro: new Date().toISOString().slice(0, 10),
        asistencias: 0,
        eventosInscritos: 0,
        demostracion: true,
      };

      actualizados = [nuevo, ...participantes];
    }

    setParticipantes(actualizados);

    const guardado = guardarParticipantesDemo(actualizados);

    if (guardado) {
      setMensaje(
        participanteEditando
          ? "Participante actualizado en este navegador. Es un cambio de demostración, no una operación del servidor."
          : "Participante agregado en este navegador. Es un cambio de demostración, no una operación del servidor."
      );
    } else {
      setError(
        "No fue posible guardar en el almacenamiento del navegador. El cambio permanece solo durante esta sesión."
      );
    }

    setFormularioAbierto(false);
    setParticipanteEditando(null);
    setPagina(1);
  }

  function confirmarAccion() {
    if (!confirmacion) {
      return;
    }

    setError("");

    if (confirmacion.tipo === "restablecer") {
      const base = restablecerParticipantesDemo();
      setParticipantes(base);
      setConfirmacion(null);
      setIdDetalle(null);
      limpiarFiltros();
      setMensaje(
        "Datos de demostración restablecidos en este navegador."
      );
      return;
    }

    const actualizados = participantes.map((participante) =>
      participante.id === confirmacion.participanteId
        ? { ...participante, estado: "Inactivo" as const }
        : participante
    );

    setParticipantes(actualizados);

    if (!guardarParticipantesDemo(actualizados)) {
      setError(
        "El participante se marcó como inactivo, pero no fue posible guardar el cambio en este navegador."
      );
    } else {
      setMensaje(
        "Participante marcado como inactivo. Cambio de demostración guardado localmente."
      );
    }

    setConfirmacion(null);
  }

  const tituloConfirmacion =
    confirmacion?.tipo === "restablecer"
      ? "Restablecer datos de demostración"
      : "Marcar participante como inactivo";

  return (
    <PageLayout
      titulo="Participantes"
      descripcion="Gestión visual de personas vinculadas a los proyectos comunitarios."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <AvisoDemo>
        <strong>Datos de demostración.</strong> Los participantes,
        altas y ediciones se guardan solo en este navegador. No
        existen llamadas al backend en esta pantalla.
      </AvisoDemo>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de participantes"
      >
        <TarjetaResumen
          etiqueta="Total"
          valor={resumen.total}
          detalle="Personas registradas en la demostración"
          icono="♧"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Activos"
          valor={resumen.activos}
          detalle="Pueden participar en actividades"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Pendientes"
          valor={resumen.pendientes}
          detalle="Validación de registro pendiente"
          icono="◷"
          tono="advertencia"
        />
        <TarjetaResumen
          etiqueta="Inactivos"
          valor={resumen.inactivos}
          detalle="Sin participación reciente"
          icono="◌"
          tono="neutral"
        />
      </section>

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}
      {error && <Aviso tono="peligro">{error}</Aviso>}

      <section className={ui.panel} aria-labelledby="participantes-listado">
        <div className={ui.panelCabecera}>
          <div>
            <h2 id="participantes-listado" className={ui.panelTitulo}>
              Listado de participantes
            </h2>
            <p className={ui.panelDescripcion}>
              Busca, filtra y ordena la información de demostración.
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
              onClick={() => setConfirmacion({ tipo: "restablecer" })}
            >
              Restablecer demo
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPrimario}`}
              onClick={abrirNuevo}
            >
              + Agregar participante
            </button>
          </div>
        </div>

        <div className={styles.filtros}>
          <div className={styles.filtroBusqueda}>
            <Buscador
              id="buscar-participante"
              etiqueta="Buscar participante"
              valor={busqueda}
              onChange={(valor) => {
                setBusqueda(valor);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, correo o identificador"
            />
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="filtro-estado">
              Estado
            </label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(evento) => {
                setFiltroEstado(evento.target.value);
                setPagina(1);
              }}
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Pendiente">Pendientes</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>

          <div className={ui.campo}>
            <label className={ui.campoEtiqueta} htmlFor="filtro-proyecto">
              Proyecto
            </label>
            <select
              id="filtro-proyecto"
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
            {filtrados.length}{" "}
            {filtrados.length === 1
              ? "participante encontrado"
              : "participantes encontrados"}
          </p>

          {(busqueda ||
            filtroEstado !== "Todos" ||
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
            Actualizando la vista de demostración...
          </div>
        ) : visibles.length === 0 ? (
          <EstadoVacio
            titulo="No hay participantes para mostrar"
            descripcion="Prueba con otro término de búsqueda o cambia los filtros seleccionados."
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
                  Participantes de demostración con su proyecto y estado
                </caption>
                <thead>
                  <tr>
                    <EncabezadoOrden
                      campo="nombre"
                      etiqueta="Participante"
                      orden={orden}
                      onOrdenar={cambiarOrden}
                    />
                    <EncabezadoOrden
                      campo="correo"
                      etiqueta="Correo"
                      orden={orden}
                      onOrdenar={cambiarOrden}
                    />
                    <EncabezadoOrden
                      campo="proyecto"
                      etiqueta="Proyecto"
                      orden={orden}
                      onOrdenar={cambiarOrden}
                    />
                    <EncabezadoOrden
                      campo="estado"
                      etiqueta="Estado"
                      orden={orden}
                      onOrdenar={cambiarOrden}
                    />
                    <EncabezadoOrden
                      campo="registro"
                      etiqueta="Registro"
                      orden={orden}
                      onOrdenar={cambiarOrden}
                    />
                    <th scope="col">Asistencia</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((participante) => (
                    <tr key={participante.id}>
                      <td data-label="Participante">
                        <div className={ui.celdaPrincipal}>
                          <strong>{participante.nombre}</strong>
                          <span>{participante.id}</span>
                        </div>
                      </td>
                      <td data-label="Correo">
                        <span className={styles.correo}>
                          {participante.correo}
                        </span>
                      </td>
                      <td data-label="Proyecto">
                        {participante.proyectoNombre}
                      </td>
                      <td data-label="Estado">
                        <Etiqueta tono={tonoEstado(participante.estado)}>
                          {participante.estado}
                        </Etiqueta>
                      </td>
                      <td data-label="Registro">
                        {participante.fechaRegistro}
                      </td>
                      <td data-label="Asistencia">
                        {participante.asistencias}/
                        {participante.eventosInscritos}
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
                            onClick={() => abrirEdicion(participante)}
                          >
                            Editar
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
        Los identificadores, correos y teléfonos son ficticios y se
        utilizan únicamente para probar la interfaz.
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
              {participanteDetalle.estado !== "Inactivo" && (
                <button
                  type="button"
                  className={`${ui.boton} ${ui.botonPeligro}`}
                  onClick={() => {
                    setIdDetalle(null);
                    setConfirmacion({
                      tipo: "inactivar",
                      participanteId: participanteDetalle.id,
                    });
                  }}
                >
                  Marcar inactivo
                </button>
              )}
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
                <dd>{participanteDetalle.id}</dd>
              </div>
              <div>
                <dt>Estado</dt>
                <dd>
                  <Etiqueta tono={tonoEstado(participanteDetalle.estado)}>
                    {participanteDetalle.estado}
                  </Etiqueta>
                </dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{participanteDetalle.correo}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>
                  {participanteDetalle.telefono ??
                    "No registrado en la demostración"}
                </dd>
              </div>
              <div>
                <dt>Proyecto</dt>
                <dd>{participanteDetalle.proyectoNombre}</dd>
              </div>
              <div>
                <dt>Fecha de registro</dt>
                <dd>{participanteDetalle.fechaRegistro}</dd>
              </div>
              <div>
                <dt>Asistencia</dt>
                <dd>
                  {participanteDetalle.asistencias} de{" "}
                  {participanteDetalle.eventosInscritos} eventos
                  inscritos
                </dd>
              </div>
              <div>
                <dt>Origen</dt>
                <dd>Datos de demostración</dd>
              </div>
            </dl>

            <p className={ui.metaTexto}>
              Esta información no se sincroniza con el backend.
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
              form="form-participante"
              className={`${ui.boton} ${ui.botonPrimario}`}
            >
              {participanteEditando
                ? "Guardar cambios"
                : "Agregar participante"}
            </button>
          </>
        }
      >
        <form
          id="form-participante"
          className={styles.formulario}
          onSubmit={guardarFormulario}
          noValidate
        >
          <div className={styles.formularioGrid}>
            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label className={ui.campoEtiqueta} htmlFor="participante-nombre">
                Nombre completo *
              </label>
              <input
                id="participante-nombre"
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
                    ? "error-participante-nombre"
                    : undefined
                }
                autoComplete="name"
                maxLength={80}
              />
              {erroresFormulario.nombre && (
                <p
                  id="error-participante-nombre"
                  className={ui.campoError}
                >
                  {erroresFormulario.nombre}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label className={ui.campoEtiqueta} htmlFor="participante-correo">
                Correo electrónico *
              </label>
              <input
                id="participante-correo"
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
                    ? "error-participante-correo"
                    : undefined
                }
                autoComplete="email"
                maxLength={120}
              />
              {erroresFormulario.correo && (
                <p
                  id="error-participante-correo"
                  className={ui.campoError}
                >
                  {erroresFormulario.correo}
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label className={ui.campoEtiqueta} htmlFor="participante-telefono">
                Teléfono
              </label>
              <input
                id="participante-telefono"
                type="tel"
                value={formulario.telefono}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    telefono: evento.target.value,
                  }))
                }
                aria-invalid={Boolean(erroresFormulario.telefono)}
                aria-describedby={
                  erroresFormulario.telefono
                    ? "error-participante-telefono"
                    : "ayuda-participante-telefono"
                }
                autoComplete="tel"
                maxLength={20}
              />
              {erroresFormulario.telefono ? (
                <p
                  id="error-participante-telefono"
                  className={ui.campoError}
                >
                  {erroresFormulario.telefono}
                </p>
              ) : (
                <p
                  id="ayuda-participante-telefono"
                  className={ui.campoAyuda}
                >
                  Opcional. Solo se usa en la demostración.
                </p>
              )}
            </div>

            <div className={ui.campo}>
              <label className={ui.campoEtiqueta} htmlFor="participante-estado">
                Estado *
              </label>
              <select
                id="participante-estado"
                value={formulario.estado}
                onChange={(evento) =>
                  setFormulario((actual) => ({
                    ...actual,
                    estado: evento.target.value as EstadoParticipante,
                  }))
                }
              >
                <option value="Activo">Activo</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>

            <div className={`${ui.campo} ${styles.campoCompleto}`}>
              <label className={ui.campoEtiqueta} htmlFor="participante-proyecto">
                Proyecto *
              </label>
              <select
                id="participante-proyecto"
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
                    ? "error-participante-proyecto"
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
              {erroresFormulario.proyectoId && (
                <p
                  id="error-participante-proyecto"
                  className={ui.campoError}
                >
                  {erroresFormulario.proyectoId}
                </p>
              )}
            </div>
          </div>

          <p className={ui.metaTexto}>
            Los cambios se guardan únicamente en el almacenamiento
            local de este navegador. No se envían al servidor.
          </p>
        </form>
      </Modal>

      <Modal
        abierto={Boolean(confirmacion)}
        titulo={tituloConfirmacion}
        onCerrar={() => setConfirmacion(null)}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={() => setConfirmacion(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${
                confirmacion?.tipo === "restablecer"
                  ? ui.botonPeligro
                  : ui.botonPrimario
              }`}
              onClick={confirmarAccion}
            >
              {confirmacion?.tipo === "restablecer"
                ? "Restablecer datos"
                : "Marcar inactivo"}
            </button>
          </>
        }
      >
        <p className={ui.textoSuave}>
          {confirmacion?.tipo === "restablecer"
            ? "Se descartarán los cambios guardados en este navegador y se recuperará la lista original de demostración."
            : "El participante dejará de figurar como activo. Esta acción solo modifica los datos locales de demostración."}
        </p>
      </Modal>
    </PageLayout>
  );
}
