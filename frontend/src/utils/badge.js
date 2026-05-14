export function getBadgeClass(value) {
  const text = String(value).toLowerCase();

  if (text.includes("active") || text === "resolved" || text === "success") {
    return "text-bg-success text-success bg-success-subtle border border-success-subtle";
  }

  if (text === "pending" || text === "in_progress" || text === "medium") {
    return "text-bg-warning text-warning bg-warning-subtle border border-warning-subtle";
  }

  if (text === "cancelled" || text === "severe" || text === "critical" || text === "urgent" || text === "high") {
    return "text-bg-danger text-danger bg-danger-subtle border border-danger-subtle";
  }

  if (text === "completed" || text === "light" || text === "low" || text === "draft") {
    return "text-bg-info text-info bg-info-subtle border border-info-subtle";
  }

  return "text-bg-primary text-primary bg-primary-subtle border border-primary-subtle";
}
