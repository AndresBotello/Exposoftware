import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const images = [
    "https://elpilon2024.s3.us-west-2.amazonaws.com/2024/12/IMG_0427.jpeg",
    "https://elpilon2024.s3.us-west-2.amazonaws.com/2025/04/upc-2.jpg"
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section - Completamente Responsive */}
      <section className="relative py-6 sm:py-8 md:py-12 lg:py-16 xl:py-20 overflow-hidden min-h-screen flex items-center">

        {/* Carrusel de imágenes de fondo con efecto parallax */}
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
              }`}
            >
              <img
                src={image}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Overlay mejorado con gradiente dinámico - responsive */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-green-50/90 sm:from-white/85 sm:via-white/75 sm:to-green-50/85"></div>
            </div>
          ))}

          {/* Elementos decorativos flotantes - ocultos en móviles pequeños */}
          <div className="hidden sm:block absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="hidden md:block absolute bottom-40 right-20 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="hidden lg:block absolute top-1/3 right-10 w-24 h-24 bg-orange-400/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-10 xl:gap-12 items-center">

            {/* Contenido izquierdo con animaciones - completamente responsive */}
            <div className={`space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

              {/* Badge animado - responsive */}
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="hidden xs:inline">Evento en curso • {getCurrentDate()}</span>
                <span className="xs:hidden">{getCurrentDate()}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-green-600 leading-tight drop-shadow-sm">
                XXI Jornada de Investigación{" "}
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  EXPOSOFTWARE
                </span>
              </h1>

              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-800 drop-shadow-sm flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                  Universidad Popular del Cesar
                </span>
              </h2>

              <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed drop-shadow-sm">
                ¡Bienvenidos a la fiesta del conocimiento y la innovación! Un espacio donde la creatividad de nuestros estudiantes y docentes cobra vida a través de proyectos de software que marcan la diferencia. Prepárense para explorar, aprender e inspirarse.
              </p>

              {/* Stats rápidos - completamente responsive */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 py-3 sm:py-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">XXI</div>
                  <div className="text-xs sm:text-sm text-gray-600">Edición</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">100+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Proyectos</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">500+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Participantes</div>
                </div>
              </div>


            </div>

            {/* Visualización 3D mejorada - oculta en móviles pequeños, responsive en tablets+ */}
            <div className="hidden lg:flex justify-center items-center min-h-[300px] xl:min-h-[400px] relative">
              <div className="relative w-full max-w-sm xl:max-w-md aspect-square">
                {/* Círculos concéntricos animados */}
                <div className="absolute inset-0 rounded-full border-4 border-green-300/30 animate-ping" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-8 rounded-full border-4 border-purple-300/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '0.5s' }}></div>
                <div className="absolute inset-16 rounded-full border-4 border-orange-300/30 animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>

                {/* Efecto de fondo difuminado mejorado */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-purple-400 to-blue-400 rounded-full opacity-60 blur-3xl animate-pulse"></div>

                {/* Iconos flotantes - responsive */}
                <div className="absolute top-8 left-8 xl:top-10 xl:left-10 w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-lg shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '2s' }}>
                  <svg className="w-5 h-5 xl:w-6 xl:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                  </svg>
                </div>
                <div className="absolute bottom-8 right-8 xl:bottom-10 xl:right-10 w-10 h-10 xl:w-12 xl:h-12 bg-white rounded-lg shadow-lg flex items-center justify-center animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.5s' }}>
                  <svg className="w-5 h-5 xl:w-6 xl:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Indicadores del carrusel mejorados - responsive */}
        <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 sm:h-2.5 md:h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex
                  ? "bg-green-600 w-5 sm:w-6 md:w-8 shadow-lg"
                  : "bg-green-300 hover:bg-green-400 w-2 sm:w-2.5 md:w-3"
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll indicator - oculto en móviles pequeños */}
        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
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