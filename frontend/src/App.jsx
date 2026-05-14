import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import AdminLayout from "./layouts/AdminLayout.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import BuildingsPage from "./pages/BuildingsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import PaymentSuccessPage from "./pages/PaymentSuccessPage.jsx";
import RegistrationApprovalsPage from "./pages/RegistrationApprovalsPage.jsx";
import RegistrationPage from "./pages/RegistrationPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";
import ViolationsPage from "./pages/ViolationsPage.jsx";
import IncidentsPage from "./pages/IncidentsPage.jsx";
import InvoicesPage from "./pages/InvoicesPage.jsx";
import InvoiceManagementPage from "./pages/InvoiceManagementPage.jsx";

import StudentLayout from "./layouts/StudentLayout.jsx";
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentInvoices from "./pages/student/StudentInvoices.jsx";
import StudentCards from "./pages/student/StudentCards.jsx";
import StudentReports from "./pages/student/StudentReports.jsx";
import StudentProfile from "./pages/student/StudentProfile.jsx";
import StudentAnnouncements from "./pages/student/StudentAnnouncements.jsx";
import AdminCardsPage from "./pages/AdminCardsPage.jsx";
import StudentServices from "./pages/student/StudentServices.jsx";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("auth_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleSetUser = (newUser) => {
    if (newUser) {
      localStorage.setItem("auth_user", JSON.stringify(newUser));
    } else {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh");
    }
    setUser(newUser);
  };

  useEffect(() => {
    const handleLogout = () => setUser(null);
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === "admin" ? "/admin" : "/student"} replace />
            ) : (
              <LoginPage onLogin={handleSetUser} />
            )
          }
        />
        <Route path="/register" element={<Navigate to="/register/step1" replace />} />
        <Route path="/register/:stepParam" element={<RegistrationPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />

        {/* Admin Routes (Protected) */}
        <Route
          path="/admin"
          element={
            user?.role === "admin" ? (
              <AdminLayout user={user} onLogout={() => handleSetUser(null)}>
                <Outlet />
              </AdminLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="registration-approvals" element={<RegistrationApprovalsPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="rooms" element={<RoomsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="announcements" element={<AnnouncementsPage />} />
          <Route path="violations" element={<ViolationsPage />} />
          <Route path="incidents" element={<IncidentsPage />} />
          <Route path="cards" element={<AdminCardsPage />} />
          <Route path="invoice-generation" element={<InvoicesPage />} />
          <Route path="invoices" element={<InvoiceManagementPage />} />
          <Route path="services" element={<ServicesPage />} />
        </Route>

        {/* Student Routes (Protected) */}
        <Route
          path="/student"
          element={
            user?.role === "student" ? (
              <StudentLayout user={user} onLogout={() => handleSetUser(null)}>
                <Outlet />
              </StudentLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<StudentDashboard user={user} />} />
          <Route path="dashboard" element={<StudentDashboard user={user} />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="invoices" element={<StudentInvoices />} />
          <Route path="services" element={<StudentServices />} />
          <Route path="cards" element={<StudentCards />} />
          <Route path="reports" element={<StudentReports />} />
          <Route path="incidents" element={<StudentReports />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to={user ? (user.role === "admin" ? "/admin" : "/student") : "/login"} replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
