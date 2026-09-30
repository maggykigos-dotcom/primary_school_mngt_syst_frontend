import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import DataTable from "../../components/DataTable/DataTable";

import {
    getParents,
    deleteParent,
} from "../../api/adminAPI";

import "../../Styles/ManagementPages.css";

import "./Parent.css";

const Parent = () => {
    const navigate = useNavigate();

    const [parents, setParents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");

    // LOAD PARENTS
    const loadParents = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getParents();

            console.log(
                "PARENTS API RESPONSE:",
                response.data
            );

            let parentData = [];

            if (Array.isArray(response.data)) {
                parentData = response.data;
            } else if (
                Array.isArray(response.data?.results)
            ) {
                parentData = response.data.results;
            }

            setParents(parentData);
        } catch (error) {
            console.error(
                "Error loading parents:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load parents."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadParents();
    }, []);

    // DELETE PARENT
    const handleDelete = async (parent) => {
        if (!parent || !parent.id) {
            console.error(
                "Cannot delete parent: parent data is missing.",
                parent
            );
            return;
        }

        const parentName =
            parent.name ||
            parent.username ||
            "this parent";

        const confirmed = window.confirm(
            `Are you sure you want to delete ${parentName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(parent.id);
            setError("");

            await deleteParent(parent.id);

            setParents((previousParents) =>
                previousParents.filter(
                    (item) => item.id !== parent.id
                )
            );
        } catch (error) {
            console.error(
                "Error deleting parent:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to delete parent."
            );
        } finally {
            setDeletingId(null);
        }
    };

    // SEARCH PARENTS
    const filteredParents = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        if (!search) {
            return parents;
        }

        return parents.filter((parent) => {
            const name = (
                parent.name || ""
            ).toLowerCase();

            const username = (
                parent.username || ""
            ).toLowerCase();

            const email = (
                parent.email || ""
            ).toLowerCase();

            const admissionNumber = (
                parent.admission_number || ""
            ).toLowerCase();

            const phoneNumber = (
                parent.phone_number || ""
            ).toLowerCase();

            return (
                name.includes(search) ||
                username.includes(search) ||
                email.includes(search) ||
                admissionNumber.includes(search) ||
                phoneNumber.includes(search)
            );
        });
    }, [parents, searchTerm]);

    // CLEAR SEARCH
    const clearSearch = () => {
        setSearchTerm("");
    };

    // TABLE COLUMNS
    const columns = [
        {
            key: "name",
            label: "Name",
        },

        {
            key: "username",
            label: "Username",
        },

        {
            key: "phone_number",
            label: "Phone",
        },

        {
            key: "role_type",
            label: "Parent Type",
        },

        {
            key: "actions",
            label: "Actions",

            render: (value, parent) => {
                if (!parent) {
                    return null;
                }

                return (
                    <div className="parent-action-buttons">
                        <button
                            type="button"
                            className="parent-view-button"
                            onClick={() =>
                                navigate(
                                    `/admin/parents/${parent.id}`
                                )
                            }
                        >
                            View
                        </button>

                        <button
                            type="button"
                            className="parent-edit-button"
                            onClick={() =>
                                navigate(
                                    `/admin/parents/edit/${parent.id}`
                                )
                            }
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            className="parent-delete-button"
                            onClick={() =>
                                handleDelete(parent)
                            }
                            disabled={
                                deletingId === parent.id
                            }
                        >
                            {deletingId === parent.id
                                ? "Deleting..."
                                : "Delete"}
                        </button>
                    </div>
                );
            },
        },
    ];

    return (
        <DashboardLayout>
            <div className="parents-page">

                {/* PAGE HEADER */}
                <div className="parents-header">
                    <div className="parents-title-area">
                        <div className="parents-title-icon">
                            P
                        </div>

                        <div>
                            <h1>Parent Management</h1>

                            <p>
                                Manage parent accounts,
                                profiles and linked students.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="add-parent-button"
                        onClick={() =>
                            navigate(
                                "/admin/parents/add"
                            )
                        }
                    >
                        Add Parent
                    </button>
                </div>

                {/* SUMMARY CARDS */}
                <div className="parent-summary-grid">

                    <div className="parent-summary-card parent-total-card">
                        <div className="parent-summary-icon">
                            P
                        </div>

                        <div>
                            <span>Total Parents</span>

                            <strong>
                                {parents.length}
                            </strong>
                        </div>
                    </div>

                    <div className="parent-summary-card parent-mothers-card">
                        <div className="parent-summary-icon">
                            M
                        </div>

                        <div>
                            <span>Mothers</span>

                            <strong>
                                {
                                    parents.filter(
                                        (parent) =>
                                            parent.role_type?.toLowerCase() ===
                                            "mother"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="parent-summary-card parent-fathers-card">
                        <div className="parent-summary-icon">
                            F
                        </div>

                        <div>
                            <span>Fathers</span>

                            <strong>
                                {
                                    parents.filter(
                                        (parent) =>
                                            parent.role_type?.toLowerCase() ===
                                            "father"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="parent-summary-card parent-guardians-card">
                        <div className="parent-summary-icon">
                            G
                        </div>

                        <div>
                            <span>Guardians</span>

                            <strong>
                                {
                                    parents.filter(
                                        (parent) =>
                                            parent.role_type?.toLowerCase() ===
                                            "guardian"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="parents-error">
                        {error}
                    </div>
                )}

                {/* TABLE CARD */}
                <div className="parents-table-card">

                    <div className="parents-table-header">
                        <div>
                            <h2>All Parents</h2>

                            <p>
                                View and manage all registered
                                parents.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="refresh-parents-button"
                            onClick={loadParents}
                            disabled={loading}
                        >
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>
                    </div>

                    {/* SEARCH AREA */}
                    <div className="parents-search-area">

                        <div className="parents-search-box">
                            <label htmlFor="parent-search">
                                Search Parents
                            </label>

                            <input
                                id="parent-search"
                                type="text"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Search by name, username, admission number, email or phone..."
                            />
                        </div>

                        <button
                            type="button"
                            className="clear-parent-search"
                            onClick={clearSearch}
                        >
                            Clear Search
                        </button>

                    </div>

                    {/* SEARCH RESULT INFORMATION */}
                    {!loading && (
                        <div className="parents-result-info">
                            Showing{" "}
                            <strong>
                                {filteredParents.length}
                            </strong>{" "}
                            of{" "}
                            <strong>
                                {parents.length}
                            </strong>{" "}
                            parents
                        </div>
                    )}

                    {/* LOADING */}
                    {loading ? (
                        <div className="parents-loading">
                            <div className="parents-spinner"></div>

                            <p>
                                Loading parents...
                            </p>
                        </div>
                    ) : filteredParents.length === 0 ? (
                        <div className="parents-empty">
                            <div className="parents-empty-icon">
                                P
                            </div>

                            <h3>
                                No parents found
                            </h3>

                            <p>
                                {parents.length === 0
                                    ? "There are no parents registered yet."
                                    : "No parents match your search."}
                            </p>

                            {parents.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredParents}
                        />
                    )}

                </div>
            </div>
        </DashboardLayout>
    );
};

export default Parent;



// import { useEffect, useState } from "react";
// import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
// import DataTable from "../../components/DataTable/DataTable";
// import { getParents } from "../../api/adminAPI";
// import "../../Styles/ManagementPages.css";

// const Parent = () => {
//     const [parents, setParents] = useState([]);

//     useEffect(() => {
//         getParents()
//             .then((response) => {
//                 setParents(response.data);
//             })
//             .catch((error) => {
//                 console.error("Error loading parents:", error);
//             });
//     }, []);

//     const columns = [
//         {
//             key: "name",
//             label: "Name",
//         },
//         {
//             key: "username",
//             label: "Username",
//         },
//         {
//             key: "phone_number",
//             label: "Phone",
//         },
//         {
//             key: "role_type",
//             label: "Parent Type",
//         },
//     ];

//     return (
//         <DashboardLayout>
//             <h1>All Parents</h1>

//             <DataTable
//                 columns={columns}
//                 data={parents}
//             />
//         </DashboardLayout>
//     );
// };

// export default Parent;
