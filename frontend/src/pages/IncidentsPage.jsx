import { CheckCircle2, Download, Hammer, Search, Clock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { paginate } from "../utils/pagination.js";
import { includesSearch, normalizeSearchText } from "../utils/validation.js";

const PRIORITY_OPTIONS = [
  { value: "", label: "Tất cả mức độ" },
  { value: "low", label: "Thấp" },
  { value: "medium", label: "Trung bình" },
  { value: "high", label: "Cao" },
  { value: "urgent", label: "Khẩn cấp" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Đang chờ" },
  { value: "in_progress", label: "Đang xử lý" },
  { value: "resolved", label: "Đã xong" },
  { value: "closed", label: "Đã đóng" },
];

function IncidentsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: "", priority: "", status: "" });
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await httpClient.get("/incidents/");
      setItems(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setItems([]);
    }
  };

  const filteredItems = useMemo(() => {
    const keyword = normalizeSearchText(filters.search.trim());
    return items.filter((item) => {
      const matchesSearch = !keyword || [
        item.title,
        item.description,
        incidentArea(item),
        item.student_details?.student_code,
        item.student_details?.full_name,
        item.room_details?.code,
        item.room_details?.name,
      ].some((value) => includesSearch(value, keyword));

      return (
        matchesSearch &&
        (!filters.priority || item.priority === filters.priority) &&
        (!filters.status || item.status === filters.status)
      );
    });
  }, [filters, items]);

  const updateIncident = async (incident, patch) => {
    setUpdatingId(incident.id);
    try {
      const updated = await httpClient.patch(`/incidents/${incident.id}/`, patch);
      setItems((currentItems) => currentItems.map((item) => (item.id === updated.id ? updated : item)));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const exportExcel = () => {
    exportTableAsExcel(
      "danh-sach-su-co.xls",
      ["Sự cố", "MSSV", "Sinh viên", "Khu vực", "Mức độ", "Trạng thái", "Ngày báo", "Ghi chú admin"],
      filteredItems.map((item) => [
        item.title,
        item.student_details?.student_code,
        item.student_details?.full_name,
        incidentArea(item),
        optionLabel(PRIORITY_OPTIONS, item.priority),
        optionLabel(STATUS_OPTIONS, item.status),
        formatDate(item.reported_at),
        item.admin_note,
      ])
    );
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageItems = paginate(filteredItems, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Quản lý Sự cố"
        subtitle="Tiếp nhận và theo dõi quá trình xử lý các sự cố sinh viên gửi lên."
      />

      {error && <div className="alert alert-danger mb-0">{error}</div>}

      <StatGrid
        items={[
          { label: "Đang chờ", value: items.filter((item) => item.status === "pending").length, icon: Clock, variant: "warning" },
          { label: "Đang xử lý", value: items.filter((item) => item.status === "in_progress").length, icon: Hammer, variant: "info" },
          { label: "Đã hoàn thành", value: items.filter((item) => item.status === "resolved").length, icon: CheckCircle2, variant: "success" },
        ]}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-xl">
              <div className="input-group">
                <span className="input-group-text bg-white"><Search size={16} /></span>
                <input
                  className="form-control"
                  placeholder="Tìm theo sự cố, phòng, MSSV, sinh viên..."
                  value={filters.search}
                  onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                />
              </div>
            </div>
            <FilterSelect options={PRIORITY_OPTIONS} value={filters.priority} onChange={(priority) => setFilters({ ...filters, priority })} />
            <FilterSelect options={STATUS_OPTIONS} value={filters.status} onChange={(status) => setFilters({ ...filters, status })} />
            <div className="col-12 col-md-auto">
              <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2 w-100" type="button" onClick={exportExcel}>
                <Download size={16} />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Sự cố</th>
                <th>Người báo</th>
                <th>Khu vực</th>
                <th>Mức độ</th>
                <th>Trạng thái</th>
                <th>Ngày báo</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-secondary py-4">Không có sự cố phù hợp.</td></tr>
              ) : pageItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold">{item.title}</div>
                    <small className="text-secondary">{item.description}</small>
                  </td>
                  <td>
                    <div>{item.student_details?.full_name || "-"}</div>
                    <small className="text-secondary">{item.student_details?.student_code || ""}</small>
                  </td>
                  <td>{incidentArea(item)}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.priority}
                      disabled={updatingId === item.id}
                      onChange={(event) => updateIncident(item, { priority: event.target.value })}
                    >
                      {PRIORITY_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(event) => updateIncident(item, { status: event.target.value })}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>{formatDate(item.reported_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filteredItems.length} page={page} onPageChange={setPage} />
      </section>
    </main>
  );
}

function FilterSelect({ options, value, onChange }) {
  return (
    <div className="col-12 col-md-6 col-xl-2">
      <select className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value || "-";
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

function incidentArea(item) {
  const area = String(item.description ?? "")
    .split("\n")
    .find((line) => line.startsWith("Khu vực có sự cố:"))
    ?.replace("Khu vực có sự cố:", "")
    .trim();
  return area || item.room_details?.code || item.room_details?.name || "-";
}

function exportTableAsExcel(filename, headers, rows) {
  const tableRows = [headers, ...rows]
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  const html = `<html><head><meta charset="UTF-8"></head><body><table>${tableRows}</table></body></html>`;
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export default IncidentsPage;
