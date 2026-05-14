import { Building2, DoorOpen, Edit3, Eye, Home, X } from "lucide-react";
import { useMemo, useState } from "react";

import CrudModal from "../components/CrudModal.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { useCrudResource } from "../hooks/useCrudResource.js";
import { httpClient } from "../api/httpClient.js";
import { includesSearch, normalizeSearchText } from "../utils/validation.js";

function BuildingsPage() {
  const crud = useCrudResource("buildings");
  const [viewingBuilding, setViewingBuilding] = useState(null);
  const [buildingFloors, setBuildingFloors] = useState([]);
  const [search, setSearch] = useState("");

  const filteredBuildings = useMemo(() => {
    const keyword = normalizeSearchText(search);
    if (!keyword) return crud.items;
    return crud.items.filter((item) => [item.name, item.code, item.address, item.manager_name]
      .some((value) => includesSearch(value, keyword)));
  }, [crud.items, search]);

  const openBuildingDetails = async (building) => {
    setViewingBuilding(building);
    setBuildingFloors([]);
    try {
      const data = await httpClient.get(`/floors/?building=${building.id}`);
      // In case data has a results key (pagination)
      setBuildingFloors(data.results || data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Tòa nhà" subtitle="Theo dõi tòa nhà, số tầng, số phòng và trạng thái vận hành." actionLabel="Thêm tòa nhà" onAction={crud.add} />
      <StatGrid
        items={[
          { label: "Tòa nhà", value: crud.items.length, hint: "Đang quản lý", icon: Building2 },
          { label: "Tổng phòng", value: crud.items.reduce((sum, item) => sum + Number(item.room_count || 0), 0), hint: "Toàn hệ thống", icon: DoorOpen },
        ]}
      />
      <FilterToolbar placeholder="Tìm kiếm tòa nhà..." value={search} onChange={setSearch} />
      <section className="row g-3">
        {filteredBuildings.map((item) => (
          <div className="col-12 col-md-6 col-xl-4" key={item.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body d-grid gap-3">
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h2 className="h5 fw-bold mb-0">{item.name}</h2>
                  <StatusBadge value={item.is_active ? "Hoạt động" : "Bảo trì"} />
                </div>
                <p className="text-secondary mb-0">{item.address} · {item.manager_name}</p>
                <strong>{item.floor_count} tầng · {item.room_count} phòng</strong>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => openBuildingDetails(item)} type="button">
                    <Eye size={16} />
                    Xem chi tiết
                  </button>
                  <button className="btn btn-outline-secondary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2" onClick={() => crud.edit(item)} type="button">
                    <Edit3 size={16} />
                    Chỉnh sửa
                  </button>
                </div>
              </div>
            </article>
          </div>
        ))}
      </section>

      {/* Building Details Modal */}
      {viewingBuilding && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold">Chi tiết tòa {viewingBuilding.name}</h5>
                <button className="btn-close" onClick={() => setViewingBuilding(null)} type="button" />
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Tầng</th>
                        <th>Số phòng</th>
                        <th>Sinh viên</th>
                        <th>Phòng Nam</th>
                        <th>Phòng Nữ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildingFloors.length === 0 ? (
                        <tr><td colSpan="5" className="text-center text-muted">Đang tải dữ liệu...</td></tr>
                      ) : (
                        buildingFloors.map(floor => (
                          <tr key={floor.id}>
                            <td className="fw-medium">{floor.name}</td>
                            <td>{floor.room_count} phòng</td>
                            <td>{floor.student_count} SV</td>
                            <td>{floor.male_room_count}</td>
                            <td>{floor.female_room_count}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button className="btn btn-secondary" onClick={() => setViewingBuilding(null)} type="button">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CrudModal title={crud.editingItem?.id ? "Sửa tòa nhà" : "Thêm tòa nhà"} fields={formFields.buildings} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default BuildingsPage;
