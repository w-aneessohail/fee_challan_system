import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function BaseLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-16 bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSidebar}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              aria-label="Open sidebar menu"
            >
              <span className="text-lg leading-none">☰</span>
            </button>
            <span className="text-base font-semibold text-blue-700">Brand</span>
          </div>
          <div className="text-sm text-gray-500">User / Icons</div>
        </div>

        <div className="flex flex-1 min-h-0">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <footer className="bg-gray-800 text-gray-100">
        <div className="px-4 md:px-6 py-3 text-sm">Placeholder footer text</div>
      </footer>
    </div>
  );
}

export default BaseLayout;
