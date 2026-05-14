import { CheckCircle, Clock, ListChecks, Search, Send, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { paginate } from "../utils/pagination.js";
import { blockInvalidNumberKey } from "../utils/validation.js";

function InvoiceManagementPage() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: currentMonth,
    year: currentYear,
    status: "",
    room_code: "",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchInvoices();
    setPage(1);
  }, [filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append("month", filters.month);
      if (filters.year) params.append("year", filters.year);
      if (filters.status) params.append("status", filters.status);
      if (filters.room_code) params.append("room_code", filters.room_code);

      const data = await httpClient.get(`/invoices/?${params.toString()}`);
      setInvoices(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (invoice) => {
    if (!confirm(`Gửi hóa đơn phòng ${invoice.room_code} tháng ${invoice.month}/${invoice.year}? Sau khi gửi, chỉ số điện nước sẽ được chốt và sinh viên có thể xem hóa đơn.`)) return;
    try {
      await httpClient.post(`/invoices/${invoice.id}/send/`, {});
      fetchInvoices();
    } catch (error) {
      alert("Lỗi khi gửi hóa đơn: " + (error.message || ""));
    }
  };

  const handleStatusUpdate = async (invoice, status) => {
    const message = status === "paid"
      ? "Xác nhận hóa đơn đã thanh toán bằng tiền mặt? Ngày thanh toán sẽ là thời điểm cập nhật hiện tại."
      : "Bạn có chắc muốn hủy hóa đơn này?";
    if (!confirm(message)) return;
    try {
      await httpClient.patch(`/invoices/${invoice.id}/`, { status });
      fetchInvoices();
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa hóa đơn này?")) return;
    try {
      await httpClient.delete(`/invoices/${id}/`);
      fetchInvoices();
    } catch (error) {
      alert("Lỗi khi xóa hóa đơn");
    }
  };

  const pageInvoices = paginate(invoices, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Quản lý Hóa đơn"
        subtitle="Theo dõi bản nháp, gửi hóa đơn cho sinh viên và quản lý trạng thái thanh toán."
        icon={ListChecks}
      />

      <StatGrid
        items={[
          { label: "Tổng hóa đơn", value: invoices.length, icon: ListChecks },
          { label: "Bản nháp", value: invoices.filter((invoice) => invoice.status === "draft").length, icon: Clock, variant: "info" },
          { label: "Chờ thanh toán", value: invoices.filter((invoice) => invoice.status === "pending").length, icon: Clock, variant: "warning" },
          { label: "Đã thanh toán", value: invoices.filter((invoice) => invoice.status === "paid").length, icon: CheckCircle, variant: "success" },
        ]}
      />

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <div className="row g-3">
            <div className="col-12 col-md-2">
              <select className="form-select" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>
                <option value="">Tất cả tháng</option>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <input type="number" className="form-control" min="2000" step="1" placeholder="Năm" value={filters.year} onKeyDown={blockInvalidNumberKey} onChange={(event) => setFilters({ ...filters, year: event.target.value })} />
            </div>
            <div className="col-12 col-md-2">
              <select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
                <option value="">Tất cả trạng thái</option>
                <option value="draft">Bản nháp</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div className="col-12 col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={18} className="text-muted" />
                </span>
                <input type="text" className="form-control border-start-0" placeholder="Tìm theo mã phòng..." value={filters.room_code} onChange={(event) => setFilters({ ...filters, room_code: event.target.value })} />
              </div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Mã HĐ</th>
                <th>Phòng</th>
                <th>Tòa</th>
                <th>Kỳ hóa đơn</th>
                <th>Chỉ số chốt</th>
                <th>Tổng tiền</th>
                <th>Hạn thanh toán</th>
                <th>Ngày thanh toán</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-4">Đang tải...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-4">Không tìm thấy hóa đơn nào</td></tr>
              ) : (
                pageInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="fw-semibold">#{invoice.id}</td>
                    <td className="fw-bold">{invoice.room_code}</td>
                    <td>{invoice.building_name}</td>
                    <td>Tháng {invoice.month}/{invoice.year}</td>
                    <td>
                      <div className="small">Điện: {Number(invoice.electricity_reading || 0).toLocaleString("vi-VN")}</div>
                      <div className="small">Nước: {Number(invoice.water_reading || 0).toLocaleString("vi-VN")}</div>
                    </td>
                    <td className="text-primary fw-bold">{Number(invoice.total_amount).toLocaleString()}đ</td>
                    <td>{new Date(invoice.due_date).toLocaleDateString("vi-VN")}</td>
                    <td>{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString("vi-VN") : "-"}</td>
                    <td><StatusBadge value={invoice.status} /></td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {invoice.status === "draft" && (
                          <>
                            <button className="btn btn-outline-primary btn-sm" title="Gửi hóa đơn" aria-label="Gửi hóa đơn" onClick={() => handleSend(invoice)} type="button">
                              <Send size={16} />
                            </button>
                            <button className="btn btn-outline-danger btn-sm" title="Hủy bản nháp" aria-label="Hủy bản nháp" onClick={() => handleStatusUpdate(invoice, "cancelled")} type="button">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {invoice.status === "pending" && (
                          <button className="btn btn-outline-success btn-sm" title="Thanh toán tiền mặt" aria-label="Thanh toán tiền mặt" onClick={() => handleStatusUpdate(invoice, "paid")} type="button">
                            <CheckCircle size={16} />
                          </button>
                        )}
                        {invoice.status !== "draft" && (
                          <button className="btn btn-outline-danger btn-sm" title="Xóa hóa đơn" aria-label="Xóa hóa đơn" onClick={() => handleDelete(invoice.id)} type="button">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={invoices.length} page={page} onPageChange={setPage} />
      </div>
    </main>
  );
}

export default InvoiceManagementPage;
