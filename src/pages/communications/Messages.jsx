
import React, { useEffect, useRef, useState } from "react";

import {
    getConversations,
    getConversationMessages,
    sendMessage,
} from "../../api/communicationAPI";

import "../../Styles/Messages.css";

function Messages() {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [attachment, setAttachment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    const messagesEndRef = useRef(null);

    // ==========================================
    // LOAD CONVERSATIONS
    // ==========================================

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await getConversations();

            setConversations(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load conversations:",
                error
            );

            setError(
                "Unable to load conversations."
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // AUTO SCROLL TO LATEST MESSAGE
    // ==========================================

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);

    // ==========================================
    // SELECT CONVERSATION
    // ==========================================

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        setMessages([]);
        setMessagesLoading(true);

        try {
            const response =
                await getConversationMessages(
                    conversation.id
                );

            setMessages(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load messages:",
                error
            );

            setError(
                "Unable to load messages."
            );
        } finally {
            setMessagesLoading(false);
        }
    };

    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (
            (!message.trim() && !attachment) ||
            !selectedConversation
        ) {
            return;
        }

        try {
            setSending(true);
            setError("");

            await sendMessage(
                selectedConversation.id,
                message,
                attachment
            );

            setMessage("");
            setAttachment(null);

            // Reload messages
            const updated =
                await getConversationMessages(
                    selectedConversation.id
                );

            setMessages(updated.data || []);

            // Refresh conversation list
            loadConversations();
        } catch (error) {
            console.error(
                "Failed to send message:",
                error
            );

            setError(
                "Failed to send message. Please try again."
            );
        } finally {
            setSending(false);
        }
    };

    // ==========================================
    // REMOVE ATTACHMENT
    // ==========================================

    const removeAttachment = () => {
        setAttachment(null);
    };

    // ==========================================
    // FILTER CONVERSATIONS
    // ==========================================

    const filteredConversations =
        conversations.filter((conversation) =>
            (conversation.subject || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

    // ==========================================
    // GET DISPLAY NAME
    // ==========================================

    const getSenderName = (msg) => {
        if (!msg.sender) {
            return "Unknown";
        }

        if (
            msg.sender.first_name ||
            msg.sender.last_name
        ) {
            return `${msg.sender.first_name || ""} ${
                msg.sender.last_name || ""
            }`.trim();
        }

        return (
            msg.sender.username ||
            "Unknown"
        );
    };

    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="messages-page">

            {/* =====================================
                CONVERSATION SIDEBAR
            ====================================== */}

            <aside className="conversation-sidebar">

                <div className="messages-sidebar-header">

                    <div>
                        <h2>Messages</h2>

                        <span>
                            {conversations.length}{" "}
                            {conversations.length === 1
                                ? "conversation"
                                : "conversations"}
                        </span>
                    </div>

                    <button
                        className="refresh-button"
                        onClick={loadConversations}
                        title="Refresh conversations"
                    >
                        ↻
                    </button>

                </div>

                {/* SEARCH */}

                <div className="conversation-search">
                    <span>🔍</span>

                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />
                </div>

                {/* ERROR */}

                {error && (
                    <div className="messages-error">
                        {error}
                    </div>
                )}

                {/* LOADING */}

                {loading && (
                    <div className="conversation-loading">
                        <div className="loading-spinner"></div>
                        <p>
                            Loading conversations...
                        </p>
                    </div>
                )}

                {/* EMPTY */}

                {!loading &&
                    filteredConversations.length === 0 && (
                        <div className="empty-conversations">

                            <div className="empty-icon">
                                💬
                            </div>

                            <h3>
                                {search
                                    ? "No matches found"
                                    : "No conversations yet"}
                            </h3>

                            <p>
                                {search
                                    ? "Try a different search."
                                    : "Your conversations will appear here."}
                            </p>

                        </div>
                    )}

                {/* CONVERSATIONS */}

                {!loading &&
                    filteredConversations.map(
                        (conversation) => (
                            <button
                                key={conversation.id}
                                className={`conversation-item ${
                                    selectedConversation?.id ===
                                    conversation.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    selectConversation(
                                        conversation
                                    )
                                }
                            >

                                <div className="conversation-avatar">
                                    💬
                                </div>

                                <div className="conversation-content">

                                    <div className="conversation-top">

                                        <h4>
                                            {conversation.subject ||
                                                "Conversation"}
                                        </h4>

                                    </div>

                                    <div className="conversation-bottom">

                                        <span>
                                            {conversation.messages
                                                ?.length ||
                                                0}{" "}
                                            messages
                                        </span>

                                    </div>

                                </div>

                            </button>
                        )
                    )}

            </aside>

            {/* =====================================
                CHAT AREA
            ====================================== */}

            <main className="chat-area">

                {!selectedConversation ? (

                    /* EMPTY CHAT */

                    <div className="no-conversation">

                        <div className="chat-empty-icon">
                            💬
                        </div>

                        <h2>
                            Select a conversation
                        </h2>

                        <p>
                            Choose a conversation from
                            the left to start messaging.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* CHAT HEADER */}

                        <div className="chat-header">

                            <div className="chat-header-avatar">
                                💬
                            </div>

                            <div>

                                <h3>
                                    {selectedConversation.subject ||
                                        "Conversation"}
                                </h3>

                                <span>
                                    {messages.length}{" "}
                                    {messages.length === 1
                                        ? "message"
                                        : "messages"}
                                </span>

                            </div>

                        </div>

                        {/* MESSAGES */}

                        <div className="messages-container">

                            {messagesLoading ? (

                                <div className="messages-loading">

                                    <div className="loading-spinner"></div>

                                    <p>
                                        Loading messages...
                                    </p>

                                </div>

                            ) : messages.length === 0 ? (

                                <div className="no-messages">

                                    <div>
                                        💬
                                    </div>

                                    <h3>
                                        No messages yet
                                    </h3>

                                    <p>
                                        Start the conversation
                                        by sending a message.
                                    </p>

                                </div>

                            ) : (

                                messages.map((msg) => (

                                    <div
                                        key={msg.id}
                                        className="message"
                                    >

                                        <div className="message-avatar">
                                            {getSenderName(
                                                msg
                                            )
                                                .charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div className="message-content">

                                            <div className="message-meta">

                                                <strong>
                                                    {getSenderName(
                                                        msg
                                                    )}
                                                </strong>

                                                <span>
                                                    {msg.created_at
                                                        ? new Date(
                                                              msg.created_at
                                                          ).toLocaleString()
                                                        : ""}
                                                </span>

                                            </div>

                                            {msg.body && (
                                                <div className="message-body">
                                                    {msg.body}
                                                </div>
                                            )}

                                            {msg.attachment && (
                                                <a
                                                    href={
                                                        msg.attachment
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="message-attachment"
                                                >
                                                    📎 View attachment
                                                </a>
                                            )}

                                        </div>

                                    </div>

                                ))

                            )}

                            <div ref={messagesEndRef} />

                        </div>

                        {/* ATTACHMENT PREVIEW */}

                        {attachment && (
                            <div className="attachment-preview">

                                <span>
                                    📎 {attachment.name}
                                </span>

                                <button
                                    type="button"
                                    onClick={
                                        removeAttachment
                                    }
                                >
                                    ✕
                                </button>

                            </div>
                        )}

                        {/* MESSAGE FORM */}

                        <form
                            className="message-form"
                            onSubmit={
                                handleSendMessage
                            }
                        >

                            <label
                                className="attachment-button"
                                title="Attach file"
                            >
                                📎

                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setAttachment(
                                            e.target.files[0] ||
                                                null
                                        )
                                    }
                                    hidden
                                />
                            </label>

                            <input
                                type="text"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value
                                    )
                                }
                                disabled={sending}
                            />

                            <button
                                type="submit"
                                disabled={
                                    sending ||
                                    (!message.trim() &&
                                        !attachment)
                                }
                            >
                                {sending
                                    ? "Sending..."
                                    : "Send"}
                            </button>

                        </form>

                    </>

                )}

            </main>

        </div>
    );
}

export default Messages;




// import React, { useEffect, useState } from "react";
// import {
//     getConversations,
//     getConversationMessages,
//     sendMessage,
// } from "../../api/communicationAPI";

// import "../../Styles/Messages.css";

// function Messages() {

//     const [conversations, setConversations] = useState([]);
//     const [selectedConversation, setSelectedConversation] = useState(null);
//     const [messages, setMessages] = useState([]);

//     const [message, setMessage] = useState("");
//     const [attachment, setAttachment] = useState(null);

//     const [loading, setLoading] = useState(true);

//     // ==========================================
//     // LOAD CONVERSATIONS
//     // ==========================================

//     useEffect(() => {

//         loadConversations();

//     }, []);


//     const loadConversations = async () => {

//         try {

//             const response = await getConversations();

//             setConversations(response.data);

//         } catch (error) {

//             console.error(
//                 "Failed to load conversations:",
//                 error
//             );

//         } finally {

//             setLoading(false);

//         }
//     };


//     // ==========================================
//     // SELECT CONVERSATION
//     // ==========================================

//     const selectConversation = async (conversation) => {

//         setSelectedConversation(conversation);

//         try {

//             const response =
//                 await getConversationMessages(conversation.id);

//             setMessages(response.data);

//         } catch (error) {

//             console.error(
//                 "Failed to load messages:",
//                 error
//             );

//         }
//     };


//     // ==========================================
//     // SEND MESSAGE
//     // ==========================================

//     const handleSendMessage = async (e) => {

//         e.preventDefault();

//         if (!message.trim() && !attachment) {
//             return;
//         }

//         if (!selectedConversation) {
//             return;
//         }

//         try {

//             const response = await sendMessage(
//                 selectedConversation.id,
//                 message,
//                 attachment
//             );

//             console.log(response.data);

//             setMessage("");
//             setAttachment(null);

//             // Reload messages
//             const updated =
//                 await getConversationMessages(
//                     selectedConversation.id
//                 );

//             setMessages(updated.data);

//         } catch (error) {

//             console.error(
//                 "Failed to send message:",
//                 error
//             );

//         }
//     };


//     return (

//         <div className="messages-page">

//             {/* =========================
//                 CONVERSATION SIDEBAR
//             ========================== */}

//             <div className="conversation-sidebar">

//                 <div className="messages-title">
//                     <h2>Messages</h2>
//                 </div>

//                 {loading && (
//                     <p>Loading conversations...</p>
//                 )}

//                 {!loading &&
//                     conversations.length === 0 && (
//                         <p className="empty-message">
//                             No conversations yet.
//                         </p>
//                     )}

//                 {conversations.map((conversation) => (

//                     <div
//                         key={conversation.id}
//                         className={`conversation-item ${
//                             selectedConversation?.id === conversation.id
//                                 ? "active"
//                                 : ""
//                         }`}
//                         onClick={() =>
//                             selectConversation(conversation)
//                         }
//                     >

//                         <h4>
//                             {conversation.subject}
//                         </h4>

//                         <small>
//                             {conversation.messages?.length || 0}
//                             {" "}
//                             messages
//                         </small>

//                     </div>

//                 ))}

//             </div>


//             {/* =========================
//                 CHAT AREA
//             ========================== */}

//             <div className="chat-area">

//                 {!selectedConversation ? (

//                     <div className="no-conversation">

//                         <h3>
//                             Select a conversation
//                         </h3>

//                         <p>
//                             Choose a conversation to start
//                             messaging.
//                         </p>

//                     </div>

//                 ) : (

//                     <>

//                         <div className="chat-header">

//                             <h3>
//                                 {selectedConversation.subject}
//                             </h3>

//                         </div>


//                         {/* MESSAGES */}

//                         <div className="messages-container">

//                             {messages.map((msg) => (

//                                 <div
//                                     key={msg.id}
//                                     className="message"
//                                 >

//                                     <div className="message-sender">
//                                         {msg.sender?.username}
//                                     </div>

//                                     <div className="message-body">
//                                         {msg.body}
//                                     </div>

//                                     <div className="message-time">
//                                         {new Date(
//                                             msg.created_at
//                                         ).toLocaleString()}
//                                     </div>

//                                 </div>

//                             ))}

//                         </div>


//                         {/* SEND MESSAGE */}

//                         <form
//                             className="message-form"
//                             onSubmit={handleSendMessage}
//                         >

//                             <input
//                                 type="text"
//                                 placeholder="Type a message..."
//                                 value={message}
//                                 onChange={(e) =>
//                                     setMessage(e.target.value)
//                                 }
//                             />

//                             <input
//                                 type="file"
//                                 onChange={(e) =>
//                                     setAttachment(
//                                         e.target.files[0]
//                                     )
//                                 }
//                             />

//                             <button type="submit">
//                                 Send
//                             </button>

//                         </form>

//                     </>

//                 )}

//             </div>

//         </div>
//     );
// }

// export default Messages;