export const buildingSeed = [
  { id: 1, name: "Tòa A1", code: "A1", address: "Khu Đông", manager: "Nguyễn Văn An", floors: 5, rooms: 80, status: "Hoạt động" },
  { id: 2, name: "Tòa B1", code: "B1", address: "Khu Tây", manager: "Trần Thị Mai", floors: 4, rooms: 64, status: "Hoạt động" },
  { id: 3, name: "Tòa C2", code: "C2", address: "Khu Nam", manager: "Lê Hoàng", floors: 3, rooms: 42, status: "Bảo trì" },
];

export const roomSeed = [
  { id: 1, code: "P.101", building: "Tòa A1", floor: "Tầng 1", type: "4 người", capacity: 4, occupied: 3, price: "1.200.000", status: "Còn chỗ" },
  { id: 2, code: "P.102", building: "Tòa A1", floor: "Tầng 1", type: "4 người", capacity: 4, occupied: 4, price: "1.200.000", status: "Đã đầy" },
  { id: 3, code: "P.201", building: "Tòa A1", floor: "Tầng 2", type: "6 người", capacity: 6, occupied: 2, price: "900.000", status: "Còn chỗ" },
  { id: 4, code: "P.305", building: "Tòa B1", floor: "Tầng 3", type: "4 người", capacity: 4, occupied: 1, price: "1.100.000", status: "Còn chỗ" },
  { id: 5, code: "P.508", building: "Tòa C2", floor: "Tầng 5", type: "8 người", capacity: 8, occupied: 0, price: "700.000", status: "Bảo trì" },
];

export const studentSeed = [
  { id: 1, code: "SV001245", name: "Lê Văn Thành", email: "thanh.lv@student.edu.vn", phone: "0901002001", room: "P.402", building: "Tòa A1", registeredAt: "12/08/2023", status: "Hoạt động" },
  { id: 2, code: "SV001289", name: "Nguyễn Thị Mai", email: "mai.nt@student.edu.vn", phone: "0901002002", room: "P.105", building: "Tòa B1", registeredAt: "15/08/2023", status: "Hoạt động" },
  { id: 3, code: "SV001302", name: "Trần Minh Quân", email: "quan.tm@student.edu.vn", phone: "0901002003", room: "P.508", building: "Tòa A2", registeredAt: "20/08/2023", status: "Đã rời đi" },
  { id: 4, code: "SV001456", name: "Phạm Hoàng Anh", email: "anh.ph@student.edu.vn", phone: "0901002004", room: "P.201", building: "Tòa A1", registeredAt: "25/08/2023", status: "Chờ duyệt" },
];

export const announcementSeed = [
  { id: 1, title: "Thông báo cắt điện bảo trì đột xuất", audience: "Toàn bộ tòa A1", createdAt: "24/10/2023", status: "Đã đăng", urgent: true },
  { id: 2, title: "Lịch đăng ký lưu trú học kỳ II", audience: "Tất cả sinh viên", createdAt: "22/10/2023", status: "Đã đăng", urgent: false },
  { id: 3, title: "Kế hoạch vệ sinh môi trường tháng 11", audience: "Toàn bộ ký túc", createdAt: "21/10/2023", status: "Bản nháp", urgent: false },
  { id: 4, title: "Nhắc nhở nộp tiền điện nước tháng 10", audience: "Tòa B1, C2", createdAt: "20/10/2023", status: "Đã đăng", urgent: false },
];

export const serviceSeed = [
  { id: 1, name: "Điện", code: "DIEN", unit: "kWh", price: "3.500", cycle: "Theo sử dụng", required: true, status: "Đang cung cấp" },
  { id: 2, name: "Nước", code: "NUOC", unit: "m3", price: "15.000", cycle: "Theo sử dụng", required: true, status: "Đang cung cấp" },
  { id: 3, name: "Internet", code: "NET", unit: "Tháng", price: "150.000", cycle: "Theo tháng", required: false, status: "Đang cung cấp" },
  { id: 4, name: "Giữ xe", code: "PARK", unit: "Tháng", price: "100.000", cycle: "Theo tháng", required: false, status: "Đang cung cấp" },
];
