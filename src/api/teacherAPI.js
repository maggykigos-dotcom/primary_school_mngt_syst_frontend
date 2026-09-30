import API from "./axios";

export const getTeacherProfile = async () => {
  const response = await API.get(
    "accounts/teacher/profile/"
  );

  return response.data;
};

export const getTeacherClasses = async () => {
  const response = await API.get(
    "academics/classes/"
  );

  return response.data;
};

export const getTeacherStudents = async () => {
  const response = await API.get(
    "auth/students/"
  );

  return response.data;
};

export const getTeacherAssignments = async () => {
  const response = await API.get(
    "academics/assignments/"
  );

  return response.data;
};

export const createAssignment = async (data) => {
  const response = await API.post(
    "academics/assignments/",
    data
  );

  return response.data;
};

export const markAttendance = async (data) => {
  const response = await API.post(
    "academics/attendance/",
    data
  );

  return response.data;
};