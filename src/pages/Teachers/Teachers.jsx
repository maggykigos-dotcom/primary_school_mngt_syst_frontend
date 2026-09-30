import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import DataTable from "../../components/DataTable/DataTable";

import {
    getTeachers,
    deleteTeacher,
} from "../../api/adminAPI";

import "../../Styles/ManagementPages.css";

import "./Teachers.css";

const Teachers = () => {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    /*
     =====================================================
     LOAD TEACHERS
     =====================================================
    */

    const loadTeachers = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getTeachers();

            console.log(
                "TEACHERS API RESPONSE:",
                response.data
            );

            setTeachers(response.data);
        } catch (error) {
            console.error(
                "Error loading teachers:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load teachers."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTeachers();
    }, []);

    /*
     =====================================================
     DELETE TEACHER
     =====================================================
    */

    const handleDelete = async (teacher) => {
        if (!teacher || !teacher.id) {
            console.error(
                "Cannot delete teacher: teacher data is missing.",
                teacher
            );
            return;
        }

        const teacherName =
            teacher.name ||
            teacher.teacher_name ||
            "this teacher";

        const confirmed = window.confirm(
            `Are you sure you want to delete ${teacherName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(teacher.id);

            await deleteTeacher(teacher.id);

            setTeachers((previousTeachers) =>
                previousTeachers.filter(
                    (item) => item.id !== teacher.id
                )
            );

            alert(
                `${teacherName} has been deleted successfully.`
            );
        } catch (error) {
            console.error(
                "Error deleting teacher:",
                error
            );

            alert(
                error.response?.data?.detail ||
                "Failed to delete teacher."
            );
        } finally {
            setDeletingId(null);
        }
    };

    /*
     =====================================================
     SEARCH TEACHERS
     =====================================================
    */

    const filteredTeachers = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
            return teachers;
        }

        return teachers.filter((teacher) => {
            const name =
                teacher.name ||
                teacher.teacher_name ||
                "";

            const username =
                teacher.username || "";

            const email =
                teacher.email || "";

            const phone =
                teacher.phone_number || "";

            return (
                name.toLowerCase().includes(search) ||
                username.toLowerCase().includes(search) ||
                email.toLowerCase().includes(search) ||
                phone.toLowerCase().includes(search)
            );
        });
    }, [teachers, searchTerm]);

    /*
     =====================================================
     TABLE COLUMNS
     =====================================================
    */

    const columns = [
        {
            key: "name",
            label: "Teacher",
        },

        {
            key: "username",
            label: "Username",
        },

        {
            key: "email",
            label: "Email",
        },

        {
            key: "phone_number",
            label: "Phone",
        },

        {
            key: "actions",
            label: "Actions",

            /*
             * DataTable passes the cell value first
             * and the complete row second.
             */

            render: (value, teacher) => {
                if (!teacher) {
                    return null;
                }

                return (
                    <div className="teacher-action-buttons">

                        <button
                            type="button"
                            className="teacher-view-button"
                            onClick={() =>
                                navigate(
                                    `/admin/teachers/${teacher.id}`
                                )
                            }
                            title="View Teacher"
                        >
                            View
                        </button>

                        <button
                            type="button"
                            className="teacher-edit-button"
                            onClick={() =>
                                navigate(
                                    `/admin/teachers/edit/${teacher.id}`
                                )
                            }
                            title="Edit Teacher"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="teacher-delete-button"
                            onClick={() =>
                                handleDelete(teacher)
                            }
                            disabled={
                                deletingId === teacher.id
                            }
                            title="Delete Teacher"
                        >
                            {deletingId === teacher.id
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

            <div className="teachers-page">

                {/* PAGE HEADER */}

                <div className="teachers-hero">

                    <div className="teachers-hero-content">

                        <div className="teachers-title-area">

                            <div className="teachers-title-icon">
                                T
                            </div>

                            <div>
                                <h1>Teacher Management</h1>

                                <p>
                                    Manage teacher profiles,
                                    accounts and information
                                    from one place.
                                </p>
                            </div>

                        </div>

                        <button
                            type="button"
                            className="add-teacher-button"
                            onClick={() =>
                                navigate(
                                    "/admin/teachers/add"
                                )
                            }
                        >
                            Add Teacher
                        </button>

                    </div>

                </div>


                {/* SUMMARY CARDS */}

                <div className="teacher-summary-grid">

                    <div className="teacher-summary-card teacher-summary-total">

                        <div className="teacher-summary-icon">
                            T
                        </div>

                        <div>
                            <span>
                                Total Teachers
                            </span>

                            <strong>
                                {teachers.length}
                            </strong>
                        </div>

                    </div>


                    <div className="teacher-summary-card teacher-summary-visible">

                        <div className="teacher-summary-icon">
                            V
                        </div>

                        <div>
                            <span>
                                Showing
                            </span>

                            <strong>
                                {filteredTeachers.length}
                            </strong>
                        </div>

                    </div>


                    <div className="teacher-summary-card teacher-summary-status">

                        <div className="teacher-summary-icon">
                            A
                        </div>

                        <div>
                            <span>
                                Management
                            </span>

                            <strong>
                                Active
                            </strong>
                        </div>

                    </div>

                </div>


                {/* MANAGEMENT CARD */}

                <div className="teachers-management-card">

                    <div className="teachers-management-header">

                        <div>
                            <h2>
                                All Teachers
                            </h2>

                            <p>
                                View, edit or remove teacher
                                accounts.
                            </p>
                        </div>


                        <button
                            type="button"
                            className="teacher-refresh-button"
                            onClick={loadTeachers}
                            disabled={loading}
                        >
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                    </div>


                    {/* SEARCH */}

                    <div className="teachers-toolbar">

                        <div className="teacher-search-box">

                            <span className="teacher-search-label">
                                Search
                            </span>

                            <input
                                type="text"
                                placeholder="Search by name, username, email or phone..."
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
                                className="teacher-clear-search"
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
                        <div className="teachers-error">

                            <strong>
                                Unable to load teachers
                            </strong>

                            <span>
                                {error}
                            </span>

                        </div>
                    )}


                    {/* LOADING */}

                    {loading ? (

                        <div className="teachers-loading">

                            <div className="teachers-loading-spinner"></div>

                            <h3>
                                Loading teachers
                            </h3>

                            <p>
                                Please wait while teacher
                                records are loaded.
                            </p>

                        </div>

                    ) : filteredTeachers.length === 0 ? (

                        <div className="teachers-empty">

                            <div className="teachers-empty-icon">
                                T
                            </div>

                            <h3>
                                {searchTerm
                                    ? "No teachers found"
                                    : "No teachers available"}
                            </h3>

                            <p>
                                {searchTerm
                                    ? "Try a different search term."
                                    : "There are currently no teacher records to display."}
                            </p>

                            {searchTerm && (
                                <button
                                    type="button"
                                    className="teacher-empty-button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                >
                                    Show All Teachers
                                </button>
                            )}

                        </div>

                    ) : (

                        <div className="teachers-table-wrapper">

                            <DataTable
                                columns={columns}
                                data={filteredTeachers}
                            />

                        </div>

                    )}

                </div>

            </div>

        </DashboardLayout>
    );
};

export default Teachers;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";

// import {
//     getTeachers,
//     deleteTeacher,
// } from "../../api/adminAPI";

// import "../../Styles/ManagementPages.css";
// import "./Teachers.css";

// const Teachers = () => {
//     const navigate = useNavigate();

//     const [teachers, setTeachers] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [deletingId, setDeletingId] = useState(null);

//     /* =====================================================
//        LOAD TEACHERS
//        ===================================================== */

//     const loadTeachers = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const response = await getTeachers();

//             console.log(
//                 "TEACHERS API RESPONSE:",
//                 response.data
//             );

//             setTeachers(response.data);
//         } catch (error) {
//             console.error(
//                 "Error loading teachers:",
//                 error
//             );

//             setError(
//                 error.response?.data?.detail ||
//                 "Failed to load teachers."
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadTeachers();
//     }, []);

//     /* =====================================================
//        DELETE TEACHER
//        ===================================================== */

//     const handleDelete = async (teacher) => {
//         if (!teacher || !teacher.id) {
//             console.error(
//                 "Cannot delete teacher: teacher data is missing.",
//                 teacher
//             );
//             return;
//         }

//         const teacherName =
//             teacher.name ||
//             teacher.teacher_name ||
//             "this teacher";

//         const confirmed = window.confirm(
//             `Are you sure you want to delete ${teacherName}?`
//         );

//         if (!confirmed) {
//             return;
//         }

//         try {
//             setDeletingId(teacher.id);

//             await deleteTeacher(teacher.id);

//             setTeachers((previousTeachers) =>
//                 previousTeachers.filter(
//                     (item) => item.id !== teacher.id
//                 )
//             );

//             alert(
//                 `${teacherName} has been deleted successfully.`
//             );
//         } catch (error) {
//             console.error(
//                 "Error deleting teacher:",
//                 error
//             );

//             alert(
//                 error.response?.data?.detail ||
//                 "Failed to delete teacher."
//             );
//         } finally {
//             setDeletingId(null);
//         }
//     };

//     /* =====================================================
//        TABLE COLUMNS
//        ===================================================== */

//     const columns = [
//         {
//             key: "name",
//             label: "Name",
//         },

//         {
//             key: "username",
//             label: "Username",
//         },

//         {
//             key: "phone_number",
//             label: "Phone",
//         },

//         {
//             key: "actions",
//             label: "Actions",

//             /*
//              * DataTable passes the cell value first
//              * and the complete row second.
//              */

//             render: (value, teacher) => {
//                 if (!teacher) {
//                     return null;
//                 }

//                 return (
//                     <div className="teacher-action-buttons">

//                         <button
//                             type="button"
//                             className="teacher-view-button"
//                             onClick={() =>
//                                 navigate(
//                                     `/admin/teachers/${teacher.id}`
//                                 )
//                             }
//                             title="View Teacher"
//                         >
//                             View
//                         </button>

//                         <button
//                             type="button"
//                             className="teacher-edit-button"
//                             onClick={() =>
//                                 navigate(
//                                     `/admin/teachers/edit/${teacher.id}`
//                                 )
//                             }
//                             title="Edit Teacher"
//                         >
//                             Edit
//                         </button>

//                         <button
//                             type="button"
//                             className="teacher-delete-button"
//                             onClick={() =>
//                                 handleDelete(teacher)
//                             }
//                             disabled={
//                                 deletingId === teacher.id
//                             }
//                             title="Delete Teacher"
//                         >
//                             {deletingId === teacher.id
//                                 ? "Deleting..."
//                                 : "Delete"}
//                         </button>

//                     </div>
//                 );
//             },
//         },
//     ];

//     /* =====================================================
//        PAGE
//        ===================================================== */

//     return (
//         <DashboardLayout>

//             <div className="teachers-page">

//                 {/* HEADER */}

//                 <div className="teachers-header">

//                     <div>
//                         <h1>All Teachers</h1>

//                         <p>
//                             Manage teacher information,
//                             profiles and accounts.
//                         </p>
//                     </div>

//                     <button
//                         type="button"
//                         className="add-teacher-button"
//                         onClick={() =>
//                             navigate(
//                                 "/admin/teachers/add"
//                             )
//                         }
//                     >
//                         Add Teacher
//                     </button>

//                 </div>

//                 {/* ERROR */}

//                 {error && (
//                     <div className="teachers-error">
//                         {error}
//                     </div>
//                 )}

//                 {/* LOADING */}

//                 {loading ? (
//                     <div className="teachers-loading">
//                         Loading teachers...
//                     </div>
//                 ) : (
//                     <DataTable
//                         columns={columns}
//                         data={teachers}
//                     />
//                 )}

//             </div>

//         </DashboardLayout>
//     );
// };

// export default Teachers;



