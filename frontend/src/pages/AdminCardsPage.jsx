import { CheckCircle, CreditCard, FileText, Send, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../api/httpClient.js";
import PageHeader from "../components/PageHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { paginate } from "../utils/pagination.js";

function AdminCardsPage() {
  const [cards, setCards] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("requests");
  const [issueRequest, setIssueRequest] = useState(null);
  const [rejectRequest, setRejectRequest] = useState(null);
  const [issueForm, setIssueForm] = useState({ student_code: "", student_name: "", card_type: "dorm", card_number: "", expiry_date: "", admin_note: "" });
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [requestPage, setRequestPage] = useState(1);
  const [cardPage, setCardPage] = useState(1);

  useEffect(() => {
    fetchCards();
    fetchRequests();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await httpClient.get("/cards/");
      setCards(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await httpClient.get("/card-requests/");
      setRequests(Array.isArray(data) ? data : data.results ?? []);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  };

  const openIssueModal = (request) => {
    const prefix = request.card_type === "dorm" ? "KTX" : "GX";
    const baseNumber = `${prefix}-${request.student_code}`;
    setIssueRequest(request);
    setFormError("");
    setIssueForm({
      student_code: request.student_code,
      student_name: request.student_name,
      card_type: request.card_type,
      card_number: suggestCardNumber(baseNumber),
      expiry_date: request.student_expiry_date || "",
      admin_note: "",
    });
  };

  const suggestCardNumber = (baseNumber) => {
    const existingNumbers = new Set(cards.map((card) => card.card_number));
    if (!existingNumbers.has(baseNumber)) return baseNumber;

    let index = 2;
    let candidate = `${baseNumber}-${index}`;
    while (existingNumbers.has(candidate)) {
      index += 1;
      candidate = `${baseNumber}-${index}`;
    }
    return candidate;
  };

  const submitIssue = async (event) => {
    event.preventDefault();
    try {
      await httpClient.post(`/card-requests/${issueRequest.id}/issue/`, {
        card_number: issueForm.card_number,
        admin_note: issueForm.admin_note,
      });
      setIssueRequest(null);
      fetchRequests();
      fetchCards();
      setActiveTab("list");
    } catch (e) {
      setFormError(e.message || "Loi khi cap the");
    }
  };

  const submitReject = async (event) => {
    event.preventDefault();
    try {
      await httpClient.patch(`/card-requests/${rejectRequest.id}/`, { status: "rejected", admin_note: rejectReason });
      setRejectRequest(null);
      setRejectReason("");
      fetchRequests();
    } catch (e) {
      setFormError(e.message || "Loi khi tu choi");
    }
  };

  const pageRequests = paginate(requests, requestPage);
  const pageCards = paginate(cards, cardPage);

  return (
    <main className="d-grid gap-4">
      <PageHeader
        title="Quan ly The"
        subtitle="Xem danh sach the va xu ly yeu cau cap/cap lai the tu sinh vien."
      />
      {error && <div className="alert alert-danger mb-0">Khong tai duoc du lieu the: {error}</div>}

      <StatGrid
        items={[
          { label: "Tong so the", value: cards.length, icon: CreditCard },
          { label: "Yeu cau cho xu ly", value: requests.filter((r) => r.status === "pending").length, icon: FileText, variant: "warning" },
          { label: "Da xu ly", value: requests.filter((r) => r.status !== "pending").length, icon: CheckCircle, variant: "success" },
        ]}
      />

      <ul className="nav nav-tabs bg-white px-3 pt-2 rounded shadow-sm border-0">
        <li className="nav-item">
          <button className={`nav-link border-0 ${activeTab === "requests" ? "active fw-bold border-bottom border-primary border-3" : ""}`} onClick={() => setActiveTab("requests")}>Yeu cau cap the</button>
        </li>
        <li className="nav-item">
          <button className={`nav-link border-0 ${activeTab === "list" ? "active fw-bold border-bottom border-primary border-3" : ""}`} onClick={() => setActiveTab("list")}>Danh sach the</button>
        </li>
      </ul>

      <section className="card border-0 shadow-sm">
        <div className="table-responsive">
          {activeTab === "requests" ? (
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>MSSV</th>
                  <th>Sinh vien</th>
                  <th>Loai the</th>
                  <th>Hinh thuc</th>
                  <th>Han KTX</th>
                  <th>Ngay yeu cau</th>
                  <th>Ly do</th>
                  <th>Trang thai</th>
                  <th className="text-end">Thao tac</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="9" className="text-center text-secondary py-4">Chua co yeu cau cap the.</td></tr>
                ) : pageRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="fw-semibold">{req.student_code}</td>
                    <td>{req.student_name}</td>
                    <td>{req.card_type === "dorm" ? "The KTX" : "The gui xe"}</td>
                    <td>{req.request_type === "reissue" ? "Cap lai" : req.request_type === "extend" ? "Gia han" : "Cap moi"}</td>
                    <td>{req.student_expiry_date || "-"}</td>
                    <td>{new Date(req.created_at).toLocaleDateString("vi-VN")}</td>
                    <td><small>{req.reason}</small></td>
                    <td><StatusBadge value={req.status} /></td>
                    <td className="text-end">
                      {req.status === "pending" ? (
                        <div className="d-flex justify-content-end gap-1">
                          <button className="btn btn-primary btn-sm" onClick={() => openIssueModal(req)} type="button" title="Cap the" aria-label="Cap the">
                            <Send size={16} />
                          </button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => { setRejectRequest(req); setRejectReason(""); setFormError(""); }} type="button" title="Tu choi" aria-label="Tu choi">
                            <XCircle size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-secondary small">Da xu ly</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ma so the</th>
                  <th>Loai the</th>
                  <th>MSSV</th>
                  <th>Sinh vien</th>
                  <th>Ngay cap</th>
                  <th>Ngay het han</th>
                  <th>Trang thai</th>
                </tr>
              </thead>
              <tbody>
                {cards.length === 0 ? (
                  <tr><td colSpan="7" className="text-center text-secondary py-4">Chua co the nao.</td></tr>
                ) : pageCards.map((card) => (
                  <tr key={card.id}>
                    <td className="fw-bold">{card.card_number}</td>
                    <td>{card.card_type === "dorm" ? "The KTX" : "The gui xe"}</td>
                    <td>{card.student_code || card.student}</td>
                    <td>{card.student_name || "-"}</td>
                    <td>{card.issue_date}</td>
                    <td>{card.expiry_date || "-"}</td>
                    <td><StatusBadge value={card.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {activeTab === "requests" ? (
          <Pagination total={requests.length} page={requestPage} onPageChange={setRequestPage} />
        ) : (
          <Pagination total={cards.length} page={cardPage} onPageChange={setCardPage} />
        )}
      </section>

      {issueRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content border-0 shadow" onSubmit={submitIssue}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Cap the cho {issueForm.student_code}</h5>
                <button className="btn-close" type="button" onClick={() => setIssueRequest(null)} />
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger py-2">{formError}</div>}
                <div className="row g-3">
                  <ReadOnlyField label="MSSV" value={issueForm.student_code} />
                  <ReadOnlyField label="Sinh vien" value={issueForm.student_name} />
                  <ReadOnlyField label="Loai the" value={issueForm.card_type === "dorm" ? "The KTX" : "The gui xe"} />
                  <ReadOnlyField label="Ngay the het han" value={issueForm.expiry_date || "Theo han KTX"} />
                  <div className="col-12">
                    <label className="form-label fw-semibold">Ma the</label>
                    <input className="form-control" required value={issueForm.card_number} onChange={(event) => setIssueForm({ ...issueForm, card_number: event.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold">Ghi chu</label>
                    <textarea className="form-control" rows="3" value={issueForm.admin_note} onChange={(event) => setIssueForm({ ...issueForm, admin_note: event.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" type="button" onClick={() => setIssueRequest(null)}>Huy</button>
                <button className="btn btn-primary" type="submit">Cap the</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rejectRequest && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content border-0 shadow" onSubmit={submitReject}>
              <div className="modal-header">
                <h5 className="modal-title fw-bold text-danger">Tu choi yeu cau</h5>
                <button className="btn-close" type="button" onClick={() => setRejectRequest(null)} />
              </div>
              <div className="modal-body">
                {formError && <div className="alert alert-danger py-2">{formError}</div>}
                <p className="text-secondary">Tu choi yeu cau cua <strong>{rejectRequest.student_code}</strong>.</p>
                <label className="form-label fw-semibold">Ly do tu choi</label>
                <textarea className="form-control" rows="4" required value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" type="button" onClick={() => setRejectRequest(null)}>Huy</button>
                <button className="btn btn-danger" type="submit">Tu choi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control bg-light" readOnly value={value || "-"} />
    </div>
  );
}

export default AdminCardsPage;
