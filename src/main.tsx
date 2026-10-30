
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, type AuthProviderProps } from 'react-oidc-context'
import './index.css'
import App from './App.tsx'
import { DemoRoleProvider } from './auth/demoRole'
import { VistaPreviaProvider } from './auth/vistaPrevia'

const isDev = import.meta.env.DEV;
const redirectUri = 
  import.meta.env.VITE_OIDC_REDIRECT_URI ?? 
  (isDev ? 'http://localhost:5173/' : 'https://proyectofullstack-iota.vercel.app/');

const cognitoAuthConfig: AuthProviderProps = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY ??
    'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XdVo5gbST',

  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID ??
    '13ucrn86m1rdgcvgmvf4pbo01f',

  redirect_uri: redirectUri,

  response_type: 'code',
  scope: 'email openid phone',

  onSigninCallback: () => {
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname,
    )
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider {...cognitoAuthConfig}>
      <DemoRoleProvider>
        <VistaPreviaProvider>
          <App />
        </VistaPreviaProvider>
      </DemoRoleProvider>
    </AuthProvider>
  </StrictMode>,
)
