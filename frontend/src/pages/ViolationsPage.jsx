import { AlertTriangle, CheckCircle, Download, Info, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { paginate } from "../utils/pagination.js";
import { includesSearch, normalizeSearchText } from "../utils/validation.js";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "resolved", label: "Đã xử lý" },
  { value: "cancelled", label: "Đã hủy" },
];

function ViolationsPage() {
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "" });
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      const data = await httpClient.get("/violations/");
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
        item.penalty,
        item.notes,
        item.student_details?.student_code,
        item.student_details?.full_name,
        item.student_details?.room?.code,
      ].some((value) => includesSearch(value, keyword));

      return (
        matchesSearch &&
        (!filters.status || item.status === filters.status)
      );
    });
  }, [filters, items]);

  const updateViolation = async (violation, patch) => {
    setUpdatingId(violation.id);
    try {
      const updated = await httpClient.patch(`/violations/${violation.id}/`, patch);
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
      "danh-sach-vi-pham.xls",
      ["MSSV", "Sinh viên", "Phòng", "Nội dung", "Mô tả", "Đối tượng vi phạm", "Ngày vi phạm", "Trạng thái", "Hình thức xử lý"],
      filteredItems.map((item) => [
        item.student_details?.student_code,
        item.student_details?.full_name,
        item.student_details?.room?.code,
        item.title,
        item.description,
        item.notes,
        formatDate(item.violation_date),
        optionLabel(STATUS_OPTIONS, item.status),
        item.penalty,
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
        title="Xử lý Vi phạm"
        subtitle="Theo dõi và cập nhật mức độ, trạng thái các vi phạm sinh viên gửi lên."
      />

      {error && <div className="alert alert-danger mb-0">{error}</div>}

      <StatGrid
        items={[
          { label: "Tổng vi phạm", value: items.length, icon: Info },
          { label: "Chờ xử lý", value: items.filter((item) => item.status === "pending").length, icon: AlertTriangle, variant: "warning" },
          { label: "Đã xử lý", value: items.filter((item) => item.status === "resolved").length, icon: CheckCircle, variant: "success" },
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
                  placeholder="Tìm theo MSSV, sinh viên, nội dung, phòng..."
                  value={filters.search}
                  onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                />
              </div>
            </div>
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
                <th>MSSV</th>
                <th>Sinh viên</th>
                <th>Nội dung vi phạm</th>
                <th>Đối tượng vi phạm</th>
                <th>Ngày vi phạm</th>
                <th>Trạng thái</th>
                <th>Xử lý</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-secondary py-4">Không có vi phạm phù hợp.</td></tr>
              ) : pageItems.map((item) => (
                <tr key={item.id}>
                  <td className="fw-semibold">{item.student_details?.student_code || "-"}</td>
                  <td>
                    <div>{item.student_details?.full_name || "-"}</div>
                    <small className="text-secondary">{item.student_details?.room?.code || ""}</small>
                  </td>
                  <td>
                    <div className="fw-semibold">{item.title}</div>
                    <small className="text-secondary">{item.description}</small>
                  </td>
                  <td>{item.notes || "-"}</td>
                  <td>{formatDate(item.violation_date)}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(event) => updateViolation(item, { status: event.target.value })}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={item.penalty || ""}
                      disabled={updatingId === item.id}
                      placeholder="Hình thức xử lý"
                      onChange={(event) => {
                        const penalty = event.target.value;
                        setItems((currentItems) => currentItems.map((currentItem) => (
                          currentItem.id === item.id ? { ...currentItem, penalty } : currentItem
                        )));
                      }}
                      onBlur={(event) => updateViolation(item, { penalty: event.target.value })}
                    />
                  </td>
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

export default ViolationsPage;
