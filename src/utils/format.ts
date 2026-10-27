/**
 * Utilidades de formato y exportación compartidas por las pantallas
 * de demostración de SyncPass.
 */

export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatearFecha(
  iso: string,
  opciones?: Intl.DateTimeFormatOptions
): string {
  const fecha = new Date(
    iso.includes("T") ? iso : `${iso}T00:00:00`
  );

  if (Number.isNaN(fecha.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat(
    "es-CL",
    opciones ?? {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(fecha);
}

export function formatearFechaHora(iso: string): string {
  return formatearFecha(iso, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatearFechaCorta(iso: string): string {
  return formatearFecha(iso, {
    day: "2-digit",
    month: "short",
  });
}

export function porcentaje(parte: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((parte / total) * 1000) / 10;
}

export function descargarCsv(
  nombreArchivo: string,
  encabezados: string[],
  filas: Array<Array<string | number>>
): void {
  const escapar = (valor: string | number) =>
    `"${String(valor).replace(/"/g, '""')}"`;

  const contenido = [encabezados, ...filas]
    .map((fila) => fila.map(escapar).join(";"))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");

  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function crearIdDemo(prefijo: string): string {
  return `${prefijo}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}
