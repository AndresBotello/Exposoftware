import { useRef, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Chip } from 'primereact/chip';
import { ProgressSpinner } from 'primereact/progressspinner';

export default function CertificadosList({
  lotes,
  loading,
  onDescargar,
  onEnviar,
  topScrollbarRef,
  tableRef,
}) {
  const fechaTemplate = (rowData) => {
    if (!rowData.fecha_generacion) return '-';
    try {
      const fecha = new Date(rowData.fecha_generacion);
      return fecha.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return rowData.fecha_generacion;
    }
  };

  const cantidadTemplate = (rowData) => {
    return (
      <Chip
        label={rowData.cantidad_certificados || 0}
        className="bg-teal-100 text-teal-800"
      />
    );
  };

  const estadoTemplate = (rowData) => {
    const estado = rowData.estado || 'disponible';
    const estadoConfig = {
      'disponible': { severity: 'success', icon: 'pi-check-circle', label: 'Disponible' },
      'enviado': { severity: 'info', icon: 'pi-send', label: 'Enviado' },
      'expirado': { severity: 'warning', icon: 'pi-clock', label: 'Expirado' },
      'error': { severity: 'danger', icon: 'pi-times-circle', label: 'Error' }
    };

    const config = estadoConfig[estado] || estadoConfig['disponible'];
    const colorClass = {
      'success': 'bg-green-100 text-green-800',
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-amber-100 text-amber-800',
      'danger': 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClass[config.severity]}`}>
        <i className={`pi ${config.icon} text-xs`}></i>
        {config.label}
      </span>
    );
  };

  const accionesTemplate = (rowData) => {
    const yaEnviado = rowData.estado === 'enviado';

    return (
      <div className="flex gap-2 flex-wrap">
        <Button
          icon="pi pi-download"
          className="p-button-rounded p-button-sm p-button-success"
          tooltip="Descargar certificados"
          tooltipOptions={{ position: 'top' }}
          onClick={() => onDescargar(rowData)}
        />
        <Button
          icon="pi pi-envelope"
          className={`p-button-rounded p-button-sm ${yaEnviado ? 'p-button-secondary' : 'p-button-info'}`}
          tooltip={yaEnviado ? 'Reenviar por correo' : 'Enviar por correo'}
          tooltipOptions={{ position: 'top' }}
          onClick={() => onEnviar(rowData)}
        />
      </div>
    );
  };

  const proyectoTemplate = (rowData) => {
    const nombreProyecto =
      rowData.titulo_proyecto ||
      rowData.proyecto?.nombre_proyecto ||
      rowData.nombre_proyecto ||
      'Sin nombre';
    return (
      <div className="text-sm font-medium text-gray-900">
        {nombreProyecto}
      </div>
    );
  };

  const eventoTemplate = (rowData) => {
    const nombreEvento = rowData.evento?.nombre_evento || rowData.nombre_evento || 'Sin nombre';
    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{nombreEvento}</div>
        {rowData.evento?.lugar && (
          <div className="text-xs text-gray-500">{rowData.evento.lugar}</div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide">Total Lotes</p>
              <p className="text-3xl font-bold mt-1">{lotes.length}</p>
            </div>
            <i className="pi pi-folder text-4xl opacity-40"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Total Certificados</p>
              <p className="text-3xl font-bold mt-1">
                {lotes.reduce((sum, lote) => sum + (lote.cantidad_certificados || 0), 0)}
              </p>
            </div>
            <i className="pi pi-file text-4xl opacity-40"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-semibold uppercase tracking-wide">Lotes Enviados</p>
              <p className="text-3xl font-bold mt-1">
                {lotes.filter(l => l.estado === 'enviado').length}
              </p>
            </div>
            <i className="pi pi-send text-4xl opacity-40"></i>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-semibold uppercase tracking-wide">Último Lote</p>
              <p className="text-sm font-semibold mt-2">
                {lotes.length > 0
                  ? new Date(lotes[0].fecha_generacion).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })
                  : '-'
                }
              </p>
            </div>
            <i className="pi pi-calendar text-4xl opacity-40"></i>
          </div>
        </div>
      </div>

      {/* Tabla de lotes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ProgressSpinner />
        </div>
      ) : lotes.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-4">
            <i className="pi pi-file-pdf text-4xl text-gray-500"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">
            No hay lotes de certificados
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Aún no se ha generado ningún lote de certificados. Usa el formulario superior para generar certificados por proyecto.
          </p>
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-sm text-blue-900 font-medium mb-2">
              <i className="pi pi-lightbulb mr-2"></i>
              Pasos para generar certificados:
            </p>
            <ol className="text-sm text-blue-800 text-left space-y-1">
              <li>1. Selecciona un proyecto en la sección superior</li>
              <li>2. Completa los datos del director y coordinador</li>
              <li>3. Haz clic en "Generar Certificados"</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Scrollbar superior funcional */}
          <div
            ref={topScrollbarRef}
            className="top-scrollbar-container"
            style={{
              height: '20px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              marginBottom: '12px',
              overflowX: 'auto',
              overflowY: 'hidden',
              display: 'none',
              cursor: 'pointer'
            }}
            onScroll={(e) => {
              const tableScroll = tableRef.current?.querySelector('.p-datatable-scrollable-view');
              if (tableScroll) {
                tableScroll.scrollLeft = e.target.scrollLeft;
              }
            }}
          >
            <div
              className="top-scrollbar-content"
              style={{
                height: '1px',
                backgroundColor: 'transparent',
                minWidth: '1200px'
              }}
            ></div>
          </div>

          <div ref={tableRef} className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <DataTable
              value={lotes}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 15, 25]}
              paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
              currentPageReportTemplate="{first} a {last} de {totalRecords} lotes"
              className="p-datatable-striped custom-datatable"
              emptyMessage="No hay lotes de certificados disponibles"
              sortMode="multiple"
              stripedRows
              size="small"
              scrollable
              scrollHeight="600px"
              responsiveLayout="scroll"
              rowClassName={(rowData) =>
                rowData.estado === 'enviado' ? 'bg-green-50 hover:bg-green-100' : ''
              }
              onScroll={(e) => {
                const topScrollbar = topScrollbarRef.current;
                if (topScrollbar) {
                  topScrollbar.scrollLeft = e.target.scrollLeft;
                }
              }}
            >
              <Column
                field="titulo_proyecto"
                header="Proyecto"
                body={proyectoTemplate}
                sortable
                style={{ minWidth: '220px' }}
                bodyStyle={{ padding: '0.75rem' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600' }}
              />
              <Column
                field="nombre_evento"
                header="Evento"
                body={eventoTemplate}
                sortable
                style={{ minWidth: '200px' }}
                bodyStyle={{ padding: '0.75rem' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600' }}
              />
              <Column
                field="cantidad_certificados"
                header="Certificados"
                body={cantidadTemplate}
                sortable
                style={{ minWidth: '120px', textAlign: 'center' }}
                bodyStyle={{ padding: '0.75rem', textAlign: 'center' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600', textAlign: 'center' }}
              />
              <Column
                field="estado"
                header="Estado"
                body={estadoTemplate}
                sortable
                style={{ minWidth: '130px' }}
                bodyStyle={{ padding: '0.75rem' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600' }}
              />
              <Column
                field="fecha_generacion"
                header="Fecha de Generación"
                body={fechaTemplate}
                sortable
                style={{ minWidth: '160px' }}
                bodyStyle={{ padding: '0.75rem', fontSize: '0.875rem' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600' }}
              />
              <Column
                header="Acciones"
                body={accionesTemplate}
                style={{ minWidth: '140px', textAlign: 'center' }}
                bodyStyle={{ padding: '0.75rem', textAlign: 'center' }}
                headerStyle={{ backgroundColor: '#f0f9ff', fontWeight: '600', textAlign: 'center' }}
              />
            </DataTable>
          </div>
        </div>
      )}
    </>
  );
}
