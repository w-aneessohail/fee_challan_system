import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {
  const navClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
    }`;

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="md:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-black/30"
        />
      )}

      <aside
        className={`fixed md:static top-16 md:top-0 left-0 z-40 w-64 md:w-64 h-[calc(100vh-4rem)] md:h-full bg-white md:bg-gray-100 border-r border-gray-200 p-4 transform transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <nav className="space-y-2">
          <NavLink to="/" className={navClass} onClick={onClose}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={navClass} onClick={onClose}>
            Dashboard
          </NavLink>
          <NavLink to="/chalan" className={navClass} onClick={onClose}>
            Chalan
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
