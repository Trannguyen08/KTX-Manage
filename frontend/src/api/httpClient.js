const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const token = localStorage.getItem("auth_token");
  const headers = isFormData ? { ...options.headers } : {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    if (response.status === 401) {
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_refresh");
      window.dispatchEvent(new Event("auth:logout"));
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const httpClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  postForm: (path, formData) => request(path, { method: "POST", body: formData }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
};
