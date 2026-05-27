import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Componente ReportGenerator - Maneja todas las funcionalidades de exportación
 * de gráficas y reportes para los dashboards con formato profesional
 */
export class ReportGenerator {
  
  /**
   * Intenta cargar una imagen desde una URL con fallbacks
   */
  static async loadImageData(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*'
          }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const blob = await response.blob();
        return await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        if (i === retries - 1) return null;
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar antes de reintentar
      }
    }
    return null;
  }

  /**
   * Dibuja un encabezado profesional con logos o placeholders
   */
  static async drawHeader(pdf, pageWidth, institutionName, eventName) {
    const color = [22, 163, 74];
    
    // URLs de los logos - con alternativas
    const logoUnicesar = 'https://res.cloudinary.com/dtuyckctv/image/upload/v1764001427/SIMBOLO-UNICESAR-2024_webtiu.png';
    const logoEvent = 'https://res.cloudinary.com/dtuyckctv/image/upload/v1761966781/images-removebg-preview_uxcfn3.png';
    
    // Intentar cargar logos
    const logoUnicesarData = await this.loadImageData(logoUnicesar);
    const logoEventData = await this.loadImageData(logoEvent);

    // Dibujar logo izquierdo
    if (logoUnicesarData) {
      try {
        pdf.addImage(logoUnicesarData, 'PNG', 15, 8, 15, 15);
      } catch (error) {
        this.drawLogoPlaceholder(pdf, 15, 8);
      }
    } else {
      this.drawLogoPlaceholder(pdf, 15, 8);
    }

    // Dibujar logo derecho
    if (logoEventData) {
      try {
        pdf.addImage(logoEventData, 'PNG', pageWidth - 30, 8, 15, 15);
      } catch (error) {
        this.drawLogoPlaceholder(pdf, pageWidth - 30, 8);
      }
    } else {
      this.drawLogoPlaceholder(pdf, pageWidth - 30, 8);
    }
    
    // Línea superior decorativa
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.line(0, 28, pageWidth, 28);
    
    // Título principal
    pdf.setFontSize(24);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORTE DE DASHBOARD', pageWidth / 2, 40, { align: 'center' });
    
    // Subtítulo
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${institutionName} - ${eventName}`, pageWidth / 2, 46, { align: 'center' });
    
    // Línea inferior decorativa
    pdf.setDrawColor(...color);
    pdf.line(15, 50, pageWidth - 15, 50);
  }

  /**
   * Dibuja un placeholder en lugar del logo si falla la carga
   */
  static drawLogoPlaceholder(pdf, x, y, size = 15) {
    const color = [22, 163, 74];
    
    // Rectángulo de fondo
    pdf.setFillColor(240, 240, 240);
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, size, size, 'FD');
    
    // Símbolo (cuadrado con cruz)
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.3);
    const midX = x + size / 2;
    const midY = y + size / 2;
    const offset = 3;
    
    pdf.line(midX - offset, midY, midX + offset, midY);
    pdf.line(midX, midY - offset, midX, midY + offset);
  }

  /**
   * Dibuja la sección de información del usuario
   */
  static drawUserInfo(pdf, userInfo, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const color = [22, 163, 74];
    
    // Fondo gris claro para la sección
    pdf.setFillColor(240, 240, 240);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 35, 'F');
    
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont(undefined, 'bold');
    pdf.text(`${userInfo.role || 'Usuario'}: ${userInfo.name}`, 20, yPosition + 3);
    
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    
    let tempY = yPosition + 10;
    pdf.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, 20, tempY);
    tempY += 6;
    
    if (userInfo.email) {
      pdf.text(`Correo: ${userInfo.email}`, 20, tempY);
      tempY += 6;
    }
    
    if (userInfo.category) {
      pdf.text(`Categoría: ${userInfo.category}`, 20, tempY);
    }
    
    return yPosition + 40;
  }

  /**
   * Dibuja la sección de estadísticas principales
   */
  static drawStatistics(pdf, estadisticas, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const color = [22, 163, 74];
    
    pdf.setFontSize(13);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('ESTADÍSTICAS PRINCIPALES', 20, yPosition);
    
    yPosition += 8;
    
    const stats = [];
    if (estadisticas.totalProyectos !== undefined) {
      stats.push(`Total de Proyectos: ${estadisticas.totalProyectos}`);
    }
    if (estadisticas.aprobados !== undefined) {
      stats.push(`Aprobados: ${estadisticas.aprobados}`);
    }
    if (estadisticas.reprobados !== undefined) {
      stats.push(`Reprobados: ${estadisticas.reprobados}`);
    }
    if (estadisticas.pendientes !== undefined) {
      stats.push(`Pendientes: ${estadisticas.pendientes}`);
    }
    if (estadisticas.totalEstudiantes !== undefined) {
      stats.push(`Estudiantes: ${estadisticas.totalEstudiantes}`);
    }
    if (estadisticas.totalProfesores !== undefined) {
      stats.push(`Profesores: ${estadisticas.totalProfesores}`);
    }
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    
    const itemsPerColumn = Math.ceil(stats.length / 2);
    let currentY = yPosition;
    
    stats.forEach((stat, index) => {
      const xPosition = index < itemsPerColumn ? 25 : (pageWidth / 2 + 5);
      const yPos = index < itemsPerColumn ? currentY + (index * 6) : currentY + ((index - itemsPerColumn) * 6);
      pdf.text(`• ${stat}`, xPosition, yPos);
    });
    
    return yPosition + (itemsPerColumn * 6) + 12;
  }

  /**
   * Dibuja el pie de página en todas las páginas
   */
  static drawFooter(pdf, institutionName, eventName) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const totalPages = pdf.internal.getNumberOfPages();
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.3);
      pdf.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont(undefined, 'normal');
      pdf.text(`${institutionName} - ${eventName}`, 20, pageHeight - 8);
      
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 8, { align: 'right' });
    }
  }

  /**
   * Exporta un reporte completo del dashboard con formato profesional
   */
  static async exportarReporteCompleto(config) {
    const {
      userInfo,
      estadisticas,
      chartIds,
      chartTitles,
      chartData,
      institutionName = 'Universidad Popular del Cesar',
      eventName = 'Expo-software 2025'
    } = config;

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const color = [22, 163, 74];

      // Portada con encabezado
      await this.drawHeader(pdf, pageWidth, institutionName, eventName);
      let yPosition = 55;
      
      // Información del usuario
      yPosition = this.drawUserInfo(pdf, userInfo, yPosition);
      
      // Estadísticas principales
      yPosition = this.drawStatistics(pdf, estadisticas, yPosition);
      yPosition += 5;

      // Procesar cada gráfica
      for (let i = 0; i < chartIds.length; i++) {
        const chartId = chartIds[i];
        const title = chartTitles[i];
        const data = chartData[i];

        if (yPosition > pageHeight - 85) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setTextColor(...color);
        pdf.setFont(undefined, 'bold');
        pdf.text(title.toUpperCase(), 20, yPosition);
        yPosition += 7;

        pdf.setDrawColor(22, 163, 74);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition, 100, yPosition);
        yPosition += 5;

        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 1.2,
            useCORS: true,
            allowTaint: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 70;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - 40) {
            pdf.addPage();
            yPosition = 20;
          }

          const xPosition = (pageWidth - imgWidth) / 2;
          pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 8;

          pdf.setFontSize(9);
          pdf.setTextColor(50, 50, 50);
          pdf.setFont(undefined, 'normal');

          let detailY = yPosition;
          const maxItemsPerPage = Math.floor((pageHeight - detailY - 30) / 5);

          data.forEach((item, index) => {
            if (index > 0 && index % maxItemsPerPage === 0) {
              pdf.addPage();
              detailY = 20;
            }

            const percentage = ((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1);
            const itemText = `${index + 1}. ${item.name}: ${item.value} (${percentage}%)`;
            
            pdf.text(itemText, 25, detailY);
            detailY += 5;
          });

          yPosition = detailY + 8;
        }
      }

      this.drawFooter(pdf, institutionName, eventName);

      const fileName = `Reporte_Dashboard_${userInfo.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      alert('Error al generar el reporte completo');
    }
  }
}

export default ReportGenerator;