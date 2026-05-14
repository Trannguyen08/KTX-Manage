import { CarFront, CreditCard, History, Home, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";
import Pagination from "../../components/Pagination.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { paginate } from "../../utils/pagination.js";

function StudentCards() {
  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [requestForm, setRequestForm] = useState({
    card_type: "dorm",
    request_type: "reissue",
    reason: "",
  });

  useEffect(() => {
    fetchCards();
    fetchRequests();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await httpClient.get("/cards/");
      setCards(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await httpClient.get("/card-requests/");
      setRequests(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await httpClient.post("/card-requests/", requestForm);
      alert("Gửi yêu cầu thành công!");
      setShowModal(false);
      fetchRequests();
    } catch (requestError) {
      alert(requestError.message || "Lỗi khi gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const pageRequests = paginate(requests, page);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý thẻ" subtitle="Xem thẻ KTX, thẻ xe và gửi yêu cầu cấp/đổi thẻ." icon={CreditCard} actionLabel="Yêu cầu cấp thẻ" onAction={() => setShowModal(true)} />
      {error && <div className="alert alert-danger mb-0">Không tải được dữ liệu thẻ: {error}</div>}

      <div className="row g-4">
        <StudentCardFrame card={cards.find((card) => card.card_type === "dorm")} type="dorm" />
        <StudentCardFrame card={cards.find((card) => card.card_type === "parking")} type="parking" />
      </div>

      <div className="card border-0 shadow-sm mt-4">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 d-flex align-items-center gap-2">
            <History size={18} />
            Lịch sử yêu cầu
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Loại thẻ</th>
                <th>Hình thức</th>
                <th>Ngày gửi</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-secondary py-4">Chưa có yêu cầu thẻ.</td></tr>
              ) : pageRequests.map((request) => (
                <tr key={request.id}>
                  <td>{request.card_type === "dorm" ? "Thẻ KTX" : "Thẻ xe"}</td>
                  <td>{request.request_type === "new" ? "Cấp mới" : "Cấp lại"}</td>
                  <td>{formatDate(request.created_at)}</td>
                  <td><small className="text-wrap d-block" style={{ maxWidth: "320px" }}>{request.reason}</small></td>
                  <td><StatusBadge value={request.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination total={requests.length} page={page} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="modal d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content border-0 shadow" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">Yêu cầu cấp/đổi thẻ</h5>
                <button className="btn-close" type="button" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Loại thẻ</label>
                    <select className="form-select" value={requestForm.card_type} onChange={(event) => setRequestForm({ ...requestForm, card_type: event.target.value })}>
                      <option value="dorm">Thẻ KTX</option>
                      <option value="parking">Thẻ xe</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Hình thức</label>
                    <select className="form-select" value={requestForm.request_type} onChange={(event) => setRequestForm({ ...requestForm, request_type: event.target.value })}>
                      <option value="new">Cấp thẻ mới</option>
                      <option value="reissue">Cấp lại thẻ</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Lý do</label>
                    <textarea className="form-control" rows="3" placeholder="Ghi rõ lý do" value={requestForm.reason} onChange={(event) => setRequestForm({ ...requestForm, reason: event.target.value })} required />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" type="button" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit" disabled={loading}>
                  <Plus size={16} />
                  {loading ? "Đang gửi..." : "Gửi yêu cầu"}
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

function StudentCardFrame({ card, type }) {
  const isDorm = type === "dorm";
  const Icon = isDorm ? Home : CarFront;

  return (
    <div className="col-12 col-lg-6">
      <section className={`student-card-frame ${isDorm ? "student-card-dorm" : "student-card-parking"}`}>
        <div className="student-card-top">
          <div className="utc2-logo">UTC2</div>
          <div className="text-end">
            <div className="text-uppercase small fw-bold">{isDorm ? "Thẻ ký túc xá" : "Thẻ xe"}</div>
            <small>{isDorm ? "Dormitory card" : "Parking card"}</small>
          </div>
        </div>

        <div className="student-card-body">
          <Icon size={42} />
          <div>
            <div className="small text-white-50">Mã thẻ</div>
            <div className="student-card-number">{card?.card_number || "Chưa cấp thẻ"}</div>
          </div>
        </div>

        <div className="student-card-bottom">
          <div>
            <small className="text-white-50">Ngày cấp</small>
            <strong>{formatDate(card?.issue_date)}</strong>
          </div>
          <div>
            <small className="text-white-50">Thời hạn sử dụng</small>
            <strong>{formatDate(card?.expiry_date)}</strong>
          </div>
          <div className="text-end">
            {card ? <StatusBadge value={card.status} /> : <span className="badge bg-light text-dark">Chưa có</span>}
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

export default StudentCards;
