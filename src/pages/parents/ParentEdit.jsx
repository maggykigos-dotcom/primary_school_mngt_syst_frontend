import { useEffect, useState } from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";

import {
    getParent,
    updateParent,
} from "../../api/adminAPI";

import "./ParentsEdit.css";

const ParentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        phone_number: "",
        address: "",
        date_of_birth: "",
        role_type: "",
        password: "",
    });

    const [profilePicture, setProfilePicture] =
        useState(null);

    // LOAD PARENT
    useEffect(() => {
        const loadParent = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await getParent(id);

                const parent = response.data;

                console.log(
                    "PARENT FOR EDIT:",
                    parent
                );

                setFormData({
                    first_name:
                        parent.first_name || "",
                    last_name:
                        parent.last_name || "",
                    username:
                        parent.username || "",
                    email:
                        parent.email || "",
                    phone_number:
                        parent.phone_number || "",
                    address:
                        parent.address || "",
                    date_of_birth:
                        parent.date_of_birth || "",
                    role_type:
                        parent.role_type || "",
                    password: "",
                });
            } catch (error) {
                console.error(
                    "Error loading parent:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Failed to load parent."
                );
            } finally {
                setLoading(false);
            }
        };

        loadParent();
    }, [id]);

    // HANDLE INPUT
    const handleChange = (event) => {
        const { name, value } =
            event.target;

                 

 
        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // HANDLE IMAGE
    const handleProfilePictureChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        setProfilePicture(file || null);
    };

    // SAVE
    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const data = new FormData();

            data.append(
                "first_name",
                formData.first_name
            );

            data.append(
                "last_name",
                formData.last_name
            );

            data.append(
                "username",
                formData.username
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
                "address",
                formData.address
            );

            data.append(
                "date_of_birth",
                formData.date_of_birth
            );

            data.append(
                "role_type",
                formData.role_type
            );

            if (formData.password.trim()) {
                data.append(
                    "password",
                    formData.password
                );
            }

            if (profilePicture) {
                data.append(
                    "profile_picture",
                    profilePicture
                );
            }

            const response =
                await updateParent(id, data);

            console.log(
                "PARENT UPDATE RESPONSE:",
                response.data
            );

            setSuccess(
                "Parent updated successfully."
            );

            setTimeout(() => {
                navigate(
                    `/admin/parents/${id}`
                );
            }, 800);
        } catch (error) {
            console.error(
                "Error updating parent:",
                error
            );

            const backendError =
                error.response?.data;

            if (
                typeof backendError ===
                "object"
            ) {
                const messages =
                    Object.entries(
                        backendError
                    )
                        .map(
                            ([field, message]) =>
                                `${field}: ${
                                    Array.isArray(
                                        message
                                    )
                                        ? message.join(
                                              ", "
                                          )
                                        : message
                                }`
                        )
                        .join(" ");

                setError(
                    messages ||
                    "Failed to update parent."
                );
            } else {
                setError(
                    "Failed to update parent."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="parent-edit-loading">
                    Loading parent information...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="parent-edit-page">

                {/* HEADER */}
                <div className="parent-edit-header">

                    <div>
                        <h1>
                            Edit Parent
                        </h1>

                        <p>
                            Update parent account
                            information and profile.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="parent-edit-back-button"
                        onClick={() =>
                            navigate(
                                `/admin/parents/${id}`
                            )
                        }
                    >
                        Back to Parent
                    </button>

                </div>

                {/* ERROR */}
                {error && (
                    <div className="parent-edit-error">
                        {error}
                    </div>
                )}

                {/* SUCCESS */}
                {success && (
                    <div className="parent-edit-success">
                        {success}
                    </div>
                )}

                {/* FORM */}
                <form
                    className="parent-edit-form"
                    onSubmit={handleSubmit}
                >

                    {/* PERSONAL INFORMATION */}
                    <div className="parent-edit-card">

                        <div className="parent-edit-card-heading">
                            <h2>
                                Personal Information
                            </h2>

                            <p>
                                Update the parent's
                                personal details.
                            </p>
                        </div>

                        <div className="parent-edit-grid">

                            <div className="parent-edit-field">
                                <label htmlFor="first_name">
                                    First Name
                                </label>

                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    value={
                                        formData.first_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="parent-edit-field">
                                <label htmlFor="last_name">
                                    Last Name
                                </label>

                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    value={
                                        formData.last_name
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="parent-edit-field">
                                <label htmlFor="username">
                                    Username
                                </label>

                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    value={
                                        formData.username
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="parent-edit-field">
                                <label htmlFor="email">
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={
                                        formData.email
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="parent-edit-field">
                                <label htmlFor="phone_number">
                                    Phone Number
                                </label>

                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="text"
                                    value={
                                        formData.phone_number
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                            <div className="parent-edit-field">
                                <label htmlFor="date_of_birth">
                                    Date of Birth
                                </label>

                                <input
                                    id="date_of_birth"
                                    name="date_of_birth"
                                    type="date"
                                    value={
                                        formData.date_of_birth
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </div>

                        </div>

                        <div className="parent-edit-field full-width">
                            <label htmlFor="address">
                                Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                rows="4"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                            ></textarea>
                        </div>

                    </div>

                    {/* PARENT INFORMATION */}
                    <div className="parent-edit-card">

                        <div className="parent-edit-card-heading">
                            <h2>
                                Parent Information
                            </h2>

                            <p>
                                Update the parent's
                                account type.
                            </p>
                        </div>

                        <div className="parent-edit-grid">

                            <div className="parent-edit-field">
                                <label htmlFor="role_type">
                                    Parent Type
                                </label>

                                <select
                                    id="role_type"
                                    name="role_type"
                                    value={
                                        formData.role_type
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >
                                    <option value="">
                                        Select Parent Type
                                    </option>

                                    <option value="mother">
                                        Mother
                                    </option>

                                    <option value="father">
                                        Father
                                    </option>

                                    <option value="guardian">
                                        Guardian
                                    </option>
                                </select>
                            </div>

                        </div>

                    </div>

                    {/* PROFILE */}
                    <div className="parent-edit-card">

                        <div className="parent-edit-card-heading">
                            <h2>
                                Profile Picture
                            </h2>

                            <p>
                                Choose a new profile
                                picture if needed.
                            </p>
                        </div>

                        <div className="parent-edit-field">

                            <label htmlFor="profile_picture">
                                Profile Picture
                            </label>

                            <input
                                id="profile_picture"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleProfilePictureChange
                                }
                            />

                            {profilePicture && (
                                <span className="selected-parent-file">
                                    Selected:{" "}
                                    {
                                        profilePicture.name
                                    }
                                </span>
                            )}

                        </div>

                    </div>

                    {/* PASSWORD */}
                    <div className="parent-edit-card">

                        <div className="parent-edit-card-heading">
                            <h2>
                                Password
                            </h2>

                            <p>
                                Leave this field empty
                                if the password should
                                remain unchanged.
                            </p>
                        </div>

                        <div className="parent-edit-field">

                            <label htmlFor="password">
                                New Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={
                                    formData.password
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Enter a new password only if changing it"
                            />

                        </div>

                    </div>

                    {/* BUTTONS */}
                    <div className="parent-edit-actions">

                        <button
                            type="button"
                            className="parent-edit-cancel-button"
                            onClick={() =>
                                navigate(
                                    `/admin/parents/${id}`
                                )
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="parent-edit-save-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </button>

                    </div>

                </form>

            </div>
        </DashboardLayout>
    );
};

export default ParentEdit;

