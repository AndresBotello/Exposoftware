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
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    return null;
  }

  /**
   * Dibuja un encabezado profesional con logos o placeholders
   */
  static async drawHeader(pdf, pageWidth, institutionName, eventName) {
    const color = [22, 163, 74];
    
    const logoUnicesar = 'https://res.cloudinary.com/dtuyckctv/image/upload/v1764001427/SIMBOLO-UNICESAR-2024_webtiu.png';
    const logoEvent = 'https://res.cloudinary.com/dtuyckctv/image/upload/v1761966781/images-removebg-preview_uxcfn3.png';
    
    const logoUnicesarData = await this.loadImageData(logoUnicesar);
    const logoEventData = await this.loadImageData(logoEvent);

    if (logoUnicesarData) {
      try {
        pdf.addImage(logoUnicesarData, 'PNG', 15, 8, 15, 15);
      } catch (error) {
        this.drawLogoPlaceholder(pdf, 15, 8);
      }
    } else {
      this.drawLogoPlaceholder(pdf, 15, 8);
    }

    if (logoEventData) {
      try {
        pdf.addImage(logoEventData, 'PNG', pageWidth - 30, 8, 15, 15);
      } catch (error) {
        this.drawLogoPlaceholder(pdf, pageWidth - 30, 8);
      }
    } else {
      this.drawLogoPlaceholder(pdf, pageWidth - 30, 8);
    }
    
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.line(0, 28, pageWidth, 28);
    
    pdf.setFontSize(24);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('REPORTE DE ASISTENCIAS', pageWidth / 2, 40, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(eventName, pageWidth / 2, 46, { align: 'center' });
    
    pdf.setDrawColor(...color);
    pdf.line(15, 50, pageWidth - 15, 50);
  }

  /**
   * Dibuja un placeholder en lugar del logo si falla la carga
   */
  static drawLogoPlaceholder(pdf, x, y, size = 15) {
    const color = [22, 163, 74];
    
    pdf.setFillColor(240, 240, 240);
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.5);
    pdf.rect(x, y, size, size, 'FD');
    
    pdf.setDrawColor(...color);
    pdf.setLineWidth(0.3);
    const midX = x + size / 2;
    const midY = y + size / 2;
    const offset = 3;
    
    pdf.line(midX - offset, midY, midX + offset, midY);
    pdf.line(midX, midY - offset, midX, midY + offset);
  }

  /**
   * Dibuja la sección de información del evento
   */
  static drawEventInfo(pdf, estadisticas, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const color = [22, 163, 74];
    
    pdf.setFontSize(12);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('INFORMACIÓN DEL EVENTO', 20, yPosition);
    yPosition += 8;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    
    const eventData = [
      { label: 'Nombre del Evento:', value: estadisticas.evento },
      { label: 'Descripción:', value: estadisticas.descripcion },
      { label: 'Lugar:', value: estadisticas.lugar },
      { label: 'Estado:', value: estadisticas.estado }
    ];
    
    eventData.forEach(item => {
      if (item.value) {
        pdf.setFont(undefined, 'bold');
        pdf.text(item.label, 20, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(item.value, 60, yPosition);
        yPosition += 6;
      }
    });
    
    yPosition += 4;
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'bold');
    pdf.setTextColor(50, 50, 50);
    
    const dateTimeData = [
      { label: 'Fecha Inicio:', value: `${estadisticas.fechaInicio} ${estadisticas.horaInicio}` },
      { label: 'Fecha Fin:', value: `${estadisticas.fechaFin} ${estadisticas.horaFin}` }
    ];
    
    dateTimeData.forEach(item => {
      if (item.value) {
        pdf.text(item.label, 20, yPosition);
        pdf.setFont(undefined, 'normal');
        pdf.text(item.value, 60, yPosition);
        pdf.setFont(undefined, 'bold');
        yPosition += 6;
      }
    });
    
    return yPosition + 8;
  }

  /**
   * Dibuja las estadísticas principales en un formato de tarjetas
   */
  static drawMainStatistics(pdf, estadisticas, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const color = [22, 163, 74];
    const cardWidth = (pageWidth - 50) / 3;
    const cardHeight = 30;
    
    pdf.setFontSize(12);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('ESTADÍSTICAS PRINCIPALES', 20, yPosition);
    yPosition += 10;
    
    const stats = [
      {
        title: 'Total de Asistencias',
        value: estadisticas.totalAsistencias,
        icon: '👥'
      },
      {
        title: 'Hora Pico',
        value: estadisticas.horaPico,
        icon: '⏰'
      },
      {
        title: 'Promedio por Hora',
        value: estadisticas.promedioPorHora,
        icon: '📊'
      }
    ];
    
    stats.forEach((stat, index) => {
      const xPos = 20 + (index * (cardWidth + 5));
      
      // Fondo de la tarjeta
      pdf.setFillColor(240, 248, 255);
      pdf.setDrawColor(...color);
      pdf.setLineWidth(0.5);
      pdf.rect(xPos, yPosition, cardWidth, cardHeight, 'FD');
      
      // Título
      pdf.setFontSize(8);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(...color);
      pdf.text(stat.title, xPos + 5, yPosition + 6, { maxWidth: cardWidth - 10 });
      
      // Valor
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(String(stat.value), xPos + 5, yPosition + 18);
    });
    
    return yPosition + cardHeight + 10;
  }

  /**
   * Dibuja la información adicional de asistencias
   */
  static drawAdditionalInfo(pdf, estadisticas, yPosition) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const color = [22, 163, 74];
    
    pdf.setFontSize(11);
    pdf.setTextColor(...color);
    pdf.setFont(undefined, 'bold');
    pdf.text('DETALLES ADICIONALES', 20, yPosition);
    yPosition += 8;
    
    // Fondo gris claro para la sección
    pdf.setFillColor(245, 245, 245);
    pdf.rect(15, yPosition - 5, pageWidth - 30, 45, 'F');
    
    pdf.setFontSize(9);
    pdf.setFont(undefined, 'normal');
    pdf.setTextColor(50, 50, 50);
    
    const details = [
      { label: 'Horas Registradas:', value: estadisticas.horasRegistradas },
      { label: 'Personas Únicas:', value: estadisticas.totalAsistencias },
      { label: 'Generado por:', value: estadisticas.userInfo?.name || 'Administrador' },
      { label: 'Fecha de Generación:', value: estadisticas.fechaGeneracion },
      { label: 'Hora de Generación:', value: estadisticas.horaGeneracion }
    ];
    
    details.forEach((detail, index) => {
      const yPos = yPosition + (index * 6) + 3;
      pdf.setFont(undefined, 'bold');
      pdf.text(detail.label, 25, yPos);
      pdf.setFont(undefined, 'normal');
      pdf.text(String(detail.value), 80, yPos);
    });
    
    return yPosition + 50;
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
      pdf.text(`${institutionName}`, 20, pageHeight - 8);
      
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
      
      // Información del evento
      yPosition = this.drawEventInfo(pdf, estadisticas, yPosition);
      
      // Estadísticas principales en tarjetas
      yPosition = this.drawMainStatistics(pdf, estadisticas, yPosition);
      
      // Información adicional
      yPosition = this.drawAdditionalInfo(pdf, estadisticas, yPosition);

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

        pdf.setDrawColor(...color);
        pdf.setLineWidth(0.3);
        pdf.line(20, yPosition, 100, yPosition);
        yPosition += 8;

        const chartElement = document.getElementById(chartId);
        if (chartElement) {
          const canvas = await html2canvas(chartElement, {
            backgroundColor: '#ffffff',
            scale: 1.2,
            useCORS: true,
            allowTaint: false,
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 150;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (yPosition + imgHeight > pageHeight - 50) {
            pdf.addPage();
            yPosition = 20;
          }

          const xPosition = (pageWidth - imgWidth) / 2;
          pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 12;

          // Tabla de datos de asistencias por hora
          if (data && data.length > 0) {
            pdf.setFontSize(10);
            pdf.setTextColor(...color);
            pdf.setFont(undefined, 'bold');
            pdf.text('DETALLE DE ASISTENCIAS POR HORA', 20, yPosition);
            yPosition += 8;

            pdf.setFontSize(8);
            pdf.setFont(undefined, 'bold');
            
            // Encabezado de tabla
            pdf.setFillColor(22, 163, 74);
            pdf.setTextColor(255, 255, 255);
            pdf.rect(20, yPosition - 4, 50, 6, 'F');
            pdf.text('Hora', 25, yPosition);
            pdf.rect(70, yPosition - 4, 50, 6, 'F');
            pdf.text('Asistencias', 75, yPosition);
            
            yPosition += 7;
            pdf.setTextColor(0, 0, 0);
            pdf.setFont(undefined, 'normal');

            data.forEach((item, index) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
              }

              const isEvenRow = index % 2 === 0;
              if (isEvenRow) {
                pdf.setFillColor(240, 245, 250);
                pdf.rect(20, yPosition - 3, 100, 5, 'F');
              }

              pdf.text(item.hora, 25, yPosition);
              pdf.text(String(item.asistencias), 75, yPosition);
              yPosition += 5;
            });

            yPosition += 5;
          }
        }
      }

      this.drawFooter(pdf, institutionName, eventName);

      const fileName = `Reporte_Asistencias_${estadisticas.evento.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      alert('Error al generar el reporte completo');
    }
  }

  /**
   * Exportar gráfica como imagen PNG
   */
  static async exportarGraficaComoImagen(chartId, fileName) {
    try {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        alert('No se encontró la gráfica');
        return;
      }

      const canvas = await html2canvas(chartElement, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${fileName}.png`;
      link.click();
    } catch (error) {
      alert('Error al exportar la imagen');
    }
  }

  /**
   * Exportar gráfica como PDF
   */
  static async exportarGraficaComoPDF(chartId, title, data) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const color = [22, 163, 74];

      pdf.setFontSize(18);
      pdf.setTextColor(...color);
      pdf.setFont(undefined, 'bold');
      pdf.text(title, pageWidth / 2, 20, { align: 'center' });

      const chartElement = document.getElementById(chartId);
      if (chartElement) {
        const canvas = await html2canvas(chartElement, {
          backgroundColor: '#ffffff',
          scale: 1.2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const xPosition = (pageWidth - imgWidth) / 2;

        pdf.addImage(imgData, 'PNG', xPosition, 40, imgWidth, imgHeight);
      }

      pdf.save(`${title}.pdf`);
    } catch (error) {
      alert('Error al exportar el PDF');
    }
  }
}

export default ReportGenerator;