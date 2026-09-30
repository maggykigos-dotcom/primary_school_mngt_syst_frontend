import { useEffect, useMemo, useState, useContext } from "react";
import { Link } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import { getFees } from "../../api/financeAPI";
import { AuthContext } from "../../context/AuthContext";

import "./Fees.css";

const Fees = () => {
    const { user } = useContext(AuthContext);

    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FILTER STATES
    // ==========================================

    const [selectedGrade, setSelectedGrade] = useState("");
    const [studentSearch, setStudentSearch] = useState("");

    const userRole = user?.role;
    const isAdmin = userRole === "admin";

    // ==========================================
    // LOAD FEES
    // ==========================================

    useEffect(() => {
        loadFees();
    }, []);

    const loadFees = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getFees();

            const feeData = Array.isArray(data)
                ? data
                : data?.results || [];

            const formattedFees = feeData.map((fee) => {
                const student = fee.student;

                const studentName = student
                    ? `${student.first_name || ""} ${
                          student.last_name || ""
                      }`.trim()
                    : "";

                return {
                    ...fee,

                    // Student information
                    student_name:
                        studentName ||
                        student?.user?.get_full_name ||
                        student?.user?.first_name ||
                        `Student #${student?.id || ""}`,

                    admission_number:
                        student?.admission_number || "—",

                    grade_name:
                        student?.grade_name || "—",

                    school_class:
                        student?.school_class_name || "—",

                    // Financial values
                    total_amount: Number(
                        fee.total_amount || 0
                    ),

                    amount_paid: Number(
                        fee.amount_paid || 0
                    ),

                    balance: Number(
                        fee.balance || 0
                    ),

                    term: fee.term || "—",

                    session: fee.session || "—",

                    status:
                        fee.status || "unpaid",
                };
            });

            setFees(formattedFees);
        } catch (error) {
            console.error(
                "Failed to load fees:",
                error
            );

            setError("Failed to load fees.");
            setFees([]);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // GET UNIQUE GRADES
    // ==========================================

    const grades = useMemo(() => {
        const uniqueGrades = [
            ...new Set(
                fees
                    .map(
                        (fee) =>
                            fee.grade_name
                    )
                    .filter(
                        (grade) =>
                            grade &&
                            grade !== "—"
                    )
            ),
        ];

        return uniqueGrades.sort((a, b) =>
            a.localeCompare(b)
        );
    }, [fees]);

    // ==========================================
    // FILTER FEES
    // ==========================================

    const filteredFees = useMemo(() => {
        return fees.filter((fee) => {
            // Grade
            const matchesGrade =
                !selectedGrade ||
                fee.grade_name ===
                    selectedGrade;

            // Student name
            const studentName =
                String(
                    fee.student_name || ""
                ).toLowerCase();

            // Admission number
            const admissionNumber =
                String(
                    fee.admission_number || ""
                ).toLowerCase();

            const search =
                studentSearch
                    .trim()
                    .toLowerCase();

            const matchesStudent =
                !search ||
                studentName.includes(search) ||
                admissionNumber.includes(search);

            return (
                matchesGrade &&
                matchesStudent
            );
        });
    }, [
        fees,
        selectedGrade,
        studentSearch,
    ]);

    // ==========================================
    // FILTERED FINANCIAL SUMMARY
    // ==========================================

    const totalFees = useMemo(() => {
        return filteredFees.reduce(
            (total, fee) =>
                total +
                Number(
                    fee.total_amount || 0
                ),
            0
        );
    }, [filteredFees]);

    const totalPaid = useMemo(() => {
        return filteredFees.reduce(
            (total, fee) =>
                total +
                Number(
                    fee.amount_paid || 0
                ),
            0
        );
    }, [filteredFees]);

    const totalBalance = useMemo(() => {
        return filteredFees.reduce(
            (total, fee) =>
                total +
                Number(
                    fee.balance || 0
                ),
            0
        );
    }, [filteredFees]);

    // ==========================================
    // STATUS COUNTS
    // ==========================================

    const paidFees = useMemo(() => {
        return filteredFees.filter(
            (fee) =>
                String(
                    fee.status || ""
                ).toLowerCase() ===
                "paid"
        ).length;
    }, [filteredFees]);

    const partialFees = useMemo(() => {
        return filteredFees.filter(
            (fee) =>
                String(
                    fee.status || ""
                ).toLowerCase() ===
                "partial"
        ).length;
    }, [filteredFees]);

    const unpaidFees = useMemo(() => {
        return filteredFees.filter(
            (fee) =>
                String(
                    fee.status || ""
                ).toLowerCase() ===
                    "unpaid" ||
                String(
                    fee.status || ""
                ).toLowerCase() ===
                    "pending"
        ).length;
    }, [filteredFees]);

    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    const clearFilters = () => {
        setSelectedGrade("");
        setStudentSearch("");
    };

    const hasFilters =
        selectedGrade !== "" ||
        studentSearch.trim() !== "";

    // ==========================================
    // RETURN
    // ==========================================

    return (
        <DashboardLayout>
            <div className="finance-page fees-page">

                {/* =====================================
                    HEADER
                ===================================== */}

                <div className="finance-header">

                    <div className="finance-title">

                        <div className="finance-page-icon">
                            💰
                        </div>

                        <div>
                            <h1>
                                School Fees
                            </h1>

                            <p>
                                {isAdmin
                                    ? "Manage student fee balances and payment status."
                                    : "View your children's fee balances and payment status."
                                }
                            </p>
                        </div>

                    </div>

                    {/* ONLY ADMIN CAN ADD FEE */}

                    {isAdmin && (
                        <Link
                            to="/fees/add"
                            className="finance-primary-btn"
                        >
                            + Add Fee
                        </Link>
                    )}

                </div>


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (
                    <div className="finance-error">
                        ⚠️ {error}
                    </div>
                )}


                {/* =====================================
                    FILTER SECTION
                ===================================== */}

                {!loading && !error && (
                    <div className="fees-filter-panel">

                        <div className="fees-filter-heading">

                            <div>
                                <h2>
                                    Filter Fee Records
                                </h2>

                                <p>
                                    Find fee records by
                                    grade or student.
                                </p>
                            </div>

                            {hasFilters && (
                                <button
                                    type="button"
                                    className="clear-fee-filters"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear Filters
                                </button>
                            )}

                        </div>


                        <div className="fees-filter-grid">

                            {/* GRADE */}

                            <div className="fee-filter-field">

                                <label>
                                    Grade
                                </label>

                                <select
                                    value={
                                        selectedGrade
                                    }
                                    onChange={(e) =>
                                        setSelectedGrade(
                                            e.target.value
                                        )
                                    }
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

                            </div>


                            {/* STUDENT */}

                            <div className="fee-filter-field">

                                <label>
                                    Student Name
                                </label>

                                <input
                                    type="text"
                                    value={
                                        studentSearch
                                    }
                                    onChange={(e) =>
                                        setStudentSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Search student name or admission number..."
                                />

                            </div>

                        </div>


                        {/* FILTER RESULT */}

                        <div className="fee-filter-result">

                            <span>
                                Showing
                            </span>

                            <strong>
                                {
                                    filteredFees.length
                                }
                            </strong>

                            <span>
                                of
                            </span>

                            <strong>
                                {fees.length}
                            </strong>

                            <span>
                                fee records
                            </span>

                        </div>

                    </div>
                )}


                {/* =====================================
                    SUMMARY CARDS
                ===================================== */}

                {!loading && !error && (
                    <div className="fee-stats">

                        {/* TOTAL FEES */}

                        <div className="fee-stat-card">

                            <div className="fee-stat-icon blue">
                                💰
                            </div>

                            <div>
                                <span>
                                    Total Fees
                                </span>

                                <strong>
                                    KSh{" "}
                                    {totalFees.toLocaleString()}
                                </strong>
                            </div>

                        </div>


                        {/* PAID */}

                        <div className="fee-stat-card">

                            <div className="fee-stat-icon green">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Total Paid
                                </span>

                                <strong>
                                    KSh{" "}
                                    {totalPaid.toLocaleString()}
                                </strong>

                                <small>
                                    {paidFees} fully paid
                                </small>
                            </div>

                        </div>


                        {/* BALANCE */}

                        <div className="fee-stat-card">

                            <div className="fee-stat-icon orange">
                                ⚠
                            </div>

                            <div>
                                <span>
                                    Outstanding
                                </span>

                                <strong>
                                    KSh{" "}
                                    {totalBalance.toLocaleString()}
                                </strong>

                                <small>
                                    {partialFees +
                                        unpaidFees}{" "}
                                    with balance
                                </small>
                            </div>

                        </div>


                        {/* RECORDS */}

                        <div className="fee-stat-card">

                            <div className="fee-stat-icon purple">
                                📋
                            </div>

                            <div>
                                <span>
                                    Fee Records
                                </span>

                                <strong>
                                    {
                                        filteredFees.length
                                    }
                                </strong>

                                <small>
                                    {partialFees} partial
                                </small>
                            </div>

                        </div>

                    </div>
                )}


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (
                    <div className="finance-loading fees-loading-state">

                        <div className="fees-loading-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading fee records...
                        </h3>

                        <p>
                            Please wait while fee
                            information is retrieved.
                        </p>

                    </div>
                )}


                {/* =====================================
                    FEE TABLE
                ===================================== */}

                {!loading && !error && (
                    <div className="finance-table-container fees-table-panel">

                        <div className="fees-table-header">

                            <div>
                                <h2>
                                    Fee Records
                                </h2>

                                <p>
                                    {
                                        filteredFees.length
                                    }{" "}
                                    fee record
                                    {filteredFees.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    matching your filters
                                </p>
                            </div>

                            <div className="fees-records-badge">
                                {
                                    filteredFees.length
                                }{" "}
                                Records
                            </div>

                        </div>


                        {filteredFees.length > 0 ? (

                            <div className="finance-table-wrapper">

                                <table className="finance-table">

                                    <thead>
                                        <tr>
                                            <th>
                                                Student
                                            </th>

                                            <th>
                                                Admission No.
                                            </th>

                                            <th>
                                                Grade
                                            </th>

                                            <th>
                                                Class
                                            </th>

                                            <th>
                                                Term
                                            </th>

                                            <th>
                                                Session
                                            </th>

                                            <th>
                                                Total
                                            </th>

                                            <th>
                                                Paid
                                            </th>

                                            <th>
                                                Balance
                                            </th>

                                            <th>
                                                Status
                                            </th>
                                        </tr>
                                    </thead>


                                    <tbody>

                                        {filteredFees.map(
                                            (fee) => (
                                                <tr
                                                    key={
                                                        fee.id
                                                    }
                                                >

                                                    {/* STUDENT */}

                                                    <td>
                                                        <strong>
                                                            {
                                                                fee.student_name
                                                            }
                                                        </strong>
                                                    </td>


                                                    {/* ADMISSION */}

                                                    <td>
                                                        {
                                                            fee.admission_number
                                                        }
                                                    </td>


                                                    {/* GRADE */}

                                                    <td>
                                                        <span className="fee-grade-badge">
                                                            {
                                                                fee.grade_name
                                                            }
                                                        </span>
                                                    </td>


                                                    {/* CLASS */}

                                                    <td>
                                                        {
                                                            fee.school_class
                                                        }
                                                    </td>


                                                    {/* TERM */}

                                                    <td>
                                                        {
                                                            fee.term
                                                        }
                                                    </td>


                                                    {/* SESSION */}

                                                    <td>
                                                        {
                                                            fee.session
                                                        }
                                                    </td>


                                                    {/* TOTAL */}

                                                    <td className="fee-amount">
                                                        KSh{" "}
                                                        {Number(
                                                            fee.total_amount ||
                                                                0
                                                        ).toLocaleString()}
                                                    </td>


                                                    {/* PAID */}

                                                    <td className="fee-paid">
                                                        KSh{" "}
                                                        {Number(
                                                            fee.amount_paid ||
                                                                0
                                                        ).toLocaleString()}
                                                    </td>


                                                    {/* BALANCE */}

                                                    <td className="fee-balance">
                                                        KSh{" "}
                                                        {Number(
                                                            fee.balance ||
                                                                0
                                                        ).toLocaleString()}
                                                    </td>


                                                    {/* STATUS */}

                                                    <td>
                                                        <span
                                                            className={`fee-status ${
                                                                fee.status ||
                                                                "unpaid"
                                                            }`}
                                                        >
                                                            {
                                                                fee.status ||
                                                                "Unpaid"
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

                            <div className="finance-empty fees-empty">

                                <div className="finance-empty-icon">
                                    🔍
                                </div>

                                <h3>
                                    No Fee Records Found
                                </h3>

                                <p>
                                    No fee records match
                                    the selected grade
                                    or student.
                                </p>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        className="empty-fee-clear-button"
                                        onClick={
                                            clearFilters
                                        }
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>

                        )}

                    </div>
                )}

            </div>
        </DashboardLayout>
    );
};

export default Fees;








// import { useEffect, useState } from "react";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";
// import { getFees } from "../../api/financeAPI";

// const Fees = () => {
//   const [fees, setFees] = useState([]);

//   useEffect(() => {
//     getFees()
//       .then(setFees)
//       .catch(console.error);
//   }, []);

//   const columns = [
//     { key: "student", label: "Student" },
//     { key: "amount", label: "Amount" },
//     { key: "balance", label: "Balance" },
//   ];

//   return (
//     <DashboardLayout>
//       <h1>School Fees</h1>

//       <DataTable
//         columns={columns}
//         data={fees}
//       />
//     </DashboardLayout>
//   );
// };

// export default Fees;