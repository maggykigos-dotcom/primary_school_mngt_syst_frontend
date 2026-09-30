import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

import "./Attendance.css";

const Attendance = () => {
    const { user } = useContext(AuthContext);

    const [attendance, setAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==================================================
    // GENERAL FILTERS
    // ==================================================

    const [gradeFilter, setGradeFilter] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [studentSearch, setStudentSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [dayFilter, setDayFilter] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // ==================================================
    // PARENT CHILD FILTER
    // ==================================================

    const [selectedChild, setSelectedChild] = useState("");

    // ==================================================
    // LOAD ATTENDANCE
    // ==================================================

    useEffect(() => {
        const loadAttendance = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await axios.get(
                    "academics/attendance/"
                );

                const data = response.data;

                if (Array.isArray(data)) {
                    setAttendance(data);
                } else if (Array.isArray(data.results)) {
                    setAttendance(data.results);
                } else {
                    setAttendance([]);
                }
            } catch (err) {
                console.error(
                    "Error loading attendance:",
                    err
                );

                setError(
                    err.response?.data?.detail ||
                        "Unable to load attendance records."
                );
            } finally {
                setLoading(false);
            }
        };

        loadAttendance();
    }, []);

    // ==================================================
    // HELPERS
    // ==================================================

    const getGradeName = (schoolClass) => {
        if (!schoolClass) return "";

        const match = schoolClass.match(/Grade\s*\d+/i);

        return match ? match[0] : schoolClass;
    };

    const formatDate = (date) => {
        if (!date) return "—";

        const parsed = new Date(`${date}T00:00:00`);

        return parsed.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getDayName = (date) => {
        if (!date) return "—";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-US",
            {
                weekday: "long",
            }
        );
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "present":
                return "status-present";

            case "absent":
                return "status-absent";

            case "late":
                return "status-late";

            case "excused":
                return "status-excused";

            default:
                return "";
        }
    };

    // ==================================================
    // MONTHS / DAYS / STATUSES
    // ==================================================

    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    const months = [
        { value: "1", label: "January" },
        { value: "2", label: "February" },
        { value: "3", label: "March" },
        { value: "4", label: "April" },
        { value: "5", label: "May" },
        { value: "6", label: "June" },
        { value: "7", label: "July" },
        { value: "8", label: "August" },
        { value: "9", label: "September" },
        { value: "10", label: "October" },
        { value: "11", label: "November" },
        { value: "12", label: "December" },
    ];

    const statuses = [
        {
            value: "present",
            label: "Present",
        },
        {
            value: "absent",
            label: "Absent",
        },
        {
            value: "late",
            label: "Late",
        },
        {
            value: "excused",
            label: "Excused",
        },
    ];

    // ==================================================
    // UNIQUE GRADES
    // ==================================================

    const grades = useMemo(() => {
        const values = attendance
            .map((record) =>
                getGradeName(record.school_class_name)
            )
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [attendance]);

    // ==================================================
    // UNIQUE CLASSES
    // ==================================================

    const classNames = useMemo(() => {
        let records = attendance;

        if (gradeFilter) {
            records = records.filter(
                (record) =>
                    getGradeName(record.school_class_name) ===
                    gradeFilter
            );
        }

        const values = records
            .map((record) => record.school_class_name)
            .filter(Boolean);

        return [...new Set(values)].sort();
    }, [attendance, gradeFilter]);

    // ==================================================
    // PARENT CHILDREN
    // ==================================================

    const children = useMemo(() => {
        const map = new Map();

        attendance.forEach((record) => {
            if (!record.student) return;

            if (!map.has(String(record.student))) {
                map.set(String(record.student), {
                    id: record.student,
                    name:
                        record.student_name ||
                        "Student",
                    profile_picture:
                        record.profile_picture || null,
                });
            }
        });

        return Array.from(map.values());
    }, [attendance]);

    // ==================================================
    // FILTER ATTENDANCE
    // ==================================================

    const filteredAttendance = useMemo(() => {
        return attendance.filter((record) => {
            const recordDate = new Date(
                `${record.date}T00:00:00`
            );

            // ------------------------------------------
            // PARENT CHILD FILTER
            // ------------------------------------------

            if (
                user?.role === "parent" &&
                selectedChild
            ) {
                if (
                    String(record.student) !==
                    String(selectedChild)
                ) {
                    return false;
                }
            }

            // ------------------------------------------
            // GRADE
            // ------------------------------------------

            if (gradeFilter) {
                const recordGrade = getGradeName(
                    record.school_class_name
                );

                if (recordGrade !== gradeFilter) {
                    return false;
                }
            }

            // ------------------------------------------
            // CLASS
            // ------------------------------------------

            if (classFilter) {
                if (
                    record.school_class_name !==
                    classFilter
                ) {
                    return false;
                }
            }

            // ------------------------------------------
            // STUDENT SEARCH
            // ------------------------------------------

            if (studentSearch.trim()) {
                const search =
                    studentSearch
                        .trim()
                        .toLowerCase();

                const studentName = (
                    record.student_name || ""
                ).toLowerCase();

                const admissionNumber = (
                    record.admission_number || ""
                ).toLowerCase();

                if (
                    !studentName.includes(search) &&
                    !admissionNumber.includes(search)
                ) {
                    return false;
                }
            }

            // ------------------------------------------
            // MONTH
            // ------------------------------------------

            if (monthFilter) {
                const month =
                    recordDate.getMonth() + 1;

                if (
                    String(month) !==
                    String(monthFilter)
                ) {
                    return false;
                }
            }

            // ------------------------------------------
            // DAY
            // ------------------------------------------

            if (dayFilter) {
                const day =
                    recordDate.toLocaleDateString(
                        "en-US",
                        {
                            weekday: "long",
                        }
                    );

                if (day !== dayFilter) {
                    return false;
                }
            }

            // ------------------------------------------
            // FROM DATE
            // ------------------------------------------

            if (fromDate && record.date < fromDate) {
                return false;
            }

            // ------------------------------------------
            // TO DATE
            // ------------------------------------------

            if (toDate && record.date > toDate) {
                return false;
            }

            // ------------------------------------------
            // STATUS
            // ------------------------------------------

            if (statusFilter) {
                if (record.status !== statusFilter) {
                    return false;
                }
            }

            return true;
        });
    }, [
        attendance,
        user?.role,
        selectedChild,
        gradeFilter,
        classFilter,
        studentSearch,
        monthFilter,
        dayFilter,
        fromDate,
        toDate,
        statusFilter,
    ]);

    // ==================================================
    // RESET FILTERS
    // ==================================================

    const resetFilters = () => {
        setGradeFilter("");
        setClassFilter("");
        setStudentSearch("");
        setMonthFilter("");
        setDayFilter("");
        setFromDate("");
        setToDate("");
        setStatusFilter("");
    };

    const resetParentFilters = () => {
        setSelectedChild("");
        setStudentSearch("");
        setMonthFilter("");
        setDayFilter("");
        setFromDate("");
        setToDate("");
        setStatusFilter("");
    };

    // ==================================================
    // SUMMARY
    // ==================================================

    const summary = useMemo(() => {
        const records = filteredAttendance;

        return {
            total: records.length,

            present: records.filter(
                (record) =>
                    record.status === "present"
            ).length,

            absent: records.filter(
                (record) =>
                    record.status === "absent"
            ).length,

            late: records.filter(
                (record) =>
                    record.status === "late"
            ).length,

            excused: records.filter(
                (record) =>
                    record.status === "excused"
            ).length,
        };
    }, [filteredAttendance]);

    const attendanceRate =
        summary.total > 0
            ? Math.round(
                  (summary.present /
                      summary.total) *
                      100
              )
            : 0;

    // ==================================================
    // STUDENT SUMMARY
    // ==================================================

    const studentSummary = useMemo(() => {
        const records = attendance;

        const present = records.filter(
            (record) =>
                record.status === "present"
        ).length;

        const absent = records.filter(
            (record) =>
                record.status === "absent"
        ).length;

        const late = records.filter(
            (record) =>
                record.status === "late"
        ).length;

        const excused = records.filter(
            (record) =>
                record.status === "excused"
        ).length;

        const total = records.length;

        return {
            total,
            present,
            absent,
            late,
            excused,
            rate:
                total > 0
                    ? Math.round(
                          (present / total) *
                              100
                      )
                    : 0,
        };
    }, [attendance]);

    // ==================================================
    // STUDENT PROFILE
    // ==================================================

    const StudentProfile = ({ record }) => {
        return (
            <div className="attendance-student">
                <div className="student-avatar">
                    {record.profile_picture ? (
                        <img
                            src={
                                record.profile_picture
                            }
                            alt={
                                record.student_name ||
                                "Student"
                            }
                            className="attendance-profile-picture"
                        />
                    ) : (
                        <span>
                            {record.student_name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "S"}
                        </span>
                    )}
                </div>

                <div>
                    <strong>
                        {record.student_name ||
                            "Unknown Student"}
                    </strong>

                    {record.admission_number && (
                        <small>
                            {record.admission_number}
                        </small>
                    )}
                </div>
            </div>
        );
    };

    // ==================================================
    // FILTER PANEL
    // ==================================================

    const renderFilterPanel = ({
        parent = false,
    } = {}) => (
        <div className="attendance-filter-card">
            <div className="filter-title">
                <div>
                    <h2>
                        🔎 Attendance Filters
                    </h2>

                    <p>
                        {parent
                            ? "Search attendance for a specific child."
                            : "Use one or more filters to find specific records."}
                    </p>
                </div>

                <button
                    type="button"
                    className="reset-filter-btn"
                    onClick={
                        parent
                            ? resetParentFilters
                            : resetFilters
                    }
                >
                    ↻ Reset
                </button>
            </div>

            <div className="attendance-filters">

                {/* PARENT CHILD */}
                {parent && (
                    <label>
                        <span>Child</span>

                        <select
                            value={selectedChild}
                            onChange={(e) =>
                                setSelectedChild(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                All Children
                            </option>

                            {children.map(
                                (child) => (
                                    <option
                                        key={
                                            child.id
                                        }
                                        value={
                                            child.id
                                        }
                                    >
                                        {child.name}
                                    </option>
                                )
                            )}
                        </select>
                    </label>
                )}

                {/* GRADE */}
                {!parent && (
                    <label>
                        <span>Grade</span>

                        <select
                            value={gradeFilter}
                            onChange={(e) => {
                                setGradeFilter(
                                    e.target.value
                                );

                                setClassFilter("");
                            }}
                        >
                            <option value="">
                                All Grades
                            </option>

                            {grades.map(
                                (grade) => (
                                    <option
                                        key={
                                            grade
                                        }
                                        value={
                                            grade
                                        }
                                    >
                                        {grade}
                                    </option>
                                )
                            )}
                        </select>
                    </label>
                )}

                {/* CLASS */}
                {!parent && (
                    <label>
                        <span>Class</span>

                        <select
                            value={classFilter}
                            onChange={(e) =>
                                setClassFilter(
                                    e.target.value
                                )
                            }
                        >
                            <option value="">
                                All Classes
                            </option>

                            {classNames.map(
                                (className) => (
                                    <option
                                        key={
                                            className
                                        }
                                        value={
                                            className
                                        }
                                    >
                                        {className}
                                    </option>
                                )
                            )}
                        </select>
                    </label>
                )}

                {/* STUDENT */}
                <label>
                    <span>
                        {parent
                            ? "Search Child"
                            : "Search Student"}
                    </span>

                    <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) =>
                            setStudentSearch(
                                e.target.value
                            )
                        }
                        placeholder={
                            parent
                                ? "Search child..."
                                : "Name or admission no..."
                        }
                    />
                </label>

                {/* MONTH */}
                <label>
                    <span>Month</span>

                    <select
                        value={monthFilter}
                        onChange={(e) =>
                            setMonthFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            All Months
                        </option>

                        {months.map(
                            (month) => (
                                <option
                                    key={
                                        month.value
                                    }
                                    value={
                                        month.value
                                    }
                                >
                                    {month.label}
                                </option>
                            )
                        )}
                    </select>
                </label>

                {/* DAY */}
                <label>
                    <span>Day</span>

                    <select
                        value={dayFilter}
                        onChange={(e) =>
                            setDayFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            All Days
                        </option>

                        {days.map((day) => (
                            <option
                                key={day}
                                value={day}
                            >
                                {day}
                            </option>
                        ))}
                    </select>
                </label>

                {/* STATUS */}
                <label>
                    <span>Status</span>

                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(
                                e.target.value
                            )
                        }
                    >
                        <option value="">
                            All Statuses
                        </option>

                        {statuses.map(
                            (status) => (
                                <option
                                    key={
                                        status.value
                                    }
                                    value={
                                        status.value
                                    }
                                >
                                    {status.label}
                                </option>
                            )
                        )}
                    </select>
                </label>

                {/* FROM */}
                <label>
                    <span>From Date</span>

                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) =>
                            setFromDate(
                                e.target.value
                            )
                        }
                    />
                </label>

                {/* TO */}
                <label>
                    <span>To Date</span>

                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) =>
                            setToDate(
                                e.target.value
                            )
                        }
                    />
                </label>
            </div>

            <div className="filter-result-count">
                Showing{" "}
                <strong>
                    {filteredAttendance.length}
                </strong>{" "}
                attendance record(s)
            </div>
        </div>
    );

    // ==================================================
    // SUMMARY CARDS
    // ==================================================

    const renderSummary = () => (
        <div className="attendance-summary">
            <div className="attendance-summary-card total-card">
                <span>Total</span>
                <strong>
                    {summary.total}
                </strong>
            </div>

            <div className="attendance-summary-card present-card">
                <span>Present</span>
                <strong>
                    {summary.present}
                </strong>
            </div>

            <div className="attendance-summary-card absent-card">
                <span>Absent</span>
                <strong>
                    {summary.absent}
                </strong>
            </div>

            <div className="attendance-summary-card late-card">
                <span>Late</span>
                <strong>
                    {summary.late}
                </strong>
            </div>

            <div className="attendance-summary-card excused-card">
                <span>Excused</span>
                <strong>
                    {summary.excused}
                </strong>
            </div>
        </div>
    );

    // ==================================================
    // HISTORY TABLE
    // ==================================================

    const renderAttendanceTable = (
        records,
        title = "📋 Attendance History"
    ) => {
        if (loading) {
            return (
                <div className="attendance-table-card">
                    <div className="attendance-loading">
                        <div className="loading-spinner"></div>

                        <p>
                            Loading attendance...
                        </p>
                    </div>
                </div>
            );
        }

        if (!records.length) {
            return (
                <div className="attendance-table-card">
                    <div className="attendance-empty">
                        <div className="empty-icon">
                            📭
                        </div>

                        <h3>
                            No attendance records found
                        </h3>

                        <p>
                            Try changing or resetting
                            your filters.
                        </p>
                    </div>
                </div>
            );
        }

        return (
            <div className="attendance-table-card">
                <div className="table-heading">
                    <div>
                        <h2>{title}</h2>

                        <p>
                            Showing{" "}
                            <strong>
                                {records.length}
                            </strong>{" "}
                            record(s)
                        </p>
                    </div>
                </div>

                <div className="attendance-table-wrapper">
                    <table className="attendance-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Student</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Day</th>
                                <th>Status</th>
                                <th>Reason</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.map(
                                (
                                    record,
                                    index
                                ) => (
                                    <tr
                                        key={
                                            record.id ||
                                            index
                                        }
                                    >
                                        <td>
                                            {index +
                                                1}
                                        </td>

                                        <td>
                                            <StudentProfile
                                                record={
                                                    record
                                                }
                                            />
                                        </td>

                                        <td>
                                            <span className="class-badge">
                                                {record.school_class_name ||
                                                    "—"}
                                            </span>
                                        </td>

                                        <td>
                                            {formatDate(
                                                record.date
                                            )}
                                        </td>

                                        <td>
                                            {getDayName(
                                                record.date
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`status-badge ${getStatusClass(
                                                    record.status
                                                )}`}
                                            >
                                                {record.status
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase() +
                                                    record.status?.slice(
                                                        1
                                                    )}
                                            </span>
                                        </td>

                                        <td>
                                            {record.reason ||
                                                "—"}
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ==================================================
    // ADMIN VIEW
    // ==================================================

    const renderAdmin = () => (
        <div className="attendance-page">
            <div className="attendance-header">
                <div>
                    <h1>
                        📊 Attendance Management
                    </h1>

                    <p>
                        Monitor and filter student
                        attendance records.
                    </p>
                </div>

                <div className="attendance-rate-box">
                    <span>
                        Attendance Rate
                    </span>

                    <strong>
                        {attendanceRate}%
                    </strong>
                </div>
            </div>

            {error && (
                <div className="attendance-alert error">
                    ⚠️ {error}
                </div>
            )}

            {renderFilterPanel()}

            {renderSummary()}

            {renderAttendanceTable(
                filteredAttendance,
                "📋 Attendance Records"
            )}
        </div>
    );

    // ==================================================
    // TEACHER VIEW
    // ==================================================

    const renderTeacher = () => (
        <div className="attendance-page">
            <div className="attendance-header">
                <div>
                    <h1>
                        📊 My Class Attendance
                    </h1>

                    <p>
                        Search attendance for students
                        in your assigned classes.
                    </p>
                </div>

                <div className="attendance-rate-box">
                    <span>
                        Attendance Rate
                    </span>

                    <strong>
                        {attendanceRate}%
                    </strong>
                </div>
            </div>

            {error && (
                <div className="attendance-alert error">
                    ⚠️ {error}
                </div>
            )}

            {renderFilterPanel()}

            {renderSummary()}

            {renderAttendanceTable(
                filteredAttendance,
                "📋 My Students' Attendance"
            )}
        </div>
    );

    // ==================================================
    // PARENT VIEW
    // ==================================================

    const renderParent = () => {
        const selectedChildData =
            children.find(
                (child) =>
                    String(child.id) ===
                    String(selectedChild)
            );

        return (
            <div className="attendance-page">
                <div className="attendance-header">
                    <div>
                        <h1>
                            👨‍👩‍👧 Children Attendance
                        </h1>

                        <p>
                            Search and monitor attendance
                            for your children.
                        </p>
                    </div>

                    <div className="attendance-rate-box">
                        <span>
                            Attendance Rate
                        </span>

                        <strong>
                            {attendanceRate}%
                        </strong>
                    </div>
                </div>

                {error && (
                    <div className="attendance-alert error">
                        ⚠️ {error}
                    </div>
                )}

                {selectedChildData && (
                    <div className="selected-child-banner">
                        <div className="selected-child-avatar">
                            {selectedChildData.profile_picture ? (
                                <img
                                    src={
                                        selectedChildData.profile_picture
                                    }
                                    alt={
                                        selectedChildData.name
                                    }
                                />
                            ) : (
                                <span>
                                    {selectedChildData.name
                                        ?.charAt(0)
                                        ?.toUpperCase()}
                                </span>
                            )}
                        </div>

                        <div>
                            <small>
                                Viewing attendance for
                            </small>

                            <strong>
                                {
                                    selectedChildData.name
                                }
                            </strong>
                        </div>
                    </div>
                )}

                {renderFilterPanel({
                    parent: true,
                })}

                {renderSummary()}

                {renderAttendanceTable(
                    filteredAttendance,
                    selectedChildData
                        ? `📋 ${selectedChildData.name}'s Attendance`
                        : "📋 Children's Attendance"
                )}
            </div>
        );
    };

    // ==================================================
    // STUDENT VIEW
    // ==================================================

    const renderStudent = () => (
        <div className="attendance-page">
            <div className="attendance-header">
                <div>
                    <h1>
                        📅 My Attendance
                    </h1>

                    <p>
                        View your attendance history.
                    </p>
                </div>

                <div className="attendance-rate-box">
                    <span>
                        Attendance Rate
                    </span>

                    <strong>
                        {studentSummary.rate}%
                    </strong>
                </div>
            </div>

            <div className="attendance-summary">
                <div className="attendance-summary-card total-card">
                    <span>Total</span>
                    <strong>
                        {studentSummary.total}
                    </strong>
                </div>

                <div className="attendance-summary-card present-card">
                    <span>Present</span>
                    <strong>
                        {studentSummary.present}
                    </strong>
                </div>

                <div className="attendance-summary-card absent-card">
                    <span>Absent</span>
                    <strong>
                        {studentSummary.absent}
                    </strong>
                </div>

                <div className="attendance-summary-card late-card">
                    <span>Late</span>
                    <strong>
                        {studentSummary.late}
                    </strong>
                </div>
            </div>

            {renderAttendanceTable(
                attendance,
                "📋 My Attendance History"
            )}
        </div>
    );

    // ==================================================
    // MAIN CONTENT
    // ==================================================

    const renderContent = () => {
        if (user?.role === "admin") {
            return renderAdmin();
        }

        if (user?.role === "teacher") {
            return renderTeacher();
        }

        if (user?.role === "parent") {
            return renderParent();
        }

        if (user?.role === "student") {
            return renderStudent();
        }

        return (
            <div className="attendance-page">
                <div className="attendance-empty">
                    <h3>
                        You do not have access to
                        attendance.
                    </h3>
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            {renderContent()}
        </DashboardLayout>
    );
};

export default Attendance;



// import React, { useContext, useEffect, useMemo, useState } from "react";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import axios from "../../api/axios";
// import { AuthContext } from "../../context/AuthContext";
// import "./Attendance.css";

// const Attendance = () => {
//   const { user } = useContext(AuthContext);

//   const [attendance, setAttendance] = useState([]);
  

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Admin filters
//   const [gradeFilter, setGradeFilter] = useState("");
//   const [classFilter, setClassFilter] = useState("");
//   const [studentSearch, setStudentSearch] = useState("");
//   const [monthFilter, setMonthFilter] = useState("");
//   const [dayFilter, setDayFilter] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   // Parent selected child
//   const [selectedChild, setSelectedChild] = useState("");

//   // --------------------------------------------------
//   // LOAD ATTENDANCE
//   // --------------------------------------------------

//   useEffect(() => {
//     const loadAttendance = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await axios.get(
//           "academics/attendance/"
//         );

//         const data = response.data;

//         if (Array.isArray(data)) {
//           setAttendance(data);
//         } else if (Array.isArray(data.results)) {
//           setAttendance(data.results);
//         } else {
//           setAttendance([]);
//         }
//       } catch (err) {
//         console.error(
//           "Error loading attendance:",
//           err
//         );

//         setError(
//           err.response?.data?.detail ||
//             "Unable to load attendance records."
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadAttendance();
//   }, []);

//   // --------------------------------------------------
//   // LOAD CLASSES
//   // --------------------------------------------------


//   // --------------------------------------------------
//   // EXTRACT GRADE NAME
//   // --------------------------------------------------

//   const getGradeName = (schoolClass) => {
//     if (!schoolClass) return "";

//     /*
//       Your current backend returns the class as a string
//       through school_class_name.

//       Examples could be:
//       "Grade 1 - A"
//       "Grade 1 A"
//       "Grade 2 - B"

//       This function attempts to extract the Grade part.
//     */

//     const match = schoolClass.match(
//       /Grade\s*\d+/i
//     );

//     return match ? match[0] : schoolClass;
//   };

//   // --------------------------------------------------
//   // UNIQUE GRADES
//   // --------------------------------------------------

//   const grades = useMemo(() => {
//     const values = attendance
//       .map((record) =>
//         getGradeName(record.school_class_name)
//       )
//       .filter(Boolean);

//     return [...new Set(values)];
//   }, [attendance]);

//   // --------------------------------------------------
//   // UNIQUE CLASSES
//   // --------------------------------------------------

//   const classNames = useMemo(() => {
//     const values = attendance
//       .map((record) => record.school_class_name)
//       .filter(Boolean);

//     return [...new Set(values)].sort();
//   }, [attendance]);

//   // --------------------------------------------------
//   // DAYS
//   // --------------------------------------------------

//   const days = [
//     "Sunday",
//     "Monday",
//     "Tuesday",
//     "Wednesday",
//     "Thursday",
//     "Friday",
//     "Saturday",
//   ];

//   // --------------------------------------------------
//   // MONTHS
//   // --------------------------------------------------

//   const months = [
//     { value: "1", label: "January" },
//     { value: "2", label: "February" },
//     { value: "3", label: "March" },
//     { value: "4", label: "April" },
//     { value: "5", label: "May" },
//     { value: "6", label: "June" },
//     { value: "7", label: "July" },
//     { value: "8", label: "August" },
//     { value: "9", label: "September" },
//     { value: "10", label: "October" },
//     { value: "11", label: "November" },
//     { value: "12", label: "December" },
//   ];

//   // --------------------------------------------------
//   // FILTER ATTENDANCE
//   // --------------------------------------------------

//   const filteredAttendance = useMemo(() => {
//     return attendance.filter((record) => {
//       const recordDate = new Date(
//         `${record.date}T00:00:00`
//       );

//       // Grade
//       if (gradeFilter) {
//         const recordGrade = getGradeName(
//           record.school_class_name
//         );

//         if (recordGrade !== gradeFilter) {
//           return false;
//         }
//       }

//       // Class
//       if (classFilter) {
//         if (
//           record.school_class_name !==
//           classFilter
//         ) {
//           return false;
//         }
//       }

//       // Student name
//       if (studentSearch.trim()) {
//         const search =
//           studentSearch
//             .trim()
//             .toLowerCase();

//         const studentName = (
//           record.student_name || ""
//         ).toLowerCase();

//         if (!studentName.includes(search)) {
//           return false;
//         }
//       }

//       // Month
//       if (monthFilter) {
//         const month =
//           recordDate.getMonth() + 1;

//         if (
//           String(month) !==
//           String(monthFilter)
//         ) {
//           return false;
//         }
//       }

//       // Day
//       if (dayFilter) {
//         const day =
//           recordDate.toLocaleDateString(
//             "en-US",
//             {
//               weekday: "long",
//             }
//           );

//         if (day !== dayFilter) {
//           return false;
//         }
//       }

//       // From date
//       if (fromDate) {
//         if (record.date < fromDate) {
//           return false;
//         }
//       }

//       // To date
//       if (toDate) {
//         if (record.date > toDate) {
//           return false;
//         }
//       }

//       return true;
//     });
//   }, [
//     attendance,
//     gradeFilter,
//     classFilter,
//     studentSearch,
//     monthFilter,
//     dayFilter,
//     fromDate,
//     toDate,
//   ]);

//   // --------------------------------------------------
//   // RESET FILTERS
//   // --------------------------------------------------

//   const resetFilters = () => {
//     setGradeFilter("");
//     setClassFilter("");
//     setStudentSearch("");
//     setMonthFilter("");
//     setDayFilter("");
//     setFromDate("");
//     setToDate("");
//   };

//   // --------------------------------------------------
//   // SUMMARY
//   // --------------------------------------------------

//   const summary = useMemo(() => {
//     return {
//       total: filteredAttendance.length,

//       present: filteredAttendance.filter(
//         (record) =>
//           record.status === "present"
//       ).length,

//       absent: filteredAttendance.filter(
//         (record) =>
//           record.status === "absent"
//       ).length,

//       late: filteredAttendance.filter(
//         (record) =>
//           record.status === "late"
//       ).length,

//       excused: filteredAttendance.filter(
//         (record) =>
//           record.status === "excused"
//       ).length,
//     };
//   }, [filteredAttendance]);

//   // --------------------------------------------------
//   // ATTENDANCE RATE
//   // --------------------------------------------------

//   const attendanceRate =
//     summary.total > 0
//       ? Math.round(
//           (summary.present /
//             summary.total) *
//             100
//         )
//       : 0;

//   // --------------------------------------------------
//   // PARENT CHILDREN
//   // --------------------------------------------------

//   const children = useMemo(() => {
//     const map = new Map();

//     attendance.forEach((record) => {
//       if (!map.has(record.student)) {
//         map.set(record.student, {
//           id: record.student,
//           name:
//             record.student_name ||
//             "Student",
//         });
//       }
//     });

//     return Array.from(map.values());
//   }, [attendance]);

//   // --------------------------------------------------
//   // PARENT ATTENDANCE
//   // --------------------------------------------------

//   const parentAttendance = useMemo(() => {
//     if (!selectedChild) {
//       return attendance;
//     }

//     return attendance.filter(
//       (record) =>
//         String(record.student) ===
//         String(selectedChild)
//     );
//   }, [attendance, selectedChild]);

//   // --------------------------------------------------
//   // PARENT SUMMARY
//   // --------------------------------------------------

//   const parentSummary = useMemo(() => {
//     const records = parentAttendance;

//     const present = records.filter(
//       (record) =>
//         record.status === "present"
//     ).length;

//     const absent = records.filter(
//       (record) =>
//         record.status === "absent"
//     ).length;

//     const late = records.filter(
//       (record) =>
//         record.status === "late"
//     ).length;

//     const excused = records.filter(
//       (record) =>
//         record.status === "excused"
//     ).length;

//     return {
//       total: records.length,
//       present,
//       absent,
//       late,
//       excused,
//       rate:
//         records.length > 0
//           ? Math.round(
//               (present / records.length) *
//                 100
//             )
//           : 0,
//     };
//   }, [parentAttendance]);

//   // --------------------------------------------------
//   // STUDENT SUMMARY
//   // --------------------------------------------------

//   const studentSummary = useMemo(() => {
//     const present = attendance.filter(
//       (record) =>
//         record.status === "present"
//     ).length;

//     const absent = attendance.filter(
//       (record) =>
//         record.status === "absent"
//     ).length;

//     const late = attendance.filter(
//       (record) =>
//         record.status === "late"
//     ).length;

//     const excused = attendance.filter(
//       (record) =>
//         record.status === "excused"
//     ).length;

//     const total = attendance.length;

//     return {
//       total,
//       present,
//       absent,
//       late,
//       excused,
//       rate:
//         total > 0
//           ? Math.round(
//               (present / total) * 100
//             )
//           : 0,
//     };
//   }, [attendance]);

//   // --------------------------------------------------
//   // DATE DISPLAY
//   // --------------------------------------------------

//   const formatDate = (date) => {
//     if (!date) return "—";

//     const parsed = new Date(
//       `${date}T00:00:00`
//     );

//     return parsed.toLocaleDateString(
//       "en-GB",
//       {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       }
//     );
//   };

//   const getDayName = (date) => {
//     if (!date) return "—";

//     return new Date(
//       `${date}T00:00:00`
//     ).toLocaleDateString("en-US", {
//       weekday: "long",
//     });
//   };

//   // --------------------------------------------------
//   // STATUS CLASS
//   // --------------------------------------------------

//   const getStatusClass = (status) => {
//     switch (status) {
//       case "present":
//         return "status-present";

//       case "absent":
//         return "status-absent";

//       case "late":
//         return "status-late";

//       case "excused":
//         return "status-excused";

//       default:
//         return "";
//     }
//   };

//   // ==================================================
//   // ADMIN VIEW
//   // ==================================================

//   const renderAdmin = () => (
//     <div className="attendance-page">
//       <div className="attendance-header">
//         <div>
//           <h1>📊 Attendance Management</h1>

//           <p>
//             Monitor and filter student attendance
//             records.
//           </p>
//         </div>

//         <div className="attendance-rate-box">
//           <span>Attendance Rate</span>
//           <strong>{attendanceRate}%</strong>
//         </div>
//       </div>

//       {error && (
//         <div className="attendance-alert error">
//           ⚠️ {error}
//         </div>
//       )}

//       {/* FILTERS */}

//       <div className="attendance-filter-card">
//         <div className="filter-title">
//           <div>
//             <h2>🔎 Attendance Filters</h2>
//             <p>
//               Use one or more filters to find
//               specific records.
//             </p>
//           </div>

//           <button
//             type="button"
//             className="reset-filter-btn"
//             onClick={resetFilters}
//           >
//             ↻ Reset
//           </button>
//         </div>

//         <div className="attendance-filters">
//           <label>
//             <span>Grade</span>

//             <select
//               value={gradeFilter}
//               onChange={(e) =>
//                 setGradeFilter(e.target.value)
//               }
//             >
//               <option value="">
//                 All Grades
//               </option>

//               {grades.map((grade) => (
//                 <option
//                   key={grade}
//                   value={grade}
//                 >
//                   {grade}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label>
//             <span>Class</span>

//             <select
//               value={classFilter}
//               onChange={(e) =>
//                 setClassFilter(e.target.value)
//               }
//             >
//               <option value="">
//                 All Classes
//               </option>

//               {classNames.map((className) => (
//                 <option
//                   key={className}
//                   value={className}
//                 >
//                   {className}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label>
//             <span>Student Name</span>

//             <input
//               type="text"
//               value={studentSearch}
//               onChange={(e) =>
//                 setStudentSearch(
//                   e.target.value
//                 )
//               }
//               placeholder="Search student..."
//             />
//           </label>

//           <label>
//             <span>Month</span>

//             <select
//               value={monthFilter}
//               onChange={(e) =>
//                 setMonthFilter(e.target.value)
//               }
//             >
//               <option value="">
//                 All Months
//               </option>

//               {months.map((month) => (
//                 <option
//                   key={month.value}
//                   value={month.value}
//                 >
//                   {month.label}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label>
//             <span>Day of Week</span>

//             <select
//               value={dayFilter}
//               onChange={(e) =>
//                 setDayFilter(e.target.value)
//               }
//             >
//               <option value="">
//                 All Days
//               </option>

//               {days.map((day) => (
//                 <option
//                   key={day}
//                   value={day}
//                 >
//                   {day}
//                 </option>
//               ))}
//             </select>
//           </label>

//           <label>
//             <span>From Date</span>

//             <input
//               type="date"
//               value={fromDate}
//               onChange={(e) =>
//                 setFromDate(e.target.value)
//               }
//             />
//           </label>

//           <label>
//             <span>To Date</span>

//             <input
//               type="date"
//               value={toDate}
//               onChange={(e) =>
//                 setToDate(e.target.value)
//               }
//             />
//           </label>
//         </div>
//       </div>

//       {/* SUMMARY */}

//       <div className="attendance-summary">
//         <div className="attendance-summary-card total-card">
//           <span>Total Records</span>
//           <strong>{summary.total}</strong>
//         </div>

//         <div className="attendance-summary-card present-card">
//           <span>Present</span>
//           <strong>{summary.present}</strong>
//         </div>

//         <div className="attendance-summary-card absent-card">
//           <span>Absent</span>
//           <strong>{summary.absent}</strong>
//         </div>

//         <div className="attendance-summary-card late-card">
//           <span>Late</span>
//           <strong>{summary.late}</strong>
//         </div>

//         <div className="attendance-summary-card excused-card">
//           <span>Excused</span>
//           <strong>{summary.excused}</strong>
//         </div>
//       </div>

//       {/* TABLE */}

//       <div className="attendance-table-card">
//         <div className="table-heading">
//           <div>
//             <h2>📋 Attendance Records</h2>

//             <p>
//               Showing{" "}
//               <strong>
//                 {filteredAttendance.length}
//               </strong>{" "}
//               record(s)
//             </p>
//           </div>
//         </div>

//         {loading ? (
//           <div className="attendance-loading">
//             <div className="loading-spinner"></div>
//             <p>Loading attendance...</p>
//           </div>
//         ) : filteredAttendance.length === 0 ? (
//           <div className="attendance-empty">
//             <div className="empty-icon">
//               📭
//             </div>

//             <h3>
//               No attendance records found
//             </h3>

//             <p>
//               Try changing or resetting your
//               filters.
//             </p>
//           </div>
//         ) : (
//           <div className="attendance-table-wrapper">
//             <table className="attendance-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Student</th>
//                   <th>Class</th>
//                   <th>Date</th>
//                   <th>Day</th>
//                   <th>Status</th>
//                   <th>Reason</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredAttendance.map(
//                   (record, index) => (
//                     <tr key={record.id || index}>
//                       <td>{index + 1}</td>

//                       <td>
//                         <div className="attendance-student">
//                           <div className="student-avatar">
//                             {record.student_name
//                               ?.charAt(0)
//                               ?.toUpperCase() ||
//                               "S"}
//                           </div>

//                           <strong>
//                             {record.student_name ||
//                               "Unknown Student"}
//                           </strong>
//                         </div>
//                       </td>

//                       <td>
//                         <span className="class-badge">
//                           {record.school_class_name ||
//                             "—"}
//                         </span>
//                       </td>

//                       <td>
//                         {formatDate(
//                           record.date
//                         )}
//                       </td>

//                       <td>
//                         {getDayName(
//                           record.date
//                         )}
//                       </td>

//                       <td>
//                         <span
//                           className={`status-badge ${getStatusClass(
//                             record.status
//                           )}`}
//                         >
//                           {record.status
//                             ?.charAt(0)
//                             .toUpperCase() +
//                             record.status?.slice(
//                               1
//                             )}
//                         </span>
//                       </td>

//                       <td>
//                         {record.reason || "—"}
//                       </td>
//                     </tr>
//                   )
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // ==================================================
//   // TEACHER VIEW
//   // ==================================================

//   const renderTeacher = () => (
//     <div className="attendance-page">
//       <div className="attendance-header">
//         <div>
//           <h1>📊 My Class Attendance</h1>

//           <p>
//             View attendance records for your
//             assigned class.
//           </p>
//         </div>

//         <div className="attendance-rate-box">
//           <span>Attendance Rate</span>
//           <strong>{attendanceRate}%</strong>
//         </div>
//       </div>

//       <div className="attendance-summary">
//         <div className="attendance-summary-card total-card">
//           <span>Total</span>
//           <strong>{summary.total}</strong>
//         </div>

//         <div className="attendance-summary-card present-card">
//           <span>Present</span>
//           <strong>{summary.present}</strong>
//         </div>

//         <div className="attendance-summary-card absent-card">
//           <span>Absent</span>
//           <strong>{summary.absent}</strong>
//         </div>

//         <div className="attendance-summary-card late-card">
//           <span>Late</span>
//           <strong>{summary.late}</strong>
//         </div>

//         <div className="attendance-summary-card excused-card">
//           <span>Excused</span>
//           <strong>{summary.excused}</strong>
//         </div>
//       </div>

//       <div className="attendance-table-card">
//         <div className="table-heading">
//           <div>
//             <h2>📋 Attendance History</h2>
//           </div>
//         </div>

//         {loading ? (
//           <div className="attendance-loading">
//             <div className="loading-spinner"></div>
//             <p>Loading attendance...</p>
//           </div>
//         ) : attendance.length === 0 ? (
//           <div className="attendance-empty">
//             <div className="empty-icon">
//               📭
//             </div>

//             <h3>No attendance records yet</h3>
//             <p>
//               Attendance records will appear here
//               after they are saved.
//             </p>
//           </div>
//         ) : (
//           <div className="attendance-table-wrapper">
//             <table className="attendance-table">
//               <thead>
//                 <tr>
//                   <th>#</th>
//                   <th>Student</th>
//                   <th>Class</th>
//                   <th>Date</th>
//                   <th>Day</th>
//                   <th>Status</th>
//                   <th>Reason</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {attendance.map(
//                   (record, index) => (
//                     <tr key={record.id || index}>
//                       <td>{index + 1}</td>

//                       <td>
//                         <div className="attendance-student">
//                           <div className="student-avatar">
//                             {record.student_name
//                               ?.charAt(0)
//                               ?.toUpperCase() ||
//                               "S"}
//                           </div>

//                           <strong>
//                             {record.student_name}
//                           </strong>
//                         </div>
//                       </td>

//                       <td>
//                         {record.school_class_name ||
//                           "—"}
//                       </td>

//                       <td>
//                         {formatDate(
//                           record.date
//                         )}
//                       </td>

//                       <td>
//                         {getDayName(
//                           record.date
//                         )}
//                       </td>

//                       <td>
//                         <span
//                           className={`status-badge ${getStatusClass(
//                             record.status
//                           )}`}
//                         >
//                           {record.status}
//                         </span>
//                       </td>

//                       <td>
//                         {record.reason || "—"}
//                       </td>
//                     </tr>
//                   )
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // ==================================================
//   // STUDENT VIEW
//   // ==================================================

//   const renderStudent = () => (
//     <div className="attendance-page">
//       <div className="attendance-header">
//         <div>
//           <h1>📅 My Attendance</h1>

//           <p>
//             View your attendance history.
//           </p>
//         </div>

//         <div className="attendance-rate-box">
//           <span>Attendance Rate</span>
//           <strong>
//             {studentSummary.rate}%
//           </strong>
//         </div>
//       </div>

//       <div className="attendance-summary">
//         <div className="attendance-summary-card total-card">
//           <span>Total</span>
//           <strong>
//             {studentSummary.total}
//           </strong>
//         </div>

//         <div className="attendance-summary-card present-card">
//           <span>Present</span>
//           <strong>
//             {studentSummary.present}
//           </strong>
//         </div>

//         <div className="attendance-summary-card absent-card">
//           <span>Absent</span>
//           <strong>
//             {studentSummary.absent}
//           </strong>
//         </div>

//         <div className="attendance-summary-card late-card">
//           <span>Late</span>
//           <strong>
//             {studentSummary.late}
//           </strong>
//         </div>
//       </div>

//       <AttendanceHistoryTable
//         records={attendance}
//         formatDate={formatDate}
//         getDayName={getDayName}
//         getStatusClass={getStatusClass}
//       />
//     </div>
//   );

//   // ==================================================
//   // PARENT VIEW
//   // ==================================================

//   const renderParent = () => (
//     <div className="attendance-page">
//       <div className="attendance-header">
//         <div>
//           <h1>👨‍👩‍👧 Children Attendance</h1>

//           <p>
//             Monitor your children's attendance.
//           </p>
//         </div>

//         <div className="attendance-rate-box">
//           <span>Attendance Rate</span>
//           <strong>
//             {parentSummary.rate}%
//           </strong>
//         </div>
//       </div>

//       {children.length > 0 && (
//         <div className="child-selector-card">
//           <label>
//             <span>Select Child</span>

//             <select
//               value={selectedChild}
//               onChange={(e) =>
//                 setSelectedChild(
//                   e.target.value
//                 )
//               }
//             >
//               <option value="">
//                 All Children
//               </option>

//               {children.map((child) => (
//                 <option
//                   key={child.id}
//                   value={child.id}
//                 >
//                   {child.name}
//                 </option>
//               ))}
//             </select>
//           </label>
//         </div>
//       )}

//       <div className="attendance-summary">
//         <div className="attendance-summary-card total-card">
//           <span>Total</span>
//           <strong>
//             {parentSummary.total}
//           </strong>
//         </div>

//         <div className="attendance-summary-card present-card">
//           <span>Present</span>
//           <strong>
//             {parentSummary.present}
//           </strong>
//         </div>

//         <div className="attendance-summary-card absent-card">
//           <span>Absent</span>
//           <strong>
//             {parentSummary.absent}
//           </strong>
//         </div>

//         <div className="attendance-summary-card late-card">
//           <span>Late</span>
//           <strong>
//             {parentSummary.late}
//           </strong>
//         </div>

//         <div className="attendance-summary-card excused-card">
//           <span>Excused</span>
//           <strong>
//             {parentSummary.excused}
//           </strong>
//         </div>
//       </div>

//       <AttendanceHistoryTable
//         records={parentAttendance}
//         formatDate={formatDate}
//         getDayName={getDayName}
//         getStatusClass={getStatusClass}
//       />
//     </div>
//   );

//   // ==================================================
//   // MAIN
//   // ==================================================

//   const renderContent = () => {
//     if (user?.role === "admin") {
//       return renderAdmin();
//     }

//     if (user?.role === "teacher") {
//       return renderTeacher();
//     }

//     if (user?.role === "parent") {
//       return renderParent();
//     }

//     if (user?.role === "student") {
//       return renderStudent();
//     }

//     return (
//       <div className="attendance-page">
//         <div className="attendance-empty">
//           <h3>
//             You do not have access to attendance.
//           </h3>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <DashboardLayout>
//       {renderContent()}
//     </DashboardLayout>
//   );
// };

// // ==================================================
// // REUSABLE HISTORY TABLE
// // ==================================================

// const AttendanceHistoryTable = ({
//   records,
//   formatDate,
//   getDayName,
//   getStatusClass,
// }) => {
//   if (!records || records.length === 0) {
//     return (
//       <div className="attendance-table-card">
//         <div className="attendance-empty">
//           <div className="empty-icon">
//             📭
//           </div>

//           <h3>
//             No attendance records found
//           </h3>

//           <p>
//             Attendance records will appear here
//             once they have been recorded.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="attendance-table-card">
//       <div className="table-heading">
//         <div>
//           <h2>📋 Attendance History</h2>
//           <p>
//             {records.length} record(s)
//           </p>
//         </div>
//       </div>

//       <div className="attendance-table-wrapper">
//         <table className="attendance-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Date</th>
//               <th>Day</th>
//               <th>Class</th>
//               <th>Status</th>
//               <th>Reason</th>
//             </tr>
//           </thead>

//           <tbody>
//             {records.map(
//               (record, index) => (
//                 <tr
//                   key={
//                     record.id || index
//                   }
//                 >
//                   <td>{index + 1}</td>

//                   <td>
//                     {formatDate(
//                       record.date
//                     )}
//                   </td>

//                   <td>
//                     {getDayName(
//                       record.date
//                     )}
//                   </td>

//                   <td>
//                     {record.school_class_name ||
//                       "—"}
//                   </td>

//                   <td>
//                     <span
//                       className={`status-badge ${getStatusClass(
//                         record.status
//                       )}`}
//                     >
//                       {record.status}
//                     </span>
//                   </td>

//                   <td>
//                     {record.reason || "—"}
//                   </td>
//                 </tr>
//               )
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default Attendance;



// import {
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

// import {
//   getAttendance,
//   getAttendanceClasses,
// } from "../../api/academicsAPI";

// import { AuthContext } from "../../context/AuthContext";

// import "./Attendance.css";


// const Attendance = () => {

//   const { user } = useContext(AuthContext);

//   const role = user?.role;

//   const [attendance, setAttendance] = useState([]);
//   const [classes, setClasses] = useState([]);

//   const [selectedClass, setSelectedClass] =
//     useState(null);

//   const [selectedStudent, setSelectedStudent] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");


//   // =====================================================
//   // LOAD ATTENDANCE
//   // =====================================================

//   useEffect(() => {

//     const loadAttendance = async () => {

//       try {

//         setLoading(true);
//         setError("");

//         const data = await getAttendance();

//         const attendanceData =
//           Array.isArray(data)
//             ? data
//             : data?.results || [];

//         setAttendance(attendanceData);

//       } catch (err) {

//         console.error(
//           "Failed to load attendance:",
//           err.response?.data || err
//         );

//         setError(
//           "Failed to load attendance."
//         );

//       } finally {

//         setLoading(false);

//       }

//     };

//     if (user) {
//       loadAttendance();
//     }

//   }, [user]);


//   // =====================================================
//   // LOAD CLASSES
//   //
//   // Only ADMIN and TEACHER need this.
//   // =====================================================

//   useEffect(() => {

//     if (
//       role !== "admin" &&
//       role !== "teacher"
//     ) {
//       return;
//     }

//     const loadClasses = async () => {

//       try {

//         const data =
//           await getAttendanceClasses();

//         const classData =
//           Array.isArray(data)
//             ? data
//             : data?.results || [];

//         setClasses(classData);

//       } catch (err) {

//         console.error(
//           "Failed to load attendance classes:",
//           err.response?.data || err
//         );

//       }

//     };

//     loadClasses();

//   }, [role]);


//   // =====================================================
//   // GET RECORDS FOR A CLASS
//   // =====================================================

//   const getClassRecords = (classId) => {

//     return attendance.filter(
//       (record) =>
//         Number(record.school_class) ===
//         Number(classId)
//     );

//   };


//   const getClassSummary = (classId) => {
    
//     const records = getClassRecords(classId);

//       return {

//           total: records.length,
          
//           present: records.filter(
//                 (record) =>
//                     String(record.status).toLowerCase() === "present"
//             ).length,

//             absent: records.filter(
//                 (record) =>
//                     String(record.status).toLowerCase() === "absent"
//             ).length,

//             late: records.filter(
//                 (record) =>
//                     String(record.status).toLowerCase() === "late"
//             ).length,

//             excused: records.filter(
//                 (record) =>
//                     String(record.status).toLowerCase() === "excused"
//             ).length,

//         };

//     };



//       // =====================================================
//       // STUDENT ATTENDANCE RATE
//       // =====================================================

//       const getAttendanceRate = (records) => {

//         if (!records.length) {
//           return 0;
//         }

//         const present =
//           records.filter(
//             (record) =>
//               record.status === "present"
//           ).length;

//         return Math.round(
//           (present / records.length) * 100
//         );

//       };


//   // =====================================================
//   // LOADING
//   // =====================================================

//   if (loading) {

//     return (
//       <DashboardLayout>

//         <div className="attendance-page">

//           <h1>Attendance</h1>

//           <p>
//             Loading attendance...
//           </p>

//         </div>

//       </DashboardLayout>
//     );

//   }


//   // =====================================================
//   // ERROR
//   // =====================================================

//   if (error) {

//     return (
//       <DashboardLayout>

//         <div className="attendance-page">

//           <h1>Attendance</h1>

//           <p className="error-message">
//             {error}
//           </p>

//         </div>

//       </DashboardLayout>
//     );

//   }


//   // =====================================================
//   // ADMIN / TEACHER
//   // =====================================================

//   if (
//     role === "admin" ||
//     role === "teacher"
//   ) {


//     // ===================================================
//     // SELECTED CLASS
//     // ===================================================

//     if (selectedClass) {

//       const records =
//         getClassRecords(
//           selectedClass.id
//         );

//       return (
//         <DashboardLayout>

//           <div className="attendance-page">

//             <button
//               className="back-button"
//               onClick={() =>
//                 setSelectedClass(null)
//               }
//             >
//               ← Back to Classes
//             </button>


//             <h1>
//               {selectedClass.name}
//             </h1>

//             <p className="attendance-subtitle">
//               Attendance Records
//             </p>


//             {/* SUMMARY */}

//             <div className="attendance-summary">

//               <div className="summary-card">

//                 <span>
//                   Present
//                 </span>

//                 <strong>
//                   {
//                     getClassSummary(
//                       selectedClass.id
//                     ).present
//                   }
//                 </strong>

//               </div>


//               <div className="summary-card">

//                 <span>
//                   Absent
//                 </span>

//                 <strong>
//                   {
//                     getClassSummary(
//                       selectedClass.id
//                     ).absent
//                   }
//                 </strong>

//               </div>


//               <div className="summary-card">

//                 <span>
//                   Late
//                 </span>

//                 <strong>
//                   {
//                     getClassSummary(
//                       selectedClass.id
//                     ).late
//                   }
//                 </strong>

//               </div>


//               <div className="summary-card">

//                 <span>
//                   Excused
//                 </span>

//                 <strong>
//                   {
//                     getClassSummary(
//                       selectedClass.id
//                     ).excused
//                   }
//                 </strong>

//               </div>

//             </div>


//             {/* TABLE */}

//             <div className="attendance-table-wrapper">

//               <table className="attendance-table">

//                 <thead>

//                   <tr>

//                     <th>
//                       Student
//                     </th>

//                     <th>
//                       Date
//                     </th>

//                     <th>
//                       Status
//                     </th>

//                   </tr>

//                 </thead>

//                 <tbody>

//                   {records.length === 0 ? (

//                     <tr>

//                       <td
//                         colSpan="3"
//                         className="empty-table"
//                       >
//                         No attendance records found.
//                       </td>

//                     </tr>

//                   ) : (

//                     records.map(
//                       (record) => (

//                         <tr
//                           key={record.id}
//                         >

//                           <td>
//                             {record.student_name}
//                           </td>

//                           <td>
//                             {record.date}
//                           </td>

//                           <td>

//                             <span
//                               className={
//                                 `status-badge ${record.status}`
//                               }
//                             >
//                               {record.status}
//                             </span>

//                           </td>

//                         </tr>

//                       )
//                     )

//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         </DashboardLayout>
//       );

//     }


//     // ===================================================
//     // CLASS LIST
//     // ===================================================

//     return (
//       <DashboardLayout>

//         <div className="attendance-page">

//           <h1>
//             Attendance
//           </h1>

//           <p className="attendance-subtitle">

//             {role === "admin"
//               ? "Attendance Overview"
//               : "My Class Attendance"}

//           </p>


//           <div className="class-grid">

//             {classes.length === 0 ? (

//               <div className="empty-message">

//                 No classes found.

//               </div>

//             ) : (

//               classes.map(
//                 (schoolClass) => {

//                   const summary =
//                     getClassSummary(
//                       schoolClass.id
//                     );

//                   const totalStudents =
//                     schoolClass.student_count ||
//                     0;


//                   return (

//                     <div
//                       className="class-attendance-card"
//                       key={schoolClass.id}
//                     >

//                       <div className="class-card-header">

//                         <h2>
//                           {schoolClass.name}
//                         </h2>

//                       </div>


//                       <div className="class-card-body">

//                         <div className="present-count">

//                           <strong>
//                             {summary.present}
//                           </strong>

//                           {" / "}

//                           <strong>
//                             {totalStudents}
//                           </strong>

//                           <span>
//                             {" "}present
//                           </span>

//                         </div>


//                         <div className="attendance-mini-stats">

//                           <span>
//                             Present:{" "}
//                             {summary.present}
//                           </span>

//                           <span>
//                             Absent:{" "}
//                             {summary.absent}
//                           </span>

//                           <span>
//                             Late:{" "}
//                             {summary.late}
//                           </span>

//                         </div>

//                       </div>


//                       <button
//                         className="view-attendance-button"
//                         onClick={() =>
//                           setSelectedClass(
//                             schoolClass
//                           )
//                         }
//                       >
//                         View Attendance →
//                       </button>

//                     </div>

//                   );

//                 }
//               )

//             )}

//           </div>

//         </div>

//       </DashboardLayout>
//     );

//   }


//   // =====================================================
//   // STUDENT
//   // =====================================================

//   if (role === "student") {

//     const present =
//       attendance.filter(
//         (record) =>
//           record.status === "present"
//       ).length;

//     const absent =
//       attendance.filter(
//         (record) =>
//           record.status === "absent"
//       ).length;

//     const late =
//       attendance.filter(
//         (record) =>
//           record.status === "late"
//       ).length;

   

//     const rate =
//       getAttendanceRate(
//         attendance
//       );


//     return (
//       <DashboardLayout>

//         <div className="attendance-page">

//           <h1>
//             My Attendance
//           </h1>


//           <div className="attendance-summary">

//             <div className="summary-card">

//               <span>
//                 Attendance Rate
//               </span>

//               <strong>
//                 {rate}%
//               </strong>

//             </div>


//             <div className="summary-card">

//               <span>
//                 Present
//               </span>

//               <strong>
//                 {present}
//               </strong>

//             </div>


//             <div className="summary-card">

//               <span>
//                 Absent
//               </span>

//               <strong>
//                 {absent}
//               </strong>

//             </div>


//             <div className="summary-card">

//               <span>
//                 Late
//               </span>

//               <strong>
//                 {late}
//               </strong>

//             </div>

//           </div>


//           <h2>
//             Attendance History
//           </h2>


//           <div className="attendance-table-wrapper">

//             <table className="attendance-table">

//               <thead>

//                 <tr>

//                   <th>
//                     Date
//                   </th>

//                   <th>
//                     Class
//                   </th>

//                   <th>
//                     Status
//                   </th>

//                 </tr>

//               </thead>


//               <tbody>

//                 {attendance.length === 0 ? (

//                   <tr>

//                     <td
//                       colSpan="3"
//                       className="empty-table"
//                     >
//                       No attendance records found.
//                     </td>

//                   </tr>

//                 ) : (

//                   attendance.map(
//                     (record) => (

//                       <tr
//                         key={record.id}
//                       >

//                         <td>
//                           {record.date}
//                         </td>

//                         <td>
//                           {record.school_class_name}
//                         </td>

//                         <td>

//                           <span
//                             className={
//                               `status-badge ${record.status}`
//                             }
//                           >
//                             {record.status}
//                           </span>

//                         </td>

//                       </tr>

//                     )
//                   )

//                 )}

//               </tbody>

//             </table>

//           </div>

//         </div>

//       </DashboardLayout>
//     );

//   }


//   // =====================================================
//   // PARENT
//   // =====================================================

//   if (role === "parent") {

//     const children = {};


//     attendance.forEach(
//       (record) => {

//         if (
//           !children[record.student]
//         ) {

//           children[record.student] = {

//             id: record.student,

//             name:
//               record.student_name,

//             records: [],

//           };

//         }

//         children[
//           record.student
//         ].records.push(record);

//       }
//     );


//     // ===================================================
//     // SELECTED CHILD
//     // ===================================================

//     if (selectedStudent) {

//       const child =
//         children[selectedStudent];


//       if (!child) {

//         return (
//           <DashboardLayout>

//             <div className="attendance-page">

//               <h1>
//                 Child Attendance
//               </h1>

//               <p>
//                 No attendance records found.
//               </p>

//             </div>

//           </DashboardLayout>
//         );

//       }


//       const rate =
//         getAttendanceRate(
//           child.records
//         );


//       return (
//         <DashboardLayout>

//           <div className="attendance-page">

//             <button
//               className="back-button"
//               onClick={() =>
//                 setSelectedStudent(null)
//               }
//             >
//               ← Back to Children
//             </button>


//             <h1>
//               {child.name}
//             </h1>

//             <p className="attendance-subtitle">
//               Attendance History
//             </p>


//             <div className="attendance-summary">

//               <div className="summary-card">

//                 <span>
//                   Attendance Rate
//                 </span>

//                 <strong>
//                   {rate}%
//                 </strong>

//               </div>

//             </div>


//             <div className="attendance-table-wrapper">

//               <table className="attendance-table">

//                 <thead>

//                   <tr>

//                     <th>
//                       Date
//                     </th>

//                     <th>
//                       Class
//                     </th>

//                     <th>
//                       Status
//                     </th>

//                   </tr>

//                 </thead>


//                 <tbody>

//                   {child.records.map(
//                     (record) => (

//                       <tr
//                         key={record.id}
//                       >

//                         <td>
//                           {record.date}
//                         </td>

//                         <td>
//                           {record.school_class_name}
//                         </td>

//                         <td>

//                           <span
//                             className={
//                               `status-badge ${record.status}`
//                             }
//                           >
//                             {record.status? record.status.charAt(0).toUpperCase() +record.status.slice(1): "Unknown"}
//                           </span>

//                         </td>

//                       </tr>

//                     )
//                   )}

//                 </tbody>

//               </table>

//             </div>

//           </div>

//         </DashboardLayout>
//       );

//     }


//     // ===================================================
//     // CHILDREN
//     // ===================================================

//     return (
//       <DashboardLayout>

//         <div className="attendance-page">

//           <h1>
//             My Children's Attendance
//           </h1>

//           <p className="attendance-subtitle">
//             Select a child to view attendance.
//           </p>


//           <div className="class-grid">

//             {Object.values(children).length === 0 ? (

//               <div className="empty-message">

//                 No attendance records found.

//               </div>

//             ) : (

//               Object.values(children).map(
//                 (child) => (

//                   <div
//                     className="class-attendance-card"
//                     key={child.id}
//                   >

//                     <h2>
//                       {child.name}
//                     </h2>


//                     <p>

//                       Attendance:{" "}

//                       <strong>
//                         {
//                           getAttendanceRate(
//                             child.records
//                           )
//                         }
//                         %
//                       </strong>

//                     </p>


//                     <button
//                       className="view-attendance-button"
//                       onClick={() =>
//                         setSelectedStudent(
//                           child.id
//                         )
//                       }
//                     >
//                       View Attendance →
//                     </button>

//                   </div>

//                 )
//               )

//             )}

//           </div>

//         </div>

//       </DashboardLayout>
//     );

//   }


//   // =====================================================
//   // UNKNOWN ROLE
//   // =====================================================

//   return (
//     <DashboardLayout>

//       <div className="attendance-page">

//         <h1>
//           Attendance
//         </h1>

//         <p>
//           You do not have permission to view attendance.
//         </p>

//       </div>

//     </DashboardLayout>
//   );

// };


// export default Attendance;




