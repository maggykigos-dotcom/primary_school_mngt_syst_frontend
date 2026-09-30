import { useEffect, useState } from "react";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import {
    getNotifications,
} from "../../api/communicationAPI";

import "./Notifications.css";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getNotifications();

            // Support both:
            // response.data
            // and APIs that return the array directly
            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setNotifications(data);
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );

            setError(
                "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "";
        }

        try {
            return new Date(date).toLocaleString(
                [],
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                }
            );
        } catch {
            return "";
        }
    };

    // ==========================================
    // CHECK READ STATUS
    // ==========================================

    const isUnread = (notification) => {
        return (
            notification.is_read === false ||
            notification.read === false
        );
    };

    // ==========================================
    // COUNT UNREAD
    // ==========================================

    const unreadCount = notifications.filter(
        (notification) =>
            isUnread(notification)
    ).length;

    return (
        <DashboardLayout>

            <div className="notifications-page">

                {/* =================================
                    HEADER
                ================================== */}

                <div className="notifications-header">

                    <div className="notifications-heading">

                        <div className="notifications-icon">
                            🔔
                        </div>

                        <div>
                            <h1>Notifications</h1>

                            <p>
                                Stay updated with important
                                school information and alerts.
                            </p>
                        </div>

                    </div>

                    <div className="notifications-actions">

                        {unreadCount > 0 && (
                            <span className="unread-count">
                                {unreadCount} unread
                            </span>
                        )}

                        <button
                            className="notifications-refresh"
                            onClick={loadNotifications}
                            disabled={loading}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                </div>

                {/* =================================
                    ERROR
                ================================== */}

                {error && (
                    <div className="notification-error">
                        {error}
                    </div>
                )}

                {/* =================================
                    LOADING
                ================================== */}

                {loading ? (

                    <div className="notifications-empty">

                        <div className="notification-empty-icon">
                            🔔
                        </div>

                        <h3>
                            Loading notifications...
                        </h3>

                        <p>
                            Please wait while we get your
                            latest notifications.
                        </p>

                    </div>

                ) : notifications.length === 0 ? (

                    /* =================================
                       EMPTY STATE
                    ================================== */

                    <div className="notifications-empty">

                        <div className="notification-empty-icon">
                            🔕
                        </div>

                        <h3>
                            No notifications yet
                        </h3>

                        <p>
                            You're all caught up. New
                            notifications will appear here.
                        </p>

                    </div>

                ) : (

                    /* =================================
                       NOTIFICATION LIST
                    ================================== */

                    <div className="notifications-list">

                        {notifications.map(
                            (notification) => {

                                const unread =
                                    isUnread(
                                        notification
                                    );

                                return (
                                    <div
                                        key={
                                            notification.id
                                        }
                                        className={`notification-card ${
                                            unread
                                                ? "unread"
                                                : ""
                                        }`}
                                    >

                                        <div className="notification-card-icon">
                                            {unread
                                                ? "🔔"
                                                : "✓"}
                                        </div>

                                        <div className="notification-content">

                                            <div className="notification-title-row">

                                                <h3>
                                                    {
                                                        notification.title
                                                    }
                                                </h3>

                                                {unread && (
                                                    <span className="unread-badge">
                                                        New
                                                    </span>
                                                )}

                                            </div>

                                            <p>
                                                {
                                                    notification.message
                                                }
                                            </p>

                                            <div className="notification-footer">

                                                <span>
                                                    {formatDate(
                                                        notification.created_at ||
                                                        notification.timestamp ||
                                                        notification.date
                                                    )}
                                                </span>

                                                {unread && (
                                                    <button
                                                        type="button"
                                                        className="mark-read-btn"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>

                )}

            </div>

        </DashboardLayout>
    );
};

export default Notifications;

