import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import DataTable from "../../components/DataTable/DataTable";

import { AuthContext } from "../../context/AuthContext";
import { getAssignments } from "../../api/academicsAPI";

import "./Assignment.css";

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const getSubjectName = (assignment) => {
    return assignment.subject_name || "—";
};

const getClassName = (assignment) => {
    return assignment.class_name || "—";
};

const getGradeName = (assignment) => {
    return assignment.grade_name || "—";
};

const getTeacherName = (assignment) => {
    return assignment.teacher_name || "—";
};

const getStatus = (assignment) => {
    if (!assignment.due_date) {
        return "No due date";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(assignment.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) {
        return "Overdue";
    }

    if (dueDate.getTime() === today.getTime()) {
        return "Due Today";
    }

    return "Upcoming";
};

const formatDate = (date) => {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// ==========================================
// ASSIGNMENTS COMPONENT
// ==========================================

const Assignments = () => {
    const { user } = useContext(AuthContext);

    const navigate = useNavigate();

    // ==========================================
    // ROLE
    // ==========================================

    const isAdmin = user?.role === "admin";
    const isTeacher = user?.role === "teacher";
    const isParent = user?.role === "parent";
    const isStudent = user?.role === "student";

    // ==========================================
    // STATE
    // ==========================================

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [gradeFilter, setGradeFilter] = useState("all");
    const [subjectFilter, setSubjectFilter] = useState("all");

    // ==========================================
    // LOAD ASSIGNMENTS
    // ==========================================

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getAssignments();

                const assignmentData = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.results)
                        ? data.results
                        : [];

                console.log("Assignments:", assignmentData);

                setAssignments(assignmentData);
            } catch (error) {
                console.error(
                    "Failed to load assignments:",
                    error.response?.data || error
                );

                setError("Failed to load assignments.");
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        };

        loadAssignments();
    }, []);

    // ==========================================
    // AVAILABLE GRADES
    // ==========================================

    const grades = useMemo(() => {
        return [
            ...new Set(
                assignments
                    .map((assignment) => getGradeName(assignment))
                    .filter((grade) => grade !== "—")
            ),
        ];
    }, [assignments]);

    // ==========================================
    // AVAILABLE SUBJECTS
    // ==========================================

    const subjects = useMemo(() => {
        return [
            ...new Set(
                assignments
                    .map((assignment) => getSubjectName(assignment))
                    .filter((subject) => subject !== "—")
            ),
        ];
    }, [assignments]);

    // ==========================================
    // FILTER ASSIGNMENTS
    // ==========================================

    const filteredAssignments = useMemo(() => {
        const searchText = search.toLowerCase().trim();

        return assignments.filter((assignment) => {
            const title =
                assignment.title ||
                assignment.name ||
                "";

            const subject = getSubjectName(assignment);
            const grade = getGradeName(assignment);
            const className = getClassName(assignment);
            const teacher = getTeacherName(assignment);

            const matchesSearch =
                !searchText ||
                title.toLowerCase().includes(searchText) ||
                subject.toLowerCase().includes(searchText) ||
                grade.toLowerCase().includes(searchText) ||
                className.toLowerCase().includes(searchText) ||
                teacher.toLowerCase().includes(searchText);

            // Grade filtering is primarily for admin.
            // Teachers already receive only their assignments
            // from the backend.

            const matchesGrade =
                !isAdmin ||
                gradeFilter === "all" ||
                grade === gradeFilter;

            const matchesSubject =
                subjectFilter === "all" ||
                subject === subjectFilter;

            return (
                matchesSearch &&
                matchesGrade &&
                matchesSubject
            );
        });
    }, [
        assignments,
        search,
        gradeFilter,
        subjectFilter,
        isAdmin,
    ]);

    // ==========================================
    // STATISTICS
    // ==========================================

    const totalAssignments = assignments.length;

    const overdueAssignments = assignments.filter(
        (assignment) =>
            getStatus(assignment) === "Overdue"
    ).length;

    const dueToday = assignments.filter(
        (assignment) =>
            getStatus(assignment) === "Due Today"
    ).length;

    const upcomingAssignments = assignments.filter(
        (assignment) =>
            getStatus(assignment) === "Upcoming"
    ).length;

    // ==========================================
    // TABLE COLUMNS
    // ==========================================

    const columns = useMemo(() => {
        const baseColumns = [
            {
                key: "title",
                label: "Assignment",

                render: (value, row) => (
                    <strong>
                        {value ||
                            row.name ||
                            "Untitled Assignment"}
                    </strong>
                ),
            },

            {
                key: "subject_name",
                label: "Subject",

                render: (_, row) =>
                    getSubjectName(row),
            },

            {
                key: "grade_name",
                label: "Grade",

                render: (_, row) => (
                    <span className="assignment-grade">
                        {getGradeName(row)}
                    </span>
                ),
            },

            {
                key: "class_name",
                label: "Class",

                render: (_, row) =>
                    getClassName(row),
            },

            {
                key: "due_date",
                label: "Due Date",

                render: (value) =>
                    formatDate(value),
            },
        ];

        // ==========================================
        // ADMIN ONLY: TEACHER COLUMN
        // ==========================================

        if (isAdmin) {
            baseColumns.push({
                key: "teacher_name",
                label: "Teacher",

                render: (_, row) =>
                    getTeacherName(row),
            });
        }

        // ==========================================
        // STATUS
        // ==========================================

        baseColumns.push({
            key: "status",
            label: "Status",

            render: (_, row) => {
                const status = getStatus(row);

                return (
                    <span
                        className={`assignment-status ${status
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                    >
                        {status}
                    </span>
                );
            },
        });

        // ==========================================
        // STUDENT ONLY: VIEW QUIZ
        // ==========================================

        if (isStudent) {
            baseColumns.push({
                key: "quiz_action",
                label: "Action",

                render: (_, row) => (
                    <button
                        type="button"
                        className="assignment-action-button"
                        onClick={() =>
                            navigate(
                                `/assignments/${row.id}/quiz`
                            )
                        }
                    >
                        View Quiz
                    </button>
                ),
            });
        }

        return baseColumns;
    }, [isAdmin, isStudent, navigate]);

    // ==========================================
    // PAGE TITLE
    // ==========================================

    const pageTitle = isTeacher
        ? "My Assignments"
        : "Assignments";

    // ==========================================
    // PAGE DESCRIPTION
    // ==========================================

    const pageDescription = isTeacher
        ? "Manage assignments for your assigned classes."
        : isAdmin
            ? "Manage assignments across all grades and classes."
            : isParent
                ? "View assignments for your children."
                : isStudent
                    ? "View assignments for your class."
                    : "View and manage assignments.";

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <DashboardLayout>
            <div className="assignments-page">

                {/* ==================================
                    HEADER
                ================================== */}

                <div className="dashboard-header">
                    <div>
                        <h1>{pageTitle}</h1>

                        <p>{pageDescription}</p>
                    </div>
                </div>

                {/* ==================================
                    SUMMARY CARDS
                ================================== */}

                {!loading && !error && (
                    <div className="stats-grid">

                        {/* TOTAL */}

                        <div className="dashboard-panel">
                            <h3>
                                {isTeacher
                                    ? "My Assignments"
                                    : "Total Assignments"}
                            </h3>

                            <h2>
                                {totalAssignments}
                            </h2>
                        </div>

                        {/* UPCOMING */}

                        <div className="dashboard-panel">
                            <h3>Upcoming</h3>

                            <h2>
                                {upcomingAssignments}
                            </h2>
                        </div>

                        {/* DUE TODAY */}

                        <div className="dashboard-panel">
                            <h3>Due Today</h3>

                            <h2>
                                {dueToday}
                            </h2>
                        </div>

                        {/* OVERDUE */}

                        <div className="dashboard-panel">
                            <h3>Overdue</h3>

                            <h2>
                                {overdueAssignments}
                            </h2>
                        </div>
                    </div>
                )}

                {/* ==================================
                    SEARCH & FILTERS
                ================================== */}

                {!loading && !error && (
                    <div className="dashboard-panel assignment-filters">

                        {/* SEARCH */}

                        <input
                            type="text"
                            placeholder={
                                isTeacher
                                    ? "Search your assignments, subjects, classes..."
                                    : "Search assignments, subjects, grades, classes..."
                            }
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                        {/* ==================================
                            ADMIN ONLY: GRADE FILTER
                        ================================== */}

                        {isAdmin && (
                            <select
                                value={gradeFilter}
                                onChange={(e) =>
                                    setGradeFilter(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="all">
                                    All Grades
                                </option>

                                {grades.map((grade) => (
                                    <option
                                        key={grade}
                                        value={grade}
                                    >
                                        {grade}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* SUBJECT FILTER */}

                        <select
                            value={subjectFilter}
                            onChange={(e) =>
                                setSubjectFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Subjects
                            </option>

                            {subjects.map((subject) => (
                                <option
                                    key={subject}
                                    value={subject}
                                >
                                    {subject}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* ==================================
                    LOADING
                ================================== */}

                {loading && (
                    <div className="dashboard-panel">
                        Loading assignments...
                    </div>
                )}

                {/* ==================================
                    ERROR
                ================================== */}

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}

                {/* ==================================
                    ASSIGNMENTS TABLE
                ================================== */}

                {!loading && !error && (
                    <div className="dashboard-panel">

                        <div className="assignment-table-header">
                            <div>
                                <h2>
                                    {isTeacher
                                        ? "My Assignments"
                                        : isAdmin
                                            ? "All Assignments"
                                            : "Assignments"}
                                </h2>

                                <p>
                                    Showing{" "}
                                    {
                                        filteredAssignments.length
                                    }{" "}
                                    of{" "}
                                    {assignments.length}{" "}
                                    assignments
                                </p>
                            </div>
                        </div>

                        {/* ==================================
                            EMPTY STATE
                        ================================== */}

                        {filteredAssignments.length === 0 ? (
                            <div className="empty-state">

                                <div className="empty-state-icon">
                                    📝
                                </div>

                                <h3>
                                    {assignments.length === 0
                                        ? isTeacher
                                            ? "You have no assignments yet"
                                            : "No assignments found"
                                        : "No assignments match your filters"}
                                </h3>

                                <p>
                                    {assignments.length === 0
                                        ? isTeacher
                                            ? "Assignments for your classes will appear here."
                                            : "There are currently no assignments available."
                                        : "Try changing your search or filters."}
                                </p>
                            </div>
                        ) : (
                            /* ==================================
                               DATA TABLE
                            ================================== */

                            <DataTable
                                columns={columns}
                                data={filteredAssignments}
                            />
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Assignments;