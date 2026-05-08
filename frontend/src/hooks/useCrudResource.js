import { useEffect, useMemo, useState } from "react";

import { createResourceApi } from "../api/resourceApi.js";
import { removeItem, saveItem } from "../utils/crud.js";

export function useCrudResource(endpoint, fallbackData) {
  const api = useMemo(() => createResourceApi(endpoint), [endpoint]);
  const [items, setItems] = useState(fallbackData);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadItems() {
      setLoading(true);
      try {
        const data = await api.list();
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message);
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

  async function save(form) {
    try {
      if (form.id) {
        await api.update(form.id, form);
      } else {
        await api.create(form);
      }
    } catch {
      // UI keeps working with local fallback data while the API contract is completed.
    }

    setItems((currentItems) => saveItem(form, currentItems));
    setEditingItem(null);
  }

  async function remove(id) {
    try {
      await api.remove(id);
    } catch {
      // Local fallback keeps the screen responsive if backend is offline.
    }

    setItems((currentItems) => removeItem(id, currentItems));
  }

  return {
    items,
    loading,
    error,
    editingItem,
    add: () => setEditingItem({}),
    edit: setEditingItem,
    close: () => setEditingItem(null),
    save,
    remove,
  };
}
