import { AlertOctagon, CalendarDays, History, MapPin, Plus, UserRound, Wrench } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";
import Pagination from "../../components/Pagination.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { paginate } from "../../utils/pagination.js";

const today = new Date().toISOString().slice(0, 10);

function StudentReports() {
  const [incidents, setIncidents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [activeTab, setActiveTab] = useState("incidents");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    fetchIncidents();
    fetchViolations();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await httpClient.get("/incidents/");
      setIncidents(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const fetchViolations = async () => {
    try {
      const data = await httpClient.get("/violations/");
      setViolations(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      if (activeTab === "incidents") {
        await httpClient.post("/incidents/", {
          title: form.title,
          description: withLine("Khu vực có sự cố", form.incident_area, form.description),
          priority: form.priority,
          category: "other",
        });
        await fetchIncidents();
      } else {
        await httpClient.post("/violations/", {
          title: form.title,
          description: form.description,
          notes: form.violator_info,
          violation_date: form.violation_date,
        });
        await fetchViolations();
      }

      alert("Gửi báo cáo thành công!");
      setShowModal(false);
    } catch (requestError) {
      alert(requestError.message || "Lỗi khi gửi báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setForm(emptyForm());
    setShowModal(true);
  };

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Báo cáo sự cố và vi phạm"
        subtitle="Gửi và theo dõi các báo cáo liên quan đến ký túc xá."
        icon={activeTab === "incidents" ? Wrench : AlertOctagon}
        actionLabel={activeTab === "incidents" ? "Báo sự cố" : "Báo vi phạm"}
        onAction={openModal}
      />

      {error && <div className="alert alert-danger mb-0">Không tải được báo cáo: {error}</div>}

      <ul className="nav nav-pills bg-white p-1 rounded shadow-sm d-inline-flex">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "incidents" ? "active" : ""}`} onClick={() => setActiveTab("incidents")} type="button">
            Sự cố
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "violations" ? "active" : ""}`} onClick={() => setActiveTab("violations")} type="button">
            Vi phạm
          </button>
        </li>
      </ul>

      {activeTab === "incidents" ? (
        <ReportTable
          emptyText="Chưa có báo cáo sự cố."
          headers={["Sự cố", "Khu vực", "Ngày báo", "Trạng thái"]}
          rows={incidents.map((item) => [
            <ReportTitle title={item.title} description={removePrefixedLine(item.description)} />,
            extractPrefixedLine(item.description, "Khu vực có sự cố") || item.room_details?.code || "-",
            formatDate(item.reported_at || item.created_at),
            <StatusBadge value={item.status} />,
          ])}
        />
      ) : (
        <ReportTable
          emptyText="Chưa có báo cáo vi phạm."
          headers={["Nội dung", "Đối tượng vi phạm", "Ngày vi phạm", "Trạng thái"]}
          rows={violations.map((item) => [
            <ReportTitle title={item.title} description={item.description} />,
            item.notes || "Chưa rõ",
            formatDate(item.violation_date),
            <StatusBadge value={item.status} />,
          ])}
        />
      )}

      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content border-0 shadow" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">{activeTab === "incidents" ? "Gửi báo cáo sự cố" : "Báo cáo vi phạm"}</h5>
                <button className="btn-close" type="button" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Tiêu đề</label>
                    <input className="form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
                  </div>

                  {activeTab === "incidents" ? (
                    <>
                      <div className="col-12">
                        <label className="form-label d-flex align-items-center gap-2"><MapPin size={16} /> Khu vực có sự cố</label>
                        <input
                          className="form-control"
                          placeholder="Ví dụ: Tòa A, phòng 304, khu giặt sấy"
                          value={form.incident_area}
                          onChange={(event) => setForm({ ...form, incident_area: event.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Mức độ ưu tiên</label>
                        <select className="form-select" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                          <option value="low">Thấp</option>
                          <option value="medium">Trung bình</option>
                          <option value="high">Cao</option>
                          <option value="urgent">Khẩn cấp</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-12">
                        <label className="form-label d-flex align-items-center gap-2"><UserRound size={16} /> Đối tượng vi phạm</label>
                        <input
                          className="form-control"
                          placeholder="Ghi thông tin biết được: tên, MSSV, phòng, khu..."
                          value={form.violator_info}
                          onChange={(event) => setForm({ ...form, violator_info: event.target.value })}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label d-flex align-items-center gap-2"><CalendarDays size={16} /> Ngày vi phạm</label>
                        <input
                          className="form-control"
                          type="date"
                          max={today}
                          value={form.violation_date}
                          onChange={(event) => setForm({ ...form, violation_date: event.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  <div className="col-12">
                    <label className="form-label">Mô tả chi tiết</label>
                    <textarea className="form-control" rows="4" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit" disabled={loading}>
                  <Plus size={16} />
                  {loading ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop show" onClick={() => setShowModal(false)} />
        </div>
      )}
    </main>
  );
}

function emptyForm() {
  return {
    title: "",
    description: "",
    incident_area: "",
    priority: "medium",
    violator_info: "",
    violation_date: today,
  };
}

function ReportTable({ headers, rows, emptyText }) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [rows.length]);
  const pageRows = paginate(rows, page);

  return (
    <div className="card border-0 shadow-sm mt-2">
      <div className="table-responsive">
        <table className="table align-middle mb-0">
          <thead className="table-light">
            <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="text-center text-secondary py-4"><History size={18} className="me-1" /> {emptyText}</td></tr>
            ) : pageRows.map((cells, index) => (
              <tr key={index}>{cells.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={rows.length} page={page} onPageChange={setPage} />
    </div>
  );
}

function ReportTitle({ title, description }) {
  return (
    <div>
      <div className="fw-bold">{title}</div>
      <small className="text-secondary text-wrap d-block" style={{ maxWidth: "360px" }}>{description}</small>
    </div>
  );
}

function withLine(label, value, text) {
  return `${label}: ${value}\n${text}`;
}

function extractPrefixedLine(text, label) {
  return String(text ?? "").split("\n").find((line) => line.startsWith(`${label}:`))?.replace(`${label}:`, "").trim();
}

function removePrefixedLine(text) {
  return String(text ?? "").split("\n").filter((line) => !line.startsWith("Khu vực có sự cố:")).join("\n");
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default StudentReports;
