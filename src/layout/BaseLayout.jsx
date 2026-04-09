import { NavLink, Outlet } from "react-router-dom";

function BaseLayout() {
  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-lg font-bold text-blue-700">Logo</div>
          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/" className={navClass}>
              Home
            </NavLink>
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
            <NavLink to="/chalan" className={navClass}>
              Chalan
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-gray-800 text-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3 text-sm">
          Placeholder footer text
        </div>
      </footer>
    </div>
  );
}

export default BaseLayout;
