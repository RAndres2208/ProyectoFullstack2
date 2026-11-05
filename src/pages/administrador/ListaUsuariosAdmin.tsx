import { useEffect, useRef, useState } from "react";

import {
  Aviso,
  EstadoVacio,
  Etiqueta,
  Modal,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { useUsuariosAdmin } from "../../hooks/useUsuariosAdmin";
import {
  ErrorUsuariosAdmin,
  eliminarUsuarioAdministrativoApi,
  mensajeConsultaUsuario,
  mensajeEliminacionUsuario,
  mensajeListadoUsuarios,
  obtenerUsuarioAdministrativoApi,
  type ResultadoEliminacionUsuario,
  type UsuarioAdmin,
} from "../../services/usuariosAdminApi";

type Props = {
  accessToken?: string;
  autorizado: boolean;
  idUsuarioActivo?: string;
  emailUsuarioActivo?: string;
  /** Cambia cuando otro módulo (por ejemplo, el registro) pide recargar. */
  recargaExterna?: number;
  onSesionExpirada?: () => void;
};

function mensajeExito(
  resultado: ResultadoEliminacionUsuario,
  usuario: UsuarioAdmin
): string {
  const cuenta = `${usuario.nombre} (${usuario.email})`;
  const estadoCognito = resultado.cognitoEliminado
    ? "eliminado"
    : "no eliminado";
  const estadoPostgres = resultado.postgresEliminado
    ? "eliminado"
    : "no eliminado";

  if (
    resultado.estado === "RECONCILIADO" ||
    (!resultado.cognitoEliminado && resultado.postgresEliminado)
  ) {
    return `Se eliminó el registro residual de PostgreSQL de ${cuenta}. El backend respondió RECONCILIADO y el listado se actualizará desde la API.`;
  }

  if (
    resultado.estado === "ELIMINADO" &&
    resultado.cognitoEliminado &&
    resultado.postgresEliminado
  ) {
    return `Eliminación completa confirmada para ${cuenta} en Cognito y PostgreSQL.`;
  }

  return `El backend informó el estado ${resultado.estado} para ${cuenta}. Cognito: ${estadoCognito}; PostgreSQL: ${estadoPostgres}. El listado se actualizará desde la API con el estado real.`;
}

function esCuentaActiva(
  usuario: UsuarioAdmin,
  idActivo?: string,
  emailActivo?: string
): boolean {
  const coincideId = Boolean(
    idActivo && usuario.id === idActivo
  );
  const coincideEmail = Boolean(
    emailActivo &&
      usuario.email.trim().toLowerCase() ===
        emailActivo.trim().toLowerCase()
  );

  return coincideId || coincideEmail;
}

function comoErrorUsuariosAdmin(fallo: unknown): ErrorUsuariosAdmin {
  if (fallo instanceof ErrorUsuariosAdmin) {
    return fallo;
  }

  return new ErrorUsuariosAdmin(
    "red",
    "No fue posible completar la operación con el usuario."
  );
}

/**
 * Listado persistente de usuarios con paginación, consulta individual
 * y baja administrativa.
 *
 * La tabla solo cambia después de una respuesta confirmada del backend:
 * nunca se retira una fila de forma optimista.
 */
export function ListaUsuariosAdmin({
  accessToken,
  autorizado,
  idUsuarioActivo,
  emailUsuarioActivo,
  recargaExterna = 0,
  onSesionExpirada,
}: Props) {
  const habilitado = autorizado && Boolean(accessToken);

  const {
    usuarios,
    pagina,
    totalElements,
    totalPages,
    estado,
    error: errorListado,
    recargar,
    irAPagina,
  } = useUsuariosAdmin(habilitado, accessToken, {
    tokenRefresco: recargaExterna,
    tamano: 20,
  });

  const [objetivo, setObjetivo] = useState<UsuarioAdmin | null>(
    null
  );
  const [detalle, setDetalle] = useState<UsuarioAdmin | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [consultandoId, setConsultandoId] = useState<string | null>(
    null
  );
  const [mensaje, setMensaje] = useState("");
  const [errorAccion, setErrorAccion] = useState("");
  const [errorDetalle, setErrorDetalle] = useState("");

  const montadoRef = useRef(true);
  const operacionRef = useRef(false);
  const consultaRef = useRef(false);

  useEffect(() => {
    montadoRef.current = true;

    return () => {
      montadoRef.current = false;
    };
  }, []);

  const puedeEliminar = autorizado && Boolean(accessToken);

  function pedirEliminar(usuario: UsuarioAdmin) {
    if (procesando || operacionRef.current) {
      return;
    }

    if (esCuentaActiva(usuario, idUsuarioActivo, emailUsuarioActivo)) {
      setMensaje("");
      setErrorAccion(
        "No puedes eliminar la cuenta administrativa con la que tienes la sesión activa. Usa otra cuenta administradora si necesitas darla de baja."
      );
      return;
    }

    setMensaje("");
    setErrorAccion("");
    setObjetivo(usuario);
  }

  function cerrarConfirmacion() {
    if (procesando) {
      return;
    }

    setObjetivo(null);
    setErrorAccion("");
  }

  async function reconciliarEstadoTras404(
    usuario: UsuarioAdmin,
    errorEliminacion: ErrorUsuariosAdmin
  ) {
    let estadoReal =
      "No fue posible confirmar el estado real mediante GET /api/usuarios/{id}. El listado se actualizó y la fila se conserva.";

    if (!accessToken) {
      return;
    }

    try {
      const actual = await obtenerUsuarioAdministrativoApi(
        usuario.id,
        accessToken
      );

      if (!montadoRef.current) {
        return;
      }

      estadoReal = `La consulta individual GET /api/usuarios/${usuario.id} confirma que ${actual.nombre} (${actual.email}) sigue existiendo. La fila se conserva.`;
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const errorConsulta = comoErrorUsuariosAdmin(fallo);

      if (errorConsulta.status === 401) {
        setErrorAccion(mensajeEliminacionUsuario(errorEliminacion));
        onSesionExpirada?.();
        return;
      }

      if (errorConsulta.status === 404) {
        estadoReal =
          "La consulta individual también respondió 404: el usuario ya no existe en el backend. El listado se actualizó con el estado real.";
        setObjetivo(null);
      }
    }

    if (!montadoRef.current) {
      return;
    }

    recargar();
    setErrorAccion(
      `${mensajeEliminacionUsuario(errorEliminacion)} ${estadoReal}`
    );
  }

  async function confirmarEliminacion() {
    if (operacionRef.current || !objetivo) {
      return;
    }

    setErrorAccion("");
    setMensaje("");

    if (!autorizado || !accessToken) {
      setErrorAccion(
        "No hay una sesión administrativa de Cognito disponible para eliminar la cuenta."
      );
      return;
    }

    if (esCuentaActiva(objetivo, idUsuarioActivo, emailUsuarioActivo)) {
      setErrorAccion(
        "No puedes eliminar la cuenta administrativa con la que tienes la sesión activa."
      );
      return;
    }

    const usuario = objetivo;

    operacionRef.current = true;
    setProcesando(true);

    try {
      const resultado = await eliminarUsuarioAdministrativoApi(
        usuario.id,
        accessToken
      );

      if (!montadoRef.current) {
        return;
      }

      setObjetivo(null);
      setMensaje(mensajeExito(resultado, usuario));
      recargar();
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const errorEliminacion = comoErrorUsuariosAdmin(fallo);

      if (errorEliminacion.status === 401) {
        setErrorAccion(mensajeEliminacionUsuario(errorEliminacion));
        onSesionExpirada?.();
      } else if (errorEliminacion.status === 404) {
        await reconciliarEstadoTras404(usuario, errorEliminacion);
      } else {
        setErrorAccion(mensajeEliminacionUsuario(errorEliminacion));
      }
    } finally {
      operacionRef.current = false;

      if (montadoRef.current) {
        setProcesando(false);
      }
    }
  }

  async function verDetalle(usuario: UsuarioAdmin) {
    if (consultaRef.current || !accessToken) {
      return;
    }

    consultaRef.current = true;
    setConsultandoId(usuario.id);
    setErrorDetalle("");

    try {
      const actual = await obtenerUsuarioAdministrativoApi(
        usuario.id,
        accessToken
      );

      if (!montadoRef.current) {
        return;
      }

      setDetalle(actual);
    } catch (fallo) {
      if (!montadoRef.current) {
        return;
      }

      const errorConsulta = comoErrorUsuariosAdmin(fallo);

      if (errorConsulta.status === 401) {
        onSesionExpirada?.();
      }

      if (errorConsulta.status === 404) {
        recargar();
      }

      setErrorDetalle(mensajeConsultaUsuario(errorConsulta));
    } finally {
      consultaRef.current = false;

      if (montadoRef.current) {
        setConsultandoId(null);
      }
    }
  }

  function cerrarDetalle() {
    setDetalle(null);
    setErrorDetalle("");
  }

  const sinPaginas = totalPages === 0;
  const enPrimeraPagina = sinPaginas || pagina <= 0;
  const enUltimaPagina = sinPaginas || pagina >= totalPages - 1;
  const navegacionDeshabilitada = estado === "cargando";

  return (
    <section
      className={`${ui.panel} ${ui.seccion}`}
      aria-labelledby="usuarios-titulo"
    >
      <div className={ui.panelCabecera}>
        <div>
          <h2 id="usuarios-titulo" className={ui.panelTitulo}>
            Usuarios registrados
          </h2>
          <p className={ui.panelDescripcion}>
            Datos persistentes obtenidos de{" "}
            <code>GET /api/usuarios</code>. La baja usa{" "}
            <code>DELETE /api/usuarios/&#123;id&#125;</code> y el
            listado se refresca después de cada operación confirmada.
          </p>
        </div>

        <Etiqueta tono={totalElements > 0 ? "info" : "neutral"}>
          {totalElements}{" "}
          {totalElements === 1 ? "usuario" : "usuarios"}
        </Etiqueta>
      </div>

      <Aviso tono="info">
        La lista se consulta nuevamente al abrir el módulo, al cambiar de
        página, después de registrar una cuenta y después de eliminar un
        usuario. El identificador real se conserva para todas las
        operaciones.
      </Aviso>

      {!autorizado && (
        <Aviso tono="peligro">
          El listado y la baja requieren una sesión de Cognito con el
          grupo administrador. El backend vuelve a validar
          ROLE_ADMINISTRADOR.
        </Aviso>
      )}

      {mensaje && <Aviso tono="exito">{mensaje}</Aviso>}

      {errorAccion && !objetivo && (
        <Aviso tono="peligro">{errorAccion}</Aviso>
      )}

      {errorDetalle && !detalle && (
        <Aviso tono="peligro">{errorDetalle}</Aviso>
      )}

      {errorListado && (
        <Aviso tono="peligro">
          <p>{mensajeListadoUsuarios(errorListado)}</p>
          <div className={ui.botonesFila}>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
              onClick={recargar}
            >
              Reintentar consulta
            </button>

            {errorListado.status === 401 && onSesionExpirada && (
              <button
                type="button"
                className={`${ui.boton} ${ui.botonPrimario} ${ui.botonPequeno}`}
                onClick={onSesionExpirada}
              >
                Iniciar sesión de nuevo
              </button>
            )}
          </div>
        </Aviso>
      )}

      {!autorizado ? (
        <EstadoVacio
          titulo="Acceso restringido"
          descripcion="Inicia sesión con una cuenta administradora para consultar el listado persistente de usuarios."
        />
      ) : estado === "cargando" && usuarios.length === 0 ? (
        <div className={ui.cargando} role="status">
          <span className={ui.spinner} aria-hidden="true" />
          Consultando usuarios en el backend...
        </div>
      ) : errorListado && usuarios.length === 0 ? null : usuarios.length ===
        0 ? (
        <EstadoVacio
          titulo="Sin usuarios registrados"
          descripcion="El backend no devolvió cuentas para esta página. Registra un usuario o actualiza la consulta."
          accion={
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={recargar}
            >
              Actualizar listado
            </button>
          }
        />
      ) : (
        <div className={ui.tablaWrap}>
          <table className={ui.tabla}>
            <caption className={ui.srOnly}>
              Usuarios persistidos en SyncPass con su identificador real
            </caption>
            <thead>
              <tr>
                <th scope="col">Usuario</th>
                <th scope="col">Correo</th>
                <th scope="col">Roles</th>
                <th scope="col">Identificador</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const activo = esCuentaActiva(
                  usuario,
                  idUsuarioActivo,
                  emailUsuarioActivo
                );
                const consultando = consultandoId === usuario.id;

                return (
                  <tr key={usuario.id}>
                    <td data-label="Usuario">
                      <div className={ui.celdaPrincipal}>
                        <strong>{usuario.nombre}</strong>
                        {activo ? (
                          <Etiqueta tono="advertencia">
                            Tu cuenta activa
                          </Etiqueta>
                        ) : (
                          <span>Cuenta persistente</span>
                        )}
                      </div>
                    </td>
                    <td data-label="Correo">{usuario.email}</td>
                    <td data-label="Roles">
                      <div className={ui.botonesFila}>
                        {usuario.roles.map((rol) => (
                          <Etiqueta key={rol} tono="info">
                            {rol}
                          </Etiqueta>
                        ))}
                      </div>
                    </td>
                    <td data-label="Identificador">
                      <code>{usuario.id}</code>
                    </td>
                    <td data-label="Acciones">
                      <div className={ui.celdaAcciones}>
                        <button
                          type="button"
                          className={`${ui.boton} ${ui.botonSecundario} ${ui.botonPequeno}`}
                          onClick={() => void verDetalle(usuario)}
                          disabled={
                            consultando ||
                            procesando ||
                            Boolean(consultandoId)
                          }
                        >
                          {consultando
                            ? "Consultando..."
                            : "Ver detalle"}
                        </button>

                        <button
                          type="button"
                          className={`${ui.boton} ${ui.botonPeligro} ${ui.botonPequeno}`}
                          onClick={() => pedirEliminar(usuario)}
                          disabled={
                            !puedeEliminar ||
                            activo ||
                            procesando
                          }
                          title={
                            activo
                              ? "No puedes eliminar la cuenta administrativa con la que tienes la sesión activa"
                              : puedeEliminar
                                ? "Eliminar esta cuenta en el backend"
                                : "Requiere una sesión administrativa de Cognito"
                          }
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {autorizado && (
        <nav
          className={ui.paginacion}
          aria-label="Paginación del listado de usuarios"
        >
          <span className={ui.paginaInfo}>
            Página {sinPaginas ? 0 : pagina + 1} de {totalPages} ·{" "}
            {totalElements}{" "}
            {totalElements === 1 ? "usuario" : "usuarios"}
          </span>

          <div className={ui.paginaBotones}>
            <button
              type="button"
              className={ui.paginaBoton}
              onClick={() => irAPagina(pagina - 1)}
              disabled={enPrimeraPagina || navegacionDeshabilitada}
              aria-label="Página anterior"
            >
              Anterior
            </button>

            <button
              type="button"
              className={ui.paginaBoton}
              onClick={() => irAPagina(pagina + 1)}
              disabled={enUltimaPagina || navegacionDeshabilitada}
              aria-label="Página siguiente"
            >
              Siguiente
            </button>
          </div>
        </nav>
      )}

      <Modal
        abierto={Boolean(objetivo)}
        titulo="Eliminar cuenta de usuario"
        onCerrar={cerrarConfirmacion}
        pie={
          <>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonSecundario}`}
              onClick={cerrarConfirmacion}
              disabled={procesando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${ui.boton} ${ui.botonPeligro}`}
              onClick={() => void confirmarEliminacion()}
              disabled={procesando || !puedeEliminar}
            >
              {procesando
                ? "Eliminando..."
                : errorAccion
                  ? "Reintentar eliminación"
                  : "Eliminar definitivamente"}
            </button>
          </>
        }
      >
        {errorAccion && <Aviso tono="peligro">{errorAccion}</Aviso>}

        {objetivo && (
          <>
            <p className={ui.textoSuave}>
              ¿Confirmas la eliminación de{" "}
              <strong>{objetivo.nombre}</strong> (
              {objetivo.email})? Esta acción no se puede deshacer.
            </p>

            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>{objetivo.nombre}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{objetivo.email}</dd>
              </div>
              <div>
                <dt>Identificador real</dt>
                <dd>
                  <code>{objetivo.id}</code>
                </dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>{objetivo.roles.join(", ")}</dd>
              </div>
            </dl>

            <p className={ui.metaTexto}>
              Se ejecutará DELETE /api/usuarios/{objetivo.id} con el
              token de Cognito. La fila solo se actualizará después de
              confirmar la respuesta del backend. Los errores 404, 409,
              500 y 503 no se interpretan como una eliminación exitosa.
            </p>
          </>
        )}
      </Modal>

      <Modal
        abierto={Boolean(detalle)}
        titulo="Detalle del usuario"
        onCerrar={cerrarDetalle}
        pie={
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={cerrarDetalle}
          >
            Cerrar
          </button>
        }
      >
        {errorDetalle && <Aviso tono="peligro">{errorDetalle}</Aviso>}

        {detalle && (
          <>
            <dl>
              <div>
                <dt>Nombre</dt>
                <dd>{detalle.nombre}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{detalle.email}</dd>
              </div>
              <div>
                <dt>Identificador real</dt>
                <dd>
                  <code>{detalle.id}</code>
                </dd>
              </div>
              <div>
                <dt>Roles</dt>
                <dd>{detalle.roles.join(", ")}</dd>
              </div>
            </dl>

            <p className={ui.metaTexto}>
              Consulta individual realizada con GET
              /api/usuarios/{detalle.id}. Los datos se leen nuevamente
              desde el backend y no provienen de una copia local.
            </p>
          </>
        )}
      </Modal>
    </section>
  );
}
