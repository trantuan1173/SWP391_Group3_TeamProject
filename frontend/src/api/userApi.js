import axios from "axios";
import { API_ENDPOINTS } from "@/config";

const getAuthHeaders = () => ({
  Authorization: `Bearer ${
    localStorage.getItem("token") || sessionStorage.getItem("token")
  }`,
});

export const fetchUsers = async () => {
  const res = await axios.get(API_ENDPOINTS.GET_ALL_USERS, {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const fetchUserById = async (userId) => {
  const res = await axios.get(API_ENDPOINTS.GET_USER_BY_ID(userId), {
    headers: getAuthHeaders(),
  });
  return res.data;
};

export const createUser = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === "avatar" && data.avatar instanceof File) {
      formData.append("avatar", data.avatar);
    } else {
      formData.append(key, data[key]);
    }
  });

  const res = await axios.post(API_ENDPOINTS.CREATE_USER, formData, {
    headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
  });
  return res.data.user;
};

export const deleteUser = async (userId) => {
  return axios.delete(API_ENDPOINTS.DELETE_USER(userId), {
    headers: getAuthHeaders(),
  });
};

export const updateUser = async (userId, data) => {
  const res = await axios.put(API_ENDPOINTS.UPDATE_USER(userId), data, {
    headers: getAuthHeaders(),
  });
  return res.data.updatedUser;
};

export const updateUserStatus = async (id, isActive) => {
  const res = await axios.put(
    `http://localhost:1118/api/users/update-status/${id}`,
    {
      isActive,
    }
  );
  return res.data;
};
