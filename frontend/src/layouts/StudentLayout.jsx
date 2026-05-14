import { Building2, LogOut, UserRound, LayoutDashboard, Receipt, CreditCard, AlertOctagon, Wrench, Settings, Megaphone } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { httpClient } from "../api/httpClient.js";

const studentNavigation = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard, path: "/student/dashboard" },
  { key: "announcements", label: "Thông báo", icon: Megaphone, path: "/student/announcements" },
  { key: "invoices", label: "Hóa đơn & Tiền phòng", icon: Receipt, path: "/student/invoices" },
  { key: "services", label: "Đăng ký Dịch vụ", icon: Wrench, path: "/student/services" },
  { key: "cards", label: "Quản lý Thẻ", icon: CreditCard, path: "/student/cards" },
  { key: "reports", label: "Báo cáo sự cố & vi phạm", icon: AlertOctagon, path: "/student/reports" },
  { key: "profile", label: "Hồ sơ cá nhân", icon: Settings, path: "/student/profile" },
];

function StudentLayout({ onLogout, user, children }) {
  const [unreadAnnouncements, setUnreadAnnouncements] = useState(0);

  const fetchUnreadAnnouncements = async () => {
    try {
      const data = await httpClient.get("/announcements/unread-count/");
      setUnreadAnnouncements(data.unread_count ?? 0);
    } catch (error) {
      setUnreadAnnouncements(0);
    }
  };

  useEffect(() => {
    fetchUnreadAnnouncements();
    window.addEventListener("announcements:read-change", fetchUnreadAnnouncements);
    return () => window.removeEventListener("announcements:read-change", fetchUnreadAnnouncements);
  }, []);

  return (
    <div className="admin-layout student-theme">
      <aside className="sidebar d-flex flex-column bg-dark border-end">
        <div className="d-flex align-items-center gap-2 px-2 pb-4 text-white fw-bold">
          <span className="brand-icon bg-primary rounded p-1">
            <Building2 size={20} />
          </span>
          <span>
            DormStudent
            <small className="d-block text-white-50 fw-semibold">Giao diện sinh viên</small>
          </span>
        </div>

        <nav className="d-grid gap-1">
          {studentNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  `btn sidebar-link justify-content-start d-inline-flex align-items-center gap-2 ${isActive ? "active" : ""}`
                }
                key={item.key}
                to={item.path}
              >
                <Icon size={18} />
                <span className="flex-grow-1 text-start">{item.label}</span>
                {item.key === "announcements" && unreadAnnouncements > 0 && (
                  <span className="badge rounded-pill bg-danger ms-auto">{unreadAnnouncements}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto d-grid gap-1">
          <button className="btn sidebar-link justify-content-start d-inline-flex align-items-center gap-2" onClick={onLogout} type="button">
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-grow-1 bg-light overflow-auto">
        <header className="topbar bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3 sticky-top">
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <strong className="small">{user?.full_name || "Sinh viên"}</strong>
              <small className="d-block text-secondary">MSSV: {user?.username}</small>
            </div>
            <UserRound size={30} className="text-primary border rounded-circle p-1" />
          </div>
        </header>
        <div className="p-3 p-lg-4">{children}</div>
      </div>
    </div>
  );
}

export default StudentLayout;
