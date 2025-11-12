import { API_ENDPOINTS } from "@/config";
import axios from "axios";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

/** GET /api/medicines?page=&pageSize=&search= */
export const fetchMedicines = async (page = 1, pageSize = 10, search = "") => {
  try {
    const res = await axios.get(API_ENDPOINTS.MEDICINE_LIST, {
      params: { page, pageSize, search },
      headers: getAuthHeaders(),
    });
    return res.data; // { medicines, total, totalPages, currentPage }
  } catch (err) {
    console.error("fetchMedicines error:", err);
    throw err;
  }
};

/** GET /api/medicines/:id */
export const fetchMedicineById = async (id) => {
  try {
    const res = await axios.get(API_ENDPOINTS.MEDICINE_DETAIL(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("fetchMedicineById error:", err);
    throw err;
  }
};

/** POST /api/medicines/create */
export const createMedicine = async (payload) => {
  try {
    const res = await axios.post(API_ENDPOINTS.CREATE_MEDICINE, payload, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("createMedicine error:", err);
    throw err;
  }
};

/** PUT /api/medicines/update/:id */
export const updateMedicine = async (id, payload) => {
  try {
    const res = await axios.put(API_ENDPOINTS.UPDATE_MEDICINE(id), payload, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return res.data;
  } catch (err) {
    console.error("updateMedicine error:", err);
    throw err;
  }
};

/** DELETE /api/medicines/delete/:id */
export const deleteMedicine = async (id) => {
  try {
    const res = await axios.delete(API_ENDPOINTS.DELETE_MEDICINE(id), {
      headers: getAuthHeaders(),
    });
    return res.data;
  } catch (err) {
    console.error("deleteMedicine error:", err);
    throw err;
  }
};

/** GET /api/medicines/expiring/soon */
export const fetchExpiringMedicines = async () => {
  try {
    const res = await axios.get(API_ENDPOINTS.MEDICINE_EXPIRING_SOON, {
      headers: getAuthHeaders(),
    });
    return res.data; // { expiring: [...] }
  } catch (err) {
    console.error("fetchExpiringMedicines error:", err);
    throw err;
  }
};
