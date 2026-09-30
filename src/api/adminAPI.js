import API from "./axios";

// ======================================================
// USERS
// ======================================================

export const getUsers = () => {
  return API.get("auth/users/");
};

export const getUser = (id) => {
  return API.get(`auth/users/${id}/`);
};

export const createUser = (data) => {
  return API.post("auth/users/", data);
};

export const updateUser = (id, data) => {
  return API.put(`auth/users/${id}/`, data);
};

export const deleteUser = (id) => {
  return API.delete(`auth/users/${id}/`);
};


// ======================================================
// STUDENTS
// ======================================================

export const getStudents = () => {
  return API.get("auth/students/");
};

export const getStudent = (id) => {
  return API.get(`auth/students/${id}/`);
};

export const createStudent = (data) => {
  return API.post("auth/students/", data);
};

export const updateStudent = (id, data) => {
  return API.put(`auth/students/${id}/`, data);
};

export const deleteStudent = (id) => {
  return API.delete(`auth/students/${id}/`);
};


// ======================================================
// PARENTS
// ======================================================

export const getParents = () => {
  return API.get("auth/parents/");
};

export const getParent = (id) => {
  return API.get(`auth/parents/${id}/`);
};

export const createParent = (data) => {
  return API.post("auth/parents/", data);
};

export const updateParent = (id, data) => {
  return API.put(`auth/parents/${id}/`, data);
};

export const deleteParent = (id) => {
  return API.delete(`auth/parents/${id}/`);
};


// ======================================================
// TEACHERS
// ======================================================

export const getTeachers = () => {
  return API.get("auth/teachers/");
};

export const getTeacher = (id) => {
  return API.get(`auth/teachers/${id}/`);
};

export const createTeacher = (data) => {
  return API.post("auth/teachers/", data);
};

export const updateTeacher = (id, data) => {
  return API.put(`auth/teachers/${id}/`, data);
};

export const deleteTeacher = (id) => {
  return API.delete(`auth/teachers/${id}/`);
};



// import API from "./axios";

// // USERS

// export const getUsers = () => {
//   return API.get("auth/users/");
// };

// export const getUser = (id) => {
//   return API.get(`auth/users/${id}/`);
// };

// export const createUser = (data) => {
//   return API.post("auth/users/", data);
// };

// export const updateUser = (id, data) => {
//   return API.put(`auth/users/${id}/`, data);
// };

// export const deleteUser = (id) => {
//   return API.delete(`auth/users/${id}/`);
// };


// // STUDENTS

// export const getStudents = () => {
//   return API.get("auth/students/");
// };

// export const getStudent = (id) => {
//   return API.get(`auth/students/${id}/`);
// };

// export const createStudent = (data) => {
//   return API.post("auth/students/", data);
// };

// export const updateStudent = (id, data) => {
//   return API.put(`auth/students/${id}/`, data);
// };

// export const deleteStudent = (id) => {
//   return API.delete(`auth/students/${id}/`);
// };


// // PARENTS

// export const getParents = () => {
//   return API.get("auth/parents/");
// };

// export const getParent = (id) => {
//   return API.get(`auth/parents/${id}/`);
// };

// export const createParent = (data) => {
//   return API.post("auth/parents/", data);
// };

// export const updateParent = (id, data) => {
//   return API.put(`auth/parents/${id}/`, data);
// };

// export const deleteParent = (id) => {
//   return API.delete(`auth/parents/${id}/`);
// };


// // TEACHERS
// // These require the TeacherViewSet discussed above.

// export const getTeachers = () => {
//   return API.get("auth/teachers/");
// };

// export const getTeacher = (id) => {
//   return API.get(`auth/teachers/${id}/`);
// };

// export const createTeacher = (data) => {
//   return API.post("auth/teachers/", data);
// };

// export const updateTeacher = (id, data) => {
//   return API.put(`auth/teachers/${id}/`, data);
// };

// export const deleteTeacher = (id) => {
//   return API.delete(`auth/teachers/${id}/`);
// };


