import { useEffect, useState } from "react";
import axios from "../../api/axios";
import "./FeeForm.css";

const FeeForm = () => {
    const [students, setStudents] = useState([]);

    const [formData, setFormData] = useState({
        student_id: "",
        total_amount: "",
        term: "",
        session: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // =========================================
    // LOAD STUDENTS
    // =========================================
    useEffect(() => {
        const loadStudents = async () => {
            try {
                const response = await axios.get("/auth/students/");

                console.log("Students response:", response.data);

                setStudents(
                    Array.isArray(response.data)
                        ? response.data
                        : response.data.results || []
                );
            } catch (err) {
                console.error("Error loading students:", err);
                setError("Unable to load students.");
            }
        };

        loadStudents();
    }, []);

    // =========================================
    // HANDLE INPUT CHANGES
    // =========================================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    // =========================================
    // FORMAT BACKEND ERRORS
    // =========================================
    const formatBackendError = (backendError) => {
        if (!backendError) {
            return "Failed to create fee structure.";
        }

        if (typeof backendError === "string") {
            return backendError;
        }

        if (backendError.detail) {
            return backendError.detail;
        }

        if (backendError.error) {
            return backendError.error;
        }

        // Django REST Framework field errors
        if (typeof backendError === "object") {
            const messages = [];

            Object.entries(backendError).forEach(([field, value]) => {
                if (Array.isArray(value)) {
                    messages.push(
                        `${field}: ${value.join(", ")}`
                    );
                } else if (typeof value === "string") {
                    messages.push(`${field}: ${value}`);
                }
            });

            if (messages.length > 0) {
                return messages.join(" | ");
            }
        }

        return "Failed to create fee structure.";
    };

    // =========================================
    // CREATE FEE
    // =========================================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");
        setLoading(true);

        // Basic validation
        if (!formData.student_id) {
            setError("Please select a student.");
            setLoading(false);
            return;
        }

        if (!formData.total_amount) {
            setError("Please enter the total fee amount.");
            setLoading(false);
            return;
        }

        if (Number(formData.total_amount) <= 0) {
            setError("Fee amount must be greater than zero.");
            setLoading(false);
            return;
        }

        if (!formData.term) {
            setError("Please select a term.");
            setLoading(false);
            return;
        }

        if (!formData.session.trim()) {
            setError("Please enter the session / year.");
            setLoading(false);
            return;
        }

        // IMPORTANT:
        // FeeSerializer expects student_id, NOT student.
        const payload = {
            student_id: Number(formData.student_id),
            total_amount: Number(formData.total_amount),
            term: formData.term,
            session: formData.session.trim(),
        };

        console.log("Creating fee with payload:", payload);

        try {
            const response = await axios.post(
                "/finance/fees/",
                payload
            );

            console.log("Fee creation response:", response.data);

            setMessage("Fee structure created successfully.");

            setFormData({
                student_id: "",
                total_amount: "",
                term: "",
                session: "",
            });
        } catch (err) {
            console.error("Fee creation error:", err);
            console.error(
                "Backend response:",
                err.response?.data
            );

            const backendError = err.response?.data;

            setError(formatBackendError(backendError));
        } finally {
            setLoading(false);
        }
    };

    // =========================================
    // CANCEL / RESET
    // =========================================
    const handleCancel = () => {
        setFormData({
            student_id: "",
            total_amount: "",
            term: "",
            session: "",
        });

        setMessage("");
        setError("");
    };

    return (
        <div className="fee-form-page">
            <div className="fee-form-card">

                {/* HEADER */}
                <div className="fee-form-header">
                    <div>
                        <h2>Create School Fee</h2>

                        <p>
                            Add a fee structure for a student.
                        </p>
                    </div>
                </div>

                {/* SUCCESS MESSAGE */}
                {message && (
                    <div className="fee-success-message">
                        {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}
                {error && (
                    <div className="fee-error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* STUDENT */}
                    <div className="fee-form-group">
                        <label htmlFor="student_id">
                            Student
                        </label>

                        <select
                            id="student_id"
                            name="student_id"
                            value={formData.student_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select student
                            </option>

                            {students.map((student) => (
                                <option
                                    key={student.id}
                                    value={student.id}
                                >
                                    {student.student_name ||
                                        `${student.first_name || ""} ${
                                            student.last_name || ""
                                        }`.trim() ||
                                        "Unnamed Student"}

                                    {student.admission_number
                                        ? ` — ${student.admission_number}`
                                        : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* TOTAL FEE */}
                    <div className="fee-form-group">
                        <label htmlFor="total_amount">
                            Total Fee Amount
                        </label>

                        <div className="amount-input-wrapper">
                            <span className="currency-prefix">
                                KSh
                            </span>

                            <input
                                id="total_amount"
                                type="number"
                                name="total_amount"
                                placeholder="Enter fee amount"
                                min="0"
                                step="0.01"
                                value={formData.total_amount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* TERM */}
                    <div className="fee-form-group">
                        <label htmlFor="term">
                            Term
                        </label>

                        <select
                            id="term"
                            name="term"
                            value={formData.term}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select term
                            </option>

                            <option value="Term 1">
                                Term 1
                            </option>

                            <option value="Term 2">
                                Term 2
                            </option>

                            <option value="Term 3">
                                Term 3
                            </option>
                        </select>
                    </div>

                    {/* SESSION / YEAR */}
                    <div className="fee-form-group">
                        <label htmlFor="session">
                            Session / Year
                        </label>

                        <input
                            id="session"
                            type="text"
                            name="session"
                            placeholder="e.g. 2026"
                            value={formData.session}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* BUTTONS */}
                    <div className="fee-form-actions">

                        <button
                            type="button"
                            className="fee-cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="fee-submit-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating..."
                                : "Create Fee"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeeForm;




// import { useEffect, useState } from "react";
// import axios from "../../api/axios";

// import "./FeeForm.css";

// const FeeForm = () => {
//     const [students, setStudents] = useState([]);

//     const [formData, setFormData] = useState({
//         student: "",
//         total_amount: "",
//         term: "",
//         session: "",
//     });

//     const [message, setMessage] = useState("");
//     const [error, setError] = useState("");

//     useEffect(() => {
//         axios
//             .get("/auth/students/")
//             .then((res) => {
//                 setStudents(res.data);
//             })
//             .catch((err) => {
//                 console.error("Error loading students:", err);
//                 setError("Unable to load students.");
//             });
//     }, []);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value,
//         });
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         setMessage("");
//         setError("");

//         try {
//             await axios.post(
//                 "/finance/fees/",
//                 formData
//             );

//             setMessage("Fee structure created successfully.");

//             setFormData({
//                 student: "",
//                 total_amount: "",
//                 term: "",
//                 session: "",
//             });
//         } catch (err) {
//             console.error(
//                 "Fee creation error:",
//                 err.response?.data || err
//             );

//             const backendError = err.response?.data;

//             if (typeof backendError === "string") {
//                 setError(backendError);
//             } else if (backendError?.detail) {
//                 setError(backendError.detail);
//             } else {
//                 setError("Failed to create fee structure.");
//             }
//         }
//     };

//     const handleCancel = () => {
//         setFormData({
//             student: "",
//             total_amount: "",
//             term: "",
//             session: "",
//         });

//         setMessage("");
//         setError("");
//     };

//     return (
//         <div className="fee-form-page">
//             <div className="fee-form-card">

//                 <div className="fee-form-header">
//                     <div>
//                         <h2>Create School Fee</h2>
//                         <p>
//                             Add a fee structure for a student.
//                         </p>
//                     </div>
//                 </div>

//                 {message && (
//                     <div className="fee-success-message">
//                         {message}
//                     </div>
//                 )}

//                 {error && (
//                     <div className="fee-error-message">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit}>

//                     {/* STUDENT */}
//                     <div className="fee-form-group">
//                         <label htmlFor="student">
//                             Student
//                         </label>

//                         <select
//                             id="student"
//                             name="student"
//                             value={formData.student}
//                             onChange={handleChange}
//                             required
//                         >
//                             <option value="">
//                                 Select student
//                             </option>

//                             {students.map((student) => (
//                                 <option
//                                     key={student.id}
//                                     value={student.id}
//                                 >
//                                     {student.student_name ||
//                                         `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
//                                         "Unnamed Student"}
//                                     {student.admission_number
//                                         ? ` — ${student.admission_number}`
//                                         : ""}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* TOTAL FEE */}
//                     <div className="fee-form-group">
//                         <label htmlFor="total_amount">
//                             Total Fee Amount
//                         </label>

//                         <div className="amount-input-wrapper">
//                             <span className="currency-prefix">
//                                 KSh
//                             </span>

//                             <input
//                                 id="total_amount"
//                                 type="number"
//                                 name="total_amount"
//                                 placeholder="Enter fee amount"
//                                 min="0"
//                                 step="0.01"
//                                 value={formData.total_amount}
//                                 onChange={handleChange}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     {/* TERM */}
//                     <div className="fee-form-group">
//                         <label htmlFor="term">
//                             Term
//                         </label>

//                         <select
//                             id="term"
//                             name="term"
//                             value={formData.term}
//                             onChange={handleChange}
//                             required
//                         >
//                             <option value="">
//                                 Select term
//                             </option>

//                             <option value="Term 1">
//                                 Term 1
//                             </option>

//                             <option value="Term 2">
//                                 Term 2
//                             </option>

//                             <option value="Term 3">
//                                 Term 3
//                             </option>
//                         </select>
//                     </div>

//                     {/* SESSION / YEAR */}
//                     <div className="fee-form-group">
//                         <label htmlFor="session">
//                             Session / Year
//                         </label>

//                         <input
//                             id="session"
//                             type="text"
//                             name="session"
//                             placeholder="e.g. 2026"
//                             value={formData.session}
//                             onChange={handleChange}
//                             required
//                         />
//                     </div>

//                     {/* BUTTONS */}
//                     <div className="fee-form-actions">

//                         <button
//                             type="button"
//                             className="fee-cancel-button"
//                             onClick={handleCancel}
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             className="fee-submit-button"
//                         >
//                             Create Fee
//                         </button>

//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default FeeForm;


