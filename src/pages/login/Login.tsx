import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";

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

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {hidden && <path d="M3 3 21 21" />}
    </svg>
  );
}

export function Login() {
  const [, navigate] = useLocation();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!usuario.trim() || !password.trim()) {
      setError("Debes ingresar tu usuario y contraseña.");
      return;
    }

    // Primera etapa: ingreso de demostración.
    // NO representa autenticación real.
    navigate("/dashboard");
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
        <div className="status-bar" aria-label="Barra de estado ilustrativa">
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

            <span className="institution-demo">DUOC UC · DEMO</span>
          </div>

          <section className="login-introduction">
            <div className="hero-icon">
              <ScanIcon size={35} />
            </div>

            <h1>Tu comunidad,<br />mejor conectada.</h1>

            <p>
              Proyectos, participación y asistencia
              <br className="desktop-break" /> en un solo lugar.
            </p>
          </section>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="usuario">Usuario institucional</label>

              <div className="input-wrapper">
                <input
                  id="usuario"
                  type="text"
                  placeholder="robinson.coordinador"
                  autoComplete="username"
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  aria-invalid={Boolean(error && !usuario.trim())}
                />

                <UserIcon />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="password">Contraseña</label>

              <div className="input-wrapper">
                <input
                  id="password"
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={Boolean(error && !password.trim())}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label={
                    mostrarPassword
                      ? "Ocultar contraseña"
                      : "Mostrar contraseña"
                  }
                  aria-pressed={mostrarPassword}
                >
                  <EyeIcon hidden={!mostrarPassword} />
                </button>
              </div>

              <p className="field-hint">
                Tu contraseña se mantiene oculta.
              </p>
            </div>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            <div className="forgot-password">
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    "La recuperación de contraseña se implementará en una próxima etapa."
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <button type="submit" className="login-button">
              <span aria-hidden="true">→</span>
              Ingresar
            </button>
          </form>

          <div className="role-information">
            <ShieldIcon size={21} />

            <div>
              <strong>Acceso según tu rol</strong>
              <p>Tu institución asigna los permisos de uso.</p>
            </div>
          </div>

          <footer className="login-footer">
            <strong>Duoc UC · DSY1105</strong>
            <span>Desarrollo de Aplicaciones Móviles</span>
          </footer>
        </main>

        <div className="home-indicator" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}