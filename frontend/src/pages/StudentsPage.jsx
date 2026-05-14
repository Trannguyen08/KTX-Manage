import { Bell, DoorOpen, Eye, FileDown, Search, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { paginate } from "../utils/pagination.js";

const emptyFilters = {
  search: "",
  school: "",
  major: "",
  class_name: "",
  gender: "",
  status: "",
};

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchStudents = async (currentFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      const suffix = params.toString() ? `?${params.toString()}` : "";
      const data = await httpClient.get(`/students/${suffix}`);
      setStudents(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(filters);
    setPage(1);
  }, [filters]);

  const filterOptions = useMemo(() => {
    const unique = (key) => Array.from(new Set(students.map((item) => item[key]).filter(Boolean))).sort();
    return {
      schools: unique("school"),
      majors: unique("major"),
      classes: unique("class_name"),
    };
  }, [students]);

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));
  const applyFilters = () => fetchStudents(filters);
  const clearFilters = () => {
    setFilters(emptyFilters);
    fetchStudents(emptyFilters);
  };
  const pageStudents = paginate(students, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quan ly Sinh vien" subtitle="Quan ly ho so cu tru, phan phong va tinh trang sinh vien." />
      {error && <div className="alert alert-danger mb-0">Khong tai duoc danh sach sinh vien: {error}</div>}
      <StatGrid
        items={[
          { label: "Tong sinh vien", value: students.length, hint: "Tu API", icon: Users },
          { label: "Dang o", value: students.filter((item) => item.status === "active").length, hint: "Ho so active", icon: DoorOpen },
          { label: "Cho duyet", value: students.filter((item) => item.status === "pending").length, hint: "Can xu ly", icon: Bell },
          { label: "Het han", value: students.filter((item) => item.status === "expired").length, hint: "Tu dong cap nhat", icon: FileDown },
        ]}
      />

      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-xl-3">
              <label className="form-label small fw-semibold text-secondary">Tim kiem</label>
              <div className="input-group">
                <span className="input-group-text bg-white"><Search size={16} /></span>
                <input className="form-control" placeholder="MSSV, ho ten, email..." value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} />
              </div>
            </div>
            <FilterInput label="Khoa" value={filters.school} options={filterOptions.schools} onChange={(value) => updateFilter("school", value)} />
            <FilterInput label="Nganh" value={filters.major} options={filterOptions.majors} onChange={(value) => updateFilter("major", value)} />
            <FilterInput label="Lop" value={filters.class_name} options={filterOptions.classes} onChange={(value) => updateFilter("class_name", value)} />
            <div className="col-12 col-md-6 col-xl-1">
              <label className="form-label small fw-semibold text-secondary">Gioi tinh</label>
              <select className="form-select" value={filters.gender} onChange={(event) => updateFilter("gender", event.target.value)}>
                <option value="">Tat ca</option>
                <option value="male">Nam</option>
                <option value="female">Nu</option>
                <option value="other">Khac</option>
              </select>
            </div>
            <div className="col-12 col-md-6 col-xl-1">
              <label className="form-label small fw-semibold text-secondary">Trang thai</label>
              <select className="form-select" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
                <option value="">Tat ca</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="moved_out">Moved out</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="col-12 col-xl-auto d-flex gap-2">
              <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-1" type="button" onClick={clearFilters}>
                <X size={16} />
                Xoa loc
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
                <th>Sinh vien</th>
                <th>Phong</th>
                <th>Khoa</th>
                <th>Nganh</th>
                <th>Lop</th>
                <th>Ngay dang ky</th>
                <th>Ngay het han</th>
                <th>Trang thai</th>
                <th className="text-end">Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="text-center py-4">Dang tai...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="10" className="text-center py-4 text-secondary">Khong co sinh vien phu hop.</td></tr>
              ) : pageStudents.map((student) => (
                <tr key={student.id}>
                  <td className="fw-semibold">{student.student_code}</td>
                  <td>{student.full_name}</td>
                  <td>{student.room_code || "-"}</td>
                  <td>{student.school || "-"}</td>
                  <td>{student.major || "-"}</td>
                  <td>{student.class_name || "-"}</td>
                  <td>{student.registered_at || "-"}</td>
                  <td>{student.expiry_date || "-"}</td>
                  <td><StatusBadge value={student.status} /></td>
                  <td className="text-end">
                    <button className="btn btn-light btn-sm" type="button" onClick={() => setViewingStudent(student)} aria-label="Xem">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={students.length} page={page} onPageChange={setPage} />
      </section>

      {viewingStudent && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Thong tin sinh vien - {viewingStudent.full_name}</h5>
                <button className="btn-close" type="button" onClick={() => setViewingStudent(null)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <Info label="MSSV" value={viewingStudent.student_code} />
                  <Info label="Ho ten" value={viewingStudent.full_name} />
                  <Info label="Email" value={viewingStudent.email} />
                  <Info label="So dien thoai" value={viewingStudent.phone} />
                  <Info label="Ngay sinh" value={viewingStudent.date_of_birth} />
                  <Info label="Gioi tinh" value={genderLabel(viewingStudent.gender)} />
                  <Info label="Khoa" value={viewingStudent.school} />
                  <Info label="Nganh" value={viewingStudent.major} />
                  <Info label="Lop" value={viewingStudent.class_name} />
                  <Info label="Toa nha" value={viewingStudent.building_name} />
                  <Info label="Phong" value={viewingStudent.room_code} />
                  <Info label="Ngay dang ky" value={viewingStudent.registered_at} />
                  <Info label="Ngay het han" value={viewingStudent.expiry_date} />
                  <div className="col-12 col-md-6">
                    <div className="border rounded p-3 h-100">
                      <span className="d-block small text-secondary mb-1">Trang thai</span>
                      <StatusBadge value={viewingStudent.status} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" type="button" onClick={() => setViewingStudent(null)}>Dong</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterInput({ label, value, options, onChange }) {
  return (
    <div className="col-12 col-md-6 col-xl-2">
      <label className="form-label small fw-semibold text-secondary">{label}</label>
      <input className="form-control" list={`student-filter-${label}`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={label} />
      <datalist id={`student-filter-${label}`}>
        {options.map((option) => <option key={option} value={option} />)}
      </datalist>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <div className="border rounded p-3 h-100">
        <span className="d-block small text-secondary mb-1">{label}</span>
        <strong>{value || "-"}</strong>
      </div>
    </div>
  );
}

function genderLabel(value) {
  if (value === "male") return "Nam";
  if (value === "female") return "Nu";
  if (value === "other") return "Khac";
  return value || "-";
}

export default StudentsPage;
