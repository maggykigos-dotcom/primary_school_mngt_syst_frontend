import API from "./axios";

// ==========================================
// USERS
// ==========================================

export const getMessageableUsers = () => {
    return API.get("communication/users/");
};

// ==========================================
// CONVERSATIONS
// ==========================================

// Get logged-in user's conversations
export const getConversations = () => {
    return API.get("communication/conversations/");
};

// Create a new conversation
export const createConversation = (subject, receiverIds) => {
    return API.post("communication/conversations/create/", {
        subject: subject,
        receiver_ids: receiverIds,
    });
};

// ==========================================
// MESSAGES
// ==========================================

// Get messages for a conversation
export const getConversationMessages = (conversationId) => {
    return API.get(
        `communication/conversations/${conversationId}/messages/`
    );
};

// Send a message
export const sendMessage = (
    conversationId,
    body,
    attachment = null
) => {
    const formData = new FormData();

    formData.append("conversation_id", conversationId);
    formData.append("body", body);

    if (attachment) {
        formData.append("attachment", attachment);
    }

    return API.post(
        "communication/messages/send/",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
};

// Mark message as read
export const markMessageAsRead = (messageId) => {
    return API.post(
        "communication/messages/read/",
        {
            message_id: messageId,
        }
    );
};

// ==========================================
// NOTIFICATIONS
// ==========================================

// Get notifications
export const getNotifications = async () => {
    const response = await API.get(
        "communication/notifications/"
    );

    // Django REST Framework may return either:
    // 1. Direct array
    // 2. Paginated { results: [...] }
    // 3. Wrapped { data: [...] }

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.data?.results)) {
        return response.data.results;
    }

    if (Array.isArray(response.data?.data)) {
        return response.data.data;
    }

    console.warn(
        "Unexpected notifications response:",
        response.data
    );

    return [];
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    return API.post(
        "communication/notifications/read/",
        {
            notification_id: notificationId,
        }
    );
};




// import API from "./axios";

// // ==========================================
// // CONVERSATIONS
// // ==========================================

// // Get logged-in user's conversations
// export const getConversations = () => {
//     return API.get("communication/conversations/");
// };


// // Create a new conversation
// export const createConversation = (subject, receiverIds) => {
//     return API.post("communication/conversations/create/", {
//         subject: subject,
//         receiver_ids: receiverIds,
//     });
// };


// // ==========================================
// // MESSAGES
// // ==========================================

// // Get messages for a conversation
// export const getConversationMessages = (conversationId) => {
//     return API.get(
//         `communication/conversations/${conversationId}/messages/`
//     );
// };


// // Send a message
// export const sendMessage = (conversationId, body, attachment = null) => {

//     const formData = new FormData();

//     formData.append("conversation_id", conversationId);
//     formData.append("body", body);

//     if (attachment) {
//         formData.append("attachment", attachment);
//     }

//     return API.post("communication/messages/send/", formData, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     });
// };


// // Mark message as read
// export const markMessageAsRead = (messageId) => {
//     return API.post("communication/messages/read/", {
//         message_id: messageId,
//     });
// };


// // ==========================================
// // NOTIFICATIONS
// // ==========================================

// // Get notifications
// export const getNotifications = async () => {
//     const response = await API.get("communication/notifications/");

//     if (Array.isArray(response.data)) {
//         return response.data;
//     }

//     if (Array.isArray(response.data?.results)) {
//         return response.data.results;
//     }

//     return [];
// };
// // export const getNotifications = () => {
// //     return API.get("communication/notifications/");
// // };


// // Mark notification as read
// export const markNotificationAsRead = (notificationId) => {
//     return API.post("communication/notifications/read/", {
//         notification_id: notificationId,
//     });
// };