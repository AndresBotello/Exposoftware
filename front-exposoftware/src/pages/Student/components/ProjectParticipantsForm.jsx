import { useState } from "react";

export default function ProjectParticipantsForm({
  form,
  setForm,
  docentes,
  estudiantes,
  grupos
}) {
  const [searchStudent, setSearchStudent] = useState("");

  const filteredStudents = estudiantes.filter(s =>
    `${s.nombreCompleto || ""} ${s.correo || ""}`.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const selectedStudents = form.id_estudiantes.map(id =>
    estudiantes.find(e => e.id === id)
  ).filter(Boolean);

  const grupoSeleccionado = grupos.find(g => g.id === form.id_grupo);

  return (
    <div className="space-y-4">
      {/* Docente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Docente Responsable <span className="text-red-500">*</span>
        </label>
        {docentes.length > 0 ? (
          <select
            value={form.id_docente}
            onChange={(e) => setForm(s => ({ ...s, id_docente: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Seleccionar docente</option>
            {docentes.map((docente) => (
              <option key={docente.id} value={docente.id}>
                {docente.nombre} - {docente.correo}
              </option>
            ))}
          </select>
        ) : grupoSeleccionado?.idDocente ? (
          <div className="w-full border border-teal-200 bg-teal-50 rounded-lg px-3 py-2 text-sm">
            <span className="text-teal-800 font-medium">
              {grupoSeleccionado.nombreDocente || grupoSeleccionado.idDocente}
            </span>
            <span className="text-teal-600 text-xs ml-2">(asignado desde el grupo)</span>
          </div>
        ) : (
          <input
            type="text"
            value={form.id_docente}
            onChange={(e) => setForm(s => ({ ...s, id_docente: e.target.value }))}
            placeholder="Seleccione un grupo para asignar docente automáticamente, o ingrese el ID manualmente"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
            required
          />
        )}
      </div>

      {/* Grupo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grupo <span className="text-red-500">*</span>
        </label>
        {grupos.length > 0 ? (
          <select
            value={form.id_grupo}
            onChange={(e) => setForm(s => ({ ...s, id_grupo: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            <option value="">Seleccionar grupo</option>
            {grupos.map((grupo) => (
              <option key={grupo.id} value={grupo.id}>
                {grupo.nombre}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={form.id_grupo}
            onChange={(e) => setForm(s => ({ ...s, id_grupo: e.target.value }))}
            placeholder="Seleccione una materia primero, o ingrese el código del grupo"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
          />
        )}
      </div>

      {/* Estudiantes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Estudiantes Participantes <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={searchStudent}
          onChange={(e) => setSearchStudent(e.target.value)}
          placeholder="Buscar estudiante por nombre o correo..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm"
        />
        <div className="max-h-36 overflow-auto border rounded-lg p-2">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (form.id_estudiantes.includes(s.id)) {
                    setForm(state => ({
                      ...state,
                      id_estudiantes: state.id_estudiantes.filter(id => id !== s.id)
                    }));
                  } else {
                    setForm(state => ({
                      ...state,
                      id_estudiantes: [...state.id_estudiantes, s.id]
                    }));
                  }
                  setSearchStudent("");
                }}
                className={`w-full text-left py-2 px-2 text-sm rounded flex justify-between items-center mb-1 ${
                  form.id_estudiantes.includes(s.id)
                    ? 'bg-teal-50 border border-teal-200'
                    : 'hover:bg-gray-50'
                }`}
              >
                <span>
                  <div className="font-medium">{s.nombreCompleto}</div>
                  <div className="text-xs text-gray-500">{s.correo}</div>
                </span>
                <span className="text-teal-600 text-xs">
                  {form.id_estudiantes.includes(s.id) ? '✓ Agregado' : '+ Agregar'}
                </span>
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-400 px-2">
              {searchStudent ? "No se encontraron estudiantes" : "Escribe para buscar"}
            </p>
          )}
        </div>

        {selectedStudents.length > 0 && (
          <div className="mt-3 p-2 bg-teal-50 rounded-lg">
            <p className="text-xs font-medium text-teal-900 mb-2">
              Estudiantes seleccionados ({selectedStudents.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-teal-100 text-teal-900 px-3 py-1 rounded-full text-xs flex items-center gap-2"
                >
                  {student.nombreCompleto}
                  <button
                    type="button"
                    onClick={() => {
                      setForm(state => ({
                        ...state,
                        id_estudiantes: state.id_estudiantes.filter(id => id !== student.id)
                      }));
                    }}
                    className="hover:text-teal-700 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
