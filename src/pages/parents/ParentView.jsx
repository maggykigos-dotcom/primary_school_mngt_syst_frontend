import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import { getParent } from "../../api/adminAPI";

import "./ParentView.css";

const ParentView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [parent, setParent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadParent = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getParent(id);

                console.log(
                    "PARENT DETAILS:",
                    response.data
                );

                setParent(response.data);
            } catch (error) {
                console.error(
                    "Error loading parent:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Failed to load parent details."
                );
            } finally {
                setLoading(false);
            }
        };

        loadParent();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="parent-view-loading">
                    <div className="parent-view-spinner"></div>

                    <p>
                        Loading parent details...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !parent) {
        return (
            <DashboardLayout>
                <div className="parent-view-page">

                    <div className="parent-view-error">
                        <h2>
                            Parent details could not be found.
                        </h2>

                        <p>
                            {error ||
                                "The requested parent does not exist."}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/admin/parents")
                            }
                        >
                            Back to Parents
                        </button>
                    </div>

                </div>
            </DashboardLayout>
        );
    }

    const parentName =
        parent.name ||
        parent.username ||
        "Unknown Parent";

    const profilePicture =
        parent.profile_picture;

    const students = Array.isArray(parent.students)
        ? parent.students
        : [];

    return (
        <DashboardLayout>
            <div className="parent-view-page">

                {/* HEADER */}
                <div className="parent-view-header">

                    <button
                        type="button"
                        className="parent-back-button"
                        onClick={() =>
                            navigate("/admin/parents")
                        }
                    >
                        Back to Parents
                    </button>

                    <button
                        type="button"
                        className="parent-view-edit-button"
                        onClick={() =>
                            navigate(
                                `/admin/parents/edit/${parent.id}`
                            )
                        }
                    >
                        Edit Parent
                    </button>

                </div>

                {/* PROFILE CARD */}
                <div className="parent-profile-card">

                    <div className="parent-profile-image-area">

                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt={parentName}
                                className="parent-profile-image"
                            />
                        ) : (
                            <div className="parent-profile-placeholder">
                                {parentName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}

                    </div>

                    <div className="parent-profile-main">

                        <h1>
                            {parentName}
                        </h1>

                        <p>
                            Parent
                        </p>

                        <div className="parent-profile-badge">
                            {parent.role_type ||
                                "Parent"}
                        </div>

                    </div>

                </div>

                {/* PERSONAL INFORMATION */}
                <div className="parent-details-card">

                    <div className="parent-details-heading">
                        <h2>
                            Personal Information
                        </h2>

                        <p>
                            Parent account information.
                        </p>
                    </div>

                    <div className="parent-details-grid">

                        <div className="parent-detail-item">
                            <span>
                                Name
                            </span>

                            <strong>
                                {parent.name || "-"}
                            </strong>
                        </div>

                        <div className="parent-detail-item">
                            <span>
                                Username
                            </span>

                            <strong>
                                {parent.username || "-"}
                            </strong>
                        </div>

                        <div className="parent-detail-item">
                            <span>
                                Phone Number
                            </span>

                            <strong>
                                {parent.phone_number || "-"}
                            </strong>
                        </div>

                        <div className="parent-detail-item">
                            <span>
                                Parent Type
                            </span>

                            <strong>
                                {parent.role_type || "-"}
                            </strong>
                        </div>

                        <div className="parent-detail-item">
                            <span>
                                Parent ID
                            </span>

                            <strong>
                                {parent.id}
                            </strong>
                        </div>

                    </div>

                </div>

                {/* LINKED STUDENTS */}
                <div className="parent-details-card">

                    <div className="parent-details-heading">
                        <h2>
                            Linked Students
                        </h2>

                        <p>
                            Students connected to this parent
                            account.
                        </p>
                    </div>

                    {students.length === 0 ? (
                        <div className="no-linked-students">
                            No students are currently linked
                            to this parent.
                        </div>
                    ) : (
                        <div className="linked-students-list">

                            {students.map(
                                (student, index) => {

                                    const studentName =
                                        typeof student ===
                                        "object"
                                            ? (
                                                student.name ||
                                                student.student_name ||
                                                student.username ||
                                                "Student"
                                            )
                                            : `Student ${index + 1}`;

                                    const admissionNumber =
                                        typeof student ===
                                        "object"
                                            ? (
                                                student.admission_number ||
                                                ""
                                            )
                                            : "";

                                    return (
                                        <div
                                            className="linked-student-item"
                                            key={
                                                typeof student ===
                                                "object"
                                                    ? student.id ||
                                                      index
                                                    : index
                                            }
                                        >

                                            <div className="linked-student-avatar">
                                                {studentName
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <strong>
                                                    {studentName}
                                                </strong>

                                                {admissionNumber && (
                                                    <span>
                                                        {
                                                            admissionNumber
                                                        }
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>
                    )}

                </div>

            </div>
        </DashboardLayout>
    );
};

export default ParentView;

