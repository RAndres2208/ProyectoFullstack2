import { useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { cursosDemo, type Curso } from "../../data/cursosData";

export function CursosDocente() {
  const [cursos, setCursos] = useState<Curso[]>(cursosDemo);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Curso | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", codigo: "", docente: "" });

  const cursosFiltrados = cursos.filter(c => 
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: "", descripcion: "", codigo: "", docente: "" });
    setMostrarForm(true);
  };

  const abrirEditar = (curso: Curso) => {
    setEditando(curso);
    setForm({ nombre: curso.nombre, descripcion: curso.descripcion, codigo: curso.codigo, docente: curso.docente });
    setMostrarForm(true);
  };

  const guardar = () => {
    if (editando) {
      setCursos(cursos.map(c => c.id === editando.id ? { ...c, ...form } : c));
    } else {
      const nuevo: Curso = {
        id: `CUR-${Date.now()}`,
        ...form,
        estado: "Activo",
        estudiantes: 0
      };
      setCursos([...cursos, nuevo]);
    }
    setMostrarForm(false);
  };

  const eliminar = (id: string) => {
    if (confirm("¿Eliminar este curso? Esta acción es de demostración.")) {
      setCursos(cursos.filter(c => c.id !== id));
    }
  };

  return (
    <PageLayout
      titulo="Mantenedor de Cursos"
      descripcion="Gestión académica - Modo demostración"
      volverA="/docente/dashboard"
      rol="◈ Docente · Coordinador"
      demo="DUOC UC · DEMO"
    >
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <input
          type="search"
          placeholder="Buscar por nombre o código..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: "1", minWidth: "200px", padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }}
        />
        <button onClick={abrirCrear} style={{ padding: "0.75rem 1.5rem", background: "#782f40", color: "#fff", border: "none", borderRadius: "0.5rem", cursor: "pointer" }}>
          + Nuevo Curso
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: "0.75rem", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Código</th>
              <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Nombre</th>
              <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Docente</th>
              <th style={{ padding: "1rem", textAlign: "left", borderBottom: "2px solid #dee2e6" }}>Estado</th>
              <th style={{ padding: "1rem", textAlign: "center", borderBottom: "2px solid #dee2e6" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cursosFiltrados.map(curso => (
              <tr key={curso.id} style={{ borderBottom: "1px solid #f1f1f1" }}>
                <td style={{ padding: "1rem" }}>{curso.codigo}</td>
                <td style={{ padding: "1rem" }}>{curso.nombre}</td>
                <td style={{ padding: "1rem" }}>{curso.docente}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ padding: "0.25rem 0.75rem", background: curso.estado === "Activo" ? "#e8f5e9" : "#f5f5f5", color: curso.estado === "Activo" ? "#2e7d32" : "#666", borderRadius: "0.25rem", fontSize: "0.875rem" }}>
                    {curso.estado}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "center", display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                  <button onClick={() => abrirEditar(curso)} style={{ padding: "0.375rem 0.75rem", background: "#007bff", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => eliminar(curso.id)} style={{ padding: "0.375rem 0.75rem", background: "#dc3545", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop: "1rem", color: "#666", fontSize: "0.875rem" }}>Datos de demostración - Primer mantenedor web</p>

      {mostrarForm ? (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", padding: "2rem", borderRadius: "0.75rem", width: "90%", maxWidth: "500px" }}>
            <h3 style={{ marginTop: 0 }}>{editando ? "Editar" : "Nuevo"} Curso</h3>
            <div style={{ display: "grid", gap: "1rem" }}>
              <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }} />
              <input placeholder="Código" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }} />
              <input placeholder="Docente" value={form.docente} onChange={(e) => setForm({ ...form, docente: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd" }} />
              <textarea placeholder="Descripción" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} style={{ padding: "0.75rem", borderRadius: "0.5rem", border: "1px solid #ddd", minHeight: "80px" }} />
              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button onClick={() => setMostrarForm(false)} style={{ padding: "0.5rem 1rem", border: "1px solid #ddd", background: "#fff", borderRadius: "0.25rem", cursor: "pointer" }}>Cancelar</button>
                <button onClick={guardar} style={{ padding: "0.5rem 1rem", background: "#782f40", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageLayout>
  );
}
