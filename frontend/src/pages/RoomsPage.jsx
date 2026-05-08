import CrudModal from "../components/CrudModal.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { roomSeed } from "../data/mockData.js";
import { useCrudResource } from "../hooks/useCrudResource.js";

function RoomsPage() {
  const crud = useCrudResource("rooms", roomSeed);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Ký túc xá" subtitle="Quản lý danh sách phòng, sức chứa và trạng thái sử dụng." actionLabel="Thêm phòng mới" onAction={crud.add} />
      <FilterToolbar placeholder="Tìm kiếm phòng..." />
      <section className="row g-3">
        {crud.items.map((room) => {
          const ratio = Math.min((room.occupied / room.capacity) * 100, 100);
          return (
            <div className="col-12 col-sm-6 col-xl-3" key={room.id}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body d-grid gap-3">
                  <div className="d-flex align-items-center justify-content-between gap-2">
                    <strong className="fs-5">{room.code}</strong>
                    <StatusBadge value={room.status} />
                  </div>
                  <p className="text-secondary mb-0">{room.building} · {room.floor}</p>
                  <div className="progress" role="progressbar" aria-valuenow={ratio} aria-valuemin="0" aria-valuemax="100">
                    <div className="progress-bar" style={{ width: `${ratio}%` }} />
                  </div>
                  <small className="text-secondary">{room.occupied}/{room.capacity} sinh viên · {room.price} VNĐ</small>
                  <button className="btn btn-outline-secondary" onClick={() => crud.edit(room)} type="button">
                    Chỉnh sửa
                  </button>
                </div>
              </article>
            </div>
          );
        })}
      </section>
      <CrudModal title={crud.editingItem?.id ? "Sửa phòng" : "Thêm phòng"} fields={formFields.rooms} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default RoomsPage;
