import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  Etiqueta,
  TarjetaResumen,
} from "../../components/ui/Ui";
import ui from "../../components/ui/Ui.module.css";
import { formatearFechaHora } from "../../utils/format";
import styles from "./Perfil.module.css";

function obtenerTexto(
  perfil: Record<string, unknown> | undefined,
  clave: string
): string | null {
  const valor = perfil?.[clave];

  if (typeof valor === "string" && valor.trim()) {
    return valor;
  }

  if (typeof valor === "boolean") {
    return valor ? "Sí" : "No";
  }

  if (typeof valor === "number") {
    return String(valor);
  }

  return null;
}

function esIdentificadorTecnico(valor: string) {
  const texto = valor.trim();

  return (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      texto
    ) ||
    /^[0-9a-f]{16,}$/i.test(texto) ||
    /^\d{6,}$/.test(texto)
  );
}

function esNombreLegible(valor: string | null): valor is string {
  if (!valor) {
    return false;
  }

  const texto = valor.trim();

  return (
    texto.length > 0 &&
    texto.length <= 120 &&
    !esIdentificadorTecnico(texto)
  );
}

function iniciales(nombre: string | null, correo: string | null) {
  const base = nombre ?? correo ?? "SP";
  const partes = base
    .replace(/@.*$/, "")
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  return partes.map((parte) => parte[0]?.toUpperCase()).join("") || "SP";
}

export function Perfil() {
  const auth = useAuth();
  const [cerrando, setCerrando] = useState(false);
  const [errorCierre, setErrorCierre] = useState("");
  const [mostrarAlternativa, setMostrarAlternativa] = useState(false);

  const perfil = auth.user?.profile as
    | Record<string, unknown>
    | undefined;

  const nombreClaim = obtenerTexto(perfil, "name");
  const nombrePropio = [
    obtenerTexto(perfil, "given_name"),
    obtenerTexto(perfil, "family_name"),
  ]
    .filter(esNombreLegible)
    .join(" ")
    .trim();
  const nombreAlternativo = [
    obtenerTexto(perfil, "preferred_username"),
    obtenerTexto(perfil, "nickname"),
    obtenerTexto(perfil, "given_name"),
  ].find(esNombreLegible);
  const nombre = esNombreLegible(nombreClaim)
    ? nombreClaim.trim()
    : esNombreLegible(nombrePropio)
      ? nombrePropio
      : null;

  const correo = obtenerTexto(perfil, "email");
  const usuarioClaim = obtenerTexto(perfil, "cognito:username");
  const usuario = esNombreLegible(usuarioClaim)
    ? usuarioClaim
    : null;
  const identificador = obtenerTexto(perfil, "sub");
  const telefono = obtenerTexto(perfil, "phone_number");
  const correoVerificado = obtenerTexto(perfil, "email_verified");
  const nombreVisible =
    nombre ?? nombreAlternativo ?? correo ?? "Usuario de SyncPass";
  const mostrarCorreo = correo !== null && correo !== nombreVisible;
  const expiracion = auth.user?.expires_at
    ? formatearFechaHora(
        new Date(auth.user.expires_at * 1000).toISOString()
      )
    : null;

  async function cerrarSesion() {
    setCerrando(true);
    setErrorCierre("");
    setMostrarAlternativa(false);

    try {
      await auth.signoutRedirect();
    } catch {
      setErrorCierre(
        "Cognito no completó el cierre de sesión remoto. Puedes quitar la sesión guardada en este navegador."
      );
      setMostrarAlternativa(true);
      setCerrando(false);
    }
  }

  function quitarSesionLocal() {
    auth.removeUser();
  }

  if (auth.isLoading) {
    return (
      <PageLayout
        titulo="Perfil"
        descripcion="Información de la cuenta autenticada."
        volverA="/dashboard"
      >
        <div className={ui.cargando} role="status">
          <span className={ui.spinner} aria-hidden="true" />
          Cargando la información de la sesión...
        </div>
      </PageLayout>
    );
  }

  if (auth.error) {
    return (
      <PageLayout
        titulo="Perfil"
        descripcion="Información de la cuenta autenticada."
        volverA="/dashboard"
      >
        <Aviso tono="peligro">
          No fue posible leer la sesión de Cognito:{" "}
          {auth.error.message}
        </Aviso>
      </PageLayout>
    );
  }

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <PageLayout
        titulo="Perfil"
        descripcion="Información de la cuenta autenticada."
        volverA="/dashboard"
      >
        <Aviso tono="advertencia">
          No hay una sesión activa. Inicia sesión con Cognito para ver
          la información de tu cuenta.
        </Aviso>

        <button
          type="button"
          className={`${ui.boton} ${ui.botonPrimario}`}
          onClick={() => void auth.signinRedirect()}
        >
          Ingresar con Cognito
        </button>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      titulo="Perfil"
      descripcion="Datos de la cuenta entregados por Amazon Cognito."
      volverA="/dashboard"
      volverEtiqueta="Volver al panel principal"
    >
      <section className={styles.hero} aria-labelledby="perfil-nombre">
        <div className={styles.avatar} aria-hidden="true">
          {iniciales(nombreVisible, correo)}
        </div>

        <div className={styles.identidad}>
          <h2 id="perfil-nombre">{nombreVisible}</h2>
          <p>
            {mostrarCorreo
              ? correo
              : "Sesión autenticada con Amazon Cognito"}
          </p>

          <div className={styles.estadoFila}>
            <Etiqueta tono="exito">Sesión activa</Etiqueta>
            <span className={ui.metaTexto}>
              Autenticación OIDC · Amazon Cognito
            </span>
          </div>
        </div>

        <div className={styles.accionesSesion}>
          <button
            type="button"
            className={`${ui.boton} ${ui.botonSecundario}`}
            onClick={() => void cerrarSesion()}
            disabled={cerrando || Boolean(auth.activeNavigator)}
          >
            {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
          </button>
        </div>
      </section>

      <section
        className={ui.resumenGrid}
        aria-label="Resumen de la cuenta"
      >
        <TarjetaResumen
          etiqueta="Estado"
          valor="Activa"
          detalle="Sesión validada por Cognito"
          icono="✓"
          tono="exito"
        />
        <TarjetaResumen
          etiqueta="Atributos"
          valor={
            [nombre, correo, telefono, usuario]
              .filter(Boolean).length
          }
          detalle="Datos disponibles en los claims"
          icono="◈"
          tono="info"
        />
        <TarjetaResumen
          etiqueta="Proveedor"
          valor="Cognito"
          detalle="Proveedor de identidad OIDC"
          icono="⌘"
          tono="neutral"
        />
        <TarjetaResumen
          etiqueta="Expiración"
          valor={expiracion ? "Vigente" : "—"}
          detalle={expiracion ?? "No informada por la sesión"}
          icono="◷"
          tono="advertencia"
        />
      </section>

      {errorCierre && <Aviso tono="peligro">{errorCierre}</Aviso>}

      {mostrarAlternativa && (
        <div className={styles.alternativa}>
          <button
            type="button"
            className={`${ui.boton} ${ui.botonPeligro}`}
            onClick={quitarSesionLocal}
          >
            Quitar sesión guardada en este navegador
          </button>
        </div>
      )}

      <div className={styles.paneles}>
        <section
          className={ui.panel}
          aria-labelledby="perfil-cuenta"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="perfil-cuenta" className={ui.panelTitulo}>
                Información de la cuenta
              </h2>
              <p className={ui.panelDescripcion}>
                Valores de solo lectura obtenidos desde los claims de
                Cognito.
              </p>
            </div>
            <Etiqueta tono="info">Solo lectura</Etiqueta>
          </div>

          <dl className={styles.listaDatos}>
            <div>
              <dt>Nombre</dt>
              <dd>
                {nombre ??
                  nombreAlternativo ??
                  "No disponible en Cognito"}
              </dd>
            </div>
            <div>
              <dt>Correo electrónico</dt>
              <dd>{correo ?? "No disponible en Cognito"}</dd>
            </div>
            <div>
              <dt>Nombre de usuario</dt>
              <dd>{usuario ?? "No disponible en Cognito"}</dd>
            </div>
            <div>
              <dt>Correo verificado</dt>
              <dd>{correoVerificado ?? "No informado"}</dd>
            </div>
            <div>
              <dt>Teléfono</dt>
              <dd>{telefono ?? "No disponible en Cognito"}</dd>
            </div>
            <div>
              <dt>Rol institucional</dt>
              <dd>
                No disponible en los claims actuales. SyncPass no
                inventa roles desde el frontend.
              </dd>
            </div>
            <div>
              <dt>Origen</dt>
              <dd>Amazon Cognito · Sesión OIDC activa</dd>
            </div>
          </dl>
        </section>

        <section
          className={ui.panel}
          aria-labelledby="perfil-sesion"
        >
          <div className={ui.panelCabecera}>
            <div>
              <h2 id="perfil-sesion" className={ui.panelTitulo}>
                Sesión y seguridad
              </h2>
              <p className={ui.panelDescripcion}>
                Información de la sesión actual, sin exponer tokens.
              </p>
            </div>
          </div>

          <dl className={styles.listaDatos}>
            <div>
              <dt>Estado de autenticación</dt>
              <dd>
                <Etiqueta tono="exito">Autenticado</Etiqueta>
              </dd>
            </div>
            <div>
              <dt>Expiración de la sesión</dt>
              <dd>{expiracion ?? "No informada"}</dd>
            </div>
            <div>
              <dt>Renovación</dt>
              <dd>
                {auth.activeNavigator
                  ? "Operación OIDC en curso"
                  : "Renovación silenciosa configurada por react-oidc-context"}
              </dd>
            </div>
            <div>
              <dt>Tokens y credenciales</dt>
              <dd>
                No se muestran access_token, id_token ni
                refresh_token en la interfaz.
              </dd>
            </div>
          </dl>

          <details className={styles.detallesTecnicos}>
            <summary>Detalles técnicos de la sesión</summary>
            <dl>
              <div>
                <dt>Identificador de cuenta (sub)</dt>
                <dd className={styles.identificador}>
                  {identificador ?? "No disponible en Cognito"}
                </dd>
              </div>
              <div>
                <dt>Proveedor de identidad</dt>
                <dd>Amazon Cognito · OIDC</dd>
              </div>
            </dl>
          </details>

          <div className={ui.divisor} />

          <div className={styles.cierre}>
            <div>
              <h3>Cerrar la sesión</h3>
              <p>
                Se solicitará el cierre a Cognito usando el flujo OIDC
                configurado en la aplicación.
              </p>
            </div>

            <button
              type="button"
              className={`${ui.boton} ${ui.botonPeligro}`}
              onClick={() => void cerrarSesion()}
              disabled={cerrando || Boolean(auth.activeNavigator)}
            >
              {cerrando ? "Cerrando sesión..." : "Cerrar sesión"}
            </button>
          </div>

          <p className={ui.metaTexto}>
            La edición de atributos de Cognito no está habilitada en
            esta etapa.
          </p>
        </section>
      </div>

      <p className={ui.metaTexto}>
        La información mostrada se lee desde la sesión OIDC del
        navegador. No se consultan endpoints adicionales de Cognito.
      </p>
    </PageLayout>
  );
}
