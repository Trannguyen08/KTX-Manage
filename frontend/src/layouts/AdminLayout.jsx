import { Building2, LogOut, UserRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { navigationItems } from "../config/navigation.jsx";

function AdminLayout({ onLogout, user, children }) {
  return (
    <div className="admin-layout">
      <aside className="sidebar d-flex flex-column">
        <div className="d-flex align-items-center gap-2 px-2 pb-4 text-white fw-bold">
          <span className="brand-icon">
            <Building2 size={20} />
          </span>
          <span>
            DormAdmin
            <small className="d-block text-white-50 fw-semibold">Quản lý ký túc xá</small>
          </span>
        </div>

        <nav className="d-grid gap-1">
          {navigationItems.map((item) => {
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
                {item.label}
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

      <div className="min-w-0">
        <header className="topbar bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3">
          <div className="ms-auto d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <strong className="small">{user?.full_name || user?.username}</strong>
              <small className="d-block text-secondary text-uppercase">{user?.role}</small>
            </div>
            <UserRound size={30} className="text-primary" />
          </div>
        </header>
        <div className="p-3 p-lg-4">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
