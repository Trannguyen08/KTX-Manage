import { useState } from "react";

import AdminLayout from "./layouts/AdminLayout.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import BuildingsPage from "./pages/BuildingsPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RoomsPage from "./pages/RoomsPage.jsx";
import ServicesPage from "./pages/ServicesPage.jsx";
import StudentsPage from "./pages/StudentsPage.jsx";

const pageMap = {
  dashboard: <DashboardPage />,
  buildings: <BuildingsPage />,
  rooms: <RoomsPage />,
  students: <StudentsPage />,
  announcements: <AnnouncementsPage />,
  services: <ServicesPage />,
};

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState("students");

  if (!user) {
    return <LoginPage onLogin={setUser} />;
  }

  return (
    <AdminLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={() => setUser(null)}
      user={user}
    >
      {pageMap[activePage]}
    </AdminLayout>
  );
}

export default App;
