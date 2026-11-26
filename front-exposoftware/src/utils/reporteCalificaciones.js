import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

const formatoNota = (valor) => (valor == null ? 'sin calificación' : Number(valor).toFixed(2));

const parrafo = (texto, opciones = {}) => new Paragraph({ children: [new TextRun({ text: texto, ...opciones })] });

/** Documento Word: un bloque por proyecto calificado, con los jurados y el voto popular. */
export function construirDocumentoCalificaciones(reporte) {
  const conCalificacion = reporte.proyectos
    .filter((p) => p.total_calificaciones > 0)
    .sort((a, b) => a.titulo_proyecto.localeCompare(b.titulo_proyecto, 'es'));

  const hijos = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('Reporte de calificaciones')] }),
    parrafo(`Evento: ${reporte.evento.nombre_evento}`),
    parrafo(`Generado: ${new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}`),
  ];

  conCalificacion.forEach((proyecto) => {
    hijos.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 360 }, children: [new TextRun(proyecto.titulo_proyecto)] }));

    reporte.calificaciones
      .filter((c) => c.id_proyecto === proyecto.id_proyecto && c.grupo === 'Jurado')
      .forEach((c) => {
        hijos.push(new Paragraph({ bullet: { level: 0 }, children: [new TextRun(`${c.calificador}: ${formatoNota(c.nota_ponderada)}`)] }));
      });

    hijos.push(new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text: `Voto popular: ${formatoNota(proyecto.promedio_voto_popular)}`, bold: true })],
    }));
  });

  if (conCalificacion.length === 0) {
    hijos.push(parrafo('No hay proyectos con calificaciones registradas en este evento.', { italics: true }));
  }

  return new Document({
    creator: 'Expo-software',
    title: 'Reporte de calificaciones',
    sections: [{ children: hijos }],
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
  });
}

/** Nombre de archivo seguro: sin caracteres reservados ni espacios. */
export function nombreArchivoReporte(nombreEvento) {
  const limpio = String(nombreEvento || 'Evento').replace(/[/:*?"<>|]+/g, '');
  const base = limpio.trim().replace(/\s+/g, '_');
  return `Reporte_calificaciones_${base}_${new Date().toISOString().split('T')[0]}.docx`;
}

/** Genera el Word y lo descarga. */
export async function descargarReporteCalificaciones(reporte, nombreEvento) {
  const documento = construirDocumentoCalificaciones(reporte);
  const blob = await Packer.toBlob(documento);
  saveAs(blob, nombreArchivoReporte(nombreEvento));
}
