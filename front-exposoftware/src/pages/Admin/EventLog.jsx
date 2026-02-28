import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import * as AuthService from "../../Services/AuthService";
import EventLogService from "../../Services/EventLogService";

export default function EventLog() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null); // { id, pdfBase64, pdfName }
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state
  const [form, setForm] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    pdfFile: null,
  });
  const [formErrors, setFormErrors] = useState({});

  // Auth
  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) {
      setUserData(user);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Load records
  useEffect(() => {
    loadRecords();
  }, []);

  // Filter when selectedYear or registros changes
  useEffect(() => {
    if (selectedYear) {
      setFilteredRegistros(registros.filter((r) => r.year === parseInt(selectedYear)));
    } else {
      setFilteredRegistros(registros);
    }
  }, [selectedYear, registros]);

  const loadRecords = () => {
    const all = EventLogService.getAll();
    setRegistros(all);
    setAvailableYears(EventLogService.getAvailableYears());
  };

  // Helpers
  const getUserName = () => {
    if (!userData) return "Administrador";
    return userData.nombre || userData.nombres || userData.correo?.split("@")[0] || "Administrador";
  };

  const getUserInitials = () => {
    const name = getUserName();
    return name.charAt(0).toUpperCase();
  };

  const handleLogout = async () => {
    if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
      try {
        await AuthService.logout();
        navigate("/login");
      } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
      }
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setFormErrors((prev) => ({ ...prev, pdfFile: "Solo se permiten archivos PDF" }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormErrors((prev) => ({ ...prev, pdfFile: "El archivo no debe superar los 10MB" }));
        return;
      }
      setForm((prev) => ({ ...prev, pdfFile: file }));
      setFormErrors((prev) => ({ ...prev, pdfFile: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "El título es obligatorio";
    if (!form.year || form.year < 2000 || form.year > 2100) errors.year = "Ingrese un año válido";
    if (!form.description.trim()) errors.description = "La descripción es obligatoria";
    if (!form.pdfFile) errors.pdfFile = "Debe adjuntar un archivo PDF";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const pdfBase64 = await EventLogService.fileToBase64(form.pdfFile);

      EventLogService.create({
        year: form.year,
        title: form.title,
        description: form.description,
        pdfBase64,
        pdfName: form.pdfFile.name,
      });

      // Reset
      setForm({ year: new Date().getFullYear(), title: "", description: "", pdfFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      loadRecords();
    } catch (error) {
      console.error("❌ Error al guardar registro:", error);
      alert("Error al guardar el registro. El archivo puede ser demasiado grande.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Está seguro de que desea eliminar este registro?")) {
      EventLogService.delete(id);
      if (pdfViewer?.id === id) setPdfViewer(null);
      loadRecords();
    }
  };

  const handleViewPdf = (registro) => {
    setPdfViewer({
      id: registro.id,
      pdfBase64: registro.pdfBase64,
      pdfName: registro.pdfName,
      title: registro.title,
      year: registro.year,
    });
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 2000; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo Unicesar" className="w-10 h-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">Expo-software</h1>
                <p className="text-xs text-gray-500">Universidad Popular del Cesar</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 hidden sm:block">{getUserName()}</span>
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">{getUserInitials()}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
              >
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Título */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Registro de Eventos por Año</h2>
                <p className="text-sm text-gray-500">Gestione los registros históricos con documentos PDF</p>
              </div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <i className={`pi ${showForm ? "pi-times" : "pi-plus"}`}></i>
                <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nuevo Registro"}</span>
              </button>
            </div>

            {/* Formulario */}
            {showForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <i className="pi pi-plus-circle text-teal-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Nuevo Registro de Evento</h3>
                    <p className="text-sm text-gray-500">Complete los datos y suba el documento PDF</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Año */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Año del Evento <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="year"
                        value={form.year}
                        onChange={handleInputChange}
                        className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                          formErrors.year ? "border-red-400" : "border-gray-300"
                        }`}
                      >
                        {yearOptions.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      {formErrors.year && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.year}</p>
                      )}
                    </div>

                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título del Evento <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleInputChange}
                        placeholder="Ej: Expo-software 2025"
                        className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
                          formErrors.title ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      {formErrors.title && (
                        <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describa el evento y los datos registrados..."
                      className={`w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none ${
                        formErrors.description ? "border-red-400" : "border-gray-300"
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Archivo PDF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Documento PDF <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors ${
                        formErrors.pdfFile ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"
                      }`}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {form.pdfFile ? (
                        <div className="flex items-center justify-center gap-3">
                          <i className="pi pi-file-pdf text-red-500 text-3xl"></i>
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">{form.pdfFile.name}</p>
                            <p className="text-xs text-gray-500">
                              {(form.pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setForm((prev) => ({ ...prev, pdfFile: null }));
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <i className="pi pi-times"></i>
                          </button>
                        </div>
                      ) : (
                        <>
                          <i className="pi pi-cloud-upload text-gray-400 text-3xl mb-2"></i>
                          <p className="text-sm text-gray-600">
                            Haga clic para seleccionar un archivo PDF
                          </p>
                          <p className="text-xs text-gray-400 mt-1">Máximo 10MB</p>
                        </>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    {formErrors.pdfFile && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.pdfFile}</p>
                    )}
                  </div>

                  {/* Botón Guardar */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setForm({ year: new Date().getFullYear(), title: "", description: "", pdfFile: null });
                        setFormErrors({});
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="pi pi-save"></i>
                          Guardar Registro
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Filtro por Año */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="pi pi-filter text-blue-600 text-lg"></i>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Filtrar por Año</h3>
                    <p className="text-xs text-gray-500">
                      {filteredRegistros.length} registro{filteredRegistros.length !== 1 ? "s" : ""} encontrado{filteredRegistros.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-w-[180px]"
                >
                  <option value="">Todos los años</option>
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lista de Registros */}
            <div className="space-y-4">
              {filteredRegistros.length > 0 ? (
                filteredRegistros.map((registro) => (
                  <div
                    key={registro.id}
                    className={`bg-white rounded-lg border p-6 transition-all duration-200 ${
                      pdfViewer?.id === registro.id
                        ? "border-teal-400 shadow-md ring-2 ring-teal-100"
                        : "border-gray-200 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{registro.year}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-gray-900 truncate">{registro.title}</h4>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{registro.description}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <i className="pi pi-calendar text-xs"></i>
                              {new Date(registro.createdAt).toLocaleDateString("es-CO", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                              <i className="pi pi-file-pdf text-xs text-red-500"></i>
                              {registro.pdfName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewPdf(registro)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            pdfViewer?.id === registro.id
                              ? "bg-teal-600 text-white hover:bg-teal-700"
                              : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                          }`}
                        >
                          <i className="pi pi-eye"></i>
                          {pdfViewer?.id === registro.id ? "Viendo" : "Ver PDF"}
                        </button>
                        <button
                          onClick={() => handleDelete(registro.id)}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                          title="Eliminar registro"
                        >
                          <i className="pi pi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="pi pi-folder-open text-gray-400 text-3xl"></i>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">No hay registros</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedYear
                          ? `No se encontraron registros para el año ${selectedYear}`
                          : "Cree un nuevo registro para comenzar"}
                      </p>
                    </div>
                    {!showForm && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
                      >
                        <i className="pi pi-plus"></i>
                        Crear primer registro
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Visor de PDF */}
            {pdfViewer && (
              <div className="bg-white rounded-lg border border-gray-200 mt-6 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <i className="pi pi-file-pdf text-red-600 text-xl"></i>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pdfViewer.title}</h3>
                        <p className="text-sm text-gray-500">
                          {pdfViewer.pdfName} — Año {pdfViewer.year}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPdfViewer(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Cerrar visor"
                    >
                      <i className="pi pi-times text-xl"></i>
                    </button>
                  </div>
                </div>
                <div style={{ height: "700px", position: "relative" }}>
                  <iframe
                    src={pdfViewer.pdfBase64}
                    width="100%"
                    height="100%"
                    style={{ border: "none", display: "block" }}
                    title={`PDF - ${pdfViewer.title}`}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
