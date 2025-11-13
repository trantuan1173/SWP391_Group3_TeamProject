import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchFaqCategorySummary = async () => {
  const res = await axios.get(API_ENDPOINTS.FETCH_FAQ_CATEGORY_SUMMARY, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchFaqs = async (
  page = 1,
  pageSize = 10,
  search = "",
  categoryId = ""
) => {
  const params = {
    page,
    pageSize,
    ...(search ? { search: search.trim() } : {}),
    ...(categoryId ? { categoryId } : {}),
  };

  const res = await axios.get(API_ENDPOINTS.FAQ_LIST, {
    params,
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchFaqById = async (id) => {
  const res = await axios.get(API_ENDPOINTS.FAQ_DETAIL(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createFaq = async (data) => {
  const res = await axios.post(API_ENDPOINTS.FAQ_LIST, data, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
};

export const updateFaq = async (id, data) => {
  const res = await axios.put(API_ENDPOINTS.FAQ_DETAIL(id), data, {
    headers: { ...getAuthHeaders() },
  });
  return res.data;
};

// 6) Delete FAQ
export const deleteFaq = async (id) => {
  const res = await axios.delete(API_ENDPOINTS.FAQ_DETAIL(id), {
    headers: getAuthHeaders(),
  });
  return res.data;
};
