import { Building2, DoorOpen, LayoutDashboard, Megaphone, Users, Wrench } from "lucide-react";

export const navigationItems = [
  { key: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { key: "buildings", label: "Quản lý Tòa & Tầng", icon: Building2 },
  { key: "rooms", label: "Quản lý Phòng", icon: DoorOpen },
  { key: "students", label: "Quản lý Sinh viên", icon: Users },
  { key: "announcements", label: "Thông báo", icon: Megaphone },
  { key: "services", label: "Quản lý Dịch vụ", icon: Wrench },
];
