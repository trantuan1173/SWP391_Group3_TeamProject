import { API_ENDPOINTS } from "@/config";
import axios from "axios";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchFaqCategorySummary = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.FETCH_FAQ_CATEGORY_SUMMARY, {
      headers: getAuthHeaders(),
    });

    return res.data;
  } catch (err) {
    console.error("fetchFaqCategorySummary error:", err);
    throw err;
  }
};

export const fetchFaqList = async ({
  page = 1,
  pageSize = 10,
  search = "",
  categoryId,
}) => {
  try {
    const res = await axios.get(API_ENDPOINTS.FAQ_LIST, {
      params: { page, pageSize, search, categoryId },
      headers: getAuthHeaders(),
    });
    console.log("fetchFaqList response:", res.data);
    return res.data;
  } catch (err) {
    console.error("fetchFaqList error:", err);
    throw err;
  }
};

export const fetchFaqById = async (id) => {
  try {
    const res = await axios.get(API_ENDPOINTS.FAQ_DETAIL(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("fetchFaqById error:", err);
    throw err;
  }
};

export const createFaq = async (payload) => {
  try {
    const res = await axios.post(API_ENDPOINTS.CREATE_FAQ, payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("createFaq error:", err);
    throw err;
  }
};

export const updateFaq = async (id, payload) => {
  try {
    const res = await axios.put(API_ENDPOINTS.UPDATE_FAQ(id), payload, {
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (err) {
    console.error("updateFaq error:", err);
    throw err;
  }
};

export const deleteFaq = async (id) => {
  try {
    const res = await axios.delete(API_ENDPOINTS.DELETE_FAQ(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("deleteFaq error:", err);
    throw err;
  }
};
