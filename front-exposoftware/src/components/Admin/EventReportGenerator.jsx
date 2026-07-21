import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { fetchApi } from '../../utils/apiClient';
import { getAuthHeaders } from '../../Services/AuthService';
import AssistanceService from '../../Services/AssistanceService';
import { API_ENDPOINTS } from '../../utils/constants';

export class EventReportGenerator {
  // Colores profesionales
  static COLOR_PRIMARY = [31, 78, 121];      // Azul oscuro profesional
  static COLOR_SECONDARY = [68, 114, 196];   // Azul medio
  static COLOR_ACCENT = [79, 129, 189];      // Azul claro
  static COLOR_TEXT = [51, 51, 51];          // Gris oscuro
  static COLOR_BORDER = [189, 189, 189];     // Gris claro
  static COLOR_HEADER_BG = [242, 242, 242];  // Gris muy claro
  static COLOR_SUCCESS = [155, 187, 89];     // Verde profesional
  static COLOR_GRAY = [127, 127, 127];       // Gris medio

  /**
   * Dibuja el encabezado principal del reporte
   */
  static drawReportHeader(pdf, eventName) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Fondo de encabezado
    pdf.setFillColor(...this.COLOR_PRIMARY);
    pdf.rect(0, 0, pageWidth, 35, 'F');

    // TÃ­tulo
    pdf.setFontSize(24);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORTE DE EVENTO', pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(eventName, pageWidth / 2, 25, { align: 'center' });

    // LÃ­nea decorativa
    pdf.setDrawColor(255, 255, 255);
    pdf.setLineWidth(0.5);
    pdf.line(15, 32, pageWidth - 15, 32);

    return 40;
  }

  /**
   * Dibuja secciÃ³n de resumen rÃ¡pido
   */
  static drawQuickSummary(pdf, stats, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const boxHeight = 35;
    const boxWidth = (pageWidth - 40) / 4;

    // TÃ­tulos de estadÃ­sticas
    const summaryData = [
      { title: 'Asistencias', value: stats.totalAsistencias || 0, color: this.COLOR_PRIMARY },
      { title: 'Proyectos', value: stats.totalProyectos || 0, color: this.COLOR_SECONDARY },
      { title: 'Aprobados', value: stats.proyectosAprobados || 0, color: this.COLOR_SUCCESS },
      { title: 'Materias', value: stats.totalMaterias || 0, color: this.COLOR_ACCENT }
    ];

    // Dibujar boxes de estadÃ­sticas
    let xPos = 15;
    summaryData.forEach((item) => {
      // Fondo del box con color suave
      const lightColor = item.color.map(c => Math.min(255, c + 180)); // Hacer mÃ¡s claro
      pdf.setFillColor(...lightColor);
      pdf.rect(xPos, yPosition, boxWidth, boxHeight, 'F');

      // Borde
      pdf.setDrawColor(...item.color);
      pdf.setLineWidth(1);
      pdf.rect(xPos, yPosition, boxWidth, boxHeight);

      // TÃ­tulo en gris oscuro
      pdf.setFontSize(8);
      pdf.setTextColor(50, 50, 50);
      pdf.setFont(undefined, 'bold');
      pdf.text(item.title, xPos + boxWidth / 2, yPosition + 7, { align: 'center' });

      // Valor en negro grande y legible
      pdf.setFontSize(20);
      pdf.setTextColor(51, 51, 51);
      pdf.setFont(undefined, 'bold');
      pdf.text(String(item.value), xPos + boxWidth / 2, yPosition + 25, { align: 'center' });

      xPos += boxWidth + 5;
    });

    return yPosition + boxHeight + 15;
  }

  /**
   * Dibuja informaciÃ³n de asistencias (SIN autoTable - formato simple)
   */
  static drawAttendanceSection(pdf, attendanceData, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Verificar si hay espacio
    if (yPosition > pdf.internal.pageSize.getHeight() - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    // TÃ­tulo
    pdf.setFontSize(12);
    pdf.setTextColor(...this.COLOR_PRIMARY);
    pdf.setFont(undefined, 'bold');
    pdf.text('ASISTENCIAS AL EVENTO', 20, yPosition);
    yPosition += 5;

    // LÃ­nea
    pdf.setDrawColor(...this.COLOR_PRIMARY);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    if (!attendanceData || attendanceData.length === 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No hay datos de asistencia', 20, yPosition);
      return yPosition + 10;
    }

    // Dibujar filas manualmente
    pdf.setFontSize(9);
    const startX = 25;
    const colWidth = 40;

    // Encabezado
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...this.COLOR_PRIMARY);
    pdf.text('Tipo', startX, yPosition);
    pdf.text('Cantidad', startX + colWidth, yPosition);
    yPosition += 5;

    // Línea bajo encabezado
    pdf.setLineWidth(0.3);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 4;

    // Datos - Filtrar "Sin rol"
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 51, 51);
    const filteredAttendance = attendanceData.filter(item => item.tipo && item.tipo !== 'Sin rol');

    filteredAttendance.forEach((item, index) => {
      if (index % 2 === 1) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 4, 'F');
      }
      pdf.text((item.tipo || 'N/A').substring(0, 18), startX, yPosition);
      pdf.text(String(item.cantidad || 0), startX + colWidth, yPosition);
      yPosition += 4;
    });

    return yPosition + 3;
  }

  /**
   * Dibuja informaciÃ³n de proyectos (TOP 12, SIN autoTable)
   */
  static drawProjectsSection(pdf, projectsData, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    const totalProyectos = projectsData.length;
    pdf.setFontSize(12);
    pdf.setTextColor(...this.COLOR_SECONDARY);
    pdf.setFont(undefined, 'bold');
    pdf.text(`PROYECTOS REGISTRADOS (Total: ${totalProyectos})`, 20, yPosition);
    yPosition += 5;

    pdf.setDrawColor(...this.COLOR_SECONDARY);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    if (!projectsData || projectsData.length === 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No hay proyectos registrados', 20, yPosition);
      return yPosition + 10;
    }

    // Mostrar TODOS los proyectos

    // Dibujar manualmente
    pdf.setFontSize(8);
    const startX = 25;

    // Encabezado
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...this.COLOR_SECONDARY);
    pdf.text('Proyecto', startX, yPosition);
    pdf.text('Estado', pageWidth - 40, yPosition);
    yPosition += 4;

    // LÃ­nea
    pdf.setLineWidth(0.3);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 3;

    // Datos con paginación automática
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 51, 51);

    projectsData.forEach((proyecto, index) => {
      // Verificar si necesita nueva página
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;

        // Repetir encabezado en nueva página
        pdf.setFillColor(242, 242, 242);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 4, 'F');
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...this.COLOR_PRIMARY);
        pdf.text('Proyecto', startX, yPosition);
        pdf.text('Estado', pageWidth - 28, yPosition);
        yPosition += 5;

        pdf.setDrawColor(...this.COLOR_BORDER);
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 2;

        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(51, 51, 51);
      }

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 4, 'F');
      }

      const titulo = (proyecto.titulo_proyecto || 'Sin titulo').substring(0, 60);
      const estado = (proyecto.estado || 'Pendiente').substring(0, 10);

      pdf.text(titulo, startX, yPosition);
      pdf.text(estado, pageWidth - 28, yPosition);
      yPosition += 4;
    });

    return yPosition + 2;
  }

  /**
   * Dibuja informaciÃ³n de proyectos aprobados (TOP 10, SIN autoTable)
   */
  static drawApprovedProjectsSection(pdf, approvedProjects, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    const totalAprobados = approvedProjects.length;
    pdf.setFontSize(12);
    pdf.setTextColor(...this.COLOR_SUCCESS);
    pdf.setFont(undefined, 'bold');
    pdf.text(`PROYECTOS APROBADOS (Total: ${totalAprobados})`, 20, yPosition);
    yPosition += 5;

    pdf.setDrawColor(...this.COLOR_SUCCESS);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    if (!approvedProjects || approvedProjects.length === 0) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No hay proyectos aprobados', 20, yPosition);
      return yPosition + 10;
    }

    // Mostrar TODOS los aprobados

    // Dibujar manualmente
    pdf.setFontSize(8);
    const startX = 25;

    // Encabezado
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...this.COLOR_SUCCESS);
    pdf.text('Proyecto Aprobado', startX, yPosition);
    pdf.text('Calif.', pageWidth - 40, yPosition);
    yPosition += 4;

    // LÃ­nea
    pdf.setLineWidth(0.3);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 3;

    // Datos con paginación automática
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 51, 51);

    approvedProjects.forEach((proyecto, index) => {
      // Verificar si necesita nueva página
      if (yPosition > pageHeight - 20) {
        pdf.addPage();
        yPosition = 15;

        // Repetir encabezado en nueva página
        pdf.setFillColor(242, 242, 242);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 4, 'F');
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...this.COLOR_PRIMARY);
        pdf.text('Proyecto Aprobado', startX, yPosition);
        pdf.text('Calif.', pageWidth - 28, yPosition);
        yPosition += 5;

        pdf.setDrawColor(...this.COLOR_BORDER);
        pdf.setLineWidth(0.5);
        pdf.line(20, yPosition, pageWidth - 20, yPosition);
        yPosition += 2;

        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(51, 51, 51);
      }

      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(20, yPosition - 3, pageWidth - 40, 4, 'F');
      }

      const titulo = (proyecto.titulo_proyecto || 'Sin titulo').substring(0, 60);
      const calif = proyecto.calificacion ? `${proyecto.calificacion}` : 'Pend.';

      pdf.text(titulo, startX, yPosition);
      pdf.text(calif, pageWidth - 28, yPosition);
      yPosition += 4;
    });

    return yPosition + 2;
  }

  /**
   * Dibuja informaciÃ³n de materias (TODAS, con manejo de mÃºltiples pÃ¡ginas)
   */
  static drawSubjectsSection(pdf, subjectsData, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const rowHeight = 3.2; // Altura compacta por fila
    const margin = 20;
    const startX = 25;
    const dataStartY = yPosition + 10; // Espacio para tÃ­tulo y lÃ­nea

    if (!subjectsData || subjectsData.length === 0) {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(12);
      pdf.setTextColor(...this.COLOR_PRIMARY);
      pdf.setFont(undefined, 'bold');
      pdf.text('MATERIAS ASOCIADAS', 20, yPosition);
      yPosition += 6;

      pdf.setDrawColor(...this.COLOR_PRIMARY);
      pdf.setLineWidth(0.8);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 6;

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text('No hay materias asociadas', 20, yPosition);
      return yPosition + 10;
    }

    // Verificar si hay espacio para el tÃ­tulo
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    // TÃ­tulo
    pdf.setFontSize(12);
    pdf.setTextColor(...this.COLOR_PRIMARY);
    pdf.setFont(undefined, 'bold');
    pdf.text(`MATERIAS ASOCIADAS (Total: ${subjectsData.length})`, 20, yPosition);
    yPosition += 5;

    // LÃ­nea divisoria
    pdf.setDrawColor(...this.COLOR_PRIMARY);
    pdf.setLineWidth(0.8);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 6;

    // Encabezado
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(...this.COLOR_PRIMARY);
    pdf.setFillColor(240, 245, 250);
    pdf.rect(margin, yPosition - 2.5, pageWidth - margin * 2, rowHeight, 'F');
    pdf.text('Materia', startX, yPosition);
    pdf.text('Cod', startX + 75, yPosition);
    pdf.text('Proy', pageWidth - 40, yPosition);
    yPosition += rowHeight + 0.5;

    // LÃ­nea bajo encabezado
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 1.5;

    // Datos
    pdf.setFontSize(8);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(51, 51, 51);

    subjectsData.forEach((materia, index) => {
      // Verificar si necesita nueva pÃ¡gina
      if (yPosition + rowHeight > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;

        // Repetir encabezado en nueva pÃ¡gina
        pdf.setFontSize(8);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(...this.COLOR_PRIMARY);
        pdf.setFillColor(240, 245, 250);
        pdf.rect(margin, yPosition - 2.5, pageWidth - margin * 2, rowHeight, 'F');
        pdf.text('Materia', startX, yPosition);
        pdf.text('Cod', startX + 75, yPosition);
        pdf.text('Proy', pageWidth - 40, yPosition);
        yPosition += rowHeight + 0.5;

        pdf.setLineWidth(0.3);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 1.5;

        pdf.setFontSize(8);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(51, 51, 51);
      }

      // Fondo alternado
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(margin, yPosition - 2.5, pageWidth - margin * 2, rowHeight, 'F');
      }

      const nombre = (materia.nombre_materia || 'Sin nombre').substring(0, 40);
      const codigo = (materia.codigo_materia || 'N/A').substring(0, 8);
      const count = String(materia.totalProyectos || 0);

      pdf.text(nombre, startX, yPosition);
      pdf.text(codigo, startX + 75, yPosition);
      pdf.text(count, pageWidth - 40, yPosition);
      yPosition += rowHeight;
    });

    return yPosition + 3;
  }

  /**
   * Dibuja pie de pÃ¡gina
   */
  static drawFooter(pdf, generatedDate) {
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const totalPages = pdf.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);

      // LÃ­nea decorativa
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);

      // Texto del pie
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Reporte generado: ${generatedDate}`, 20, pageHeight - 8);
      pdf.text(`Pagina ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 8, { align: 'right' });
    }
  }

  /**
   * Genera el reporte completo del evento
   */
  static async generateCompleteReport(eventId, eventName, reportData) {
    try {

      if (!reportData) {
        throw new Error('Datos del reporte no disponibles');
      }

      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // 1. Encabezado
      yPosition = this.drawReportHeader(pdf, eventName);

      // 2. Resumen rÃ¡pido
      if (reportData.stats) {
        yPosition = this.drawQuickSummary(pdf, reportData.stats, yPosition);
        yPosition += 5;
      }

      // 3. Seccion de Asistencias - REMOVIDA

      // 4. SecciÃ³n de Proyectos Registrados
      if (reportData.allProjects && Array.isArray(reportData.allProjects)) {
        if (reportData.allProjects.length > 0) {
          try {
            yPosition = this.drawProjectsSection(pdf, reportData.allProjects, yPosition);
            yPosition += 5;
          } catch (error) {
          }
        } else {
        }
      }

      // 5. SecciÃ³n de Proyectos Aprobados
      if (reportData.approvedProjects && Array.isArray(reportData.approvedProjects)) {
        if (reportData.approvedProjects.length > 0) {
          try {
            yPosition = this.drawApprovedProjectsSection(pdf, reportData.approvedProjects, yPosition);
            yPosition += 5;
          } catch (error) {
          }
        } else {
        }
      }

      // 6. SecciÃ³n de Materias
      if (reportData.subjects && Array.isArray(reportData.subjects)) {
        if (reportData.subjects.length > 0) {
          try {
            yPosition = this.drawSubjectsSection(pdf, reportData.subjects, yPosition);
          } catch (error) {
          }
        } else {
        }
      }

      // 7. Pie de pÃ¡gina
      const generatedDate = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      this.drawFooter(pdf, generatedDate);

      // Descargar
      const fileName = `Reporte_Evento_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      return { success: true, message: 'Reporte generado exitosamente' };
    } catch (error) {
      return { success: false, message: `Error al generar el reporte: ${error.message}`, error };
    }
  }
}

// Hook para usar el generador de reportes
export const useEventReportGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEventData = async (eventId) => {
    setLoading(true);
    setError(null);

    try {
      const headers = getAuthHeaders();

      // 1. Obtener asistencias del evento (usando AssistanceService con paginaciÃ³n automÃ¡tica)
      let attendance = [];
      try {
        const attendanceRes = await AssistanceService.obtenerAsistenciasEvento(eventId);
        attendance = attendanceRes?.data?.asistencias || [];
      } catch (error) {
        attendance = [];
      }

      // 2. Obtener proyectos del evento
      const projectsResponse = await fetchApi(
        API_ENDPOINTS.PROYECTOS_BY_EVENTO(eventId),
        { headers, withCredentials: true }
      );
      const projectsRes = await projectsResponse.json();
      let allProjects = [];
      if (Array.isArray(projectsRes)) {
        allProjects = projectsRes;
      } else if (projectsRes?.data?.data && Array.isArray(projectsRes.data.data)) {
        allProjects = projectsRes.data.data;
      } else if (projectsRes?.data && Array.isArray(projectsRes.data)) {
        allProjects = projectsRes.data;
      } else if (projectsRes?.proyectos && Array.isArray(projectsRes.proyectos)) {
        allProjects = projectsRes.proyectos;
      }

      // 3. Filtrar proyectos aprobados
      const approvedProjects = allProjects.filter(p =>
        p.estado === 'aprobado' || p.estado === 'calificado'
      );

      // 4. Obtener materias del evento (usar /list para obtener todas sin paginación)
      const materiasResponse = await fetchApi(API_ENDPOINTS.ADMIN_MATERIAS_LIST, {
        headers,
        withCredentials: true
      });
      const materiasRes = await materiasResponse.json();
      let allSubjects = [];
      if (Array.isArray(materiasRes)) {
        allSubjects = materiasRes;
      } else if (materiasRes?.data?.data && Array.isArray(materiasRes.data.data)) {
        allSubjects = materiasRes.data.data;
      } else if (materiasRes?.data && Array.isArray(materiasRes.data)) {
        allSubjects = materiasRes.data;
      } else if (materiasRes?.materias && Array.isArray(materiasRes.materias)) {
        allSubjects = materiasRes.materias;
      }

      // Contar proyectos por materia (usando docentes_materias)
      const proyectosPorMateria = {};
      allProjects.forEach(proyecto => {
        // Los proyectos tienen un array docentes_materias
        if (proyecto.docentes_materias && Array.isArray(proyecto.docentes_materias)) {
          proyecto.docentes_materias.forEach(dm => {
            // dm tiene la informaciÃ³n de la materia
            if (dm.codigo_materia) {
              proyectosPorMateria[dm.codigo_materia] = (proyectosPorMateria[dm.codigo_materia] || 0) + 1;
            }
          });
        }
      });


      // Asociar conteos a las materias
      const eventSubjects = allSubjects.map(materia => ({
        ...materia,
        totalProyectos: proyectosPorMateria[materia.codigo_materia] || 0
      }));

      // 5. Procesar datos para el reporte
      const attendanceByRole = {};
      attendance.forEach(person => {
        const role = person.tipo_usuario || 'Sin rol';
        attendanceByRole[role] = (attendanceByRole[role] || 0) + 1;
      });

      const attendanceData = Object.entries(attendanceByRole).map(([tipo, cantidad]) => ({
        tipo,
        cantidad,
        porcentaje: attendance.length > 0 ? (cantidad / attendance.length) * 100 : 0
      }));

      const stats = {
        totalAsistencias: attendance.length,
        totalProyectos: allProjects.length,
        proyectosAprobados: approvedProjects.length,
        totalMaterias: eventSubjects.length
      };


      return {
        stats,
        attendance: attendanceData,
        allProjects,
        approvedProjects,
        subjects: eventSubjects
      };
    } catch (err) {
      const errorMsg = err.message || 'Error al obtener datos del evento';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (eventId, eventName) => {
    try {
      setLoading(true);
      const reportData = await fetchEventData(eventId);
      const result = await EventReportGenerator.generateCompleteReport(
        eventId,
        eventName,
        reportData
      );
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Error al generar el reporte';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    generateReport,
    fetchEventData,
    loading,
    error
  };
};

export default EventReportGenerator;

