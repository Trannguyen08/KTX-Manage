export function saveItem(form, items) {
  if (form.id) {
    return items.map((item) => (item.id === form.id ? form : item));
  }

  return [{ ...form, id: Date.now() }, ...items];
}

export function removeItem(id, items) {
  return items.filter((item) => item.id !== id);
}
