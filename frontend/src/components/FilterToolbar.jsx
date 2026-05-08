import { Filter, Search } from "lucide-react";

function FilterToolbar({ placeholder }) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-lg">
            <div className="input-group">
              <span className="input-group-text bg-white">
                <Search size={16} />
              </span>
              <input className="form-control" placeholder={placeholder} />
            </div>
          </div>
          <div className="col-12 col-md-4 col-lg-2">
            <select className="form-select" defaultValue="">
              <option value="">Tất cả</option>
              <option>Hoạt động</option>
              <option>Chờ duyệt</option>
            </select>
          </div>
          <div className="col-12 col-md-auto">
            <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 w-100">
              <Filter size={16} />
              Lọc dữ liệu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterToolbar;
