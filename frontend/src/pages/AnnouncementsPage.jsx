import { Bell, Edit3, EyeOff, Megaphone, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import CrudModal from "../components/CrudModal.jsx";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { paginate } from "../utils/pagination.js";
import { includesSearch, normalizeSearchText } from "../utils/validation.js";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "draft", label: "Nháp" },
  { value: "published", label: "Đã đăng" },
  { value: "archived", label: "Đã ẩn" },
];

const TARGET_OPTIONS = [
  { value: "", label: "Tất cả đối tượng" },
  { value: "all", label: "Tất cả" },
  { value: "students", label: "Sinh viên" },
  { value: "staff", label: "Nhân sự" },
  { value: "building", label: "Theo tòa" },
];

const YES_NO_OPTIONS = [
  { value: "", label: "Tất cả khẩn cấp" },
  { value: "true", label: "Có" },
  { value: "false", label: "Không" },
];

const EDITED_OPTIONS = [
  { value: "", label: "Tất cả chỉnh sửa" },
  { value: "true", label: "Đã chỉnh sửa" },
  { value: "false", label: "Chưa chỉnh sửa" },
];

function AnnouncementsPage() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({ search: "", status: "", target_audience: "", is_urgent: "", is_edited: "" });
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await httpClient.get("/announcements/");
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
      const matchesSearch = !keyword || [item.title, item.content, item.building_name]
        .some((value) => includesSearch(value, keyword));

      return (
        matchesSearch &&
        (!filters.status || item.status === filters.status) &&
        (!filters.target_audience || item.target_audience === filters.target_audience) &&
        (!filters.is_urgent || String(item.is_urgent) === filters.is_urgent) &&
        (!filters.is_edited || String(item.is_edited) === filters.is_edited)
      );
    });
  }, [filters, items]);

  const saveAnnouncement = async (form) => {
    try {
      if (form.id) {
        await httpClient.patch(`/announcements/${form.id}/`, form);
      } else {
        await httpClient.post("/announcements/", form);
      }
      setEditingItem(null);
      fetchAnnouncements();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const pageItems = paginate(filteredItems, page);

  const hideAnnouncement = async (announcement) => {
    try {
      const updated = await httpClient.delete(`/announcements/${announcement.id}/`);
      setItems((currentItems) => currentItems.map((item) => (item.id === updated.id ? updated : item)));
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Quản lý Thông báo"
        subtitle="Tạo và quản lý thông báo gửi đến sinh viên và cán bộ nội trú."
        actionLabel="Tạo thông báo mới"
        actionIcon={Plus}
        onAction={() => setEditingItem({})}
      />

      {error && <div className="alert alert-danger mb-0">{error}</div>}

      <StatGrid
        items={[
          { label: "Tổng thông báo", value: items.length, hint: "Từ API", icon: Megaphone },
          { label: "Đang hiển thị", value: items.filter((item) => item.status === "published").length, hint: "Công khai", icon: Megaphone },
          { label: "Khẩn cấp", value: items.filter((item) => item.is_urgent).length, hint: "Ưu tiên cao", icon: Bell },
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
                  placeholder="Tìm tiêu đề, nội dung, tòa nhà..."
                  value={filters.search}
                  onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                />
              </div>
            </div>
            <FilterSelect options={STATUS_OPTIONS} value={filters.status} onChange={(status) => setFilters({ ...filters, status })} />
            <FilterSelect options={TARGET_OPTIONS} value={filters.target_audience} onChange={(target_audience) => setFilters({ ...filters, target_audience })} />
            <FilterSelect options={YES_NO_OPTIONS} value={filters.is_urgent} onChange={(is_urgent) => setFilters({ ...filters, is_urgent })} />
            <FilterSelect options={EDITED_OPTIONS} value={filters.is_edited} onChange={(is_edited) => setFilters({ ...filters, is_edited })} />
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Tiêu đề thông báo</th>
                <th>Đối tượng</th>
                <th>Khẩn cấp</th>
                <th>Đã chỉnh sửa</th>
                <th>Ngày đăng</th>
                <th>Lượt đọc</th>
                <th>Trạng thái</th>
                <th className="text-end">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="8" className="text-center text-secondary py-4">Không có thông báo phù hợp.</td></tr>
              ) : pageItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="fw-semibold">{item.title}</div>
                    <small className="text-secondary text-truncate d-inline-block" style={{ maxWidth: 360 }}>{item.content}</small>
                  </td>
                  <td>{optionLabel(TARGET_OPTIONS, item.target_audience)}</td>
                  <td>{item.is_urgent ? "Có" : "Không"}</td>
                  <td>{item.is_edited ? "Có" : "Không"}</td>
                  <td>{formatDateTime(item.published_at || item.created_at)}</td>
                  <td>{item.read_count ?? 0}</td>
                  <td><StatusBadge value={item.status} /></td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      <button className="btn btn-light btn-sm" type="button" title="Chỉnh sửa" onClick={() => setEditingItem(item)}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn btn-light btn-sm text-warning" type="button" title="Ẩn thông báo" onClick={() => hideAnnouncement(item)} disabled={item.status === "archived"}>
                        <EyeOff size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={filteredItems.length} page={page} onPageChange={setPage} />
      </section>

      <CrudModal
        title={editingItem?.id ? "Sửa thông báo" : "Tạo thông báo"}
        fields={formFields.announcements}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={saveAnnouncement}
      />
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

export default AnnouncementsPage;
