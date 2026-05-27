import { useState, useEffect } from "react";
import * as AuthService from "../../Services/AuthService";
import { API_BASE_URL, API_ENDPOINTS } from "../../utils/constants";

export default function AddMemberModal({ project, onClose, onMemberAdded, isOpen }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isLider, setIsLider] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Buscar estudiantes por correo (mínimo 3 caracteres)
  useEffect(() => {
    if (searchTerm.length < 3) {
      setStudents([]);
      setError("");
      return;
    }

    const buscarEstudiantes = async () => {
      setLoadingStudents(true);
      setError("");
      try {
        const token = localStorage.getItem('auth_token');
        const headers = {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        };

        const response = await fetch(
          `${API_BASE_URL}/api/v1/usuarios/buscar?q=${encodeURIComponent(searchTerm)}`,
          {
            method: "GET",
            headers: headers,
            credentials: "include"
          }
        );

        if (response.ok) {
          const data = await response.json();

          // La respuesta es directamente un array o tiene estructura data
          const usuariosList = Array.isArray(data) ? data : (data.data || data.usuarios || []);
          setStudents(usuariosList);

          if (usuariosList.length === 0) {
            setError("No se encontraron estudiantes con ese correo");
          }
        } else if (response.status === 400) {
          setError("Escribe al menos 3 caracteres del correo");
        } else if (response.status === 404) {
          setError("No se encontraron usuarios");
        } else {
          setError("Error al buscar estudiantes");
        }
      } catch (err) {
        setError("Error al conectar con el servidor");
      } finally {
        setLoadingStudents(false);
      }
    };

    buscarEstudiantes();
  }, [searchTerm]);

  const handleAddMember = async () => {
    if (!selectedStudent) {
      setError("Selecciona un estudiante");
      return;
    }

    setLoadingAdd(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/proyectos/${project.id_proyecto}/integrantes`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            id_usuario: selectedStudent.id || selectedStudent.id_usuario,
            es_lider: isLider
          })
        }
      );

      if (response.ok) {
        const nombreEstudiante = selectedStudent.nombre || selectedStudent.correo;
        setSuccess(`${nombreEstudiante} agregado correctamente`);
        setSelectedStudent(null);
        setSearchTerm("");
        setIsLider(false);
        setTimeout(() => {
          onMemberAdded();
          onClose();
        }, 1500);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Error al agregar integrante");
      }
    } catch (err) {
      setError("Error al agregar integrante");
    } finally {
      setLoadingAdd(false);
    }
  };

  if (!project || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <i className="pi pi-user-plus"></i>
            Agregar Integrante
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <i className="pi pi-times text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Información del proyecto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Proyecto:</span> {project.titulo_proyecto}
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <i className="pi pi-exclamation-circle"></i> {error}
              </p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                <i className="pi pi-check-circle"></i> {success}
              </p>
            </div>
          )}

          {/* Búsqueda de estudiantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Estudiante por Correo
              <span className="text-xs text-gray-500 font-normal"> (mínimo 3 caracteres)</span>
            </label>
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-3 text-gray-400"></i>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: maria@unicesar.edu.co"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="text-xs text-yellow-600 mt-2 flex items-center gap-1">
                <i className="pi pi-info-circle"></i>
                Escribe al menos 3 caracteres del correo
              </p>
            )}

            {/* Lista de resultados */}
            {searchTerm.length >= 3 && (
              <div className="mt-2 border border-gray-300 rounded-lg bg-white max-h-48 overflow-y-auto">
                {loadingStudents ? (
                  <div className="p-3 text-center text-gray-500">
                    <i className="pi pi-spin pi-spinner"></i> Buscando...
                  </div>
                ) : students.length > 0 ? (
                  <ul className="divide-y">
                    {students.map((student) => (
                      <li key={student.id || student.id_usuario}>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setSearchTerm("");
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 transition-colors ${
                            selectedStudent?.id === student.id || selectedStudent?.id_usuario === student.id_usuario
                              ? "bg-emerald-50"
                              : ""
                          }`}
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {student.nombre || `${student.primer_nombre || ''} ${student.primer_apellido || ''}`.trim()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.correo}
                          </div>
                          <div className="text-xs text-gray-400">
                            {student.rol}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-gray-500 text-sm">
                    No se encontraron estudiantes
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Estudiante seleccionado */}
          {selectedStudent && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">
                ✓ {selectedStudent.nombre || `${selectedStudent.primer_nombre || ''} ${selectedStudent.primer_apellido || ''}`.trim()}
              </p>
              <p className="text-xs text-gray-600">{selectedStudent.correo}</p>
              <p className="text-xs text-gray-500">Rol: {selectedStudent.rol}</p>
            </div>
          )}

          {/* Checkbox de líder */}
          {selectedStudent && (
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={isLider}
                onChange={(e) => setIsLider(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Marcar como líder del proyecto
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center gap-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleAddMember}
            disabled={!selectedStudent || loadingAdd}
            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            {loadingAdd ? (
              <>
                <i className="pi pi-spin pi-spinner"></i>
                Agregando...
              </>
            ) : (
              <>
                <i className="pi pi-check"></i>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
