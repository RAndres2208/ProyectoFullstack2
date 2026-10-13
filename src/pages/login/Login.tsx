import { useState } from "react";
import type { FormEvent } from "react";
import styles from "./Login.module.css";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};

    if (!email.trim()) {
      nextErrors.email = "Ingrese su correo.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Ingrese un correo válido.";
    }

    if (!password) {
      nextErrors.password = "Ingrese su contraseña.";
    }

    setErrors(nextErrors);
    setMessage("");

    if (Object.keys(nextErrors).length === 0) {
      setMessage(
        "Formato válido. La conexión para iniciar sesión está pendiente."
      );
    }
  }

  return (
    <section className={styles.login}>
      <header className={styles.header}>
        <p className={styles.subtitle}>Tienda Online</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresa tus datos para acceder a tu cuenta.</p>
      </header>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
        noValidate
      >
        <div>
          <label htmlFor="login-email">Correo electrónico</label>

          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="username"
            placeholder="nombre@correo.cl"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setMessage("");
            }}
            required
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? "login-email-error" : undefined
            }
          />

          {errors.email && (
            <p id="login-email-error" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="login-password">Contraseña</label>

          <input
            id="login-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setMessage("");
            }}
            required
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "login-password-error" : undefined
            }
          />

          {errors.password && (
            <p id="login-password-error" role="alert">
              {errors.password}
            </p>
          )}

          <button
            className={styles.toggle}
            type="button"
            aria-controls="login-password"
            aria-pressed={showPassword}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
          </button>
        </div>

        <button className={styles.submit} type="submit">
          Validar datos
        </button>

        <p className={styles.message} role="status">
          {message}
        </p>
      </form>

      <p className={styles.notice}>
        La autenticación estará disponible cuando conectemos el servicio.
      </p>
    </section>
  );
}