import { Camera, Check, ChevronLeft, ChevronRight, CreditCard, LogIn, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { registrationApi } from "../api/registrationApi.js";
import { STUDENT_CODE_PATTERN, VN_IDENTITY_PATTERN, VN_PHONE_PATTERN, adultMaxBirthDate, includesSearch, normalizeSearchText, validateRegistrationForm } from "../utils/validation.js";

const initialForm = {
  full_name: "",
  identity_number: "",
  date_of_birth: "",
  gender: "",
  phone: "",
  student_code: "",
  faculty: "",
  department: "",
  class_name: "",
  education_type: "",
  permanent_address: "",
  email: "",
  guardian_name: "",
  guardian_relationship: "",
  guardian_phone: "",
  guardian_address: "",
};

const FACULTIES = [
  ["", "Chọn khoa"],
  ["CNTT", "Công nghệ thông tin"],
  ["DDT", "Điện - Điện tử"],
  ["CK", "Cơ khí"],
  ["XD", "Xây dựng"],
  ["KT", "Kinh tế"],
  ["NN", "Ngoại ngữ"],
];

const DEPARTMENTS = {
  CNTT: [["", "Chọn ngành"], ["KTPM", "Kỹ thuật phần mềm"], ["KHMT", "Khoa học máy tính"], ["HTTT", "Hệ thống thông tin"]],
  DDT: [["", "Chọn ngành"], ["TDH", "Tự động hóa"], ["DDT", "Điện tử viễn thông"]],
  CK: [["", "Chọn ngành"], ["CKM", "Cơ khí máy"], ["OTO", "Công nghệ ô tô"]],
  XD: [["", "Chọn ngành"], ["XDD", "Xây dựng dân dụng"], ["XDC", "Xây dựng cầu đường"]],
  KT: [["", "Chọn ngành"], ["QTKD", "Quản trị kinh doanh"], ["KT", "Kế toán"], ["TCNH", "Tài chính ngân hàng"]],
  NN: [["", "Chọn ngành"], ["NNA", "Ngôn ngữ Anh"], ["NNH", "Ngôn ngữ Hàn"], ["NNT", "Ngôn ngữ Trung"]],
};

const REGISTRATION_FEE = 3000;

function useSessionState(key, initialValue) {
  const [state, setState] = useState(() => {
    const saved = sessionStorage.getItem(key);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialValue;
      }
    }
    return initialValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function RegistrationPage() {
  const navigate = useNavigate();
  const { stepParam } = useParams();
  const step = parseInt(stepParam?.replace("step", "")) || 1;

  const [form, setForm] = useSessionState("register_form", initialForm);
  const [roomOptions, setRoomOptions] = useState([]);
  
  const [selectedBuildingId, setSelectedBuildingId] = useSessionState("register_building", null);
  const [selectedFloorId, setSelectedFloorId] = useSessionState("register_floor", null);
  const [selectedRoom, setSelectedRoom] = useSessionState("register_room", null);
  const [selectedBed, setSelectedBed] = useSessionState("register_bed", "");
  
  const [filters, setFilters] = useState({ search: "", onlyAvailable: true, roomType: "" });
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadRoomOptions() {
      try {
        const data = await registrationApi.roomOptions();
        if (!ignore) {
          setRoomOptions(Array.isArray(data) ? data : []);
          if (Array.isArray(data) && data.length > 0) {
            setSelectedBuildingId((current) => current ?? data[0].id);
            setSelectedFloorId((current) => current ?? data[0].floors[0]?.id ?? null);
          }
        }
      } catch (error) {
        if (!ignore) setMessage(`Không tải được danh sách phòng: ${error.message}`);
      }
    }

    loadRoomOptions();

    return () => {
      ignore = true;
    };
  }, []);

  const selectedBuilding = roomOptions.find((building) => building.id === selectedBuildingId) ?? roomOptions[0];
  const selectedFloor = selectedBuilding?.floors.find((floor) => floor.id === selectedFloorId) ?? selectedBuilding?.floors[0];
  const rooms = useMemo(() => {
    const term = normalizeSearchText(filters.search.trim());
    return (selectedFloor?.rooms ?? []).filter((room) => {
      const matchSearch = !term || includesSearch(room.code, term) || includesSearch(room.room_type, term);
      // Availability filtering (Hide full rooms)
      const matchAvailable = room.available_slots > 0;
      
      // Status filtering (Hide maintenance and inactive rooms)
      const matchStatus = room.status !== "maintenance" && room.status !== "inactive";
      
      const matchType = !filters.roomType || room.room_type === filters.roomType;
      
      // Gender filtering
      const userGender = form.gender;
      const roomGender = room.gender; // male, female, all
      const matchGender = roomGender === "all" || roomGender === userGender;
      
      return matchSearch && matchAvailable && matchStatus && matchType && matchGender;
    });
  }, [filters, selectedFloor]);
  const roomTypes = Array.from(new Set((selectedFloor?.rooms ?? []).map((room) => room.room_type)));

  async function createPayment() {
    const validationMessage = validateRegistrationForm(form);
    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }
    if (!selectedRoom) {
      setMessage("Vui lòng chọn phòng trước khi thanh toán.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      // Build a clean registration payload with only model fields
      const registration = {
        full_name: form.full_name,
        identity_number: form.identity_number,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender,
        phone: form.phone,
        student_code: form.student_code,
        faculty: form.faculty,
        department: form.department,
        class_name: form.class_name,
        education_type: form.education_type,
        permanent_address: form.permanent_address,
        email: form.email,
        guardian_name: form.guardian_name,
        guardian_relationship: form.guardian_relationship,
        guardian_phone: form.guardian_phone,
        guardian_address: form.guardian_address,
        portrait_url: form.portrait_url || "",
        // Always send integer pk, not object
        selected_room: typeof selectedRoom === "object" ? Number(selectedRoom.id) : Number(selectedRoom),
        selected_bed: selectedBed,
      };
      const payload = { registration, amount: REGISTRATION_FEE };
      const data = await registrationApi.createPayment(payload);
      window.location.href = data.checkout_url;
    } catch (error) {
      setMessage(error.message || "Không thể tạo link thanh toán PayOS. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="registration-shell">
      <section className="registration-card card border-0 shadow">
        <div className="registration-header text-white">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1 className="h4 fw-bold mb-1">Đăng ký nội trú</h1>
              <p className="small text-white-50 mb-0">Điền thông tin, chọn phòng và thanh toán phí đăng ký.</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <Link className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-2" to="/login">
                <LogIn size={15} />
                Đăng nhập
              </Link>
              <span className="badge text-bg-primary">Bước {step} / 3</span>
            </div>
          </div>
          <RegistrationProgress step={step} />
        </div>

        <div className="card-body p-0">
          {step === 1 && <InfoStep form={form} uploadingPortrait={uploadingPortrait} setForm={setForm} setMessage={setMessage} setUploadingPortrait={setUploadingPortrait} onNext={() => navigate("/register/step2")} />}
          {step === 2 && (
            <RoomStep
              buildings={roomOptions}
              filters={filters}
              message={message}
              roomTypes={roomTypes}
              rooms={rooms}
              selectedBed={selectedBed}
              selectedBuilding={selectedBuilding}
              selectedBuildingId={selectedBuildingId}
              selectedFloor={selectedFloor}
              selectedFloorId={selectedFloorId}
              selectedRoom={selectedRoom}
              setFilters={setFilters}
              setSelectedBed={setSelectedBed}
              setSelectedBuildingId={(buildingId) => {
                const building = roomOptions.find((item) => item.id === buildingId);
                setSelectedBuildingId(buildingId);
                setSelectedFloorId(building?.floors[0]?.id);
                setSelectedRoom(null);
                setSelectedBed("");
              }}
              setSelectedFloorId={(floorId) => {
                setSelectedFloorId(floorId);
                setSelectedRoom(null);
                setSelectedBed("");
              }}
              setSelectedRoom={setSelectedRoom}
              onBack={() => navigate("/register/step1")}
              onNext={() => (selectedRoom ? navigate("/register/step3") : setMessage("Vui lòng chọn phòng và giường trước khi tiếp tục."))}
            />
          )}
          {step === 3 && (
            <PaymentConfirmStep
              form={form}
              message={message}
              room={selectedRoom}
              selectedBed={selectedBed}
              submitting={submitting}
              onBack={() => navigate("/register/step2")}
              onPay={createPayment}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function RegistrationProgress({ step }) {
  const items = ["Thông tin cá nhân", "Chọn phòng & giường", "Xác nhận thanh toán"];
  return (
    <div className="registration-progress">
      {items.map((item, index) => {
        const current = index + 1;
        const active = current <= step;
        return (
          <div className={`registration-progress-item ${active ? "active" : ""}`} key={item}>
            <span>{active && current < step ? <Check size={14} /> : current}</span>
            <small>{item}</small>
          </div>
        );
      })}
    </div>
  );
}

function InfoStep({ form, uploadingPortrait, setForm, setMessage, setUploadingPortrait, onNext }) {
  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handlePortraitChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingPortrait(true);
    try {
      const result = await registrationApi.uploadPortrait(file);
      update("portrait_url", result.portrait_url);
    } catch {
      alert("Không thể tải ảnh lên. Vui lòng thử lại.");
    } finally {
      setUploadingPortrait(false);
    }
  }

  return (
    <form className="p-4 p-lg-5" onSubmit={(event) => {
      event.preventDefault();
      const validationMessage = validateRegistrationForm(form);
      if (validationMessage) {
        setMessage(validationMessage);
        alert(validationMessage);
        return;
      }
      setMessage("");
      onNext();
    }}>
      <SectionTitle number="1" title="Thông tin cá nhân" />
      <div className="row g-3 mb-4">
        <TextField className="col-md-4" label="Họ và tên" value={form.full_name} onChange={(value) => update("full_name", value)} required />
        <TextField className="col-md-4" label="Ngày sinh" type="date" max={adultMaxBirthDate()} title="Ngày sinh phải đủ từ 18 tuổi trở lên" value={form.date_of_birth} onChange={(value) => update("date_of_birth", value)} required />
        <div className="col-md-4 row-span-2">
          <label className="form-label fw-semibold">Ảnh chân dung</label>
          <div className="upload-box position-relative">
            {form.portrait_url ? (
              <>
                <img src={form.portrait_url} alt="Ảnh chân dung" className="rounded mb-2" style={{ maxHeight: 80, maxWidth: "100%", objectFit: "cover" }} />
                <small className="text-success d-block">✅ Đã tải lên thành công</small>
              </>
            ) : (
              <Camera size={24} />
            )}
            <label className={`btn btn-sm ${form.portrait_url ? "btn-outline-secondary" : "btn-outline-primary"} mb-0 mt-1`}>
              {uploadingPortrait ? "Đang tải..." : form.portrait_url ? "Đổi ảnh" : "Tải ảnh lên"}
              <input accept="image/*" hidden type="file" disabled={uploadingPortrait} onChange={handlePortraitChange} />
            </label>
            {!form.portrait_url && <small className="d-block mt-1">JPG hoặc PNG</small>}
          </div>
        </div>
        <SelectField className="col-md-4" label="Giới tính" value={form.gender} onChange={(value) => update("gender", value)} options={[["", "Chọn giới tính"], ["male", "Nam"], ["female", "Nữ"], ["other", "Khác"]]} />
        <TextField className="col-md-4" label="Số CMND/CCCD" inputMode="numeric" maxLength={12} pattern={VN_IDENTITY_PATTERN} title="CMND/CCCD phải gồm 9 hoặc 12 chữ số" value={form.identity_number} onChange={(value) => update("identity_number", value.replace(/\D/g, "").slice(0, 12))} required />
        <TextField className="col-md-3" label="Mã số sinh viên" pattern={STUDENT_CODE_PATTERN} title="MSSV dài 4-30 ký tự, chỉ gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang" value={form.student_code} onChange={(value) => update("student_code", value)} required />
        <SelectField className="col-md-3" label="Khoa" value={form.faculty} onChange={(value) => { update("faculty", value); update("department", ""); }} options={FACULTIES} />
        <SelectField className="col-md-3" label="Ngành" value={form.department} onChange={(value) => update("department", value)} options={DEPARTMENTS[form.faculty] || [["", "Chọn khoa trước"]]} />
        <TextField className="col-md-3" label="Lớp" value={form.class_name} onChange={(value) => update("class_name", value)} />
        <SelectField className="col-md-6" label="Hệ đào tạo" value={form.education_type} onChange={(value) => update("education_type", value)} options={[["", "Chọn hệ đào tạo"], ["university", "Đại học"], ["college", "Cao đẳng"], ["vocational", "Trung cấp"]]} />
        <TextField className="col-md-6" label="Địa chỉ thường trú" placeholder="Số nhà, đường, xã/phường, quận/huyện, tỉnh/thành" value={form.permanent_address} onChange={(value) => update("permanent_address", value)} />
      </div>

      <SectionTitle number="2" title="Thông tin liên lạc" />
      <div className="row g-3 mb-4">
        <TextField className="col-md-6" label="Số điện thoại cá nhân" inputMode="tel" pattern={VN_PHONE_PATTERN} title="Số điện thoại VN, ví dụ 0912345678 hoặc +84912345678" value={form.phone} onChange={(value) => update("phone", value.replace(/[^\d+]/g, ""))} required />
        <TextField className="col-md-6" label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
      </div>

      <SectionTitle number="3" title="Thông tin liên hệ khẩn cấp" />
      <div className="row g-3">
        <TextField className="col-md-6" label="Họ tên người thân" value={form.guardian_name} onChange={(value) => update("guardian_name", value)} />
        <TextField className="col-md-6" label="Mối quan hệ" value={form.guardian_relationship} onChange={(value) => update("guardian_relationship", value)} />
        <TextField className="col-md-6" label="Số điện thoại người thân" inputMode="tel" pattern={VN_PHONE_PATTERN} title="Số điện thoại VN, ví dụ 0912345678 hoặc +84912345678" value={form.guardian_phone} onChange={(value) => update("guardian_phone", value.replace(/[^\d+]/g, ""))} />
        <TextField className="col-md-6" label="Địa chỉ người thân" value={form.guardian_address} onChange={(value) => update("guardian_address", value)} />
      </div>

      <div className="d-flex justify-content-end mt-4">
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" type="submit">
          Tiếp tục
          <ChevronRight size={16} />
        </button>
      </div>
    </form>
  );
}

function RoomStep(props) {
  const {
    buildings, filters, message, roomTypes, rooms, selectedBed, selectedBuilding, selectedBuildingId, selectedFloor,
    selectedFloorId, selectedRoom, setFilters, setSelectedBed, setSelectedBuildingId, setSelectedFloorId,
    setSelectedRoom, onBack, onNext,
  } = props;

  return (
    <div className="room-selection">
      <aside className="room-filter-panel">
        <h2 className="h6 fw-bold mb-3">Tòa nhà</h2>
        <div className="row g-2 mb-4">
          {buildings.map((building) => (
            <div className="col-6" key={building.id}>
              <button className={`btn w-100 ${selectedBuildingId === building.id ? "btn-primary" : "btn-light"}`} onClick={() => setSelectedBuildingId(building.id)} type="button">
                {building.name}
              </button>
            </div>
          ))}
        </div>

        <h2 className="h6 fw-bold mb-3">Tầng</h2>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {(selectedBuilding?.floors ?? []).map((floor) => (
            <button className={`btn btn-sm ${selectedFloorId === floor.id ? "btn-primary" : "btn-light"}`} key={floor.id} onClick={() => setSelectedFloorId(floor.id)} type="button">
              {floor.number}
            </button>
          ))}
        </div>

        <h2 className="h6 fw-bold mb-3">Bộ lọc phòng</h2>
        <div className="input-group mb-2">
          <span className="input-group-text bg-white"><Search size={15} /></span>
          <input className="form-control" placeholder="Tìm mã phòng..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
        </div>
        <select className="form-select mb-2" value={filters.roomType} onChange={(event) => setFilters({ ...filters, roomType: event.target.value })}>
          <option value="">Tất cả loại phòng</option>
          {roomTypes.map((type) => <option key={type}>{type}</option>)}
        </select>


        <div className="card bg-primary-subtle border-0">
          <div className="card-body">
            <p className="small text-secondary mb-1">Giá thuê</p>
            <strong className="fs-4">{formatCurrency(selectedRoom?.monthly_price ?? selectedFloor?.rooms?.[0]?.monthly_price ?? 0)}</strong>
            <small className="d-block text-secondary">Mỗi học kỳ / 6 tháng</small>
          </div>
        </div>
      </aside>

      <section className="room-list-panel">
        <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-3">
          <div>
            <h2 className="h5 fw-bold mb-1">Danh sách phòng - {selectedBuilding?.name} / {selectedFloor?.name}</h2>
            <p className="text-secondary small mb-0">Chọn phòng và giường còn trống trong khung bên dưới.</p>
          </div>
          <span className="badge rounded-pill text-bg-light align-self-md-start">Phòng tối đa 4 sinh viên</span>
        </div>

        <div className="room-scroll">
          <div className="row g-3">
            {rooms.map((room) => (
              <div className="col-12 col-xl-6" key={room.id}>
                <RoomCard room={room} selectedBed={selectedBed} selectedRoom={selectedRoom} setSelectedBed={setSelectedBed} setSelectedRoom={setSelectedRoom} />
              </div>
            ))}
            {rooms.length === 0 && <div className="text-center text-secondary py-5">Không tìm thấy phòng phù hợp.</div>}
          </div>
        </div>
        {message && <div className="alert alert-info mt-3 mb-0">{message}</div>}
      </section>

      <footer className="registration-footer">
        <button className="btn btn-outline-light d-inline-flex align-items-center gap-2" onClick={onBack} type="button">
          <ChevronLeft size={16} />
          Quay lại
        </button>
        <div className="text-white-50 small text-center">
          Đang chọn
          <strong className="text-white d-block">{selectedRoom ? `${selectedRoom.code}${selectedBed ? ` - ${selectedBed}` : ""}` : "Chưa chọn phòng"}</strong>
        </div>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" onClick={onNext} type="button">
          Tiếp tục
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}

function PaymentConfirmStep({ form, message, room, selectedBed, submitting, onBack, onPay }) {
  return (
    <div className="p-4 p-lg-5">
      <SectionTitle number="3" title="Xác nhận thanh toán" />
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card border-0 bg-light">
            <div className="card-body">
              <h2 className="h5 fw-bold mb-3">Thông tin đăng ký</h2>
              <InfoRow label="Họ tên" value={form.full_name} />
              <InfoRow label="MSSV" value={form.student_code} />
              <InfoRow label="Email" value={form.email} />
              <InfoRow label="Địa chỉ" value={form.permanent_address} />
              <InfoRow label="Phòng" value={`${room?.code ?? ""} - ${selectedBed}`} />
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card border-primary shadow-sm">
            <div className="card-body">
              <p className="text-secondary mb-1">Phí đăng ký giữ chỗ</p>
              <strong className="display-6 fw-bold">{formatCurrency(REGISTRATION_FEE)}</strong>
              <p className="text-secondary small mt-3 mb-0">Sau khi thanh toán thành công, hồ sơ sẽ chuyển sang trạng thái chờ admin duyệt.</p>
            </div>
          </div>
        </div>
      </div>
      {message && <div className="alert alert-info mt-4">{message}</div>}
      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2" onClick={onBack} type="button">
          <ChevronLeft size={16} />
          Quay lại
        </button>
        <button className="btn btn-primary d-inline-flex align-items-center gap-2" disabled={submitting} onClick={onPay} type="button">
          <CreditCard size={16} />
          {submitting ? "Đang tạo link..." : "Xác nhận thanh toán"}
        </button>
      </div>
    </div>
  );
}

function RoomCard({ room, selectedRoom, selectedBed, setSelectedRoom, setSelectedBed }) {
  const isFull = room.available_slots <= 0;
  const selected = selectedRoom?.id === room.id;
  const beds = Array.from({ length: Number(room.capacity) || 4 }, (_, index) => {
    const occupied = index < Number(room.current_occupancy || 0);
    return { label: `G${index + 1}`, occupied };
  });

  return (
    <article className={`card h-100 ${selected ? "border-primary shadow-sm" : "border-0 shadow-sm"} ${isFull ? "opacity-75" : ""}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
          <div>
            <h3 className="h5 fw-bold mb-1">{room.code}</h3>
            <div className="d-flex gap-2 align-items-center">
              <p className="text-secondary small mb-0">{room.room_type}</p>
              <span className="badge bg-info-subtle text-info border border-info-subtle small">
                {room.gender === "male" ? "Nam" : room.gender === "female" ? "Nữ" : "Cả hai"}
              </span>
            </div>
          </div>
          <span className={`badge rounded-pill ${isFull ? "text-bg-secondary" : "text-bg-success"}`}>{isFull ? "Hết chỗ" : `Còn ${room.available_slots} chỗ`}</span>
        </div>
        <div className="row g-2">
          {beds.map((bed) => {
            const bedSelected = selected && selectedBed === bed.label;
            return (
              <div className="col-3" key={bed.label}>
                <button
                  className={`bed-btn btn w-100 ${
                    bed.occupied
                      ? "btn-success disabled border-success text-white"
                      : bedSelected
                      ? "btn-primary shadow"
                      : "btn-light border-secondary-subtle"
                  }`}
                  disabled={bed.occupied || isFull}
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedBed(bed.label);
                  }}
                  style={!bed.occupied && !bedSelected ? { backgroundColor: "#fff" } : {}}
                  type="button"
                >
                  <UserRound size={16} />
                  <small>{bed.label}</small>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function SectionTitle({ number, title }) {
  return (
    <div className="d-flex align-items-center gap-2 border-bottom pb-2 mb-3">
      <span className="badge text-bg-primary">{number}</span>
      <h2 className="h6 fw-bold mb-0">{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="d-flex justify-content-between gap-3 border-bottom py-2">
      <span className="text-secondary">{label}</span>
      <strong className="text-end">{value || "-"}</strong>
    </div>
  );
}

function TextField({ className, label, type = "text", value, onChange, required = false, ...inputProps }) {
  return (
    <div className={className}>
      <label className="form-label fw-semibold">{label}</label>
      <input className="form-control" required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} {...inputProps} />
    </div>
  );
}

function SelectField({ className, label, value, options, onChange }) {
  return (
    <div className={className}>
      <label className="form-label fw-semibold">{label}</label>
      <select className="form-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => <option key={optionValue} value={optionValue}>{labelText}</option>)}
      </select>
    </div>
  );
}

function normalizeRegistrationPayload(payload) {
  return {
    ...payload,
    date_of_birth: payload.date_of_birth || null,
  };
}

function formatCurrency(value) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(number);
}

export default RegistrationPage;
