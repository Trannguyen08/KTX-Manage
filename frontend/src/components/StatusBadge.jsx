import { getBadgeClass } from "../utils/badge.js";

function StatusBadge({ value }) {
  return <span className={`badge rounded-pill ${getBadgeClass(value)}`}>{String(value)}</span>;
}

export default StatusBadge;
