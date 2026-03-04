import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginandRegister from "./Auth/LoginandRegister.jsx";
import Register from "./Auth/Register.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import CategoriesManagement from "./pages/admin/CategoriesManagement.jsx";
import VisitsManagement from "./pages/admin/VisitsManagement.jsx";
import AllVisits from "./pages/admin/AllVisits.jsx";
import UserDashboard from "./pages/user/UserDashboard.jsx";
import UserCategories from "./pages/user/UserCategories.jsx";
import UserVisits from "./pages/user/UserVisits.jsx";
import UserAllVisits from "./pages/user/UserAllVisits.jsx";
import Unauthorized from "./pages/Unauthorized.jsx";
import ProtectedRoute from "./utils/ProtectedRoute.jsx";
import './index.css'

function App() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginandRegister />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["EMPLOYEE", "HELPDESKADMIN", "HELPDESKSUPERADMIN"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="categories" element={<CategoriesManagement />} />
            <Route path="visits" element={<VisitsManagement />} />
            <Route path="visits/:categoryId" element={<VisitsManagement />} />
            <Route path="all-visits" element={<AllVisits />} />
            <Route path="user-categories" element={<UserCategories />} />
            <Route path="user-visits/:categoryId" element={<UserVisits />} />
            <Route path="user-all-visits" element={<UserAllVisits />} />
            
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
