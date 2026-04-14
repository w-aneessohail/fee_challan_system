import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import BaseLayout from "../layout/BaseLayout";
import Chalan from "../pages/Chalan";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<BaseLayout />}>
          <Route path="/" element={<Chalan />} />
          <Route path="/chalan" element={<Chalan />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
