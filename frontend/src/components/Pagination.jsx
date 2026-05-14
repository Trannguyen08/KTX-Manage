import { ChevronLeft, ChevronRight } from "lucide-react";

import { PAGE_SIZE, pageCount } from "../utils/pagination.js";

function Pagination({ total, page, onPageChange, pageSize = PAGE_SIZE }) {
  const totalPages = pageCount(total, pageSize);
  if (total <= pageSize) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2 border-top px-3 py-2">
      <small className="text-secondary">Hiển thị {start}-{end} / {total}</small>
      <div className="btn-group btn-group-sm" role="group" aria-label="Phân trang">
        <button className="btn btn-outline-secondary" type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            className={`btn ${pageNumber === page ? "btn-primary" : "btn-outline-secondary"}`}
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button className="btn btn-outline-secondary" type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
