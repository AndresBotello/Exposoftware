import { memo } from 'react';
import { FileText, Gavel, Users, BarChart3 } from 'lucide-react';
import { miniaturaPoster } from '../../utils/miniaturaPoster';

const nota = (valor) => (valor != null ? Number(valor).toFixed(2) : '—');

/**
 * Tarjeta de proyecto para la vista de invitados. Usa una miniatura liviana
 * del poster con carga diferida para que la página no descargue PDFs completos.
 */
function ProyectoPublicoCard({ proyecto, puntaje, onAbrir }) {
  const miniatura = miniaturaPoster(proyecto.url_preview_png);

  return (
    <article
      onClick={() => onAbrir(proyecto)}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-green-300 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {miniatura ? (
          <img
            src={miniatura}
            alt=""
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="h-10 w-10 text-gray-300" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900" title={proyecto.titulo_proyecto}>
          {proyecto.titulo_proyecto || 'Proyecto sin título'}
        </h3>
        {proyecto.nombre_linea && (
          <p className="mt-1 line-clamp-1 text-xs text-gray-500">{proyecto.nombre_linea}</p>
        )}

        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 text-xs">
          <div>
            <dt className="flex items-center gap-1 text-gray-500">
              <Gavel className="h-3 w-3" aria-hidden="true" />
              Jurado
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">{nota(puntaje?.promedio_jurado_docente)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-gray-500">
              <Users className="h-3 w-3" aria-hidden="true" />
              Popular
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-gray-900">{nota(puntaje?.promedio_publico_general)}</dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-gray-500">
              <BarChart3 className="h-3 w-3" aria-hidden="true" />
              Puntaje
            </dt>
            <dd className="mt-0.5 font-semibold tabular-nums text-green-700">{nota(puntaje?.puntaje_jurado_publico)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

export default memo(ProyectoPublicoCard);
