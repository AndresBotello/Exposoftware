import { AlertCircle, CheckCircle } from "lucide-react";

function InformacionEgresado({
  formData,
  errors,
  handleChange,
  cargando,
  successFields,
  getInputClassName,
  facultades = [],
  programas = [],
  cargandoFacultades = false,
  cargandoProgramas = false
}) {
  return (
    <>
      <div className="lg:col-span-2 border-l-4 border-green-600 pl-2 mt-4 mb-2">
        <h2 className="text-lg font-semibold text-gray-700">Información Egresado</h2>
      </div>

      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">Correo Institucional *</label>
        <div className="relative">
          <input
            name="correo"
            type="email"
            maxLength="50"
            placeholder="usuario@unicesar.edu.co"
            value={formData.correo}
            onChange={handleChange}
            disabled={cargando}
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

      <div className="lg:col-span-2">
        <label className="block font-medium text-gray-700 mb-1">
          Facultad *
          {cargandoFacultades && <span className="ml-2 text-sm text-gray-500">(Cargando...)</span>}
        </label>
        <div className="relative">
          <select
            name="facultad"
            value={formData.facultad}
            onChange={handleChange}
            disabled={cargando || cargandoFacultades}
            className={getInputClassName("facultad")}
          >
            <option value="">
              {cargandoFacultades ? "Cargando facultades..." : "Seleccione una Facultad"}
            </option>
            {facultades.map((facultad) => (
              <option key={facultad.id} value={facultad.id}>
                {facultad.nombre}
              </option>
            ))}
          </select>
          {successFields.facultad && !errors.facultad && (
            <CheckCircle className="absolute right-3 top-3 text-green-500 pointer-events-none" size={20} />
          )}
        </div>
        {errors.facultad && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.facultad}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Programa *
          {cargandoProgramas && <span className="ml-2 text-sm text-gray-500">(Cargando...)</span>}
        </label>
        <div className="relative">
          <select
            name="programa"
            value={formData.programa}
            onChange={handleChange}
            disabled={cargando || !formData.facultad || cargandoProgramas}
            className={getInputClassName("programa")}
          >
            <option value="">
              {!formData.facultad 
                ? "Primero seleccione una Facultad" 
                : cargandoProgramas 
                  ? "Cargando programas..." 
                  : programas.length === 0
                    ? "No hay programas disponibles"
                    : "Seleccione un Programa"}
            </option>
            {programas.map((programa) => (
              <option key={programa.codigo} value={programa.codigo}>
                {programa.nombre} {programa.nivel && `(${programa.nivel})`}
              </option>
            ))}
          </select>
          {successFields.programa && !errors.programa && (
            <CheckCircle className="absolute right-3 top-3 text-green-500 pointer-events-none" size={20} />
          )}
        </div>
        {errors.programa && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.programa}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Titulado *</label>
        <select
          name="titulado"
          value={formData.titulado}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("titulado")}
        >
          <option value="">Selecciona</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
        {errors.titulado && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.titulado}
          </p>
        )}
      </div>

      <div>
        <label className="block font-medium text-gray-700 mb-1">Año de Finalización *</label>
        <select
          name="fechaFinalizacion"
          value={formData.fechaFinalizacion}
          onChange={handleChange}
          disabled={cargando}
          className={getInputClassName("fechaFinalizacion")}
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
        {errors.fechaFinalizacion && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <AlertCircle size={14} /> {errors.fechaFinalizacion}
          </p>
        )}
      </div>

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

export default InformacionEgresado;
