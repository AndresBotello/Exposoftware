import { useState, useEffect } from "react";
import * as FacultyService from "../Services/CreateFaculty";

/**
 * EJEMPLO 1: Componente Básico para Crear Facultad
 */
export function CrearFacultadBasico() {
  const [cargando, setCargando] = useState(false);
  const [id, setId] = useState("");
  const [nombre, setNombre] = useState("");

  const handleCrear = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const resultado = await FacultyService.crearFacultad({
        id_facultad: id.toUpperCase(),
        nombre_facultad: nombre
      });
      alert("✅ Facultad creada: " + nombre);
      setId("");
      setNombre("");
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleCrear}>
      <input
        type="text"
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="ID (ej: FAC_ING)"
        required
        disabled={cargando}
      />
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        required
        disabled={cargando}
      />
      <button type="submit" disabled={cargando}>
        {cargando ? "Creando..." : "Crear Facultad"}
      </button>
    </form>
  );
}

/**
 * EJEMPLO 2: Lista de Facultades con Búsqueda
 */
export function ListarFacultades() {
  const [facultades, setFacultades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscar, setBuscar] = useState("");

  useEffect(() => {
    cargarFacultades();
  }, []);

  const cargarFacultades = async () => {
    setCargando(true);
    try {
      const datos = await FacultyService.obtenerFacultades();
      setFacultades(datos);
    } catch (error) {
      alert("Error al cargar: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const facultadesFiltradas = FacultyService.filtrarFacultades(facultades, buscar);

  return (
    <div>
      <h2>Facultades ({facultadesFiltradas.length})</h2>
      
      <input
        type="text"
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="Buscar facultades..."
      />

      {cargando ? (
        <p>Cargando...</p>
      ) : facultadesFiltradas.length === 0 ? (
        <p>No hay facultades</p>
      ) : (
        <ul>
          {facultadesFiltradas.map((fac) => (
            <li key={fac.id_facultad}>
              <strong>{fac.id_facultad}</strong> - {fac.nombre_facultad}
            </li>
          ))}
        </ul>
      )}

      <button onClick={cargarFacultades} disabled={cargando}>
        Recargar
      </button>
    </div>
  );
}

/**
 * EJEMPLO 3: Editar Facultad
 */
export function EditarFacultad({ idFacultad, nombreActual, onGuardado }) {
  const [nombre, setNombre] = useState(nombreActual);
  const [cargando, setCargando] = useState(false);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await FacultyService.actualizarFacultad(idFacultad, {
        nombre_facultad: nombre
      });
      alert("Facultad actualizada");
      onGuardado?.();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleGuardar}>
      <label>
        ID: <strong>{idFacultad}</strong> (no editable)
      </label>
      
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nuevo nombre"
        required
        disabled={cargando}
      />
      
      <button type="submit" disabled={cargando}>
        {cargando ? "Guardando..." : "Guardar Cambios"}
      </button>
    </form>
  );
}

/**
 * EJEMPLO 4: Eliminar Facultad
 */
export function EliminarFacultad({ idFacultad, nombreFacultad, onEliminado }) {
  const [cargando, setCargando] = useState(false);

  const handleEliminar = async () => {
    if (!window.confirm(`¿Eliminar "${nombreFacultad}"?`)) {
      return;
    }

    setCargando(true);
    try {
      await FacultyService.eliminarFacultad(idFacultad);
      alert("Facultad eliminada");
      onEliminado?.();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <button 
      onClick={handleEliminar} 
      disabled={cargando}
      style={{ backgroundColor: "red", color: "white" }}
    >
      {cargando ? "Eliminando..." : "Eliminar"}
    </button>
  );
}

/**
 * EJEMPLO 5: Validación de Formulario
 */
export function FormularioConValidacion() {
  const [formData, setFormData] = useState({
    idFacultad: "",
    nombreFacultad: ""
  });
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);

  const validar = () => {
    const nuevosErrores = {};

    if (!FacultyService.validarIdFacultad(formData.idFacultad)) {
      nuevosErrores.idFacultad = "ID inválido (3-50 caracteres, A-Z, 0-9, _, -)";
    }

    if (!FacultyService.validarNombreFacultad(formData.nombreFacultad)) {
      nuevosErrores.nombreFacultad = "Nombre inválido (1-255 caracteres)";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleCrear = async (e) => {
    e.preventDefault();

    if (!validar()) {
      return;
    }

    setCargando(true);
    try {
      const datosFormateados = FacultyService.formatearDatosFacultad(formData);
      await FacultyService.crearFacultad(datosFormateados);
      
      alert("Facultad creada");
      setFormData({ idFacultad: "", nombreFacultad: "" });
      setErrores({});
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleCrear}>
      <div>
        <label>ID Facultad</label>
        <input
          type="text"
          value={formData.idFacultad}
          onChange={(e) => setFormData({...formData, idFacultad: e.target.value})}
          placeholder="FAC_ING"
          disabled={cargando}
        />
        {errores.idFacultad && <p style={{ color: "red" }}>{errores.idFacultad}</p>}
      </div>

      <div>
        <label>Nombre Facultad</label>
        <input
          type="text"
          value={formData.nombreFacultad}
          onChange={(e) => setFormData({...formData, nombreFacultad: e.target.value})}
          placeholder="Ingenierías y Tecnologías"
          disabled={cargando}
        />
        {errores.nombreFacultad && <p style={{ color: "red" }}>{errores.nombreFacultad}</p>}
      </div>

      <button type="submit" disabled={cargando}>
        {cargando ? "Creando..." : "Crear Facultad"}
      </button>
    </form>
  );
}

/**
 * EJEMPLO 6: Dashboard Completo
 */
export function DashboardFacultades() {
  const [facultades, setFacultades] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [tab, setTab] = useState("lista"); // "lista", "crear", "editar"
  const [formulario, setFormulario] = useState({
    idFacultad: "",
    nombreFacultad: ""
  });

  useEffect(() => {
    cargarFacultades();
  }, []);

  const cargarFacultades = async () => {
    setCargando(true);
    try {
      const datos = await FacultyService.obtenerFacultades();
      setFacultades(datos);
    } catch (error) {
    } finally {
      setCargando(false);
    }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      await FacultyService.crearFacultad({
        id_facultad: formulario.idFacultad.toUpperCase(),
        nombre_facultad: formulario.nombreFacultad
      });
      alert("Facultad creada");
      setFormulario({ idFacultad: "", nombreFacultad: "" });
      setTab("lista");
      await cargarFacultades();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar facultad?")) return;
    
    setCargando(true);
    try {
      await FacultyService.eliminarFacultad(id);
      alert("Facultad eliminada");
      await cargarFacultades();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h1>Gestión de Facultades</h1>

      <div style={{ marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <button 
          onClick={() => setTab("lista")} 
          style={{ fontWeight: tab === "lista" ? "bold" : "normal" }}
        >
          Lista
        </button>
        <button 
          onClick={() => setTab("crear")}
          style={{ fontWeight: tab === "crear" ? "bold" : "normal", marginLeft: "10px" }}
        >
          Crear
        </button>
      </div>

      {tab === "lista" && (
        <div>
          <h2>Facultades Registradas</h2>
          <p>Total: {facultades.length}</p>
          
          {cargando ? (
            <p>Cargando...</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>ID</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Nombre</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facultades.map((fac) => (
                  <tr key={fac.id_facultad} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>{fac.id_facultad}</td>
                    <td style={{ padding: "10px" }}>{fac.nombre_facultad}</td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button 
                        onClick={() => handleEliminar(fac.id_facultad)}
                        disabled={cargando}
                        style={{ backgroundColor: "red", color: "white", padding: "5px 10px" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <button 
            onClick={cargarFacultades} 
            disabled={cargando}
            style={{ marginTop: "20px" }}
          >
            Recargar
          </button>
        </div>
      )}

      {tab === "crear" && (
        <div>
          <h2>Crear Nueva Facultad</h2>
          <form onSubmit={handleCrear} style={{ maxWidth: "500px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label>ID Facultad</label>
              <input
                type="text"
                value={formulario.idFacultad}
                onChange={(e) => setFormulario({...formulario, idFacultad: e.target.value})}
                placeholder="FAC_ING"
                required
                disabled={cargando}
                style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Nombre Facultad</label>
              <input
                type="text"
                value={formulario.nombreFacultad}
                onChange={(e) => setFormulario({...formulario, nombreFacultad: e.target.value})}
                placeholder="Ingenierías y Tecnologías"
                required
                disabled={cargando}
                style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
              />
            </div>

            <button 
              type="submit" 
              disabled={cargando}
              style={{ 
                backgroundColor: "#007bff", 
                color: "white", 
                padding: "10px 20px",
                cursor: cargando ? "not-allowed" : "pointer"
              }}
            >
              {cargando ? "Creando..." : "Crear Facultad"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default DashboardFacultades;
