import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import {
    getTeacher,
} from "../../api/adminAPI";

import "./TeacherView.css";

const TeacherView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTeacher = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getTeacher(id);

            console.log(
                "TEACHER DETAILS:",
                response.data
            );

            setTeacher(response.data);
        } catch (error) {
            console.error(
                "Error loading teacher:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "Failed to load teacher details."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTeacher();
    }, [loadTeacher]);

    if (loading) {
        return (
            <DashboardLayout>
                <div className="teacher-view-loading">
                    Loading teacher details...
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="teacher-view-page">

                    <div className="teacher-view-error">
                        {error}
                    </div>

                    <button
                        type="button"
                        className="teacher-view-back-button"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        Back to Teachers
                    </button>

                </div>
            </DashboardLayout>
        );
    }

    if (!teacher) {
        return (
            <DashboardLayout>
                <div className="teacher-view-page">

                    <div className="teacher-view-error">
                        Teacher details could not be found.
                    </div>

                    <button
                        type="button"
                        className="teacher-view-back-button"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        Back to Teachers
                    </button>

                </div>
            </DashboardLayout>
        );
    }

    const teacherName =
        teacher.name ||
        teacher.teacher_name ||
        `${teacher.first_name || ""} ${teacher.last_name || ""}`.trim() ||
        "Teacher";

    const profilePicture =
        teacher.profile_picture ||
        teacher.user_profile_picture ||
        teacher.profile_image ||
        null;

    return (
        <DashboardLayout>

            <div className="teacher-view-page">

                {/* HEADER */}

                <div className="teacher-view-header">

                    <div>
                        <h1>Teacher Details</h1>

                        <p>
                            View complete information about
                            this teacher.
                        </p>
                    </div>

                    <div className="teacher-view-actions">

                        <button
                            type="button"
                            className="teacher-view-edit-button"
                            onClick={() =>
                                navigate(
                                    `/admin/teachers/edit/${teacher.id}`
                                )
                            }
                        >
                            Edit Teacher
                        </button>

                        <button
                            type="button"
                            className="teacher-view-back-button"
                            onClick={() =>
                                navigate("/admin/teachers")
                            }
                        >
                            Back to Teachers
                        </button>

                    </div>

                </div>

                {/* PROFILE CARD */}

                <div className="teacher-profile-card">

                    <div className="teacher-profile-header">

                        <div className="teacher-avatar">

                            {profilePicture ? (
                                <img
                                    src={profilePicture}
                                    alt={teacherName}
                                    className="teacher-profile-image"
                                />
                            ) : (
                                <div className="teacher-avatar-placeholder">
                                    No Photo
                                </div>
                            )}

                        </div>

                        <div className="teacher-profile-info">

                            <h2>
                                {teacherName}
                            </h2>

                            <p>
                                Teacher
                            </p>

                            {teacher.username && (
                                <span>
                                    Username: {teacher.username}
                                </span>
                            )}

                        </div>

                    </div>

                    {/* PERSONAL INFORMATION */}

                    <div className="teacher-details-section">

                        <h3>
                            Personal Information
                        </h3>

                        <div className="teacher-details-grid">

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    First Name
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.first_name ||
                                        teacher.first_name_display ||
                                        "-"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Last Name
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.last_name ||
                                        teacher.last_name_display ||
                                        "-"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Username
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.username ||
                                        teacher.username_display ||
                                        "-"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Email
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.email ||
                                        teacher.email_display ||
                                        "-"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Phone Number
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.phone_number ||
                                        teacher.phone_number_display ||
                                        "-"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Date of Birth
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.date_of_birth ||
                                        teacher.date_of_birth_display ||
                                        "-"}
                                </span>
                            </div>

                        </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="teacher-details-section">

                        <h3>
                            Address
                        </h3>

                        <div className="teacher-address-box">

                            {teacher.address ||
                                teacher.address_display ||
                                "No address provided."}

                        </div>

                    </div>

                    {/* TEACHER INFORMATION */}

                    <div className="teacher-details-section">

                        <h3>
                            Teacher Information
                        </h3>

                        <div className="teacher-details-grid">

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Teacher ID
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.id}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Role
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.role || "Teacher"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Status
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.is_active === false
                                        ? "Inactive"
                                        : "Active"}
                                </span>
                            </div>

                            <div className="teacher-detail-item">
                                <span className="teacher-detail-label">
                                    Staff Status
                                </span>

                                <span className="teacher-detail-value">
                                    {teacher.is_staff
                                        ? "Staff"
                                        : "Not Staff"}
                                </span>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </DashboardLayout>
    );
};

export default TeacherView;

