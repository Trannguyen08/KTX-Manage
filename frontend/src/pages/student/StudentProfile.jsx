import { CalendarDays, Home, KeyRound, Mail, MapPin, Phone, Save, School, Settings, ShieldCheck, User } from "lucide-react";
import { useEffect, useState } from "react";

import { httpClient } from "../../api/httpClient.js";
import PageHeader from "../../components/PageHeader.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { VN_PHONE_PATTERN } from "../../utils/validation.js";

function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await httpClient.get("/students/me/");
      setProfile(data);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = await httpClient.patch("/students/me/", {
        email: profile.email,
        phone: profile.phone,
        major: profile.major,
      });
      setProfile(data);
      alert("Cập nhật hồ sơ thành công!");
    } catch (requestError) {
      alert(requestError.message || "Lỗi khi cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Mật khẩu xác nhận không khớp.");
      return;
    }

    setChangingPassword(true);
    try {
      await httpClient.post("/auth/change-password/", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      alert("Đổi mật khẩu thành công!");
    } catch (requestError) {
      alert(requestError.message || "Không thể đổi mật khẩu");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="alert alert-danger">Không tải được hồ sơ: {error}</div>;

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Hồ sơ cá nhân" subtitle="Thông tin cá nhân, phòng ở, hợp đồng KTX và bảo mật tài khoản." icon={Settings} />

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <section className="card border-0 shadow-sm text-center p-4 h-100">
            <div className="mx-auto bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center mb-3" style={{ width: "100px", height: "100px" }}>
              <User size={50} />
            </div>
            <h4 className="mb-1">{profile.full_name}</h4>
            <p className="text-secondary mb-3">{profile.student_code}</p>
            <StatusBadge value={profile.status} />
            <hr />
            <div className="text-start small d-grid gap-2">
              <IconLine icon={School} text={profile.school || "Chưa cập nhật trường"} />
              <IconLine icon={MapPin} text={`${profile.building_name || "KTX"} - Phòng ${profile.room_code || "chưa có"}`} />
              <IconLine icon={CalendarDays} text={`Hạn hợp đồng: ${formatDate(profile.expiry_date)}`} />
            </div>
          </section>
        </div>

        <div className="col-12 col-lg-8 d-grid gap-4">
          <form className="card border-0 shadow-sm" onSubmit={handleSave}>
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Thông tin liên hệ</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <EditableField icon={Mail} label="Email" type="email" value={profile.email} onChange={(value) => setProfile({ ...profile, email: value })} />
                <EditableField icon={Phone} label="Số điện thoại" type="tel" inputMode="tel" pattern={VN_PHONE_PATTERN} title="Số điện thoại VN, ví dụ 0912345678 hoặc +84912345678" value={profile.phone} onChange={(value) => setProfile({ ...profile, phone: value.replace(/[^\d+]/g, "") })} />
                <div className="col-12">
                  <label className="form-label text-secondary small fw-bold text-uppercase">Chuyên ngành</label>
                  <input className="form-control" value={profile.major || ""} onChange={(event) => setProfile({ ...profile, major: event.target.value })} />
                </div>
              </div>
            </div>
            <div className="card-footer bg-white py-3 text-end">
              <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit" disabled={saving}>
                <Save size={18} />
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>

          <section className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Thông tin cá nhân và hợp đồng</h5>
            </div>
            <div className="card-body profile-info-grid">
              <ReadOnlyInfo label="MSSV" value={profile.student_code} />
              <ReadOnlyInfo label="Họ tên" value={profile.full_name} />
              <ReadOnlyInfo label="Ngày sinh" value={formatDate(profile.date_of_birth)} />
              <ReadOnlyInfo label="Giới tính" value={genderLabel(profile.gender)} />
              <ReadOnlyInfo label="Lớp" value={profile.class_name} />
              <ReadOnlyInfo label="Trường" value={profile.school} />
              <ReadOnlyInfo label="Tòa" value={profile.building_name} />
              <ReadOnlyInfo label="Phòng" value={profile.room_code} />
              <ReadOnlyInfo label="Ngày đăng ký" value={formatDate(profile.registered_at)} />
              <ReadOnlyInfo label="Ngày hết hạn" value={formatDate(profile.expiry_date)} />
              <ReadOnlyInfo label="Trạng thái hợp đồng" value={<StatusBadge value={profile.status} />} />
            </div>
          </section>

          <form className="card border-0 shadow-sm" onSubmit={handlePasswordChange}>
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 d-flex align-items-center gap-2"><KeyRound size={18} /> Đổi mật khẩu</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <PasswordInput label="Mật khẩu hiện tại" value={passwordForm.current_password} onChange={(value) => setPasswordForm({ ...passwordForm, current_password: value })} />
                <PasswordInput label="Mật khẩu mới" value={passwordForm.new_password} onChange={(value) => setPasswordForm({ ...passwordForm, new_password: value })} />
                <PasswordInput label="Xác nhận mật khẩu mới" value={passwordForm.confirm_password} onChange={(value) => setPasswordForm({ ...passwordForm, confirm_password: value })} />
              </div>
            </div>
            <div className="card-footer bg-white py-3 text-end">
              <button className="btn btn-outline-primary d-inline-flex align-items-center gap-2" type="submit" disabled={changingPassword}>
                <ShieldCheck size={18} />
                {changingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

function IconLine({ icon: Icon, text }) {
  return <div className="d-flex align-items-center gap-2 text-secondary"><Icon size={16} /> {text}</div>;
}

function EditableField({ icon: Icon, label, value, onChange, type = "text", ...inputProps }) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label text-secondary small fw-bold text-uppercase">{label}</label>
      <div className="input-group">
        <span className="input-group-text bg-light border-end-0"><Icon size={18} className="text-muted" /></span>
        <input className="form-control" type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} {...inputProps} />
      </div>
    </div>
  );
}

function PasswordInput({ label, value, onChange }) {
  return (
    <div className="col-12 col-md-4">
      <label className="form-label text-secondary small fw-bold text-uppercase">{label}</label>
      <input className="form-control" type="password" value={value} onChange={(event) => onChange(event.target.value)} required />
    </div>
  );
}

function ReadOnlyInfo({ label, value }) {
  return (
    <div className="profile-info-item">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("vi-VN");
}

function genderLabel(value) {
  return { male: "Nam", female: "Nữ", other: "Khác" }[value] || "-";
}

export default StudentProfile;
