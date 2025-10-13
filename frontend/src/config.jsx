// API Configuration
const baseUrl = "http://localhost:1118";

export const API_ENDPOINTS = {
  //Đây là ví dụ khai báo url để import vào các component

  // USER_UPDATE_PROFILE: (userId) => `${baseUrl}/api/users/${userId}`,
  // GET_ALL_ROLE: `${baseUrl}/api/roles`,
  EMP_LOGIN: `${baseUrl}/api/employees/login`,
  PATIENT_LOGIN: `${baseUrl}/api/patients/login`,
REGISTER: `${baseUrl}/api/patients/register`,
  AUTH_PROFILE: `${baseUrl}/api/users/profile`,
  VERIFY: `${baseUrl}/api/users/verify`,
  DOCTOR_LIST: `${baseUrl}/api/doctors`,
  SPECIALITY_LIST: `${baseUrl}/api/doctors/specialties`,
  USER_LIST: `${baseUrl}/api/users`,
  GET_ALL_USERS: `${baseUrl}/api/admin/employees`,
  GET_ROLES: `${baseUrl}/api/admin/roles`,
  GET_USER_BY_ID: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  DELETE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  UPDATE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  CREATE_USER: `${baseUrl}/api/admin/create-employee`,
  CREATE_APPOINTMENT: `${baseUrl}/api/patients/appointments`,
  CREATE_APPOINTMENT_WITHOUT_LOGIN: `${baseUrl}/api/patients/appointmentsWithoutLogin`,
  CONFIRM_APPOINTMENT: `${baseUrl}/api/patients/confirmAppointment`,
};
