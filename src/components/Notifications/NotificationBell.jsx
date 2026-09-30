import React, { useEffect, useState } from "react";

import {
    getNotifications,
    markNotificationAsRead,
} from "../../api/communicationAPI";

import "./NotificationBell.css";

function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [markingId, setMarkingId] = useState(null);

    // ==========================================
    // LOAD NOTIFICATIONS
    // ==========================================

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);

            const data = await getNotifications();

            if (Array.isArray(data)) {
                setNotifications(data);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error(
                "Failed to load notifications:",
                error
            );

            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // UNREAD COUNT
    // ==========================================

    const unreadCount = notifications.filter(
        (notification) => !notification.is_read
    ).length;

    // ==========================================
    // MARK NOTIFICATION AS READ
    // ==========================================

    const handleMarkAsRead = async (notificationId) => {
        if (!notificationId) {
            console.error(
                "Cannot mark notification as read: missing ID"
            );
            return;
        }

        try {
            setMarkingId(notificationId);

            // Send request to Django
            await markNotificationAsRead(notificationId);

            // Immediately update the notification on screen
            setNotifications((currentNotifications) =>
                currentNotifications.map((notification) =>
                    notification.id === notificationId
                        ? {
                              ...notification,
                              is_read: true,
                          }
                        : notification
                )
            );
        } catch (error) {
            console.error(
                "Failed to mark notification as read:",
                error
            );

            if (error.response) {
                console.error(
                    "Server response:",
                    error.response.data
                );
            }
        } finally {
            setMarkingId(null);
        }
    };

    // ==========================================
    // CLICK NOTIFICATION
    // ==========================================

    const handleNotificationClick = (notification) => {
        // Do not automatically mark as read here.
        //
        // The user can explicitly click
        // "Mark as read".
        //
        // This prevents accidental marking.
        console.log(
            "Notification selected:",
            notification.id
        );
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="notification-wrapper">

            {/* Notification Bell */}
            <button
                className="notification-button"
                onClick={() => setOpen((current) => !current)}
                type="button"
                aria-label="Notifications"
            >
                🔔

                {unreadCount > 0 && (
                    <span className="notification-count">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {open && (
                <div className="notification-dropdown">

                    <div className="notification-header">
                        <h3>Notifications</h3>

                        {unreadCount > 0 && (
                            <span className="notification-unread-total">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="notification-loading">
                            Loading notifications...
                        </div>
                    )}

                    {/* No notifications */}
                    {!loading &&
                        notifications.length === 0 && (
                            <div className="notification-empty">
                                <span>🔕</span>
                                <p>No notifications.</p>
                            </div>
                        )}

                    {/* Notifications */}
                    {!loading &&
                        notifications.length > 0 && (
                            <div className="notification-list">

                                {notifications.map(
                                    (notification) => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${
                                                notification.is_read
                                                    ? "read"
                                                    : "unread"
                                            }`}
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification
                                                )
                                            }
                                        >

                                            {/* Top row */}
                                            <div className="notification-item-top">

                                                <strong>
                                                    {notification.title ||
                                                        "Notification"}
                                                </strong>

                                                {!notification.is_read && (
                                                    <span className="notification-new">
                                                        New
                                                    </span>
                                                )}

                                            </div>

                                            {/* Message */}
                                            <p>
                                                {notification.message ||
                                                    ""}
                                            </p>

                                            {/* Date */}
                                            <small>
                                                {notification.created_at
                                                    ? new Date(
                                                          notification.created_at
                                                      ).toLocaleString()
                                                    : ""}
                                            </small>

                                            {/* Mark as read */}
                                            {!notification.is_read && (
                                                <button
                                                    type="button"
                                                    className="mark-read-button"
                                                    disabled={
                                                        markingId ===
                                                        notification.id
                                                    }
                                                    onClick={(event) => {
                                                        event.stopPropagation();

                                                        handleMarkAsRead(
                                                            notification.id
                                                        );
                                                    }}
                                                >
                                                    {markingId ===
                                                    notification.id
                                                        ? "Marking..."
                                                        : "Mark as read"}
                                                </button>
                                            )}

                                            {/* Already read */}
                                            {notification.is_read && (
                                                <span className="notification-read-label">
                                                    ✓ Read
                                                </span>
                                            )}

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                </div>
            )}
        </div>
    );
}

export default NotificationBell;





// import React, { useEffect, useState } from "react";

// import {
//     getNotifications,
//     markNotificationAsRead,
// } from "../../api/communicationAPI";

// import "./NotificationBell.css";

// function NotificationBell() {
//     const [notifications, setNotifications] = useState([]);
//     const [open, setOpen] = useState(false);

//     useEffect(() => {
//         loadNotifications();
//     }, []);

//     const loadNotifications = async () => {
//         try {
//             const response = await getNotifications();

//             /*
//              * Support different API response formats:
//              *
//              * 1. Direct array:
//              *    [...]
//              *
//              * 2. Paginated response:
//              *    { results: [...] }
//              *
//              * 3. Axios response:
//              *    { data: [...] }
//              */

//             const data = response?.data;

//             if (Array.isArray(data)) {
//                 setNotifications(data);
//             } else if (Array.isArray(data?.results)) {
//                 setNotifications(data.results);
//             } else if (Array.isArray(data?.data)) {
//                 setNotifications(data.data);
//             } else {
//                 console.warn(
//                     "Unexpected notifications response:",
//                     response
//                 );
//                 setNotifications([]);
//             }
//         } catch (error) {
//             console.error(
//                 "Failed to load notifications:",
//                 error
//             );

//             setNotifications([]);
//         }
//     };

//     const unreadCount = notifications.filter(
//         (notification) => !notification.is_read
//     ).length;

//     const handleNotificationClick = async (notification) => {
//         if (!notification.is_read) {
//             try {
//                 await markNotificationAsRead(notification.id);

//                 setNotifications((currentNotifications) =>
//                     currentNotifications.map((item) =>
//                         item.id === notification.id
//                             ? {
//                                   ...item,
//                                   is_read: true,
//                               }
//                             : item
//                     )
//                 );
//             } catch (error) {
//                 console.error(
//                     "Failed to mark notification as read:",
//                     error
//                 );
//             }
//         }
//     };

//     return (
//         <div className="notification-wrapper">
//             <button
//                 className="notification-button"
//                 onClick={() => setOpen(!open)}
//                 type="button"
//             >
//                 🔔

//                 {unreadCount > 0 && (
//                     <span className="notification-count">
//                         {unreadCount}
//                     </span>
//                 )}
//             </button>

//             {open && (
//                 <div className="notification-dropdown">
//                     <h3>Notifications</h3>

//                     {notifications.length === 0 ? (
//                         <p>No notifications.</p>
//                     ) : (
//                         notifications.map((notification) => (
//                             <div
//                                 key={notification.id}
//                                 className={`notification-item ${
//                                     notification.is_read
//                                         ? "read"
//                                         : "unread"
//                                 }`}
//                                 onClick={() =>
//                                     handleNotificationClick(
//                                         notification
//                                     )
//                                 }
//                             >
//                                 <strong>
//                                     {notification.title}
//                                 </strong>

//                                 <p>
//                                     {notification.message}
//                                 </p>

//                                 <small>
//                                     {notification.created_at
//                                         ? new Date(
//                                               notification.created_at
//                                           ).toLocaleString()
//                                         : ""}
//                                 </small>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default NotificationBell;


