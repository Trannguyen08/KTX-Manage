import { Bell, CheckCircle2, Edit3, EyeOff, FileDown, PlayCircle, RotateCcw, Wrench, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import CrudModal from "../components/CrudModal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { useCrudResource } from "../hooks/useCrudResource.js";
import { paginate } from "../utils/pagination.js";

function ServicesPage() {
  const crud = useCrudResource("services");
  const [subscriptions, setSubscriptions] = useState([]);
  const [error, setError] = useState("");
  const [servicePage, setServicePage] = useState(1);
  const [subscriptionPage, setSubscriptionPage] = useState(1);

  const fetchSubscriptions = async () => {
    try {
      const data = await httpClient.get("/subscriptions/");
      setSubscriptions(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const updateSubscription = async (subscription, action) => {
    try {
      await httpClient.post(`/subscriptions/${subscription.id}/${action}/`, {});
      fetchSubscriptions();
    } catch (requestError) {
      alert(requestError.message || "Khong the cap nhat dang ky dich vu");
    }
  };

  const toggleServiceStatus = async (service) => {
    try {
      await httpClient.patch(`/services/${service.id}/`, { is_active: !service.is_active });
      crud.reload();
    } catch (requestError) {
      alert(requestError.message || "Khong the cap nhat trang thai dich vu");
    }
  };

  const pageServices = paginate(crud.items, servicePage);
  const pageSubscriptions = paginate(subscriptions, subscriptionPage);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quan ly Dich vu & Tien ich" subtitle="Quan ly danh muc dich vu va lich su dang ky cua sinh vien." actionLabel="Them dich vu moi" onAction={crud.add} />
      {(crud.error || error) && <div className="alert alert-danger mb-0">Khong tai duoc du lieu dich vu: {crud.error || error}</div>}

      <StatGrid
        items={[
          { label: "Tong dich vu", value: crud.items.length.toString().padStart(2, "0"), hint: "Tu API", icon: Wrench },
          { label: "Dang su dung", value: subscriptions.filter((item) => item.status === "active").length, hint: "Dich vu active", icon: CheckCircle2 },
          { label: "Cho xac nhan", value: subscriptions.filter((item) => item.status === "pending").length, hint: "Can xu ly", icon: Bell, variant: "warning" },
          { label: "Tong don gia", value: crud.items.reduce((sum, item) => sum + Number(item.price || 0), 0).toLocaleString(), hint: "VND", icon: FileDown },
        ]}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h2 className="h5 mb-0 fw-bold">Danh muc dich vu</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Ten dich vu</th>
                <th>Don gia</th>
                <th>Don vi</th>
                <th>Trang thai</th>
                <th className="text-end">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {crud.items.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-secondary py-4">Chua co dich vu.</td></tr>
              ) : pageServices.map((service) => (
                <tr key={service.id}>
                  <td className="fw-semibold">{service.name}</td>
                  <td>{Number(service.price || 0).toLocaleString()} VND</td>
                  <td>{service.unit}</td>
                  <td><StatusBadge value={service.is_active ? "active" : "hidden"} /></td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <button className="btn btn-outline-secondary btn-sm" onClick={() => crud.edit(service)} type="button" title="Chinh sua" aria-label="Chinh sua">
                        <Edit3 size={16} />
                      </button>
                      <button className={`btn btn-sm ${service.is_active ? "btn-outline-warning" : "btn-outline-success"}`} onClick={() => toggleServiceStatus(service)} type="button" title={service.is_active ? "An" : "Hoat dong"} aria-label={service.is_active ? "An" : "Hoat dong"}>
                        {service.is_active ? <EyeOff size={16} /> : <RotateCcw size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={crud.items.length} page={servicePage} onPageChange={setServicePage} />
      </section>

      <section className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h2 className="h5 mb-0 fw-bold">Lich su dang ky dich vu</h2>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>MSSV</th>
                <th>Sinh vien</th>
                <th>Dich vu</th>
                <th>Don gia</th>
                <th>Ngay dang ky</th>
                <th>Ket thuc</th>
                <th>Trang thai</th>
                <th className="text-end">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-secondary py-4">Chua co dang ky dich vu.</td></tr>
              ) : pageSubscriptions.map((subscription) => (
                <tr key={subscription.id}>
                  <td className="fw-semibold">{subscription.student_code}</td>
                  <td>{subscription.student_name}</td>
                  <td>{subscription.service_name}</td>
                  <td>{Number(subscription.service_price || 0).toLocaleString()} VND / {subscription.service_unit}</td>
                  <td>{subscription.start_date || new Date(subscription.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>{subscription.end_date || "-"}</td>
                  <td><StatusBadge value={subscription.status} /></td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      {subscription.status !== "active" && subscription.status !== "completed" && subscription.status !== "cancelled" && (
                        <button className="btn btn-outline-primary btn-sm" onClick={() => updateSubscription(subscription, "activate")} type="button" title="Dang su dung" aria-label="Dang su dung">
                          <PlayCircle size={16} />
                        </button>
                      )}
                      {subscription.status !== "completed" && subscription.status !== "cancelled" && (
                        <button className="btn btn-outline-success btn-sm" onClick={() => updateSubscription(subscription, "complete")} type="button" title="Da su dung" aria-label="Da su dung">
                          <CheckCircle2 size={16} />
                        </button>
                      )}
                      {["pending", "active"].includes(subscription.status) && (
                        <button className="btn btn-outline-danger btn-sm" onClick={() => updateSubscription(subscription, "cancel")} type="button" title="Huy" aria-label="Huy">
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={subscriptions.length} page={subscriptionPage} onPageChange={setSubscriptionPage} />
      </section>

      <CrudModal title={crud.editingItem?.id ? "Sua dich vu" : "Them dich vu"} fields={formFields.services} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default ServicesPage;
