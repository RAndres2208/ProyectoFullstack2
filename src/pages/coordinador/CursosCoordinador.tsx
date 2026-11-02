import { PageLayout } from "../../components/page-layout/PageLayout";
import { AvisoDemo } from "../../components/ui/Ui";
import { GestionCursos } from "../../components/academico/GestionCursos";
import { useAcademico } from "../../context/AcademicoContext";

export function CursosCoordinador() {
  const { cursos } = useAcademico();

  return (
    <PageLayout
      titulo="Cursos del ámbito"
      descripcion="Gestión y consulta de cursos, docentes y matrículas · Modo demostración"
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Los cursos se gestionan solo en memoria de esta sesión. No se envían a
        PostgreSQL ni a la API: el backend aún no publica un contrato académico.
      </AvisoDemo>

      <GestionCursos
        cursos={cursos}
        puedeGestionar={true}
        titulo="Administración de cursos"
        descripcion="Crea, edita, asigna docentes e inscribe estudiantes en el ámbito coordinador."
      />
    </PageLayout>
  );
}
