
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider, type AuthProviderProps } from 'react-oidc-context'
import './index.css'
import App from './App.tsx'

const cognitoAuthConfig: AuthProviderProps = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY ??
    'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_XdVo5gbST',

  client_id:
    import.meta.env.VITE_OIDC_CLIENT_ID ??
    '13ucrn86m1rdgcvgmvf4pbo01f',

  redirect_uri:
    import.meta.env.VITE_OIDC_REDIRECT_URI ??
    'https://proyectofullstack-iota.vercel.app/',

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
      <App />
    </AuthProvider>
  </StrictMode>,
)
