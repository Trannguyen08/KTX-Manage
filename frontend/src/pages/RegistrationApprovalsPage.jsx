import { CheckCircle2, Eye, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { createResourceApi } from "../api/resourceApi.js";
import { registrationApi } from "../api/registrationApi.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { paginate } from "../utils/pagination.js";

const registrationsApi = createResourceApi("registrations");

const STATUS_LABELS = {
  draft: { label: "Nháp", color: "secondary" },
  awaiting_payment: { label: "Chờ thanh toán", color: "warning" },
  payment_paid: { label: "Đã thanh toán", color: "info" },
  pending_approval: { label: "Chờ duyệt", color: "primary" },
  approved: { label: "Đã duyệt", color: "success" },
  rejected: { label: "Từ chối", color: "danger" },
};

function InfoItem({ label, value }) {
  return (
    <div className="d-flex border-bottom py-2 gap-3">
      <span className="text-secondary" style={{ minWidth: 160 }}>{label}</span>
      <strong className="text-break">{value || "—"}</strong>
    </div>
  );
}

function RegistrationApprovalsPage() {
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // View modal state
  const [viewingItem, setViewingItem] = useState(null);

  // Reject modal state
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await registrationsApi.list();
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch {
      setMessage({ text: "Chưa tải được danh sách đăng ký từ backend.", type: "warning" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  async function approve(row) {
    try {
      const updated = await registrationApi.approve(row.id);
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage({ text: `✅ Đã duyệt hồ sơ ${row.full_name} và gửi tài khoản qua email ${row.email}.`, type: "success" });
    } catch (error) {
      setMessage({ text: error.message || "Không thể duyệt hồ sơ.", type: "danger" });
    }
  }

  async function confirmReject() {
    if (!rejectReason.trim()) return;
    setRejectSubmitting(true);
    try {
      const updated = await registrationApi.reject(rejectingItem.id, rejectReason.trim());
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setMessage({ text: `❌ Đã từ chối hồ sơ ${rejectingItem.full_name} và gửi thông báo qua email.`, type: "info" });
      setRejectingItem(null);
      setRejectReason("");
    } catch (error) {
      setMessage({ text: error.message || "Không thể từ chối hồ sơ.", type: "danger" });
    } finally {
      setRejectSubmitting(false);
    }
  }

  const pending = items.filter((i) => i.status === "pending_approval").length;
  const approved = items.filter((i) => i.status === "approved").length;
  const rejected = items.filter((i) => i.status === "rejected").length;
  const pageItems = paginate(items, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Duyệt đăng ký nội trú"
        subtitle="Xem hồ sơ đăng ký, duyệt hoặc từ chối và gửi thông báo qua email."
        actionLabel="Tải lại"
        onAction={loadItems}
      />

      <StatGrid
        items={[
          { label: "Chờ duyệt", value: pending, hint: "Cần xử lý", icon: RefreshCw },
          { label: "Đã duyệt", value: approved, hint: "Tháng này", icon: CheckCircle2 },
          { label: "Từ chối", value: rejected, hint: "Tháng này", icon: XCircle },
        ]}
      />

      {message.text && (
        <div className={`alert alert-${message.type} d-flex justify-content-between align-items-center`}>
          {message.text}
          <button className="btn-close" type="button" onClick={() => setMessage({ text: "", type: "info" })} />
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>MSSV</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="text-center text-secondary py-4" colSpan="6">Đang tải...</td>
                </tr>
              )}
              {!loading && pageItems.map((item) => {
                const s = STATUS_LABELS[item.status] || { label: item.status, color: "secondary" };
                const canApprove = item.status === "pending_approval";
                const canReject = item.status === "pending_approval" || item.status === "awaiting_payment";
                return (
                  <tr key={item.id}>
                    <td className="fw-medium">{item.student_code}</td>
                    <td>{item.full_name}</td>
                    <td>{item.email}</td>
                    <td>{item.room_code || item.selected_room?.code || "—"}</td>
                    <td>
                      <span className={`badge text-bg-${s.color}`}>{s.label}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-2 flex-nowrap">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setViewingItem(item)}
                          type="button"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="btn btn-sm btn-success"
                          disabled={!canApprove}
                          onClick={() => approve(item)}
                          type="button"
                          title="Duyệt hồ sơ"
                        >
                          <CheckCircle2 size={14} />
                          Duyệt
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          disabled={!canReject}
                          onClick={() => { setRejectingItem(item); setRejectReason(""); }}
                          type="button"
                          title="Từ chối"
                        >
                          <XCircle size={14} />
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 && (
                <tr>
                  <td className="text-center text-secondary py-4" colSpan="6">Chưa có hồ sơ đăng ký.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination total={items.length} page={page} onPageChange={setPage} />
      </div>

      {/* View Details Modal */}
      {viewingItem && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  Hồ sơ đăng ký — {viewingItem.full_name}
                </h5>
                <button className="btn-close" onClick={() => setViewingItem(null)} type="button" />
              </div>
              <div className="modal-body">
                <h6 className="fw-bold text-primary mb-2">Thông tin cá nhân</h6>
                <InfoItem label="Họ và tên" value={viewingItem.full_name} />
                <InfoItem label="Ngày sinh" value={viewingItem.date_of_birth} />
                <InfoItem label="Giới tính" value={viewingItem.gender === "male" ? "Nam" : viewingItem.gender === "female" ? "Nữ" : viewingItem.gender} />
                <InfoItem label="Số CMND/CCCD" value={viewingItem.identity_number} />
                <InfoItem label="Email" value={viewingItem.email} />
                <InfoItem label="Số điện thoại" value={viewingItem.phone} />
                <InfoItem label="Địa chỉ thường trú" value={viewingItem.permanent_address} />

                <h6 className="fw-bold text-primary mt-3 mb-2">Thông tin học vụ</h6>
                <InfoItem label="MSSV" value={viewingItem.student_code} />
                <InfoItem label="Khoa" value={viewingItem.faculty} />
                <InfoItem label="Ngành" value={viewingItem.department} />
                <InfoItem label="Lớp" value={viewingItem.class_name} />
                <InfoItem label="Hệ đào tạo" value={viewingItem.education_type} />

                <h6 className="fw-bold text-primary mt-3 mb-2">Liên hệ khẩn cấp</h6>
                <InfoItem label="Họ tên người thân" value={viewingItem.guardian_name} />
                <InfoItem label="Mối quan hệ" value={viewingItem.guardian_relationship} />
                <InfoItem label="SĐT người thân" value={viewingItem.guardian_phone} />
                <InfoItem label="Địa chỉ người thân" value={viewingItem.guardian_address} />

                <h6 className="fw-bold text-primary mt-3 mb-2">Thông tin phòng</h6>
                <InfoItem label="Phòng đã chọn" value={viewingItem.room_code || viewingItem.selected_room?.code} />
                <InfoItem label="Giường" value={viewingItem.selected_bed} />
                <InfoItem label="Trạng thái thanh toán" value={viewingItem.payment_status} />

                {viewingItem.portrait_url && (
                  <div className="mt-3">
                    <p className="fw-semibold mb-1">Ảnh chân dung</p>
                    <img
                      src={viewingItem.portrait_url}
                      alt="Ảnh chân dung"
                      className="rounded border"
                      style={{ maxHeight: 200, maxWidth: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}

                {viewingItem.note && (
                  <div className="alert alert-danger mt-3 mb-0">
                    <strong>Lý do từ chối:</strong> {viewingItem.note}
                  </div>
                )}
              </div>
              <div className="modal-footer border-top-0">
                {viewingItem.status === "pending_approval" && (
                  <>
                    <button
                      className="btn btn-success d-inline-flex align-items-center gap-2"
                      onClick={() => { approve(viewingItem); setViewingItem(null); }}
                      type="button"
                    >
                      <CheckCircle2 size={16} />
                      Duyệt
                    </button>
                    <button
                      className="btn btn-danger d-inline-flex align-items-center gap-2"
                      onClick={() => { setRejectingItem(viewingItem); setRejectReason(""); setViewingItem(null); }}
                      type="button"
                    >
                      <XCircle size={16} />
                      Từ chối
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={() => setViewingItem(null)} type="button">
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingItem && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold text-danger">
                  <XCircle size={18} className="me-2" />
                  Từ chối hồ sơ
                </h5>
                <button className="btn-close" onClick={() => setRejectingItem(null)} type="button" />
              </div>
              <div className="modal-body">
                <p className="text-secondary mb-3">
                  Bạn đang từ chối hồ sơ của <strong>{rejectingItem.full_name}</strong>.
                  Một email thông báo kèm lý do sẽ được gửi đến <strong>{rejectingItem.email}</strong>.
                </p>
                <label className="form-label fw-semibold">Lý do từ chối <span className="text-danger">*</span></label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Nhập lý do từ chối hồ sơ..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="modal-footer border-top-0">
                <button className="btn btn-outline-secondary" onClick={() => setRejectingItem(null)} type="button">
                  Hủy
                </button>
                <button
                  className="btn btn-danger d-inline-flex align-items-center gap-2"
                  disabled={!rejectReason.trim() || rejectSubmitting}
                  onClick={confirmReject}
                  type="button"
                >
                  <XCircle size={16} />
                  {rejectSubmitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default RegistrationApprovalsPage;
