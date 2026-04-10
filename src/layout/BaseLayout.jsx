import { Outlet } from "react-router-dom";

function BaseLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="h-14 shrink-0 border-b border-gray-200 bg-white px-4 md:px-6 flex items-center">
        <span className="text-base font-semibold text-blue-700">
          Fee Chalan
        </span>
      </header>
      <main className="flex-1 min-h-0 overflow-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default BaseLayout;
