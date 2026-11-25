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

// Medidas expresadas sobre una página carta de 952 px de ancho (612 pt)
const px = (v) => (v * 612) / 952;

const COLOR = {
  verde: [13, 93, 60],
  verdeOscuro: [11, 61, 43],
  verdeClaro: [238, 243, 240],
  dorado: [180, 148, 47],
  borde: [201, 211, 206],
  texto: [34, 34, 34],
  gris: [90, 90, 90],
  blanco: [255, 255, 255]
};

const PAGINA = { ancho: 952 };
const MARGEN = { izq: 101, der: 851 };
const CONTENIDO = { inicio: 106, fin: 1135 };
const ANCHO_NUMERO = 67;
const SEPARACION = 14;
const ALTO_LINEA_TITULO = 21;
const ALTO_LINEA_NOMBRE = 19.7;

// Las fuentes estándar de jsPDF solo admiten caracteres WinAnsi
const limpiarTexto = (valor) =>
  String(valor ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\xA0-\xFF–—‘’“”•…€™]/g, '')
    .trim();

const fuente = (doc, familia, estilo, tamano, color) => {
  doc.setFont(familia, estilo);
  doc.setFontSize(px(tamano));
  doc.setTextColor(...color);
};

const texto = (doc, contenido, x, y, opciones) => doc.text(contenido, px(x), px(y), opciones);

const rectangulo = (doc, x, y, ancho, alto, color) => {
  doc.setFillColor(...color);
  doc.rect(px(x), px(y), px(ancho), px(alto), 'F');
};

const linea = (doc, x1, y1, x2, y2, color, grosor = 1) => {
  doc.setDrawColor(...color);
  doc.setLineWidth(px(grosor));
  doc.line(px(x1), px(y1), px(x2), px(y2));
};

const dividir = (doc, contenido, ancho) => doc.splitTextToSize(contenido, px(ancho));

const obtenerDocentes = (proyecto) => {
  let docentes = [];
  if (Array.isArray(proyecto.docentes_materias) && proyecto.docentes_materias.length > 0) {
    docentes = proyecto.docentes_materias.map(d => d.nombre_docente || 'Nombre no disponible');
  } else if (proyecto.nombre_docente) {
    docentes = [proyecto.nombre_docente];
  }
  // Un docente puede venir repetido, una vez por cada materia
  const unicos = [...new Set(docentes.map(limpiarTexto).filter(Boolean))];
  return unicos.length > 0 ? unicos : ['No asignado'];
};

const obtenerNombreEstudiante = (estudiante) => {
  if (typeof estudiante === 'string') return estudiante;
  return (
    estudiante?.nombre_completo ||
    estudiante?.nombre ||
    estudiante?.nombreCompleto ||
    estudiante?.nombreEstudiante ||
    estudiante?.nombre_estudiante ||
    Object.values(estudiante || {}).find(v => typeof v === 'string' && v.length > 2) ||
    'Nombre no disponible'
  );
};

const obtenerEstudiantes = (proyecto) => {
  const lista = [
    proyecto.integrantes,
    proyecto.id_estudiantes,
    proyecto.estudiantes,
    proyecto.miembros,
    proyecto.participantes
  ].find(campo => Array.isArray(campo) && campo.length > 0) || [];

  const nombres = lista.map(e => limpiarTexto(obtenerNombreEstudiante(e))).filter(Boolean);
  return nombres.length > 0 ? nombres : ['No hay estudiantes registrados'];
};

const INFORMES = {
  aprobados: {
    estados: ['aprobado'],
    tituloPortada: 'PROYECTOS APROBADOS',
    encabezado: 'Informe de Proyectos Aprobados',
    archivo: 'Informe_Proyectos_Aprobados',
    mensajeVacio: 'No hay proyectos aprobados para generar el informe',
    mostrarEstado: false
  },
  noAprobados: {
    estados: ['pendiente', 'rechazado'],
    tituloPortada: 'PROYECTOS NO APROBADOS',
    encabezado: 'Informe de Proyectos No Aprobados',
    archivo: 'Informe_Proyectos_No_Aprobados',
    mensajeVacio: 'No hay proyectos pendientes ni rechazados para generar el informe',
    separarPorEstado: true
  }
};

const PALETA_APROBADO = {
  principal: COLOR.verde,
  claro: COLOR.verdeClaro,
  oscuro: COLOR.verdeOscuro
};

// Secciones del informe de no aprobados, cada una con su color
const SECCIONES = {
  pendiente: {
    principal: [180, 105, 14],
    claro: [253, 244, 227],
    oscuro: [110, 65, 8],
    titulo: 'PROYECTOS PENDIENTES',
    etiqueta: 'PENDIENTE',
    resumen: 'PENDIENTES'
  },
  rechazado: {
    principal: [166, 40, 40],
    claro: [251, 236, 236],
    oscuro: [112, 24, 24],
    titulo: 'PROYECTOS RECHAZADOS',
    etiqueta: 'RECHAZADO',
    resumen: 'RECHAZADOS'
  }
};
const ALTO_BANDA_SECCION = 40;

const dibujarBandaSeccion = (doc, seccion, total, y) => {
  rectangulo(doc, MARGEN.izq, y, MARGEN.der - MARGEN.izq, ALTO_BANDA_SECCION, seccion.principal);
  fuente(doc, 'times', 'bold', 19, COLOR.blanco);
  texto(doc, seccion.titulo, MARGEN.izq + 16, y + 26);
  fuente(doc, 'helvetica', 'bold', 13, COLOR.blanco);
  texto(doc, `Total: ${total}`, MARGEN.der - 16, y + 25, { align: 'right' });
};

const dibujarPortada = (doc, informe, fecha, total) => {
  const centro = PAGINA.ancho / 2;
  const centrado = { align: 'center' };

  rectangulo(doc, 0, 0, PAGINA.ancho, 459, COLOR.verde);
  rectangulo(doc, 0, 459, PAGINA.ancho, 8, COLOR.dorado);

  fuente(doc, 'times', 'bold', 23.3, COLOR.blanco);
  texto(doc, 'UNIVERSIDAD POPULAR DEL CESAR', centro, 151, centrado);
  linea(doc, 353, 173, 599, 173, COLOR.dorado);

  fuente(doc, 'times', 'bold', 51, COLOR.blanco);
  texto(doc, 'INFORME DE', centro, 291, centrado);
  texto(doc, informe.tituloPortada, centro, 358, centrado);

  fuente(doc, 'helvetica', 'bold', 15, COLOR.verde);
  texto(doc, 'FECHA DE GENERACIÓN', centro, 605, centrado);
  texto(doc, 'TOTAL DE PROYECTOS', centro, 740, centrado);

  fuente(doc, 'times', 'normal', 26, COLOR.verdeOscuro);
  texto(doc, fecha, centro, 641, centrado);
  texto(doc, String(total), centro, 776, centrado);

  linea(doc, MARGEN.izq, 1132, MARGEN.der, 1132, COLOR.verde, 2);
  linea(doc, MARGEN.izq, 1137, MARGEN.der, 1137, COLOR.dorado);
};

const dibujarEncabezadoYPie = (doc, informe, fecha, pagina, totalPaginas) => {
  fuente(doc, 'times', 'bold', 14, COLOR.verde);
  texto(doc, 'UNIVERSIDAD POPULAR DEL CESAR', MARGEN.izq, 58);
  fuente(doc, 'helvetica', 'normal', 12, COLOR.gris);
  texto(doc, informe.encabezado, MARGEN.der, 58, { align: 'right' });
  linea(doc, MARGEN.izq, 69.5, MARGEN.der, 69.5, COLOR.verde, 2);
  linea(doc, MARGEN.izq, 72.5, MARGEN.der, 72.5, COLOR.dorado);

  linea(doc, MARGEN.izq, 1160, MARGEN.der, 1160, COLOR.borde);
  texto(doc, `Fecha de generación: ${fecha}`, MARGEN.izq, 1181);
  texto(doc, `Página ${pagina} de ${totalPaginas}`, MARGEN.der, 1181, { align: 'right' });
};

// Calcula las líneas y la altura de la tarjeta antes de dibujarla
const prepararTarjeta = (doc, proyecto) => {
  fuente(doc, 'times', 'bold', 17, COLOR.verdeOscuro);
  const titulo = dividir(
    doc,
    limpiarTexto(proyecto.titulo_proyecto || proyecto.titulo) || 'Proyecto sin nombre',
    650
  );

  fuente(doc, 'helvetica', 'normal', 13, COLOR.texto);
  const docentes = obtenerDocentes(proyecto).map(n => dividir(doc, n, 255));
  const estudiantes = obtenerEstudiantes(proyecto).map(n => dividir(doc, n, 340));

  const contarLineas = (nombres) => nombres.reduce((suma, n) => suma + n.length, 0);
  const altoTitulo = 22 + titulo.length * ALTO_LINEA_TITULO;
  const altoCuerpo = 44 + Math.max(contarLineas(docentes), contarLineas(estudiantes)) * ALTO_LINEA_NOMBRE;

  return { titulo, docentes, estudiantes, altoTitulo, alto: altoTitulo + altoCuerpo };
};

const dibujarLista = (doc, etiqueta, nombres, x, y, color) => {
  fuente(doc, 'helvetica', 'bold', 11, color);
  texto(doc, etiqueta, x, y + 23);

  fuente(doc, 'helvetica', 'normal', 13, COLOR.texto);
  let yNombre = y + 45;
  nombres.forEach(lineas => {
    texto(doc, '•', x, yNombre);
    lineas.forEach(contenido => {
      texto(doc, contenido, x + 14, yNombre);
      yNombre += ALTO_LINEA_NOMBRE;
    });
  });
};

const dibujarTarjeta = (doc, tarjeta, numero, y, seccion) => {
  const paleta = seccion || PALETA_APROBADO;
  const { izq, der } = MARGEN;
  const xCuerpo = izq + ANCHO_NUMERO;
  const yCuerpo = y + tarjeta.altoTitulo;

  rectangulo(doc, xCuerpo, y, der - xCuerpo, tarjeta.altoTitulo, paleta.claro);
  rectangulo(doc, izq, y, ANCHO_NUMERO, tarjeta.alto, paleta.principal);

  doc.setDrawColor(...COLOR.borde);
  doc.setLineWidth(px(1));
  doc.rect(px(izq), px(y), px(der - izq), px(tarjeta.alto), 'S');
  linea(doc, xCuerpo, yCuerpo, der, yCuerpo, COLOR.borde);
  linea(doc, 469, yCuerpo + 11, 469, y + tarjeta.alto - 11, COLOR.borde);

  fuente(doc, 'times', 'bold', 22, COLOR.blanco);
  texto(doc, String(numero), izq + ANCHO_NUMERO / 2, y + 37, { align: 'center' });

  if (seccion) {
    fuente(doc, 'helvetica', 'bold', 9, COLOR.blanco);
    texto(doc, seccion.etiqueta, izq + ANCHO_NUMERO / 2, y + 56, { align: 'center' });
  }

  fuente(doc, 'times', 'bold', 17, paleta.oscuro);
  tarjeta.titulo.forEach((contenido, i) => {
    texto(doc, contenido, 183, y + 28 + i * ALTO_LINEA_TITULO);
  });

  dibujarLista(doc, 'DOCENTES RESPONSABLES', tarjeta.docentes, 184, yCuerpo, paleta.principal);
  dibujarLista(doc, 'ESTUDIANTES', tarjeta.estudiantes, 488, yCuerpo, paleta.principal);
};

export const construirInformePDF = (proyectos, informe = INFORMES.aprobados, fechaGeneracion = new Date()) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
  const fecha = fechaGeneracion.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  dibujarPortada(doc, informe, fecha, proyectos.length);

  // Con separación, primero van los pendientes y después los rechazados
  const grupos = informe.separarPorEstado
    ? informe.estados
        .map(estado => ({
          seccion: SECCIONES[estado],
          lista: proyectos.filter(p => p.estado === estado)
        }))
        .filter(grupo => grupo.lista.length > 0)
    : [{ seccion: null, lista: proyectos }];

  if (informe.separarPorEstado) {
    grupos.forEach(({ seccion, lista }, i) => {
      fuente(doc, 'helvetica', 'bold', 15, seccion.principal);
      texto(doc, `${seccion.resumen}: ${lista.length}`, PAGINA.ancho / 2, 860 + i * 34, { align: 'center' });
    });
  }

  let numero = 0;
  let y = CONTENIDO.inicio;

  grupos.forEach(({ seccion, lista }) => {
    // Cada grupo empieza en una página nueva
    doc.addPage();
    y = CONTENIDO.inicio;

    if (seccion) {
      dibujarBandaSeccion(doc, seccion, lista.length, y);
      y += ALTO_BANDA_SECCION + SEPARACION;
    }

    let tarjetasEnPagina = 0;
    lista.forEach(proyecto => {
      const tarjeta = prepararTarjeta(doc, proyecto);

      // La tarjeta no se parte entre dos páginas
      if (y + tarjeta.alto > CONTENIDO.fin && tarjetasEnPagina > 0) {
        doc.addPage();
        y = CONTENIDO.inicio;
        tarjetasEnPagina = 0;
      }

      numero += 1;
      dibujarTarjeta(doc, tarjeta, numero, y, seccion);
      y += tarjeta.alto + SEPARACION;
      tarjetasEnPagina += 1;
    });
  });

  const totalPaginas = doc.getNumberOfPages();
  for (let pagina = 2; pagina <= totalPaginas; pagina++) {
    doc.setPage(pagina);
    dibujarEncabezadoYPie(doc, informe, fecha, pagina, totalPaginas);
  }

  return doc;
};

// Devuelve false si no había proyectos para incluir
const generarInforme = async (proyectos, informe) => {
  const seleccionados = proyectos.filter(p => informe.estados.includes(p.estado));

  if (seleccionados.length === 0) {
    alert(informe.mensajeVacio);
    return false;
  }

  // Cargar detalles de todos los proyectos en paralelo
  const detallesPromesas = seleccionados.map(async (proyecto) => {
    const detalles = await obtenerDetallesProyecto(proyecto.id_proyecto);
    // Los integrantes pueden venir en detalles o necesitar una llamada separada
    let integrantes = [];
    if (detalles.integrantes) {
      integrantes = detalles.integrantes;
    } else {
      integrantes = await obtenerIntegrantesProyecto(proyecto.id_proyecto);
    }
    // El estado de la tabla manda: es el mismo con el que se filtró
    return { ...proyecto, ...detalles, estado: proyecto.estado, integrantes };
  });

  const proyectosConDetalles = await Promise.all(detallesPromesas);

  // Generar descarga
  const doc = construirInformePDF(proyectosConDetalles, informe);
  doc.save(`${informe.archivo}_${new Date().toISOString().split('T')[0]}.pdf`);
  return true;
};

export const generateApprovedProyectosPDF = (proyectos) =>
  generarInforme(proyectos, INFORMES.aprobados);

export const generateNotApprovedProyectosPDF = (proyectos) =>
  generarInforme(proyectos, INFORMES.noAprobados);
