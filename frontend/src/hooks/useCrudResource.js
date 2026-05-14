import { useEffect, useMemo, useState } from "react";

import { createResourceApi } from "../api/resourceApi.js";

export function useCrudResource(endpoint) {
  const api = useMemo(() => createResourceApi(endpoint), [endpoint]);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadItems() {
      setLoading(true);
      try {
        const data = await api.list();
        if (!ignore) {
          setItems(Array.isArray(data) ? data : data?.results ?? []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
          setItems([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      ignore = true;
    };
  }, [api]);

  async function reload() {
    setLoading(true);
    try {
      const data = await api.list();
      setItems(Array.isArray(data) ? data : data?.results ?? []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function save(form) {
    const savedItem = form.id ? await api.update(form.id, form) : await api.create(form);
    setItems((currentItems) =>
      form.id
        ? currentItems.map((item) => (item.id === savedItem.id ? savedItem : item))
        : [savedItem, ...currentItems]
    );
    setEditingItem(null);
  }

  async function remove(id) {
    await api.remove(id);
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  return {
    items,
    loading,
    error,
    editingItem,
    add: () => setEditingItem({}),
    edit: setEditingItem,
    close: () => setEditingItem(null),
    reload,
    save,
    remove,
  };
}
