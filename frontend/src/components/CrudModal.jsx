import { Save, X } from "lucide-react";
import { useEffect, useState } from "react";

import { STUDENT_CODE_PATTERN, VN_PHONE_PATTERN, adultMaxBirthDate, blockInvalidNumberKey } from "../utils/validation.js";

const fieldRules = {
  email: { type: "email" },
  phone: { type: "tel", inputMode: "tel", pattern: VN_PHONE_PATTERN, title: "Số điện thoại VN, ví dụ 0912345678 hoặc +84912345678" },
  date_of_birth: { type: "date", max: adultMaxBirthDate(), title: "Ngày sinh phải đủ từ 18 tuổi trở lên" },
  registered_at: { type: "date" },
  expiry_date: { type: "date" },
  due_date: { type: "date", min: new Date().toISOString().slice(0, 10) },
  student_code: { pattern: STUDENT_CODE_PATTERN, title: "MSSV dài 4-30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang" },
  month: { type: "number", min: 1, max: 12, step: 1 },
  year: { type: "number", min: 2000, step: 1 },
  floor: { type: "number", min: 1, step: 1 },
  room: { type: "number", min: 1, step: 1 },
  student: { type: "number", min: 1, step: 1 },
  capacity: { type: "number", min: 1, step: 1 },
  current_occupancy: { type: "number", min: 0, step: 1 },
  monthly_price: { type: "number", min: 0, step: 1000 },
  price: { type: "number", min: 0, step: 1000 },
  electricity_reading: { type: "number", min: 0, step: 0.1 },
  water_reading: { type: "number", min: 0, step: 0.1 },
};

function inputRulesFor(key) {
  if (fieldRules[key]) return fieldRules[key];
  if (key.includes("date")) return { type: "date" };
  if (key.endsWith("_id") || key.includes("count")) return { type: "number", min: 0, step: 1 };
  return { type: "text" };
}

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
                  {typeof form[key] === "boolean" || key.startsWith("is_") ? (
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
                      {...inputRulesFor(key)}
                      onKeyDown={inputRulesFor(key).type === "number" ? blockInvalidNumberKey : undefined}
                      required
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
