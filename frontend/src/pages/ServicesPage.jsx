import { Bell, FileDown, Wrench } from "lucide-react";

import CrudModal from "../components/CrudModal.jsx";
import DataTable from "../components/DataTable.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { formFields } from "../config/formFields.js";
import { serviceSeed } from "../data/mockData.js";
import { useCrudResource } from "../hooks/useCrudResource.js";

function ServicesPage() {
  const crud = useCrudResource("services", serviceSeed);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Dịch vụ & Tiện ích" subtitle="Quản lý danh mục, đơn giá và dịch vụ tính tiền sử dụng." actionLabel="Thêm dịch vụ mới" onAction={crud.add} />
      <StatGrid
        items={[
          { label: "Tổng dịch vụ", value: crud.items.length.toString().padStart(2, "0"), hint: "Đang vận hành", icon: Wrench },
          { label: "Doanh thu tháng này", value: "45.000.000", hint: "VNĐ", icon: FileDown },
          { label: "Dịch vụ bắt buộc", value: crud.items.filter((item) => item.required).length, hint: "Áp dụng tự động", icon: Bell },
        ]}
      />
      <section className="row g-3">
        {crud.items.map((item) => (
          <div className="col-12 col-sm-6 col-xl-3" key={item.id}>
            <article className="card h-100 border-0 shadow-sm">
              <div className="card-body d-grid gap-2">
                <div className="d-flex justify-content-between align-items-center">
                  <Wrench className="text-primary" size={22} />
                  <StatusBadge value="Active" />
                </div>
                <h2 className="h5 fw-bold mb-0">{item.name}</h2>
                <p className="text-secondary mb-2">{item.price} VNĐ / {item.unit}</p>
                <button className="btn btn-outline-secondary" onClick={() => crud.edit(item)} type="button">
                  Chỉnh sửa
                </button>
              </div>
            </article>
          </div>
        ))}
      </section>
      <DataTable
        columns={[
          { key: "name", label: "Tên dịch vụ" },
          { key: "required", label: "Bắt buộc" },
          { key: "price", label: "Đơn giá" },
          { key: "unit", label: "Đơn vị" },
          { key: "status", label: "Trạng thái", badge: true },
        ]}
        rows={crud.items}
        onEdit={crud.edit}
        onDelete={crud.remove}
      />
      <CrudModal title={crud.editingItem?.id ? "Sửa dịch vụ" : "Thêm dịch vụ"} fields={formFields.services} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default ServicesPage;
