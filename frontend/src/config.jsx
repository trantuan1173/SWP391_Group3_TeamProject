// API Configuration
const baseUrl = "http://localhost:1118";

export const API_ENDPOINTS = {
  //Đây là ví dụ khai báo url để import vào các component

  // USER_UPDATE_PROFILE: (userId) => `${baseUrl}/api/users/${userId}`,
  // GET_ALL_ROLE: `${baseUrl}/api/roles`,
  LOGIN: `${baseUrl}/api/users/login`,
  REGISTER: `${baseUrl}/api/users/register`,
  AUTH_PROFILE: `${baseUrl}/api/users/profile`,
  VERIFY: `${baseUrl}/api/users/verify`,
  GET_ALL_USERS: `${baseUrl}/api/admin/users`,
};
