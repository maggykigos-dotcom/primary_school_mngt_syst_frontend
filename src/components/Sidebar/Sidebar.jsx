import React, { useState, useContext } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import {
    FiHome,
    FiUsers,
    FiUser,
    FiBookOpen,
    FiClipboard,
    FiFileText,
    FiBarChart2,
    FiClock,
    FiDollarSign,
    FiMessageSquare,
    FiBell,
    FiChevronRight,
    FiLogOut,
    FiUserPlus,
    FiPlusCircle,
    FiCalendar,
} from "react-icons/fi";

import "./Sidebar.css";

const Sidebar = ({
    open = false,
    onClose,
    collapsed = false,
    onToggleCollapse,
}) => {
    const [openMenu, setOpenMenu] = useState(null);

    const navigate = useNavigate();

    const { user, logout } = useContext(AuthContext);

    const userRole = user?.role;

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // =========================================================
    // ADMIN SIDEBAR
    // =========================================================

    const adminMenu = [
        {
            type: "link",
            label: "Dashboard",
            icon: <FiHome />,
            path: "/admin",
        },

        {
            type: "dropdown",
            label: "Students",
            icon: <FiUsers />,
            children: [
                {
                    label: "Students",
                    path: "/admin/students",
                    icon: <FiUsers />,
                },
                {
                    label: "Add Student",
                    path: "/admin/students/add",
                    icon: <FiUserPlus />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Teachers",
            icon: <FiUser />,
            children: [
                {
                    label: "Teachers",
                    path: "/admin/teachers",
                    icon: <FiUser />,
                },
                {
                    label: "Add Teacher",
                    path: "/admin/teachers/add",
                    icon: <FiUserPlus />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Parents",
            icon: <FiUsers />,
            children: [
                {
                    label: "Parents",
                    path: "/admin/parents",
                    icon: <FiUsers />,
                },
                {
                    label: "Add Parent",
                    path: "/admin/parents/add",
                    icon: <FiUserPlus />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Academics",
            icon: <FiBookOpen />,
            children: [
                {
                    label: "Attendance",
                    path: "/admin/attendance",
                    icon: <FiClipboard />,
                },
                {
                    label: "Add Attendance",
                    path: "/attendance/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Assignments",
                    path: "/admin/homework",
                    icon: <FiFileText />,
                },
                {
                    label: "Add Assignment",
                    path: "/assignments/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Results",
                    path: "/admin/results",
                    icon: <FiBarChart2 />,
                },
                {
                    label: "Add Result",
                    path: "/results/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Grades",
                    path: "/admin/grades/add",
                    icon: <FiBookOpen />,
                },
                {
                    label: "Classes",
                    path: "/admin/classes",
                    icon: <FiBookOpen />,
                },
                {
                    label: "Add Class",
                    path: "/admin/classes/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Subjects",
                    path: "/admin/subjects",
                    icon: <FiBookOpen />,
                },
                {
                    label: "Add Subject",
                    path: "/admin/subjects/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Timetable",
                    path: "/admin/timetable",
                    icon: <FiCalendar />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Finance",
            icon: <FiDollarSign />,
            children: [
                {
                    label: "Fees",
                    path: "/admin/fees",
                    icon: <FiDollarSign />,
                },
                {
                    label: "Add Fee",
                    path: "/fees/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Payments",
                    path: "/admin/payments",
                    icon: <FiDollarSign />,
                },
                {
                    label: "Add Payment",
                    path: "/admin/payments/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "M-Pesa",
                    path: "/mpesa",
                    icon: <FiDollarSign />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Communication",
            icon: <FiMessageSquare />,
            children: [
                {
                    label: "Messages",
                    path: "/admin/messages",
                    icon: <FiMessageSquare />,
                },
                {
                    label: "Notifications",
                    path: "/notifications",
                    icon: <FiBell />,
                },
                {
                    label: "New Conversation",
                    path: "/conversations/create",
                    icon: <FiPlusCircle />,
                },
            ],
        },
    ];

    // =========================================================
    // TEACHER SIDEBAR
    // =========================================================

    const teacherMenu = [
        {
            type: "link",
            label: "Dashboard",
            icon: <FiHome />,
            path: "/teacher",
        },

        {
            type: "dropdown",
            label: "Attendance",
            icon: <FiClipboard />,
            children: [
                {
                    label: "Attendance",
                    path: "/teacher/attendance",
                    icon: <FiClipboard />,
                },
                {
                    label: "Add Attendance",
                    path: "/attendance/add",
                    icon: <FiPlusCircle />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Assignments",
            icon: <FiBookOpen />,
            children: [
                {
                    label: "Assignments",
                    path: "/teacher/homework",
                    icon: <FiFileText />,
                },
                {
                    label: "Add Assignment",
                    path: "/assignments/add",
                    icon: <FiPlusCircle />,
                },
            ],
        },

        {
            type: "dropdown",
            label: "Results",
            icon: <FiBarChart2 />,
            children: [
                {
                    label: "Results",
                    path: "/teacher/results",
                    icon: <FiBarChart2 />,
                },
                {
                    label: "Add Result",
                    path: "/results/add",
                    icon: <FiPlusCircle />,
                },
            ],
        },

        {
            type: "link",
            label: "Timetable",
            icon: <FiClock />,
            path: "/teacher/timetable",
        },

        {
            type: "dropdown",
            label: "Communication",
            icon: <FiMessageSquare />,
            children: [
                {
                    label: "Messages",
                    path: "/teacher/messages",
                    icon: <FiMessageSquare />,
                },
                {
                    label: "Notifications",
                    path: "/notifications",
                    icon: <FiBell />,
                },
                {
                    label: "New Conversation",
                    path: "/conversations/create",
                    icon: <FiPlusCircle />,
                },
            ],
        },
    ];

    // =========================================================
    // PARENT SIDEBAR
    // =========================================================

    const parentMenu = [
        {
            type: "link",
            label: "Dashboard",
            icon: <FiHome />,
            path: "/parent",
        },

        {
            type: "link",
            label: "Attendance",
            icon: <FiClipboard />,
            path: "/parent/attendance",
        },

        {
            type: "link",
            label: "Homework",
            icon: <FiBookOpen />,
            path: "/parent/homework",
        },

        {
            type: "link",
            label: "Results",
            icon: <FiBarChart2 />,
            path: "/parent/results",
        },

        // =====================================================
        // NEW: TERM PERFORMANCE
        // =====================================================

        {
            type: "link",
            label: "Term Performance",
            icon: <FiBarChart2 />,
            path: "/parent/performance",
        },

        {
            type: "link",
            label: "Timetable",
            icon: <FiClock />,
            path: "/parent/timetable",
        },

        {
            type: "link",
            label: "Fees",
            icon: <FiDollarSign />,
            path: "/parent/fees",
        },

        {
            type: "dropdown",
            label: "Communication",
            icon: <FiMessageSquare />,
            children: [
                {
                    label: "Messages",
                    path: "/parent/messages",
                    icon: <FiMessageSquare />,
                },
                {
                    label: "Notifications",
                    path: "/notifications",
                    icon: <FiBell />,
                },
                {
                    label: "New Conversation",
                    path: "/conversations/create",
                    icon: <FiPlusCircle />,
                },
            ],
        },
    ];

    // =========================================================
    // STUDENT SIDEBAR
    // =========================================================

    const studentMenu = [
        {
            type: "link",
            label: "Dashboard",
            icon: <FiHome />,
            path: "/student",
        },

        {
            type: "link",
            label: "Homework",
            icon: <FiBookOpen />,
            path: "/student/homework",
        },

        {
            type: "link",
            label: "Attendance",
            icon: <FiClipboard />,
            path: "/student/attendance",
        },

        {
            type: "link",
            label: "Results",
            icon: <FiBarChart2 />,
            path: "/student/results",
        },

        {
            type: "link",
            label: "Timetable",
            icon: <FiClock />,
            path: "/student/timetable",
        },

        {
            type: "dropdown",
            label: "Communication",
            icon: <FiMessageSquare />,
            children: [
                {
                    label: "Messages",
                    path: "/student/messages",
                    icon: <FiMessageSquare />,
                },
                {
                    label: "Notifications",
                    path: "/notifications",
                    icon: <FiBell />,
                },
            ],
        },
    ];
    // =========================================================
    // BURSAR SIDEBAR
    // =========================================================

    const bursarMenu = [
        {
            type: "link",
            label: "Dashboard",
            icon: <FiHome />,
            path: "/bursar",
        },

        {
            type: "dropdown",
            label: "Finance",
            icon: <FiDollarSign />,
            children: [
                {
                    label: "Fees",
                    path: "/bursar/fees",
                    icon: <FiDollarSign />,
                },
                {
                    label: "Add Fee",
                    path: "/bursar/fees/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Payments",
                    path: "/bursar/payments",
                    icon: <FiDollarSign />,
                },
                {
                    label: "Add Payment",
                    path: "/bursar/payments/add",
                    icon: <FiPlusCircle />,
                },
                {
                    label: "Fee Statements",
                    path: "/bursar/statements",
                    icon: <FiFileText />,
                },
                {
                    label: "M-Pesa",
                    path: "/bursar/mpesa",
                    icon: <FiDollarSign />,
                },
            ],
        },


            {
                type: "dropdown",
                label: "Communication",
                icon: <FiMessageSquare />,
                children: [
                    {
                        label: "Messages",
                        path: "/bursar/messages",
                        icon: <FiMessageSquare />,
                    },
                    {
                        label: "Create Conversation",
                        path: "/bursar/conversations/create",
                        icon: <FiPlusCircle />,
                    },
                ],
            },

        
        

        {
            type: "link",
            label: "Notifications",
            icon: <FiBell />,
            path: "/notifications",
        },
    ];
    // =========================================================
    // SELECT MENU BASED ON ROLE
    // =========================================================

    let menu = [];

    switch (userRole) {
        case "admin":
            menu = adminMenu;
            break;

        case "teacher":
            menu = teacherMenu;
            break;

        case "parent":
            menu = parentMenu;
            break;

        case "student":
            menu = studentMenu;
            break;

        case "bursar":
            menu = bursarMenu;
            break; 

        default:
            menu = [];
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <aside
            className={`sidebar
                ${open ? "sidebar-open" : ""}
                ${collapsed ? "sidebar-collapsed" : ""}
            `}
        >
            {/* =====================================================
                HEADER
            ===================================================== */}

            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <span className="sidebar-brand-icon">
                        <FiBookOpen />
                    </span>

                    <div className="sidebar-brand-text">
                        <h2>School Portal</h2>

                        <span className="sidebar-role">
                            {userRole
                                ? userRole.charAt(0).toUpperCase() +
                                  userRole.slice(1)
                                : ""}
                        </span>
                    </div>
                </div>

                {/* Desktop collapse button */}

                {onToggleCollapse && (
                    <button
                        type="button"
                        className="sidebar-collapse"
                        onClick={onToggleCollapse}
                        aria-label={
                            collapsed
                                ? "Expand sidebar"
                                : "Collapse sidebar"
                        }
                    >
                        <FiChevronRight
                            className={
                                collapsed
                                    ? "collapse-icon"
                                    : "collapse-icon collapse-icon-open"
                            }
                        />
                    </button>
                )}

                {/* Mobile close button */}

                {onClose && (
                    <button
                        type="button"
                        className="sidebar-close"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* =====================================================
                NAVIGATION
            ===================================================== */}

            <nav className="sidebar-nav">
                {menu.map((item, index) => {
                    // =================================================
                    // NORMAL LINK
                    // =================================================

                    if (item.type === "link") {
                        return (
                            <NavLink
                                key={index}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive
                                        ? "sidebar-link active"
                                        : "sidebar-link"
                                }
                                onClick={() => {
                                    if (onClose) {
                                        onClose();
                                    }
                                }}
                            >
                                <span className="sidebar-icon">
                                    {item.icon}
                                </span>

                                <span className="sidebar-label">
                                    {item.label}
                                </span>
                            </NavLink>
                        );
                    }

                    // =================================================
                    // DROPDOWN
                    // =================================================

                    const isOpen = openMenu === item.label;

                    return (
                        <div
                            className="sidebar-menu"
                            key={index}
                        >
                            <button
                                type="button"
                                className={
                                    isOpen
                                        ? "sidebar-menu-button active"
                                        : "sidebar-menu-button"
                                }
                                onClick={() =>
                                    toggleMenu(item.label)
                                }
                            >
                                <span className="sidebar-icon">
                                    {item.icon}
                                </span>

                                <span className="sidebar-label">
                                    {item.label}
                                </span>

                                <span
                                    className={
                                        isOpen
                                            ? "sidebar-arrow arrow-open"
                                            : "sidebar-arrow"
                                    }
                                >
                                    <FiChevronRight />
                                </span>
                            </button>

                            {/* =================================================
                                CHILDREN
                            ================================================= */}

                            {isOpen && (
                                <div className="sidebar-submenu">
                                    {item.children.map(
                                        (child, childIndex) => (
                                            <NavLink
                                                key={childIndex}
                                                to={child.path}
                                                className={({ isActive }) =>
                                                    isActive
                                                        ? "sidebar-submenu-link active"
                                                        : "sidebar-submenu-link"
                                                }
                                                onClick={() => {
                                                    if (onClose) {
                                                        onClose();
                                                    }
                                                }}
                                            >
                                                <span className="submenu-icon">
                                                    {child.icon}
                                                </span>

                                                <span className="submenu-label">
                                                    {child.label}
                                                </span>
                                            </NavLink>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <div className="sidebar-footer">
                <button
                    type="button"
                    className="logout-button"
                    onClick={handleLogout}
                >
                    <span className="logout-icon">
                        <FiLogOut />
                    </span>

                    <span className="logout-label">
                        Logout
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;






// import React, { useState, useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import {
//   FiHome,
//   FiUsers,
//   FiUser,
//   FiBookOpen,
//   FiClipboard,
//   FiFileText,
//   FiBarChart2,
//   FiClock,
//   FiDollarSign,
//   FiMessageSquare,
//   FiBell,
//   FiChevronRight,
//   FiLogOut,
//   FiUserPlus,
//   FiPlusCircle,
//   FiCalendar,
// } from "react-icons/fi";
// import "./Sidebar.css";

// const Sidebar = ({
//   open = false,
//   onClose,
//   collapsed = false,
//   onToggleCollapse,
// }) => {
//   const [openMenu, setOpenMenu] = useState(null);

//   const navigate = useNavigate();
//   const { user, logout } = useContext(AuthContext);

//   const userRole = user?.role;

//   const toggleMenu = (menu) => {
//     setOpenMenu(openMenu === menu ? null : menu);
//   };

//   // =========================================================
//   // ADMIN SIDEBAR
//   // =========================================================

//   const adminMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: <FiHome />,
//       path: "/admin",
//     },

//     {
//       type: "dropdown",
//       label: "Students",
//       icon: <FiUsers />,
//       children: [
//         {
//           label: "Students",
//           path: "/admin/students",
//           icon: <FiUsers />,
//         },
//         {
//           label: "Add Student",
//           path: "/admin/students/add",
//           icon: <FiUserPlus />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Teachers",
//       icon: <FiUser />,
//       children: [
//         {
//           label: "Teachers",
//           path: "/admin/teachers",
//           icon: <FiUser />,
//         },
//         {
//           label: "Add Teacher",
//           path: "/admin/teachers/add",
//           icon: <FiUserPlus />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Parents",
//       icon: <FiUsers />,
//       children: [
//         {
//           label: "Parents",
//           path: "/admin/parents",
//           icon: <FiUsers />,
//         },
//         {
//           label: "Add Parent",
//           path: "/admin/parents/add",
//           icon: <FiUserPlus />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Academics",
//       icon: <FiBookOpen />,
//       children: [
//         {
//           label: "Attendance",
//           path: "/admin/attendance",
//           icon: <FiClipboard />,
//         },
//         {
//           label: "Add Attendance",
//           path: "/attendance/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Assignments",
//           path: "/admin/homework",
//           icon: <FiFileText />,
//         },
//         {
//           label: "Add Assignment",
//           path: "/assignments/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Results",
//           path: "/admin/results",
//           icon: <FiBarChart2 />,
//         },
//         {
//           label: "Add Result",
//           path: "/results/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Grades",
//           path: "/admin/grades/add",
//           icon: <FiBookOpen />,
//         },
//         {
//           label: "Classes",
//           path: "/admin/classes",
//           icon: <FiBookOpen />,
//         },
//         {
//           label: "Add Class",
//           path: "/admin/classes/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Subjects",
//           path: "/admin/subjects",
//           icon: <FiBookOpen />,
//         },
//         {
//           label: "Add Subject",
//           path: "/admin/subjects/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Timetable",
//           path: "/admin/timetable",
//           icon: <FiCalendar />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Finance",
//       icon: <FiDollarSign />,
//       children: [
//         {
//           label: "Fees",
//           path: "/admin/fees",
//           icon: <FiDollarSign />,
//         },
//         {
//           label: "Add Fee",
//           path: "/fees/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "Payments",
//           path: "/admin/payments",
//           icon: <FiDollarSign />,
//         },
//         {
//           label: "Add Payment",
//           path: "/admin/payments/add",
//           icon: <FiPlusCircle />,
//         },
//         {
//           label: "M-Pesa",
//           path: "/mpesa",
//           icon: <FiDollarSign />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: <FiMessageSquare />,
//       children: [
//         {
//           label: "Messages",
//           path: "/admin/messages",
//           icon: <FiMessageSquare />,
//         },
//         {
//           label: "Notifications",
//           path: "/notifications",
//           icon: <FiBell />,
//         },
//         {
//           label: "New Conversation",
//           path: "/conversations/create",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },
//   ];

//   // =========================================================
//   // TEACHER SIDEBAR
//   // =========================================================

//   const teacherMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: <FiHome />,
//       path: "/teacher",
//     },

//     {
//       type: "dropdown",
//       label: "Attendance",
//       icon: <FiClipboard />,
//       children: [
//         {
//           label: "Attendance",
//           path: "/teacher/attendance",
//           icon: <FiClipboard />,
//         },
//         {
//           label: "Add Attendance",
//           path: "/attendance/add",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Assignments",
//       icon: <FiBookOpen />,
//       children: [
//         {
//           label: "Assignments",
//           path: "/teacher/homework",
//           icon: <FiFileText />,
//         },
//         {
//           label: "Add Assignment",
//           path: "/assignments/add",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Results",
//       icon: <FiBarChart2 />,
//       children: [
//         {
//           label: "Results",
//           path: "/teacher/results",
//           icon: <FiBarChart2 />,
//         },
//         {
//           label: "Add Result",
//           path: "/results/add",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },

//     // VIEW ONLY
//     {
//       type: "link",
//       label: "Timetable",
//       icon: <FiClock />,
//       path: "/teacher/timetable",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: <FiMessageSquare />,
//       children: [
//         {
//           label: "Messages",
//           path: "/teacher/messages",
//           icon: <FiMessageSquare />,
//         },
//         {
//           label: "Notifications",
//           path: "/notifications",
//           icon: <FiBell />,
//         },
//         {
//           label: "New Conversation",
//           path: "/conversations/create",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },
//   ];

//   // =========================================================
//   // PARENT SIDEBAR
//   // =========================================================

//   const parentMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: <FiHome />,
//       path: "/parent",
//     },

//     {
//       type: "link",
//       label: "Attendance",
//       icon: <FiClipboard />,
//       path: "/parent/attendance",
//     },

//     {
//       type: "link",
//       label: "Homework",
//       icon: <FiBookOpen />,
//       path: "/parent/homework",
//     },

//     {
//       type: "link",
//       label: "Results",
//       icon: <FiBarChart2 />,
//       path: "/parent/results",
//     },

//     {
//       type: "link",
//       label: "Timetable",
//       icon: <FiClock />,
//       path: "/parent/timetable",
//     },

//     {
//       type: "link",
//       label: "Fees",
//       icon: <FiDollarSign />,
//       path: "/parent/fees",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: <FiMessageSquare />,
//       children: [
//         {
//           label: "Messages",
//           path: "/parent/messages",
//           icon: <FiMessageSquare />,
//         },
//         {
//           label: "Notifications",
//           path: "/notifications",
//           icon: <FiBell />,
//         },
//         {
//           label: "New Conversation",
//           path: "/conversations/create",
//           icon: <FiPlusCircle />,
//         },
//       ],
//     },
//   ];

//   // =========================================================
//   // STUDENT SIDEBAR
//   // =========================================================

//   const studentMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: <FiHome />,
//       path: "/student",
//     },

//     {
//       type: "link",
//       label: "Homework",
//       icon: <FiBookOpen />,
//       path: "/student/homework",
//     },

//     {
//       type: "link",
//       label: "Attendance",
//       icon: <FiClipboard />,
//       path: "/student/attendance",
//     },

//     {
//       type: "link",
//       label: "Results",
//       icon: <FiBarChart2 />,
//       path: "/student/results",
//     },

//     // VIEW ONLY
//     {
//       type: "link",
//       label: "Timetable",
//       icon: <FiClock />,
//       path: "/student/timetable",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: <FiMessageSquare />,
//       children: [
//         {
//           label: "Messages",
//           path: "/student/messages",
//           icon: <FiMessageSquare />,
//         },
//         {
//           label: "Notifications",
//           path: "/notifications",
//           icon: <FiBell />,
//         },
//         // NO "New Conversation" for students
//       ],
//     },
//   ];

//   // =========================================================
//   // SELECT MENU BASED ON ROLE
//   // =========================================================

//   let menu = [];

//   switch (userRole) {
//     case "admin":
//       menu = adminMenu;
//       break;

//     case "teacher":
//       menu = teacherMenu;
//       break;

//     case "parent":
//       menu = parentMenu;
//       break;

//     case "student":
//       menu = studentMenu;
//       break;

//     default:
//       menu = [];
//   }

//   // =========================================================
//   // LOGOUT
//   // =========================================================

//   const handleLogout = () => {
//     logout();
//     navigate("/login", { replace: true });
//   };

//   // =========================================================
//   // RENDER
//   // =========================================================

//   return (
//     <aside
//       className={`sidebar
//         ${open ? "sidebar-open" : ""}
//         ${collapsed ? "sidebar-collapsed" : ""}
//       `}
//     >
//       {/* =====================================================
//           HEADER
//           ===================================================== */}

//       <div className="sidebar-header">
//         <div className="sidebar-brand">
//           <span className="sidebar-brand-icon">
//             <FiBookOpen />
//           </span>

//           <div className="sidebar-brand-text">
//             <h2>School Portal</h2>

//             <span className="sidebar-role">
//               {userRole
//                 ? userRole.charAt(0).toUpperCase() +
//                   userRole.slice(1)
//                 : ""}
//             </span>
//           </div>
//         </div>

//         {/* Desktop collapse button */}
//         {onToggleCollapse && (
//           <button
//             type="button"
//             className="sidebar-collapse"
//             onClick={onToggleCollapse}
//             aria-label={
//               collapsed
//                 ? "Expand sidebar"
//                 : "Collapse sidebar"
//             }
//           >
//             <FiChevronRight
//               className={
//                 collapsed
//                   ? "collapse-icon"
//                   : "collapse-icon collapse-icon-open"
//               }
//             />
//           </button>
//         )}

//         {/* Mobile close button */}
//         {onClose && (
//           <button
//             type="button"
//             className="sidebar-close"
//             onClick={onClose}
//             aria-label="Close sidebar"
//           >
//             ×
//           </button>
//         )}
//       </div>

//       {/* =====================================================
//           NAVIGATION
//           ===================================================== */}

//       <nav className="sidebar-nav">
//         {menu.map((item, index) => {
//           // =================================================
//           // NORMAL LINK
//           // =================================================

//           if (item.type === "link") {
//             return (
//               <NavLink
//                 key={index}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   isActive
//                     ? "sidebar-link active"
//                     : "sidebar-link"
//                 }
//                 onClick={() => {
//                   if (onClose) {
//                     onClose();
//                   }
//                 }}
//               >
//                 <span className="sidebar-icon">
//                   {item.icon}
//                 </span>

//                 <span className="sidebar-label">
//                   {item.label}
//                 </span>
//               </NavLink>
//             );
//           }

//           // =================================================
//           // DROPDOWN
//           // =================================================

//           const isOpen = openMenu === item.label;

//           return (
//             <div
//               className="sidebar-menu"
//               key={index}
//             >
//               <button
//                 type="button"
//                 className={
//                   isOpen
//                     ? "sidebar-menu-button active"
//                     : "sidebar-menu-button"
//                 }
//                 onClick={() =>
//                   toggleMenu(item.label)
//                 }
//               >
//                 <span className="sidebar-icon">
//                   {item.icon}
//                 </span>

//                 <span className="sidebar-label">
//                   {item.label}
//                 </span>

//                 <span
//                   className={
//                     isOpen
//                       ? "sidebar-arrow arrow-open"
//                       : "sidebar-arrow"
//                   }
//                 >
//                   <FiChevronRight />
//                 </span>
//               </button>

//               {/* =================================================
//                   CHILDREN
//                   ================================================= */}

//               {isOpen && (
//                 <div className="sidebar-submenu">
//                   {item.children.map(
//                     (child, childIndex) => (
//                       <NavLink
//                         key={childIndex}
//                         to={child.path}
//                         className={({ isActive }) =>
//                           isActive
//                             ? "sidebar-submenu-link active"
//                             : "sidebar-submenu-link"
//                         }
//                         onClick={() => {
//                           if (onClose) {
//                             onClose();
//                           }
//                         }}
//                       >
//                         <span className="submenu-icon">
//                           {child.icon}
//                         </span>

//                         <span className="submenu-label">
//                           {child.label}
//                         </span>
//                       </NavLink>
//                     )
//                   )}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </nav>

//       {/* =====================================================
//           FOOTER
//           ===================================================== */}

//       <div className="sidebar-footer">
//         <button
//           type="button"
//           className="logout-button"
//           onClick={handleLogout}
//         >
//           <span className="logout-icon">
//             <FiLogOut />
//           </span>

//           <span className="logout-label">
//             Logout
//           </span>
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;








// import React, { useState, useContext } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import "./Sidebar.css";

// const Sidebar = () => {
//   const [openMenu, setOpenMenu] = useState(null);
//   const navigate = useNavigate();
//   const { user, logout } = useContext(AuthContext);

//   const userRole = user?.role;

//   const toggleMenu = (menu) => {
//     setOpenMenu(openMenu === menu ? null : menu);
//   };

//   // =========================================================
//   // ADMIN SIDEBAR
//   // =========================================================

//   const adminMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: "🏠",
//       path: "/admin",
//     },

//     {
//       type: "dropdown",
//       label: "Students",
//       icon: "👨‍🎓",
//       children: [
//         { label: "Students", path: "/admin/students" },
//         { label: "Add Student", path: "/admin/students/add" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Teachers",
//       icon: "👨‍🏫",
//       children: [
//         { label: "Teachers", path: "/admin/teachers" },
//         { label: "Add Teacher", path: "/admin/teachers/add" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Parents",
//       icon: "👪",
//       children: [
//         { label: "Parents", path: "/admin/parents" },
//         { label: "Add Parent", path: "/admin/parents/add" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Academics",
//       icon: "🏫",
//       children: [
//         { label: "Attendance", path: "/admin/attendance" },
//         { label: "Add Attendance", path: "/attendance/add" },

//         { label: "Assignments", path: "/admin/homework" },
//         { label: "Add Assignment", path: "/assignments/add" },

//         { label: "Results", path: "/admin/results" },
//         { label: "Add Result", path: "/results/add" },

//         { label: "Grades", path: "/admin/grades/add" },

//         { label: "Classes", path: "/admin/classes" },
//         { label: "Add Class", path: "/admin/classes/add" },

//         { label: "Subjects", path: "/admin/subjects" },
//         { label: "Add Subject", path: "/admin/subjects/add" },

//         // Admin is the ONLY role that gets timetable management
//         { label: "Timetable", path: "/admin/timetable" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Finance",
//       icon: "💰",
//       children: [
//         { label: "Fees", path: "/admin/fees" },
//         { label: "Add Fee", path: "/fees/add" },

//         { label: "Payments", path: "/admin/payments" },
//         { label: "Add Payment", path: "/admin/payments/add" },

//         { label: "M-Pesa", path: "/mpesa" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: "💬",
//       children: [
//         { label: "Messages", path: "/admin/messages" },
//         { label: "Notifications", path: "/notifications" },
//         { label: "New Conversation", path: "/conversations/create" },
//       ],
//     },
//   ];

//   // =========================================================
//   // TEACHER SIDEBAR
//   // =========================================================

//   const teacherMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: "🏠",
//       path: "/teacher",
//     },

//     {
//       type: "dropdown",
//       label: "Attendance",
//       icon: "📝",
//       children: [
//         { label: "Attendance", path: "/teacher/attendance" },
//         { label: "Add Attendance", path: "/attendance/add" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Assignments",
//       icon: "📚",
//       children: [
//         { label: "Assignments", path: "/teacher/homework" },
//         { label: "Add Assignment", path: "/assignments/add" },
//       ],
//     },

//     {
//       type: "dropdown",
//       label: "Results",
//       icon: "📊",
//       children: [
//         { label: "Results", path: "/teacher/results" },
//         { label: "Add Result", path: "/results/add" },
//       ],
//     },

//     // VIEW ONLY
//     {
//       type: "link",
//       label: "Timetable",
//       icon: "🕐",
//       path: "/teacher/timetable",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: "💬",
//       children: [
//         { label: "Messages", path: "/teacher/messages" },
//         { label: "Notifications", path: "/notifications" },
//         { label: "New Conversation", path: "/conversations/create" },
//       ],
//     },
//   ];

//   // =========================================================
//   // PARENT SIDEBAR
//   // =========================================================

//   const parentMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: "🏠",
//       path: "/parent",
//     },

//     {
//       type: "link",
//       label: "Attendance",
//       icon: "📝",
//       path: "/parent/attendance",
//     },

//     {
//       type: "link",
//       label: "Homework",
//       icon: "📚",
//       path: "/parent/homework",
//     },

//     {
//       type: "link",
//       label: "Results",
//       icon: "📊",
//       path: "/parent/results",
//     },

//     {
//       type: "link",
//       label: "Timetable",
//       icon: "🕐",
//       path: "/parent/timetable",
//     },

//     {
//       type: "link",
//       label: "Fees",
//       icon: "💰",
//       path: "/parent/fees",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: "💬",
//       children: [
//         { label: "Messages", path: "/parent/messages" },
//         { label: "Notifications", path: "/notifications" },
//         { label: "New Conversation", path: "/conversations/create" },
//       ],
//     },
//   ];

//   // =========================================================
//   // STUDENT SIDEBAR
//   // =========================================================

//   const studentMenu = [
//     {
//       type: "link",
//       label: "Dashboard",
//       icon: "🏠",
//       path: "/student",
//     },

//     {
//       type: "link",
//       label: "Homework",
//       icon: "📚",
//       path: "/student/homework",
//     },

//     {
//       type: "link",
//       label: "Attendance",
//       icon: "📝",
//       path: "/student/attendance",
//     },

//     {
//       type: "link",
//       label: "Results",
//       icon: "📊",
//       path: "/student/results",
//     },

//     // VIEW ONLY
//     {
//       type: "link",
//       label: "Timetable",
//       icon: "🕐",
//       path: "/student/timetable",
//     },

//     {
//       type: "dropdown",
//       label: "Communication",
//       icon: "💬",
//       children: [
//         { label: "Messages", path: "/student/messages" },
//         { label: "Notifications", path: "/notifications" },

//         // NO "New Conversation" for students
//       ],
//     },
//   ];

//   // =========================================================
//   // SELECT MENU BASED ON ROLE
//   // =========================================================

//   let menu = [];

//   switch (userRole) {
//     case "admin":
//       menu = adminMenu;
//       break;

//     case "teacher":
//       menu = teacherMenu;
//       break;

//     case "parent":
//       menu = parentMenu;
//       break;

//     case "student":
//       menu = studentMenu;
//       break;

//     default:
//       menu = [];
//   }

//   // =========================================================
//   // LOGOUT
//   // =========================================================

//   const handleLogout = () => {
//     logout();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <aside className="sidebar">

//       {/* HEADER */}
//       <div className="sidebar-header">
//         <div className="sidebar-brand">

//           <span className="sidebar-brand-icon">
//             🏫
//           </span>

//           <div>
//             <h2>School Portal</h2>

//             <span className="sidebar-role">
//               {userRole
//                 ? userRole.charAt(0).toUpperCase() +
//                   userRole.slice(1)
//                 : ""}
//             </span>
//           </div>

//         </div>
//       </div>

//       {/* NAVIGATION */}
//       <nav className="sidebar-nav">

//         {menu.map((item, index) => {

//           {/* NORMAL LINK */}
//           if (item.type === "link") {
//             return (
//               <NavLink
//                 key={index}
//                 to={item.path}
//                 className={({ isActive }) =>
//                   isActive
//                     ? "sidebar-link active"
//                     : "sidebar-link"
//                 }
//               >
//                 <span className="sidebar-icon">
//                   {item.icon}
//                 </span>

//                 <span className="sidebar-label">
//                   {item.label}
//                 </span>
//               </NavLink>
//             );
//           }

//           {/* DROPDOWN */}
//           const isOpen = openMenu === item.label;

//           return (
//             <div
//               className="sidebar-menu"
//               key={index}
//             >

//               <button
//                 type="button"
//                 className={
//                   isOpen
//                     ? "sidebar-menu-button active"
//                     : "sidebar-menu-button"
//                 }
//                 onClick={() =>
//                   toggleMenu(item.label)
//                 }
//               >

//                 <span className="sidebar-icon">
//                   {item.icon}
//                 </span>

//                 <span className="sidebar-label">
//                   {item.label}
//                 </span>

//                 <span
//                   className={
//                     isOpen
//                       ? "sidebar-arrow arrow-open"
//                       : "sidebar-arrow"
//                   }
//                 >
//                   ›
//                 </span>

//               </button>

//               {/* CHILDREN */}
//               {isOpen && (
//                 <div className="sidebar-submenu">

//                   {item.children.map(
//                     (child, childIndex) => (
//                       <NavLink
//                         key={childIndex}
//                         to={child.path}
//                         className={({ isActive }) =>
//                           isActive
//                             ? "sidebar-submenu-link active"
//                             : "sidebar-submenu-link"
//                         }
//                       >

//                         <span className="submenu-dot">
//                           •
//                         </span>

//                         {child.label}

//                       </NavLink>
//                     )
//                   )}

//                 </div>
//               )}

//             </div>
//           );
//         })}

//       </nav>

//       {/* FOOTER */}
//       <div className="sidebar-footer">

//         <button
//           type="button"
//           className="logout-button"
//           onClick={handleLogout}
//         >
//           🚪 Logout
//         </button>

//       </div>

//     </aside>
//   );
// };

// export default Sidebar;

