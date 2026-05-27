export default function GuestAndGraduateList({
  userType,
  setUserType,
  usuariosFiltrados,
  searchTerm,
  setSearchTerm,
  loading,
  serverError,
  handleDelete,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Ver Egresados e Invitados
      </h1>

      {/* SELECTOR DE TIPO DE USUARIO */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tipo de Usuario
        </label>
        <div className="flex gap-4">
          <button
            onClick={() => setUserType("invitado")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              userType === "invitado"
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            👥 Invitados
          </button>
          <button
            onClick={() => setUserType("egresado")}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              userType === "egresado"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🎓 Egresados
          </button>
        </div>
      </div>

      {/* MENSAJES DE ERROR */}
      {serverError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          ❌ {serverError}
        </div>
      )}

      {/* BÚSQUEDA */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre, email o documento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-teal-50 border-b-2 border-teal-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">
                {userType === 'invitado' ? 'Empresa' : 'Programa'}
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  ⏳ Cargando...
                </td>
              </tr>
            ) : usuariosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-6 text-center text-gray-500">
                  📭 Sin registros
                </td>
              </tr>
            ) : (
              usuariosFiltrados.map((usuario, idx) => (
                <tr key={usuario.id || idx} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {usuario.usuario?.p_nombre} {usuario.usuario?.p_apellido}
                  </td>
                  <td className="px-4 py-3">{usuario.usuario?.correo}</td>
                  <td className="px-4 py-3">{usuario.usuario?.telefono}</td>
                  <td className="px-4 py-3">
                    {userType === 'invitado'
                      ? usuario.invitado?.nombre_empresa
                      : usuario.egresado?.codigo_programa}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(userType === 'invitado' ? usuario.invitado?.id_invitado : usuario.egresado?.id_egresado)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                    >
                      Desactivar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
