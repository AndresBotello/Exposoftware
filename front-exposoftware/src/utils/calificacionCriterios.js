// Criterios de calificación de proyectos (escala 0–5).
// Las claves coinciden con los campos del backend (calificacion_rules.py).
// La nota final la calcula el servidor; aquí solo se muestra en vivo.

export const CRITERIOS = [
  { clave: 'contenido_tecnico', nombre: 'Contenido técnico', peso: 0.2 },
  { clave: 'organizacion_proyecto', nombre: 'Organización del proyecto', peso: 0.2 },
  { clave: 'diseno_ui_ux', nombre: 'Diseño UI/UX', peso: 0.15 },
  { clave: 'utilidad_idea', nombre: 'Utilidad de la idea en la vida real', peso: 0.3 },
  { clave: 'comunicacion_presentacion', nombre: 'Comunicación y presentación de la idea', peso: 0.15 },
];

export const NOTA_MIN = 0;
export const NOTA_MAX = 5;

// Valores iniciales vacíos: nada se envía hasta que todos los criterios tengan nota.
export const criteriosVacios = () =>
  Object.fromEntries(CRITERIOS.map((c) => [c.clave, '']));

// Convierte la entrada a número válido en [0, 5] o null si no lo es.
export const aNumeroCriterio = (valor) => {
  if (valor === '' || valor === null || valor === undefined) return null;
  const n = Number(String(valor).replace(',', '.'));
  if (!Number.isFinite(n) || n < NOTA_MIN || n > NOTA_MAX) return null;
  return n;
};

// Todos los criterios completos y dentro de rango.
export const criteriosCompletos = (valores) =>
  CRITERIOS.every((c) => aNumeroCriterio(valores[c.clave]) !== null);

// Nota ponderada con 2 decimales (redondeo HALF_UP, igual que el backend).
export const calcularNotaIndividual = (valores) => {
  if (!criteriosCompletos(valores)) return null;
  const suma = CRITERIOS.reduce(
    (acc, c) => acc + aNumeroCriterio(valores[c.clave]) * c.peso,
    0
  );
  return Math.round((suma + Number.EPSILON) * 100) / 100;
};

// Payload del backend a partir de los valores del formulario.
export const payloadCriterios = (valores) =>
  Object.fromEntries(CRITERIOS.map((c) => [c.clave, aNumeroCriterio(valores[c.clave])]));

// Una sola nota aplicada a los 5 criterios. Como los pesos suman 1, la nota
// final queda igual a ese valor. Sirve para flujos que aún envían una nota única.
export const criteriosDesdeNotaUnica = (nota) => {
  const n = aNumeroCriterio(nota);
  if (n === null) return null;
  return Object.fromEntries(CRITERIOS.map((c) => [c.clave, n]));
};
