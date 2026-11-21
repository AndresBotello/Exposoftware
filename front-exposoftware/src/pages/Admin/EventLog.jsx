import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { AdminHeader, AdminPageHeader } from "../../components/Admin/AdminComponents";
import * as AuthService from "../../Services/AuthService";
import EventLogService from "../../Services/EventLogService";
import EventLogForm from "./EventLogForm";
import EventLogList from "./EventLogList";
import { confirmarCierreSesion } from "../../utils/confirmDialog.jsx";

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
    if (await confirmarCierreSesion()) {
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
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <AdminPageHeader
              icon="pi-history"
              title="Registro de Eventos por Año"
              subtitle="Gestione los registros históricos con documentos PDF"
            >
              <button onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-2 font-medium text-white shadow transition-all hover:from-teal-600 hover:to-cyan-700"
              >
                <i className={`pi ${showForm ? "pi-times" : "pi-plus"}`}></i>
                <span className="hidden sm:inline">{showForm ? "Cancelar" : "Nuevo Registro"}</span>
              </button>
            </AdminPageHeader>

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
