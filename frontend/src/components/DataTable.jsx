import { Edit3, Eye, Trash2 } from "lucide-react";

import StatusBadge from "./StatusBadge.jsx";

function DataTable({ columns, rows, onEdit, onDelete }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              {columns.map((column) => (
                <th className="text-uppercase small text-secondary" key={column.key}>
                  {column.label}
                </th>
              ))}
              <th className="text-uppercase small text-secondary">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {columns.map((column) => {
                  const value = column.key.split(".").reduce((obj, key) => obj?.[key], row);
                  return (
                    <td key={column.key}>
                      {column.badge ? <StatusBadge value={value} /> : String(value ?? "")}
                    </td>
                  );
                })}
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-light btn-sm" type="button" aria-label="Xem">
                      <Eye size={16} />
                    </button>
                    <button className="btn btn-light btn-sm" type="button" onClick={() => onEdit(row)} aria-label="Sửa">
                      <Edit3 size={16} />
                    </button>
                    <button className="btn btn-light btn-sm text-danger" type="button" onClick={() => onDelete(row.id)} aria-label="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
