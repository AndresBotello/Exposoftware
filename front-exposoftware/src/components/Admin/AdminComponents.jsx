export { AdminHeader } from "./AdminLayout";

export function GenericTable({
  columns,
  data,
  isLoading,
  emptyMessage = "No se encontraron registros",
  onRowClick,
  rowKey = (row, idx) => idx
}) {
  return (
    <div className="overflow-x-auto">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="animate-spin h-12 w-12 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 font-medium">Cargando...</p>
          <p className="text-gray-400 text-sm mt-1">Por favor espera un momento</p>
        </div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data && data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                  <i className="pi pi-inbox text-4xl mb-3 block"></i>
                  <p className="text-sm">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data?.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  className="hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {col.render ? col.render(row) : row[col.key]}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function GenericModal({
  isOpen,
  title,
  onClose,
  children,
  actions = []
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="p-6">
          {children}
        </div>

        {actions.length > 0 && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            {actions.map((action, idx) => (
              <button
                key={idx}
                type={action.type || "button"}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className || "px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Encabezado de página del administrador: ícono, título, subtítulo y línea de acento
export function AdminPageHeader({ icon = "pi-cog", title, subtitle, children }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
            <i className={`pi ${icon} text-xl text-white`}></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
      <div className="h-1 w-24 rounded-full bg-gradient-to-r from-teal-500 to-cyan-600"></div>
    </div>
  );
}

export function TabNavigation({ tabs, activeTab, onChange }) {
  return (
    <div className="mb-6 overflow-x-auto">
      <div role="tablist" className="flex min-w-max gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm sm:min-w-0">
        {tabs.map((tab) => {
          const activa = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activa}
              onClick={() => onChange(tab.id)}
              className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activa
                  ? "bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "w-64"
}) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
      />
      <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
    </div>
  );
}

export function FormSection({ title, description, children }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <svg className="animate-spin h-12 w-12 text-teal-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="text-gray-600 font-medium">Cargando...</p>
    </div>
  );
}

export function SubmitButton({
  isLoading,
  label,
  loadingLabel,
  disabled = false,
  onClick,
  type = "submit",
  className = "w-full"
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`${className} bg-teal-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingLabel || label}
        </span>
      ) : (
        label
      )}
    </button>
  );
}
