import { AlertTriangle, Bell, CheckCircle2, DoorOpen, FileDown, Megaphone, Users, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchSummary() {
      setLoading(true);
      setError("");
      try {
        const data = await httpClient.get("/dashboard/summary/");
        if (!ignore) setSummary(data);
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchSummary();
    return () => {
      ignore = true;
    };
  }, []);

  const activities = summary?.recent_activities ?? [];
  const workload = useMemo(() => ([
    { label: "Đơn chờ duyệt", value: summary?.registrations?.pending ?? 0, color: "bg-primary" },
    { label: "Sự cố chờ xử lý", value: summary?.incidents?.pending ?? 0, color: "bg-warning" },
    { label: "Sự cố đang xử lý", value: summary?.incidents?.in_progress ?? 0, color: "bg-info" },
    { label: "Vi phạm chờ xử lý", value: summary?.violations?.pending ?? 0, color: "bg-danger" },
    { label: "Hóa đơn chờ thu", value: summary?.invoices?.pending ?? 0, color: "bg-success" },
  ]), [summary]);
  const maxWorkload = Math.max(...workload.map((item) => item.value), 1);
  const occupancyRate = Number(summary?.rooms?.occupancy_rate ?? 0);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Bảng điều khiển" subtitle="Tổng quan vận hành ký túc xá hôm nay." />
      {error && <div className="alert alert-danger mb-0">Không tải được dashboard: {error}</div>}

      <StatGrid
        items={[
          { label: "Sinh viên", value: summary?.students?.total ?? (loading ? "..." : 0), hint: `${summary?.students?.active ?? 0} đang ở`, icon: Users },
          {
            label: "Phòng đang dùng",
            value: `${summary?.rooms?.occupied_rooms ?? 0}/${summary?.rooms?.total ?? 0}`,
            hint: `${occupancyRate}% công suất`,
            icon: DoorOpen,
          },
          { label: "Thông báo", value: summary?.announcements?.published ?? 0, hint: `${summary?.announcements?.urgent ?? 0} khẩn cấp`, icon: Megaphone },
          { label: "Dịch vụ", value: summary?.services?.active ?? 0, hint: "Đang cung cấp", icon: Wrench },
          { label: "Đơn chờ duyệt", value: summary?.registrations?.pending ?? 0, hint: "Cần xử lý", icon: Bell, variant: "warning" },
          { label: "Hóa đơn chờ thu", value: summary?.invoices?.pending ?? 0, hint: "Chưa thanh toán", icon: FileDown, variant: "info" },
        ]}
      />

      <div className="row g-4">
        <div className="col-12 col-xl-5">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h5 fw-bold mb-1">Công suất phòng</h2>
                  <p className="text-secondary mb-0">Số chỗ đã dùng trên tổng sức chứa.</p>
                </div>
                <span className="badge text-bg-primary">{occupancyRate}%</span>
              </div>
              <div className="progress mb-3" style={{ height: 14 }}>
                <div className="progress-bar" style={{ width: `${Math.min(occupancyRate, 100)}%` }} />
              </div>
              <div className="row g-3">
                <Metric label="Đã ở" value={summary?.rooms?.occupied ?? 0} />
                <Metric label="Sức chứa" value={summary?.rooms?.capacity ?? 0} />
                <Metric label="Phòng có người" value={summary?.rooms?.occupied_rooms ?? 0} />
              </div>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-7">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Khối lượng cần xử lý</h2>
              <div className="d-grid gap-3">
                {workload.map((item) => (
                  <div className="row align-items-center g-2" key={item.label}>
                    <div className="col-5 col-md-4 text-secondary">{item.label}</div>
                    <div className="col">
                      <div className="progress" style={{ height: 10 }}>
                        <div className={`progress-bar ${item.color}`} style={{ width: `${(item.value / maxWorkload) * 100}%` }} />
                      </div>
                    </div>
                    <div className="col-auto fw-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h2 className="h5 fw-bold mb-0">Bảng việc cần chú ý</h2>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hạng mục</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {workload.map((item) => (
                    <tr key={item.label}>
                      <td>{item.label}</td>
                      <td className="fw-bold">{item.value}</td>
                      <td>{item.value > 0 ? <Status icon={AlertTriangle} text="Cần xử lý" color="text-warning" /> : <Status icon={CheckCircle2} text="Ổn định" color="text-success" />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="col-12 col-xl-6">
          <section className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white py-3">
              <h2 className="h5 fw-bold mb-0">Hoạt động gần đây</h2>
            </div>
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nội dung</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="2" className="text-center text-secondary py-4">Đang tải hoạt động...</td></tr>
                  ) : activities.length ? (
                    activities.map((activity, index) => (
                      <tr key={`${activity.type}-${activity.created_at}-${index}`}>
                        <td>{activity.text}</td>
                        <td className="text-secondary text-nowrap">{formatDateTime(activity.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="2" className="text-center text-secondary py-4">Chưa có hoạt động gần đây.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="col-4">
      <div className="border rounded p-3 h-100">
        <span className="small text-secondary d-block">{label}</span>
        <strong className="fs-5">{value}</strong>
      </div>
    </div>
  );
}

function Status({ icon: Icon, text, color }) {
  return (
    <span className={`d-inline-flex align-items-center gap-1 ${color}`}>
      <Icon size={16} />
      {text}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default DashboardPage;
