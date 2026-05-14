import { Megaphone, Calendar, Info, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";

function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await httpClient.get("/announcements/");
      setAnnouncements(data);
    } catch (e) {
      console.error("Error fetching announcements:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReadToggle = async (announcement, isRead) => {
    setAnnouncements((current) =>
      current.map((item) => (item.id === announcement.id ? { ...item, is_read: isRead } : item))
    );

    try {
      await httpClient.post(`/announcements/${announcement.id}/mark-read/`, { is_read: isRead });
      window.dispatchEvent(new Event("announcements:read-change"));
    } catch (error) {
      setAnnouncements((current) =>
        current.map((item) =>
          item.id === announcement.id ? { ...item, is_read: announcement.is_read } : item
        )
      );
      alert("Không thể cập nhật trạng thái đã đọc");
    }
  };

  return (
    <main className="d-grid gap-4">
      <PageHeader 
        title="Thông báo chung" 
        subtitle="Cập nhật những thông tin mới nhất từ Ban quản lý ký túc xá." 
        icon={Megaphone} 
      />

      {loading ? (
        <div className="text-center py-5">Đang tải thông báo...</div>
      ) : announcements.length === 0 ? (
        <div className="card border-0 shadow-sm p-5 text-center text-muted">
          Hiện không có thông báo nào dành cho bạn.
        </div>
      ) : (
        <div className="row g-4">
          {announcements.map((ann) => (
            <div className="col-12" key={ann.id}>
              <div className={`card border-0 shadow-sm h-100 ${ann.is_urgent ? 'border-start border-danger border-4' : ''}`}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        {ann.is_urgent && (
                          <span className="badge bg-danger d-flex align-items-center gap-1">
                            <AlertTriangle size={12} />
                            KHẨN CẤP
                          </span>
                        )}
                        <small className="text-secondary d-flex align-items-center gap-1">
                          <Calendar size={14} />
                          {new Date(ann.created_at).toLocaleDateString("vi-VN")}
                        </small>
                      </div>
                      <h4 className="card-title fw-bold mb-0">{ann.title}</h4>
                    </div>
                    <div className="form-check ms-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`ann-read-${ann.id}`}
                        checked={Boolean(ann.is_read)}
                        onChange={(event) => handleReadToggle(ann, event.target.checked)}
                      />
                      <label className="form-check-label small text-secondary" htmlFor={`ann-read-${ann.id}`}>
                        Đã đọc
                      </label>
                    </div>
                  </div>
                  <div className="card-text text-secondary mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                    {ann.content}
                  </div>
                  {ann.building_name && (
                    <div className="mt-3 pt-3 border-top">
                      <small className="text-primary fw-semibold">
                        <Info size={14} className="me-1" />
                        Dành cho tòa: {ann.building_name}
                      </small>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default StudentAnnouncements;
