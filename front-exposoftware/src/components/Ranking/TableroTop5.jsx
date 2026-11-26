import { Award } from 'lucide-react';

/**
 * Tablero con los 5 mejores proyectos de un tipo de puntaje.
 * `campoPuntaje` y `campoVotos` son las claves del objeto de cada proyecto.
 */
export default function TableroTop5({
  titulo,
  descripcion,
  items,
  campoPuntaje,
  campoVotos,
  etiquetaVotos,
  cargando = false,
  onSeleccionar,
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
          <p className="mt-0.5 text-xs text-gray-500">{descripcion}</p>
        </div>
        <Award className="h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden="true" />
      </header>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          {cargando ? 'Cargando tablero...' : 'Aún no hay proyectos con calificaciones suficientes.'}
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((proyecto) => (
            <li
              key={proyecto.id_proyecto}
              onClick={() => onSeleccionar?.(proyecto)}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-100 bg-gray-50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
            >
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  proyecto.posicion === 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-gray-700 ring-1 ring-gray-300'
                }`}
              >
                {proyecto.posicion}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-gray-900" title={proyecto.titulo_proyecto}>
                  {proyecto.titulo_proyecto || 'Sin título'}
                </p>
                <p className="text-xs text-gray-500">
                  {proyecto[campoVotos] || 0} {etiquetaVotos}
                </p>
              </div>
              <span className="text-base font-semibold tabular-nums text-gray-900">
                {(Number(proyecto[campoPuntaje]) || 0).toFixed(2)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
