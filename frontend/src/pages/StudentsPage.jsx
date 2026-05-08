import { Bell, DoorOpen, FileDown, Users } from "lucide-react";

import CrudModal from "../components/CrudModal.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { formFields } from "../config/formFields.js";
import { studentSeed } from "../data/mockData.js";
import { useCrudResource } from "../hooks/useCrudResource.js";

function StudentsPage() {
  const crud = useCrudResource("students", studentSeed);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Sinh viên" subtitle="Quản lý hồ sơ cư trú, phân phòng và tình trạng sinh viên." actionLabel="Thêm sinh viên" onAction={crud.add} />
      <StatGrid
        items={[
          { label: "Tổng sinh viên", value: "1,284", hint: "+12%", icon: Users },
          { label: "Phòng đã thuê", value: "320/380", hint: "85% công suất", icon: DoorOpen },
          { label: "Đơn chờ duyệt", value: "18", hint: "Cần xử lý", icon: Bell },
          { label: "Hóa đơn quá hạn", value: "42", hint: "Theo dõi", icon: FileDown },
        ]}
      />
      <FilterToolbar placeholder="Ví dụ: SV12345..." />
      <DataTable
        columns={[
          { key: "code", label: "MSSV" },
          { key: "name", label: "Sinh viên" },
          { key: "room", label: "Phòng" },
          { key: "building", label: "Tòa nhà" },
          { key: "registeredAt", label: "Ngày đăng ký" },
          { key: "status", label: "Trạng thái", badge: true },
        ]}
        rows={crud.items}
        onEdit={crud.edit}
        onDelete={crud.remove}
      />
      <CrudModal title={crud.editingItem?.id ? "Sửa sinh viên" : "Thêm sinh viên"} fields={formFields.students} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default StudentsPage;
