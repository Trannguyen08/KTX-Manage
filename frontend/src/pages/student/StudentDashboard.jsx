import { Building2, CreditCard, Receipt, Wrench, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";

function StudentDashboard({ user }) {
  const [data, setData] = useState({
    invoices: [],
    cards: [],
    incidents: [],
    violations: [],
    announcements: [],
    profile: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function fetchDashboard() {
      setLoading(true);
      setError("");
      try {
        const [invoices, cards, incidents, violations, announcements, profile] = await Promise.all([
          httpClient.get("/invoices/"),
          httpClient.get("/card-requests/"),
          httpClient.get("/incidents/"),
          httpClient.get("/violations/"),
          httpClient.get("/announcements/"),
          httpClient.get("/students/me/"),
        ]);
        if (!ignore) {
          setData({ invoices, cards, incidents, violations, announcements, profile });
        }
      } catch (requestError) {
        if (!ignore) setError(requestError.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const currentInvoice = data.invoices[0];
  const stats = [
    {
      label: "Tien phong thang nay",
      value: currentInvoice ? currentInvoice.status : "Chua co hoa don",
      icon: Receipt,
      path: "/student/invoices",
      color: "bg-success",
    },
    { label: "Yeu cau cap the", value: `${data.cards.length} yeu cau`, icon: CreditCard, path: "/student/cards", color: "bg-primary" },
    { label: "Bao cao su co", value: `${data.incidents.length} su co`, icon: Wrench, path: "/student/reports", color: "bg-info" },
    { label: "Bao cao vi pham", value: `${data.violations.length} loi`, icon: ShieldAlert, path: "/student/reports", color: "bg-danger" },
  ];

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title={`Chao mung, ${user?.full_name || data.profile?.full_name || "Sinh vien"}!`}
        subtitle="He thong quan ly thong tin noi tru danh cho sinh vien."
      />
      {error && <div className="alert alert-danger mb-0">Khong tai duoc dashboard sinh vien: {error}</div>}

      <div className="row g-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div className="col-12 col-sm-6 col-lg-3" key={idx}>
              <Link to={stat.path} className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-lift">
                  <div className="card-body">
                    <div className={`${stat.color} bg-opacity-10 text-white rounded-3 p-3 mb-3 d-inline-block`} style={{ backgroundColor: "var(--bs-primary)" }}>
                      <Icon size={24} className={stat.color.replace("bg-", "text-")} />
                    </div>
                    <h6 className="text-secondary mb-1">{stat.label}</h6>
                    <h4 className="mb-0">{loading ? "..." : stat.value}</h4>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5>Thong bao moi nhat</h5>
            {data.announcements.length ? (
              <div className="list-group list-group-flush">
                {data.announcements.slice(0, 4).map((announcement) => (
                  <Link className="list-group-item px-0 text-decoration-none" to="/student/announcements" key={announcement.id}>
                    {announcement.title}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-5 text-muted">Khong co thong bao moi nao danh cho ban.</div>
            )}
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm p-4 h-100">
            <h5>Thong tin phong</h5>
            <div className="mt-3">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Toa:</span>
                <span className="fw-bold text-primary">{data.profile?.building_name || "Chua co"}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary">Phong:</span>
                <span className="fw-bold">{data.profile?.room_code || "Chua co"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-secondary">Trang thai:</span>
                <span>{data.profile?.status || "Chua co"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default StudentDashboard;
