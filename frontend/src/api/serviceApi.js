import axios from "axios";
import { API_ENDPOINTS } from "@/config";

// === Helper: get Authorization header ===
const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

// === FETCH ALL (with pagination + search) ===
export const fetchServices = async (page = 1, pageSize = 10, search = "") => {
  const res = await axios.get(API_ENDPOINTS.ADMIN_GET_ALL_SERVICES_PAGINATION, {
    params: { page, pageSize, search },
    headers: getAuthHeaders(),
  });
  return res.data;
};

// === FETCH ONE SERVICE BY ID ===
export const fetchServiceById = async (id) => {
  const res = await axios.get(API_ENDPOINTS.GET_SERVICE_BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// === CREATE SERVICE ===
export const createService = async (data) => {
  const res = await axios.post(API_ENDPOINTS.CREATE_SERVICE, data, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });
  return res.data.service;
};

// === UPDATE SERVICE ===
export const updateService = async (id, data) => {
  const res = await axios.put(API_ENDPOINTS.UPDATE_SERVICE(id), data, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });
  return res.data.service;
};

// === DELETE SERVICE ===
export const deleteService = async (id) => {
  const res = await axios.delete(API_ENDPOINTS.DELETE_SERVICE(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};
