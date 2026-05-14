import { CalendarClock, Download, Droplets, Home, Plug, Receipt, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";

function StudentInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const data = await httpClient.get(`/invoices/?month=${filters.month}&year=${filters.year}`);
      setInvoices(Array.isArray(data) ? data : data.results ?? []);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const invoice = useMemo(() => invoices[0], [invoices]);
  const serviceItems = useMemo(() => {
    return (invoice?.items ?? []).filter((item) => String(item.name || "").startsWith("Dịch vụ:"));
  }, [invoice]);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Hóa đơn cá nhân" subtitle="Chọn tháng để xem bill tiền phòng và dịch vụ." icon={Receipt} />

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-sm-auto">
              <label className="form-label small fw-semibold text-secondary">Tháng</label>
              <select className="form-select" value={filters.month} onChange={(event) => setFilters({ ...filters, month: event.target.value })}>
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>Tháng {index + 1}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-sm-auto">
              <label className="form-label small fw-semibold text-secondary">Năm</label>
              <input className="form-control" type="number" value={filters.year} onChange={(event) => setFilters({ ...filters, year: event.target.value })} style={{ width: "110px" }} />
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-5">Đang tải hóa đơn...</div>
      ) : !invoice ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center text-secondary py-5">Không có hóa đơn cho tháng {filters.month}/{filters.year}.</div>
        </div>
      ) : (
        <section className="bill-paper mx-auto">
          <div className="bill-header">
            <div>
              <div className="text-uppercase small text-secondary fw-bold">Ký túc xá UTC2</div>
              <h2 className="h4 mb-0">Phiếu thu tháng {invoice.month}/{invoice.year}</h2>
            </div>
            <StatusBadge value={invoice.status} />
          </div>

          <div className="bill-info-grid">
            <BillInfo icon={Home} label="Phòng" value={invoice.room_code || "-"} detail={invoice.building_name || ""} />
            <BillInfo icon={CalendarClock} label="Ngày tạo" value={formatDate(invoice.created_at)} />
            <BillInfo icon={WalletCards} label="Hạn thanh toán" value={formatDate(invoice.due_date)} />
            {invoice.paid_at && <BillInfo icon={WalletCards} label="Ngày thanh toán" value={formatDate(invoice.paid_at)} />}
          </div>

          <div className="bill-section">
            <h3 className="bill-section-title">Thông tin phòng</h3>
            <LineItem name={`Tiền phòng ${invoice.room_code || ""}`} amount={invoice.room_cost} />
          </div>

          <div className="bill-section">
            <h3 className="bill-section-title">Thông tin dịch vụ</h3>
            <LineItem icon={Plug} name={`Điện (${number(invoice.electricity_usage)} kWh)`} amount={invoice.electricity_cost} />
            <LineItem icon={Droplets} name={`Nước (${number(invoice.water_usage)} m3)`} amount={invoice.water_cost} />
            {serviceItems.map((item) => (
              <LineItem key={item.id} name={item.name} description={item.description} amount={item.amount} />
            ))}
            {serviceItems.length === 0 && Number(invoice.service_total || 0) > 0 && (
              <LineItem name="Các dịch vụ đã đăng ký" amount={invoice.service_total} />
            )}
          </div>

          <div className="bill-total">
            <span>Tổng tiền</span>
            <strong>{money(invoice.total_amount)}</strong>
          </div>

          <div className="text-end pt-3">
            <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2" type="button">
              <Download size={16} />
              Tải bill
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

function BillInfo({ icon: Icon, label, value, detail }) {
  return (
    <div className="bill-info">
      <Icon size={18} className="text-primary" />
      <div>
        <div className="small text-secondary">{label}</div>
        <div className="fw-bold">{value}</div>
        {detail && <small className="text-secondary">{detail}</small>}
      </div>
    </div>
  );
}

function LineItem({ icon: Icon, name, description, amount }) {
  return (
    <div className="bill-line">
      <div className="d-flex gap-2 min-w-0">
        {Icon && <Icon size={16} className="text-secondary mt-1 flex-shrink-0" />}
        <div className="min-w-0">
          <div className="fw-semibold text-wrap">{name}</div>
          {description && <small className="text-secondary text-wrap d-block">{description}</small>}
        </div>
      </div>
      <span className="fw-semibold">{money(amount)}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

function number(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")}đ`;
}

export default StudentInvoices;
