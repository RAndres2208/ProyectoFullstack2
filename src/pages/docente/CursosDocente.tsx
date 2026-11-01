import { useState } from "react";
import { PageLayout } from "../../components/page-layout/PageLayout";
import { cursosDemo, type Curso } from "../../data/cursosData";
import styles from "../dashboard/Dashboard.module.css";

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
      rol="◈ Docente"
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

      <section className={styles.section}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Docente</th>
                <th>Estado</th>
                <th style={{ textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursosFiltrados.map(curso => (
                <tr key={curso.id}>
                  <td>{curso.codigo}</td>
                  <td>{curso.nombre}</td>
                  <td>{curso.docente}</td>
                  <td>
                    <span className={curso.estado === "Activo" ? styles.badgeSuccess : styles.badgeWarning}>
                      {curso.estado}
                    </span>
                  </td>
                  <td style={{ textAlign: "center", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <button onClick={() => abrirEditar(curso)} style={{ padding: "0.375rem 0.75rem", background: "#782f40", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Editar</button>
                    <button onClick={() => eliminar(curso.id)} style={{ padding: "0.375rem 0.75rem", background: "#8b2635", color: "#fff", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
