import { Building2, DoorOpen, Edit3, Home } from "lucide-react";
import { useMemo } from "react";

import CrudModal from "../components/CrudModal.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { buildingSeed } from "../data/mockData.js";
import { useCrudResource } from "../hooks/useCrudResource.js";

function BuildingsPage() {
  const crud = useCrudResource("buildings", buildingSeed);
  const floors = useMemo(
    () =>
      crud.items.flatMap((building) =>
        Array.from({ length: Number(building.floors) || 0 }, (_, index) => ({
          id: `${building.id}-${index}`,
          name: `Tầng ${index + 1}`,
          building: building.name,
          rooms: Math.round((Number(building.rooms) || 0) / (Number(building.floors) || 1)),
        })),
      ),
    [crud.items],
  );

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Tòa & Tầng" subtitle="Theo dõi tòa nhà, số tầng, số phòng và trạng thái vận hành." actionLabel="Thêm tòa nhà" onAction={crud.add} />
      <StatGrid
        items={[
          { label: "Tòa nhà", value: crud.items.length, hint: "Đang quản lý", icon: Building2 },
          { label: "Tổng tầng", value: floors.length, hint: "Theo dữ liệu tòa", icon: Home },
          { label: "Tổng phòng", value: crud.items.reduce((sum, item) => sum + Number(item.rooms || 0), 0), hint: "Toàn hệ thống", icon: DoorOpen },
        ]}
      />
      <FilterToolbar placeholder="Tìm kiếm tòa nhà..." />
      <section className="row g-3">
        {crud.items.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body d-grid gap-3">
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h2 className="h5 fw-bold mb-0">{item.name}</h2>
                  <StatusBadge value={item.status} />
                </div>
                <p className="text-secondary mb-0">{item.address} · {item.manager}</p>
                <strong>{item.floors} tầng · {item.rooms} phòng</strong>
                <button className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-2" onClick={() => crud.edit(item)} type="button">
                  <Edit3 size={16} />
                  Chỉnh sửa
                </button>
              </div>
            </article>
          </div>
        ))}
      </section>
      <section className="card border-0 shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-bold mb-3">Danh sách tầng</h2>
          <DataTable columns={[{ key: "name", label: "Tầng" }, { key: "building", label: "Tòa nhà" }, { key: "rooms", label: "Số phòng" }]} rows={floors} onEdit={() => {}} onDelete={() => {}} />
        </div>
      </section>
      <CrudModal title={crud.editingItem?.id ? "Sửa tòa nhà" : "Thêm tòa nhà"} fields={formFields.buildings} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default BuildingsPage;
