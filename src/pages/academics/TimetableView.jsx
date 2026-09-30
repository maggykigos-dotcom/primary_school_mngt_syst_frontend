import { useEffect, useContext, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import API from "../../api/axios";

import { AuthContext } from "../../context/AuthContext";

import "./TimetableView.css";

const TimetableView = ({ viewType = "student" }) => {
    const { user } = useContext(AuthContext);

    const [timetable, setTimetable] = useState([]);
    const [studentName, setStudentName] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================================
    // SELECTED WEEK
    // ==========================================================

    const getMonday = (date) => {
        const result = new Date(date);
        const day = result.getDay();

        const difference = day === 0 ? -6 : 1 - day;

        result.setDate(result.getDate() + difference);
        result.setHours(0, 0, 0, 0);

        return result;
    };

    const [selectedWeek, setSelectedWeek] = useState(
        getMonday(new Date())
    );

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
    // GET DATE FOR TIMETABLE DAY
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
    // FORMAT WEEK RANGE
    // ==========================================================

    const formatWeekRange = () => {
        const monday = new Date(selectedWeek);

        const friday = new Date(selectedWeek);

        friday.setDate(
            monday.getDate() + 4
        );

        const mondayText = monday.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

        const fridayText = friday.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );

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
    // GO TO CURRENT WEEK
    // ==========================================================

    const goToToday = () => {
        setSelectedWeek(
            getMonday(new Date())
        );
    };

    // ==========================================================
    // CHECK IF SELECTED WEEK IS CURRENT WEEK
    // ==========================================================

    const isCurrentWeek = () => {
        const currentMonday = getMonday(
            new Date()
        );

        return (
            selectedWeek.getTime() ===
            currentMonday.getTime()
        );
    };

    // ==========================================================
    // LOAD TIMETABLE
    // ==========================================================

    useEffect(() => {
        const loadTimetable = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await API.get(
                    "academics/timetable/"
                );

                const data = Array.isArray(
                    response.data
                )
                    ? response.data
                    : response.data?.results || [];

                setTimetable(data);

                // ==================================================
                // PARENT
                // ==================================================

                if (viewType === "parent") {
                    if (data.length > 0) {
                        const firstEntry = data[0];

                        let name = "";

                        if (
                            firstEntry.student_name
                        ) {
                            name =
                                firstEntry.student_name;
                        } else if (
                            firstEntry.student
                                ?.student_name
                        ) {
                            name =
                                firstEntry.student
                                    .student_name;
                        } else if (
                            firstEntry.student?.user
                        ) {
                            const firstName =
                                firstEntry.student
                                    .user.first_name || "";

                            const lastName =
                                firstEntry.student
                                    .user.last_name || "";

                            name =
                                `${firstName} ${lastName}`.trim();
                        }

                        setStudentName(name);
                    }
                }

                // ==================================================
                // STUDENT
                // ==================================================

                else {
                    const firstName =
                        user?.first_name || "";

                    const lastName =
                        user?.last_name || "";

                    const fullName =
                        `${firstName} ${lastName}`.trim();

                    setStudentName(
                        fullName ||
                            user?.username ||
                            "Student"
                    );
                }
            } catch (err) {
                console.error(
                    "Failed to load timetable:",
                    err
                );

                setError(
                    "Failed to load timetable."
                );
            } finally {
                setLoading(false);
            }
        };

        loadTimetable();
    }, [viewType, user]);

    // ==========================================================
    // SORT TIMETABLE
    // ==========================================================

    const sortedTimetable = [...timetable].sort(
        (a, b) => {
            const dayOrder = {
                mon: 1,
                tue: 2,
                wed: 3,
                thu: 4,
                fri: 5,
            };

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

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <DashboardLayout>
                <div className="timetable-page">
                    <div className="timetable-loading">
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
            <div className="timetable-page">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="timetable-header">
                    <div>
                        <h1>
                            {viewType === "parent"
                                ? `${studentName || "Student"}'s Timetable`
                                : `${studentName || "Student"}'s Timetable`}
                        </h1>

                        <p>
                            {viewType === "parent"
                                ? `View ${
                                      studentName ||
                                      "your child's"
                                  } weekly school timetable.`
                                : "View your weekly school timetable."}
                        </p>
                    </div>
                </div>

                {/* ==================================================
                    WEEK NAVIGATION
                ================================================== */}

                <div className="timetable-week-controls">

                    <button
                        type="button"
                        onClick={() =>
                            changeWeek(-1)
                        }
                        className="week-button"
                    >
                        ← Previous Week
                    </button>

                    <div className="week-display">

                        <span className="week-label">
                            Week
                        </span>

                        <strong>
                            {formatWeekRange()}
                        </strong>

                    </div>

                    <button
                        type="button"
                        onClick={goToToday}
                        className="today-button"
                        disabled={isCurrentWeek()}
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            changeWeek(1)
                        }
                        className="week-button"
                    >
                        Next Week →
                    </button>

                </div>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="timetable-error">
                        {error}
                    </div>
                )}

                {/* ==================================================
                    EMPTY
                ================================================== */}

                {timetable.length === 0 ? (
                    <div className="timetable-empty">

                        <div className="timetable-empty-icon">
                            🕐
                        </div>

                        <h3>
                            No timetable available
                        </h3>

                        <p>
                            A timetable has not been
                            created for this student yet.
                        </p>

                    </div>
                ) : (

                    /* ==================================================
                       TABLE
                    ================================================== */

                    <div className="timetable-table-container">

                        <table className="timetable-table">

                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Time</th>
                                    <th>Subject</th>
                                    <th>Teacher</th>
                                    <th>Class</th>
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

                                                {/* DATE */}

                                                <td>
                                                    <strong>
                                                        {formatDate(
                                                            entryDate
                                                        )}
                                                    </strong>
                                                </td>

                                                {/* DAY */}

                                                <td>
                                                    <strong>
                                                        {formatDay(
                                                            entry.day
                                                        )}
                                                    </strong>
                                                </td>

                                                {/* TIME */}

                                                <td>
                                                    <strong>
                                                        {entry.start_time ||
                                                            "—"}{" "}
                                                        -{" "}
                                                        {entry.end_time ||
                                                            "—"}
                                                    </strong>
                                                </td>

                                                {/* SUBJECT */}

                                                <td>
                                                    {entry.subject_name ||
                                                        entry.subject
                                                            ?.name ||
                                                        "—"}
                                                </td>

                                                {/* TEACHER */}

                                                <td>
                                                    {entry.teacher_name ||
                                                        entry.teacher
                                                            ?.name ||
                                                        (
                                                            entry
                                                                .teacher
                                                                ?.user
                                                                ?.first_name ||
                                                            ""
                                                        ) +
                                                            " " +
                                                            (
                                                                entry
                                                                    .teacher
                                                                    ?.user
                                                                    ?.last_name ||
                                                                ""
                                                            ) ||
                                                        "—"}
                                                </td>

                                                {/* CLASS */}

                                                <td>
                                                    {entry.class_name ||
                                                        entry
                                                            .school_class
                                                            ?.class_name ||
                                                        entry
                                                            .school_class
                                                            ?.name ||
                                                        "—"}
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

export default TimetableView;



