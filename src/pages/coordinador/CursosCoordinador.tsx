import { useAuth } from "react-oidc-context";
import { useDemoRole } from "../../auth/demoRole";
import { useVistaPrevia } from "../../auth/vistaPrevia";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { Aviso, AvisoDemo } from "../../components/ui/Ui";
import {
  GestionCursos,
  type ControladorCursosApi,
} from "../../components/academico/GestionCursos";
import { useAcademico } from "../../context/AcademicoContext";
import { useAcademicoApi } from "../../hooks/useAcademicoApi";

export function CursosCoordinador() {
  const auth = useAuth();
  const { esModoDemo } = useDemoRole();
  const { activo: vistaPreviaActiva } = useVistaPrevia();
  const { cursos } = useAcademico();

  // La API solo se habilita con una sesión real. La demo y la vista previa
  // siguen usando el estado local de AcademicoProvider.
  const apiHabilitada =
    auth.isAuthenticated && !esModoDemo && !vistaPreviaActiva;
  const academicoApi = useAcademicoApi(
    apiHabilitada,
    auth.user?.access_token
  );

  const controladorApi: ControladorCursosApi | undefined = apiHabilitada
    ? {
        cursos: academicoApi.cursos,
        docentes: academicoApi.docentes,
        cargando: academicoApi.estado === "cargando",
        error: academicoApi.error?.message ?? null,
        onReintentar: academicoApi.recargar,
        crearCurso: academicoApi.crearCurso,
        actualizarCurso: academicoApi.actualizarCurso,
        listarEstudiantes: academicoApi.listarEstudiantes,
        listarEstudiantesDeCurso: academicoApi.listarEstudiantesDeCurso,
        inscribirEstudiante: academicoApi.inscribirEstudiante,
        retirarEstudiante: academicoApi.retirarEstudiante,
      }
    : undefined;

  return (
    <PageLayout
      titulo="Cursos del ámbito"
      descripcion={
        apiHabilitada
          ? "Gestión y consulta de cursos del ámbito · Datos de SyncPass API"
          : "Gestión y consulta de cursos, docentes y matrículas · Modo demostración"
      }
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo={apiHabilitada ? "DUOC UC · API" : "DUOC UC · DEMO"}
    >
      {apiHabilitada ? (
        <Aviso tono="info">
          Los cursos y docentes se consultan con tu sesión de Cognito. La
          creación y edición se guardan en PostgreSQL mediante SyncPass API.
        </Aviso>
      ) : (
        <AvisoDemo>
          Esta vista de demostración usa cursos ficticios en memoria y no llama
          a la API. La versión con sesión real guarda los cambios en PostgreSQL.
        </AvisoDemo>
      )}

      <GestionCursos
        cursos={apiHabilitada ? undefined : cursos}
        api={controladorApi}
        puedeGestionar={true}
        titulo="Administración de cursos"
        descripcion="Crea, edita, asigna docentes e inscribe estudiantes en el ámbito coordinador."
      />
    </PageLayout>
  );
}
