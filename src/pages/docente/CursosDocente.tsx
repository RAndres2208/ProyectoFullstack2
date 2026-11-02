import { useMemo } from "react";
import { useAuth } from "react-oidc-context";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, AvisoDemo } from "../../components/ui/Ui";
import { GestionCursos } from "../../components/academico/GestionCursos";
import { useAcademico } from "../../context/AcademicoContext";
import { resolverDocenteActivo } from "../../utils/academico";

export function CursosDocente() {
  const auth = useAuth();
  const { cursos, docentes } = useAcademico();

  const { docente, vinculado } = useMemo(
    () => resolverDocenteActivo(auth.user?.profile, docentes),
    [auth.user?.profile, docentes]
  );

  const cursosDelDocente = useMemo(() => {
    if (!docente) {
      return cursos;
    }

    return cursos.filter((curso) => curso.docenteId === docente.id);
  }, [cursos, docente]);

  return (
    <PageLayout
      titulo="Gestión de Cursos"
      descripcion="Cursos, docentes y matrículas del perfil docente · Modo demostración"
      volverA="/docente/dashboard"
      rol="◈ Docente"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Los cambios se guardan solo en la memoria de esta sesión. No se envían a
        la API ni a PostgreSQL: el contrato académico aún no está disponible.
      </AvisoDemo>

      {vinculado && docente ? (
        <Aviso tono="info">
          Sesión vinculada por correo o nombre con la ficha docente de
          demostración <strong>{docente.nombre}</strong>. Se muestran únicamente
          sus cursos asignados.
        </Aviso>
      ) : (
        <Aviso tono="advertencia">
          No fue posible vincular tu sesión de Cognito con una ficha docente de
          demostración. Para no ocultar información, se muestran todos los cursos
          del ámbito de ejemplo.
        </Aviso>
      )}

      <GestionCursos
        cursos={cursosDelDocente}
        puedeGestionar={true}
        docentePredeterminadoId={docente?.id ?? null}
        titulo={docente ? `Cursos de ${docente.nombre}` : "Cursos del ámbito docente"}
        descripcion="Crea cursos, asigna docentes e inscribe estudiantes desde el perfil docente."
      />
    </PageLayout>
  );
}
