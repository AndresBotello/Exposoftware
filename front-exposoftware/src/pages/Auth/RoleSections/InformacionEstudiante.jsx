import { AlertCircle, CheckCircle } from "lucide-react";
import pensum from "../../../assets/pensum_ingenieria_sistemas.json";

function InformacionEstudiante({
  formData,
  errors,
  handleChange,
  cargando,
  successFields,
  getInputClassName,
}) {
  // Materias del semestre seleccionado
  const semestre = parseInt(formData.semestre);
  const materiasSemestre = semestre
    ? pensum.materias.filter((m) => m.periodo === semestre)
    : [];

  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Información Estudiante</h2>
      </div>

      {/* Correo */}
      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">Correo Institucional *</label>
        <div className="relative">
          <input
            name="correo"
            type="email"
            maxLength="50"
            value={formData.correo}
            onChange={handleChange}
            disabled={cargando}
            placeholder="usuario@unicesar.edu.co"
            className={getInputClassName("correo")}
          />
          {successFields.correo && !errors.correo && (
            <CheckCircle className="absolute right-3 top-3 text-green-500" size={20} />
          )}
        </div>
        {errors.correo && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.correo}
          </p>
        )}
      </div>

      {/* Programa fijo — Ingeniería de Sistemas */}
      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">Programa</label>
        <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          {pensum.programa}
        </div>
        {/* Campo oculto para que formData.programa lleve el valor */}
        <input type="hidden" name="programa" value={pensum.codigo} />
      </div>

      {/* Semestre */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Semestre *</label>
        <select
          name="semestre"
          value={formData.semestre}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("semestre")}
        >
          <option value="">Selecciona Semestre</option>
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Semestre {i + 1}
            </option>
          ))}
        </select>
        {errors.semestre && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.semestre}
          </p>
        )}
      </div>

      {/* Materia — filtrada por semestre */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Materia *</label>
        <select
          name="materia"
          value={formData.materia || ""}
          onChange={handleChange}
          disabled={cargando || !formData.semestre}
          className={getInputClassName("materia")}
        >
          <option value="">
            {!formData.semestre
              ? "Primero selecciona el semestre"
              : materiasSemestre.length === 0
              ? "Sin materias para este semestre"
              : "Selecciona una Materia"}
          </option>
          {materiasSemestre.map((m) => (
            <option key={m.codigo_materia} value={m.codigo_materia}>
              {m.nombre_materia}
            </option>
          ))}
        </select>
        {errors.materia && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.materia}
          </p>
        )}
      </div>

      {/* Año de Ingreso */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Año de Ingreso *</label>
        <select
          name="fechaIngreso"
          value={formData.fechaIngreso}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("fechaIngreso")}
        >
          <option value="">Seleccione un año</option>
          {Array.from(
            { length: new Date().getFullYear() - 1976 + 1 },
            (_, i) => 1976 + i
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        {errors.fechaIngreso && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.fechaIngreso}
          </p>
        )}
      </div>

      {/* Periodo */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">Periodo *</label>
        <select
          name="periodo"
          value={formData.periodo}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("periodo")}
        >
          <option value="">Selecciona Periodo</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        {errors.periodo && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.periodo}
          </p>
        )}
      </div>
    </>
  );
}

export default InformacionEstudiante;
