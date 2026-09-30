import { useEffect, useMemo, useState } from "react";
import {
    FiBookOpen,
    FiCalendar,
    FiCheckCircle,
    FiDownload,
    FiFileText,
    FiPrinter,
    FiRefreshCw,
    FiTrendingUp,
    FiUser,
    FiAlertCircle,
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";


import {
    getChildren,
    getTermPerformance,
} from "../../api/parentAPI";

import "./ParentPerformance.css";


// ============================================================
// HELPERS
// ============================================================

const getStudentId = (child) =>
    child?.student_id ??
    child?.student?.id ??
    child?.id;

const getStudentName = (child) =>
    child?.student_name ||
    child?.student?.name ||
    `${child?.student?.first_name || ""} ${
        child?.student?.last_name || ""
    }`.trim() ||
    "Student";


// ============================================================
// PARENT PERFORMANCE
// ============================================================

function ParentPerformance() {
    const currentYear = new Date().getFullYear();

    const [children, setChildren] = useState([]);
    const [selectedChildId, setSelectedChildId] = useState("");

    const [term, setTerm] = useState("Term 1");
    const [session, setSession] = useState(currentYear);

    const [performance, setPerformance] = useState(null);

    const [loadingChildren, setLoadingChildren] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(false);

    const [error, setError] = useState("");


    // ========================================================
    // LOAD CHILDREN
    // ========================================================

    useEffect(() => {
        const loadChildren = async () => {
            try {
                setLoadingChildren(true);
                setError("");

                const data = await getChildren();

                const childList = Array.isArray(data)
                    ? data
                    : data?.results || data?.children || [];

                setChildren(childList);

                if (childList.length > 0) {
                    const firstId = getStudentId(childList[0]);

                    setSelectedChildId(String(firstId));
                }
            } catch (err) {
                console.error("Error loading children:", err);

                setError(
                    "Unable to load your children. Please refresh the page."
                );
            } finally {
                setLoadingChildren(false);
            }
        };

        loadChildren();
    }, []);


    // ========================================================
    // SELECTED CHILD
    // ========================================================

    const selectedChild = useMemo(() => {
        return children.find(
            (child) =>
                String(getStudentId(child)) ===
                String(selectedChildId)
        );
    }, [children, selectedChildId]);


    // ========================================================
    // LOAD TERM PERFORMANCE
    // ========================================================

    const loadPerformance = async () => {
        if (!selectedChildId) {
            return;
        }

        try {
            setLoadingPerformance(true);
            setError("");

            const data = await getTermPerformance(
                selectedChildId,
                term,
                session
            );

            console.log(
                "TERM PERFORMANCE RESPONSE:",
                data
            );

            setPerformance(data);
        } catch (err) {
            console.error(
                "Error loading term performance:",
                err
            );

            if (err?.response?.status === 401) {
                setError(
                    "Your login session has expired. Please log in again."
                );
            } else if (err?.response?.status === 404) {
                setError(
                    "Term performance information was not found."
                );
            } else {
                setError(
                    "Unable to load term performance. Please try again."
                );
            }

            setPerformance(null);
        } finally {
            setLoadingPerformance(false);
        }
    };


    // ========================================================
    // LOAD PERFORMANCE WHEN FILTERS CHANGE
    // ========================================================

    useEffect(() => {
        if (!selectedChildId) {
            return;
        }

        loadPerformance();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedChildId, term, session]);


    // ========================================================
    // NORMALIZE PERFORMANCE DATA
    // ========================================================

    const subjects = useMemo(() => {
        if (!performance) {
            return [];
        }

        if (Array.isArray(performance)) {
            return performance;
        }

        return (
            performance?.subjects ||
            performance?.results ||
            performance?.records ||
            performance?.data ||
            []
        );
    }, [performance]);


    const postedSubjects = useMemo(() => {
        if (!performance) {
            return subjects;
        }

        if (Array.isArray(performance?.posted_subjects)) {
            return performance.posted_subjects;
        }

        return subjects.filter(
            (subject) =>
                subject?.posted !== false &&
                subject?.is_posted !== false
        );
    }, [performance, subjects]);


    const missingSubjects = useMemo(() => {
        if (!performance) {
            return [];
        }

        if (Array.isArray(performance?.missing_subjects)) {
            return performance.missing_subjects;
        }

        return subjects.filter(
            (subject) =>
                subject?.posted === false ||
                subject?.is_posted === false
        );
    }, [performance, subjects]);


    // ========================================================
    // TOTAL SUBJECTS
    // ========================================================

    const totalSubjects =
        performance?.total_subjects ??
        performance?.subject_count ??
        subjects.length;


    const postedCount =
        performance?.posted_count ??
        performance?.posted_subject_count ??
        postedSubjects.length;


    // ========================================================
    // AVERAGE
    // ========================================================

    const calculatedAverage = useMemo(() => {
        if (subjects.length === 0) {
            return 0;
        }

        const marks = subjects
            .map(
                (subject) =>
                    Number(
                        subject?.marks ??
                        subject?.score ??
                        subject?.mark
                    )
            )
            .filter((mark) => !Number.isNaN(mark));

        if (marks.length === 0) {
            return 0;
        }

        return (
            marks.reduce(
                (total, mark) => total + mark,
                0
            ) / marks.length
        );
    }, [subjects]);


    const average =
        performance?.average ??
        performance?.average_score ??
        calculatedAverage;


    // ========================================================
    // OVERALL GRADE
    // ========================================================

    const calculatedGrade = useMemo(() => {
        const score = Number(average);

        if (score >= 80) return "A";
        if (score >= 70) return "B";
        if (score >= 60) return "C";
        if (score >= 50) return "D";

        return "E";
    }, [average]);


    const overallGrade =
        performance?.overall_grade ??
        performance?.grade ??
        calculatedGrade;


    // ========================================================
    // SUBJECT HELPERS
    // ========================================================

    const getSubjectName = (subject) =>
        subject?.subject_name ||
        subject?.subject?.name ||
        subject?.name ||
        "Subject";


    const getMarks = (subject) =>
        subject?.marks ??
        subject?.score ??
        subject?.mark ??
        null;


    const getGrade = (subject) =>
        subject?.grade ||
        subject?.letter_grade ||
        "-";


    // ========================================================
    // PRINT
    // ========================================================

    const handlePrint = () => {
        window.print();
    };


    // ========================================================
    // REFRESH
    // ========================================================

    const handleRefresh = () => {
        loadPerformance();
    };


    // ========================================================
    // LOADING CHILDREN
    // ========================================================

    if (loadingChildren) {
        return (
            <DashboardLayout>
                <div className="parent-performance-loading">
                    <FiRefreshCw className="loading-icon" />
                    <h2>Loading Performance</h2>
                    <p>
                        Getting your children's information...
                    </p>
                </div>
            </DashboardLayout>
        );
    }


    return (
        <DashboardLayout>

            <div className="parent-performance-page">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <section className="performance-hero">

                    <div className="performance-hero-icon">
                        <FiBookOpen />
                    </div>

                    <div>
                        <h1>Term Performance</h1>

                        <p>
                            View your child's academic performance
                            by term and school year.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="performance-refresh-btn"
                        onClick={handleRefresh}
                        disabled={loadingPerformance}
                    >
                        <FiRefreshCw
                            className={
                                loadingPerformance
                                    ? "spinning"
                                    : ""
                            }
                        />

                        Refresh
                    </button>

                </section>


                {/* ==================================================
                    FILTERS
                ================================================== */}

                <section className="performance-filters">

                    <div className="filter-group">

                        <label>
                            <FiUser />
                            Select Child
                        </label>

                        <select
                            value={selectedChildId}
                            onChange={(e) =>
                                setSelectedChildId(
                                    e.target.value
                                )
                            }
                        >
                            {children.map((child) => {
                                const id =
                                    getStudentId(child);

                                return (
                                    <option
                                        key={id}
                                        value={id}
                                    >
                                        {getStudentName(child)}
                                    </option>
                                );
                            })}
                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            <FiCalendar />
                            Term
                        </label>

                        <select
                            value={term}
                            onChange={(e) =>
                                setTerm(e.target.value)
                            }
                        >
                            <option value="Term 1">
                                Term 1
                            </option>

                            <option value="Term 2">
                                Term 2
                            </option>

                            <option value="Term 3">
                                Term 3
                            </option>
                        </select>

                    </div>


                    <div className="filter-group">

                        <label>
                            <FiCalendar />
                            Session
                        </label>

                        <select
                            value={session}
                            onChange={(e) =>
                                setSession(
                                    Number(e.target.value)
                                )
                            }
                        >
                            {Array.from(
                                { length: 5 },
                                (_, index) =>
                                    currentYear - 2 + index
                            ).map((year) => (
                                <option
                                    key={year}
                                    value={year}
                                >
                                    {year}
                                </option>
                            ))}
                        </select>

                    </div>

                </section>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="performance-error">
                        <FiAlertCircle />

                        <span>{error}</span>
                    </div>
                )}


                {/* ==================================================
                    STUDENT INFORMATION
                ================================================== */}

                {selectedChild && (
                    <section className="student-performance-info">

                        <div className="student-avatar">
                            {getStudentName(
                                selectedChild
                            )
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <span>Student</span>

                            <h2>
                                {getStudentName(
                                    selectedChild
                                )}
                            </h2>

                            <p>
                                {selectedChild?.class_name ||
                                    selectedChild?.school_class ||
                                    selectedChild?.class ||
                                    "Class information unavailable"}
                            </p>
                        </div>

                        <div className="student-term">
                            <span>Academic Period</span>

                            <strong>
                                {term} • {session}
                            </strong>
                        </div>

                    </section>
                )}


                {/* ==================================================
                    LOADING
                ================================================== */}

                {loadingPerformance ? (
                    <div className="performance-loading">

                        <FiRefreshCw className="spinning" />

                        <h3>
                            Loading term performance...
                        </h3>

                        <p>
                            Please wait while we retrieve
                            the latest posted marks.
                        </p>

                    </div>
                ) : performance ? (

                    <>

                        {/* ==================================================
                            SUMMARY CARDS
                        ================================================== */}

                        <section className="performance-summary">

                            <div className="performance-card posted">

                                <div className="card-icon">
                                    <FiCheckCircle />
                                </div>

                                <div>
                                    <span>
                                        Subjects Posted
                                    </span>

                                    <strong>
                                        {postedCount} /{" "}
                                        {totalSubjects}
                                    </strong>

                                    <small>
                                        Marks available
                                    </small>
                                </div>

                            </div>


                            <div className="performance-card average">

                                <div className="card-icon">
                                    <FiTrendingUp />
                                </div>

                                <div>
                                    <span>
                                        Average Score
                                    </span>

                                    <strong>
                                        {Number(
                                            average || 0
                                        ).toFixed(1)}
                                    </strong>

                                    <small>
                                        Out of 100
                                    </small>
                                </div>

                            </div>


                            <div className="performance-card grade">

                                <div className="card-icon">
                                    <FiBookOpen />
                                </div>

                                <div>
                                    <span>
                                        Overall Grade
                                    </span>

                                    <strong>
                                        {overallGrade}
                                    </strong>

                                    <small>
                                        Current term
                                    </small>
                                </div>

                            </div>

                        </section>


                        {/* ==================================================
                            SUBJECT RESULTS
                        ================================================== */}

                        <section className="performance-section">

                            <div className="section-heading">

                                <div>
                                    <h2>
                                        Subject Performance
                                    </h2>

                                    <p>
                                        Marks posted by the
                                        school for{" "}
                                        {term}.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="print-button"
                                    onClick={
                                        handlePrint
                                    }
                                >
                                    <FiPrinter />
                                    Print / Save PDF
                                </button>

                            </div>


                            {postedSubjects.length > 0 ? (
                                <div className="performance-table-wrapper">

                                    <table className="performance-table">

                                        <thead>
                                            <tr>
                                                <th>
                                                    #
                                                </th>

                                                <th>
                                                    Subject
                                                </th>

                                                <th>
                                                    Marks
                                                </th>

                                                <th>
                                                    Grade
                                                </th>

                                                <th>
                                                    Status
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {postedSubjects.map(
                                                (
                                                    subject,
                                                    index
                                                ) => (
                                                    <tr
                                                        key={
                                                            subject?.id ||
                                                            `${getSubjectName(
                                                                subject
                                                            )}-${index}`
                                                        }
                                                    >

                                                        <td>
                                                            {index +
                                                                1}
                                                        </td>

                                                        <td className="subject-name">
                                                            <FiBookOpen />

                                                            {getSubjectName(
                                                                subject
                                                            )}
                                                        </td>

                                                        <td className="marks-cell">
                                                            {getMarks(
                                                                subject
                                                            ) !==
                                                            null
                                                                ? Number(
                                                                      getMarks(
                                                                          subject
                                                                      )
                                                                  ).toFixed(
                                                                      1
                                                                  )
                                                                : "-"
                                                            }
                                                        </td>

                                                        <td>
                                                            <span className="grade-badge">
                                                                {getGrade(
                                                                    subject
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span className="posted-badge">
                                                                <FiCheckCircle />
                                                                Posted
                                                            </span>
                                                        </td>

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>
                            ) : (
                                <div className="no-performance">
                                    <FiFileText />

                                    <h3>
                                        No marks posted yet
                                    </h3>

                                    <p>
                                        There are no subject
                                        results available
                                        for this term.
                                    </p>
                                </div>
                            )}

                        </section>


                        {/* ==================================================
                            MISSING SUBJECTS
                        ================================================== */}

                        {missingSubjects.length > 0 && (
                            <section className="missing-subjects">

                                <div className="missing-header">

                                    <FiAlertCircle />

                                    <div>
                                        <h2>
                                            Missing Subjects
                                        </h2>

                                        <p>
                                            These subjects do
                                            not have posted
                                            marks yet.
                                        </p>
                                    </div>

                                </div>


                                <div className="missing-list">

                                    {missingSubjects.map(
                                        (
                                            subject,
                                            index
                                        ) => (
                                            <div
                                                className="missing-item"
                                                key={
                                                    subject?.id ||
                                                    index
                                                }
                                            >
                                                <FiBookOpen />

                                                <span>
                                                    {typeof subject ===
                                                    "string"
                                                        ? subject
                                                        : getSubjectName(
                                                              subject
                                                          )}
                                                </span>

                                                <small>
                                                    Not posted
                                                </small>
                                            </div>
                                        )
                                    )}

                                </div>

                            </section>
                        )}


                        {/* ==================================================
                            ACTIONS
                        ================================================== */}

                        <section className="performance-actions">

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="action-primary"
                            >
                                <FiPrinter />
                                Print Performance
                            </button>

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="action-secondary"
                            >
                                <FiDownload />
                                Save as PDF
                            </button>

                        </section>

                    </>

                ) : (

                    <div className="performance-empty">

                        <FiFileText />

                        <h2>
                            Select a child to view performance
                        </h2>

                        <p>
                            Choose a child, term and session
                            above.
                        </p>

                    </div>

                )}

            </div>

        </DashboardLayout>
    );
}

export default ParentPerformance;

