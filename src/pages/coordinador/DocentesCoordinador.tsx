import { useMemo, useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import {
  AvisoDemo,
  Buscador,
  EstadoVacio,
  Etiqueta,
} from "../../components/ui/Ui";
import { docentesCoordinacionDemo } from "../../data/coordinacionData";
import { normalizarTexto } from "../../utils/format";
import dashboardStyles from "../dashboard/Dashboard.module.css";

export function DocentesCoordinador() {
  const [busqueda, setBusqueda] = useState("");

  const docentesFiltrados = useMemo(() => {
    const texto = normalizarTexto(busqueda);

    return docentesCoordinacionDemo.filter((docente) => {
      if (!texto) {
        return true;
      }

      return normalizarTexto(
        `${docente.nombre} ${docente.email} ${docente.cursos.join(" ")}`
      ).includes(texto);
    });
  }, [busqueda]);

  return (
    <PageLayout
      titulo="Docentes asignados"
      descripcion="Seguimiento del equipo docente del ámbito · Datos de demostración"
      volverA="/coordinador/dashboard"
      rol="◈ Coordinador"
      demo="DUOC UC · DEMO"
    >
      <AvisoDemo>
        Los docentes, correos y porcentajes son ficticios. No existe aún un
        endpoint de coordinación para consultar esta información.
      </AvisoDemo>

      <section className={dashboardStyles.section}>
        <header className={dashboardStyles.sectionHeader}>
          <div>
            <h3>Equipo docente</h3>
            <p>Cursos y asistencia de referencia</p>
          </div>
        </header>

        <Buscador
          id="buscar-docentes-coordinador"
          etiqueta="Buscar docentes por nombre, correo o curso"
          valor={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar por nombre, correo o curso..."
        />

        {docentesFiltrados.length === 0 ? (
          <EstadoVacio
            titulo="Sin docentes coincidentes"
            descripcion="Ajusta la búsqueda para ver otros docentes del ámbito."
          />
        ) : (
          <div className={dashboardStyles.tableWrapper}>
            <table className={dashboardStyles.table}>
              <thead>
                <tr>
                  <th>Docente</th>
                  <th>Correo</th>
                  <th>Cursos</th>
                  <th>Estudiantes</th>
                  <th>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {docentesFiltrados.map((docente) => (
                  <tr key={docente.id}>
                    <td>{docente.nombre}</td>
                    <td>{docente.email}</td>
                    <td>{docente.cursos.join(", ")}</td>
                    <td>{docente.estudiantes}</td>
                    <td>
                      <Etiqueta
                        tono={
                          docente.asistencia >= 80
                            ? "exito"
                            : "advertencia"
                        }
                      >
                        {docente.asistencia}%
                      </Etiqueta>
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
