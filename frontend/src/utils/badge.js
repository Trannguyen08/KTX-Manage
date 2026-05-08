export function getBadgeClass(value) {
  const text = String(value);

  if (text.includes("Hoạt") || text.includes("Còn") || text.includes("Đang") || text === "Active") {
    return "text-bg-success";
  }

  if (text.includes("Chờ") || text.includes("Bản")) {
    return "text-bg-warning";
  }

  if (text.includes("Bảo") || text.includes("rời")) {
    return "text-bg-secondary";
  }

  return "text-bg-primary";
}
