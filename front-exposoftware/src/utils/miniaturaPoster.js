// Miniatura liviana del poster (página 1 del PDF) servida por Cloudinary.
// La URL guardada en el backend trae la página completa a tamaño original; aquí
// se pide una versión de 480 px y formato automático (WebP/AVIF según el navegador).
export function miniaturaPoster(urlPreview, ancho = 480) {
  if (!urlPreview) return null;
  if (!urlPreview.includes('/image/upload/')) return urlPreview;
  return urlPreview.replace(
    /\/image\/upload\/(f_png,pg_1\/)?/,
    `/image/upload/pg_1,w_${ancho},c_limit,q_auto,f_auto/`
  );
}
