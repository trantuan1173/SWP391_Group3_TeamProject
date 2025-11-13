// src/api/policyApi.js
import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

// LẤY DANH SÁCH (có phân trang + lọc)
export const fetchPolicies = async (
  page = 1,
  pageSize = 10,
  search = "",
  category = "",
  status = "" // optional
) => {
  const res = await axios.get(API_ENDPOINTS.GET_POLICIES, {
    headers: getAuthHeaders(),
    params: { page, pageSize, search, category, status },
  });
  // backend trả: { message, policies, total, totalPages, currentPage }
  return res.data;
};

export const createPolicy = async (data) => {
  const res = await axios.post(API_ENDPOINTS.CREATE_POLICY, data, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};

export const updatePolicy = async (id, data) => {
  const res = await axios.put(API_ENDPOINTS.UPDATE_POLICY(id), data, {
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
  });
  return res.data;
};

export const deletePolicy = async (id) => {
  const res = await axios.delete(API_ENDPOINTS.DELETE_POLICY(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchPolicyById = async (id) => {
  const res = await axios.get(API_ENDPOINTS.GET_POLICY(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchActivePolicyByCategory = async (category) => {
  // đảm bảo category được encode
  const url = API_ENDPOINTS.GET_ACTIVE_POLICY_BY_CATEGORY(
    encodeURIComponent(category)
  );
  const res = await axios.get(url, {
    headers: getAuthHeaders(),
  });
  console.log("fetchActivePolicyByCategory response:", res.data);
  return res.data;
};
