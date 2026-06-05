import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { API_ENDPOINTS } from '../utils/constants';

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

class AdminQRService {
  // Crear imagen del QR con título
  static async crearQRConTitulo(base64QR, titulo) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const qrSize = 300;
        const padding = 20;
        const titleAreaHeight = 120;
        const totalHeight = qrSize + titleAreaHeight + padding * 2;

        const canvas = document.createElement('canvas');
        canvas.width = qrSize + padding * 2;
        canvas.height = totalHeight;

        const ctx = canvas.getContext('2d');

        // Fondo blanco
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Título
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';

        // Dividir título en líneas si es muy largo
        const maxWidth = qrSize - 10;
        const words = titulo.split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
          const testLine = currentLine + (currentLine ? ' ' : '') + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth) {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        if (currentLine) lines.push(currentLine);

        // Limitar a máximo 5 líneas
        lines = lines.slice(0, 5);

        // Dibujar líneas de título
        const lineHeight = 18;
        const startY = padding + 10;
        lines.forEach((line, idx) => {
          ctx.fillText(line, canvas.width / 2, startY + idx * lineHeight);
        });

        // Dibujar QR en el centro
        ctx.drawImage(img, padding, padding + titleAreaHeight, qrSize, qrSize);

        // Convertir canvas a blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };

      img.onerror = () => {
        reject(new Error('Error cargando imagen QR'));
      };

      img.src = `data:image/png;base64,${base64QR}`;
    });
  }

  static async descargarQRsEvento(idEvento, urlFront = null, nombreEvento = 'evento') {
    try {
      const baseUrl = urlFront || window.location.origin;
      const url = `${API_ENDPOINTS.ADMIN_QRS_LOTE_EVENTO(idEvento)}?url_front=${encodeURIComponent(baseUrl)}`;

      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Error generando QRs: ${response.status}`);
      }

      const { data } = await response.json();

      // Crear ZIP con todos los QRs
      const zip = new JSZip();

      if (data.qrs && Array.isArray(data.qrs)) {
        // Procesar QRs secuencialmente para no sobrecargar el navegador
        for (let idx = 0; idx < data.qrs.length; idx++) {
          const qr = data.qrs[idx];
          const titulo = qr.titulo_proyecto || `Proyecto ${idx + 1}`;

          try {
            // Crear imagen con título
            const blob = await this.crearQRConTitulo(qr.qr_base64, titulo);

            // Nombre del archivo: 001_titulo_corto.png
            const num = String(idx + 1).padStart(3, '0');
            const titleSafe = titulo.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
            zip.file(`${num}_${titleSafe}.png`, blob);
          } catch (error) {
            console.error(`Error procesando QR ${idx + 1}:`, error);
            // Si falla un QR, continuar con los demás
          }
        }
      }

      // Generar y descargar ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `qrs_${nombreEvento}_${data.total_proyectos || 0}.zip`;
      saveAs(blob, filename);

      return {
        success: true,
        total: data.total_proyectos || 0,
        nombreEvento: data.nombre_evento || nombreEvento
      };
    } catch (error) {
      throw error;
    }
  }
}

export default AdminQRService;
