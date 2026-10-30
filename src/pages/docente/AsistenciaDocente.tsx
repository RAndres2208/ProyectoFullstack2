import { PageLayout } from "../../components/page-layout/PageLayout";
import { useState } from "react";

export function AsistenciaDocente() {
  const [asistencias] = useState([
    { id: 1, estudiante: "Ana García", curso: "Programación Web", fecha: "2025-10-20", estado: "Presente" },
    { id: 2, estudiante: "Carlos López", curso: "Base de Datos", fecha: "2025-10-20", estado: "Ausente" },
    { id: 3, estudiante: "María Rodríguez", curso: "Programación Web", fecha: "2025-10-21", estado: "Presente" },
  ]);

  return (
    <PageLayout titulo="Gestionar Asistencia" descripcion="Registro y control de asistencia - Modo demostración" volverA="/docente/dashboard" rol="◈ Docente · Coordinador" demo="DUOC UC · DEMO">
      <div style={{background:"#fff",borderRadius:"0.75rem",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",marginTop:"1rem"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{background:"#f8f9fa"}}>
            <tr>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Estudiante</th>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Curso</th>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Fecha</th>
              <th style={{padding:"1rem",textAlign:"center",borderBottom:"2px solid #dee2e6"}}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map(a => (
              <tr key={a.id} style={{borderBottom:"1px solid #f1f1f1"}}>
                <td style={{padding:"1rem"}}>{a.estudiante}</td>
                <td style={{padding:"1rem"}}>{a.curso}</td>
                <td style={{padding:"1rem"}}>{a.fecha}</td>
                <td style={{padding:"1rem",textAlign:"center"}}>
                  <span style={{padding:"0.25rem 0.75rem",background:a.estado==="Presente"?"#e8f5e9":"#ffebee",color:a.estado==="Presente"?"#2e7d32":"#c62828",borderRadius:"0.25rem",fontSize:"0.875rem"}}>{a.estado}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageLayout>
  );
}
