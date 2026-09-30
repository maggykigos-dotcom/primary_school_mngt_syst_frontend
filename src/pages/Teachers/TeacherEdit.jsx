import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import {
    getTeacher,
    updateTeacher,
} from "../../api/adminAPI";

import "./TeacherEdit.css";

const TeacherEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
        password: "",
    });

    const [profilePicture, setProfilePicture] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    /* =====================================================
       LOAD EXISTING TEACHER
       ===================================================== */

    const loadTeacher = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getTeacher(id);

            const teacher = response.data;

            console.log(
                "TEACHER EDIT DATA:",
                teacher
            );

            setFormData({
                username:
                    teacher.username ||
                    teacher.username_display ||
                    "",

                first_name:
                    teacher.first_name ||
                    teacher.first_name_display ||
                    "",

                last_name:
                    teacher.last_name ||
                    teacher.last_name_display ||
                    "",

                email:
                    teacher.email ||
                    teacher.email_display ||
                    "",

                phone_number:
                    teacher.phone_number ||
                    teacher.phone_number_display ||
                    "",

                date_of_birth:
                    teacher.date_of_birth ||
                    teacher.date_of_birth_display ||
                    "",

                address:
                    teacher.address ||
                    teacher.address_display ||
                    "",

                password: "",
            });

            setProfilePicture(
                teacher.profile_picture ||
                teacher.user_profile_picture ||
                teacher.profile_image ||
                null
            );

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

    /* =====================================================
       HANDLE INPUT CHANGES
       ===================================================== */

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    /* =====================================================
       HANDLE FORM SUBMIT
       ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = new FormData();

            data.append(
                "username",
                formData.username
            );

            data.append(
                "first_name",
                formData.first_name
            );

            data.append(
                "last_name",
                formData.last_name
            );

            data.append(
                "email",
                formData.email
            );

            data.append(
                "phone_number",
                formData.phone_number
            );

            data.append(
                "date_of_birth",
                formData.date_of_birth
            );

            data.append(
                "address",
                formData.address
            );

            /*
             * Only send a password if the administrator
             * entered a new one.
             */

            if (formData.password.trim() !== "") {
                data.append(
                    "password",
                    formData.password
                );
            }

            /*
             * Only send a new profile picture if one
             * was selected.
             */

            if (profilePicture instanceof File) {
                data.append(
                    "profile_picture",
                    profilePicture
                );
            }

            await updateTeacher(id, data);

            setSuccess(
                "Teacher details have been updated successfully."
            );

            /*
             * Clear password after saving.
             */

            setFormData((previousData) => ({
                ...previousData,
                password: "",
            }));

            /*
             * Go back to teacher details after a
             * short delay.
             */

            setTimeout(() => {
                navigate(`/admin/teachers/${id}`);
            }, 1000);

        } catch (error) {
            console.error(
                "Error updating teacher:",
                error
            );

            const responseData =
                error.response?.data;

            if (
                responseData &&
                typeof responseData === "object"
            ) {
                const messages = Object.entries(
                    responseData
                )
                    .map(
                        ([field, message]) =>
                            `${field}: ${
                                Array.isArray(message)
                                    ? message.join(", ")
                                    : message
                            }`
                    )
                    .join(" | ");

                setError(
                    messages ||
                    "Failed to update teacher."
                );
            } else {
                setError(
                    "Failed to update teacher."
                );
            }

        } finally {
            setSaving(false);
        }
    };

    /* =====================================================
       LOADING SCREEN
       ===================================================== */

    if (loading) {
        return (
            <DashboardLayout>
                <div className="teacher-edit-loading">
                    Loading teacher details...
                </div>
            </DashboardLayout>
        );
    }

    /* =====================================================
       PAGE
       ===================================================== */

    return (
        <DashboardLayout>

            <div className="teacher-edit-page">

                {/* HEADER */}

                <div className="teacher-edit-header">

                    <div>
                        <h1>
                            Edit Teacher
                        </h1>

                        <p>
                            Update the teacher's existing
                            information.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="teacher-edit-back-button"
                        onClick={() =>
                            navigate(
                                `/admin/teachers/${id}`
                            )
                        }
                    >
                        Back to Teacher
                    </button>

                </div>

                {/* ERROR */}

                {error && (
                    <div className="teacher-edit-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}

                {success && (
                    <div className="teacher-edit-success">
                        {success}
                    </div>
                )}

                {/* FORM */}

                <form
                    className="teacher-edit-card"
                    onSubmit={handleSubmit}
                >

                    {/* PERSONAL INFORMATION */}

                    <div className="teacher-edit-section">

                        <h2>
                            Personal Information
                        </h2>

                        <div className="teacher-edit-form-grid">

                            <div className="teacher-edit-form-group">

                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="teacher-edit-form-group">

                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="teacher-edit-form-group">

                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="teacher-edit-form-group">

                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="teacher-edit-form-group">

                                <label htmlFor="phone_number">
                                    Phone Number
                                </label>

                                <input
                                    id="phone_number"
                                    type="text"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="teacher-edit-form-group">

                                <label htmlFor="date_of_birth">
                                    Date of Birth
                                </label>

                                <input
                                    id="date_of_birth"
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth || ""}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                    </div>

                    {/* ADDRESS */}

                    <div className="teacher-edit-section">

                        <h2>
                            Address
                        </h2>

                        <div className="teacher-edit-form-group">

                            <label htmlFor="address">
                                Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="5"
                            />

                        </div>

                    </div>

                    {/* PROFILE PICTURE */}

                    <div className="teacher-edit-section">

                        <h2>
                            Profile Picture
                        </h2>

                        <div className="teacher-picture-area">

                            {profilePicture &&
                                typeof profilePicture === "string" && (
                                    <img
                                        src={profilePicture}
                                        alt="Current teacher"
                                        className="teacher-current-picture"
                                    />
                                )}

                            <div className="teacher-edit-form-group">

                                <label htmlFor="profile_picture">
                                    Select New Profile Picture
                                </label>

                                <input
                                    id="profile_picture"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                        setProfilePicture(
                                            event.target.files?.[0] ||
                                            null
                                        )
                                    }
                                />

                                <small>
                                    Leave this unchanged if
                                    you do not want to replace
                                    the current picture.
                                </small>

                            </div>

                        </div>

                    </div>

                    {/* PASSWORD */}

                    <div className="teacher-edit-section teacher-password-section">

                        <h2>
                            Password
                        </h2>

                        <p>
                            Leave this field empty if you do
                            not want to change the password.
                        </p>

                        <div className="teacher-edit-form-group">

                            <label htmlFor="password">
                                New Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter a new password only if needed"
                            />

                        </div>

                    </div>

                    {/* BUTTONS */}

                    <div className="teacher-edit-form-actions">

                        <button
                            type="button"
                            className="teacher-cancel-button"
                            onClick={() =>
                                navigate(
                                    `/admin/teachers/${id}`
                                )
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="teacher-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving Changes..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>

        </DashboardLayout>
    );
};

export default TeacherEdit;

