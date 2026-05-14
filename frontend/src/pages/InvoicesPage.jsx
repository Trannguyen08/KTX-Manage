import { Droplets, FilePlus2, Receipt, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { paginate } from "../utils/pagination.js";
import { blockInvalidNumberKey } from "../utils/validation.js";

function InvoicesPage() {
  const [billingData, setBillingData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    electricity_reading: "",
    water_reading: "",
    due_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchBillingData();
    setPage(1);
  }, [form.month, form.year]);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: form.month, year: form.year });
      const data = await httpClient.get(`/invoices/billing-preparation/?${params.toString()}`);
      setBillingData(data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = (room) => {
    setSelectedRoom(room);
    setForm((current) => ({
      ...current,
      electricity_reading: room.last_electricity,
      water_reading: room.last_water,
    }));
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await httpClient.post("/invoices/generate/", {
        room_id: selectedRoom.room_id,
        ...form,
      });
      alert("Đã tạo bản nháp hóa đơn. Sinh viên chỉ xem được sau khi admin gửi hóa đơn.");
      setShowModal(false);
      fetchBillingData();
    } catch (error) {
      let message = error.message;
      try {
        message = JSON.parse(error.message).error || message;
      } catch (parseError) {}
      alert("Lỗi khi tạo bản nháp hóa đơn: " + message);
    }
  };

  const pageRooms = paginate(billingData, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Quản lý Hóa đơn"
        subtitle="Tạo bản nháp hóa đơn hằng tháng; chỉ khi gửi hóa đơn hệ thống mới chốt chỉ số và hiển thị cho sinh viên."
        icon={Receipt}
      />

      <StatGrid
        items={[
          { label: "Tổng số phòng", value: billingData.length, icon: Receipt },
          { label: "Phòng đã có chỉ số", value: billingData.filter((room) => Number(room.last_month) === Number(form.month)).length, icon: Zap, variant: "info" },
          { label: "Dịch vụ đã sử dụng", value: billingData.reduce((sum, room) => sum + room.active_services.length, 0), icon: Receipt, variant: "success" },
        ]}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3 align-items-center">
            <div className="col">
              <h5 className="mb-0">Danh sách phòng chờ tạo bản nháp hóa đơn</h5>
            </div>
            <div className="col-12 col-md-auto">
              <div className="d-flex gap-2">
                <select className="form-select" value={form.month} onChange={(event) => setForm({ ...form, month: event.target.value })}>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>
                  ))}
                </select>
                <input className="form-control" type="number" min="2000" step="1" value={form.year} onKeyDown={blockInvalidNumberKey} onChange={(event) => setForm({ ...form, year: event.target.value })} style={{ width: "110px" }} />
              </div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Phòng</th>
                <th>Tòa</th>
                <th>Chỉ số Điện cũ</th>
                <th>Chỉ số Nước cũ</th>
                <th>Giá phòng</th>
                <th>Dịch vụ đã sử dụng trong kỳ</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
              ) : (
                pageRooms.map((room) => (
                  <tr key={room.room_id}>
                    <td className="fw-bold">{room.room_code}</td>
                    <td>{room.building}</td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Zap size={14} className="text-warning" />
                        {room.last_electricity}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Droplets size={14} className="text-primary" />
                        {room.last_water}
                      </div>
                    </td>
                    <td>{Number(room.monthly_price).toLocaleString()}đ</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {room.active_services.map((service, index) => (
                          <span key={`${service.service_id}-${service.student_code}-${index}`} className="badge bg-light text-dark border" title={`${service.student_name} (${service.student_code})`}>
                            {service.service_name}: <strong>{service.student_code}</strong>
                          </span>
                        ))}
                        {room.active_services.length === 0 && <small className="text-muted">Không có dịch vụ đã sử dụng</small>}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
                        onClick={() => handleCreateInvoice(room)}
                        title="Tạo bản nháp hóa đơn"
                        aria-label="Tạo bản nháp hóa đơn"
                        type="button"
                      >
                        <FilePlus2 size={16} />
                        Tạo nháp
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={billingData.length} page={page} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content shadow border-0" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Tạo bản nháp hóa đơn phòng {selectedRoom?.room_code}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label">Tháng</label>
                    <input type="number" className="form-control" min="1" max="12" step="1" value={form.month} onKeyDown={blockInvalidNumberKey} onChange={(event) => setForm({ ...form, month: event.target.value })} required />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Năm</label>
                    <input type="number" className="form-control" min="2000" step="1" value={form.year} onKeyDown={blockInvalidNumberKey} onChange={(event) => setForm({ ...form, year: event.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chỉ số Điện mới (kWh)</label>
                    <input type="number" min="0" step="0.1" className="form-control" value={form.electricity_reading} onKeyDown={blockInvalidNumberKey} onChange={(event) => setForm({ ...form, electricity_reading: event.target.value })} required />
                    <small className="text-muted">Cũ: {selectedRoom?.last_electricity}</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Chỉ số Nước mới (m3)</label>
                    <input type="number" min="0" step="0.1" className="form-control" value={form.water_reading} onKeyDown={blockInvalidNumberKey} onChange={(event) => setForm({ ...form, water_reading: event.target.value })} required />
                    <small className="text-muted">Cũ: {selectedRoom?.last_water}</small>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Hạn thanh toán</label>
                    <input type="date" className="form-control" min={new Date().toISOString().slice(0, 10)} value={form.due_date} onChange={(event) => setForm({ ...form, due_date: event.target.value })} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label">Dịch vụ đã sử dụng trong kỳ</label>
                    <div className="border rounded p-2 bg-light">
                      {selectedRoom?.active_services?.length ? (
                        selectedRoom.active_services.map((service, index) => (
                          <div className="d-flex justify-content-between small py-1" key={`${service.service_id}-${service.student_code}-${index}`}>
                            <span>{service.service_name} - {service.student_name} ({service.student_code})</span>
                            <strong>{Number(service.price).toLocaleString()}đ</strong>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted small">Phòng này chưa có dịch vụ đã sử dụng trong kỳ.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Tạo bản nháp</button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </main>
  );
}

export default InvoicesPage;
