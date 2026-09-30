import { useEffect, useMemo, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import DataTable from "../../components/DataTable/DataTable";

import { getPayments } from "../../api/financeAPI";

import "./Payments.css";

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // FILTER STATES
    // ==========================================

    const [selectedGrade, setSelectedGrade] = useState("");
    const [studentSearch, setStudentSearch] = useState("");

    // ==========================================
    // LOAD PAYMENTS
    // ==========================================

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getPayments();

                let paymentList = [];

                if (Array.isArray(data)) {
                    paymentList = data;
                } else if (Array.isArray(data?.results)) {
                    paymentList = data.results;
                }

                const formattedPayments = paymentList.map(
                    (payment) => {
                        const student = payment.student;

                        const studentName = student
                            ? `${student.first_name || ""} ${
                                  student.last_name || ""
                              }`.trim()
                            : "—";

                        const admissionNumber =
                            student?.admission_number || "—";

                        const gradeName =
                            student?.grade_name || "—";

                        const schoolClass =
                            student?.school_class_name || "—";

                        return {
                            ...payment,

                            student_name:
                                studentName || "—",

                            admission_number:
                                admissionNumber,

                            grade_name:
                                gradeName,

                            school_class:
                                schoolClass,

                            amount: Number(
                                payment.amount || 0
                            ),

                            method:
                                typeof payment.method ===
                                "object"
                                    ? payment.method?.name ||
                                      "—"
                                    : payment.method || "—",

                            transaction_id:
                                typeof payment.transaction_id ===
                                "object"
                                    ? payment.transaction_id?.id ||
                                      payment.transaction_id
                                          ?.receipt ||
                                      "—"
                                    : payment.transaction_id ||
                                      "—",

                            status:
                                typeof payment.status ===
                                "object"
                                    ? payment.status?.name ||
                                      "—"
                                    : payment.status || "—",

                            created_at:
                                payment.created_at
                                    ? new Date(
                                          payment.created_at
                                      ).toLocaleString()
                                    : "—",
                        };
                    }
                );

                setPayments(formattedPayments);
            } catch (error) {
                console.error(
                    "Failed to load payments:",
                    error
                );

                setError(
                    "Failed to load payments."
                );

                setPayments([]);
            } finally {
                setLoading(false);
            }
        };

        loadPayments();
    }, []);

    // ==========================================
    // GET UNIQUE GRADES
    // ==========================================

    const grades = useMemo(() => {
        const uniqueGrades = [
            ...new Set(
                payments
                    .map(
                        (payment) =>
                            payment.grade_name
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
    }, [payments]);

    // ==========================================
    // FILTER PAYMENTS
    // ==========================================

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const matchesGrade =
                !selectedGrade ||
                payment.grade_name ===
                    selectedGrade;

            const studentName =
                String(
                    payment.student_name || ""
                ).toLowerCase();

            const admissionNumber =
                String(
                    payment.admission_number || ""
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
        payments,
        selectedGrade,
        studentSearch,
    ]);

    // ==========================================
    // FILTERED PAYMENT SUMMARY
    // ==========================================

    const totalCollected = useMemo(() => {
        return filteredPayments.reduce(
            (total, payment) =>
                total +
                Number(payment.amount || 0),
            0
        );
    }, [filteredPayments]);

    const successfulPayments = useMemo(() => {
        return filteredPayments.filter(
            (payment) => {
                const status = String(
                    payment.status || ""
                ).toLowerCase();

                return (
                    status === "successful" ||
                    status === "completed" ||
                    status === "success"
                );
            }
        ).length;
    }, [filteredPayments]);

    const pendingPayments = useMemo(() => {
        return filteredPayments.filter(
            (payment) => {
                const status = String(
                    payment.status || ""
                ).toLowerCase();

                return (
                    status === "pending" ||
                    status === "processing"
                );
            }
        ).length;
    }, [filteredPayments]);

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
    // TABLE COLUMNS
    // ==========================================

    const columns = [
        {
            key: "student_name",
            label: "Student",
        },
        {
            key: "admission_number",
            label: "Admission No.",
        },
        {
            key: "grade_name",
            label: "Grade",
        },
        {
            key: "school_class",
            label: "Class",
        },
        {
            key: "amount",
            label: "Amount",
        },
        {
            key: "method",
            label: "Method",
        },
        {
            key: "transaction_id",
            label: "M-Pesa Receipt",
        },
        {
            key: "status",
            label: "Status",
        },
        {
            key: "created_at",
            label: "Date",
        },
    ];

    return (
        <DashboardLayout>

            <div className="payments-page">

                {/* =====================================
                    PAGE HEADER
                ===================================== */}

                <div className="payments-header">

                    <div className="payments-title">

                        <div className="payments-icon">
                            💳
                        </div>

                        <div>
                            <h1>
                                Payments
                            </h1>

                            <p>
                                View and monitor school
                                fee payments made by
                                students and parents.
                            </p>
                        </div>

                    </div>

                </div>


                {/* =====================================
                    FILTER SECTION
                ===================================== */}

                {!loading && !error && (
                    <div className="payments-filter-panel">

                        <div className="payments-filter-heading">

                            <div>
                                <h2>
                                    Filter Payments
                                </h2>

                                <p>
                                    Find payments by
                                    grade or student.
                                </p>
                            </div>

                            {hasFilters && (
                                <button
                                    type="button"
                                    className="clear-payment-filters"
                                    onClick={
                                        clearFilters
                                    }
                                >
                                    Clear Filters
                                </button>
                            )}

                        </div>


                        <div className="payments-filter-grid">

                            {/* GRADE FILTER */}

                            <div className="payment-filter-field">

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


                            {/* STUDENT SEARCH */}

                            <div className="payment-filter-field">

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

                        <div className="payment-filter-result">

                            <span>
                                Showing
                            </span>

                            <strong>
                                {
                                    filteredPayments.length
                                }
                            </strong>

                            <span>
                                of
                            </span>

                            <strong>
                                {payments.length}
                            </strong>

                            <span>
                                payments
                            </span>

                        </div>

                    </div>
                )}


                {/* =====================================
                    SUMMARY CARDS
                ===================================== */}

                {!loading && !error && (
                    <div className="payment-stats">

                        <div className="payment-stat-card">

                            <div className="payment-stat-icon blue">
                                💳
                            </div>

                            <div>
                                <span>
                                    Total Payments
                                </span>

                                <strong>
                                    {
                                        filteredPayments.length
                                    }
                                </strong>
                            </div>

                        </div>


                        <div className="payment-stat-card">

                            <div className="payment-stat-icon green">
                                💰
                            </div>

                            <div>
                                <span>
                                    Total Collected
                                </span>

                                <strong>
                                    KES{" "}
                                    {totalCollected.toLocaleString()}
                                </strong>
                            </div>

                        </div>


                        <div className="payment-stat-card">

                            <div className="payment-stat-icon success">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Successful
                                </span>

                                <strong>
                                    {
                                        successfulPayments
                                    }
                                </strong>
                            </div>

                        </div>


                        <div className="payment-stat-card">

                            <div className="payment-stat-icon orange">
                                ⏳
                            </div>

                            <div>
                                <span>
                                    Pending
                                </span>

                                <strong>
                                    {
                                        pendingPayments
                                    }
                                </strong>
                            </div>

                        </div>

                    </div>
                )}


                {/* =====================================
                    LOADING
                ===================================== */}

                {loading && (
                    <div className="payments-state">

                        <div className="loading-icon">
                            ⏳
                        </div>

                        <h3>
                            Loading payments...
                        </h3>

                        <p>
                            Please wait while payment
                            records are retrieved.
                        </p>

                    </div>
                )}


                {/* =====================================
                    ERROR
                ===================================== */}

                {error && (
                    <div className="payments-error">
                        ⚠️ {error}
                    </div>
                )}


                {/* =====================================
                    PAYMENT TABLE
                ===================================== */}

                {!loading && !error && (
                    <div className="payments-table-panel">

                        <div className="payments-table-header">

                            <div>
                                <h2>
                                    Payment Records
                                </h2>

                                <p>
                                    {filteredPayments.length}{" "}
                                    payment
                                    {filteredPayments.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    matching your filters
                                </p>
                            </div>

                            <div className="records-badge">
                                {
                                    filteredPayments.length
                                }{" "}
                                Records
                            </div>

                        </div>


                        {filteredPayments.length >
                        0 ? (
                            <DataTable
                                columns={columns}
                                data={
                                    filteredPayments
                                }
                            />
                        ) : (
                            <div className="empty-payments">

                                <div>
                                    🔍
                                </div>

                                <h3>
                                    No Payments Found
                                </h3>

                                <p>
                                    No payment records
                                    match the selected
                                    grade or student.
                                </p>

                                {hasFilters && (
                                    <button
                                        type="button"
                                        className="empty-clear-button"
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

export default Payments;


// import { useEffect, useMemo, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";

// import { getPayments } from "../../api/financeAPI";

// import "./Payments.css";

// const Payments = () => {
//     const [payments, setPayments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const loadPayments = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const data = await getPayments();

//                 let paymentList = [];

//                 if (Array.isArray(data)) {
//                     paymentList = data;
//                 } else if (Array.isArray(data?.results)) {
//                     paymentList = data.results;
//                 }

//                 const formattedPayments = paymentList.map(
//                     (payment) => {
//                         const student = payment.student;

//                         const studentName = student
//                             ? `${student.first_name || ""} ${
//                                   student.last_name || ""
//                               }`.trim()
//                             : "—";

//                         const admissionNumber =
//                             student?.admission_number || "—";

//                         return {
//                             ...payment,

//                             student_name: studentName,

//                             admission_number:
//                                 admissionNumber,

//                             amount: Number(
//                                 payment.amount || 0
//                             ),

//                             method:
//                                 typeof payment.method ===
//                                 "object"
//                                     ? payment.method?.name ||
//                                       "—"
//                                     : payment.method || "—",

//                             transaction_id:
//                                 typeof payment.transaction_id ===
//                                 "object"
//                                     ? payment.transaction_id?.id ||
//                                       payment.transaction_id
//                                           ?.receipt ||
//                                       "—"
//                                     : payment.transaction_id ||
//                                       "—",

//                             status:
//                                 typeof payment.status ===
//                                 "object"
//                                     ? payment.status?.name ||
//                                       "—"
//                                     : payment.status || "—",

//                             created_at:
//                                 payment.created_at
//                                     ? new Date(
//                                           payment.created_at
//                                       ).toLocaleString()
//                                     : "—",
//                         };
//                     }
//                 );

//                 setPayments(formattedPayments);
//             } catch (error) {
//                 console.error(
//                     "Failed to load payments:",
//                     error
//                 );

//                 setError(
//                     "Failed to load payments."
//                 );

//                 setPayments([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadPayments();
//     }, []);

//     /*
//      * PAYMENT SUMMARY
//      */

//     const totalCollected = useMemo(() => {
//         return payments.reduce(
//             (total, payment) =>
//                 total + Number(payment.amount || 0),
//             0
//         );
//     }, [payments]);

//     const successfulPayments = useMemo(() => {
//         return payments.filter((payment) => {
//             const status = String(
//                 payment.status || ""
//             ).toLowerCase();

//             return (
//                 status === "successful" ||
//                 status === "completed" ||
//                 status === "success"
//             );
//         }).length;
//     }, [payments]);

//     const pendingPayments = useMemo(() => {
//         return payments.filter((payment) => {
//             const status = String(
//                 payment.status || ""
//             ).toLowerCase();

//             return (
//                 status === "pending" ||
//                 status === "processing"
//             );
//         }).length;
//     }, [payments]);

//     const columns = [
//         {
//             key: "student_name",
//             label: "Student",
//         },
//         {
//             key: "admission_number",
//             label: "Admission No.",
//         },
//         {
//             key: "amount",
//             label: "Amount",
//         },
//         {
//             key: "method",
//             label: "Method",
//         },
//         {
//             key: "transaction_id",
//             label: "M-Pesa Receipt",
//         },
//         {
//             key: "status",
//             label: "Status",
//         },
//         {
//             key: "created_at",
//             label: "Date",
//         },
//     ];

//     return (
//         <DashboardLayout>
//             <div className="payments-page">

//                 {/* =====================================
//                     PAGE HEADER
//                 ===================================== */}

//                 <div className="payments-header">
//                     <div className="payments-title">
//                         <div className="payments-icon">
//                             💳
//                         </div>

//                         <div>
//                             <h1>Payments</h1>

//                             <p>
//                                 View and monitor school fee
//                                 payments made by students
//                                 and parents.
//                             </p>
//                         </div>
//                     </div>
//                 </div>


//                 {/* =====================================
//                     SUMMARY CARDS
//                 ===================================== */}

//                 {!loading && !error && (
//                     <div className="payment-stats">

//                         <div className="payment-stat-card">
//                             <div className="payment-stat-icon blue">
//                                 💳
//                             </div>

//                             <div>
//                                 <span>
//                                     Total Payments
//                                 </span>

//                                 <strong>
//                                     {payments.length}
//                                 </strong>
//                             </div>
//                         </div>


//                         <div className="payment-stat-card">
//                             <div className="payment-stat-icon green">
//                                 💰
//                             </div>

//                             <div>
//                                 <span>
//                                     Total Collected
//                                 </span>

//                                 <strong>
//                                     KES{" "}
//                                     {totalCollected.toLocaleString()}
//                                 </strong>
//                             </div>
//                         </div>


//                         <div className="payment-stat-card">
//                             <div className="payment-stat-icon success">
//                                 ✓
//                             </div>

//                             <div>
//                                 <span>
//                                     Successful
//                                 </span>

//                                 <strong>
//                                     {successfulPayments}
//                                 </strong>
//                             </div>
//                         </div>


//                         <div className="payment-stat-card">
//                             <div className="payment-stat-icon orange">
//                                 ⏳
//                             </div>

//                             <div>
//                                 <span>
//                                     Pending
//                                 </span>

//                                 <strong>
//                                     {pendingPayments}
//                                 </strong>
//                             </div>
//                         </div>

//                     </div>
//                 )}


//                 {/* =====================================
//                     LOADING
//                 ===================================== */}

//                 {loading && (
//                     <div className="payments-state">
//                         <div className="loading-icon">
//                             ⏳
//                         </div>

//                         <h3>
//                             Loading payments...
//                         </h3>

//                         <p>
//                             Please wait while payment
//                             records are retrieved.
//                         </p>
//                     </div>
//                 )}


//                 {/* =====================================
//                     ERROR
//                 ===================================== */}

//                 {error && (
//                     <div className="payments-error">
//                         ⚠️ {error}
//                     </div>
//                 )}


//                 {/* =====================================
//                     PAYMENT TABLE
//                 ===================================== */}

//                 {!loading && !error && (
//                     <div className="payments-table-panel">

//                         <div className="payments-table-header">
//                             <div>
//                                 <h2>
//                                     Payment Records
//                                 </h2>

//                                 <p>
//                                     {payments.length} payment
//                                     {payments.length !== 1
//                                         ? "s"
//                                         : ""}{" "}
//                                     recorded
//                                 </p>
//                             </div>

//                             <div className="records-badge">
//                                 {payments.length} Records
//                             </div>
//                         </div>

//                         {payments.length > 0 ? (
//                             <DataTable
//                                 columns={columns}
//                                 data={payments}
//                             />
//                         ) : (
//                             <div className="empty-payments">
//                                 <div>
//                                     💳
//                                 </div>

//                                 <h3>
//                                     No Payments Yet
//                                 </h3>

//                                 <p>
//                                     Payment records will
//                                     appear here once school
//                                     fee payments are made.
//                                 </p>
//                             </div>
//                         )}

//                     </div>
//                 )}

//             </div>
//         </DashboardLayout>
//     );
// };

// export default Payments;


// import { useEffect, useState } from "react";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";

// import { getPayments } from "../../api/financeAPI";

// const Payments = () => {
//     const [payments, setPayments] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");

//     useEffect(() => {
//         const loadPayments = async () => {
//             try {
//                 setLoading(true);
//                 setError("");

//                 const data = await getPayments();

//                 let paymentList = [];

//                 if (Array.isArray(data)) {
//                     paymentList = data;
//                 } else if (Array.isArray(data?.results)) {
//                     paymentList = data.results;
//                 }

//                 /*
//                  * Normalize the API response before sending it
//                  * to DataTable.
//                  *
//                  * The backend returns student as an object:
//                  *
//                  * student: {
//                  *   id,
//                  *   admission_number,
//                  *   first_name,
//                  *   last_name
//                  * }
//                  *
//                  * DataTable needs simple display values instead.
//                  */
//                 const formattedPayments = paymentList.map((payment) => {
//                     const student = payment.student;

//                     const studentName = student
//                         ? `${student.first_name || ""} ${
//                               student.last_name || ""
//                           }`.trim()
//                         : "—";

//                     const admissionNumber =
//                         student?.admission_number || "";

//                     return {
//                         ...payment,

//                         // Used by the DataTable
//                         student_name: studentName,

//                         admission_number: admissionNumber,

//                         // Keep amount as a simple value
//                         amount: Number(payment.amount || 0),

//                         // Make sure these are never objects
//                         method:
//                             typeof payment.method === "object"
//                                 ? payment.method?.name || "—"
//                                 : payment.method || "—",

//                         transaction_id:
//                             typeof payment.transaction_id === "object"
//                                 ? payment.transaction_id?.id ||
//                                   payment.transaction_id?.receipt ||
//                                   "—"
//                                 : payment.transaction_id || "—",

//                         status:
//                             typeof payment.status === "object"
//                                 ? payment.status?.name || "—"
//                                 : payment.status || "—",

//                         created_at: payment.created_at
//                             ? new Date(
//                                   payment.created_at
//                               ).toLocaleString()
//                             : "—",
//                     };
//                 });

//                 setPayments(formattedPayments);
//             } catch (error) {
//                 console.error(
//                     "Failed to load payments:",
//                     error
//                 );

//                 setError("Failed to load payments.");
//                 setPayments([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         loadPayments();
//     }, []);

//     const columns = [
//         {
//             key: "student_name",
//             label: "Student",
//         },
//         {
//             key: "admission_number",
//             label: "Admission No.",
//         },
//         {
//             key: "amount",
//             label: "Amount",
//         },
//         {
//             key: "method",
//             label: "Method",
//         },
//         {
//             key: "transaction_id",
//             label: "M-Pesa Receipt",
//         },
//         {
//             key: "status",
//             label: "Status",
//         },
//         {
//             key: "created_at",
//             label: "Date",
//         },
//     ];

//     return (
//         <DashboardLayout>
//             <div className="payments-page">

//                 <div className="dashboard-header">
//                     <h1>Payments</h1>
//                     <p>
//                         View and monitor school fee payments
//                         made by students and parents.
//                     </p>
//                 </div>

//                 {loading && (
//                     <div className="dashboard-panel">
//                         Loading payments...
//                     </div>
//                 )}

//                 {error && (
//                     <div className="form-error">
//                         {error}
//                     </div>
//                 )}

//                 {!loading && !error && (
//                     <div className="dashboard-panel">
//                         <DataTable
//                             columns={columns}
//                             data={payments}
//                         />
//                     </div>
//                 )}

//             </div>
//         </DashboardLayout>
//     );
// };

// export default Payments;



