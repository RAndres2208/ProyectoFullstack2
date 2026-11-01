import { useMemo, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  AvisoDemo,
  Buscador,
  EstadoVacio,
} from "../../components/ui/Ui";
import { cursosDemo } from "../../data/cursosData";
import { normalizarTexto } from "../../utils/format";
import dashboardStyles from "../dashboard/Dashboard.module.css";

export function CursosCoordinador() {
  const [busqueda, setBusqueda] = useState("");

  const cursosFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return cursosDemo.filter((curso) => {
      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${curso.nombre} ${curso.codigo} ${curso.docente}`
      ).includes(texto);
    });
  }, [busqueda]);

  return (
    <PageLayout
      titulo="Cursos del ámbito"
      descripcion="Consulta de cursos y docentes asignados · Datos de demostración"
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        El listado es demostrativo. La API todavía no expone un endpoint de
        cursos filtrado por el ámbito del coordinador.
      </AvisoDemo>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Listado de cursos</h3>
            <p>Información académica de referencia</p>
          </div>
        </header>

        <Buscador
          id="buscar-cursos-coordinador"
          etiqueta="Buscar cursos por nombre, código o docente"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre, código o docente..."
        />

        {cursosFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="Sin cursos coincidentes"
            descripcion="Ajusta la búsqueda para ver otros cursos del ámbito."
          />
        ) : (
          <div className={dashboardStyles.tableWrapper}>
            <table className={dashboardStyles.table}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Curso</th>
                  <th>Docente</th>
                  <th>Estudiantes</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cursosFiltrados.map((curso) => (
                  <tr key={curso.id}>
                    <td>{curso.codigo}</td>
                    <td>{curso.nombre}</td>
                    <td>{curso.docente}</td>
                    <td>{curso.estudiantes}</td>
                    <td>
                      <span
                        className={
                          curso.estado === "Activo"
                            ? dashboardStyles.badgeSuccess
                            : dashboardStyles.badgeWarning
                        }
                      >
                        {curso.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageLayout>
  );
}
