import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

// Lấy tất cả roles (có phân trang + search)
export const fetchRoles = async (page = 1, pageSize = 10, search = "") => {
  const res = await axios.get(API_ENDPOINTS.GET_ROLES, {
    params: { page, pageSize, search },
    headers: getAuthHeaders(),
  });
  return res.data; // { roles, total, totalPages, currentPage }
};

// Lấy 1 role theo ID
export const fetchRoleById = async (id) => {
  const res = await axios.get(API_ENDPOINTS.GET_ROLE_BY_ID(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

// Tạo role
export const createRole = async (data) => {
  const res = await axios.post(API_ENDPOINTS.CREATE_ROLE, data, {
    headers: getAuthHeaders(),
  });
  return res.data.role;
};

// Cập nhật role
export const updateRole = async (id, data) => {
  const res = await axios.put(API_ENDPOINTS.UPDATE_ROLE(id), data, {
    headers: getAuthHeaders(),
  });
  return res.data.role;
};

// Xoá role
export const deleteRole = async (id) => {
  return axios.delete(API_ENDPOINTS.DELETE_ROLE(id), {
    headers: getAuthHeaders(),
  });
};
