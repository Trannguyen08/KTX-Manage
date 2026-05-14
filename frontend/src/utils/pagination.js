export const PAGE_SIZE = 10;

export function pageCount(total, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampPage(page, total, pageSize = PAGE_SIZE) {
  return Math.min(Math.max(1, page), pageCount(total, pageSize));
}
