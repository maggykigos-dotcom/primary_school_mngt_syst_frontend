import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import StatCard from "../../components/StatCard/StatCard";
import DataTable from "../../components/DataTable/DataTable";

import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";
import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

import {
    getChildren,
    getChildAttendance,
    getChildResults,
    getTermPerformance,
} from "../../api/parentAPI";

import {
    getFees,
    initiateMpesaPayment,
} from "../../api/financeAPI";

import {
    FiUsers,
    FiDollarSign,
    FiCalendar,
    FiBarChart2,
    FiBookOpen,
    FiCreditCard,
    FiCheck,
    FiX,
    FiSmartphone,
    FiUser,
    FiHome,
    FiTrendingUp,
    FiAward,
    FiClock,
} from "react-icons/fi";

import "./ParentDashboard.css";

// ============================================================
// HELPER
// ============================================================

const getStudentId = (child) => {
    if (!child) {
        return null;
    }

    return (
        child.student_id ??
        child.student?.id ??
        child.id
    );
};

// ============================================================
// COMPONENT
// ============================================================

const ParentDashboard = () => {

    // ============================================================
    // CHILDREN / FEES
    // ============================================================

    const [children, setChildren] = useState([]);
    const [fees, setFees] = useState([]);

    // ============================================================
    // ACADEMIC DATA
    // ============================================================

    const [childAttendance, setChildAttendance] = useState({});
    const [childResults, setChildResults] = useState({});

    const [loadingChildren, setLoadingChildren] = useState(true);
    const [loadingAcademicData, setLoadingAcademicData] =
        useState(false);

    // ============================================================
    // TERM PERFORMANCE
    // ============================================================

    const [termPerformance, setTermPerformance] = useState(null);
    const [loadingTermPerformance, setLoadingTermPerformance] =
        useState(false);

    const [selectedTerm, setSelectedTerm] = useState("Term 1");

    const [selectedSession, setSelectedSession] = useState(
        new Date().getFullYear()
    );

    // ============================================================
    // SELECTED CHILD
    // ============================================================

    const [selectedChildId, setSelectedChildId] =
        useState(null);

    // ============================================================
    // PAYMENT
    // ============================================================

    const [selectedFee, setSelectedFee] = useState(null);
    const [amount, setAmount] = useState("");
    const [phone, setPhone] = useState("");
    const [paymentMessage, setPaymentMessage] = useState("");
    const [paymentLoading, setPaymentLoading] = useState(false);

    // ============================================================
    // LOAD CHILDREN + FEES
    // ============================================================

    useEffect(() => {

        const loadData = async () => {

            setLoadingChildren(true);

            try {

                const [
                    childrenData,
                    feesData,
                ] = await Promise.all([
                    getChildren(),
                    getFees(),
                ]);

                const loadedChildren =
                    Array.isArray(childrenData)
                        ? childrenData
                        : Array.isArray(childrenData?.results)
                            ? childrenData.results
                            : [];

                const loadedFees =
                    Array.isArray(feesData)
                        ? feesData
                        : Array.isArray(feesData?.results)
                            ? feesData.results
                            : [];

                console.log(
                    "PARENT CHILDREN:",
                    loadedChildren
                );

                console.log(
                    "PARENT FEES:",
                    loadedFees
                );

                setChildren(loadedChildren);
                setFees(loadedFees);

                // Automatically select first child
                if (loadedChildren.length > 0) {

                    const firstStudentId =
                        getStudentId(
                            loadedChildren[0]
                        );

                    setSelectedChildId(
                        String(firstStudentId)
                    );

                } else {

                    setSelectedChildId(null);

                }

            } catch (error) {

                console.error(
                    "Failed to load parent dashboard:",
                    error
                );

                setChildren([]);
                setFees([]);
                setSelectedChildId(null);

            } finally {

                setLoadingChildren(false);

            }
        };

        loadData();

    }, []);

    // ============================================================
    // LOAD ATTENDANCE + RESULTS
    // ============================================================

    useEffect(() => {

        if (!children.length) {

            setChildAttendance({});
            setChildResults({});
            setLoadingAcademicData(false);

            return;
        }

        const loadAcademicData = async () => {

            setLoadingAcademicData(true);

            try {

                const attendanceMap = {};
                const resultsMap = {};

                await Promise.all(

                    children.map(async (child) => {

                        const studentId =
                            getStudentId(child);

                        if (!studentId) {
                            return;
                        }

                        const studentKey =
                            String(studentId);

                        try {

                            const [
                                attendanceResponse,
                                resultsResponse,
                            ] = await Promise.all([

                                getChildAttendance(
                                    studentId
                                ),

                                getChildResults(
                                    studentId
                                ),

                            ]);

                            // ------------------------------------------------
                            // NORMALIZE ATTENDANCE
                            // ------------------------------------------------

                            const attendance =
                                Array.isArray(
                                    attendanceResponse
                                )
                                    ? attendanceResponse
                                    : Array.isArray(
                                        attendanceResponse?.results
                                    )
                                        ? attendanceResponse.results
                                        : [];

                            // ------------------------------------------------
                            // NORMALIZE RESULTS
                            // ------------------------------------------------

                            const results =
                                Array.isArray(
                                    resultsResponse
                                )
                                    ? resultsResponse
                                    : Array.isArray(
                                        resultsResponse?.results
                                    )
                                        ? resultsResponse.results
                                        : [];

                            // ------------------------------------------------
                            // FILTER BY STUDENT
                            // ------------------------------------------------

                            const filteredAttendance =
                                attendance.filter(
                                    (record) =>
                                        String(
                                            record.student
                                        ) === studentKey
                                );

                            const filteredResults =
                                results.filter(
                                    (record) =>
                                        String(
                                            record.student
                                        ) === studentKey
                                );

                            // ------------------------------------------------
                            // STORE DATA
                            // ------------------------------------------------

                            attendanceMap[
                                studentKey
                            ] = filteredAttendance;

                            resultsMap[
                                studentKey
                            ] = filteredResults;

                            console.log(
                                `Attendance for ${child.student_name}:`,
                                filteredAttendance
                            );

                            console.log(
                                `Results for ${child.student_name}:`,
                                filteredResults
                            );

                        } catch (error) {

                            console.error(
                                `Failed to load academic data for ${child.student_name}:`,
                                error
                            );

                            attendanceMap[
                                studentKey
                            ] = [];

                            resultsMap[
                                studentKey
                            ] = [];
                        }

                    })

                );

                setChildAttendance(
                    attendanceMap
                );

                setChildResults(
                    resultsMap
                );

            } catch (error) {

                console.error(
                    "Failed to load academic data:",
                    error
                );

                setChildAttendance({});
                setChildResults({});

            } finally {

                setLoadingAcademicData(false);

            }
        };

        loadAcademicData();

    }, [children]);

    // ============================================================
    // CURRENT CHILD
    // ============================================================

    const currentChild = useMemo(() => {

        if (!children.length) {
            return null;
        }

        const selected =
            children.find(
                (child) =>
                    String(
                        getStudentId(child)
                    ) ===
                    String(selectedChildId)
            );

        return selected || children[0];

    }, [
        children,
        selectedChildId,
    ]);

    // ============================================================
    // CURRENT CHILD ID
    // ============================================================

    const currentChildId = currentChild
        ? String(
            getStudentId(currentChild)
        )
        : null;

    // ============================================================
    // LOAD TERM PERFORMANCE
    // ============================================================

    useEffect(() => {

        if (!currentChildId) {

            setTermPerformance(null);

            return;
        }

        const loadTermPerformance = async () => {

            setLoadingTermPerformance(true);

            try {

                console.log(
                    "Loading term performance:",
                    {
                        student: currentChildId,
                        term: selectedTerm,
                        session: selectedSession,
                    }
                );

                const response =
                    await getTermPerformance(
                        currentChildId,
                        selectedTerm,
                        selectedSession
                    );

                console.log(
                    "TERM PERFORMANCE:",
                    response
                );

                setTermPerformance(response);

            } catch (error) {

                console.error(
                    "Failed to load term performance:",
                    error
                );

                setTermPerformance(null);

            } finally {

                setLoadingTermPerformance(false);

            }
        };

        loadTermPerformance();

    }, [
        currentChildId,
        selectedTerm,
        selectedSession,
    ]);

    // ============================================================
    // ATTENDANCE DATA
    // ============================================================

    const attendanceData = useMemo(() => {

        if (!currentChildId) {
            return [];
        }

        return (
            childAttendance[currentChildId] ||
            []
        );

    }, [
        currentChildId,
        childAttendance,
    ]);

    // ============================================================
    // RESULTS DATA
    // ============================================================

    const resultsData = useMemo(() => {

        if (!currentChildId) {
            return [];
        }

        return (
            childResults[currentChildId] ||
            []
        );

    }, [
        currentChildId,
        childResults,
    ]);

    // ============================================================
    // ATTENDANCE RATE
    // ============================================================

    const attendanceRate = useMemo(() => {

        if (!attendanceData.length) {
            return "--";
        }

        let present = 0;
        let total = 0;

        attendanceData.forEach((record) => {

            const status = String(
                record.status ||
                record.attendance_status ||
                ""
            ).toLowerCase();

            const isPresent =
                status === "present" ||
                record.is_present === true ||
                record.present === true;

            const isAbsent =
                status === "absent" ||
                record.is_absent === true ||
                record.absent === true;

            const isExcused =
                status === "excused" ||
                record.is_excused === true ||
                record.excused === true;

            if (
                isPresent ||
                isAbsent ||
                isExcused
            ) {

                total += 1;

                if (isPresent) {
                    present += 1;
                }
            }

        });

        if (total === 0) {
            return "--";
        }

        return `${Math.round(
            (present / total) * 100
        )}%`;

    }, [attendanceData]);

    // ============================================================
    // PERFORMANCE DATA
    // ============================================================

    const performanceData = useMemo(() => {

        if (!resultsData.length) {
            return [];
        }

        const subjectGroups = {};

        resultsData.forEach((result) => {

            const subject =
                result.subject?.name ||
                result.subject_name ||
                result.subject?.title ||
                (
                    typeof result.subject === "string"
                        ? result.subject
                        : null
                ) ||
                "Unknown Subject";

            let mark =
                result.marks ??
                result.mark ??
                result.score ??
                result.marks_obtained ??
                result.obtained_marks ??
                result.percentage ??
                result.score_percentage;

            if (
                typeof mark === "object" &&
                mark !== null
            ) {

                mark =
                    mark.marks ??
                    mark.mark ??
                    mark.score ??
                    mark.percentage;
            }

            mark = Number(mark);

            if (Number.isNaN(mark)) {
                return;
            }

            if (!subjectGroups[subject]) {
                subjectGroups[subject] = [];
            }

            subjectGroups[subject].push(mark);

        });

        return Object.entries(
            subjectGroups
        ).map(
            ([subject, marks]) => {

                const average =
                    marks.reduce(
                        (total, mark) =>
                            total + mark,
                        0
                    ) / marks.length;

                return {
                    subject,
                    performance:
                        Math.round(average),
                };

            }
        );

    }, [resultsData]);

    // ============================================================
    // AVERAGE SCORE
    // ============================================================

    const averageScore = useMemo(() => {

        if (!performanceData.length) {
            return "--";
        }

        const total =
            performanceData.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.performance || 0
                    ),
                0
            );

        return `${Math.round(
            total / performanceData.length
        )}%`;

    }, [performanceData]);

    // ============================================================
    // TERM PERFORMANCE DISPLAY
    // ============================================================

    const termAverage =
        termPerformance?.average !== null &&
        termPerformance?.average !== undefined
            ? Number(
                termPerformance.average
            )
            : null;

    const termHasPerformance =
        termAverage !== null &&
        !Number.isNaN(termAverage);

    const termResults =
        Array.isArray(
            termPerformance?.results
        )
            ? termPerformance.results
            : [];

    const postedSubjects =
        Number(
            termPerformance?.posted_subjects || 0
        );

    const totalSubjects =
        Number(
            termPerformance?.total_subjects || 0
        );

    const remainingSubjects =
        Number(
            termPerformance?.remaining_subjects || 0
        );

    // ============================================================
    // SELECTED CHILD FEE
    // ============================================================

    const currentChildFee = useMemo(() => {

        if (!currentChildId) {
            return null;
        }

        return (
            fees.find((fee) => {

                const feeStudentId =
                    fee.student?.id ??
                    fee.student_id ??
                    fee.student;

                return (
                    String(feeStudentId) ===
                    String(currentChildId)
                );

            }) || null
        );

    }, [
        fees,
        currentChildId,
    ]);

    // ============================================================
    // SELECTED CHILD BALANCE
    // ============================================================

    const currentChildBalance = useMemo(() => {

        if (!currentChildFee) {
            return 0;
        }

        return Number(
            currentChildFee.balance || 0
        );

    }, [currentChildFee]);

    // ============================================================
    // GET CHILD FEE
    // ============================================================

    const getChildFee = (child) => {

        const studentId =
            getStudentId(child);

        return (
            fees.find((fee) => {

                const feeStudentId =
                    fee.student?.id ??
                    fee.student_id ??
                    fee.student;

                return (
                    String(feeStudentId) ===
                    String(studentId)
                );

            }) || null
        );
    };

    // ============================================================
    // SELECT CHILD
    // ============================================================

    const handleSelectChild = (child) => {

        const studentId =
            getStudentId(child);

        setSelectedChildId(
            String(studentId)
        );

        setTermPerformance(null);

        setSelectedFee(null);
        setAmount("");
        setPhone("");
        setPaymentMessage("");
    };

    // ============================================================
    // OPEN PAYMENT FORM
    // ============================================================

    const handlePayFees = (fee) => {

        setSelectedFee(fee);
        setAmount("");
        setPhone("");
        setPaymentMessage("");

        setTimeout(() => {

            const element =
                document.getElementById(
                    "payment-form"
                );

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });

            }

        }, 100);
    };

    // ============================================================
    // CLOSE PAYMENT FORM
    // ============================================================

    const closePaymentForm = () => {

        setSelectedFee(null);
        setAmount("");
        setPhone("");
        setPaymentMessage("");

    };

    // ============================================================
    // M-PESA PAYMENT
    // ============================================================

    const handlePayment = async (event) => {

        event.preventDefault();

        if (!selectedFee) {

            setPaymentMessage(
                "Please select a fee record."
            );

            return;
        }

        const paymentAmount =
            Number(amount);

        const balance =
            Number(
                selectedFee.balance || 0
            );

        if (paymentAmount <= 0) {

            setPaymentMessage(
                "Please enter a valid payment amount."
            );

            return;
        }

        if (paymentAmount > balance) {

            setPaymentMessage(
                "Payment amount cannot exceed the outstanding balance."
            );

            return;
        }

        if (!phone) {

            setPaymentMessage(
                "Please enter your M-Pesa phone number."
            );

            return;
        }

        try {

            setPaymentLoading(true);
            setPaymentMessage("");

            const studentId =
                selectedFee.student?.id ??
                selectedFee.student_id ??
                selectedFee.student;

            const response =
                await initiateMpesaPayment({
                    student_id:
                        studentId,

                    fee_id:
                        selectedFee.id,

                    amount:
                        paymentAmount,

                    phone_number:
                        phone,
                });

            setPaymentMessage(
                response.message ||
                "Payment request sent. Check your phone for the M-Pesa prompt."
            );

            setAmount("");

        } catch (error) {

            console.error(
                "M-Pesa payment error:",
                error
            );

            const errorMessage =
                error.response?.data?.error ||
                error.response?.data?.detail ||
                "Unable to initiate M-Pesa payment.";

            setPaymentMessage(
                errorMessage
            );

        } finally {

            setPaymentLoading(false);

        }
    };

    // ============================================================
    // TABLE COLUMNS
    // ============================================================

    const columns = [
        {
            key: "admission_number",
            label: "Admission No.",
        },
        {
            key: "student_name",
            label: "Child",
        },
        {
            key: "class_name",
            label: "Class",
        },
    ];

    // ============================================================
    // RENDER
    // ============================================================

    return (

        <DashboardLayout>

            <div className="parent-dashboard">

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div className="dashboard-header">

                    <div className="dashboard-header-icon">
                        <FiHome />
                    </div>

                    <div>

                        <h1>
                            Parent Dashboard
                        </h1>

                        <p>
                            Monitor your children's
                            progress, attendance,
                            academic performance
                            and school fees.
                        </p>

                    </div>

                </div>

                {/* ==================================================
                    CHILD SELECTOR
                ================================================== */}

                {children.length > 0 && (

                    <section className="dashboard-panel child-selector-panel">

                        <div className="selector-heading">

                            <div className="section-heading-icon family-icon">
                                <FiUsers />
                            </div>

                            <div>

                                <span className="section-label">
                                    FAMILY
                                </span>

                                <h2>
                                    Select a Child
                                </h2>

                                <p>
                                    Choose a child to view
                                    their academic,
                                    attendance and fee
                                    information.
                                </p>

                            </div>

                        </div>

                        <div className="child-selection-grid">

                            {children.map((child) => {

                                const studentId =
                                    getStudentId(child);

                                const isSelected =
                                    String(
                                        studentId
                                    ) ===
                                    String(
                                        selectedChildId
                                    );

                                return (

                                    <button
                                        type="button"
                                        key={studentId}
                                        className={
                                            `child-selection-card ${
                                                isSelected
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                        onClick={() =>
                                            handleSelectChild(
                                                child
                                            )
                                        }
                                    >

                                        <div className="child-avatar">
                                            <FiUser />
                                        </div>

                                        <div className="child-selection-details">

                                            <strong>
                                                {
                                                    child.student_name
                                                }
                                            </strong>

                                            <span>
                                                {
                                                    child.admission_number
                                                }
                                            </span>

                                            <span>
                                                {
                                                    child.class_name ||
                                                    "Class not available"
                                                }
                                            </span>

                                        </div>

                                        {isSelected && (

                                            <div className="child-selected-check">
                                                <FiCheck />
                                            </div>

                                        )}

                                    </button>

                                );

                            })}

                        </div>

                        {currentChild && (

                            <div className="selected-child-info">

                                <span className="selected-child-label">
                                    Currently viewing
                                </span>

                                <div className="selected-child-name">

                                    <FiUser />

                                    <strong>
                                        {
                                            currentChild.student_name
                                        }
                                    </strong>

                                    <span>
                                        •
                                    </span>

                                    <span>
                                        {
                                            currentChild.class_name
                                        }
                                    </span>

                                </div>

                            </div>

                        )}

                    </section>

                )}

                {/* ==================================================
                    STATS
                ================================================== */}

                <div className="stats-grid">

                    <StatCard
                        title="Children"
                        value={
                            loadingChildren
                                ? "..."
                                : children.length
                        }
                        icon={<FiUsers />}
                    />

                    <StatCard
                        title={
                            currentChild
                                ? `${currentChild.student_name}'s Fee Balance`
                                : "Fee Balance"
                        }
                        value={
                            `KES ${currentChildBalance.toLocaleString()}`
                        }
                        icon={<FiDollarSign />}
                        type="warning"
                    />

                    <StatCard
                        title={
                            currentChild
                                ? `${currentChild.student_name}'s Attendance`
                                : "Attendance"
                        }
                        value={
                            loadingAcademicData
                                ? "..."
                                : attendanceRate
                        }
                        icon={<FiCalendar />}
                        type="success"
                    />

                    <StatCard
                        title={
                            currentChild
                                ? `${currentChild.student_name}'s Average`
                                : "Average Score"
                        }
                        value={
                            loadingAcademicData
                                ? "..."
                                : averageScore
                        }
                        icon={<FiTrendingUp />}
                        type="danger"
                    />

                </div>

                {/* ==================================================
                    ACADEMIC SECTION
                ================================================== */}

                {currentChild && (

                    <section className="academic-section">

                        <div className="section-heading">

                            <div className="section-heading-icon academic-icon">
                                <FiBookOpen />
                            </div>

                            <div>

                                <span className="section-label">
                                    ACADEMICS
                                </span>

                                <h2>
                                    {currentChild.student_name}'s
                                    Academic Overview
                                </h2>

                                <p>
                                    Attendance and performance
                                    information for{" "}
                                    {
                                        currentChild.student_name
                                    }.
                                </p>

                            </div>

                        </div>

                        {/* ==================================================
                            TERM PERFORMANCE
                        ================================================== */}

                        <div className="term-performance-card">

                            <div className="term-performance-header">

                                <div className="term-performance-title">

                                    <div className="term-performance-icon">
                                        <FiAward />
                                    </div>

                                    <div>

                                        <span className="section-label">
                                            TERM RESULTS
                                        </span>

                                        <h2>
                                            Term Performance
                                        </h2>

                                        <p>
                                            Current academic
                                            performance for{" "}
                                            <strong>
                                                {
                                                    currentChild.student_name
                                                }
                                            </strong>
                                        </p>

                                    </div>

                                </div>

                                <div className="term-performance-filters">

                                    <select
                                        value={selectedTerm}
                                        onChange={(event) =>
                                            setSelectedTerm(
                                                event.target.value
                                            )
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

                                    <select
                                        value={selectedSession}
                                        onChange={(event) =>
                                            setSelectedSession(
                                                Number(
                                                    event.target.value
                                                )
                                            )
                                        }
                                    >

                                        <option
                                            value={
                                                new Date().getFullYear()
                                            }
                                        >
                                            {
                                                new Date().getFullYear()
                                            }
                                        </option>

                                        <option
                                            value={
                                                new Date().getFullYear() - 1
                                            }
                                        >
                                            {
                                                new Date().getFullYear() - 1
                                            }
                                        </option>

                                    </select>

                                </div>

                            </div>

                            {loadingTermPerformance ? (

                                <div className="term-performance-loading">

                                    <FiBarChart2 />

                                    <span>
                                        Loading term performance...
                                    </span>

                                </div>

                            ) : termHasPerformance ? (

                                <>

                                    {/* ==================================================
                                        PERFORMANCE SUMMARY
                                    ================================================== */}

                                    <div className="term-performance-summary">

                                        <div className="performance-summary-box average-box">

                                            <div className="summary-box-icon">
                                                <FiTrendingUp />
                                            </div>

                                            <div>

                                                <span>
                                                    Average Score
                                                </span>

                                                <strong>
                                                    {termAverage.toFixed(1)}%
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="performance-summary-box grade-box">

                                            <div className="summary-box-icon">
                                                <FiAward />
                                            </div>

                                            <div>

                                                <span>
                                                    Overall Grade
                                                </span>

                                                <strong>
                                                    {
                                                        termPerformance.overall_grade ||
                                                        "—"
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="performance-summary-box subjects-box">

                                            <div className="summary-box-icon">
                                                <FiBookOpen />
                                            </div>

                                            <div>

                                                <span>
                                                    Subjects Recorded
                                                </span>

                                                <strong>
                                                    {postedSubjects}
                                                    {
                                                        totalSubjects > 0
                                                            ? ` / ${totalSubjects}`
                                                            : ""
                                                    }
                                                </strong>

                                            </div>

                                        </div>

                                        <div className="performance-summary-box remaining-box">

                                            <div className="summary-box-icon">
                                                <FiClock />
                                            </div>

                                            <div>

                                                <span>
                                                    Remaining
                                                </span>

                                                <strong>
                                                    {remainingSubjects}
                                                </strong>

                                            </div>

                                        </div>

                                    </div>

                                    {/* ==================================================
                                        SUBJECT RESULTS
                                    ================================================== */}

                                    <div className="term-results-section">

                                        <div className="term-results-heading">

                                            <div>

                                                <h3>
                                                    Subject Results
                                                </h3>

                                                <p>
                                                    Results currently
                                                    recorded for{" "}
                                                    {selectedTerm},{" "}
                                                    {selectedSession}.
                                                </p>

                                            </div>

                                        </div>

                                        {termResults.length > 0 ? (

                                            <div className="term-results-table-wrapper">

                                                <table className="term-results-table">

                                                    <thead>

                                                        <tr>

                                                            <th>
                                                                Subject
                                                            </th>

                                                            <th>
                                                                Marks
                                                            </th>

                                                            <th>
                                                                Grade
                                                            </th>

                                                        </tr>

                                                    </thead>

                                                    <tbody>

                                                        {termResults.map(
                                                            (
                                                                result,
                                                                index
                                                            ) => (

                                                                <tr
                                                                    key={
                                                                        result.id ||
                                                                        `${result.subject_name}-${index}`
                                                                    }
                                                                >

                                                                    <td>

                                                                        <div className="subject-name-cell">

                                                                            <span className="subject-table-icon">
                                                                                <FiBookOpen />
                                                                            </span>

                                                                            <strong>
                                                                                {
                                                                                    result.subject_name ||
                                                                                    result.subject?.name ||
                                                                                    result.subject?.title ||
                                                                                    (
                                                                                        typeof result.subject === "string"
                                                                                            ? result.subject
                                                                                            : null
                                                                                    ) ||
                                                                                    "Unknown Subject"
                                                                                }
                                                                            </strong>

                                                                        </div>

                                                                    </td>

                                                                    <td>

                                                                        <strong className="marks-value">

                                                                            {
                                                                                result.marks ??
                                                                                result.mark ??
                                                                                result.score ??
                                                                                "—"
                                                                            }

                                                                        </strong>

                                                                    </td>

                                                                    <td>

                                                                        <span className="result-grade-badge">

                                                                            {
                                                                                result.grade ||
                                                                                "—"
                                                                            }

                                                                        </span>

                                                                    </td>

                                                                </tr>

                                                            )
                                                        )}

                                                    </tbody>

                                                </table>

                                            </div>

                                        ) : (

                                            <div className="term-no-subject-results">

                                                <FiBookOpen />

                                                <span>
                                                    No individual subject
                                                    results are available
                                                    yet.
                                                </span>

                                            </div>

                                        )}

                                    </div>

                                    {/* ==================================================
                                        PARTIAL RESULTS NOTICE
                                    ================================================== */}

                                    {remainingSubjects > 0 && (

                                        <div className="partial-results-notice">

                                            <div className="partial-results-icon">
                                                <FiClock />
                                            </div>

                                            <div>

                                                <strong>
                                                    Results are still being entered
                                                </strong>

                                                <p>

                                                    {postedSubjects} subject
                                                    {
                                                        postedSubjects === 1
                                                            ? ""
                                                            : "s"
                                                    }{" "}
                                                    {
                                                        postedSubjects === 1
                                                            ? "has"
                                                            : "have"
                                                    }{" "}
                                                    been recorded so far.
                                                    The current average is
                                                    calculated using the
                                                    available results.

                                                </p>

                                            </div>

                                        </div>

                                    )}

                                </>

                            ) : (

                                <div className="no-term-performance">

                                    <div className="no-performance-icon">
                                        <FiBarChart2 />
                                    </div>

                                    <h3>
                                        No results recorded yet
                                    </h3>

                                    <p>
                                        No results have been
                                        recorded for{" "}
                                        {
                                            currentChild.student_name
                                        }{" "}
                                        for{" "}
                                        {selectedTerm},{" "}
                                        {selectedSession}.
                                    </p>

                                </div>

                            )}

                        </div>

                        {/* ==================================================
                            CHARTS
                        ================================================== */}

                        <div className="charts-grid">

                            {/* ATTENDANCE */}

                            <div className="chart-panel">

                                <div className="chart-panel-header">

                                    <div>

                                        <h3>
                                            Attendance Trends
                                        </h3>

                                        <p>
                                            Daily attendance
                                            percentage
                                        </p>

                                    </div>

                                    <span className="chart-icon attendance-chart-icon">
                                        <FiCalendar />
                                    </span>

                                </div>

                                {loadingAcademicData ? (

                                    <div className="chart-loading">
                                        Loading attendance...
                                    </div>

                                ) : attendanceData.length === 0 ? (

                                    <div className="chart-empty">

                                        <FiCalendar />

                                        <span>
                                            No attendance records
                                            available for{" "}
                                            {
                                                currentChild.student_name
                                            }.
                                        </span>

                                    </div>

                                ) : (

                                    <AttendanceChart
                                        key={
                                            `attendance-${currentChildId}`
                                        }
                                        data={
                                            attendanceData
                                        }
                                        childName={
                                            currentChild.student_name ||
                                            ""
                                        }
                                    />

                                )}

                            </div>

                            {/* PERFORMANCE */}

                            <div className="chart-panel">

                                <div className="chart-panel-header">

                                    <div>

                                        <h3>
                                            Academic Performance
                                        </h3>

                                        <p>
                                            Average marks by
                                            subject
                                        </p>

                                    </div>

                                    <span className="chart-icon performance-chart-icon">
                                        <FiBarChart2 />
                                    </span>

                                </div>

                                {loadingAcademicData ? (

                                    <div className="chart-loading">
                                        Loading performance...
                                    </div>

                                ) : performanceData.length === 0 ? (

                                    <div className="chart-empty">

                                        <FiBarChart2 />

                                        <span>
                                            No academic results
                                            available for{" "}
                                            {
                                                currentChild.student_name
                                            }.
                                        </span>

                                    </div>

                                ) : (

                                    <PerformanceChart
                                        key={
                                            `performance-${currentChildId}`
                                        }
                                        data={
                                            performanceData
                                        }
                                        childName={
                                            currentChild.student_name ||
                                            ""
                                        }
                                    />

                                )}

                            </div>

                        </div>

                    </section>

                )}

                {/* ==================================================
                    MY CHILDREN
                    SINGLE SECTION
                ================================================== */}

                <section className="dashboard-panel parent-children-panel">

                    <div className="section-heading">

                        <div className="section-heading-icon family-icon">
                            <FiUsers />
                        </div>

                        <div>

                            <span className="section-label">
                                FAMILY
                            </span>

                            <h2>
                                My Children
                            </h2>

                            <p>
                                Children linked to your
                                parent account.
                            </p>

                        </div>

                    </div>

                    <DataTable
                        columns={columns}
                        data={children}
                    />

                </section>

                {/* ==================================================
                    SCHOOL FEES
                ================================================== */}

                <section className="dashboard-panel parent-fees-panel">

                    <div className="parent-fees-header">

                        <div className="section-heading-icon finance-icon">
                            <FiDollarSign />
                        </div>

                        <div>

                            <span className="section-label">
                                FINANCE
                            </span>

                            <h2>
                                School Fees
                            </h2>

                            <p>
                                View each child's fee
                                balance and make
                                payments securely.
                            </p>

                        </div>

                    </div>

                    {/* FEE LIST */}

                    <div className="parent-fees-list">

                        {children.length === 0 ? (

                            <div className="empty-state">

                                <FiUsers />

                                <p>
                                    No children found.
                                </p>

                            </div>

                        ) : (

                            children.map((child) => {

                                const fee =
                                    getChildFee(child);

                                const studentId =
                                    getStudentId(child);

                                const isSelected =
                                    String(
                                        studentId
                                    ) ===
                                    String(
                                        selectedChildId
                                    );

                                const balance =
                                    Number(
                                        fee?.balance || 0
                                    );

                                return (

                                    <div
                                        className={
                                            `parent-fee-card ${
                                                isSelected
                                                    ? "selected-fee-child"
                                                    : ""
                                            }`
                                        }
                                        key={studentId}
                                    >

                                        {/* CHILD */}

                                        <div className="parent-fee-info">

                                            <div className="fee-child-avatar">
                                                <FiUser />
                                            </div>

                                            <div className="fee-child-details">

                                                <h3>
                                                    {
                                                        child.student_name
                                                    }
                                                </h3>

                                                <span>

                                                    <strong>
                                                        Admission:
                                                    </strong>{" "}

                                                    {
                                                        child.admission_number
                                                    }

                                                </span>

                                                <span>

                                                    <strong>
                                                        Class:
                                                    </strong>{" "}

                                                    {
                                                        child.class_name
                                                    }

                                                </span>

                                            </div>

                                        </div>

                                        {/* BALANCE */}

                                        <div className="parent-fee-balance">

                                            <span>
                                                Outstanding Balance
                                            </span>

                                            <strong>
                                                KES{" "}
                                                {
                                                    balance.toLocaleString()
                                                }
                                            </strong>

                                        </div>

                                        {/* ACTION */}

                                        <div className="parent-fee-action">

                                            {fee &&
                                            balance > 0 ? (

                                                <button
                                                    type="button"
                                                    className="pay-fees-btn"
                                                    onClick={() =>
                                                        handlePayFees(
                                                            fee
                                                        )
                                                    }
                                                >

                                                    <FiCreditCard />

                                                    <span>
                                                        Pay Fees
                                                    </span>

                                                </button>

                                            ) : fee ? (

                                                <span className="fee-paid-label">

                                                    <FiCheck />

                                                    <span>
                                                        Fully Paid
                                                    </span>

                                                </span>

                                            ) : (

                                                <span className="no-fee-label">

                                                    <FiDollarSign />

                                                    <span>
                                                        No fee record
                                                    </span>

                                                </span>

                                            )}

                                        </div>

                                    </div>

                                );

                            })

                        )}

                    </div>

                    {/* ==================================================
                        PAYMENT FORM
                    ================================================== */}

                    {selectedFee && (

                        <div
                            id="payment-form"
                            className="payment-form-container"
                        >

                            <div className="payment-form-header">

                                <div>

                                    <span className="section-label">
                                        M-PESA PAYMENT
                                    </span>

                                    <h2>
                                        Pay School Fees
                                    </h2>

                                    <p>

                                        {
                                            selectedFee.student?.first_name ||
                                            selectedFee.student_name ||
                                            ""
                                        }{" "}

                                        {
                                            selectedFee.student?.last_name ||
                                            ""
                                        }

                                    </p>

                                </div>

                                <button
                                    type="button"
                                    className="close-payment-btn"
                                    onClick={
                                        closePaymentForm
                                    }
                                    aria-label="Close payment form"
                                >
                                    <FiX />
                                </button>

                            </div>

                            {/* BALANCE */}

                            <div className="payment-balance">

                                <div className="payment-balance-icon">
                                    <FiDollarSign />
                                </div>

                                <div>

                                    <span>
                                        Outstanding Balance
                                    </span>

                                    <strong>

                                        KES{" "}

                                        {
                                            Number(
                                                selectedFee.balance ||
                                                0
                                            ).toLocaleString()
                                        }

                                    </strong>

                                </div>

                            </div>

                            {/* PAYMENT FORM */}

                            <form
                                onSubmit={
                                    handlePayment
                                }
                                className="parent-payment-form"
                            >

                                <div className="form-group">

                                    <label>
                                        Amount to Pay
                                    </label>

                                    <div className="input-with-icon">

                                        <FiDollarSign />

                                        <input
                                            type="number"
                                            min="1"
                                            max={
                                                selectedFee.balance
                                            }
                                            value={amount}
                                            onChange={(event) =>
                                                setAmount(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="Enter amount"
                                            required
                                        />

                                    </div>

                                    <small>
                                        Maximum: KES{" "}
                                        {
                                            Number(
                                                selectedFee.balance ||
                                                0
                                            ).toLocaleString()
                                        }
                                    </small>

                                </div>

                                <div className="form-group">

                                    <label>
                                        M-Pesa Phone Number
                                    </label>

                                    <div className="input-with-icon">

                                        <FiSmartphone />

                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(event) =>
                                                setPhone(
                                                    event.target.value
                                                )
                                            }
                                            placeholder="2547XXXXXXXX"
                                            required
                                        />

                                    </div>

                                    <small>
                                        Example:
                                        254712345678
                                    </small>

                                </div>

                                {paymentMessage && (

                                    <div
                                        className={
                                            `payment-message ${
                                                paymentMessage
                                                    .toLowerCase()
                                                    .includes(
                                                        "unable"
                                                    )
                                                    ? "error"
                                                    : "success"
                                            }`
                                        }
                                    >
                                        {paymentMessage}
                                    </div>

                                )}

                                <button
                                    type="submit"
                                    className="mpesa-pay-btn"
                                    disabled={
                                        paymentLoading
                                    }
                                >

                                    <FiSmartphone />

                                    <span>

                                        {paymentLoading
                                            ? "Sending M-Pesa Request..."
                                            : "Pay with M-Pesa"}

                                    </span>

                                </button>

                            </form>

                        </div>

                    )}

                </section>

            </div>

        </DashboardLayout>
    );
};

export default ParentDashboard;



// import { useEffect, useMemo, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

// import StatCard from "../../components/StatCard/StatCard";

// import DataTable from "../../components/DataTable/DataTable";

// import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";

// import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

// import {
//     getChildren,
//     getChildAttendance,
//     getChildResults,
//     getTermPerformance,
// } from "../../api/parentAPI";

// import {
//     getFees,
//     initiateMpesaPayment,
// } from "../../api/financeAPI";

// import {
//     FiUsers,
//     FiDollarSign,
//     FiCalendar,
//     FiBarChart2,
//     FiBookOpen,
//     FiCreditCard,
//     FiCheck,
//     FiX,
//     FiSmartphone,
//     FiUser,
//     FiHome,
//     FiTrendingUp,
//     FiAward,
//     FiClock,
// } from "react-icons/fi";

// import "./ParentDashboard.css";

// // ============================================================
// // HELPER
// // ============================================================

// const getStudentId = (child) => {
//     if (!child) {
//         return null;
//     }

//     return (
//         child.student_id ??
//         child.student?.id ??
//         child.id
//     );
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// const ParentDashboard = () => {
//     // ============================================================
//     // CHILDREN / FEES
//     // ============================================================

//     const [children, setChildren] = useState([]);
//     const [fees, setFees] = useState([]);

//     // ============================================================
//     // ACADEMIC DATA
//     // ============================================================

//     const [childAttendance, setChildAttendance] = useState({});
//     const [childResults, setChildResults] = useState({});

//     const [loadingChildren, setLoadingChildren] = useState(true);
//     const [loadingAcademicData, setLoadingAcademicData] =
//         useState(false);

//     // ============================================================
//     // TERM PERFORMANCE
//     // ============================================================

//     const [termPerformance, setTermPerformance] = useState(null);
//     const [loadingTermPerformance, setLoadingTermPerformance] =
//         useState(false);

//     const [selectedTerm, setSelectedTerm] = useState("Term 1");

//     const [selectedSession, setSelectedSession] = useState(
//         new Date().getFullYear()
//     );

//     // ============================================================
//     // SELECTED CHILD
//     // ============================================================

//     const [selectedChildId, setSelectedChildId] =
//         useState(null);

//     // ============================================================
//     // PAYMENT
//     // ============================================================

//     const [selectedFee, setSelectedFee] = useState(null);
//     const [amount, setAmount] = useState("");
//     const [phone, setPhone] = useState("");
//     const [paymentMessage, setPaymentMessage] = useState("");
//     const [paymentLoading, setPaymentLoading] = useState(false);

//     // ============================================================
//     // LOAD CHILDREN + FEES
//     // ============================================================

//     useEffect(() => {
//         const loadData = async () => {
//             setLoadingChildren(true);

//             try {
//                 const [
//                     childrenData,
//                     feesData,
//                 ] = await Promise.all([
//                     getChildren(),
//                     getFees(),
//                 ]);

//                 const loadedChildren =
//                     Array.isArray(childrenData)
//                         ? childrenData
//                         : Array.isArray(childrenData?.results)
//                             ? childrenData.results
//                             : [];

//                 const loadedFees =
//                     Array.isArray(feesData)
//                         ? feesData
//                         : Array.isArray(feesData?.results)
//                             ? feesData.results
//                             : [];

//                 console.log(
//                     "PARENT CHILDREN:",
//                     loadedChildren
//                 );

//                 console.log(
//                     "PARENT FEES:",
//                     loadedFees
//                 );

//                 setChildren(loadedChildren);
//                 setFees(loadedFees);

//                 // Automatically select first child
//                 if (loadedChildren.length > 0) {
//                     const firstStudentId =
//                         getStudentId(
//                             loadedChildren[0]
//                         );

//                     setSelectedChildId(
//                         String(firstStudentId)
//                     );
//                 } else {
//                     setSelectedChildId(null);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Failed to load parent dashboard:",
//                     error
//                 );

//                 setChildren([]);
//                 setFees([]);
//                 setSelectedChildId(null);
//             } finally {
//                 setLoadingChildren(false);
//             }
//         };

//         loadData();
//     }, []);

//     // ============================================================
//     // LOAD ATTENDANCE + RESULTS
//     // ============================================================

//     useEffect(() => {
//         if (!children.length) {
//             setChildAttendance({});
//             setChildResults({});
//             setLoadingAcademicData(false);
//             return;
//         }

//         const loadAcademicData = async () => {
//             setLoadingAcademicData(true);

//             try {
//                 const attendanceMap = {};
//                 const resultsMap = {};

//                 await Promise.all(
//                     children.map(async (child) => {
//                         const studentId =
//                             getStudentId(child);

//                         if (!studentId) {
//                             return;
//                         }

//                         const studentKey =
//                             String(studentId);

//                         try {
//                             const [
//                                 attendanceResponse,
//                                 resultsResponse,
//                             ] = await Promise.all([
//                                 getChildAttendance(
//                                     studentId
//                                 ),
//                                 getChildResults(
//                                     studentId
//                                 ),
//                             ]);

//                             // ------------------------------------------------
//                             // NORMALIZE ATTENDANCE RESPONSE
//                             // ------------------------------------------------

//                             const attendance =
//                                 Array.isArray(
//                                     attendanceResponse
//                                 )
//                                     ? attendanceResponse
//                                     : Array.isArray(
//                                         attendanceResponse?.results
//                                     )
//                                         ? attendanceResponse.results
//                                         : [];

//                             // ------------------------------------------------
//                             // NORMALIZE RESULTS RESPONSE
//                             // ------------------------------------------------

//                             const results =
//                                 Array.isArray(
//                                     resultsResponse
//                                 )
//                                     ? resultsResponse
//                                     : Array.isArray(
//                                         resultsResponse?.results
//                                     )
//                                         ? resultsResponse.results
//                                         : [];

//                             // ------------------------------------------------
//                             // FILTER BY ACTUAL STUDENT ID
//                             // ------------------------------------------------

//                             const filteredAttendance =
//                                 attendance.filter(
//                                     (record) =>
//                                         String(
//                                             record.student
//                                         ) === studentKey
//                                 );

//                             const filteredResults =
//                                 results.filter(
//                                     (record) =>
//                                         String(
//                                             record.student
//                                         ) === studentKey
//                                 );

//                             // ------------------------------------------------
//                             // STORE DATA USING STUDENT ID
//                             // ------------------------------------------------

//                             attendanceMap[
//                                 studentKey
//                             ] = filteredAttendance;

//                             resultsMap[
//                                 studentKey
//                             ] = filteredResults;

//                             console.log(
//                                 `Attendance for ${child.student_name}:`,
//                                 filteredAttendance
//                             );

//                             console.log(
//                                 `Results for ${child.student_name}:`,
//                                 filteredResults
//                             );
//                         } catch (error) {
//                             console.error(
//                                 `Failed to load academic data for ${child.student_name}:`,
//                                 error
//                             );

//                             attendanceMap[
//                                 studentKey
//                             ] = [];

//                             resultsMap[
//                                 studentKey
//                             ] = [];
//                         }
//                     })
//                 );

//                 setChildAttendance(
//                     attendanceMap
//                 );

//                 setChildResults(
//                     resultsMap
//                 );
//             } catch (error) {
//                 console.error(
//                     "Failed to load academic data:",
//                     error
//                 );

//                 setChildAttendance({});
//                 setChildResults({});
//             } finally {
//                 setLoadingAcademicData(false);
//             }
//         };

//         loadAcademicData();
//     }, [children]);

//     // ============================================================
//     // CURRENT CHILD
//     // ============================================================

//     const currentChild = useMemo(() => {
//         if (!children.length) {
//             return null;
//         }

//         const selected =
//             children.find(
//                 (child) =>
//                     String(
//                         getStudentId(child)
//                     ) ===
//                     String(selectedChildId)
//             );

//         return selected || children[0];
//     }, [
//         children,
//         selectedChildId,
//     ]);

//     // ============================================================
//     // CURRENT CHILD ID
//     // ============================================================

//     const currentChildId = currentChild
//         ? String(
//             getStudentId(currentChild)
//         )
//         : null;

//     // ============================================================
//     // LOAD TERM PERFORMANCE
//     // ============================================================

//     useEffect(() => {
//         if (!currentChildId) {
//             setTermPerformance(null);
//             return;
//         }

//         const loadTermPerformance = async () => {
//             setLoadingTermPerformance(true);

//             try {
//                 console.log(
//                     "Loading term performance:",
//                     {
//                         student: currentChildId,
//                         term: selectedTerm,
//                         session: selectedSession,
//                     }
//                 );

//                 const response =
//                     await getTermPerformance(
//                         currentChildId,
//                         selectedTerm,
//                         selectedSession
//                     );

//                 console.log(
//                     "TERM PERFORMANCE:",
//                     response
//                 );

//                 setTermPerformance(response);
//             } catch (error) {
//                 console.error(
//                     "Failed to load term performance:",
//                     error
//                 );

//                 setTermPerformance(null);
//             } finally {
//                 setLoadingTermPerformance(false);
//             }
//         };

//         loadTermPerformance();
//     }, [
//         currentChildId,
//         selectedTerm,
//         selectedSession,
//     ]);

//     // ============================================================
//     // ATTENDANCE DATA
//     // ============================================================

//     const attendanceData = useMemo(() => {
//         if (!currentChildId) {
//             return [];
//         }

//         return (
//             childAttendance[currentChildId] ||
//             []
//         );
//     }, [
//         currentChildId,
//         childAttendance,
//     ]);

//     // ============================================================
//     // RESULTS DATA
//     // ============================================================

//     const resultsData = useMemo(() => {
//         if (!currentChildId) {
//             return [];
//         }

//         return (
//             childResults[currentChildId] ||
//             []
//         );
//     }, [
//         currentChildId,
//         childResults,
//     ]);

//     // ============================================================
//     // ATTENDANCE RATE
//     // ============================================================

//     const attendanceRate = useMemo(() => {
//         if (!attendanceData.length) {
//             return "--";
//         }

//         let present = 0;
//         let total = 0;

//         attendanceData.forEach((record) => {
//             const status = String(
//                 record.status ||
//                 record.attendance_status ||
//                 ""
//             ).toLowerCase();

//             const isPresent =
//                 status === "present" ||
//                 record.is_present === true ||
//                 record.present === true;

//             const isAbsent =
//                 status === "absent" ||
//                 record.is_absent === true ||
//                 record.absent === true;

//             const isExcused =
//                 status === "excused" ||
//                 record.is_excused === true ||
//                 record.excused === true;

//             if (
//                 isPresent ||
//                 isAbsent ||
//                 isExcused
//             ) {
//                 total += 1;

//                 if (isPresent) {
//                     present += 1;
//                 }
//             }
//         });

//         if (total === 0) {
//             return "--";
//         }

//         return `${Math.round(
//             (present / total) * 100
//         )}%`;
//     }, [attendanceData]);

//     // ============================================================
//     // PERFORMANCE DATA
//     // ============================================================

//     const performanceData = useMemo(() => {
//         if (!resultsData.length) {
//             return [];
//         }

//         const subjectGroups = {};

//         resultsData.forEach((result) => {
//             const subject =
//                 result.subject?.name ||
//                 result.subject_name ||
//                 result.subject?.title ||
//                 (
//                     typeof result.subject === "string"
//                         ? result.subject
//                         : null
//                 ) ||
//                 "Unknown Subject";

//             let mark =
//                 result.marks ??
//                 result.mark ??
//                 result.score ??
//                 result.marks_obtained ??
//                 result.obtained_marks ??
//                 result.percentage ??
//                 result.score_percentage;

//             if (
//                 typeof mark === "object" &&
//                 mark !== null
//             ) {
//                 mark =
//                     mark.marks ??
//                     mark.mark ??
//                     mark.score ??
//                     mark.percentage;
//             }

//             mark = Number(mark);

//             if (Number.isNaN(mark)) {
//                 return;
//             }

//             if (!subjectGroups[subject]) {
//                 subjectGroups[subject] = [];
//             }

//             subjectGroups[subject].push(mark);
//         });

//         return Object.entries(
//             subjectGroups
//         ).map(
//             ([subject, marks]) => {
//                 const average =
//                     marks.reduce(
//                         (total, mark) =>
//                             total + mark,
//                         0
//                     ) / marks.length;

//                 return {
//                     subject,
//                     performance:
//                         Math.round(average),
//                 };
//             }
//         );
//     }, [resultsData]);

//     // ============================================================
//     // AVERAGE SCORE
//     // ============================================================

//     const averageScore = useMemo(() => {
//         if (!performanceData.length) {
//             return "--";
//         }

//         const total =
//             performanceData.reduce(
//                 (sum, item) =>
//                     sum +
//                     Number(
//                         item.performance || 0
//                     ),
//                 0
//             );

//         return `${Math.round(
//             total / performanceData.length
//         )}%`;
//     }, [performanceData]);

//     // ============================================================
//     // TERM PERFORMANCE DISPLAY
//     // ============================================================

//     const termAverage =
//         termPerformance?.average !== null &&
//         termPerformance?.average !== undefined
//             ? Number(
//                 termPerformance.average
//             )
//             : null;

//     const termHasPerformance =
//         termAverage !== null &&
//         !Number.isNaN(termAverage);

//     const termResults =
//         Array.isArray(
//             termPerformance?.results
//         )
//             ? termPerformance.results
//             : [];

//     const postedSubjects =
//         Number(
//             termPerformance?.posted_subjects || 0
//         );

//     const totalSubjects =
//         Number(
//             termPerformance?.total_subjects || 0
//         );

//     const remainingSubjects =
//         Number(
//             termPerformance?.remaining_subjects || 0
//         );

//     // ============================================================
//     // SELECTED CHILD FEE
//     // ============================================================

//     const currentChildFee = useMemo(() => {
//         if (!currentChildId) {
//             return null;
//         }

//         return (
//             fees.find((fee) => {
//                 const feeStudentId =
//                     fee.student?.id ??
//                     fee.student_id ??
//                     fee.student;

//                 return (
//                     String(feeStudentId) ===
//                     String(currentChildId)
//                 );
//             }) || null
//         );
//     }, [
//         fees,
//         currentChildId,
//     ]);

//     // ============================================================
//     // SELECTED CHILD BALANCE
//     // ============================================================

//     const currentChildBalance = useMemo(() => {
//         if (!currentChildFee) {
//             return 0;
//         }

//         return Number(
//             currentChildFee.balance || 0
//         );
//     }, [currentChildFee]);

//     // ============================================================
//     // GET CHILD FEE
//     // ============================================================

//     const getChildFee = (child) => {
//         const studentId =
//             getStudentId(child);

//         return (
//             fees.find((fee) => {
//                 const feeStudentId =
//                     fee.student?.id ??
//                     fee.student_id ??
//                     fee.student;

//                 return (
//                     String(feeStudentId) ===
//                     String(studentId)
//                 );
//             }) || null
//         );
//     };

//     // ============================================================
//     // SELECT CHILD
//     // ============================================================

//     const handleSelectChild = (child) => {
//         const studentId =
//             getStudentId(child);

//         setSelectedChildId(
//             String(studentId)
//         );

//         setTermPerformance(null);

//         setSelectedFee(null);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");
//     };

//     // ============================================================
//     // OPEN PAYMENT FORM
//     // ============================================================

//     const handlePayFees = (fee) => {
//         setSelectedFee(fee);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");

//         setTimeout(() => {
//             const element =
//                 document.getElementById(
//                     "payment-form"
//                 );

//             if (element) {
//                 element.scrollIntoView({
//                     behavior: "smooth",
//                     block: "center",
//                 });
//             }
//         }, 100);
//     };

//     // ============================================================
//     // CLOSE PAYMENT FORM
//     // ============================================================

//     const closePaymentForm = () => {
//         setSelectedFee(null);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");
//     };

//     // ============================================================
//     // M-PESA PAYMENT
//     // ============================================================

//     const handlePayment = async (event) => {
//         event.preventDefault();

//         if (!selectedFee) {
//             setPaymentMessage(
//                 "Please select a fee record."
//             );
//             return;
//         }

//         const paymentAmount =
//             Number(amount);

//         const balance =
//             Number(
//                 selectedFee.balance || 0
//             );

//         if (paymentAmount <= 0) {
//             setPaymentMessage(
//                 "Please enter a valid payment amount."
//             );
//             return;
//         }

//         if (paymentAmount > balance) {
//             setPaymentMessage(
//                 "Payment amount cannot exceed the outstanding balance."
//             );
//             return;
//         }

//         if (!phone) {
//             setPaymentMessage(
//                 "Please enter your M-Pesa phone number."
//             );
//             return;
//         }

//         try {
//             setPaymentLoading(true);
//             setPaymentMessage("");

//             const studentId =
//                 selectedFee.student?.id ??
//                 selectedFee.student_id ??
//                 selectedFee.student;

//             const response =
//                 await initiateMpesaPayment({
//                     student_id:
//                         studentId,
//                     fee_id:
//                         selectedFee.id,
//                     amount:
//                         paymentAmount,
//                     phone_number:
//                         phone,
//                 });

//             setPaymentMessage(
//                 response.message ||
//                 "Payment request sent. Check your phone for the M-Pesa prompt."
//             );

//             setAmount("");
//         } catch (error) {
//             console.error(
//                 "M-Pesa payment error:",
//                 error
//             );

//             const errorMessage =
//                 error.response?.data?.error ||
//                 error.response?.data?.detail ||
//                 "Unable to initiate M-Pesa payment.";

//             setPaymentMessage(
//                 errorMessage
//             );
//         } finally {
//             setPaymentLoading(false);
//         }
//     };

//     // ============================================================
//     // TABLE COLUMNS
//     // ============================================================

//     const columns = [
//         {
//             key: "admission_number",
//             label: "Admission No.",
//         },
//         {
//             key: "student_name",
//             label: "Child",
//         },
//         {
//             key: "class_name",
//             label: "Class",
//         },
//     ];

//     // ============================================================
//     // RENDER
//     // ============================================================

//     return (
//         <DashboardLayout>
//             <div className="parent-dashboard">

//                 {/* ==================================================
//                     HEADER
//                 ================================================== */}

//                 <div className="dashboard-header">
//                     <div className="dashboard-header-icon">
//                         <FiHome />
//                     </div>

//                     <div>
//                         <h1>
//                             Parent Dashboard
//                         </h1>

//                         <p>
//                             Monitor your children's
//                             progress, attendance,
//                             academic performance
//                             and school fees.
//                         </p>
//                     </div>
//                 </div>

//                 {/* ==================================================
//                     CHILD SELECTOR
//                 ================================================== */}

//                 {children.length > 0 && (
//                     <section className="dashboard-panel child-selector-panel">

//                         <div className="selector-heading">
//                             <div className="section-heading-icon family icon">
//                                 <FiUsers />
//                             </div>

//                             <div>
//                                 <span className="section-label">
//                                     FAMILY
//                                 </span>

//                                 <h2>
//                                     my Children
//                                 </h2>

//                                 <p>
//                                     Children linked to your parent account. 
//                                 </p>
//                             </div>
//                         </div>
//                         <DataTable
//                         columns={columns}
//                         data={children}
//                         />


//                         <div className="child-selection-grid">

//                             {children.map((child) => {
//                                 const studentId =
//                                     getStudentId(child);

//                                 const isSelected =
//                                     String(
//                                         studentId
//                                     ) ===
//                                     String(
//                                         selectedChildId
//                                     );

//                                 return (
//                                     <button
//                                         type="button"
//                                         key={studentId}
//                                         className={
//                                             `child-selection-card ${
//                                                 isSelected
//                                                     ? "active"
//                                                     : ""
//                                             }`
//                                         }
//                                         onClick={() =>
//                                             handleSelectChild(
//                                                 child
//                                             )
//                                         }
//                                     >
//                                         <div className="child-avatar">
//                                             <FiUser />
//                                         </div>

//                                         <div className="child-selection-details">
//                                             <strong>
//                                                 {
//                                                     child.student_name
//                                                 }
//                                             </strong>

//                                             <span>
//                                                 {
//                                                     child.admission_number
//                                                 }
//                                             </span>

//                                             <span>
//                                                 {
//                                                     child.class_name ||
//                                                     "Class not available"
//                                                 }
//                                             </span>
//                                         </div>

//                                         {isSelected && (
//                                             <div className="child-selected-check">
//                                                 <FiCheck />
//                                             </div>
//                                         )}
//                                     </button>
//                                 );
//                             })}

//                         </div>

//                         {currentChild && (
//                             <div className="selected-child-info">
//                                 <span className="selected-child-label">
//                                     Currently viewing
//                                 </span>

//                                 <div className="selected-child-name">
//                                     <FiUser />

//                                     <strong>
//                                         {
//                                             currentChild.student_name
//                                         }
//                                     </strong>

//                                     <span>
//                                         •
//                                     </span>

//                                     <span>
//                                         {
//                                             currentChild.class_name
//                                         }
//                                     </span>
//                                 </div>
//                             </div>
//                         )}

//                     </section>
//                 )}

//                 {/* ==================================================
//                     STATS
//                 ================================================== */}

//                 <div className="stats-grid">

//                     <StatCard
//                         title="Children"
//                         value={
//                             loadingChildren
//                                 ? "..."
//                                 : children.length
//                         }
//                         icon={<FiUsers />}
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Fee Balance`
//                                 : "Fee Balance"
//                         }
//                         value={
//                             `KES ${currentChildBalance.toLocaleString()}`
//                         }
//                         icon={<FiDollarSign />}
//                         type="warning"
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Attendance`
//                                 : "Attendance"
//                         }
//                         value={
//                             loadingAcademicData
//                                 ? "..."
//                                 : attendanceRate
//                         }
//                         icon={<FiCalendar />}
//                         type="success"
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Average`
//                                 : "Average Score"
//                         }
//                         value={
//                             loadingAcademicData
//                                 ? "..."
//                                 : averageScore
//                         }
//                         icon={<FiTrendingUp />}
//                         type="danger"
//                     />

//                 </div>

//                 {/* ==================================================
//                     ACADEMIC SECTION
//                 ================================================== */}

//                 {currentChild && (
//                     <section className="academic-section">

//                         <div className="section-heading">

//                             <div className="section-heading-icon academic-icon">
//                                 <FiBookOpen />
//                             </div>

//                             <div>
//                                 <span className="section-label">
//                                     ACADEMICS
//                                 </span>

//                                 <h2>
//                                     {currentChild.student_name}'s
//                                     Academic Overview
//                                 </h2>

//                                 <p>
//                                     Attendance and performance
//                                     information for{" "}
//                                     {
//                                         currentChild.student_name
//                                     }.
//                                 </p>
//                             </div>

//                         </div>

//                         {/* ==================================================
//                             TERM PERFORMANCE
//                         ================================================== */}

//                         <div className="term-performance-card">

//                             <div className="term-performance-header">

//                                 <div className="term-performance-title">
//                                     <div className="term-performance-icon">
//                                         <FiAward />
//                                     </div>

//                                     <div>
//                                         <span className="section-label">
//                                             TERM RESULTS
//                                         </span>

//                                         <h2>
//                                             Term Performance
//                                         </h2>

//                                         <p>
//                                             Current academic
//                                             performance for{" "}
//                                             <strong>
//                                                 {
//                                                     currentChild.student_name
//                                                 }
//                                             </strong>
//                                         </p>
//                                     </div>
//                                 </div>

//                                 <div className="term-performance-filters">

//                                     <select
//                                         value={selectedTerm}
//                                         onChange={(event) =>
//                                             setSelectedTerm(
//                                                 event.target.value
//                                             )
//                                         }
//                                     >
//                                         <option value="Term 1">
//                                             Term 1
//                                         </option>

//                                         <option value="Term 2">
//                                             Term 2
//                                         </option>

//                                         <option value="Term 3">
//                                             Term 3
//                                         </option>
//                                     </select>

//                                     <select
//                                         value={selectedSession}
//                                         onChange={(event) =>
//                                             setSelectedSession(
//                                                 Number(
//                                                     event.target.value
//                                                 )
//                                             )
//                                         }
//                                     >
//                                         <option
//                                             value={
//                                                 new Date().getFullYear()
//                                             }
//                                         >
//                                             {
//                                                 new Date().getFullYear()
//                                             }
//                                         </option>

//                                         <option
//                                             value={
//                                                 new Date().getFullYear() - 1
//                                             }
//                                         >
//                                             {
//                                                 new Date().getFullYear() - 1
//                                             }
//                                         </option>
//                                     </select>

//                                 </div>

//                             </div>

//                             {loadingTermPerformance ? (

//                                 <div className="term-performance-loading">
//                                     <FiBarChart2 />

//                                     <span>
//                                         Loading term performance...
//                                     </span>
//                                 </div>

//                             ) : termHasPerformance ? (

//                                 <>

//                                     {/* ==================================================
//                                         PERFORMANCE SUMMARY
//                                     ================================================== */}

//                                     <div className="term-performance-summary">

//                                         <div className="performance-summary-box average-box">
//                                             <div className="summary-box-icon">
//                                                 <FiTrendingUp />
//                                             </div>

//                                             <div>
//                                                 <span>
//                                                     Average Score
//                                                 </span>

//                                                 <strong>
//                                                     {termAverage.toFixed(1)}%
//                                                 </strong>
//                                             </div>
//                                         </div>

//                                         <div className="performance-summary-box grade-box">
//                                             <div className="summary-box-icon">
//                                                 <FiAward />
//                                             </div>

//                                             <div>
//                                                 <span>
//                                                     Overall Grade
//                                                 </span>

//                                                 <strong>
//                                                     {
//                                                         termPerformance.overall_grade ||
//                                                         "—"
//                                                     }
//                                                 </strong>
//                                             </div>
//                                         </div>

//                                         <div className="performance-summary-box subjects-box">
//                                             <div className="summary-box-icon">
//                                                 <FiBookOpen />
//                                             </div>

//                                             <div>
//                                                 <span>
//                                                     Subjects Recorded
//                                                 </span>

//                                                 <strong>
//                                                     {postedSubjects}
//                                                     {totalSubjects > 0
//                                                         ? ` / ${totalSubjects}`
//                                                         : ""}
//                                                 </strong>
//                                             </div>
//                                         </div>

//                                         <div className="performance-summary-box remaining-box">
//                                             <div className="summary-box-icon">
//                                                 <FiClock />
//                                             </div>

//                                             <div>
//                                                 <span>
//                                                     Remaining
//                                                 </span>

//                                                 <strong>
//                                                     {remainingSubjects}
//                                                 </strong>
//                                             </div>
//                                         </div>

//                                     </div>

//                                     {/* ==================================================
//                                         SUBJECT RESULTS
//                                     ================================================== */}

//                                     <div className="term-results-section">

//                                         <div className="term-results-heading">
//                                             <div>
//                                                 <h3>
//                                                     Subject Results
//                                                 </h3>

//                                                 <p>
//                                                     Results currently
//                                                     recorded for{" "}
//                                                     {selectedTerm},{" "}
//                                                     {selectedSession}.
//                                                 </p>
//                                             </div>
//                                         </div>

//                                         {termResults.length > 0 ? (

//                                             <div className="term-results-table-wrapper">

//                                                 <table className="term-results-table">

//                                                     <thead>
//                                                         <tr>
//                                                             <th>
//                                                                 Subject
//                                                             </th>

//                                                             <th>
//                                                                 Marks
//                                                             </th>

//                                                             <th>
//                                                                 Grade
//                                                             </th>
//                                                         </tr>
//                                                     </thead>

//                                                     <tbody>

//                                                         {termResults.map(
//                                                             (
//                                                                 result,
//                                                                 index
//                                                             ) => (
//                                                                 <tr
//                                                                     key={
//                                                                         result.id ||
//                                                                         `${result.subject_name}-${index}`
//                                                                     }
//                                                                 >
//                                                                     <td>
//                                                                         <div className="subject-name-cell">
//                                                                             <span className="subject-table-icon">
//                                                                                 <FiBookOpen />
//                                                                             </span>

//                                                                             <strong>
//                                                                                 {
//                                                                                     result.subject_name ||
//                                                                                     result.subject?.name ||
//                                                                                     result.subject?.title ||
//                                                                                     "Unknown Subject"
//                                                                                 }
//                                                                             </strong>
//                                                                         </div>
//                                                                     </td>

//                                                                     <td>
//                                                                         <strong className="marks-value">
//                                                                             {
//                                                                                 result.marks ??
//                                                                                 result.mark ??
//                                                                                 result.score ??
//                                                                                 "—"
//                                                                             }
//                                                                         </strong>
//                                                                     </td>

//                                                                     <td>
//                                                                         <span className="result-grade-badge">
//                                                                             {
//                                                                                 result.grade ||
//                                                                                 "—"
//                                                                             }
//                                                                         </span>
//                                                                     </td>
//                                                                 </tr>
//                                                             )
//                                                         )}

//                                                     </tbody>

//                                                 </table>

//                                             </div>

//                                         ) : (

//                                             <div className="term-no-subject-results">
//                                                 <FiBookOpen />

//                                                 <span>
//                                                     No individual subject
//                                                     results are available
//                                                     yet.
//                                                 </span>
//                                             </div>

//                                         )}

//                                     </div>

//                                     {/* ==================================================
//                                         PARTIAL RESULTS NOTICE
//                                     ================================================== */}

//                                     {remainingSubjects > 0 && (
//                                         <div className="partial-results-notice">

//                                             <div className="partial-results-icon">
//                                                 <FiClock />
//                                             </div>

//                                             <div>
//                                                 <strong>
//                                                     Results are still being entered
//                                                 </strong>

//                                                 <p>
//                                                     {postedSubjects} subject
//                                                     {postedSubjects === 1
//                                                         ? ""
//                                                         : "s"}{" "}
//                                                     {postedSubjects === 1
//                                                         ? "has"
//                                                         : "have"}{" "}
//                                                     been recorded so far.
//                                                     The current average is
//                                                     calculated using the
//                                                     available results.
//                                                 </p>
//                                             </div>

//                                         </div>
//                                     )}

//                                 </>

//                             ) : (

//                                 <div className="no-term-performance">

//                                     <div className="no-performance-icon">
//                                         <FiBarChart2 />
//                                     </div>

//                                     <h3>
//                                         No results recorded yet
//                                     </h3>

//                                     <p>
//                                         No results have been
//                                         recorded for{" "}
//                                         {
//                                             currentChild.student_name
//                                         }{" "}
//                                         for{" "}
//                                         {selectedTerm},{" "}
//                                         {selectedSession}.
//                                     </p>

//                                 </div>

//                             )}

//                         </div>

//                         {/* ==================================================
//                             CHARTS
//                         ================================================== */}

//                         <div className="charts-grid">

//                             {/* ATTENDANCE */}

//                             <div className="chart-panel">

//                                 <div className="chart-panel-header">

//                                     <div>
//                                         <h3>
//                                             Attendance Trends
//                                         </h3>

//                                         <p>
//                                             Daily attendance
//                                             percentage
//                                         </p>
//                                     </div>

//                                     <span className="chart-icon attendance-chart-icon">
//                                         <FiCalendar />
//                                     </span>

//                                 </div>

//                                 {loadingAcademicData ? (

//                                     <div className="chart-loading">
//                                         Loading attendance...
//                                     </div>

//                                 ) : attendanceData.length === 0 ? (

//                                     <div className="chart-empty">

//                                         <FiCalendar />

//                                         <span>
//                                             No attendance records
//                                             available for{" "}
//                                             {
//                                                 currentChild.student_name
//                                             }.
//                                         </span>

//                                     </div>

//                                 ) : (

//                                     <AttendanceChart
//                                         key={
//                                             `attendance-${currentChildId}`
//                                         }
//                                         data={
//                                             attendanceData
//                                         }
//                                         childName={
//                                             currentChild.student_name ||
//                                             ""
//                                         }
//                                     />

//                                 )}

//                             </div>

//                             {/* PERFORMANCE */}

//                             <div className="chart-panel">

//                                 <div className="chart-panel-header">

//                                     <div>
//                                         <h3>
//                                             Academic Performance
//                                         </h3>

//                                         <p>
//                                             Average marks by
//                                             subject
//                                         </p>
//                                     </div>

//                                     <span className="chart-icon performance-chart-icon">
//                                         <FiBarChart2 />
//                                     </span>

//                                 </div>

//                                 {loadingAcademicData ? (

//                                     <div className="chart-loading">
//                                         Loading performance...
//                                     </div>

//                                 ) : performanceData.length === 0 ? (

//                                     <div className="chart-empty">

//                                         <FiBarChart2 />

//                                         <span>
//                                             No academic results
//                                             available for{" "}
//                                             {
//                                                 currentChild.student_name
//                                             }.
//                                         </span>

//                                     </div>

//                                 ) : (

//                                     <PerformanceChart
//                                         key={
//                                             `performance-${currentChildId}`
//                                         }
//                                         data={
//                                             performanceData
//                                         }
//                                         childName={
//                                             currentChild.student_name ||
//                                             ""
//                                         }
//                                     />

//                                 )}

//                             </div>

//                         </div>

//                     </section>
//                 )}

//                 {/* ==================================================
//                     MY CHILDREN
//                 ================================================== */}

//                 <section className="dashboard-panel">

//                     <div className="section-heading">

//                         <div className="section-heading-icon family-icon">
//                             <FiUsers />
//                         </div>

//                         <div>
//                             <span className="section-label">
//                                 FAMILY
//                             </span>

//                             <h2>
//                                 My Children
//                             </h2>

//                             <p>
//                                 Children linked to your
//                                 parent account.
//                             </p>
//                         </div>

//                     </div>

//                     <DataTable
//                         columns={columns}
//                         data={children}
//                     />

//                 </section>

//                 {/* ==================================================
//                     SCHOOL FEES
//                 ================================================== */}

//                 <section className="dashboard-panel parent-fees-panel">

//                     <div className="parent-fees-header">

//                         <div className="section-heading-icon finance-icon">
//                             <FiDollarSign />
//                         </div>

//                         <div>
//                             <span className="section-label">
//                                 FINANCE
//                             </span>

//                             <h2>
//                                 School Fees
//                             </h2>

//                             <p>
//                                 View each child's fee
//                                 balance and make
//                                 payments securely.
//                             </p>
//                         </div>

//                     </div>

//                     {/* FEE LIST */}

//                     <div className="parent-fees-list">

//                         {children.length === 0 ? (

//                             <div className="empty-state">

//                                 <FiUsers />

//                                 <p>
//                                     No children found.
//                                 </p>

//                             </div>

//                         ) : (

//                             children.map((child) => {

//                                 const fee =
//                                     getChildFee(child);

//                                 const studentId =
//                                     getStudentId(child);

//                                 const isSelected =
//                                     String(
//                                         studentId
//                                     ) ===
//                                     String(
//                                         selectedChildId
//                                     );

//                                 const balance =
//                                     Number(
//                                         fee?.balance || 0
//                                     );

//                                 return (

//                                     <div
//                                         className={
//                                             `parent-fee-card ${
//                                                 isSelected
//                                                     ? "selected-fee-child"
//                                                     : ""
//                                             }`
//                                         }
//                                         key={studentId}
//                                     >

//                                         {/* CHILD */}

//                                         <div className="parent-fee-info">

//                                             <div className="fee-child-avatar">
//                                                 <FiUser />
//                                             </div>

//                                             <div className="fee-child-details">

//                                                 <h3>
//                                                     {
//                                                         child.student_name
//                                                     }
//                                                 </h3>

//                                                 <span>
//                                                     <strong>
//                                                         Admission:
//                                                     </strong>{" "}
//                                                     {
//                                                         child.admission_number
//                                                     }
//                                                 </span>

//                                                 <span>
//                                                     <strong>
//                                                         Class:
//                                                     </strong>{" "}
//                                                     {
//                                                         child.class_name
//                                                     }
//                                                 </span>

//                                             </div>

//                                         </div>

//                                         {/* BALANCE */}

//                                         <div className="parent-fee-balance">

//                                             <span>
//                                                 Outstanding Balance
//                                             </span>

//                                             <strong>
//                                                 KES{" "}
//                                                 {
//                                                     balance.toLocaleString()
//                                                 }
//                                             </strong>

//                                         </div>

//                                         {/* ACTION */}

//                                         <div className="parent-fee-action">

//                                             {fee &&
//                                             balance > 0 ? (

//                                                 <button
//                                                     type="button"
//                                                     className="pay-fees-btn"
//                                                     onClick={() =>
//                                                         handlePayFees(
//                                                             fee
//                                                         )
//                                                     }
//                                                 >
//                                                     <FiCreditCard />

//                                                     <span>
//                                                         Pay Fees
//                                                     </span>
//                                                 </button>

//                                             ) : fee ? (

//                                                 <span className="fee-paid-label">

//                                                     <FiCheck />

//                                                     <span>
//                                                         Fully Paid
//                                                     </span>

//                                                 </span>

//                                             ) : (

//                                                 <span className="no-fee-label">

//                                                     <FiDollarSign />

//                                                     <span>
//                                                         No fee record
//                                                     </span>

//                                                 </span>

//                                             )}

//                                         </div>

//                                     </div>

//                                 );
//                             })
//                         )}

//                     </div>

//                     {/* ==================================================
//                         PAYMENT FORM
//                     ================================================== */}

//                     {selectedFee && (

//                         <div
//                             id="payment-form"
//                             className="payment-form-container"
//                         >

//                             <div className="payment-form-header">

//                                 <div>

//                                     <span className="section-label">
//                                         M-PESA PAYMENT
//                                     </span>

//                                     <h2>
//                                         Pay School Fees
//                                     </h2>

//                                     <p>
//                                         {
//                                             selectedFee.student?.first_name ||
//                                             selectedFee.student_name ||
//                                             ""
//                                         }{" "}
//                                         {
//                                             selectedFee.student?.last_name ||
//                                             ""
//                                         }
//                                     </p>

//                                 </div>

//                                 <button
//                                     type="button"
//                                     className="close-payment-btn"
//                                     onClick={
//                                         closePaymentForm
//                                     }
//                                     aria-label="Close payment form"
//                                 >
//                                     <FiX />
//                                 </button>

//                             </div>

//                             {/* BALANCE */}

//                             <div className="payment-balance">

//                                 <div className="payment-balance-icon">
//                                     <FiDollarSign />
//                                 </div>

//                                 <div>

//                                     <span>
//                                         Outstanding Balance
//                                     </span>

//                                     <strong>
//                                         KES{" "}
//                                         {
//                                             Number(
//                                                 selectedFee.balance ||
//                                                 0
//                                             ).toLocaleString()
//                                         }
//                                     </strong>

//                                 </div>

//                             </div>

//                             {/* PAYMENT FORM */}

//                             <form
//                                 onSubmit={
//                                     handlePayment
//                                 }
//                                 className="parent-payment-form"
//                             >

//                                 <div className="form-group">

//                                     <label>
//                                         Amount to Pay
//                                     </label>

//                                     <div className="input-with-icon">

//                                         <FiDollarSign />

//                                         <input
//                                             type="number"
//                                             min="1"
//                                             max={
//                                                 selectedFee.balance
//                                             }
//                                             value={amount}
//                                             onChange={(event) =>
//                                                 setAmount(
//                                                     event.target.value
//                                                 )
//                                             }
//                                             placeholder="Enter amount"
//                                             required
//                                         />

//                                     </div>

//                                     <small>
//                                         Maximum: KES{" "}
//                                         {
//                                             Number(
//                                                 selectedFee.balance ||
//                                                 0
//                                             ).toLocaleString()
//                                         }
//                                     </small>

//                                 </div>

//                                 <div className="form-group">

//                                     <label>
//                                         M-Pesa Phone Number
//                                     </label>

//                                     <div className="input-with-icon">

//                                         <FiSmartphone />

//                                         <input
//                                             type="tel"
//                                             value={phone}
//                                             onChange={(event) =>
//                                                 setPhone(
//                                                     event.target.value
//                                                 )
//                                             }
//                                             placeholder="2547XXXXXXXX"
//                                             required
//                                         />

//                                     </div>

//                                     <small>
//                                         Example:
//                                         254712345678
//                                     </small>

//                                 </div>

//                                 {paymentMessage && (

//                                     <div
//                                         className={
//                                             `payment-message ${
//                                                 paymentMessage
//                                                     .toLowerCase()
//                                                     .includes(
//                                                         "unable"
//                                                     )
//                                                     ? "error"
//                                                     : "success"
//                                             }`
//                                         }
//                                     >
//                                         {paymentMessage}
//                                     </div>

//                                 )}

//                                 <button
//                                     type="submit"
//                                     className="mpesa-pay-btn"
//                                     disabled={
//                                         paymentLoading
//                                     }
//                                 >

//                                     <FiSmartphone />

//                                     <span>
//                                         {paymentLoading
//                                             ? "Sending M-Pesa Request..."
//                                             : "Pay with M-Pesa"}
//                                     </span>

//                                 </button>

//                             </form>

//                         </div>

//                     )}

//                 </section>

//             </div>
//         </DashboardLayout>
//     );
// };

// export default ParentDashboard;



// import { useEffect, useMemo, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import StatCard from "../../components/StatCard/StatCard";
// import DataTable from "../../components/DataTable/DataTable";
// import AttendanceChart from "../../components/charts/AttendanceChart/AttendanceChart.jsx";
// import PerformanceChart from "../../components/charts/PerformanceChart/PerformanceChart.jsx";

// import {
//     getChildren,
//     getChildAttendance,
//     getChildResults,
    
// } from "../../api/parentAPI";

// import {
//     getFees,
//     initiateMpesaPayment,
// } from "../../api/financeAPI";

// import {
//     FiUsers,
//     FiDollarSign,
//     FiCalendar,
//     FiBarChart2,
//     FiBookOpen,
//     FiCreditCard,
//     FiCheck,
//     FiX,
//     FiSmartphone,
//     FiUser,
//     FiHome,
//     FiTrendingUp,
// } from "react-icons/fi";

// import "./ParentDashboard.css";

// // ============================================================
// // HELPER
// // ============================================================

// const getStudentId = (child) => {
//     if (!child) {
//         return null;
//     }

//     return (
//         child.student_id ??
//         child.student?.id ??
//         child.id
//     );
// };

// // ============================================================
// // COMPONENT
// // ============================================================

// const ParentDashboard = () => {
//     // ============================================================
//     // CHILDREN / FEES
//     // ============================================================

//     const [children, setChildren] = useState([]);
//     const [fees, setFees] = useState([]);

//     // ============================================================
//     // ACADEMIC DATA
//     // ============================================================

//     const [childAttendance, setChildAttendance] = useState({});
//     const [childResults, setChildResults] = useState({});
//     const [loadingChildren, setLoadingChildren] = useState(true);
//     const [loadingAcademicData, setLoadingAcademicData] =
//         useState(false);

//     // ============================================================
//     // SELECTED CHILD
//     // ============================================================

//     const [selectedChildId, setSelectedChildId] =
//         useState(null);

//     // ============================================================
//     // PAYMENT
//     // ============================================================

//     const [selectedFee, setSelectedFee] = useState(null);
//     const [amount, setAmount] = useState("");
//     const [phone, setPhone] = useState("");
//     const [paymentMessage, setPaymentMessage] =
//         useState("");
//     const [paymentLoading, setPaymentLoading] =
//         useState(false);

//     // ============================================================
//     // LOAD CHILDREN + FEES
//     // ============================================================

//     useEffect(() => {
//         const loadData = async () => {
//             setLoadingChildren(true);

//             try {
//                 const [
//                     childrenData,
//                     feesData,
//                 ] = await Promise.all([
//                     getChildren(),
//                     getFees(),
//                 ]);

//                 const loadedChildren =
//                     Array.isArray(childrenData)
//                         ? childrenData
//                         : Array.isArray(childrenData?.results)
//                             ? childrenData.results
//                             : [];

//                 const loadedFees =
//                     Array.isArray(feesData)
//                         ? feesData
//                         : Array.isArray(feesData?.results)
//                             ? feesData.results
//                             : [];

//                 console.log(
//                     "PARENT CHILDREN:",
//                     loadedChildren
//                 );

//                 console.log(
//                     "PARENT FEES:",
//                     loadedFees
//                 );

//                 setChildren(loadedChildren);
//                 setFees(loadedFees);

//                 // Automatically select first child
//                 if (loadedChildren.length > 0) {
//                     const firstStudentId =
//                         getStudentId(
//                             loadedChildren[0]
//                         );

//                     setSelectedChildId(
//                         String(firstStudentId)
//                     );
//                 } else {
//                     setSelectedChildId(null);
//                 }
//             } catch (error) {
//                 console.error(
//                     "Failed to load parent dashboard:",
//                     error
//                 );

//                 setChildren([]);
//                 setFees([]);
//                 setSelectedChildId(null);
//             } finally {
//                 setLoadingChildren(false);
//             }
//         };

//         loadData();
//     }, []);

//     // ============================================================
//     // LOAD ATTENDANCE + RESULTS
//     // ============================================================

//     useEffect(() => {
//         if (!children.length) {
//             setChildAttendance({});
//             setChildResults({});
//             setLoadingAcademicData(false);
//             return;
//         }

//         const loadAcademicData = async () => {
//             setLoadingAcademicData(true);

//             try {
//                 const attendanceMap = {};
//                 const resultsMap = {};

//                 await Promise.all(
//                     children.map(async (child) => {
//                         const studentId =
//                             getStudentId(child);

//                         const studentKey =
//                             String(studentId);

//                         try {
//                             const [
//                                 attendanceResponse,
//                                 resultsResponse,
//                             ] = await Promise.all([
//                                 getChildAttendance(
//                                     studentId
//                                 ),
//                                 getChildResults(
//                                     studentId
//                                 ),
//                             ]);

//                             // ------------------------------------------------
//                             // NORMALIZE ATTENDANCE RESPONSE
//                             // ------------------------------------------------

//                             const attendance =
//                                 Array.isArray(
//                                     attendanceResponse
//                                 )
//                                     ? attendanceResponse
//                                     : Array.isArray(
//                                         attendanceResponse?.results
//                                     )
//                                         ? attendanceResponse.results
//                                         : [];

//                             // ------------------------------------------------
//                             // NORMALIZE RESULTS RESPONSE
//                             // ------------------------------------------------

//                             const results =
//                                 Array.isArray(
//                                     resultsResponse
//                                 )
//                                     ? resultsResponse
//                                     : Array.isArray(
//                                         resultsResponse?.results
//                                     )
//                                         ? resultsResponse.results
//                                         : [];

//                             // ------------------------------------------------
//                             // FILTER BY ACTUAL STUDENT ID
//                             // ------------------------------------------------

//                             const filteredAttendance =
//                                 attendance.filter(
//                                     (record) =>
//                                         String(
//                                             record.student
//                                         ) === studentKey
//                                 );

//                             const filteredResults =
//                                 results.filter(
//                                     (record) =>
//                                         String(
//                                             record.student
//                                         ) === studentKey
//                                 );

//                             // ------------------------------------------------
//                             // STORE DATA USING STUDENT ID
//                             // ------------------------------------------------

//                             attendanceMap[
//                                 studentKey
//                             ] = filteredAttendance;

//                             resultsMap[
//                                 studentKey
//                             ] = filteredResults;

//                             console.log(
//                                 `Attendance for ${child.student_name}:`,
//                                 filteredAttendance
//                             );

//                             console.log(
//                                 `Results for ${child.student_name}:`,
//                                 filteredResults
//                             );
//                         } catch (error) {
//                             console.error(
//                                 `Failed to load academic data for ${child.student_name}:`,
//                                 error
//                             );

//                             attendanceMap[
//                                 studentKey
//                             ] = [];

//                             resultsMap[
//                                 studentKey
//                             ] = [];
//                         }
//                     })
//                 );

//                 setChildAttendance(
//                     attendanceMap
//                 );

//                 setChildResults(
//                     resultsMap
//                 );
//             } catch (error) {
//                 console.error(
//                     "Failed to load academic data:",
//                     error
//                 );

//                 setChildAttendance({});
//                 setChildResults({});
//             } finally {
//                 setLoadingAcademicData(false);
//             }
//         };

//         loadAcademicData();
//     }, [children]);

//     // ============================================================
//     // CURRENT CHILD
//     // ============================================================

//     const currentChild = useMemo(() => {
//         if (!children.length) {
//             return null;
//         }

//         const selected =
//             children.find(
//                 (child) =>
//                     String(
//                         getStudentId(child)
//                     ) ===
//                     String(selectedChildId)
//             );

//         return selected || children[0];
//     }, [
//         children,
//         selectedChildId,
//     ]);

//     // ============================================================
//     // CURRENT CHILD ID
//     // ============================================================

//     const currentChildId = currentChild
//         ? String(
//             getStudentId(currentChild)
//         )
//         : null;

//     // ============================================================
//     // ATTENDANCE DATA
//     // ============================================================

//     const attendanceData = useMemo(() => {
//         if (!currentChildId) {
//             return [];
//         }

//         return (
//             childAttendance[currentChildId] ||
//             []
//         );
//     }, [
//         currentChildId,
//         childAttendance,
//     ]);

//     // ============================================================
//     // RESULTS DATA
//     // ============================================================

//     const resultsData = useMemo(() => {
//         if (!currentChildId) {
//             return [];
//         }

//         return (
//             childResults[currentChildId] ||
//             []
//         );
//     }, [
//         currentChildId,
//         childResults,
//     ]);

//     // ============================================================
//     // ATTENDANCE RATE
//     // ============================================================

//     const attendanceRate = useMemo(() => {
//         if (!attendanceData.length) {
//             return "--";
//         }

//         let present = 0;
//         let total = 0;

//         attendanceData.forEach((record) => {
//             const status = String(
//                 record.status ||
//                 record.attendance_status ||
//                 ""
//             ).toLowerCase();

//             const isPresent =
//                 status === "present" ||
//                 record.is_present === true ||
//                 record.present === true;

//             const isAbsent =
//                 status === "absent" ||
//                 record.is_absent === true ||
//                 record.absent === true;

//             const isExcused =
//                 status === "excused" ||
//                 record.is_excused === true ||
//                 record.excused === true;

//             if (
//                 isPresent ||
//                 isAbsent ||
//                 isExcused
//             ) {
//                 total += 1;

//                 if (isPresent) {
//                     present += 1;
//                 }
//             }
//         });

//         if (total === 0) {
//             return "--";
//         }

//         return `${Math.round(
//             (present / total) * 100
//         )}%`;
//     }, [attendanceData]);

//     // ============================================================
//     // PERFORMANCE DATA
//     // ============================================================

//     const performanceData = useMemo(() => {
//         if (!resultsData.length) {
//             return [];
//         }

//         const subjectGroups = {};

//         resultsData.forEach((result) => {
//             const subject =
//                 result.subject?.name ||
//                 result.subject_name ||
//                 result.subject?.title ||
//                 (
//                     typeof result.subject === "string"
//                         ? result.subject
//                         : null
//                 ) ||
//                 "Unknown Subject";

//             let mark =
//                 result.marks ??
//                 result.mark ??
//                 result.score ??
//                 result.marks_obtained ??
//                 result.obtained_marks ??
//                 result.percentage ??
//                 result.score_percentage;

//             if (
//                 typeof mark === "object" &&
//                 mark !== null
//             ) {
//                 mark =
//                     mark.marks ??
//                     mark.mark ??
//                     mark.score ??
//                     mark.percentage;
//             }

//             mark = Number(mark);

//             if (Number.isNaN(mark)) {
//                 return;
//             }

//             if (!subjectGroups[subject]) {
//                 subjectGroups[subject] = [];
//             }

//             subjectGroups[subject].push(mark);
//         });

//         return Object.entries(
//             subjectGroups
//         ).map(
//             ([subject, marks]) => {
//                 const average =
//                     marks.reduce(
//                         (total, mark) =>
//                             total + mark,
//                         0
//                     ) / marks.length;

//                 return {
//                     subject,
//                     performance:
//                         Math.round(average),
//                 };
//             }
//         );
//     }, [resultsData]);

//     // ============================================================
//     // AVERAGE SCORE
//     // ============================================================

//     const averageScore = useMemo(() => {
//         if (!performanceData.length) {
//             return "--";
//         }

//         const total =
//             performanceData.reduce(
//                 (sum, item) =>
//                     sum +
//                     Number(
//                         item.performance || 0
//                     ),
//                 0
//             );

//         return `${Math.round(
//             total / performanceData.length
//         )}%`;
//     }, [performanceData]);

//     // ============================================================
//     // SELECTED CHILD FEE
//     // ============================================================

//     const currentChildFee = useMemo(() => {
//         if (!currentChildId) {
//             return null;
//         }

//         return (
//             fees.find((fee) => {
//                 const feeStudentId =
//                     fee.student?.id ??
//                     fee.student_id ??
//                     fee.student;

//                 return (
//                     String(feeStudentId) ===
//                     String(currentChildId)
//                 );
//             }) || null
//         );
//     }, [
//         fees,
//         currentChildId,
//     ]);

//     // ============================================================
//     // SELECTED CHILD BALANCE
//     // ============================================================

//     const currentChildBalance = useMemo(() => {
//         if (!currentChildFee) {
//             return 0;
//         }

//         return Number(
//             currentChildFee.balance || 0
//         );
//     }, [currentChildFee]);

//     // ============================================================
//     // GET CHILD FEE
//     // ============================================================

//     const getChildFee = (child) => {
//         const studentId =
//             getStudentId(child);

//         return (
//             fees.find((fee) => {
//                 const feeStudentId =
//                     fee.student?.id ??
//                     fee.student_id ??
//                     fee.student;

//                 return (
//                     String(feeStudentId) ===
//                     String(studentId)
//                 );
//             }) || null
//         );
//     };

//     // ============================================================
//     // SELECT CHILD
//     // ============================================================

//     const handleSelectChild = (child) => {
//         const studentId =
//             getStudentId(child);

//         setSelectedChildId(
//             String(studentId)
//         );

//         setSelectedFee(null);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");
//     };

//     // ============================================================
//     // OPEN PAYMENT FORM
//     // ============================================================

//     const handlePayFees = (fee) => {
//         setSelectedFee(fee);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");

//         setTimeout(() => {
//             const element =
//                 document.getElementById(
//                     "payment-form"
//                 );

//             if (element) {
//                 element.scrollIntoView({
//                     behavior: "smooth",
//                     block: "center",
//                 });
//             }
//         }, 100);
//     };

//     // ============================================================
//     // CLOSE PAYMENT FORM
//     // ============================================================

//     const closePaymentForm = () => {
//         setSelectedFee(null);
//         setAmount("");
//         setPhone("");
//         setPaymentMessage("");
//     };

//     // ============================================================
//     // M-PESA PAYMENT
//     // ============================================================

//     const handlePayment = async (event) => {
//         event.preventDefault();

//         if (!selectedFee) {
//             setPaymentMessage(
//                 "Please select a fee record."
//             );
//             return;
//         }

//         const paymentAmount =
//             Number(amount);

//         const balance =
//             Number(
//                 selectedFee.balance || 0
//             );

//         if (paymentAmount <= 0) {
//             setPaymentMessage(
//                 "Please enter a valid payment amount."
//             );
//             return;
//         }

//         if (paymentAmount > balance) {
//             setPaymentMessage(
//                 "Payment amount cannot exceed the outstanding balance."
//             );
//             return;
//         }

//         if (!phone) {
//             setPaymentMessage(
//                 "Please enter your M-Pesa phone number."
//             );
//             return;
//         }

//         try {
//             setPaymentLoading(true);
//             setPaymentMessage("");

//             const studentId =
//                 selectedFee.student?.id ??
//                 selectedFee.student_id ??
//                 selectedFee.student;

//             const response =
//                 await initiateMpesaPayment({
//                     student_id:
//                         studentId,
//                     fee_id:
//                         selectedFee.id,
//                     amount:
//                         paymentAmount,
//                     phone_number:
//                         phone,
//                 });

//             setPaymentMessage(
//                 response.message ||
//                 "Payment request sent. Check your phone for the M-Pesa prompt."
//             );

//             setAmount("");
//         } catch (error) {
//             console.error(
//                 "M-Pesa payment error:",
//                 error
//             );

//             const errorMessage =
//                 error.response?.data?.error ||
//                 error.response?.data?.detail ||
//                 "Unable to initiate M-Pesa payment.";

//             setPaymentMessage(
//                 errorMessage
//             );
//         } finally {
//             setPaymentLoading(false);
//         }
//     };

//     // ============================================================
//     // TABLE COLUMNS
//     // ============================================================

//     const columns = [
//         {
//             key: "admission_number",
//             label: "Admission No.",
//         },
//         {
//             key: "student_name",
//             label: "Child",
//         },
//         {
//             key: "class_name",
//             label: "Class",
//         },
//     ];

//     // ============================================================
//     // RENDER
//     // ============================================================

//     return (
//         <DashboardLayout>

//             <div className="parent-dashboard">

//                 {/* ==================================================
//                     HEADER
//                 ================================================== */}

//                 <div className="dashboard-header">

//                     <div className="dashboard-header-icon">
//                         <FiHome />
//                     </div>

//                     <div>
//                         <h1>
//                             Parent Dashboard
//                         </h1>

//                         <p>
//                             Monitor your children's
//                             progress, attendance,
//                             academic performance
//                             and school fees.
//                         </p>
//                     </div>

//                 </div>

//                 {/* ==================================================
//                     CHILD SELECTOR
//                 ================================================== */}

//                 {children.length > 0 && (
//                     <section className="dashboard-panel child-selector-panel">

//                         <div className="child-selector-heading">

//                             <div className="section-heading-icon">
//                                 <FiUsers />
//                             </div>

//                             <div>
//                                 <span className="section-label">
//                                     FAMILY
//                                 </span>

//                                 <h2>
//                                     Select a Child
//                                 </h2>

//                                 <p>
//                                     Choose a child to view
//                                     their individual
//                                     school information.
//                                 </p>
//                             </div>

//                         </div>

//                         {/* CHILD CARDS */}

//                         <div className="child-selection-grid">

//                             {children.map((child) => {

//                                 const studentId =
//                                     getStudentId(child);

//                                 const isSelected =
//                                     String(
//                                         studentId
//                                     ) ===
//                                     String(
//                                         selectedChildId
//                                     );

//                                 return (
//                                     <button
//                                         type="button"
//                                         key={studentId}
//                                         className={
//                                             `child-selection-card ${
//                                                 isSelected
//                                                     ? "active"
//                                                     : ""
//                                             }`
//                                         }
//                                         onClick={() =>
//                                             handleSelectChild(
//                                                 child
//                                             )
//                                         }
//                                     >

//                                         <div className="child-avatar">

//                                             <FiUser />

//                                         </div>

//                                         <div className="child-selection-details">

//                                             <strong>
//                                                 {
//                                                     child.student_name
//                                                 }
//                                             </strong>

//                                             <span>
//                                                 {
//                                                     child.admission_number
//                                                 }
//                                             </span>

//                                             <span>
//                                                 {
//                                                     child.class_name ||
//                                                     "Class not available"
//                                                 }
//                                             </span>

//                                         </div>

//                                         {isSelected && (
//                                             <div className="child-selected-check">
//                                                 <FiCheck />
//                                             </div>
//                                         )}

//                                     </button>
//                                 );
//                             })}

//                         </div>

//                         {/* CURRENT CHILD */}

//                         {currentChild && (
//                             <div className="selected-child-info">

//                                 <span className="selected-child-label">
//                                     Currently viewing
//                                 </span>

//                                 <div className="selected-child-name">

//                                     <FiUser />

//                                     <strong>
//                                         {
//                                             currentChild.student_name
//                                         }
//                                     </strong>

//                                     <span>
//                                         •
//                                     </span>

//                                     <span>
//                                         {
//                                             currentChild.class_name
//                                         }
//                                     </span>

//                                 </div>

//                             </div>
//                         )}

//                     </section>
//                 )}

//                 {/* ==================================================
//                     STATS
//                 ================================================== */}

//                 <div className="stats-grid">

//                     <StatCard
//                         title="Children"
//                         value={
//                             loadingChildren
//                                 ? "..."
//                                 : children.length
//                         }
//                         icon={<FiUsers />}
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Fee Balance`
//                                 : "Fee Balance"
//                         }
//                         value={
//                             `KES ${currentChildBalance.toLocaleString()}`
//                         }
//                         icon={<FiDollarSign />}
//                         type="warning"
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Attendance`
//                                 : "Attendance"
//                         }
//                         value={
//                             loadingAcademicData
//                                 ? "..."
//                                 : attendanceRate
//                         }
//                         icon={<FiCalendar />}
//                         type="success"
//                     />

//                     <StatCard
//                         title={
//                             currentChild
//                                 ? `${currentChild.student_name}'s Average`
//                                 : "Average Score"
//                         }
//                         value={
//                             loadingAcademicData
//                                 ? "..."
//                                 : averageScore
//                         }
//                         icon={<FiTrendingUp />}
//                         type="danger"
//                     />

//                 </div>

//                 {/* ==================================================
//                     ACADEMIC SECTION
//                 ================================================== */}

//                 {currentChild && (
//                     <section className="academic-section">

//                         <div className="section-heading">

//                             <div className="section-heading-icon academic-icon">
//                                 <FiBookOpen />
//                             </div>

//                             <div>

//                                 <span className="section-label">
//                                     ACADEMICS
//                                 </span>

//                                 <h2>
//                                     {currentChild.student_name}'s
//                                     Academic Overview
//                                 </h2>

//                                 <p>
//                                     Attendance and performance
//                                     information for{" "}
//                                     {
//                                         currentChild.student_name
//                                     }.
//                                 </p>

//                             </div>

//                         </div>

//                         {/* CHARTS */}

//                         <div className="charts-grid">

//                             {/* ATTENDANCE */}

//                             <div className="chart-panel">

//                                 <div className="chart-panel-header">

//                                     <div>

//                                         <h3>
//                                             Attendance Trends
//                                         </h3>

//                                         <p>
//                                             Daily attendance
//                                             percentage
//                                         </p>

//                                     </div>

//                                     <span className="chart-icon attendance-chart-icon">
//                                         <FiCalendar />
//                                     </span>

//                                 </div>

//                                 {loadingAcademicData ? (

//                                     <div className="chart-loading">
//                                         Loading attendance...
//                                     </div>

//                                 ) : attendanceData.length === 0 ? (

//                                     <div className="chart-empty">

//                                         <FiCalendar />

//                                         <span>
//                                             No attendance records
//                                             available for{" "}
//                                             {
//                                                 currentChild.student_name
//                                             }.
//                                         </span>

//                                     </div>

//                                 ) : (

//                                     <AttendanceChart
//                                         key={
//                                             `attendance-${currentChildId}`
//                                         }
//                                         data={
//                                             attendanceData
//                                         }
//                                         childName={
//                                             currentChild.student_name ||
//                                             ""
//                                         }
//                                     />

//                                 )}

//                             </div>

//                             {/* PERFORMANCE */}

//                             <div className="chart-panel">

//                                 <div className="chart-panel-header">

//                                     <div>

//                                         <h3>
//                                             Academic Performance
//                                         </h3>

//                                         <p>
//                                             Average marks by
//                                             subject
//                                         </p>

//                                     </div>

//                                     <span className="chart-icon performance-chart-icon">
//                                         <FiBarChart2 />
//                                     </span>

//                                 </div>

//                                 {loadingAcademicData ? (

//                                     <div className="chart-loading">
//                                         Loading performance...
//                                     </div>

//                                 ) : performanceData.length === 0 ? (

//                                     <div className="chart-empty">

//                                         <FiBarChart2 />

//                                         <span>
//                                             No academic results
//                                             available for{" "}
//                                             {
//                                                 currentChild.student_name
//                                             }.
//                                         </span>

//                                     </div>

//                                 ) : (

//                                     <PerformanceChart
//                                         key={
//                                             `performance-${currentChildId}`
//                                         }
//                                         data={
//                                             performanceData
//                                         }
//                                         childName={
//                                             currentChild.student_name ||
//                                             ""
//                                         }
//                                     />

//                                 )}

//                             </div>

//                         </div>

//                     </section>
//                 )}

//                 {/* ==================================================
//                     MY CHILDREN
//                 ================================================== */}

//                 <section className="dashboard-panel">

//                     <div className="section-heading">

//                         <div className="section-heading-icon family-icon">
//                             <FiUsers />
//                         </div>

//                         <div>

//                             <span className="section-label">
//                                 FAMILY
//                             </span>

//                             <h2>
//                                 My Children
//                             </h2>

//                             <p>
//                                 Children linked to your
//                                 parent account.
//                             </p>

//                         </div>

//                     </div>

//                     <DataTable
//                         columns={columns}
//                         data={children}
//                     />

//                 </section>

//                 {/* ==================================================
//                     SCHOOL FEES
//                 ================================================== */}

//                 <section className="dashboard-panel parent-fees-panel">

//                     <div className="parent-fees-header">

//                         <div className="section-heading-icon finance-icon">
//                             <FiDollarSign />
//                         </div>

//                         <div>

//                             <span className="section-label">
//                                 FINANCE
//                             </span>

//                             <h2>
//                                 School Fees
//                             </h2>

//                             <p>
//                                 View each child's fee
//                                 balance and make
//                                 payments securely.
//                             </p>

//                         </div>

//                     </div>

//                     {/* FEE LIST */}

//                     <div className="parent-fees-list">

//                         {children.length === 0 ? (

//                             <div className="empty-state">

//                                 <FiUsers />

//                                 <p>
//                                     No children found.
//                                 </p>

//                             </div>

//                         ) : (

//                             children.map((child) => {

//                                 const fee =
//                                     getChildFee(
//                                         child
//                                     );

//                                 const studentId =
//                                     getStudentId(
//                                         child
//                                     );

//                                 const isSelected =
//                                     String(
//                                         studentId
//                                     ) ===
//                                     String(
//                                         selectedChildId
//                                     );

//                                 const balance =
//                                     Number(
//                                         fee?.balance || 0
//                                     );

//                                 return (

//                                     <div
//                                         className={
//                                             `parent-fee-card ${
//                                                 isSelected
//                                                     ? "selected-fee-child"
//                                                     : ""
//                                             }`
//                                         }
//                                         key={studentId}
//                                     >

//                                         {/* CHILD */}

//                                         <div className="parent-fee-info">

//                                             <div className="fee-child-avatar">
//                                                 <FiUser />
//                                             </div>


//                                             <div className="fee-child-details">

//                                                 <h3>
//                                                     {
//                                                         child.student_name
//                                                     }
//                                                 </h3>

//                                                 <span>
//                                                     <strong>
//                                                         Admission:
//                                                     </strong>{" "}
//                                                     {
//                                                         child.admission_number
//                                                     }
//                                                 </span>

//                                                 <span>
//                                                     <strong>
//                                                         Class:
//                                                     </strong>{" "}
//                                                     {
//                                                         child.class_name
//                                                     }
//                                                 </span>

//                                             </div>

//                                         </div>

//                                         {/* BALANCE */}

//                                         <div className="parent-fee-balance">

//                                             <span>
//                                                 Outstanding Balance
//                                             </span>

//                                             <strong>
//                                                 KES{" "}
//                                                 {
//                                                     balance.toLocaleString()
//                                                 }
//                                             </strong>

//                                         </div>

//                                         {/* ACTION */}

//                                         <div className="parent-fee-action">

//                                             {fee &&
//                                             balance > 0 ? (

//                                                 <button
//                                                     type="button"
//                                                     className="pay-fees-btn"
//                                                     onClick={() =>
//                                                         handlePayFees(
//                                                             fee
//                                                         )
//                                                     }
//                                                 >

//                                                     <FiCreditCard />

//                                                     <span>
//                                                         Pay Fees
//                                                     </span>

//                                                 </button>

//                                             ) : fee ? (

//                                                 <span className="fee-paid-label">

//                                                     <FiCheck />

//                                                     <span>
//                                                         Fully Paid
//                                                     </span>

//                                                 </span>

//                                             ) : (

//                                                 <span className="no-fee-label">

//                                                     <FiDollarSign />

//                                                     <span>
//                                                         No fee record
//                                                     </span>

//                                                 </span>

//                                             )}

//                                         </div>

//                                     </div>

//                                 );
//                             })

//                         )}

//                     </div>

//                     {/* ==================================================
//                         PAYMENT FORM
//                     ================================================== */}

//                     {selectedFee && (

//                         <div
//                             id="payment-form"
//                             className="payment-form-container"
//                         >

//                             <div className="payment-form-header">

//                                 <div>

//                                     <span className="section-label">
//                                         M-PESA PAYMENT
//                                     </span>

//                                     <h2>
//                                         Pay School Fees
//                                     </h2>

//                                     <p>
//                                         {
//                                             selectedFee.student?.first_name ||
//                                             selectedFee.student_name ||
//                                             ""
//                                         }{" "}
//                                         {
//                                             selectedFee.student?.last_name ||
//                                             ""
//                                         }
//                                     </p>

//                                 </div>

//                                 <button
//                                     type="button"
//                                     className="close-payment-btn"
//                                     onClick={
//                                         closePaymentForm
//                                     }
//                                     aria-label="Close payment form"
//                                 >
//                                     <FiX />
//                                 </button>

//                             </div>

//                             {/* BALANCE */}

//                             <div className="payment-balance">

//                                 <div className="payment-balance-icon">
//                                     <FiDollarSign />
//                                 </div>

//                                 <div>

//                                     <span>
//                                         Outstanding Balance
//                                     </span>

//                                     <strong>
//                                         KES{" "}
//                                         {
//                                             Number(
//                                                 selectedFee.balance ||
//                                                 0
//                                             ).toLocaleString()
//                                         }
//                                     </strong>

//                                 </div>

//                             </div>

//                             {/* PAYMENT FORM */}

//                             <form
//                                 onSubmit={
//                                     handlePayment
//                                 }
//                                 className="parent-payment-form"
//                             >

//                                 <div className="form-group">

//                                     <label>
//                                         Amount to Pay
//                                     </label>

//                                     <div className="input-with-icon">

//                                         <FiDollarSign />

//                                         <input
//                                             type="number"
//                                             min="1"
//                                             max={
//                                                 selectedFee.balance
//                                             }
//                                             value={amount}
//                                             onChange={
//                                                 (event) =>
//                                                     setAmount(
//                                                         event
//                                                             .target
//                                                             .value
//                                                     )
//                                             }
//                                             placeholder="Enter amount"
//                                             required
//                                         />

//                                     </div>

//                                     <small>
//                                         Maximum: KES{" "}
//                                         {
//                                             Number(
//                                                 selectedFee.balance ||
//                                                 0
//                                             ).toLocaleString()
//                                         }
//                                     </small>

//                                 </div>

//                                 <div className="form-group">

//                                     <label>
//                                         M-Pesa Phone Number
//                                     </label>

//                                     <div className="input-with-icon">

//                                         <FiSmartphone />

//                                         <input
//                                             type="tel"
//                                             value={phone}
//                                             onChange={
//                                                 (event) =>
//                                                     setPhone(
//                                                         event
//                                                             .target
//                                                             .value
//                                                     )
//                                             }
//                                             placeholder="2547XXXXXXXX"
//                                             required
//                                         />

//                                     </div>

//                                     <small>
//                                         Example:
//                                         254712345678
//                                     </small>

//                                 </div>

//                                 {paymentMessage && (

//                                     <div
//                                         className={
//                                             `payment-message ${
//                                                 paymentMessage
//                                                     .toLowerCase()
//                                                     .includes(
//                                                         "unable"
//                                                     )
//                                                     ? "error"
//                                                     : "success"
//                                             }`
//                                         }
//                                     >

//                                         {paymentMessage}

//                                     </div>

//                                 )}

//                                 <button
//                                     type="submit"
//                                     className="mpesa-pay-btn"
//                                     disabled={
//                                         paymentLoading
//                                     }
//                                 >

//                                     <FiSmartphone />

//                                     <span>
//                                         {paymentLoading
//                                             ? "Sending M-Pesa Request..."
//                                             : "Pay with M-Pesa"}
//                                     </span>

//                                 </button>

//                             </form>

//                         </div>

//                     )}

//                 </section>

//             </div>

//         </DashboardLayout>
//     );
// };

// export default ParentDashboard;


