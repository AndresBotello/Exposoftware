import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import exposoftwareBackground from "../../assets/exposoftware-background.png";
import exposoftwareAnuncio from "../../assets/exposoftware-anuncio.jpg";

const CLAVE_ANUNCIO = "exposoftware_anuncio_visto";

// Se muestra solo la primera vez por sesión del navegador (sessionStorage puede fallar en modo privado)
// Respaldo en memoria: sobrevive si algo limpia sessionStorage (p. ej. al cerrar sesión)
let anuncioMostradoEnMemoria = false;

const anuncioYaVisto = () => {
  if (anuncioMostradoEnMemoria) return true;
  try {
    return sessionStorage.getItem(CLAVE_ANUNCIO) === "1";
  } catch {
    return false;
  }
};

export default function Home() {
  const [mostrarAnuncio, setMostrarAnuncio] = useState(() => !anuncioYaVisto());

  useEffect(() => {
    if (!mostrarAnuncio) return;
    anuncioMostradoEnMemoria = true;
    try {
      sessionStorage.setItem(CLAVE_ANUNCIO, "1");
    } catch {
      /* ignorar */
    }
  }, [mostrarAnuncio]);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Anuncio vertical emergente */}
      {mostrarAnuncio && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setMostrarAnuncio(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Anuncio XXIII Feria Tecnológica Exposoftware"
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMostrarAnuncio(false)}
              aria-label="Cerrar anuncio"
              className="absolute -top-3 -right-3 z-10 w-10 h-10 rounded-full bg-white text-gray-800 text-xl font-bold shadow-lg hover:bg-gray-100 hover:scale-105 transition flex items-center justify-center"
            >
              ✕
            </button>
            <img
              src={exposoftwareAnuncio}
              alt="Anuncio XXIII Feria Tecnológica Exposoftware"
              className="max-h-[88vh] max-w-[92vw] w-auto h-auto rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
      {/* Hero Section - Completamente Responsive */}
      
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 overflow-hidden min-h-screen flex items-center">

        {/* Banner estático en lugar del carrusel */}
        <div className="absolute inset-[1.5%] z-0 flex items-center justify-center">
          <img
            src={exposoftwareBackground}
            alt="XXIII Jornada de Investigación Exposoftware"
            className="w-full h-full object-contain"
          />
          {/* Degradado: suaviza los bordes y funde el banner con la sección siguiente */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-white/40 to-transparent" />
        </div>
      </section>
      
      {/* Sección Cómo Participar */}
      <section className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-600 mb-4">
              ¿Cómo Participar?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Paso 1 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-green-200 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">1. Idea y Equipo</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Forma tu equipo y desarrolla una idea de proyecto innovador que resuelva una problemática real.
              </p>
            </div>
            
            {/* Paso 2 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-yellow-200 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">2. Inscribe tu Proyecto</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Completa el formulario de inscripción en nuestra plataforma antes de la fecha límite.
              </p>
            </div>
            
            {/* Paso 3 */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-green-200 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">3. Presenta y Gana</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Prepara tu presentación y demuestre el potencial de tu proyecto ante los jurados y la comunidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Características con diseño de cards flotantes */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Título de sección */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              ¿Por qué participar?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre las razones que hacen de EXPOSOFTWARE el evento académico más importante del año
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Card 1 - Innovación */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-green-200 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Innovación</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Proyectos que transforman ideas en soluciones tecnológicas reales que impactan a la sociedad
              </p>
            </div>
            
            {/* Card 2 - Colaboración */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-purple-200 transition-all hover:shadow-lg">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Colaboración</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Espacio de encuentro entre estudiantes, docentes e industria para crear sinergias
              </p>
            </div>
            
            {/* Card 3 - Excelencia */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-gray-100 hover:border-orange-200 transition-all hover:shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 text-center mb-3">Excelencia</h3>
              <p className="text-gray-600 text-center text-sm sm:text-base">
                Reconocimiento al talento y esfuerzo de nuestra destacada comunidad académica
              </p>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            ¿Listo para mostrar tu proyecto?
          </h2>
          <p className="text-green-50 text-lg mb-8 max-w-2xl mx-auto">
            Únete a la comunidad de innovadores y comparte tu trabajo con cientos de estudiantes, profesores y profesionales
          </p>
          <Link to="/login" className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform">
            Registrarse Ahora
          </Link>
        </div>
      </section>
    </div>
  );
}