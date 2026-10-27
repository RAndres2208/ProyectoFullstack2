
export type ProyectoApi = {
  id: number;
  nombre: string;
  estado: string;
  participantes: number;
};

type RespuestaProyectos = {
  success: boolean;
  data: ProyectoApi[];
};

export async function obtenerProyectosApi(
  accessToken: string
): Promise<ProyectoApi[]> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("Falta configurar VITE_API_URL");
  }

  const respuesta = await fetch(
    `${apiUrl.replace(/\/$/, "")}/api/proyectos`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  if (!respuesta.ok) {
    throw new Error(
      `Error al consultar proyectos: HTTP ${respuesta.status}`
    );
  }

  const resultado: RespuestaProyectos =
    await respuesta.json();

  if (!resultado.success || !Array.isArray(resultado.data)) {
    throw new Error("Respuesta inválida de la API");
  }

  return resultado.data;
}
