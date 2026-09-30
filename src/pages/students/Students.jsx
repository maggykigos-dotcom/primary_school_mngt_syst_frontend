import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import DataTable from "../../components/DataTable/DataTable";

import {
    getStudents,
    deleteStudent,
} from "../../api/adminAPI";

import "../../Styles/ManagementPages.css";

import "./Students.css";

const Students = () => {
    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    /*
     =====================================================
     LOAD STUDENTS
     =====================================================
    */

    const loadStudents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getStudents();

            console.log(
                "STUDENTS RESPONSE:",
                response.data
            );

            setStudents(response.data);
        } catch (error) {
            console.error(
                "FAILED TO LOAD STUDENTS:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load students."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    /*
     =====================================================
     DELETE STUDENT
     =====================================================
    */

    const handleDelete = async (student) => {
        if (!student || !student.id) {
            console.error(
                "Cannot delete student: student data is missing.",
                student
            );
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

            await deleteStudent(student.id);

            setStudents((previousStudents) =>
                previousStudents.filter(
                    (item) => item.id !== student.id
                )
            );

            alert(
                `${studentName} has been deleted successfully.`
            );
        } catch (error) {
            console.error(
                "Error deleting student:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to delete student."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     =====================================================
     SEARCH STUDENTS
     =====================================================
    */

    const filteredStudents = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
            return students;
        }

        return students.filter((student) => {
            const admissionNumber =
                student.admission_number || "";

            const studentName =
                student.student_name ||
                student.name ||
                "";

            const className =
                student.class_name || "";

            return (
                admissionNumber
                    .toLowerCase()
                    .includes(search) ||
                studentName
                    .toLowerCase()
                    .includes(search) ||
                className
                    .toLowerCase()
                    .includes(search)
            );
        });
    }, [students, searchTerm]);

    /*
     =====================================================
     TABLE COLUMNS
     =====================================================
    */

    const columns = [
        {
            key: "admission_number",
            label: "Admission No.",
        },

        {
            key: "student_name",
            label: "Student",
        },

        {
            key: "class_name",
            label: "Class",
        },

        {
            key: "actions",
            label: "Actions",

            /*
             * DataTable passes the cell value first
             * and the complete row second.
             */

            render: (value, student) => {
                if (!student) {
                    return null;
                }

                return (
                    <div className="student-action-buttons">

                        <button
                            type="button"
                            className="student-view-button"
                            onClick={() =>
                                navigate(
                                    `/admin/students/${student.id}`
                                )
                            }
                            title="View Student"
                        >
                            View
                        </button>

                        <button
                            type="button"
                            className="student-edit-button"
                            onClick={() =>
                                navigate(
                                    `/admin/students/edit/${student.id}`
                                )
                            }
                            title="Edit Student"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="student-delete-button"
                            onClick={() =>
                                handleDelete(student)
                            }
                            disabled={
                                deletingId === student.id
                            }
                            title="Delete Student"
                        >
                            {deletingId === student.id
                                ? "Deleting..."
                                : "Delete"}
                        </button>

                    </div>
                );
            },
        },
    ];

    /*
     =====================================================
     PAGE
     =====================================================
    */

    return (
        <DashboardLayout>

            <div className="students-page">

                {/* PAGE HEADER */}

                <div className="students-hero">

                    <div className="students-hero-content">

                        <div className="students-title-area">

                            <div className="students-title-icon">
                                S
                            </div>

                            <div>
                                <h1>
                                    Student Management
                                </h1>

                                <p>
                                    Manage student profiles,
                                    classes and accounts
                                    from one place.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="add-student-button"
                            onClick={() =>
                                navigate(
                                    "/admin/students/add"
                                )
                            }
                        >
                            Add Student
                        </button>

                    </div>

                </div>


                {/* SUMMARY CARDS */}

                <div className="student-summary-grid">

                    <div className="student-summary-card student-summary-total">

                        <div className="student-summary-icon">
                            S
                        </div>

                        <div>
                            <span>
                                Total Students
                            </span>

                            <strong>
                                {students.length}
                            </strong>
                        </div>

                    </div>


                    <div className="student-summary-card student-summary-visible">

                        <div className="student-summary-icon">
                            V
                        </div>

                        <div>
                            <span>
                                Showing
                            </span>

                            <strong>
                                {filteredStudents.length}
                            </strong>
                        </div>

                    </div>


                    <div className="student-summary-card student-summary-status">

                        <div className="student-summary-icon">
                            C
                        </div>

                        <div>
                            <span>
                                Records
                            </span>

                            <strong>
                                Active
                            </strong>
                        </div>

                    </div>

                </div>


                {/* MANAGEMENT CARD */}

                <div className="students-management-card">

                    <div className="students-management-header">

                        <div>
                            <h2>
                                All Students
                            </h2>

                            <p>
                                View, edit or remove student
                                records.
                            </p>
                        </div>


                        <button
                            type="button"
                            className="student-refresh-button"
                            onClick={loadStudents}
                            disabled={loading}
                        >
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                    </div>


                    {/* SEARCH */}

                    <div className="students-toolbar">

                        <div className="student-search-box">

                            <span className="student-search-label">
                                Search Students
                            </span>

                            <input
                                type="text"
                                placeholder="Search by admission number, name or class..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        {searchTerm && (
                            <button
                                type="button"
                                className="student-clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                Clear Search
                            </button>
                        )}

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="students-error">

                            <strong>
                                Unable to load students
                            </strong>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* LOADING */}

                    {loading ? (

                        <div className="students-loading">

                            <div className="students-loading-spinner"></div>

                            <h3>
                                Loading students
                            </h3>

                            <p>
                                Please wait while student
                                records are loaded.
                            </p>

                        </div>

                    ) : filteredStudents.length === 0 ? (

                        <div className="students-empty">

                            <div className="students-empty-icon">
                                S
                            </div>

                            <h3>
                                {searchTerm
                                    ? "No students found"
                                    : "No students available"}
                            </h3>

                            <p>
                                {searchTerm
                                    ? "Try a different search term."
                                    : "There are currently no student records to display."}
                            </p>

                            {searchTerm && (
                                <button
                                    type="button"
                                    className="student-empty-button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                >
                                    Show All Students
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="students-table-wrapper">

                            <DataTable
                                columns={columns}
                                data={filteredStudents}
                            />

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>
    );
};

export default Students;




// import { useEffect, useState } from "react";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";
// import { getStudents } from "../../api/adminAPI";
// import "../../Styles/ManagementPages.css";

// const Students = () => {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const loadStudents = async () => {
//       try {
//         const response = await getStudents();

//         console.log("STUDENTS RESPONSE:", response.data);

//         setStudents(response.data);
//       } catch (error) {
//         console.error("FAILED TO LOAD STUDENTS:", error);
//         setError("Failed to load students.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadStudents();
//   }, []);

//   const columns = [
//     {
//       key: "admission_number",
//       label: "Admission No.",
//     },
//     {
//       key: "student_name",
//       label: "Name",
//     },
//     {
//       key: "class_name",
//       label: "Class",
//     },
//   ];

//   return (
//     <DashboardLayout>
//       <h1>Students</h1>

//       {loading && <p>Loading students...</p>}

//       {error && <p>{error}</p>}

//       {!loading && !error && (
//         <DataTable
//           columns={columns}
//           data={students}
//         />
//       )}
//     </DashboardLayout>
//   );
// };

// export default Students;
