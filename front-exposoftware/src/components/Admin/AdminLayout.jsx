import logo from "../../assets/Logo-unicesar.png";

export function AdminHeader({ userName, userInitials, onLogout }) {
  return (
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
              <span className="text-sm text-gray-700 hidden sm:block">{userName}</span>
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <span className="text-teal-600 font-bold text-lg">{userInitials}</span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors flex items-center gap-2"
            >
              <i className="pi pi-sign-out"></i>
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export function AdminPageLayout({ children, userName, userInitials, onLogout, sidebarContent }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader userName={userName} userInitials={userInitials} onLogout={onLogout} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {sidebarContent}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
