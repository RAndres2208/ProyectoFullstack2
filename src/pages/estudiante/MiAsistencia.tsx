import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  Aviso,
  AvisoDemo,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import { useAcademico } from "../../context/AcademicoContext";
import { obtenerNombreUsuario } from "../../auth/roles";
import type { EstadoAsistencia } from "../../types/academico";
import { resolverEstudianteActivo } from "../../utils/academico";
import { formatearFecha } from "../../utils/format";
import styles from "../dashboard/Dashboard.module.css";

function tonoAsistencia(estado: EstadoAsistencia) {
  if (estado === "Presente") {
    return "exito" as const;
  }

  if (estado === "Atrasado") {
    return "advertencia" as const;
  }

  return "peligro" as const;
}

export function MiAsistencia() {
  const auth = useAuth();
  const nombre = obtenerNombreUsuario(auth.user?.profile);
  const {
    estudiantes,
    registrosAsistencia,
    listarCursosPorPerfil,
  } = useAcademico();

  const { estudiante, vinculado } = useMemo(
    () => resolverEstudianteActivo(auth.user?.profile, estudiantes),
    [auth.user?.profile, estudiantes]
  );

  const cursosDelEstudiante = useMemo(
    () =>
      estudiante
        ? listarCursosPorPerfil({
            rol: "estudiante",
            estudianteId: estudiante.id,
          })
        : [],
    [estudiante, listarCursosPorPerfil]
  );

  const historial = useMemo(() => {
    if (!estudiante) {
      return [];
    }

    const idsCursos = new Set(cursosDelEstudiante.map((curso) => curso.id));

    return registrosAsistencia
      .filter(
        (registro) =>
          registro.estudianteId === estudiante.id &&
          idsCursos.has(registro.cursoId)
      )
      .sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return b.fecha.localeCompare(a.fecha);
        }

        return b.registradoEn.localeCompare(a.registradoEn);
      });
  }, [cursosDelEstudiante, estudiante, registrosAsistencia]);

  const nombresCursos = useMemo(
    () => new Map(cursosDelEstudiante.map((curso) => [curso.id, curso.nombre])),
    [cursosDelEstudiante]
  );

  const resumen = useMemo(() => {
    const conteo: Record<EstadoAsistencia, number> = {
      Presente: 0,
      Atrasado: 0,
      Ausente: 0,
    };

    for (const registro of historial) {
      conteo[registro.estado] += 1;
    }

    return conteo;
  }, [historial]);

  return (
    <PageLayout
      titulo="Mi Asistencia"
      descripcion="Registro de asistencia · Solo consulta"
      volverA="/estudiante/dashboard"
      rol="◈ Estudiante"
      demo="DUOC UC · DEMO"
    >
      <div className={styles.welcome}>
        <div>
          <p className={styles.welcomeLabel}>Hola,</p>
          <h2 className={styles.welcomeName}>{nombre}</h2>
          <p className={styles.welcomeSubtitle}>
            Consulta tu historial de asistencia
          </p>
        </div>
      </div>

      <AvisoDemo>
        Los registros provienen de la demostración en memoria de esta sesión y
        no de la API. Esta pantalla es solo de consulta: los estudiantes no
        pueden registrar ni modificar asistencia.
      </AvisoDemo>

      {vinculado && estudiante ? (
        <Aviso tono="info">
          Sesión vinculada por correo o nombre con la ficha de{" "}
          <strong>{estudiante.nombre}</strong>.
        </Aviso>
      ) : (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha estudiantil
          de demostración. Se muestra como referencia la ficha de{" "}
          <strong>{estudiante?.nombre ?? "un estudiante de ejemplo"}</strong>;
          este vínculo no es real.
        </Aviso>
      )}

      {historial.length > 0 && (
        <p className={styles.note}>
          Registros encontrados: {historial.length} · Presente:{" "}
          {resumen.Presente} · Atrasado: {resumen.Atrasado} · Ausente:{" "}
          {resumen.Ausente}
        </p>
      )}

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <div>
            <h3>Historial</h3>
            <p>Últimos registros de tus cursos inscritos</p>
          </div>
        </header>

        {historial.length === 0 ? (
          <EstadoVacio
            titulo="Sin registros de asistencia"
            descripcion="La ficha de demostración no tiene asistencias registradas para sus cursos."
          />
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((registro) => (
                  <tr key={registro.id}>
                    <td>
                      {nombresCursos.get(registro.cursoId) ??
                        registro.cursoId}
                    </td>
                    <td>{formatearFecha(registro.fecha)}</td>
                    <td>
                      <Etiqueta tono={tonoAsistencia(registro.estado)}>
                        {registro.estado}
                      </Etiqueta>
                    </td>
                    <td>
                      {registro.origen === "demo"
                        ? "Memoria de la sesión"
                        : "API"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.note}>
          Solo consulta. La persistencia real requiere el contrato de asistencia
          del backend.
        </p>
      </section>
    </PageLayout>
  );
}
