
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  AuthProvider,
  type AuthProviderProps,
} from "react-oidc-context";

import "./index.css";
import App from "./App.tsx";

import { DemoRoleProvider } from "./auth/demoRole";
import { PerfilActivoProvider } from "./auth/perfilActivo";
import { VistaPreviaProvider } from "./auth/vistaPrevia";
import { AcademicoProvider } from "./context/AcademicoProvider";

// Detecta si estamos ejecutando SyncPass en desarrollo.
const isDev = import.meta.env.DEV;

// URL de retorno después del inicio de sesión.
const redirectUri =
  import.meta.env.VITE_OIDC_REDIRECT_URI ??
  (isDev
    ? "http://localhost:5173/"
    : "https://proyectofullstack-iota.vercel.app/");

// URL de retorno después del cierre de sesión.
const logoutUri =
  import.meta.env.VITE_OIDC_LOGOUT_URI ??
  (isDev
    ? "http://localhost:5173/"
    : "https://proyectofullstack-iota.vercel.app/");

// Configuración de autenticación con AWS Cognito.
const cognitoAuthConfig: AuthProviderProps = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY ??
    "https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XdVo5gbST",

  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID ??
    "13ucrn86m1rdgcvgmvf4pbo01f",

  // Regreso a SyncPass después de autenticarse.
  redirect_uri: redirectUri,

  // Regreso a SyncPass después del cierre de sesión OIDC.
  post_logout_redirect_uri: logoutUri,

  // Flujo de autorización OAuth 2.0.
  response_type: "code",

  // Permisos solicitados al iniciar sesión.
  scope: "email openid phone",

  // Limpia los parámetros de autenticación de la URL.
  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    );
  },
};

// Inicialización principal de SyncPass.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <DemoRoleProvider>
        <PerfilActivoProvider>
          <VistaPreviaProvider>
            <AcademicoProvider>
              <App />
            </AcademicoProvider>
          </VistaPreviaProvider>
        </PerfilActivoProvider>
      </DemoRoleProvider>
    </AuthProvider>
  </StrictMode>,
);
