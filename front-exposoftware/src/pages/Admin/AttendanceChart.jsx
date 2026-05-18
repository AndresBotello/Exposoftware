import { Chart } from 'primereact/chart';

export default function AttendanceChart({
  registeredPeople,
  chartData,
  chartOptions,
  exportarGraficaComoImagen,
  exportarGraficaComoPDF,
  exportarReporteAsistencias,
  eventoNombre,
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
            <i className="pi pi-chart-bar text-white text-sm"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Análisis de Asistencias</h3>
            <p className="text-sm text-gray-500">Distribución de asistencias por hora del día</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportarGraficaComoImagen('asistencias-chart', `Asistencias_${eventoNombre}`)}
            className="p-2 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-lg transition-colors"
            title="Exportar como imagen"
          >
            <i className="pi pi-image text-lg"></i>
          </button>
          <button
            onClick={() => {
              const asistenciasData = chartData.labels.map((label, index) => ({
                hora: label,
                asistencias: chartData.datasets[0].data[index]
              }));
              exportarGraficaComoPDF('asistencias-chart', 'Asistencias por Hora', asistenciasData);
            }}
            className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
            title="Exportar como PDF"
          >
            <i className="pi pi-file-pdf text-lg"></i>
          </button>
          <button
            onClick={exportarReporteAsistencias}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            <i className="pi pi-file-pdf"></i>
            Reporte Completo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <div id="asistencias-chart" style={{ width: '100%', maxWidth: '400px', height: '300px' }}>
            <Chart type="bar" data={chartData} options={chartOptions} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total de Asistencias</p>
                <h3 className="text-2xl font-bold text-blue-900">{registeredPeople.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="pi pi-users text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Hora Pico</p>
                <h3 className="text-2xl font-bold text-green-900">
                  {chartData.labels.length > 0
                    ? chartData.labels[chartData.datasets[0].data.indexOf(Math.max(...chartData.datasets[0].data))]
                    : '--:--'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="pi pi-clock text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Promedio por Hora</p>
                <h3 className="text-2xl font-bold text-purple-900">
                  {chartData.labels.length > 0
                    ? (registeredPeople.length / chartData.labels.length).toFixed(1)
                    : '0'}
                </h3>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="pi pi-chart-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
