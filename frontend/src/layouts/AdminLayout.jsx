import { Bell, Building2, LogOut, Search, Settings, UserRound } from "lucide-react";

import { navigationItems } from "../config/navigation.jsx";

function AdminLayout({ activePage, onNavigate, onLogout, user, children }) {
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
            const active = activePage === item.key;
            return (
              <button
                className={`btn sidebar-link justify-content-start d-inline-flex align-items-center gap-2 ${active ? "active" : ""}`}
                key={item.key}
                onClick={() => onNavigate(item.key)}
                type="button"
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto d-grid gap-1">
          <button className="btn sidebar-link justify-content-start d-inline-flex align-items-center gap-2" type="button">
            <Settings size={18} />
            Cài đặt
          </button>
          <button className="btn sidebar-link justify-content-start d-inline-flex align-items-center gap-2" onClick={onLogout} type="button">
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="topbar bg-white border-bottom px-4 py-3 d-flex align-items-center gap-3">
          <div className="input-group topbar-search">
            <span className="input-group-text bg-white">
              <Search size={16} />
            </span>
            <input className="form-control" placeholder="Tìm kiếm nhanh..." />
          </div>
          <button className="btn btn-light btn-sm ms-auto" type="button" aria-label="Thông báo">
            <Bell size={18} />
          </button>
          <button className="btn btn-light btn-sm" type="button" aria-label="Cài đặt">
            <Settings size={18} />
          </button>
          <div className="d-flex align-items-center gap-2">
            <div className="text-end d-none d-sm-block">
              <strong className="small">{user?.full_name || user?.username || "Admin Nguyễn"}</strong>
              <small className="d-block text-secondary">{user?.role || "SUPER ADMIN"}</small>
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
