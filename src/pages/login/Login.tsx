
import { useState, type FormEvent } from "react";
import { useAuth } from "react-oidc-context";

function ScanIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
      <path d="M8 12h8" />
    </svg>
  );
}

function ShieldIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2 20 6v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function Login() {
  const auth = useAuth();
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");
    setProcesando(true);

    try {
      await auth.signinRedirect();
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(
        "No se pudo conectar con Amazon Cognito. Intenta nuevamente."
      );
      setProcesando(false);
    }
  }

  return (
    <div className="syncpass-page">
      <aside className="desktop-panel">
        <div className="desktop-brand">
          <ScanIcon size={32} />
          <span>SyncPass</span>
        </div>

        <div className="desktop-presentation">
          <span className="desktop-badge">
            Plataforma de gestión institucional
          </span>

          <h1>
            Tu comunidad,
            <br />
            mejor conectada.
          </h1>

          <p>
            Gestiona proyectos, registra asistencias
            y fortalece la participación de tu comunidad
            desde una sola plataforma.
          </p>

          <div className="desktop-features">
            <div>✓ Gestión de proyectos comunitarios</div>
            <div>✓ Registro de asistencia mediante QR</div>
            <div>✓ Seguimiento y reportes</div>
            <div>✓ Preparado para trabajar sin conexión</div>
          </div>
        </div>

        <div className="desktop-footer">
          SyncPass · Duoc UC
        </div>
      </aside>

      <div className="mobile-app">
        <div
          className="status-bar"
          aria-label="Barra de estado ilustrativa"
        >
          <span>10:42</span>
          <span aria-hidden="true">▂▄▆ ◉ ▣</span>
        </div>

        <header className="syncpass-header">
          <div className="brand">
            <span className="brand-icon">
              <ScanIcon size={23} />
            </span>
            <span>SyncPass</span>
          </div>

          <span className="header-shield">
            <ShieldIcon />
          </span>
        </header>

        <main className="login-content">
          <div className="institution-row">
            <span className="institution-badge">
              <ShieldIcon size={15} />
              Acceso institucional
            </span>

            <span className="institution-demo">
              DUOC UC · DEMO
            </span>
          </div>

          <section className="login-introduction">
            <div className="hero-icon">
              <ScanIcon size={35} />
            </div>

            <h1>
              Tu comunidad,
              <br />
              mejor conectada.
            </h1>

            <p>
              Proyectos, participación y asistencia
              <br className="desktop-break" />
              {" "}en un solo lugar.
            </p>
          </section>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-field">
              <p>
                Inicia sesión de forma segura
                utilizando tu cuenta institucional.
              </p>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            {auth.isAuthenticated ? (
              <p>
                Ya tienes una sesión iniciada.
                Puedes acceder al panel principal.
              </p>
            ) : (
              <button
                type="submit"
                className="login-button"
                disabled={
                  procesando ||
                  auth.isLoading ||
                  Boolean(auth.activeNavigator)
                }
              >
                <span aria-hidden="true">→</span>
                {procesando
                  ? "Redirigiendo..."
                  : "Ingresar con Cognito"}
              </button>
            )}
          </form>

          <div className="role-information">
            <ShieldIcon size={21} />

            <div>
              <strong>Acceso según tu rol</strong>
              <p>
                Tu institución asigna los permisos de uso.
              </p>
            </div>
          </div>

          <footer className="login-footer">
            <strong>Duoc UC · DSY1105</strong>
            <span>
              Desarrollo de Aplicaciones Móviles
            </span>
          </footer>
        </main>

        <div
          className="home-indicator"
          aria-hidden="true"
        >
          <span />
        </div>
      </div>
    </div>
  );
}
