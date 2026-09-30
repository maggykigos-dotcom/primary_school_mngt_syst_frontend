import { useState } from "react";
import axios from "../../api/axios";
import "../../Styles/form.css";

const TeacherForm = () => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        username: "",
        password: "",
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        date_of_birth: "",
        address: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setLoading(true);
        setMessage("");

        try {
            await axios.post("/auth/teachers/", formData);

            setMessage("Teacher created successfully.");

            setFormData({
                username: "",
                password: "",
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                date_of_birth: "",
                address: "",
            });
        } catch (error) {
            console.error(
                "Teacher creation error:",
                error.response?.data
            );

            const errors = error.response?.data;

            if (errors) {
                const errorMessages = Object.entries(errors)
                    .map(([field, messages]) => {
                        const messageText = Array.isArray(messages)
                            ? messages.join(", ")
                            : messages;

                        return `${field}: ${messageText}`;
                    })
                    .join(" | ");

                setMessage(errorMessages);
            } else {
                setMessage("Failed to create teacher.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Add Teacher</h2>

            {message && <p>{message}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <input
                    name="first_name"
                    placeholder="First Name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="last_name"
                    placeholder="Last Name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    name="phone_number"
                    placeholder="Phone Number"
                    value={formData.phone_number}
                    onChange={handleChange}
                />

                <input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                />

                <textarea
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating Teacher..." : "Create Teacher"}
                </button>
            </form>
        </div>
    );
};

export default TeacherForm;


