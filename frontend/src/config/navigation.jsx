import { Building2, ClipboardCheck, DoorOpen, LayoutDashboard, Megaphone, Users, Wrench, ShieldAlert, Hammer, CreditCard, Zap, Receipt } from "lucide-react";

export const navigationItems = [
  { key: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard, path: "/admin/dashboard" },
  { key: "registrationApprovals", label: "Duyệt đăng ký", icon: ClipboardCheck, path: "/admin/registration-approvals" },
  { key: "buildings", label: "Quản lý Tòa & Tầng", icon: Building2, path: "/admin/buildings" },
  { key: "rooms", label: "Quản lý Phòng", icon: DoorOpen, path: "/admin/rooms" },
  { key: "students", label: "Quản lý Sinh viên", icon: Users, path: "/admin/students" },
  { key: "announcements", label: "Thông báo", icon: Megaphone, path: "/admin/announcements" },
  { key: "violations", label: "Xử lý Vi phạm", icon: ShieldAlert, path: "/admin/violations" },
  { key: "incidents", label: "Quản lý Sự cố", icon: Hammer, path: "/admin/incidents" },
  { key: "cards", label: "Quản lý Thẻ", icon: CreditCard, path: "/admin/cards" },
  { key: "invoice-generation", label: "Tính tiền & Tạo HĐ", icon: Zap, path: "/admin/invoice-generation" },
  { key: "invoices", label: "Danh sách Hóa đơn", icon: Receipt, path: "/admin/invoices" },
  { key: "services", label: "Quản lý Dịch vụ", icon: Wrench, path: "/admin/services" },
];
