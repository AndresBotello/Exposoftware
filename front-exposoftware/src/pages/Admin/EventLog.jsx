import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Logo-unicesar.png";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import * as AuthService from "../../Services/AuthService";
import EventLogService from "../../Services/EventLogService";
import EventLogForm from "./EventLogForm";
import EventLogList from "./EventLogList";

export default function EventLog() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [pdfViewer, setPdfViewer] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({ year: new Date().getFullYear(), title: "", description: "", pdfFile: null });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const user = AuthService.getUserData();
    if (user) { setUserData(user); } else { navigate("/login"); }
  }, [navigate]);

  useEffect(() => { loadRecords(); }, []);

  useEffect(() => {
    if (selectedYear) { setFilteredRegistros(registros.filter((r) => r.year === parseInt(selectedYear))); }
    else { setFilteredRegistros(registros); }
  }, [selectedYear, registros]);

  const loadRecords = () => {
    setRegistros(EventLogService.getAll());
    setAvailableYears(EventLogService.getAvailableYears());
  };

  const getUserName = () => {
    if (!userData) return "Administrador";
    return userData.nombre || userData.nombres || userData.correo?.split("@")[0] || "Administrador";
  };
  const getUserInitials = () => getUserName().charAt(0).toUpperCase();

  const handleLogout = async () => {
    if (window.confirm("¿Está seguro de que desea cerrar sesión?")) {
      try { await AuthService.logout(); navigate("/login"); } catch (error) { console.error("❌ Error al cerrar sesión:", error); }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") { setFormErrors((prev) => ({ ...prev, pdfFile: "Solo se permiten archivos PDF" })); return; }
    if (file.size > 10 * 1024 * 1024) { setFormErrors((prev) => ({ ...prev, pdfFile: "El archivo no debe superar los 10MB" })); return; }
    setForm((prev) => ({ ...prev, pdfFile: file }));
    setFormErrors((prev) => ({ ...prev, pdfFile: null }));
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
      EventLogService.create({ year: form.year, title: form.title, description: form.description, pdfBase64, pdfName: form.pdfFile.name });
      setForm({ year: new Date().getFullYear(), title: "", description: "", pdfFile: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setShowForm(false);
      loadRecords();
    } catch (error) {
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
    setPdfViewer({ id: registro.id, pdfBase64: registro.pdfBase64, pdfName: registro.pdfName, title: registro.title, year: registro.year });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= 2000; y--) yearOptions.push(y);

  return (
    <div className="min-h-screen bg-gray-50">
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
              <button onClick={handleLogout} className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2">
                <i className="pi pi-sign-out"></i>
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Registro de Eventos por Año</h2>
                <p className="text-sm text-gray-500">Gestione los registros históricos con documentos PDF</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <i className={`pi ${showForm ? "pi-times" : "pi-plus"}`}></i>
                <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nuevo Registro"}</span>
              </button>
            </div>

            {showForm && (
              <EventLogForm
                form={form} setForm={setForm}
                formErrors={formErrors} setFormErrors={setFormErrors}
                fileInputRef={fileInputRef}
                yearOptions={yearOptions}
                loading={loading}
                handleInputChange={handleInputChange}
                handleFileChange={handleFileChange}
                handleSubmit={handleSubmit}
                setShowForm={setShowForm}
              />
            )}

            <EventLogList
              filteredRegistros={filteredRegistros}
              selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              availableYears={availableYears}
              pdfViewer={pdfViewer} setPdfViewer={setPdfViewer}
              showForm={showForm} setShowForm={setShowForm}
              handleViewPdf={handleViewPdf}
              handleDelete={handleDelete}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
