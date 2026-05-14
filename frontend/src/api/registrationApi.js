import { httpClient } from "./httpClient.js";

export const registrationApi = {
  create: (payload) => httpClient.post("/registrations/", payload),
  approve: (id) => httpClient.post(`/registrations/${id}/approve/`, {}),
  reject: (id, reason) => httpClient.post(`/registrations/${id}/reject/`, { reason }),
  confirmPayment: (params) => httpClient.post("/registrations/confirm-payment/", params),
  createPayment: (payload) => httpClient.post("/registrations/create-payment/", payload),
  uploadPortrait: (file) => {
    const formData = new FormData();
    formData.append("portrait", file);
    return httpClient.postForm("/registrations/upload-portrait/", formData);
  },
  roomOptions: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        query.set(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return httpClient.get(`/registrations/room-options/${suffix}`);
  },
};
