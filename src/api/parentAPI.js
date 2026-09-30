import API from "./axios";

// ============================================================
// PARENT PROFILE
// ============================================================

export const getParentProfile = async () => {
    const response = await API.get("auth/parents/");
    return response.data;
};

// ============================================================
// CHILDREN
// ============================================================

export const getChildren = async () => {
    const response = await API.get(
        "auth/parents/children/"
    );
    return response.data;
};

// ============================================================
// CHILD ATTENDANCE
// ============================================================

export const getChildAttendance = async (studentId) => {
    const response = await API.get(
        `academics/attendance/?student=${studentId}`
    );
    return response.data;
};

// ============================================================
// CHILD RESULTS
// ============================================================

export const getChildResults = async (studentId) => {
    const response = await API.get(
        `academics/results/?student=${studentId}`
    );
    return response.data;
};

// ============================================================
// TERM PERFORMANCE
// ============================================================
// Gets the student's performance for a specific term and session.
//
// Example:
// studentId = 2
// term = "Term 1"
// session = 2026
//
// Endpoint:
// academics/results/term-performance/
//
// ============================================================

export const getTermPerformance = async (
    studentId,
    term,
    session
) => {
    const response = await API.get(
        `academics/results/term-performance/?student=${studentId}&term=${encodeURIComponent(
            term
        )}&session=${session}`
    );

    return response.data;
};




// import API from "./axios";

// // ============================================================
// // PARENT PROFILE
// // ============================================================

// export const getParentProfile = async () => {
//     const response = await API.get("auth/parents/");
//     return response.data;
// };

// // ============================================================
// // CHILDREN
// // ============================================================

// export const getChildren = async () => {
//     const response = await API.get(
//         "auth/parents/children/"
//     );

//     return response.data;
// };

// // ============================================================
// // CHILD ATTENDANCE
// // ============================================================

// export const getChildAttendance = async (studentId) => {
//     const response = await API.get(
//         `academics/attendance/?student=${studentId}`
//     );

//     return response.data;
// };

// // ============================================================
// // CHILD RESULTS
// // ============================================================

// export const getChildResults = async (studentId) => {
//     const response = await API.get(
//         `academics/results/?student=${studentId}`
//     );

//     return response.data;
// };

