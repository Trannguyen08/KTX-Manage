import { Eye } from "lucide-react";
import { useState } from "react";

import CrudModal from "../components/CrudModal.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { useCrudResource } from "../hooks/useCrudResource.js";
import { httpClient } from "../api/httpClient.js";
import { includesSearch, normalizeSearchText } from "../utils/validation.js";

function RoomsPage() {
  const crud = useCrudResource("rooms");
  const [viewingRoom, setViewingRoom] = useState(null);
  const [roomStudents, setRoomStudents] = useState([]);
  const [search, setSearch] = useState("");

  const filteredRooms = crud.items.filter((room) => {
    const keyword = normalizeSearchText(search);
    if (!keyword) return true;
    return [room.code, room.room_type, room.building_name, room.floor_name, room.status]
      .some((value) => includesSearch(value, keyword));
  });

  const openRoomDetails = async (room) => {
    setViewingRoom(room);
    setRoomStudents([]);
    try {
      const data = await httpClient.get(`/students/?room=${room.id}`);
      setRoomStudents(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Ký túc xá" subtitle="Quản lý danh sách phòng, sức chứa và trạng thái sử dụng." actionLabel="Thêm phòng mới" onAction={crud.add} />
      <FilterToolbar placeholder="Tìm kiếm phòng..." value={search} onChange={setSearch} />
      <section className="row g-3">
        {filteredRooms.map((room) => {
          const ratio = Math.min(((room.current_occupancy || 0) / (room.capacity || 1)) * 100, 100);
          return (
            <div className="col-12 col-sm-6 col-xl-3" key={room.id}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body d-grid gap-3">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <strong className="fs-5">{room.code}</strong>
                    <StatusBadge value={room.status} />
                  </div>
                  <p className="text-secondary mb-0">
                    {room.building_name} · {room.floor_name} · {room.gender === "M" ? "Nam" : room.gender === "F" ? "Nữ" : "Cả hai"}
                  </p>
                  <div className="progress" role="progressbar" aria-valuenow={ratio} aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar" style={{ width: `${ratio}%` }} />
                  </div>
                  <small className="text-secondary">{room.current_occupancy || 0}/{room.capacity || 0} sinh viên · {Number(room.monthly_price).toLocaleString()} VNĐ</small>
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => openRoomDetails(room)} type="button">
                      <Eye size={16} />
                      Xem chi tiết
                    </button>
                    <button className="btn btn-outline-secondary flex-grow-1" onClick={() => crud.edit(room)} type="button">
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </section>

      {/* Room Details Modal */}
      {viewingRoom && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Chi tiết giường - Phòng {viewingRoom.code}</h5>
                <button className="btn-close" onClick={() => setViewingRoom(null)} type="button" />
              </div>
              <div className="modal-body">
                <div className="list-group list-group-flush">
                  {Array.from({ length: viewingRoom.capacity || 0 }).map((_, index) => {
                    const student = roomStudents[index];
                    return (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center px-0 py-3">
                        <div>
                          <strong className="d-block mb-1">Giường {index + 1}</strong>
                          {student ? (
                            <span className="text-dark">{student.full_name} ({student.student_code})</span>
                          ) : (
                            <span className="text-muted fst-italic">Trống</span>
                          )}
                        </div>
                        {student ? (
                          <span className="badge bg-success-subtle text-success">Đang ở</span>
                        ) : (
                          <span className="badge bg-secondary-subtle text-secondary">Trống</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setViewingRoom(null)} type="button">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CrudModal title={crud.editingItem?.id ? "Sửa phòng" : "Thêm phòng"} fields={formFields.rooms} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default RoomsPage;
