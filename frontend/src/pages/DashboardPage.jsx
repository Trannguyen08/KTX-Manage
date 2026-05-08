import { DoorOpen, Megaphone, Users, Wrench } from "lucide-react";

import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";

function DashboardPage() {
  return (
    <main className="d-grid gap-4">
      <PageHeader title="Bảng điều khiển" subtitle="Tổng quan vận hành ký túc xá hôm nay." />
      <StatGrid
        items={[
          { label: "Sinh viên", value: "1,284", hint: "+12% tháng này", icon: Users },
          { label: "Phòng đang dùng", value: "320/380", hint: "85% công suất", icon: DoorOpen },
          { label: "Thông báo mới", value: "12", hint: "2 khẩn cấp", icon: Megaphone },
          { label: "Dịch vụ", value: "08", hint: "Đang cung cấp", icon: Wrench },
        ]}
      />
      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">Hoạt động gần đây</h2>
          <div className="list-group list-group-flush">
            <p className="list-group-item px-0">Sinh viên SV001456 vừa gửi yêu cầu chuyển phòng.</p>
            <p className="list-group-item px-0">Tòa A1 cập nhật lịch bảo trì điện nước.</p>
            <p className="list-group-item px-0 mb-0">Dịch vụ Internet đã ghi nhận chu kỳ thu mới.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;
