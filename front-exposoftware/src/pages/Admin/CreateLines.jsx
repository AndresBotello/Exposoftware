import { useState } from "react";
import AdminSidebar from "../../components/Layout/AdminSidebar";
import { useAdminAuth } from "../../hooks/useAdminAuth";
import { AdminHeader } from "../../components/Admin/AdminComponents";
import { useResearchLinesManagement } from "./useResearchLinesManagement";
import { EditLineaModal, EditSublineaModal, EditAreaModal } from "./EditResearchLinesModals";
import ResearchLinesTabs from "./ResearchLinesTabs";

export default function CreateLines() {
  const { getUserName, getUserInitials, handleLogout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState("lineas");

  const {
    codigoLinea, setCodigoLinea,
    nombreLinea, setNombreLinea,
    lineas, lineasFiltradas,
    searchTermLinea, setSearchTermLinea,
    showEditLineaModal,
    codigoSublinea, setCodigoSublinea,
    nombreSublinea, setNombreSublinea,
    idLineaParaSublinea, setIdLineaParaSublinea,
    sublineas, sublineasFiltradas,
    sublineasPorLinea,
    searchTermSublinea, setSearchTermSublinea,
    showEditSublineaModal,
    codigoArea, setCodigoArea,
    nombreArea, setNombreArea,
    idSublineaParaArea, setIdSublineaParaArea,
    areas, areasFiltradas,
    areasPorSublinea,
    searchTermArea, setSearchTermArea,
    showEditAreaModal,
    getLineaNombre, getSublineaNombre, getSublineasPorLinea,
    handleSubmitLinea, handleEditLinea, handleSaveEditLinea, handleCancelEditLinea, handleDeleteLinea,
    handleSubmitSublinea, handleEditSublinea, handleSaveEditSublinea, handleCancelEditSublinea, handleDeleteSublinea,
    handleSubmitArea, handleEditArea, handleSaveEditArea, handleCancelEditArea, handleDeleteArea,
  } = useResearchLinesManagement();

  const tabs = [
    { key: "lineas", label: "📚 Líneas de Investigación" },
    { key: "sublineas", label: "🔗 Sublíneas" },
    { key: "areas", label: "🏷️ Áreas Temáticas" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={getUserName()} userInitials={getUserInitials()} onLogout={handleLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <AdminSidebar userName={getUserName()} userRole="Administrador" />

          <main className="lg:col-span-3">
            <div className="bg-white rounded-lg border border-gray-200 p-2 mb-6">
              <div className="flex gap-2">
                {tabs.map(({ key, label }) => (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === key ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >{label}</button>
                ))}
              </div>
            </div>

            <ResearchLinesTabs
              activeTab={activeTab}
              codigoLinea={codigoLinea} setCodigoLinea={setCodigoLinea}
              nombreLinea={nombreLinea} setNombreLinea={setNombreLinea}
              lineas={lineas} lineasFiltradas={lineasFiltradas}
              searchTermLinea={searchTermLinea} setSearchTermLinea={setSearchTermLinea}
              handleSubmitLinea={handleSubmitLinea} handleEditLinea={handleEditLinea} handleDeleteLinea={handleDeleteLinea}
              idLineaParaSublinea={idLineaParaSublinea} setIdLineaParaSublinea={setIdLineaParaSublinea}
              nombreSublinea={nombreSublinea} setNombreSublinea={setNombreSublinea}
              sublineasFiltradas={sublineasFiltradas}
              searchTermSublinea={searchTermSublinea} setSearchTermSublinea={setSearchTermSublinea}
              handleSubmitSublinea={handleSubmitSublinea} handleEditSublinea={handleEditSublinea} handleDeleteSublinea={handleDeleteSublinea}
              getLineaNombre={getLineaNombre}
              nombreArea={nombreArea} setNombreArea={setNombreArea}
              idSublineaParaArea={idSublineaParaArea} setIdSublineaParaArea={setIdSublineaParaArea}
              areasFiltradas={areasFiltradas}
              searchTermArea={searchTermArea} setSearchTermArea={setSearchTermArea}
              handleSubmitArea={handleSubmitArea} handleEditArea={handleEditArea} handleDeleteArea={handleDeleteArea}
              getSublineaNombre={getSublineaNombre}
              sublineasPorLinea={sublineasPorLinea}
            />
          </main>
        </div>
      </div>

      <EditLineaModal show={showEditLineaModal} onSave={handleSaveEditLinea} onCancel={handleCancelEditLinea}
        codigoLinea={codigoLinea} setCodigoLinea={setCodigoLinea} nombreLinea={nombreLinea} setNombreLinea={setNombreLinea}
      />
      <EditSublineaModal show={showEditSublineaModal} onSave={handleSaveEditSublinea} onCancel={handleCancelEditSublinea}
        codigoSublinea={codigoSublinea} setCodigoSublinea={setCodigoSublinea}
        nombreSublinea={nombreSublinea} setNombreSublinea={setNombreSublinea}
        idLineaParaSublinea={idLineaParaSublinea} setIdLineaParaSublinea={setIdLineaParaSublinea}
        lineas={lineas}
      />
      <EditAreaModal show={showEditAreaModal} onSave={handleSaveEditArea} onCancel={handleCancelEditArea}
        codigoArea={codigoArea} setCodigoArea={setCodigoArea}
        nombreArea={nombreArea} setNombreArea={setNombreArea}
        idSublineaParaArea={idSublineaParaArea} setIdSublineaParaArea={setIdSublineaParaArea}
        sublineas={sublineas} getLineaNombre={getLineaNombre}
      />
    </div>
  );
}
