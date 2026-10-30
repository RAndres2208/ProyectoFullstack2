import { PageLayout } from "../../components/page-layout/PageLayout";
import { cursosDemo } from "../../data/cursosData";

export function MisCursos() {
  const misCursos = cursosDemo.filter(c => c.id === "CUR-001" || c.id === "CUR-002");

  return (
    <PageLayout titulo="Mis Cursos" descripcion="Cursos inscritos - Solo consulta" volverA="/estudiante/dashboard" rol="Estudiante" demo="DUOC UC · DEMO">
      <div style={{display:"grid",gap:"1rem",marginTop:"1rem"}}>
        {misCursos.map(curso => (
          <div key={curso.id} style={{background:"#fff",padding:"1.5rem",borderRadius:"0.75rem",border:"1px solid rgba(120,47,64,0.2)"}}>
            <h3 style={{margin:"0 0 0.5rem 0",color:"#782f40"}}>{curso.nombre}</h3>
            <p style={{margin:"0.25rem 0",color:"#6b4f4f"}}>{curso.descripcion}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:"0.5rem",marginTop:"1rem"}}>
              <div><strong>Codigo:</strong> {curso.codigo}</div>
              <div><strong>Docente:</strong> {curso.docente}</div>
              <div><strong>Estado:</strong> <span style={{padding:"0.25rem 0.5rem",background:"#e8f5e9",borderRadius:"0.25rem",fontSize:"0.75rem"}}>{curso.estado}</span></div>
              <div><strong>Estudiantes:</strong> {curso.estudiantes}</div>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  );
}
