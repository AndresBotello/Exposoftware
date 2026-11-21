import { createContext, useState, useEffect, useContext } from "react";

// 1️⃣ Crear el contexto
const EventContext = createContext();

// 2️⃣ Crear el provider del contexto
export function EventProvider({ children }) {
  const [evento, setEvento] = useState(() => {
    // Cargar datos guardados si existen
    const eventoGuardado = localStorage.getItem("eventoExposoftware");
    return eventoGuardado
      ? JSON.parse(eventoGuardado)
      : {
          nombre: "Exposoftware UPC",
          edicion: "XXIII",
          periodo: "2025-I",
          fechaInicio: "2025-11-15",
          fechaFin: "2025-11-20",
          totalProyectos: 120,
          descripcion:
            "Feria de innovación y desarrollo tecnológico de la Universidad Popular del Cesar.",
        };
  });

  // Guardar cambios en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem("eventoExposoftware", JSON.stringify(evento));
  }, [evento]);

  return (
    <EventContext.Provider value={{ evento, setEvento }}>
      {children}
    </EventContext.Provider>
  );
}

// 3️⃣ Hook para consumir el contexto
export function useEvento() {
  return useContext(EventContext);
}
