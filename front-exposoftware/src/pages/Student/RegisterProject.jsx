import { useState } from "react";
import { useRegisterProject } from "../../hooks/Student/useRegisterProject";

export default function RegisterProject() {
  const {
    open,
    setOpen,
    form,
    setForm,
    tiposActividad,
    estudiantes,
    materias,
    grupos,
    lineas,
    sublineasFiltradas,
    eventos,
    areasFiltradas,
    docenteDelGrupo,
    loading,
    loadingData,
    error,
    addParticipant,
    removeParticipant,
    submit,
  } = useRegisterProject();

  if (!open) return null;

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="text-gray-700">Cargando datos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-4">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar los datos</h3>
            <p className="text-gray-600 mb-4 text-sm">{error}</p>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-12 p-6 mx-4">
        <header className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Postular a la Convocatoria</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            disabled={loading}
          >
            ✕
          </button>
        </header>

        <form onSubmit={submit} className="space-y-4 max-h-[70vh] overflow-auto pr-2">

          {/* Tipo de Actividad */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Tipo de Actividad <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-3">
              {tiposActividad.map((t) => (
                <label key={t.id} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="tipo_actividad"
                    value={t.id}
                    checked={form.tipo_actividad === t.id.toString()}
                    onChange={() => setForm((s) => ({ ...s, tipo_actividad: t.id.toString() }))}
                    className="text-teal-600 focus:ring-teal-500"
                    required
                  />
                  <span className="text-sm">{t.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Título del proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título del proyecto <span className="text-red-500">*</span>
            </label>
            <input
              value={form.titulo_proyecto}
              onChange={(e) => setForm((s) => ({ ...s, titulo_proyecto: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              maxLength={255}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{form.titulo_proyecto.length}/255 caracteres</p>
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participantes (Estudiantes) <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-200 rounded-lg p-3">
              <div className="flex gap-2 flex-wrap mb-2">
                {form.id_estudiantes.map((idEst) => {
                  const est = estudiantes.find((e) => e.id === idEst);
                  return (
                    <span
                      key={idEst}
                      className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 px-3 py-1 rounded-full text-sm"
                    >
                      {est?.correo || est?.nombreCompleto || `ID: ${idEst}`}
                      <button
                        type="button"
                        onClick={() => removeParticipant(idEst)}
                        className="text-teal-700 hover:text-teal-900"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
                {form.id_estudiantes.length === 0 && (
                  <span className="text-sm text-gray-400">No hay participantes agregados</span>
                )}
              </div>
              <ParticipantCombo
                students={estudiantes}
                selectedIds={form.id_estudiantes}
                onAdd={addParticipant}
              />
            </div>
          </div>

          {/* Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Evento <span className="text-red-500">*</span>
            </label>
            <select
              value={form.id_evento}
              onChange={(e) => setForm((s) => ({ ...s, id_evento: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Seleccionar evento</option>
              {eventos.map((evento, index) => {
                const fechaInicio = evento.fecha_inicio
                  ? new Date(evento.fecha_inicio).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";
                const fechaFin = evento.fecha_fin
                  ? new Date(evento.fecha_fin).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "";
                const eventoValue = evento.id_evento || evento.id || evento._id || index.toString();
                return (
                  <option key={eventoValue} value={eventoValue}>
                    {evento.nombre_evento}
                    {fechaInicio
                      ? ` (${fechaInicio}${fechaFin && fechaFin !== fechaInicio ? " - " + fechaFin : ""})`
                      : ""}
                  </option>
                );
              })}
            </select>
            {eventos.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">⚠️ No hay eventos disponibles.</p>
            )}
            {form.id_evento && (() => {
              const eventoSel = eventos.find(
                (e) => (e.id_evento || e.id || e._id) === form.id_evento
              );
              return eventoSel ? (
                <div className="mt-2 p-2 bg-teal-50 rounded text-xs text-teal-800">
                  <strong>Evento seleccionado:</strong> {eventoSel.nombre_evento}
                  {eventoSel.lugar && <> • 📍 {eventoSel.lugar}</>}
                </div>
              ) : null;
            })()}
          </div>

          {/* Materia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
            <select
              value={form.codigo_materia}
              onChange={(e) =>
                setForm((s) => ({ ...s, codigo_materia: e.target.value, id_grupo: "", id_docente: "" }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Seleccionar materia</option>
              {materias.map((mat) => (
                <option key={mat.codigo} value={mat.codigo}>
                  {mat.codigo} - {mat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
            <select
              value={form.id_grupo}
              onChange={(e) => setForm((s) => ({ ...s, id_grupo: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!form.codigo_materia}
            >
              <option value="">Seleccionar grupo</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
            {!form.codigo_materia && (
              <p className="text-xs text-gray-500 mt-1">Primero selecciona una materia</p>
            )}
          </div>

          {/* Docente (solo lectura, auto-asignado del grupo) */}
          {docenteDelGrupo && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Docente asignado
              </label>
              <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-gray-700">
                👨‍🏫 {docenteDelGrupo.nombreDocente || docenteDelGrupo.idDocente}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                El docente se asigna automáticamente del grupo seleccionado
              </p>
            </div>
          )}

          {/* Línea de Investigación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Línea de Investigación <span className="text-red-500">*</span>
            </label>
            <select
              value={form.codigo_linea}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  codigo_linea: e.target.value,
                  codigo_sublinea: "",
                  codigo_area: "",
                }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Seleccionar línea</option>
              {lineas.map((linea) => (
                <option key={linea.codigo} value={linea.codigo}>
                  {linea.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Sublínea de Investigación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sublínea de Investigación <span className="text-red-500">*</span>
            </label>
            <select
              value={form.codigo_sublinea}
              onChange={(e) =>
                setForm((s) => ({ ...s, codigo_sublinea: e.target.value, codigo_area: "" }))
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!form.codigo_linea}
              required
            >
              <option value="">Seleccionar sublínea</option>
              {sublineasFiltradas.map((sublinea) => (
                <option key={sublinea.codigo} value={sublinea.codigo}>
                  {sublinea.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Área Temática */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Área Temática <span className="text-red-500">*</span>
            </label>
            <select
              value={form.codigo_area}
              onChange={(e) => setForm((s) => ({ ...s, codigo_area: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={!form.codigo_sublinea}
              required
            >
              <option value="">Seleccionar área</option>
              {areasFiltradas.map((area) => (
                <option key={area.codigo} value={area.codigo}>
                  {area.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Artículo en PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artículo en PDF <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setForm((s) => ({ ...s, archivoPDF: e.target.files[0] }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
            {form.archivoPDF && (
              <p className="text-xs text-teal-600 mt-1">
                ✓ {form.archivoPDF.name} ({(form.archivoPDF.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Archivo extra si aplica */}
          {form.tipo_actividad &&
            tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)?.archivos.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)?.archivos[1] ===
                  "poster_pdf"
                    ? "Póster en PDF"
                    : "Imagen (PNG/JPG)"}
                  <span className="text-red-500"> *</span>
                </label>
                <input
                  type="file"
                  accept={
                    tiposActividad.find((t) => t.id.toString() === form.tipo_actividad)
                      ?.archivos[1] === "poster_pdf"
                      ? ".pdf"
                      : ".png,.jpg,.jpeg"
                  }
                  onChange={(e) => setForm((s) => ({ ...s, archivoExtra: e.target.files[0] }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
                {form.archivoExtra && (
                  <p className="text-xs text-teal-600 mt-1">
                    ✓ {form.archivoExtra.name} ({(form.archivoExtra.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            )}

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Enviar postulación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ParticipantCombo({ students, selectedIds, onAdd }) {
  const [q, setQ] = useState("");

  const filtered = students.filter((s) =>
    `${s.nombreCompleto || ""} ${s.correo || ""}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar estudiante por nombre o correo..."
        className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-2 text-sm"
      />
      <div className="max-h-36 overflow-auto border-t pt-2">
        {filtered.length > 0 ? (
          filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onAdd(s.id);
                setQ("");
              }}
              className="w-full text-left py-2 px-2 text-sm hover:bg-gray-50 rounded flex justify-between items-center"
            >
              <span>
                <div className="font-medium">{s.nombreCompleto}</div>
                <div className="text-xs text-gray-500">{s.correo}</div>
                {s.codigoEstudiante && (
                  <div className="text-xs text-gray-400">Código: {s.codigoEstudiante}</div>
                )}
              </span>
              <span className="text-teal-600 text-xs">+ Agregar</span>
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-400 px-2">
            {q ? "No se encontraron estudiantes" : "Escribe para buscar"}
          </p>
        )}
      </div>
    </div>
  );
}
