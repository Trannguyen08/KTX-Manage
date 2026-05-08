import { Bell, Eye, Megaphone } from "lucide-react";

import CrudModal from "../components/CrudModal.jsx";
import DataTable from "../components/DataTable.jsx";
import FilterToolbar from "../components/FilterToolbar.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatGrid from "../components/StatGrid.jsx";
import { formFields } from "../config/formFields.js";
import { announcementSeed } from "../data/mockData.js";
import { useCrudResource } from "../hooks/useCrudResource.js";

function AnnouncementsPage() {
  const crud = useCrudResource("announcements", announcementSeed);

  return (
    <main className="d-grid gap-4">
      <PageHeader title="Quản lý Thông báo" subtitle="Tạo và quản lý thông báo gửi đến sinh viên và cán bộ nội trú." actionLabel="Tạo thông báo mới" onAction={crud.add} />
      <StatGrid
        items={[
          { label: "Tổng thông báo", value: crud.items.length, hint: "+5 tuần này", icon: Megaphone },
          { label: "Đang hiển thị", value: crud.items.filter((item) => item.status === "Đã đăng").length, hint: "Công khai", icon: Eye },
          { label: "Khẩn cấp", value: crud.items.filter((item) => item.urgent).length, hint: "Ưu tiên cao", icon: Bell },
        ]}
      />
      <FilterToolbar placeholder="Tìm kiếm tiêu đề thông báo..." />
      <DataTable
        columns={[
          { key: "title", label: "Tiêu đề thông báo" },
          { key: "audience", label: "Đối tượng" },
          { key: "createdAt", label: "Ngày tạo" },
          { key: "status", label: "Trạng thái", badge: true },
        ]}
        rows={crud.items}
        onEdit={crud.edit}
        onDelete={crud.remove}
      />
      <CrudModal title={crud.editingItem?.id ? "Sửa thông báo" : "Tạo thông báo"} fields={formFields.announcements} item={crud.editingItem} onClose={crud.close} onSave={crud.save} />
    </main>
  );
}

export default AnnouncementsPage;
