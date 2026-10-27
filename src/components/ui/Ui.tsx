import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";
import styles from "./Ui.module.css";

type Tono = "neutral" | "exito" | "advertencia" | "peligro" | "info";

const tonos: Record<Tono, string> = {
  neutral: styles.tonoNeutral,
  exito: styles.tonoExito,
  advertencia: styles.tonoAdvertencia,
  peligro: styles.tonoPeligro,
  info: styles.tonoInfo,
};

const avisos: Record<Tono, string> = {
  neutral: styles.avisoNeutral,
  exito: styles.avisoExito,
  advertencia: styles.avisoAdvertencia,
  peligro: styles.avisoPeligro,
  info: styles.avisoInfo,
};

export function Etiqueta({
  children,
  tono = "neutral",
}: {
  children: ReactNode;
  tono?: Tono;
}) {
  return (
    <span className={`${styles.etiqueta} ${tonos[tono]}`}>
      {children}
    </span>
  );
}

export function TarjetaResumen({
  etiqueta,
  valor,
  detalle,
  icono,
  tono = "neutral",
}: {
  etiqueta: string;
  valor: string | number;
  detalle?: string;
  icono?: ReactNode;
  tono?: Tono;
}) {
  return (
    <article className={styles.resumenTarjeta}>
      <div className={styles.resumenCabecera}>
        <span className={styles.resumenEtiqueta}>{etiqueta}</span>
        {icono && (
          <span
            className={`${styles.resumenIcono} ${tonos[tono]}`}
            aria-hidden="true"
          >
            {icono}
          </span>
        )}
      </div>

      <strong className={styles.resumenValor}>{valor}</strong>

      {detalle && <p className={styles.resumenDetalle}>{detalle}</p>}
    </article>
  );
}

export function AvisoDemo({ children }: { children: ReactNode }) {
  return (
    <aside className={styles.avisoDemo} role="note">
      <span className={styles.avisoDemoIcono} aria-hidden="true">
        ◈
      </span>
      <p>{children}</p>
    </aside>
  );
}

export function Aviso({
  children,
  tono = "info",
}: {
  children: ReactNode;
  tono?: Tono;
}) {
  return (
    <div
      className={`${styles.aviso} ${avisos[tono]}`}
      role={tono === "peligro" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function BarraProgreso({
  valor,
  umbral,
  etiqueta,
}: {
  valor: number;
  umbral?: number;
  etiqueta?: string;
}) {
  const valorSeguro = Math.min(100, Math.max(0, valor));
  const umbralSeguro =
    umbral === undefined
      ? undefined
      : Math.min(100, Math.max(0, umbral));

  return (
    <div className={styles.barraGrupo}>
      {etiqueta && (
        <div className={styles.barraMeta}>
          <span>{etiqueta}</span>
          <strong>{valorSeguro.toLocaleString("es-CL")}%</strong>
        </div>
      )}

      <div
        className={styles.barra}
        role="progressbar"
        aria-label={etiqueta ?? "Progreso"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valorSeguro}
      >
        <span
          className={styles.barraRelleno}
          style={{ width: `${valorSeguro}%` }}
        />

        {umbralSeguro !== undefined && (
          <span
            className={styles.barraMarca}
            style={{ left: `${umbralSeguro}%` }}
            title={`Umbral configurado: ${umbralSeguro}%`}
          />
        )}
      </div>
    </div>
  );
}

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: ReactNode;
}) {
  return (
    <div className={styles.vacio}>
      <span className={styles.vacioIcono} aria-hidden="true">
        ◌
      </span>
      <h3>{titulo}</h3>
      <p>{descripcion}</p>
      {accion && <div className={styles.vacioAccion}>{accion}</div>}
    </div>
  );
}

function construirPaginas(
  actual: number,
  total: number
): Array<number | "elipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  if (actual <= 4) {
    return [1, 2, 3, 4, 5, "elipsis", total];
  }

  if (actual >= total - 3) {
    return [
      1,
      "elipsis",
      total - 4,
      total - 3,
      total - 2,
      total - 1,
      total,
    ];
  }

  return [1, "elipsis", actual - 1, actual, actual + 1, "elipsis", total];
}

export function Paginacion({
  pagina,
  totalPaginas,
  onCambiar,
}: {
  pagina: number;
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) {
    return null;
  }

  const paginas = construirPaginas(pagina, totalPaginas);

  return (
    <nav className={styles.paginacion} aria-label="Paginación de resultados">
      <span className={styles.paginaInfo}>
        Página {pagina} de {totalPaginas}
      </span>

      <div className={styles.paginaBotones}>
        <button
          type="button"
          className={styles.paginaBoton}
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 1}
          aria-label="Página anterior"
        >
          ‹
        </button>

        {paginas.map((item, indice) =>
          item === "elipsis" ? (
            <span
              key={`elipsis-${indice}`}
              className={styles.paginaElipsis}
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`${styles.paginaBoton} ${
                item === pagina ? styles.paginaActiva : ""
              }`}
              onClick={() => onCambiar(item)}
              aria-label={`Ir a la página ${item}`}
              aria-current={item === pagina ? "page" : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className={styles.paginaBoton}
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina >= totalPaginas}
          aria-label="Página siguiente"
        >
          ›
        </button>
      </div>
    </nav>
  );
}

export function Modal({
  abierto,
  titulo,
  onCerrar,
  children,
  pie,
  amplio = false,
}: {
  abierto: boolean;
  titulo: string;
  onCerrar: () => void;
  children: ReactNode;
  pie?: ReactNode;
  amplio?: boolean;
}) {
  const tituloId = useId();
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const onCerrarRef = useRef(onCerrar);

  useEffect(() => {
    onCerrarRef.current = onCerrar;
  }, [onCerrar]);

  useEffect(() => {
    if (!abierto) {
      return;
    }

    const enfocadoAntes = document.activeElement;

    cerrarRef.current?.focus();

    function manejarTecla(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        onCerrarRef.current();
      }
    }

    const overflowAnterior = document.body.style.overflow;

    document.addEventListener("keydown", manejarTecla);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", manejarTecla);
      document.body.style.overflow = overflowAnterior;

      if (enfocadoAntes instanceof HTMLElement) {
        enfocadoAntes.focus();
      }
    };
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  return (
    <div
      className={styles.modalFondo}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) {
          onCerrar();
        }
      }}
    >
      <section
        className={`${styles.modal} ${
          amplio ? styles.modalAmplio : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
      >
        <header className={styles.modalCabecera}>
          <h2 id={tituloId}>{titulo}</h2>
          <button
            ref={cerrarRef}
            type="button"
            className={styles.modalCerrar}
            onClick={onCerrar}
            aria-label="Cerrar ventana"
          >
            ×
          </button>
        </header>

        <div className={styles.modalCuerpo}>{children}</div>

        {pie && <footer className={styles.modalPie}>{pie}</footer>}
      </section>
    </div>
  );
}

export function Buscador({
  id,
  etiqueta,
  valor,
  onChange,
  placeholder,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  placeholder: string;
}) {
  return (
    <div className={styles.buscador}>
      <label htmlFor={id} className={styles.srOnly}>
        {etiqueta}
      </label>

      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </svg>

      <input
        id={id}
        type="search"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
