import { Plus } from "lucide-react";

function PageHeader({ title, subtitle, actionLabel, onAction }) {
  return (
    <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-3">
      <div>
        <h1 className="h3 fw-bold text-dark mb-1">{title}</h1>
        <p className="text-secondary mb-0">{subtitle}</p>
      </div>
      {actionLabel && (
        <button className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2" onClick={onAction}>
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
