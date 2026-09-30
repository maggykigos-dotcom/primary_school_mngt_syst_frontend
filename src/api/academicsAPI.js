import API from "./axios";

// ==========================
// SUBJECTS
// ==========================

export const getSubjects = async () => {
    const response = await API.get("academics/subjects/");
    return response.data;
};

export const getSubject = async (id) => {
    const response = await API.get(
        `academics/subjects/${id}/`
    );
    return response.data;
};

export const createSubject = async (data) => {
    const response = await API.post(
        "academics/subjects/",
        data
    );
    return response.data;
};

export const updateSubject = async (id, data) => {
    const response = await API.put(
        `academics/subjects/${id}/`,
        data
    );
    return response.data;
};

export const deleteSubject = async (id) => {
    const response = await API.delete(
        `academics/subjects/${id}/`
    );
    return response.data;
};

// ==========================
// ATTENDANCE
// ==========================

export const getAttendance = async () => {
    const response = await API.get(
        "academics/attendance/"
    );
    return response.data;
};

export const getAttendanceClasses = async () => {
    const response = await API.get(
        "academics/attendance/classes/"
    );
    return response.data;
};

export const createAttendance = async (data) => {
    const response = await API.post(
        "academics/attendance/",
        data
    );
    return response.data;
};

export const updateAttendance = async (id, data) => {
    const response = await API.put(
        `academics/attendance/${id}/`,
        data
    );
    return response.data;
};

export const deleteAttendance = async (id) => {
    const response = await API.delete(
        `academics/attendance/${id}/`
    );
    return response.data;
};

// ==========================
// RESULTS
// ==========================

export const getResults = async () => {
    const response = await API.get(
        "academics/results/"
    );
    return response.data;
};

export const createResult = async (data) => {
    const response = await API.post(
        "academics/results/",
        data
    );
    return response.data;
};

export const updateResult = async (id, data) => {
    const response = await API.put(
        `academics/results/${id}/`,
        data
    );
    return response.data;
};

export const deleteResult = async (id) => {
    const response = await API.delete(
        `academics/results/${id}/`
    );
    return response.data;
};

// ==========================
// ASSIGNMENTS
// ==========================

export const getAssignments = async () => {
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

export const updateAssignment = async (id, data) => {
    const response = await API.put(
        `academics/assignments/${id}/`,
        data
    );
    return response.data;
};

export const deleteAssignment = async (id) => {
    const response = await API.delete(
        `academics/assignments/${id}/`
    );
    return response.data;
};

// ==========================
// QUIZ QUESTIONS
// ==========================

export const getQuizQuestions = async (assignmentId) => {
    const response = await API.get(
        `academics/quiz-questions/?assignment=${assignmentId}`
    );
    return response.data;
};

export const createQuizQuestion = async (questionData) => {
    const response = await API.post(
        "academics/quiz-questions/",
        questionData
    );
    return response.data;
};

export const updateQuizQuestion = async (
    questionId,
    questionData
) => {
    const response = await API.put(
        `academics/quiz-questions/${questionId}/`,
        questionData
    );
    return response.data;
};

export const deleteQuizQuestion = async (questionId) => {
    const response = await API.delete(
        `academics/quiz-questions/${questionId}/`
    );
    return response.data;
};

// ==========================
// TIMETABLE
// ==========================

export const getTimetable = async () => {
    const response = await API.get(
        "academics/timetable/"
    );
    return response.data;
};

export const createTimetable = async (data) => {
    const response = await API.post(
        "academics/timetable/",
        data
    );
    return response.data;
};

export const updateTimetable = async (id, data) => {
    const response = await API.put(
        `academics/timetable/${id}/`,
        data
    );
    return response.data;
};

export const deleteTimetable = async (id) => {
    const response = await API.delete(
        `academics/timetable/${id}/`
    );
    return response.data;
};

// ==========================
// GRADES
// ==========================

export const getGrades = async () => {
    const response = await API.get(
        "academics/grades/"
    );
    return response.data;
};

export const getGrade = async (id) => {
    const response = await API.get(
        `academics/grades/${id}/`
    );
    return response.data;
};

export const createGrade = async (data) => {
    const response = await API.post(
        "academics/grades/",
        data
    );
    return response.data;
};

export const updateGrade = async (id, data) => {
    const response = await API.put(
        `academics/grades/${id}/`,
        data
    );
    return response.data;
};

export const deleteGrade = async (id) => {
    const response = await API.delete(
        `academics/grades/${id}/`
    );
    return response.data;
};

// ==========================
// SCHOOL CLASSES
// ==========================

export const getClasses = async () => {
    const response = await API.get(
        "academics/classes/"
    );
    return response.data;
};

export const getClass = async (id) => {
    const response = await API.get(
        `academics/classes/${id}/`
    );
    return response.data;
};

export const createClass = async (data) => {
    const response = await API.post(
        "academics/classes/",
        data
    );
    return response.data;
};

export const updateClass = async (id, data) => {
    const response = await API.put(
        `academics/classes/${id}/`,
        data
    );
    return response.data;
};

export const deleteClass = async (id) => {
    const response = await API.delete(
        `academics/classes/${id}/`
    );
    return response.data;
};

// ==========================
// SECTIONS
// ==========================

export const getSections = async () => {
    const response = await API.get(
        "academics/sections/"
    );
    return response.data;
};

export const getSection = async (id) => {
    const response = await API.get(
        `academics/sections/${id}/`
    );
    return response.data;
};

export const createSection = async (data) => {
    const response = await API.post(
        "academics/sections/",
        data
    );
    return response.data;
};

export const updateSection = async (id, data) => {
    const response = await API.put(
        `academics/sections/${id}/`,
        data
    );
    return response.data;
};

export const deleteSection = async (id) => {
    const response = await API.delete(
        `academics/sections/${id}/`
    );
    return response.data;
};



