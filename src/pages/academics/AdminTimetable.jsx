import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import API from "../../api/axios";

import TimetableForm from "./TimeTableForm";

import "./AdminTimetable.css";

const AdminTimetable = () => {
    const [grades, setGrades] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [timetable, setTimetable] = useState([]);

    const [selectedGrade, setSelectedGrade] = useState("");
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const [selectedWeek, setSelectedWeek] = useState(
        getMonday(new Date())
    );

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);

    // ==========================================================
    // GET MONDAY
    // ==========================================================

    function getMonday(date) {
        const result = new Date(date);
        const day = result.getDay();

        const difference = day === 0 ? -6 : 1 - day;

        result.setDate(result.getDate() + difference);
        result.setHours(0, 0, 0, 0);

        return result;
    }

    // ==========================================================
    // DAYS
    // ==========================================================

    const days = [
        {
            code: "mon",
            name: "Monday",
            offset: 0,
        },
        {
            code: "tue",
            name: "Tuesday",
            offset: 1,
        },
        {
            code: "wed",
            name: "Wednesday",
            offset: 2,
        },
        {
            code: "thu",
            name: "Thursday",
            offset: 3,
        },
        {
            code: "fri",
            name: "Friday",
            offset: 4,
        },
    ];

    // ==========================================================
    // LOAD DATA
    // ==========================================================

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                gradesResponse,
                classesResponse,
                teachersResponse,
                timetableResponse,
            ] = await Promise.all([
                API.get("academics/grades/"),
                API.get("academics/classes/"),
                API.get("auth/teachers/"),
                API.get("academics/timetable/"),
            ]);

            const getResults = (response) => {
                if (Array.isArray(response.data)) {
                    return response.data;
                }

                return response.data?.results || [];
            };

            setGrades(getResults(gradesResponse));
            setClasses(getResults(classesResponse));
            setTeachers(getResults(teachersResponse));
            setTimetable(getResults(timetableResponse));
        } catch (err) {
            console.error(
                "Failed to load admin timetable:",
                err.response?.data || err
            );

            setError(
                "Failed to load timetable data. Please check that the backend is running and you are logged in."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ==========================================================
    // FILTER CLASSES BY GRADE
    // ==========================================================

    const filteredClasses = useMemo(() => {
        if (!selectedGrade) {
            return classes;
        }

        return classes.filter(
            (schoolClass) =>
                String(schoolClass.grade) ===
                String(selectedGrade)
        );
    }, [classes, selectedGrade]);

    // ==========================================================
    // GET TIMETABLE FOR SELECTED GRADE
    // ==========================================================

    const gradeTimetable = useMemo(() => {
        if (!selectedGrade) {
            return timetable;
        }

        return timetable.filter((entry) => {
            const timetableClass =
                classes.find(
                    (schoolClass) =>
                        String(schoolClass.id) ===
                        String(entry.school_class)
                );

            if (!timetableClass) {
                return false;
            }

            return (
                String(timetableClass.grade) ===
                String(selectedGrade)
            );
        });
    }, [timetable, classes, selectedGrade]);

    // ==========================================================
    // TEACHERS AVAILABLE FOR SELECTED GRADE
    // ==========================================================

    const availableTeachers = useMemo(() => {
        if (!selectedGrade) {
            return teachers;
        }

        const teacherIds = new Set();

        // Teachers appearing in timetable entries
        gradeTimetable.forEach((entry) => {
            if (entry.teacher) {
                teacherIds.add(String(entry.teacher));
            }
        });

        // Also include class teachers
        filteredClasses.forEach((schoolClass) => {
            if (schoolClass.teacher) {
                teacherIds.add(String(schoolClass.teacher));
            }
        });

        return teachers.filter((teacher) =>
            teacherIds.has(String(teacher.id))
        );
    }, [
        teachers,
        selectedGrade,
        gradeTimetable,
        filteredClasses,
    ]);

    // ==========================================================
    // FILTER TIMETABLE
    // ==========================================================

    const filteredTimetable = useMemo(() => {
        return timetable.filter((entry) => {
            const schoolClass = classes.find(
                (cls) =>
                    String(cls.id) ===
                    String(entry.school_class)
            );

            // --------------------------
            // GRADE FILTER
            // --------------------------

            if (selectedGrade) {
                if (!schoolClass) {
                    return false;
                }

                if (
                    String(schoolClass.grade) !==
                    String(selectedGrade)
                ) {
                    return false;
                }
            }

            // --------------------------
            // TEACHER FILTER
            // --------------------------

            if (selectedTeacher) {
                if (
                    String(entry.teacher) !==
                    String(selectedTeacher)
                ) {
                    return false;
                }
            }

            // --------------------------
            // CLASS FILTER
            // --------------------------

            if (selectedClass) {
                if (
                    String(entry.school_class) !==
                    String(selectedClass)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [
        timetable,
        classes,
        selectedGrade,
        selectedTeacher,
        selectedClass,
    ]);

    // ==========================================================
    // SORT TIMETABLE
    // ==========================================================

    const sortedTimetable = useMemo(() => {
        const dayOrder = {
            mon: 1,
            tue: 2,
            wed: 3,
            thu: 4,
            fri: 5,
        };

        return [...filteredTimetable].sort(
            (a, b) => {
                const dayDifference =
                    (dayOrder[a.day] || 99) -
                    (dayOrder[b.day] || 99);

                if (dayDifference !== 0) {
                    return dayDifference;
                }

                return (
                    (a.start_time || "").localeCompare(
                        b.start_time || ""
                    )
                );
            }
        );
    }, [filteredTimetable]);

    // ==========================================================
    // HANDLE GRADE CHANGE
    // ==========================================================

    const handleGradeChange = (e) => {
        const grade = e.target.value;

        setSelectedGrade(grade);

        // Reset dependent filters
        setSelectedTeacher("");
        setSelectedClass("");
    };

    // ==========================================================
    // HANDLE TEACHER CHANGE
    // ==========================================================

    const handleTeacherChange = (e) => {
        setSelectedTeacher(e.target.value);
    };

    // ==========================================================
    // HANDLE CLASS CHANGE
    // ==========================================================

    const handleClassChange = (e) => {
        setSelectedClass(e.target.value);
    };

    // ==========================================================
    // RESET FILTERS
    // ==========================================================

    const resetFilters = () => {
        setSelectedGrade("");
        setSelectedTeacher("");
        setSelectedClass("");
    };

    // ==========================================================
    // DATE FOR DAY
    // ==========================================================

    const getDateForDay = (dayCode) => {
        const dayInfo = days.find(
            (day) => day.code === dayCode
        );

        if (!dayInfo) {
            return null;
        }

        const date = new Date(selectedWeek);

        date.setDate(
            selectedWeek.getDate() + dayInfo.offset
        );

        return date;
    };

    // ==========================================================
    // FORMAT DATE
    // ==========================================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ==========================================================
    // FORMAT DAY
    // ==========================================================

    const formatDay = (day) => {
        const dayNames = {
            mon: "Monday",
            tue: "Tuesday",
            wed: "Wednesday",
            thu: "Thursday",
            fri: "Friday",
        };

        return dayNames[day] || day;
    };

    // ==========================================================
    // FORMAT TIME
    // ==========================================================

    const formatTime = (time) => {
        if (!time) {
            return "—";
        }

        const [hours, minutes] = time.split(":");

        const date = new Date();

        date.setHours(
            Number(hours),
            Number(minutes),
            0
        );

        return date.toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    };

    // ==========================================================
    // FORMAT WEEK
    // ==========================================================

    const formatWeekRange = () => {
        const monday = new Date(selectedWeek);
        const friday = new Date(selectedWeek);

        friday.setDate(
            monday.getDate() + 4
        );

        const mondayText =
            monday.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

        const fridayText =
            friday.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

        return `${mondayText} – ${fridayText}`;
    };

    // ==========================================================
    // CHANGE WEEK
    // ==========================================================

    const changeWeek = (amount) => {
        const newWeek = new Date(selectedWeek);

        newWeek.setDate(
            newWeek.getDate() + amount * 7
        );

        setSelectedWeek(
            getMonday(newWeek)
        );
    };

    // ==========================================================
    // GO TO TODAY
    // ==========================================================

    const goToToday = () => {
        setSelectedWeek(
            getMonday(new Date())
        );
    };

    // ==========================================================
    // CURRENT WEEK
    // ==========================================================

    const isCurrentWeek = () => {
        const currentMonday =
            getMonday(new Date());

        return (
            selectedWeek.getTime() ===
            currentMonday.getTime()
        );
    };

    // ==========================================================
    // TEACHER NAME
    // ==========================================================

    const getTeacherName = (entry) => {
        if (entry.teacher_name) {
            return entry.teacher_name;
        }

        const teacher = teachers.find(
            (item) =>
                String(item.id) ===
                String(entry.teacher)
        );

        if (!teacher) {
            return "—";
        }

        if (teacher.name) {
            return teacher.name;
        }

        if (teacher.user?.get_full_name) {
            return teacher.user.get_full_name;
        }

        const firstName =
            teacher.user?.first_name ||
            teacher.first_name ||
            "";

        const lastName =
            teacher.user?.last_name ||
            teacher.last_name ||
            "";

        return (
            `${firstName} ${lastName}`.trim() ||
            teacher.user?.username ||
            "Unnamed Teacher"
        );
    };

    // ==========================================================
    // CLASS NAME
    // ==========================================================

    const getClassName = (entry) => {
        if (entry.class_name) {
            return entry.class_name;
        }

        const schoolClass = classes.find(
            (cls) =>
                String(cls.id) ===
                String(entry.school_class)
        );

        if (!schoolClass) {
            return "—";
        }

        return (
            schoolClass.class_name ||
            `${schoolClass.grade_name || ""} ${
                schoolClass.name || ""
            }`.trim() ||
            schoolClass.name ||
            "—"
        );
    };

    // ==========================================================
    // GRADE NAME
    // ==========================================================

    const getGradeName = (entry) => {
        const schoolClass = classes.find(
            (cls) =>
                String(cls.id) ===
                String(entry.school_class)
        );

        return (
            schoolClass?.grade_name ||
            grades.find(
                (grade) =>
                    String(grade.id) ===
                    String(schoolClass?.grade)
            )?.name ||
            "—"
        );
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <DashboardLayout>
                <div className="admin-timetable-page">
                    <div className="admin-timetable-loading">
                        Loading timetable...
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ==========================================================
    // PAGE
    // ==========================================================

    return (
        <DashboardLayout>
            <div className="admin-timetable-page">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="admin-timetable-header">
                    <div>
                        <span className="admin-timetable-kicker">
                            ADMINISTRATION
                        </span>

                        <h1>
                            School Timetable
                        </h1>

                        <p>
                            View and manage the weekly
                            timetable by grade, teacher
                            and class.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="add-timetable-button"
                        onClick={() =>
                            setShowForm(!showForm)
                        }
                    >
                        {showForm
                            ? "✕ Close Form"
                            : "＋ Add Timetable"}
                    </button>
                </div>

                {/* ==================================================
                    ADD FORM
                ================================================== */}

                {showForm && (
                    <div className="admin-timetable-form-card">
                        <TimetableForm />
                    </div>
                )}

                {/* ==================================================
                    FILTERS
                ================================================== */}

                <div className="admin-timetable-filters">

                    <div className="filters-title">
                        <div className="filter-icon">
                            🔎
                        </div>

                        <div>
                            <h3>
                                Filter Timetable
                            </h3>

                            <p>
                                Select a grade, teacher
                                or class to narrow the
                                timetable.
                            </p>
                        </div>
                    </div>

                    <div className="filter-grid">

                        {/* GRADE */}

                        <div className="filter-field">
                            <label>
                                Grade
                            </label>

                            <select
                                value={selectedGrade}
                                onChange={handleGradeChange}
                            >
                                <option value="">
                                    All Grades
                                </option>

                                {grades.map(
                                    (grade) => (
                                        <option
                                            key={
                                                grade.id
                                            }
                                            value={
                                                grade.id
                                            }
                                        >
                                            {grade.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* TEACHER */}

                        <div className="filter-field">
                            <label>
                                Teacher
                            </label>

                            <select
                                value={
                                    selectedTeacher
                                }
                                onChange={
                                    handleTeacherChange
                                }
                            >
                                <option value="">
                                    {selectedGrade
                                        ? "All Teachers in Grade"
                                        : "All Teachers"}
                                </option>

                                {availableTeachers.map(
                                    (teacher) => (
                                        <option
                                            key={
                                                teacher.id
                                            }
                                            value={
                                                teacher.id
                                            }
                                        >
                                            {teacher.name ||
                                                `${teacher.first_name || ""} ${
                                                    teacher.last_name || ""
                                                }`.trim() ||
                                                teacher.user?.username ||
                                                "Unnamed Teacher"}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* CLASS */}

                        <div className="filter-field">
                            <label>
                                School Class
                            </label>

                            <select
                                value={
                                    selectedClass
                                }
                                onChange={
                                    handleClassChange
                                }
                            >
                                <option value="">
                                    {selectedGrade
                                        ? "All Classes in Grade"
                                        : "All Classes"}
                                </option>

                                {filteredClasses.map(
                                    (schoolClass) => (
                                        <option
                                            key={
                                                schoolClass.id
                                            }
                                            value={
                                                schoolClass.id
                                            }
                                        >
                                            {schoolClass.grade_name
                                                ? `${schoolClass.grade_name} - ${schoolClass.name}`
                                                : schoolClass.name}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* RESET */}

                        <div className="filter-field reset-field">
                            <label>
                                &nbsp;
                            </label>

                            <button
                                type="button"
                                className="reset-filters-button"
                                onClick={resetFilters}
                            >
                                ↻ Reset Filters
                            </button>
                        </div>

                    </div>
                </div>

                {/* ==================================================
                    WEEK NAVIGATION
                ================================================== */}

                <div className="admin-week-controls">

                    <button
                        type="button"
                        className="admin-week-button"
                        onClick={() =>
                            changeWeek(-1)
                        }
                    >
                        ← Previous Week
                    </button>

                    <div className="admin-week-display">
                        <span>
                            WEEK
                        </span>

                        <strong>
                            {formatWeekRange()}
                        </strong>
                    </div>

                    <button
                        type="button"
                        className="admin-today-button"
                        onClick={goToToday}
                        disabled={isCurrentWeek()}
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        className="admin-week-button"
                        onClick={() =>
                            changeWeek(1)
                        }
                    >
                        Next Week →
                    </button>

                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="admin-timetable-error">
                        {error}
                    </div>
                )}

                {/* ==================================================
                    SUMMARY
                ================================================== */}

                <div className="admin-timetable-summary">

                    <div className="summary-card grade-summary">
                        <span>GRADE</span>
                        <strong>
                            {selectedGrade
                                ? grades.find(
                                      (grade) =>
                                          String(
                                              grade.id
                                          ) ===
                                          String(
                                              selectedGrade
                                          )
                                  )?.name ||
                                  "Selected Grade"
                                : "All Grades"}
                        </strong>
                    </div>

                    <div className="summary-card teacher-summary">
                        <span>TEACHER</span>
                        <strong>
                            {selectedTeacher
                                ? availableTeachers.find(
                                      (teacher) =>
                                          String(
                                              teacher.id
                                          ) ===
                                          String(
                                              selectedTeacher
                                          )
                                  )?.name ||
                                  `${
                                      availableTeachers.find(
                                          (teacher) =>
                                              String(
                                                  teacher.id
                                              ) ===
                                              String(
                                                  selectedTeacher
                                              )
                                      )?.first_name ||
                                      ""
                                  } ${
                                      availableTeachers.find(
                                          (teacher) =>
                                              String(
                                                  teacher.id
                                              ) ===
                                              String(
                                                  selectedTeacher
                                              )
                                      )?.last_name ||
                                      ""
                                  }`.trim() ||
                                  "Selected Teacher"
                                : "All Teachers"}
                        </strong>
                    </div>

                    <div className="summary-card class-summary">
                        <span>CLASS</span>
                        <strong>
                            {selectedClass
                                ? filteredClasses.find(
                                      (schoolClass) =>
                                          String(
                                              schoolClass.id
                                          ) ===
                                          String(
                                              selectedClass
                                          )
                                  )?.name ||
                                  "Selected Class"
                                : "All Classes"}
                        </strong>
                    </div>

                    <div className="summary-card entries-summary">
                        <span>ENTRIES</span>
                        <strong>
                            {sortedTimetable.length}
                        </strong>
                    </div>

                </div>

                {/* ==================================================
                    TABLE
                ================================================== */}

                {sortedTimetable.length === 0 ? (
                    <div className="admin-timetable-empty">

                        <div className="admin-empty-icon">
                            📅
                        </div>

                        <h3>
                            No Timetable Entries Found
                        </h3>

                        <p>
                            There are no timetable
                            entries matching the
                            selected filters.
                        </p>

                        {(selectedGrade ||
                            selectedTeacher ||
                            selectedClass) && (
                            <button
                                type="button"
                                onClick={
                                    resetFilters
                                }
                                className="empty-reset-button"
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>
                ) : (
                    <div className="admin-timetable-table-container">

                        <table className="admin-timetable-table">

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Grade</th>
                                    <th>Class</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                </tr>
                            </thead>

                            <tbody>
                                {sortedTimetable.map(
                                    (entry) => {
                                        const entryDate =
                                            getDateForDay(
                                                entry.day
                                            );

                                        return (
                                            <tr
                                                key={
                                                    entry.id
                                                }
                                            >
                                                <td>
                                                    <strong className="date-badge">
                                                        {formatDate(
                                                            entryDate
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="day-badge">
                                                        {entry.day_name ||
                                                            formatDay(
                                                                entry.day
                                                            )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="time-badge">
                                                        {formatTime(
                                                            entry.start_time
                                                        )}
                                                        {" – "}
                                                        {formatTime(
                                                            entry.end_time
                                                        )}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="grade-badge">
                                                        {getGradeName(
                                                            entry
                                                        )}
                                                    </span>
                                                </td>

                                                <td className="class-cell">
                                                    🏫{" "}
                                                    {getClassName(
                                                        entry
                                                    )}
                                                </td>

                                                <td className="subject-cell">
                                                    📚{" "}
                                                    {entry.subject_name ||
                                                        entry
                                                            .subject
                                                            ?.name ||
                                                        "—"}
                                                </td>

                                                <td className="teacher-cell">
                                                    👨‍🏫{" "}
                                                    {getTeacherName(
                                                        entry
                                                    )}
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
        </DashboardLayout>
    );
};

export default AdminTimetable;