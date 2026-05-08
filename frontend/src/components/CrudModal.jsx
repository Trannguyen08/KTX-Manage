import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";

function CrudModal({ title, fields, item, onClose, onSave }) {
  const [form, setForm] = useState(item ?? {});

  useEffect(() => {
    setForm(item ?? {});
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <form
          className="modal-content border-0 shadow"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <div className="modal-header">
            <h2 className="modal-title fs-5">{title}</h2>
            <button className="btn btn-light btn-sm" type="button" onClick={onClose} aria-label="Đóng">
              <X size={18} />
            </button>
          </div>
          <div className="modal-body">
            <div className="row g-3">
              {fields.map(([key, label]) => (
                <div className="col-12 col-md-6" key={key}>
                  <label className="form-label fw-semibold">{label}</label>
                  {typeof form[key] === "boolean" ? (
                    <select
                      className="form-select"
                      value={form[key] ? "true" : "false"}
                      onChange={(event) => setForm({ ...form, [key]: event.target.value === "true" })}
                    >
                      <option value="true">Có</option>
                      <option value="false">Không</option>
                    </select>
                  ) : (
                    <input
                      className="form-control"
                      value={form[key] ?? ""}
                      onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" type="button" onClick={onClose}>
              Hủy
            </button>
            <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
              <Save size={16} />
              Lưu
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop show" />
    </div>
  );
}

export default CrudModal;
