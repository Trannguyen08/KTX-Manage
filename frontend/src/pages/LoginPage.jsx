import { Building2, ClipboardList, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { authApi } from "../api/authApi.js";

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ role: "admin", username: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      const user = await authApi.login(form);
      localStorage.setItem("auth_token", user.token);
      localStorage.setItem("auth_refresh", user.refresh);
      onLogin(user);
    } catch (err) {
      setError("Dang nhap that bai. Vui long kiem tra lai tai khoan va mat khau.");
      console.error(err);
    }
  }

  return (
    <main className="login-page">
      <form className="card login-card border-0 shadow" onSubmit={handleSubmit}>
        <div className="card-body p-4 p-md-5">
          <div className="brand-icon mx-auto mb-3">
            <Building2 size={24} />
          </div>
          <h1 className="h4 fw-bold text-center mb-2">Dang nhap tai khoan</h1>
          <p className="text-secondary text-center mb-4">Vui long nhap thong tin de tiep tuc he thong.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="mb-3">
            <label className="form-label fw-semibold">Vai tro</label>
            <select className="form-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
              <option value="admin">Quan tri vien</option>
              <option value="student">Sinh vien</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Email / Ma so</label>
            <input className="form-control" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="admin hoac MSSV" />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Mat khau</label>
            <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Nhap mat khau" />
          </div>
          <button className="btn btn-primary w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2" type="submit">
            <Lock size={16} />
            Dang nhap
          </button>
          <a className="d-block text-center text-decoration-none fw-semibold small mt-3" href="#forgot">
            Quen mat khau?
          </a>
          <Link className="btn btn-outline-primary w-100 fw-semibold d-inline-flex align-items-center justify-content-center gap-2 mt-3" to="/register">
            <ClipboardList size={16} />
            Dang ky ky tuc xa
          </Link>
        </div>
      </form>
    </main>
  );
}

export default LoginPage;
