import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getStudents,
    deleteStudent,
} from "../../api/adminAPI";

import "./StudentManagement.css";

const StudentManagement = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");

    const [deletingId, setDeletingId] = useState(null);

    // --------------------------------------------------
    // LOAD STUDENTS
    // --------------------------------------------------

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const response = await getStudents();

            console.log("STUDENTS API RESPONSE:", response.data);

            let studentData = [];

            if (Array.isArray(response.data)) {
                studentData = response.data;
            } else if (Array.isArray(response.data?.results)) {
                studentData = response.data.results;
            }

            setStudents(studentData);
        } catch (err) {
            console.error("Error loading students:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    // --------------------------------------------------
    // DELETE STUDENT
    // --------------------------------------------------

    const handleDelete = async (student) => {
        if (!student || !student.id) {
            return;
        }

        const studentName =
            student.student_name ||
            student.name ||
            "this student";

        const confirmed = window.confirm(
            `Are you sure you want to delete ${studentName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(student.id);
            setError("");
            setMessage("");

            await deleteStudent(student.id);

            setStudents((previousStudents) =>
                previousStudents.filter(
                    (item) => item.id !== student.id
                )
            );

            setMessage(
                `${studentName} has been deleted successfully.`
            );
        } catch (err) {
            console.error("Error deleting student:", err);

            setError(
                err.response?.data?.detail ||
                "Failed to delete student."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // --------------------------------------------------
    // VIEW
    // --------------------------------------------------

    const handleView = (id) => {
        navigate(`/admin/students/${id}`);
    };

    // --------------------------------------------------
    // EDIT
    // --------------------------------------------------

    const handleEdit = (id) => {
        navigate(`/admin/students/edit/${id}`);
    };

    // --------------------------------------------------
    // GET CLASS OPTIONS
    // --------------------------------------------------

    const classOptions = useMemo(() => {
        const classes = students
            .map((student) => student.class_name)
            .filter(Boolean);

        return [...new Set(classes)].sort();
    }, [students]);

    // --------------------------------------------------
    // FILTER STUDENTS
    // --------------------------------------------------

    const filteredStudents = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return students.filter((student) => {
            const studentName = (
                student.student_name ||
                student.name ||
                ""
            ).toLowerCase();

            const admissionNumber = (
                student.admission_number ||
                ""
            ).toLowerCase();

            const username = (
                student.username ||
                student.username_display ||
                ""
            ).toLowerCase();

            // const className = (
            //     student.class_name ||
            //     ""
            // ).toLowerCase();

            const matchesSearch =
                !search ||
                studentName.includes(search) ||
                admissionNumber.includes(search) ||
                username.includes(search);

            const matchesClass =
                classFilter === "all" ||
                student.class_name === classFilter;

            return matchesSearch && matchesClass;
        });
    }, [students, searchTerm, classFilter]);

    // --------------------------------------------------
    // CLEAR SEARCH
    // --------------------------------------------------

    const clearFilters = () => {
        setSearchTerm("");
        setClassFilter("all");
    };

    // --------------------------------------------------
    // TOTALS
    // --------------------------------------------------

    const totalStudents = students.length;
    const showingStudents = filteredStudents.length;

    // --------------------------------------------------
    // RENDER
    // --------------------------------------------------

    return (
        <div className="student-management">

            {/* ==========================================
                PAGE HEADER
            ========================================== */}

            <div className="student-management-hero">

                <div className="student-management-title-area">

                    <div className="student-management-title-icon">
                        S
                    </div>

                    <div>
                        <h1>Student Management</h1>

                        <p>
                            Manage student accounts, profiles,
                            classes and records.
                        </p>
                    </div>

                </div>

                <button
                    type="button"
                    className="add-student-button"
                    onClick={() =>
                        navigate("/admin/students/add")
                    }
                >
                    Add Student
                </button>

            </div>

            {/* ==========================================
                SUMMARY CARDS
            ========================================== */}

            <div className="student-summary-grid">

                <div className="student-summary-card total-card">

                    <div className="summary-icon">
                        S
                    </div>

                    <div className="summary-content">

                        <span>Total Students</span>

                        <strong>
                            {totalStudents}
                        </strong>

                    </div>

                </div>

                <div className="student-summary-card showing-card">

                    <div className="summary-icon">
                        V
                    </div>

                    <div className="summary-content">

                        <span>Showing</span>

                        <strong>
                            {showingStudents}
                        </strong>

                    </div>

                </div>

                <div className="student-summary-card records-card">

                    <div className="summary-icon">
                        R
                    </div>

                    <div className="summary-content">

                        <span>Student Records</span>

                        <strong>
                            {students.length}
                        </strong>

                    </div>

                </div>

            </div>

            {/* ==========================================
                SUCCESS MESSAGE
            ========================================== */}

            {message && (
                <div className="management-success">
                    {message}
                </div>
            )}

            {/* ==========================================
                ERROR MESSAGE
            ========================================== */}

            {error && (
                <div className="management-error">
                    {error}
                </div>
            )}

            {/* ==========================================
                STUDENTS CARD
            ========================================== */}

            <div className="student-table-card">

                {/* CARD HEADER */}

                <div className="student-management-header">

                    <div>
                        <h2>All Students</h2>

                        <p>
                            View and manage all registered students.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="refresh-students-button"
                        onClick={loadStudents}
                        disabled={loading}
                    >
                        {loading
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                </div>

                {/* ======================================
                    SEARCH AND FILTER
                ====================================== */}

                <div className="students-toolbar">

                    <div className="student-search-box">

                        <label htmlFor="student-search">
                            Search Student
                        </label>

                        <input
                            id="student-search"
                            type="text"
                            placeholder="Search by student name, admission number or username..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                    <div className="student-filter-box">

                        <label htmlFor="class-filter">
                            Filter by Class
                        </label>

                        <select
                            id="class-filter"
                            value={classFilter}
                            onChange={(event) =>
                                setClassFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Classes
                            </option>

                            {classOptions.map((className) => (
                                <option
                                    key={className}
                                    value={className}
                                >
                                    {className}
                                </option>
                            ))}

                        </select>

                    </div>

                    <button
                        type="button"
                        className="clear-student-filters"
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>

                </div>

                {/* ======================================
                    LOADING
                ====================================== */}

                {loading ? (

                    <div className="students-loading">

                        <div className="students-spinner"></div>

                        <p>
                            Loading students...
                        </p>

                    </div>

                ) : filteredStudents.length === 0 ? (

                    /* ==================================
                       EMPTY STATE
                    ================================== */

                    <div className="students-empty">

                        <div className="students-empty-icon">
                            S
                        </div>

                        <h3>
                            No students found
                        </h3>

                        <p>
                            {students.length === 0
                                ? "There are no students registered yet."
                                : "No students match your current search or class filter."}
                        </p>

                        {students.length > 0 && (
                            <button
                                type="button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>

                ) : (

                    /* ==================================
                       TABLE
                    ================================== */

                    <div className="table-wrapper">

                        <table className="students-management-table">

                            <thead>
                                <tr>

                                    <th>
                                        ID
                                    </th>

                                    <th>
                                        Admission No.
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody>

                                {filteredStudents.map(
                                    (student) => {

                                        const studentName =
                                            student.student_name ||
                                            student.name ||
                                            "Unknown Student";

                                        const className =
                                            student.class_name ||
                                            "Not Assigned";

                                        const firstLetter =
                                            studentName
                                                .charAt(0)
                                                .toUpperCase();

                                        return (
                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    <span className="student-id">
                                                        #
                                                        {
                                                            student.id
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="student-admission">
                                                        {
                                                            student.admission_number ||
                                                            "Not Assigned"
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="student-name-cell">

                                                        <div className="student-avatar">
                                                            {
                                                                firstLetter
                                                            }
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    studentName
                                                                }
                                                            </strong>

                                                            <span>
                                                                Student
                                                            </span>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="student-class-badge">
                                                        {
                                                            className
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="student-actions">

                                                        <button
                                                            type="button"
                                                            className="view-button"
                                                            onClick={() =>
                                                                handleView(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="edit-button"
                                                            onClick={() =>
                                                                handleEdit(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="delete-button"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    student
                                                                )
                                                            }
                                                            disabled={
                                                                deletingId ===
                                                                student.id
                                                            }
                                                        >
                                                            {deletingId ===
                                                            student.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default StudentManagement;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import {
//   getStudents,
//   deleteStudent,
// } from "../../api/adminAPI";

// import "./StudentManagement.css";

// const StudentManagement = () => {
//   const navigate = useNavigate();

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   // ======================================================
//   // LOAD STUDENTS
//   // ======================================================

//   const loadStudents = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await getStudents();

//       const data = Array.isArray(response.data)
//         ? response.data
//         : response.data?.results || [];

//       setStudents(data);
//     } catch (error) {
//       console.error(
//         "Failed to load students:",
//         error.response?.data || error
//       );

//       setError("Failed to load students.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStudents();
//   }, []);

//   // ======================================================
//   // DELETE STUDENT
//   // ======================================================

//   const handleDelete = async (student) => {
//     const studentName =
//       student.student_name ||
//       `${student.first_name || ""} ${
//         student.last_name || ""
//       }`.trim() ||
//       "this student";

//     const confirmed = window.confirm(
//       `Are you sure you want to delete ${studentName}?`
//     );

//     if (!confirmed) {
//       return;
//     }

//     try {
//       setMessage("");
//       setError("");

//       await deleteStudent(student.id);

//       setMessage(
//         `${studentName} was deleted successfully.`
//       );

//       // Remove deleted student from the table
//       setStudents((previousStudents) =>
//         previousStudents.filter(
//           (item) => item.id !== student.id
//         )
//       );
//     } catch (error) {
//       console.error(
//         "Student deletion error:",
//         error.response?.data || error
//       );

//       setError(
//         error.response?.data?.detail ||
//           "Failed to delete student."
//       );
//     }
//   };

//   // ======================================================
//   // EDIT STUDENT
//   // ======================================================

//   const handleEdit = (student) => {
//     navigate(`/admin/students/edit/${student.id}`);
//   };

//   // ======================================================
//   // VIEW STUDENT
//   // ======================================================

//   const handleView = (student) => {
//     navigate(`/admin/students/${student.id}`);
//   };

//   return (
//     <div className="student-management">

//       {/* HEADER */}

//       <div className="management-header">

//         <div>
//           <h1>Student Management</h1>

//           <p>
//             View, add, update and delete students.
//           </p>
//         </div>

//         <button
//           className="add-student-button"
//           onClick={() =>
//             navigate("/admin/students/add")
//           }
//         >
//           + Add Student
//         </button>

//       </div>


//       {/* SUCCESS MESSAGE */}

//       {message && (
//         <div className="management-success">
//           {message}
//         </div>
//       )}


//       {/* ERROR MESSAGE */}

//       {error && (
//         <div className="management-error">
//           {error}
//         </div>
//       )}


//       {/* STUDENT TABLE */}

//       <div className="student-table-card">

//         {loading ? (

//           <div className="table-message">
//             Loading students...
//           </div>

//         ) : students.length === 0 ? (

//           <div className="table-message">
//             No students found.
//           </div>

//         ) : (

//           <div className="table-wrapper">

//             <table>

//               <thead>

//                 <tr>
//                   <th>ID</th>
//                   <th>Admission No.</th>
//                   <th>Student</th>
//                   <th>Class</th>
//                   <th>Actions</th>
//                 </tr>

//               </thead>

//               <tbody>

//                 {students.map((student) => (

//                   <tr key={student.id}>

//                     <td>
//                       {student.id}
//                     </td>

//                     <td>
//                       {student.admission_number || "-"}
//                     </td>

//                     <td>
//                       {student.student_name ||
//                         `${student.first_name || ""} ${
//                           student.last_name || ""
//                         }`.trim() ||
//                         "Unknown Student"}
//                     </td>

//                     <td>
//                       {student.class_name || "-"}
//                     </td>

//                     <td>

//                       <div className="student-actions">

//                         <button
//                           className="view-button"
//                           onClick={() =>
//                             handleView(student)
//                           }
//                         >
//                           View
//                         </button>

//                         <button
//                           className="edit-button"
//                           onClick={() =>
//                             handleEdit(student)
//                           }
//                         >
//                           Edit
//                         </button>

//                         <button
//                           className="delete-button"
//                           onClick={() =>
//                             handleDelete(student)
//                           }
//                         >
//                           Delete
//                         </button>

//                       </div>

//                     </td>

//                   </tr>

//                 ))}

//               </tbody>

//             </table>

//           </div>

//         )}

//       </div>

//     </div>
//   );
// };

// export default StudentManagement;

