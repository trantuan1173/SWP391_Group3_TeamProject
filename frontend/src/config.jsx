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
  GET_DOCTOR_SCHEDULE: (doctorId) =>
    `${baseUrl}/api/doctors/${doctorId}/schedule`,
  SPECIALITY_LIST: `${baseUrl}/api/doctors/specialties`,
  USER_LIST: `${baseUrl}/api/users`,
  GET_ALL_USERS: `${baseUrl}/api/admin/employees`,
  GET_USER_BY_ID: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  DELETE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  UPDATE_USER: (userId) => `${baseUrl}/api/admin/employees/${userId}`,
  CREATE_USER: `${baseUrl}/api/admin/create-employee`,
  GET_ALL_PATIENTS: `${baseUrl}/api/admin/patients`,
  //roles
  GET_ROLES: `${baseUrl}/api/admin/roles`,
  GET_ROLE_BY_ID: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  CREATE_ROLE: `${baseUrl}/api/admin/create-role`,
  UPDATE_ROLE: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  DELETE_ROLE: (roleId) => `${baseUrl}/api/admin/roles/${roleId}`,
  //patients
  ADMIN_GET_ALL_PATIENTS: `${baseUrl}/api/admin/patients/get-all`,
  GET_PATIENT_BY_ID: (id) => `${baseUrl}/api/admin/patients/${id}`,
  CREATE_PATIENT: `${baseUrl}/api/admin/patients`,
  UPDATE_PATIENT: (id) => `${baseUrl}/api/admin/patients/${id}`,
  DELETE_PATIENT: (id) => `${baseUrl}/api/admin/patients/${id}`,
  //admin dashboard
  GET_TOTAL_PATIENTS: `${baseUrl}/api/admin/dashboard/total-patients`,
  GET_ACTIVE_PATIENTS: `${baseUrl}/api/admin/dashboard/active-patients`,
  GET_TOTAL_EMPLOYEES: `${baseUrl}/api/admin/dashboard/total-employees`,
  GET_AVAILABLE_ROLES: `${baseUrl}/api/admin/dashboard/available-roles`,
  GET_RECENT_PATIENTS: `${baseUrl}/api/admin/dashboard/recent-patients`,
  GET_RECENT_EMPLOYEES: `${baseUrl}/api/admin/dashboard/recent-employees`,
  //services
  ADMIN_GET_ALL_SERVICES: `${baseUrl}/api/admin/services`,
  ADMIN_GET_ALL_SERVICES_PAGINATION: `${baseUrl}/api/services/get-all`,
  GET_SERVICE_BY_ID: (id) => `${baseUrl}/api/services/${id}`,
  CREATE_SERVICE: `${baseUrl}/api/services`,
  UPDATE_SERVICE: (id) => `${baseUrl}/api/services/${id}`,
  DELETE_SERVICE: (id) => `${baseUrl}/api/services/${id}`,
  //appointments
  CREATE_APPOINTMENT: `${baseUrl}/api/patients/appointments`,
  CREATE_APPOINTMENT_WITHOUT_LOGIN: `${baseUrl}/api/patients/appointmentsWithoutLogin`,
  CONFIRM_APPOINTMENT: `${baseUrl}/api/patients/confirmAppointment`,
  GET_MEDICAL_RECORDS_BY_DOCTOR: (doctorId, patientId = null) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}${
      patientId ? `?patientId=${patientId}` : ""
    }`,
  GET_ALL_PATIENTS: `${baseUrl}/api/medical-records/patients`,
  GET_MEDICAL_RECORDS_BY_PATIENT: (patientId) =>
    `${baseUrl}/api/medical-records/patient/${patientId}`,
  GET_PATIENTS_BY_DOCTOR: (doctorId) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}/patients`,
  GET_PATIENT_BY_DOCTOR: (doctorId) =>
    `${baseUrl}/api/medical-records/doctor/${doctorId}/patient`,
  GET_EMPLOYEE_WITH_ROLE: (employeeId) =>
    `${baseUrl}/api/employees/${employeeId}/with-role`,
  GET_APPOINTMENTS_BY_PATIENT: (patientId) =>
    `${baseUrl}/api/appointments/patient/${patientId}`,
  APPOINTMENT_BY_ID: (appointmentId) =>
    `${baseUrl}/api/appointments/${appointmentId}`,
  PATIENT_BY_ID: (patientId) => `${baseUrl}/api/patients/${patientId}`,
  GET_ALL_APPOINTMENTS: `${baseUrl}/api/appointments`,
  GET_APPOINTMENT_BY_ID: (appointmentId) =>
    `${baseUrl}/api/appointments/${appointmentId}`,
  GET_TODAY_APPOINTMENTS: `${baseUrl}/api/appointments/today`,
  CREATE_NEWS: `${baseUrl}/api/news`,
  UPDATE_NEWS: (newsId) => `${baseUrl}/api/news/${newsId}`,
  DELETE_NEWS: (newsId) => `${baseUrl}/api/news/${newsId}`,
  GET_NEWS: `${baseUrl}/api/news`,
  GET_NEWS_BY_ID: (newsId) => `${baseUrl}/api/news/${newsId}`,
  GET_SERVICES: `${baseUrl}/api/services`,
  CREATE_MEDICAL_RECORD: `${baseUrl}/api/medical-records`,
};
