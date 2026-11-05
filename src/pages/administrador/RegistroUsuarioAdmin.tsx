import { useMemo, useRef, useState } from "react";
import { useAuth } from "react-oidc-context";

import {
  ROLES_REGISTRO,
  registrarUsuarioAdministrativoApi,
  validarRegistroAdministrativo,
  type RolRegistro,
  type UsuarioRegistrado,
} from "../../services/registroAdminApi";

import styles from "./RegistroUsuarioAdmin.module.css";

const NOMBRES_ROLES: Record<RolRegistro, string> = {
  ESTUDIANTE: "Estudiante",
  PROFESOR: "Docente",
  COORDINADOR: "Coordinador",
  ADMINISTRADOR: "Administrador",
};

function tieneGrupoAdministrador(token?: string): boolean {
  if (!token) return false;

  try {
    const partes = token.split(".");
    if (partes.length !== 3) return false;

    const base64 = partes[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const claims: unknown = JSON.parse(atob(base64));

    if (!claims || typeof claims !== "object") {
      return false;
    }

    const grupos = (
      claims as Record<string, unknown>
    )["cognito:groups"];

    return (
      Array.isArray(grupos) &&
      grupos.some(
        (grupo) =>
          typeof grupo === "string" &&
          grupo.toUpperCase() === "ADMINISTRADOR"
      )
    );
  } catch {
    return false;
  }
}

export function RegistroUsuarioAdmin({
  onUsuarioRegistrado,
}: {
  onUsuarioRegistrado?: (usuario: UsuarioRegistrado) => void;
}) {
  const auth = useAuth();
  const enviandoRef = useRef(false);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setRoles] = useState<RolRegistro[]>([
    "ESTUDIANTE",
  ]);

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [resultado, setResultado] =
    useState<UsuarioRegistrado | null>(null);

  const accessToken = auth.user?.access_token;

  const autorizado = useMemo(
    () =>
      auth.isAuthenticated &&
      tieneGrupoAdministrador(accessToken),
    [auth.isAuthenticated, accessToken]
  );

  function cambiarRol(
    rol: RolRegistro,
    seleccionado: boolean
  ) {
    setRoles((actuales) =>
      seleccionado
        ? Array.from(new Set([...actuales, rol]))
        : actuales.filter((item) => item !== rol)
    );
  }

  async function registrar(
    evento: React.SubmitEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (enviandoRef.current) return;

    setError("");
    setResultado(null);

    if (!autorizado || !accessToken) {
      setError(
        "No tienes una sesión administrativa autorizada."
      );
      return;
    }

    let datos;

    try {
      datos = validarRegistroAdministrativo({
        nombre,
        email,
        password,
        phoneNumber,
        roles,
      });
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "Revisa los datos del formulario."
      );
      return;
    }

    const confirmado = window.confirm(
      `¿Confirmas el registro de ${datos.nombre} ` +
      `con los roles ${datos.roles.join(", ")}?`
    );

    if (!confirmado) return;

    enviandoRef.current = true;
    setCargando(true);

    try {
      const usuario =
        await registrarUsuarioAdministrativoApi(
          datos,
          accessToken
        );

      setResultado(usuario);
      onUsuarioRegistrado?.(usuario);
      setNombre("");
      setEmail("");
      setPassword("");
      setPhoneNumber("");
      setRoles(["ESTUDIANTE"]);
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No fue posible registrar el usuario."
      );
    } finally {
      enviandoRef.current = false;
      setCargando(false);
    }
  }

  if (auth.isLoading) {
    return <p>Verificando sesión administrativa...</p>;
  }

  if (!autorizado) {
    return (
      <div className={styles.avisoError} role="alert">
        Acceso restringido. Debes iniciar sesión con una
        cuenta perteneciente al grupo ADMINISTRADOR
        de AWS Cognito.
      </div>
    );
  }

  return (
    <section className={styles.contenedor}>
      <h2>Registrar nuevo usuario</h2>

      <p>
        Crea una cuenta institucional y asigna uno o
        varios perfiles de acceso.
      </p>

      <form onSubmit={registrar} className={styles.formulario}>
        <label className={styles.campo}>
          Nombre completo
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={100}
            required
            disabled={cargando}
            autoComplete="name"
          />
        </label>

        <label className={styles.campo}>
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={cargando}
            autoComplete="off"
          />
        </label>

        <label className={styles.campo}>
          Contraseña inicial
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            maxLength={64}
            required
            disabled={cargando}
            autoComplete="new-password"
          />
        </label>

        <label className={styles.campo}>
          Teléfono móvil (formato internacional)
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+56912345678"
            pattern="\+[1-9][0-9]{1,14}"
            title="Introduce el número con + y código de país, por ejemplo +56912345678"
            required
            disabled={cargando}
            autoComplete="tel"
          />
        </label>

        <fieldset className={styles.roles} disabled={cargando}>
          <legend>Roles del usuario</legend>

          {ROLES_REGISTRO.map((rol) => (
            <label key={rol} className={styles.opcion}>
              <input
                type="checkbox"
                checked={roles.includes(rol)}
                onChange={(e) =>
                  cambiarRol(rol, e.target.checked)
                }
              />
              {NOMBRES_ROLES[rol]}
            </label>
          ))}
        </fieldset>

        <p className={styles.ayuda}>
          Puedes seleccionar varios roles para una misma
          cuenta. La asignación se realiza durante el registro.
        </p>

        <button
          type="submit"
          disabled={cargando || roles.length === 0}
          className={styles.boton}
        >
          {cargando
            ? "Registrando usuario..."
            : "Registrar usuario"}
        </button>
      </form>

      {error && (
        <div className={styles.avisoError} role="alert">
          {error}
        </div>
      )}

      {resultado && (
        <div className={styles.avisoExito} role="status">
          <strong>Usuario registrado correctamente</strong>
          <p>Nombre: {resultado.nombre}</p>
          <p>Correo: {resultado.email}</p>
          <p>Identificador: {resultado.id}</p>
          <p>Roles: {resultado.roles.join(", ")}</p>
        </div>
      )}
    </section>
  );
}
