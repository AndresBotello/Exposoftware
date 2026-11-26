import * as XLSX from 'xlsx';

const hoja = (filas, columnas) =>
  XLSX.utils.json_to_sheet(
    filas.map((fila) => Object.fromEntries(columnas.map(([clave, etiqueta]) => [etiqueta, fila[clave] ?? '']))),
    { header: columnas.map(([, etiqueta]) => etiqueta) }
  );

const COLUMNAS_PROYECTOS = [
  ['titulo_proyecto', 'Proyecto'],
  ['estado', 'Estado'],
  ['integrantes', 'Integrantes'],
  ['nota_oficial_docentes', 'Nota oficial docentes'],
  ['votos_jurado', 'Votos jurado'],
  ['promedio_jurado', 'Promedio jurado'],
  ['votos_voto_popular', 'Votos voto popular'],
  ['promedio_voto_popular', 'Promedio voto popular'],
  ['total_calificaciones', 'Total calificaciones'],
  ['promedio_80_20', 'Promedio 80/20'],
];

const COLUMNAS_CALIFICACIONES = [
  ['titulo_proyecto', 'Proyecto'],
  ['calificador', 'Calificador'],
  ['correo', 'Correo'],
  ['rol', 'Rol'],
  ['grupo', 'Grupo'],
  ['Contenido técnico', 'Contenido técnico'],
  ['Organización del proyecto', 'Organización del proyecto'],
  ['Diseño UI/UX', 'Diseño UI/UX'],
  ['Utilidad de la idea', 'Utilidad de la idea'],
  ['Comunicación y presentación', 'Comunicación y presentación'],
  ['nota_ponderada', 'Nota ponderada'],
  ['peso', 'Peso'],
  ['comentario', 'Comentario'],
  ['fecha', 'Fecha'],
];

/** Libro de Excel con las hojas Proyectos y Calificaciones a partir del reporte del backend. */
export function construirLibroCalificaciones(reporte) {
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja(reporte.proyectos, COLUMNAS_PROYECTOS), 'Proyectos');
  XLSX.utils.book_append_sheet(libro, hoja(reporte.calificaciones, COLUMNAS_CALIFICACIONES), 'Calificaciones');
  return libro;
}

/** Nombre de archivo seguro: sin caracteres reservados ni espacios. */
export function nombreArchivoReporte(nombreEvento) {
  const limpio = String(nombreEvento || 'Evento').replace(/[/:*?"<>|]+/g, '');
  const base = limpio.trim().replace(/\s+/g, '_');
  return `Reporte_calificaciones_${base}_${new Date().toISOString().split('T')[0]}.xlsx`;
}
