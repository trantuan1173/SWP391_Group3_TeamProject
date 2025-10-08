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
  DOCTOR_LIST: `${baseUrl}/api/doctors`,
  SPECIALITY_LIST: `${baseUrl}/api/doctors/specialties`,
  USER_LIST: `${baseUrl}/api/users`,
  GET_ALL_USERS: `${baseUrl}/api/admin/users`,
  GET_USER_BY_ID: (userId) => `${baseUrl}/api/admin/users/${userId}`,
  DELETE_USER: (userId) => `${baseUrl}/api/admin/users/${userId}`,
  UPDATE_USER: (userId) => `${baseUrl}/api/admin/users/${userId}`,
  CREATE_USER: `${baseUrl}/api/admin/create-user`,
  CREATE_APPOINTMENT: `${baseUrl}/api/patients/appointments`,
  CREATE_APPOINTMENT_WITHOUT_LOGIN: `${baseUrl}/api/patients/appointmentsWithoutLogin`,
  CONFIRM_APPOINTMENT: `${baseUrl}/api/patients/confirmAppointment`,
};
