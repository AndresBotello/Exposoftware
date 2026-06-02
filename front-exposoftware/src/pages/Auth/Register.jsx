import { useState, useEffect } from "react";
import { Loader2, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import {
  validateAllFields,
  hasErrors,
} from "./Register/validations";
import {
  handleChange as handleChangeUtil,
  handleSelectChange as handleSelectChangeUtil,
  handleDepartamentoChange as handleDepartamentoChangeUtil,
  handlePhoneChange as handlePhoneChangeUtil,
  handleSubmit as handleSubmitUtil,
  getInputClassName as getInputClassNameUtil,
} from "./Register/formHandlers";
import { API_ENDPOINTS } from "../../utils/constants";
import BackgroundCarousel from "./Register/BackgroundCarousel";
import MessageAlerts from "./Register/MessageAlerts";
import PersonalInfoSection from "./Register/PersonalInfoSection";
import IdentificationSection from "./Register/IdentificationSection";
import CredentialsSection from "./Register/CredentialsSection";
import InformacionEstudiante from "./RoleSections/InformacionEstudiante";

function RegisterPage() {
  const [errors, setErrors] = useState({});
  const [successFields, setSuccessFields] = useState({});
  const [paises, setPaises] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState("");
  const [mensajeError, setMensajeError] = useState("");
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const rol = "estudiante";

  // Estados para términos y condiciones
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [formData, setFormData] = useState({
    primerNombre: "",
    segundoNombre: "",
    primerApellido: "",
    segundoApellido: "",
    telefono: "",
    genero: "",
    orientacionSexual: "",
    fechaNacimiento: "",
    fechaIngreso: "",
    fechaFinalizacion: "",
    departamentoResidencia: "",
    ciudadResidencia: "",
    nacionalidad: "",
    paisNacimiento: "",
    direccionResidencia: "",
    rol: "estudiante",
    tipoDocumento: "",
    numeroDocumento: "",
    correo: "",
    programa: "",
    facultad: "",
    semestre: "",
    sector: "",
    intitucionOrigen: "",
    nombreEmpresa: "",
    periodo: "",
    titulado: "",
    tituloObtenido: "",
    contraseña: "",
    confirmarcontraseña: "",
  });

  // Mostrar pantalla de éxito cuando hay mensajeExito
  useEffect(() => {
    if (mensajeExito) {
      setShowSuccessScreen(true);
    }
  }, [mensajeExito]);

  // Cargar catálogos de países y departamentos al montar
  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [paisesRes, deptoRes] = await Promise.all([
          fetch(API_ENDPOINTS.CATALOGOS_PAISES),
          fetch(API_ENDPOINTS.CATALOGOS_DEPARTAMENTOS),
        ]);

        if (paisesRes.ok) {
          const data = await paisesRes.json();
          const arr = Array.isArray(data) ? data : (data.data || data.paises || []);
          setPaises(arr.map((p) => ({ value: p.codigo || p.code, label: p.nombre || p.name })));
        }

        if (deptoRes.ok) {
          const data = await deptoRes.json();
          setDepartamentos(Array.isArray(data) ? data : (data.data || data.departamentos || []));
        }
      } catch (err) {
      }
    };
    loadCatalogs();
  }, []);

  // Cargar municipios cuando cambia el departamento
  useEffect(() => {
    if (formData.departamentoResidencia) {
      fetch(API_ENDPOINTS.CATALOGOS_MUNICIPIOS(formData.departamentoResidencia))
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setMunicipios(Array.isArray(data) ? data : (data.data || data.municipios || [])))
        .catch(() => setMunicipios([]));
    } else {
      setMunicipios([]);
    }
  }, [formData.departamentoResidencia]);

  // Desactivar Departamento y Municipio si el país no es Colombia (COL)
  useEffect(() => {
    if (formData.nacionalidad !== "COL") {
      setFormData((prev) => ({
        ...prev,
        departamentoResidencia: "",
        ciudadResidencia: "",
      }));
      setMunicipios([]);
    }
  }, [formData.nacionalidad]);

  // Handlers
  const handleChange = (e) => {
    handleChangeUtil(e, formData, setFormData, setErrors, setSuccessFields, rol);
  };

  const handleSelectChange = (name, option) => {
    handleSelectChangeUtil(name, option, formData, setFormData, setErrors, setSuccessFields, rol);
  };

  const handlePhoneChange = (value) => {
    handlePhoneChangeUtil(value, formData, setFormData, setErrors, setSuccessFields, rol);
  };

  const handleDepartamentoChange = (e) => {
    handleDepartamentoChangeUtil(e, formData, setFormData, setErrors, setSuccessFields, rol);
  };

  const handleTermsChange = (e) => {
    setAcceptedTerms(e.target.checked);
  };

  const handleSubmit = (e) => {
    if (!acceptedTerms) {
      setMensajeError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }
    handleSubmitUtil(e, formData, rol, setCargando, setMensajeExito, setMensajeError, setErrors, validateAllFields, hasErrors);
  };

  const getInputClassName = (fieldName) => {
    return getInputClassNameUtil(fieldName, errors, successFields, cargando);
  };

  // Si se muestra la pantalla de éxito, mostrar eso en lugar del formulario
  if (showSuccessScreen) {
    return (
      <main className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 md:py-20 px-4 sm:px-6">
        <BackgroundCarousel />

        {/* Pantalla de éxito */}
        <section className="bg-white p-8 sm:p-12 rounded-2xl shadow-2xl w-full max-w-2xl relative z-10 text-center">
          {/* Icono de éxito animado */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center animate-pulse">
              <i className="pi pi-check text-4xl text-green-600"></i>
            </div>
          </div>

          {/* Título */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            ¡Registro exitoso!
          </h1>

          {/* Mensaje principal */}
          <p className="text-gray-700 text-lg leading-relaxed mb-8">
            Hemos enviado un correo electrónico a la dirección registrada. Por favor, revisa tu bandeja de entrada y sigue el enlace de activación para validar tu cuenta. Una vez activada, podrás iniciar sesión y utilizar la plataforma.
          </p>

          {/* Detalles */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <div className="flex gap-3 items-start">
              <i className="pi pi-info-circle text-blue-600 text-xl mt-0.5"></i>
              <div className="text-left">
                <p className="text-blue-900 font-semibold mb-1">Próximos pasos:</p>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>✓ Revisa tu correo electrónico (incluyendo la carpeta de spam)</li>
                  <li>✓ Haz clic en el enlace de activación proporcionado</li>
                  <li>✓ Confirma tu email para activar tu cuenta</li>
                  <li>✓ Inicia sesión con tus credenciales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botón para ir a login */}
          <button
            onClick={() => window.location.href = "/login"}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Ir a Iniciar Sesión
          </button>

          {/* Mensaje de redirección automática */}
          <p className="text-gray-500 text-sm mt-4">
            Se te redireccionará automáticamente en unos momentos...
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden py-8 md:py-20 px-4 sm:px-6">
      <BackgroundCarousel />

      {/* Contenido del formulario */}
      <section className="bg-white p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl relative z-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-2 text-green-700">
          Registro de Usuario
        </h1>
        <p className="text-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
          Completa los campos para crear tu cuenta en{" "}
          <span className="font-semibold text-green-600">Exposoftware</span>.
        </p>

        <MessageAlerts
          mensajeExito={mensajeExito}
          mensajeError={mensajeError}
        />

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 text-sm lg:text-base auto-rows-max">
          <PersonalInfoSection
            formData={formData}
            errors={errors}
            successFields={successFields}
            handleChange={handleChange}
            handleSelectChange={handleSelectChange}
            handlePhoneChange={handlePhoneChange}
            handleDepartamentoChange={handleDepartamentoChange}
            getInputClassName={getInputClassName}
            cargando={cargando}
            paises={paises}
            departamentos={departamentos}
            municipios={municipios}
          />

          <IdentificationSection
            formData={formData}
            errors={errors}
            successFields={successFields}
            handleChange={handleChange}
            getInputClassName={getInputClassName}
            cargando={cargando}
          />

          <InformacionEstudiante
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            cargando={cargando}
            successFields={successFields}
            getInputClassName={getInputClassName}
          />

          <CredentialsSection
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            getInputClassName={getInputClassName}
            cargando={cargando}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />

          {/* SECCIÓN DE TÉRMINOS Y CONDICIONES */}
          <div className="lg:col-span-2 border-t pt-4 sm:pt-6 mt-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              {/* Botón para expandir/contraer */}
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="w-full flex items-center justify-between hover:bg-gray-100 p-2 rounded transition-colors"
              >
                <span className="font-semibold text-gray-800 text-sm md:text-base">
                  Términos y Condiciones
                </span>
                {showTerms ? (
                  <ChevronUp size={20} className="text-green-600" />
                ) : (
                  <ChevronDown size={20} className="text-green-600" />
                )}
              </button>

              {/* Contenido expandible */}
              {showTerms && (
                <div className="mt-4 bg-white p-4 rounded border border-gray-200 max-h-64 overflow-y-auto text-xs md:text-sm text-gray-700 space-y-3">
                  <p>
                    <strong>1. Aceptación de los Términos</strong>
                    <br />
                    Al registrarte en Exposoftware, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no debes usar nuestro servicio.
                  </p>

                  <p>
                    <strong>2. Uso de Datos Personales</strong>
                    <br />
                    Recopilamos y procesamos tus datos personales según nuestra Política de Privacidad. Utilizamos tu información para:
                    <br />
                    • Crear y mantener tu cuenta
                    <br />
                    • Comunicarnos contigo sobre actualizaciones
                    <br />
                    • Mejorar nuestros servicios
                  </p>

                  <p>
                    <strong>3. Consentimiento para Comunicaciones</strong>
                    <br />
                    Consientes recibir correos electrónicos, notificaciones y mensajes relacionados con tu registro y actividad en la plataforma.
                  </p>

                  <p>
                    <strong>4. Responsabilidad del Usuario</strong>
                    <br />
                    Eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra bajo tu cuenta.
                  </p>

                  <p>
                    <strong>5. Modificación de Términos</strong>
                    <br />
                    Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente.
                  </p>

                  <p>
                    <strong>6. Limitación de Responsabilidad</strong>
                    <br />
                    Exposoftware no será responsable de daños indirectos o consecuentes derivados del uso de nuestro servicio.
                  </p>

                  <p>
                    <strong>7. Protección de Datos</strong>
                    <br />
                    Tus datos están protegidos con los más altos estándares de seguridad. Nos comprometemos a proteger tu privacidad y cumplir con todas las regulaciones aplicables.
                  </p>
                </div>
              )}

              {/* Checkbox de aceptación */}
              <div className="mt-4 flex items-start gap-3 p-2 rounded hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  id="termsCheckbox"
                  checked={acceptedTerms}
                  onChange={handleTermsChange}
                  className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer accent-green-600"
                />
                <label
                  htmlFor="termsCheckbox"
                  className="text-xs md:text-sm text-gray-700 cursor-pointer leading-tight"
                >
                  Acepto los{" "}
                  <span className="font-semibold text-green-600">
                    términos y condiciones
                  </span>
                  {" "}y autorizo el procesamiento de mis datos personales conforme a la política de privacidad de{" "}
                  <span className="font-semibold text-green-600">Exposoftware</span>.
                </label>
              </div>

              {/* Advertencia si no está aceptado */}
              {!acceptedTerms && (
                <div className="mt-3 flex items-start gap-2 p-2 bg-red-50 rounded border border-red-200">
                  <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">
                    Debes aceptar los términos y condiciones para continuar con el registro.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 mt-4">
            <button
              type="submit"
              disabled={cargando || !acceptedTerms}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {cargando ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Registrando usuario...
                </>
              ) : (
                "Registrar Usuario"
              )}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
            >
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </section>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </main>
  );
}

export default RegisterPage;
