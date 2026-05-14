import { CheckCircle2, Wrench, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";
import Pagination from "../../components/Pagination.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { paginate } from "../../utils/pagination.js";

function StudentServices() {
  const [services, setServices] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicePage, setServicePage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [serviceData, subscriptionData] = await Promise.all([
        httpClient.get("/services/"),
        httpClient.get("/subscriptions/"),
      ]);
      setServices(Array.isArray(serviceData) ? serviceData : serviceData.results ?? []);
      setSubscriptions(Array.isArray(subscriptionData) ? subscriptionData : subscriptionData.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const subscriptionsByService = useMemo(() => {
    return subscriptions.reduce((map, subscription) => {
      if (!map[subscription.service]) map[subscription.service] = [];
      map[subscription.service].push(subscription);
      return map;
    }, {});
  }, [subscriptions]);

  const visibleServices = useMemo(() => {
    return services.filter((service) => {
      if (service.is_required) return false;

      const current = (subscriptionsByService[service.id] ?? []).find((item) => ["pending", "active"].includes(item.status));
      const canRegisterAgain = isPerUseService(service);
      return !current || canRegisterAgain;
    });
  }, [services, subscriptionsByService]);

  const registerService = async (service) => {
    try {
      await httpClient.post("/subscriptions/", { service: service.id });
      loadData();
    } catch (requestError) {
      alert(requestError.message || "Khong the dang ky dich vu");
    }
  };

  const cancelSubscription = async (subscription) => {
    if (!confirm("Ban co chac muon huy dang ky dich vu nay?")) return;
    try {
      await httpClient.post(`/subscriptions/${subscription.id}/cancel/`, {});
      loadData();
    } catch (requestError) {
      alert(requestError.message || "Khong the huy dich vu");
    }
  };

  const pageServices = paginate(visibleServices, servicePage);
  const pageSubscriptions = paginate(subscriptions, subscriptionPage);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Dang ky dich vu" subtitle="Dang ky va theo doi cac dich vu tu chon trong ky tuc xa." icon={Wrench} />
      {error && <div className="alert alert-danger mb-0">Khong tai duoc dich vu: {error}</div>}

      <section className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h2 className="h5 mb-0 fw-bold">Danh sach dich vu</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Dich vu</th>
                <th>Don gia</th>
                <th>Trang thai cua ban</th>
                <th className="text-end">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4">Dang tai...</td></tr>
              ) : visibleServices.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-secondary">Chua co dich vu.</td></tr>
              ) : pageServices.map((service) => {
                const current = (subscriptionsByService[service.id] ?? []).find((item) => ["pending", "active"].includes(item.status));
                const canRegisterAgain = isPerUseService(service);
                return (
                  <tr key={service.id}>
                    <td className="fw-semibold">{service.name}</td>
                    <td>{Number(service.price || 0).toLocaleString()} VND / {service.unit}</td>
                    <td>{current ? <StatusBadge value={current.status} /> : <span className="text-secondary">Chua dang ky</span>}</td>
                    <td className="text-end">
                      {current && !canRegisterAgain ? (
                        ["pending", "active"].includes(current.status) && (
                          <button className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1" onClick={() => cancelSubscription(current)} type="button">
                            <XCircle size={14} />
                            Huy
                          </button>
                        )
                      ) : (
                        <button className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1" disabled={!service.is_active} onClick={() => registerService(service)} type="button">
                          <CheckCircle2 size={14} />
                          {current ? "Dang ky tiep" : "Dang ky"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pagination total={visibleServices.length} page={servicePage} onPageChange={setServicePage} />
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h2 className="h5 mb-0 fw-bold">Lich su dang ky</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Dich vu</th>
                <th>Ngay dang ky</th>
                <th>Ket thuc</th>
                <th>Trang thai</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-secondary">Ban chua co lich su dang ky.</td></tr>
              ) : pageSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="fw-semibold">{subscription.service_name}</td>
                  <td>{subscription.start_date || new Date(subscription.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>{subscription.end_date || "-"}</td>
                  <td><StatusBadge value={subscription.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={subscriptions.length} page={subscriptionPage} onPageChange={setSubscriptionPage} />
      </section>
    </main>
  );
}

function isPerUseService(service) {
  const unit = String(service.unit ?? "").toLowerCase();
  return service.billing_cycle === "one_time" || service.billing_cycle === "usage" || unit.includes("lan") || unit.includes("lần");
}

export default StudentServices;
