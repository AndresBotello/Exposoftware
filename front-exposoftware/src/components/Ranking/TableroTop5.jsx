const MEDALLAS = ['🥇', '🥈', '🥉'];

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
    <section className="rounded-xl border-2 border-amber-200 bg-white p-4 shadow-sm">
      <header className="mb-3">
        <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
        <p className="text-xs text-gray-500">{descripcion}</p>
      </header>

      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-gray-500">
          {cargando ? 'Cargando...' : 'Aún no hay proyectos con votos para este tablero.'}
        </p>
      ) : (
        <ol className="space-y-2">
          {items.map((proyecto) => (
            <li
              key={proyecto.id_proyecto}
              onClick={() => onSeleccionar?.(proyecto)}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-amber-100 bg-amber-50 p-3 transition-colors hover:bg-amber-100"
            >
              <span className="w-8 flex-shrink-0 text-center text-xl font-bold text-amber-700">
                {MEDALLAS[proyecto.posicion - 1] || `${proyecto.posicion}.`}
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold text-gray-900" title={proyecto.titulo_proyecto}>
                  {proyecto.titulo_proyecto || 'Sin título'}
                </p>
                <p className="text-xs text-gray-500">
                  {proyecto[campoVotos] || 0} {etiquetaVotos}
                </p>
              </div>
              <span className="rounded-lg bg-white px-3 py-1 text-lg font-extrabold text-amber-600 shadow-sm">
                {(Number(proyecto[campoPuntaje]) || 0).toFixed(2)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
