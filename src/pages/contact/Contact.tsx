import { useState } from "react";
import type { FormEvent } from "react";

interface ContactForm {
  nombre: string;
  correo: string;
  telefono: string;
  mensaje: string;
}

type FormErrors = Partial<Record<keyof ContactForm, string>>;

const initialForm: ContactForm = {
  nombre: "",
  correo: "",
  telefono: "",
  mensaje: "",
};

export function Contact() {
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState("");

  function updateField(field: keyof ContactForm, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setSuccess("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!form.nombre.trim()) {
      nextErrors.nombre = "Debe ingresar su nombre.";
    }

    if (!form.correo.trim()) {
      nextErrors.correo = "Debe ingresar su correo.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo.trim())
    ) {
      nextErrors.correo = "Ingrese un correo válido.";
    }

    const phone = form.telefono.trim();
    const phoneDigits = phone.replace(/\D/g, "");

    if (!phone) {
      nextErrors.telefono = "Debe ingresar su teléfono.";
    } else if (
      !/^\+?[\d\s()-]+$/.test(phone) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      nextErrors.telefono =
        "Ingrese un teléfono de entre 7 y 15 dígitos.";
    }

    if (!form.mensaje.trim()) {
      nextErrors.mensaje = "Debe escribir un mensaje.";
    }

    setErrors(nextErrors);
    setSuccess("");

    if (Object.keys(nextErrors).length === 0) {
      setSuccess(
        "Datos validados correctamente. Este formulario aún no envía mensajes."
      );

      setForm(initialForm);
    }
  }

  return (
    <>
      <header>
        <h1>Contacto</h1>
      </header>

      <main>
        <h2>Formulario de contacto</h2>

        <p>
          Formulario de demostración: valida los datos,
          pero todavía no los envía a un servidor.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="nombre">Nombre:</label>

            <input
              id="nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={form.nombre}
              onChange={(event) =>
                updateField("nombre", event.target.value)
              }
              required
              aria-invalid={Boolean(errors.nombre)}
              aria-describedby={
                errors.nombre ? "error-nombre" : undefined
              }
            />

            {errors.nombre && (
              <p id="error-nombre" role="alert">
                {errors.nombre}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="correo">Correo:</label>

            <input
              id="correo"
              name="correo"
              type="email"
              autoComplete="email"
              value={form.correo}
              onChange={(event) =>
                updateField("correo", event.target.value)
              }
              required
              aria-invalid={Boolean(errors.correo)}
              aria-describedby={
                errors.correo ? "error-correo" : undefined
              }
            />

            {errors.correo && (
              <p id="error-correo" role="alert">
                {errors.correo}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="telefono">Teléfono:</label>

            <input
              id="telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              placeholder="+56 9 1234 5678"
              value={form.telefono}
              onChange={(event) =>
                updateField("telefono", event.target.value)
              }
              required
              aria-invalid={Boolean(errors.telefono)}
              aria-describedby={
                errors.telefono ? "error-telefono" : undefined
              }
            />

            {errors.telefono && (
              <p id="error-telefono" role="alert">
                {errors.telefono}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="mensaje">Mensaje:</label>

            <textarea
              id="mensaje"
              name="mensaje"
              rows={5}
              value={form.mensaje}
              onChange={(event) =>
                updateField("mensaje", event.target.value)
              }
              required
              aria-invalid={Boolean(errors.mensaje)}
              aria-describedby={
                errors.mensaje ? "error-mensaje" : undefined
              }
            />

            {errors.mensaje && (
              <p id="error-mensaje" role="alert">
                {errors.mensaje}
              </p>
            )}
          </div>

          <button type="submit">Validar formulario</button>

          <p role="status">{success}</p>
        </form>
      </main>

      <footer>
        <p>Robinson Rodriguez</p>
        <p>Proyecto Fullstack 2026</p>
      </footer>
    </>
  );
}