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
      <div className="flex gap-2">
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
    const nombreProyecto = rowData.proyecto?.nombre_proyecto || rowData.nombre_proyecto || 'Sin nombre';
    return (
      <div className="text-sm">
        <div className="font-medium text-gray-900">{nombreProyecto}</div>
        <div className="text-xs text-gray-500 truncate" style={{maxWidth: '200px'}}>
          ID: {rowData.id_proyecto}
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-teal-100 text-xs">Total Lotes</p>
              <p className="text-2xl font-bold">{lotes.length}</p>
            </div>
            <i className="pi pi-folder text-3xl opacity-50"></i>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Certificados</p>
              <p className="text-2xl font-bold">
                {lotes.reduce((sum, lote) => sum + (lote.cantidad_certificados || 0), 0)}
              </p>
            </div>
            <i className="pi pi-file text-3xl opacity-50"></i>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Último Lote</p>
              <p className="text-sm font-semibold">
                {lotes.length > 0
                  ? new Date(lotes[0].fecha_generacion).toLocaleDateString('es-CO')
                  : '-'
                }
              </p>
            </div>
            <i className="pi pi-calendar text-3xl opacity-50"></i>
          </div>
        </div>
      </div>

      {/* Tabla de lotes */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <ProgressSpinner />
        </div>
      ) : lotes.length === 0 ? (
        <div className="text-center py-12">
          <i className="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No hay lotes de certificados
          </h3>
          <p className="text-gray-500 mb-4">
            Los certificados se generan automáticamente cuando se registran proyectos
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <i className="pi pi-info-circle mr-2"></i>
              Para generar certificados, primero debes tener proyectos registrados en el sistema
            </p>
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

          <div ref={tableRef}>
            <DataTable
              value={lotes}
              paginator
              rows={15}
              rowsPerPageOptions={[10, 15, 25, 50]}
              className="p-datatable-sm custom-datatable"
              emptyMessage="No hay lotes de certificados disponibles"
              sortMode="multiple"
              stripedRows
              size="small"
              scrollable
              scrollHeight="500px"
              onScroll={(e) => {
                const topScrollbar = topScrollbarRef.current;
                if (topScrollbar) {
                  topScrollbar.scrollLeft = e.target.scrollLeft;
                }
              }}
            >
              <Column
                field="id_lote"
                header="ID Lote"
                sortable
                style={{ minWidth: '180px', fontSize: '0.875rem' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                field="proyecto.nombre_proyecto"
                header="Proyecto"
                body={proyectoTemplate}
                sortable
                style={{ minWidth: '200px' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                field="evento.nombre_evento"
                header="Evento"
                body={eventoTemplate}
                sortable
                style={{ minWidth: '180px' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                field="cantidad_certificados"
                header="Cant."
                body={cantidadTemplate}
                sortable
                style={{ minWidth: '80px' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                field="estado"
                header="Estado"
                body={estadoTemplate}
                sortable
                style={{ minWidth: '120px' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                field="fecha_generacion"
                header="Fecha"
                body={fechaTemplate}
                sortable
                style={{ minWidth: '140px', fontSize: '0.875rem' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
              <Column
                header="Acciones"
                body={accionesTemplate}
                style={{ minWidth: '120px' }}
                bodyStyle={{ padding: '0.5rem' }}
              />
            </DataTable>
          </div>
        </div>
      )}
    </>
  );
}
