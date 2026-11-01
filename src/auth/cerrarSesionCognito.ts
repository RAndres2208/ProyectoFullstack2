
/**
 * Cierre de sesión de SyncPass compatible con AWS Cognito.
 *
 * Elimina la sesión local administrada por react-oidc-context
 * y después redirige al endpoint /logout de Cognito.
 */

const isDev = import.meta.env.DEV;

const logoutUri =
  import.meta.env.VITE_OIDC_LOGOUT_URI ??
  (isDev
    ? "http://localhost:5173/"
    : "https://proyectofullstack-iota.vercel.app/");

const clientId =
  import.meta.env.VITE_OIDC_CLIENT_ID ??
  "13ucrn86m1rdgcvgmvf4pbo01f";

// Dominio del inicio de sesión administrado de Cognito.
// No es la URL authority del proveedor OIDC.
const cognitoDomain =
  import.meta.env.VITE_COGNITO_DOMAIN ??
  "https://us-east-1xdvo5gbst.auth.us-east-1.amazoncognito.com";

type AdministradorSesion = {
  removeUser: () => Promise<void>;
};

let cerrandoSesion = false;

export async function cerrarSesionCognito(
  auth: AdministradorSesion
): Promise<void> {
  if (cerrandoSesion) return;

  cerrandoSesion = true;

  try {
    // Eliminar los tokens almacenados por oidc-client-ts.
    await auth.removeUser();

    // Construir la URL del endpoint de salida.
    const dominio = cognitoDomain.replace(/\/+$/, "");
    const url = new URL(`${dominio}/logout`);

    url.searchParams.set("client_id", clientId);
    url.searchParams.set("logout_uri", logoutUri);

    // Abandonar SyncPass y cerrar la sesión administrada
    // por Cognito.
    window.location.assign(url.toString());
  } catch (error) {
    cerrandoSesion = false;

    console.error(
      "No fue posible completar el cierre de sesión.",
      error
    );

    throw new Error(
      "Ocurrió un problema al cerrar la sesión."
    );
  }
}
