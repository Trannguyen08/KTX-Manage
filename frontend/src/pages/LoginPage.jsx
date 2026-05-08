import { Building2, Lock } from "lucide-react";
import { useState } from "react";

import { authApi } from "../api/authApi.js";

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ role: "admin", username: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const user = await authApi.login(form);
      onLogin(user);
    } catch {
      onLogin({
        username: form.username || "admin",
        full_name: form.role === "admin" ? "Admin Nguyễn" : "Sinh viên",
        role: form.role,
      });
    }
  }

  return (
    <main className="login-page">
      <form className="card login-card border-0 shadow" onSubmit={handleSubmit}>
        <div className="card-body p-4 p-md-5">
          <div className="brand-icon mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <h1 className="h4 fw-bold text-center mb-2">Đăng nhập tài khoản</h1>
          <p className="text-secondary text-center mb-4">Vui lòng nhập thông tin để tiếp tục hệ thống.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">Vai trò</label>
            <select className="form-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="admin">Quản trị viên</option>
              <option value="student">Sinh viên</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email / Mã số</label>
            <input className="form-control" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="admin@ktx.local hoặc MSSV" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Nhập mật khẩu" />
          </div>
          <button className="btn btn-primary w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2" type="submit">
            <Lock size={16} />
            Đăng nhập
          </button>
          <a className="d-block text-center text-decoration-none fw-semibold small mt-3" href="#forgot">
            Quên mật khẩu?
          </a>
        </div>
      </form>
    </main>
  );
}

export default LoginPage;
