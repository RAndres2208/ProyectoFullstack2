import { useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { estudiantesDemo } from "../../data/cursosData";

export function EstudiantesDocente() {
  const [estudiantes] = useState(estudiantesDemo);
  const [busqueda, setBusqueda] = useState("");
  const estudiantesFiltrados = estudiantes.filter(e => 
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PageLayout titulo="Mantenedor de Estudiantes" descripcion="Gestión académica - Modo demostración" volverA="/docente/dashboard" rol="◈ Docente · Coordinador" demo="DUOC UC · DEMO">
      <div style={{display:"flex",gap:"1rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
        <input type="search" placeholder="Buscar por nombre o email..." value={busqueda} onChange={(e)=>setBusqueda(e.target.value)} style={{flex:"1",minWidth:"200px",padding:"0.75rem",borderRadius:"0.5rem",border:"1px solid #ddd"}}/>
      </div>
      <div style={{background:"#fff",borderRadius:"0.75rem",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{background:"#f8f9fa"}}>
            <tr>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Nombre</th>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Email</th>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Carrera</th>
              <th style={{padding:"1rem",textAlign:"left",borderBottom:"2px solid #dee2e6"}}>Cursos</th>
            </tr>
          </thead>
          <tbody>
            {estudiantesFiltrados.map(est => (
              <tr key={est.id} style={{borderBottom:"1px solid #f1f1f1"}}>
                <td style={{padding:"1rem"}}>{est.nombre}</td>
                <td style={{padding:"1rem"}}>{est.email}</td>
                <td style={{padding:"1rem"}}>{est.carrera}</td>
                <td style={{padding:"1rem"}}>{est.cursos.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{marginTop:"1rem",color:"#666",fontSize:"0.875rem"}}>Datos de demostración - Segundo mantenedor web</p>
    </PageLayout>
  );
}
