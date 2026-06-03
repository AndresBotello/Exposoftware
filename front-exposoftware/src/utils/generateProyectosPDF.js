import jsPDF from 'jspdf';
import * as AuthService from '../Services/AuthService';
import axios from 'axios';
import { API_ENDPOINTS } from './constants';

const obtenerDetallesProyecto = async (proyectoId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await axios.get(API_ENDPOINTS.PROYECTO_BY_ID(proyectoId), {
      headers,
      withCredentials: true
    });
    return response.data?.data || response.data || {};
  } catch (error) {
    console.error(`Error cargando detalles del proyecto ${proyectoId}:`, error);
    return {};
  }
};

const obtenerIntegrantesProyecto = async (proyectoId) => {
  try {
    const headers = AuthService.getAuthHeaders();
    const response = await axios.get(API_ENDPOINTS.PROYECTO_INTEGRANTES(proyectoId), {
      headers,
      withCredentials: true
    });

    let integrantes = response.data?.data || response.data || [];

    // Si es un objeto con la propiedad integrantes, usar esa
    if (integrantes && typeof integrantes === 'object' && !Array.isArray(integrantes)) {
      integrantes = integrantes.integrantes || integrantes.estudiantes || integrantes.participantes || [];
    }

    return Array.isArray(integrantes) ? integrantes : [];
  } catch (error) {
    console.error(`Error cargando integrantes del proyecto ${proyectoId}:`, error.message);
    return [];
  }
};

export const generateApprovedProyectosPDF = async (proyectos) => {
  const proyectosAprobados = proyectos.filter(p => p.estado === 'aprobado');

  if (proyectosAprobados.length === 0) {
    alert('No hay proyectos aprobados para generar el informe');
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Título del documento
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('INFORME DE PROYECTOS APROBADOS', margin, yPosition);

  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
  doc.text(`Total de proyectos: ${proyectosAprobados.length}`, margin, yPosition + 5);

  yPosition += 15;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 5;

  // Cargar detalles de todos los proyectos en paralelo
  const detallesPromesas = proyectosAprobados.map(async (proyecto) => {
    const detalles = await obtenerDetallesProyecto(proyecto.id_proyecto);
    // Los integrantes pueden venir en detalles o necesitar una llamada separada
    let integrantes = [];
    if (detalles.integrantes) {
      integrantes = detalles.integrantes;
    } else {
      integrantes = await obtenerIntegrantesProyecto(proyecto.id_proyecto);
    }
    return { ...proyecto, ...detalles, integrantes };
  });

  const proyectosConDetalles = await Promise.all(detallesPromesas);

  // Proyectos
  proyectosConDetalles.forEach((proyecto, index) => {
    // Verificar si necesita nueva página
    if (yPosition > pageHeight - 50) {
      doc.addPage();
      yPosition = margin;
    }

    // Número del proyecto y título
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    const titulo = proyecto.titulo_proyecto || proyecto.titulo || 'Proyecto sin nombre';
    const maxWidth = contentWidth - 5;
    const splitTitle = doc.splitTextToSize(`${index + 1}. ${titulo}`, maxWidth);
    doc.text(splitTitle, margin, yPosition);
    yPosition += splitTitle.length * 5 + 2;

    // Docentes responsables
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Docentes Responsables:', margin + 5, yPosition);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');

    let docentes = [];
    if (proyecto.docentes_materias && Array.isArray(proyecto.docentes_materias) && proyecto.docentes_materias.length > 0) {
      docentes = proyecto.docentes_materias.map(d => d.nombre_docente || 'Nombre no disponible').filter(Boolean);
    } else if (proyecto.nombre_docente) {
      docentes = [proyecto.nombre_docente];
    }

    if (docentes.length > 0) {
      docentes.forEach(docente => {
        const maxWidth = contentWidth - 13;
        const splitText = doc.splitTextToSize(`• ${docente}`, maxWidth);
        doc.text(splitText, margin + 8, yPosition);
        yPosition += splitText.length * 3.5;
      });
    } else {
      doc.text('• No asignado', margin + 8, yPosition);
      yPosition += 3.5;
    }

    yPosition += 2;

    // Estudiantes - Buscar en múltiples campos posibles
    let estudiantes = [];

    // Intentar obtener estudiantes de diferentes campos
    if (proyecto.integrantes && Array.isArray(proyecto.integrantes) && proyecto.integrantes.length > 0) {
      estudiantes = proyecto.integrantes;
    } else if (proyecto.id_estudiantes && Array.isArray(proyecto.id_estudiantes) && proyecto.id_estudiantes.length > 0) {
      estudiantes = proyecto.id_estudiantes;
    } else if (proyecto.estudiantes && Array.isArray(proyecto.estudiantes) && proyecto.estudiantes.length > 0) {
      estudiantes = proyecto.estudiantes;
    } else if (proyecto.miembros && Array.isArray(proyecto.miembros) && proyecto.miembros.length > 0) {
      estudiantes = proyecto.miembros;
    } else if (proyecto.participantes && Array.isArray(proyecto.participantes) && proyecto.participantes.length > 0) {
      estudiantes = proyecto.participantes;
    }

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    if (estudiantes && estudiantes.length > 0) {
      doc.text('Estudiantes:', margin + 5, yPosition);
      yPosition += 4;

      estudiantes.forEach(estudiante => {
        let studentName = 'Nombre no disponible';

        if (typeof estudiante === 'string') {
          studentName = estudiante;
        } else if (estudiante.nombre_completo) {
          studentName = estudiante.nombre_completo;
        } else if (estudiante.nombre) {
          studentName = estudiante.nombre;
        } else if (estudiante.nombreCompleto) {
          studentName = estudiante.nombreCompleto;
        } else if (estudiante.nombreEstudiante) {
          studentName = estudiante.nombreEstudiante;
        } else if (estudiante.nombre_estudiante) {
          studentName = estudiante.nombre_estudiante;
        } else if (Object.keys(estudiante).length > 0) {
          // Si no encuentra nombre específico, usar el primer valor string encontrado
          for (let key of Object.keys(estudiante)) {
            if (typeof estudiante[key] === 'string' && estudiante[key].length > 2) {
              studentName = estudiante[key];
              break;
            }
          }
        }

        const xIndent = margin + 8;
        const maxWidth = contentWidth - 13;
        const splitText = doc.splitTextToSize(`• ${studentName}`, maxWidth);
        doc.text(splitText, xIndent, yPosition);
        yPosition += splitText.length * 3.5;
      });
    } else {
      doc.text('Estudiantes: No hay estudiantes registrados', margin + 5, yPosition);
      yPosition += 4;
    }

    yPosition += 3;
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generar descarga
  doc.save(`Informe_Proyectos_Aprobados_${new Date().toISOString().split('T')[0]}.pdf`);
};
