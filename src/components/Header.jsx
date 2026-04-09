import { NavLink } from "react-router-dom";

function Header({ onMenuToggle }) {
  const navClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="h-16 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuToggle}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            aria-label="Toggle sidebar menu"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          <div className="text-lg font-bold text-blue-700">Logo</div>
        </div>

        <nav className="hidden md:flex items-center gap-2">
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
  );
}

export default Header;
