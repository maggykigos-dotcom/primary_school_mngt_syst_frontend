import React, { useEffect, useState } from "react";
import {
    FiDollarSign,
    FiCreditCard,
    FiFileText,
    FiSmartphone,
    FiActivity,
    FiUsers,
    FiClock,
    FiCheckCircle,
    FiRefreshCw,
    FiAlertCircle,
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import { getBursarDashboard } from "../../api/financeAPI";
import "./BursarDashboard.css";

const BursarDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getBursarDashboard();
            setDashboard(data);
        } catch (err) {
            console.error("Failed to load bursar dashboard:", err);

            if (err.response?.status === 403) {
                setError(
                    "You do not have permission to view the finance dashboard."
                );
            } else if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please log in again."
                );
            } else {
                setError(
                    "Unable to load finance records. Please check that the backend is running."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    // ==========================================
    // FORMAT CURRENCY
    // ==========================================

    const formatCurrency = (amount) => {
        const value = Number(amount || 0);

        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: "KES",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value);
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-KE", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // ==========================================
    // PAYMENT METHOD LABEL
    // ==========================================

    const getPaymentMethod = (method) => {
        if (!method) {
            return "—";
        }

        const value = method.toLowerCase();

        if (value === "mpesa") {
            return "M-Pesa";
        }

        if (value === "cash") {
            return "Cash";
        }

        if (value === "bank") {
            return "Bank";
        }

        return method;
    };

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {
        if (!status) {
            return "status-pending";
        }

        switch (status.toLowerCase()) {
            case "successful":
                return "status-successful";

            case "failed":
                return "status-failed";

            case "pending":
                return "status-pending";

            default:
                return "status-pending";
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <DashboardLayout>
                <div className="bursar-dashboard">
                    <div className="bursar-loading">
                        <div className="bursar-loading-spinner">
                            <FiRefreshCw />
                        </div>

                        <h3>Loading Finance Dashboard...</h3>

                        <p>
                            Fetching the latest school fee and payment
                            records.
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <DashboardLayout>
                <div className="bursar-dashboard">
                    <div className="bursar-error">
                        <div className="bursar-error-icon">
                            <FiAlertCircle />
                        </div>

                        <h2>Unable to Load Dashboard</h2>

                        <p>{error}</p>

                        <button
                            className="bursar-retry-button"
                            onClick={loadDashboard}
                        >
                            <FiRefreshCw />
                            Try Again
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // ==========================================
    // SAFE DEFAULT DATA
    // ==========================================

    const data = dashboard || {};

    const totalFees = Number(data.total_fees || 0);
    const totalCollected = Number(data.total_collected || 0);
    const outstanding = Number(data.outstanding || 0);

    const collectionPercentage = Number(
        data.collection_percentage || 0
    );

    const mpesaCollected = Number(
        data.mpesa_collected || 0
    );

    const cashCollected = Number(
        data.cash_collected || 0
    );

    const bankCollected = Number(
        data.bank_collected || 0
    );

    const mpesaPercentage = Number(
        data.mpesa_percentage || 0
    );

    const cashPercentage = Number(
        data.cash_percentage || 0
    );

    const bankPercentage = Number(
        data.bank_percentage || 0
    );

    const recentPayments = data.recent_payments || [];

    return (
        <DashboardLayout>
            <div className="bursar-dashboard">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="bursar-dashboard-header">

                    <div>
                        <span className="bursar-header-label">
                            SCHOOL FINANCE
                        </span>

                        <h1>
                            Welcome, Bursar 👋
                        </h1>

                        <p>
                            Manage school fees, payments, statements
                            and M-Pesa transactions from one place.
                        </p>
                    </div>

                    <button
                        className="bursar-refresh-button"
                        onClick={loadDashboard}
                    >
                        <FiRefreshCw />
                        Refresh
                    </button>

                </div>

                {/* ==========================================
                    MAIN FINANCE CARDS
                ========================================== */}

                <div className="bursar-finance-grid">

                    {/* TOTAL FEES */}

                    <div className="bursar-finance-card total-fees">

                        <div className="bursar-finance-card-top">

                            <div className="bursar-finance-icon">
                                <FiDollarSign />
                            </div>

                            <span className="bursar-card-badge">
                                Fees
                            </span>

                        </div>

                        <div className="bursar-finance-card-body">

                            <p>
                                Total Fees
                            </p>

                            <h2>
                                {formatCurrency(totalFees)}
                            </h2>

                            <span>
                                Total fees recorded
                            </span>

                        </div>

                    </div>

                    {/* COLLECTED */}

                    <div className="bursar-finance-card collected-fees">

                        <div className="bursar-finance-card-top">

                            <div className="bursar-finance-icon">
                                <FiCreditCard />
                            </div>

                            <span className="bursar-card-badge">
                                Collected
                            </span>

                        </div>

                        <div className="bursar-finance-card-body">

                            <p>
                                Payments Collected
                            </p>

                            <h2>
                                {formatCurrency(totalCollected)}
                            </h2>

                            <span>
                                Successful payments
                            </span>

                        </div>

                    </div>

                    {/* OUTSTANDING */}

                    <div className="bursar-finance-card outstanding-fees">

                        <div className="bursar-finance-card-top">

                            <div className="bursar-finance-icon">
                                <FiFileText />
                            </div>

                            <span className="bursar-card-badge">
                                Balance
                            </span>

                        </div>

                        <div className="bursar-finance-card-body">

                            <p>
                                Outstanding
                            </p>

                            <h2>
                                {formatCurrency(outstanding)}
                            </h2>

                            <span>
                                Remaining fee balance
                            </span>

                        </div>

                    </div>

                    {/* MPESA */}

                    <div className="bursar-finance-card mpesa-fees">

                        <div className="bursar-finance-card-top">

                            <div className="bursar-finance-icon">
                                <FiSmartphone />
                            </div>

                            <span className="bursar-card-badge">
                                M-Pesa
                            </span>

                        </div>

                        <div className="bursar-finance-card-body">

                            <p>
                                M-Pesa Collected
                            </p>

                            <h2>
                                {formatCurrency(mpesaCollected)}
                            </h2>

                            <span>
                                Successful M-Pesa payments
                            </span>

                        </div>

                    </div>

                </div>

                {/* ==========================================
                    COLLECTION PROGRESS + PAYMENT METHODS
                ========================================== */}

                <div className="bursar-middle-grid">

                    {/* COLLECTION PROGRESS */}

                    <div className="bursar-panel collection-panel">

                        <div className="bursar-panel-header">

                            <div>
                                <span className="panel-small-title">
                                    COLLECTION
                                </span>

                                <h2>
                                    Fee Collection Progress
                                </h2>
                            </div>

                            <div className="collection-percentage">
                                {collectionPercentage.toFixed(1)}%
                            </div>

                        </div>

                        <div className="collection-progress-container">

                            <div className="collection-progress-bar">

                                <div
                                    className="collection-progress-fill"
                                    style={{
                                        width: `${Math.min(
                                            collectionPercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>

                            </div>

                        </div>

                        <div className="collection-summary">

                            <div>
                                <span className="summary-dot collected-dot"></span>

                                <div>
                                    <small>
                                        Collected
                                    </small>

                                    <strong>
                                        {formatCurrency(totalCollected)}
                                    </strong>
                                </div>
                            </div>

                            <div>
                                <span className="summary-dot outstanding-dot"></span>

                                <div>
                                    <small>
                                        Outstanding
                                    </small>

                                    <strong>
                                        {formatCurrency(outstanding)}
                                    </strong>
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* PAYMENT METHODS */}

                    <div className="bursar-panel">

                        <div className="bursar-panel-header">

                            <div>
                                <span className="panel-small-title">
                                    PAYMENT METHODS
                                </span>

                                <h2>
                                    Collection Breakdown
                                </h2>
                            </div>

                            <FiActivity className="panel-header-icon" />

                        </div>

                        <div className="payment-method-list">

                            {/* MPESA */}

                            <div className="payment-method-row">

                                <div className="payment-method-name">

                                    <div className="method-icon mpesa-method">
                                        <FiSmartphone />
                                    </div>

                                    <div>
                                        <strong>
                                            M-Pesa
                                        </strong>

                                        <span>
                                            {mpesaPercentage.toFixed(1)}%
                                        </span>
                                    </div>

                                </div>

                                <strong>
                                    {formatCurrency(mpesaCollected)}
                                </strong>

                            </div>

                            <div className="method-progress">
                                <div
                                    className="method-progress-fill mpesa-progress"
                                    style={{
                                        width: `${Math.min(
                                            mpesaPercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>

                            {/* CASH */}

                            <div className="payment-method-row">

                                <div className="payment-method-name">

                                    <div className="method-icon cash-method">
                                        <FiDollarSign />
                                    </div>

                                    <div>
                                        <strong>
                                            Cash
                                        </strong>

                                        <span>
                                            {cashPercentage.toFixed(1)}%
                                        </span>
                                    </div>

                                </div>

                                <strong>
                                    {formatCurrency(cashCollected)}
                                </strong>

                            </div>

                            <div className="method-progress">
                                <div
                                    className="method-progress-fill cash-progress"
                                    style={{
                                        width: `${Math.min(
                                            cashPercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>

                            {/* BANK */}

                            <div className="payment-method-row">

                                <div className="payment-method-name">

                                    <div className="method-icon bank-method">
                                        <FiCreditCard />
                                    </div>

                                    <div>
                                        <strong>
                                            Bank
                                        </strong>

                                        <span>
                                            {bankPercentage.toFixed(1)}%
                                        </span>
                                    </div>

                                </div>

                                <strong>
                                    {formatCurrency(bankCollected)}
                                </strong>

                            </div>

                            <div className="method-progress">
                                <div
                                    className="method-progress-fill bank-progress"
                                    style={{
                                        width: `${Math.min(
                                            bankPercentage,
                                            100
                                        )}%`,
                                    }}
                                ></div>
                            </div>

                        </div>

                    </div>

                </div>

                {/* ==========================================
                    QUICK STATISTICS
                ========================================== */}

                <div className="bursar-stat-grid">

                    <div className="bursar-stat-card">

                        <div className="bursar-stat-icon students-stat">
                            <FiUsers />
                        </div>

                        <div>
                            <span>
                                Students With Balance
                            </span>

                            <strong>
                                {data.students_with_balance || 0}
                            </strong>
                        </div>

                    </div>

                    <div className="bursar-stat-card">

                        <div className="bursar-stat-icon transactions-stat">
                            <FiActivity />
                        </div>

                        <div>
                            <span>
                                Transactions Today
                            </span>

                            <strong>
                                {data.transactions_today || 0}
                            </strong>
                        </div>

                    </div>

                    <div className="bursar-stat-card">

                        <div className="bursar-stat-icon pending-stat">
                            <FiClock />
                        </div>

                        <div>
                            <span>
                                Pending Payments
                            </span>

                            <strong>
                                {data.pending_payments || 0}
                            </strong>
                        </div>

                    </div>

                    <div className="bursar-stat-card">

                        <div className="bursar-stat-icon successful-stat">
                            <FiCheckCircle />
                        </div>

                        <div>
                            <span>
                                Successful Collection
                            </span>

                            <strong>
                                {collectionPercentage.toFixed(1)}%
                            </strong>
                        </div>

                    </div>

                </div>

                {/* ==========================================
                    RECENT PAYMENTS
                ========================================== */}

                <div className="bursar-panel recent-payments-panel">

                    <div className="bursar-panel-header">

                        <div>
                            <span className="panel-small-title">
                                TRANSACTIONS
                            </span>

                            <h2>
                                Recent Payments
                            </h2>
                        </div>

                        <span className="recent-count">
                            {recentPayments.length} recent
                        </span>

                    </div>

                    {recentPayments.length === 0 ? (

                        <div className="no-payments">

                            <FiFileText />

                            <h3>
                                No payment records found
                            </h3>

                            <p>
                                Payment transactions will appear here
                                once they are recorded.
                            </p>

                        </div>

                    ) : (

                        <div className="payments-table-wrapper">

                            <table className="bursar-payments-table">

                                <thead>

                                    <tr>
                                        <th>Student</th>
                                        <th>Admission No.</th>
                                        <th>Class</th>
                                        <th>Amount</th>
                                        <th>Method</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    {recentPayments.map((payment) => (

                                        <tr key={payment.id}>

                                            <td>

                                                <div className="student-payment-info">

                                                    <div className="student-avatar">
                                                        {payment.student_name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "S"}
                                                    </div>

                                                    <strong>
                                                        {payment.student_name || "Unknown Student"}
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>
                                                {payment.admission_number || "—"}
                                            </td>

                                            <td>
                                                {payment.school_class || "—"}
                                            </td>

                                            <td>

                                                <strong className="payment-amount">
                                                    {formatCurrency(payment.amount)}
                                                </strong>

                                            </td>

                                            <td>

                                                <span className="payment-method-badge">
                                                    {getPaymentMethod(payment.method)}
                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`payment-status ${getStatusClass(
                                                        payment.status
                                                    )}`}
                                                >
                                                    {payment.status || "Pending"}
                                                </span>

                                            </td>

                                            <td>
                                                {formatDate(payment.created_at)}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>
        </DashboardLayout>
    );
};

export default BursarDashboard;



// import React from "react";
// import {
//     FiDollarSign,
//     FiCreditCard,
//     FiFileText,
//     FiSmartphone,
// } from "react-icons/fi";

// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import "./BursarDashboard.css";

// const BursarDashboard = () => {
//     return (
//         <DashboardLayout>
//             <div className="bursar-dashboard">

//                 {/* Header */}
//                 <div className="bursar-dashboard-header">
//                     <div>
//                         <h1>Welcome, Bursar</h1>
//                         <p>
//                             Manage school fees, payments, statements and
//                             M-Pesa transactions.
//                         </p>
//                     </div>
//                 </div>

//                 {/* Finance Cards */}
//                 <div className="bursar-info-grid">

//                     <div className="bursar-info-card fees-card">
//                         <div className="bursar-card-icon">
//                             <FiDollarSign />
//                         </div>

//                         <div className="bursar-card-content">
//                             <h3>Fee Management</h3>
//                             <p>
//                                 Create and manage student fee records.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="bursar-info-card payments-card">
//                         <div className="bursar-card-icon">
//                             <FiCreditCard />
//                         </div>

//                         <div className="bursar-card-content">
//                             <h3>Payments</h3>
//                             <p>
//                                 View and record school fee payments.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="bursar-info-card statements-card">
//                         <div className="bursar-card-icon">
//                             <FiFileText />
//                         </div>

//                         <div className="bursar-card-content">
//                             <h3>Fee Statements</h3>
//                             <p>
//                                 Review student fee balances and statements.
//                             </p>
//                         </div>
//                     </div>

//                     <div className="bursar-info-card mpesa-card">
//                         <div className="bursar-card-icon">
//                             <FiSmartphone />
//                         </div>

//                         <div className="bursar-card-content">
//                             <h3>M-Pesa</h3>
//                             <p>
//                                 Monitor M-Pesa payment transactions.
//                             </p>
//                         </div>
//                     </div>

//                 </div>

//             </div>
//         </DashboardLayout>
//     );
// };

// export default BursarDashboard;

