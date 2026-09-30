import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getMessageableUsers,
    createConversation,
} from "../../api/communicationAPI";

import "../../Styles/form.css";


const CreateConversationForm = () => {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [subject, setSubject] = useState("");
    const [receiverIds, setReceiverIds] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    // =====================================================
    // LOAD MESSAGEABLE USERS
    // =====================================================

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                setError("");

                const response =
                    await getMessageableUsers();

                const data = response.data;

                if (Array.isArray(data)) {
                    setUsers(data);
                } else if (
                    Array.isArray(data?.results)
                ) {
                    setUsers(data.results);
                } else {
                    setUsers([]);
                }

            } catch (error) {
                console.error(
                    "Failed to load messageable users:",
                    error
                );

                setError(
                    error.response?.data?.detail ||
                    "Unable to load users you can message."
                );

                setUsers([]);

            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);


    // =====================================================
    // DISPLAY NAME
    // =====================================================

    const getUserName = (user) => {
        const fullName = `${user.first_name || ""} ${
            user.last_name || ""
        }`.trim();

        return (
            fullName ||
            user.username ||
            "Unknown User"
        );
    };


    // =====================================================
    // RECEIVER SELECTION
    // =====================================================

    const handleReceiverChange = (event) => {
        const selectedIds = Array.from(
            event.target.selectedOptions,
            (option) => option.value
        );

        setReceiverIds(selectedIds);
    };


    // =====================================================
    // REMOVE RECEIVER
    // =====================================================

    const removeReceiver = (id) => {
        setReceiverIds((currentIds) =>
            currentIds.filter(
                (receiverId) =>
                    String(receiverId) !== String(id)
            )
        );
    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!subject.trim()) {
            setError(
                "Please enter a conversation subject."
            );
            return;
        }

        if (receiverIds.length === 0) {
            setError(
                "Please select at least one receiver."
            );
            return;
        }

        try {
            setSubmitting(true);

            await createConversation(
                subject.trim(),
                receiverIds.map(Number)
            );

            setSuccess(
                "Conversation created successfully."
            );

            setSubject("");
            setReceiverIds([]);

            setTimeout(() => {
                navigate("/messages");
            }, 1000);

        } catch (error) {
            console.error(
                "Create conversation error:",
                error
            );

            const backendError =
                error.response?.data;

            if (backendError?.detail) {
                setError(
                    backendError.detail
                );
            } else if (
                backendError?.receiver_ids
            ) {
                setError(
                    backendError.receiver_ids.join(" ")
                );
            } else {
                setError(
                    "Failed to create conversation."
                );
            }

        } finally {
            setSubmitting(false);
        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="form-page">

            <div className="form-card">

                {/* HEADER */}

                <div className="form-header">

                    <h2>
                        Create Conversation
                    </h2>

                    <p>
                        Start a conversation with
                        one or more users.
                    </p>

                </div>


                {/* ERROR */}

                {error && (
                    <div className="form-error">
                        {error}
                    </div>
                )}


                {/* SUCCESS */}

                {success && (
                    <div className="form-success">
                        {success}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    {/* SUBJECT */}

                    <div className="form-group">

                        <label htmlFor="subject">
                            Subject
                        </label>

                        <input
                            id="subject"
                            type="text"
                            value={subject}
                            onChange={(event) =>
                                setSubject(
                                    event.target.value
                                )
                            }
                            placeholder="Enter conversation subject"
                            required
                        />

                    </div>


                    {/* RECEIVERS */}

                    <div className="form-group">

                        <label htmlFor="receivers">
                            Select Receivers
                        </label>


                        {loadingUsers ? (

                            <p className="form-help">
                                Loading users...
                            </p>

                        ) : users.length === 0 ? (

                            <p className="form-help">
                                No users are available
                                for you to message.
                            </p>

                        ) : (

                            <select
                                id="receivers"
                                className="receiver-select"
                                multiple
                                value={receiverIds}
                                onChange={
                                    handleReceiverChange
                                }
                                required
                            >

                                {users.map((user) => (

                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {getUserName(user)}
                                        {" — "}
                                        {user.role}
                                    </option>

                                ))}

                            </select>
                        )}


                        <small className="receiver-help">
                            Hold Ctrl on Windows or
                            Command on Mac to select
                            multiple users.
                        </small>

                    </div>


                    {/* SELECTED RECEIVERS */}

                    {receiverIds.length > 0 && (

                        <div className="form-group">

                            <label>
                                Selected Receivers
                            </label>

                            <div className="selected-receivers">

                                {receiverIds.map((id) => {

                                    const selectedUser =
                                        users.find(
                                            (item) =>
                                                String(
                                                    item.id
                                                ) ===
                                                String(id)
                                        );

                                    if (!selectedUser) {
                                        return null;
                                    }

                                    return (

                                        <span
                                            className="receiver-tag"
                                            key={id}
                                        >

                                            {getUserName(
                                                selectedUser
                                            )}

                                            <button
                                                type="button"
                                                className="receiver-tag-remove"
                                                onClick={() =>
                                                    removeReceiver(
                                                        id
                                                    )
                                                }
                                                aria-label={`Remove ${getUserName(
                                                    selectedUser
                                                )}`}
                                            >
                                                ×
                                            </button>

                                        </span>
                                    );
                                })}

                            </div>

                        </div>
                    )}


                    {/* BUTTONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() =>
                                navigate("/messages")
                            }
                            disabled={submitting}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                submitting ||
                                loadingUsers ||
                                receiverIds.length === 0
                            }
                        >
                            {submitting
                                ? "Creating..."
                                : "Create Conversation"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};


export default CreateConversationForm;

// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import API from "../../api/axios";
// import { createConversation } from "../../api/communicationAPI";

// import "../../Styles/form.css";

// const CreateConversationForm = () => {
//     const navigate = useNavigate();

//     const [users, setUsers] = useState([]);
//     const [subject, setSubject] = useState("");
//     const [receiverIds, setReceiverIds] = useState([]);

//     const [loadingUsers, setLoadingUsers] = useState(true);
//     const [submitting, setSubmitting] = useState(false);

//     const [error, setError] = useState("");
//     const [success, setSuccess] = useState("");

//     // ==========================================
//     // LOAD USERS
//     // ==========================================

//     useEffect(() => {
//         const loadUsers = async () => {
//             try {
//                 setLoadingUsers(true);
//                 setError("");

//                 // Use the users endpoint from the auth app
//                 const response = await API.get("auth/users/");

//                 setUsers(response.data || []);
//             } catch (error) {
//                 console.error("Failed to load users:", error);

//                 setError(
//                     error.response?.data?.detail ||
//                     "Unable to load users."
//                 );
//             } finally {
//                 setLoadingUsers(false);
//             }
//         };

//         loadUsers();
//     }, []);

//     // ==========================================
//     // GET DISPLAY NAME
//     // ==========================================

//     const getUserName = (user) => {
//         const fullName = `${user.first_name || ""} ${
//             user.last_name || ""
//         }`.trim();

//         return fullName || user.username || "Unknown User";
//     };

//     // ==========================================
//     // RECEIVER SELECTION
//     // ==========================================

//     const handleReceiverChange = (event) => {
//         const selectedIds = Array.from(
//             event.target.selectedOptions,
//             (option) => option.value
//         );

//         setReceiverIds(selectedIds);
//     };

//     // ==========================================
//     // REMOVE RECEIVER
//     // ==========================================

//     const removeReceiver = (id) => {
//         setReceiverIds((currentIds) =>
//             currentIds.filter(
//                 (receiverId) => receiverId !== id
//             )
//         );
//     };

//     // ==========================================
//     // SUBMIT
//     // ==========================================

//     const handleSubmit = async (event) => {
//         event.preventDefault();

//         setError("");
//         setSuccess("");

//         if (!subject.trim()) {
//             setError(
//                 "Please enter a conversation subject."
//             );
//             return;
//         }

//         if (receiverIds.length === 0) {
//             setError(
//                 "Please select at least one receiver."
//             );
//             return;
//         }

//         try {
//             setSubmitting(true);

//             await createConversation(
//                 subject.trim(),
//                 receiverIds.map(Number)
//             );

//             setSuccess(
//                 "Conversation created successfully."
//             );

//             setSubject("");
//             setReceiverIds([]);

//             setTimeout(() => {
//                 navigate("/messages");
//             }, 1000);
//         } catch (error) {
//             console.error(
//                 "Create conversation error:",
//                 error
//             );

//             const backendError =
//                 error.response?.data;

//             if (backendError?.detail) {
//                 setError(backendError.detail);
//             } else if (
//                 backendError?.receiver_ids
//             ) {
//                 setError(
//                     backendError.receiver_ids.join(" ")
//                 );
//             } else {
//                 setError(
//                     "Failed to create conversation."
//                 );
//             }
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     // ==========================================
//     // RENDER
//     // ==========================================

//     return (
//         <div className="form-page">
//             <div className="form-card">

//                 {/* HEADER */}

//                 <div className="form-header">
//                     <h2>Create Conversation</h2>

//                     <p>
//                         Start a conversation with one
//                         or more users.
//                     </p>
//                 </div>

//                 {/* ERROR */}

//                 {error && (
//                     <div className="form-error">
//                         {error}
//                     </div>
//                 )}

//                 {/* SUCCESS */}

//                 {success && (
//                     <div className="form-success">
//                         {success}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit}>

//                     {/* SUBJECT */}

//                     <div className="form-group">
//                         <label htmlFor="subject">
//                             Subject
//                         </label>

//                         <input
//                             id="subject"
//                             type="text"
//                             value={subject}
//                             onChange={(event) =>
//                                 setSubject(
//                                     event.target.value
//                                 )
//                             }
//                             placeholder="Enter conversation subject"
//                             required
//                         />
//                     </div>

//                     {/* RECEIVERS */}

//                     <div className="form-group">
//                         <label htmlFor="receivers">
//                             Select Receivers
//                         </label>

//                         {loadingUsers ? (
//                             <p className="form-help">
//                                 Loading users...
//                             </p>
//                         ) : users.length === 0 ? (
//                             <p className="form-help">
//                                 No users are available.
//                             </p>
//                         ) : (
//                             <select
//                                 id="receivers"
//                                 className="receiver-select"
//                                 multiple
//                                 value={receiverIds}
//                                 onChange={
//                                     handleReceiverChange
//                                 }
//                                 required
//                             >
//                                 {users.map((user) => (
//                                     <option
//                                         key={user.id}
//                                         value={user.id}
//                                     >
//                                         {getUserName(user)}
//                                         {" — "}
//                                         {user.role ||
//                                             "user"}
//                                     </option>
//                                 ))}
//                             </select>
//                         )}

//                         <small className="receiver-help">
//                             Hold Ctrl on Windows or
//                             Command on Mac to select
//                             multiple users.
//                         </small>
//                     </div>

//                     {/* SELECTED RECEIVERS */}

//                     {receiverIds.length > 0 && (
//                         <div className="form-group">
//                             <label>
//                                 Selected Receivers
//                             </label>

//                             <div className="selected-receivers">
//                                 {receiverIds.map((id) => {
//                                     const selectedUser =
//                                         users.find(
//                                             (item) =>
//                                                 String(
//                                                     item.id
//                                                 ) ===
//                                                 String(id)
//                                         );

//                                     if (!selectedUser) {
//                                         return null;
//                                     }

//                                     return (
//                                         <span
//                                             className="receiver-tag"
//                                             key={id}
//                                         >
//                                             {getUserName(
//                                                 selectedUser
//                                             )}

//                                             <button
//                                                 type="button"
//                                                 className="receiver-tag-remove"
//                                                 onClick={() =>
//                                                     removeReceiver(
//                                                         id
//                                                     )
//                                                 }
//                                                 aria-label={`Remove ${getUserName(
//                                                     selectedUser
//                                                 )}`}
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     );
//                                 })}
//                             </div>
//                         </div>
//                     )}

//                     {/* BUTTONS */}

//                     <div className="form-actions">

//                         <button
//                             type="button"
//                             className="btn btn-secondary"
//                             onClick={() =>
//                                 navigate("/messages")
//                             }
//                             disabled={submitting}
//                         >
//                             Cancel
//                         </button>

//                         <button
//                             type="submit"
//                             className="btn btn-primary"
//                             disabled={
//                                 submitting ||
//                                 loadingUsers ||
//                                 receiverIds.length === 0
//                             }
//                         >
//                             {submitting
//                                 ? "Creating..."
//                                 : "Create Conversation"}
//                         </button>

//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default CreateConversationForm;


