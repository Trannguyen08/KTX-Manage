import { httpClient } from "./httpClient.js";

export function createResourceApi(endpoint) {
  return {
    list: () => httpClient.get(`/${endpoint}/`),
    create: (payload) => httpClient.post(`/${endpoint}/`, payload),
    update: (id, payload) => httpClient.patch(`/${endpoint}/${id}/`, payload),
    remove: (id) => httpClient.delete(`/${endpoint}/${id}/`),
    summary: () => httpClient.get(`/${endpoint}/summary/`),
  };
}
