import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useEvento } from "../../contexts/EventContext";

export default function Home_dinamico() {
  const { evento } = useEvento();
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
    "https://elpilon2024.s3.us-west-2.amazonaws.com/2025/04/upc-2.jpg",
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
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 overflow-hidden min-h-screen flex items-center">
        {/* Carrusel de imágenes de fondo */}
        <div className="absolute inset-0 z-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                index === currentImageIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              }`}
            >
              <img
                src={image}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-white/85 via-white/75 to-green-50/85"></div>
            </div>
          ))}
        </div>

        {/* Contenido del evento dinámico */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div
              className={`space-y-4 sm:space-y-6 transition-all duration-1000 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
            >
              {/* Badge dinámico */}
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                    Evento en curso • {getCurrentDate()}
              </div>

              {/* Título dinámico */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-green-600 leading-tight drop-shadow-sm">
                {evento.edicion}{" "}
                <span className="bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  EXPOSOFTWARE
                </span>
              </h1>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 drop-shadow-sm flex items-center gap-2">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Universidad Popular del Cesar
              </h2>

              {/* Descripción dinámica */}
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed drop-shadow-sm">
                {evento.descripcion}
              </p>

              {/* Stats dinámicos */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {evento.edicion}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Edición</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {evento.totalProyectos}+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Proyectos
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600">
                    {evento.fechaInicio}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Fecha Inicio
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/guest/dashboard"
                  className="inline-block bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Ver proyectos del evento
                </Link>
              </div>
            </div>

            {/* Visualización decorativa */}
            <div className="hidden lg:flex justify-center items-center min-h-[400px] relative">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 rounded-full border-4 border-green-300/30 animate-ping"></div>
                <div className="absolute inset-8 rounded-full border-4 border-purple-300/30 animate-ping"></div>
                <div className="absolute inset-16 rounded-full border-4 border-orange-300/30 animate-ping"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-purple-400 to-blue-400 rounded-full opacity-60 blur-3xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
