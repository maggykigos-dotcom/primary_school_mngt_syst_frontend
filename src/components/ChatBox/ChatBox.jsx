import { useState } from "react";
import useChat from "../../hooks/useChat";
import "./ChatBox.css";

const ChatBox = ({ conversationId }) => {
  const [message, setMessage] = useState("");

  const {
    messages,
    sendMessage,
    connected,
  } = useChat(conversationId);

  const handleSend = (event) => {
    event.preventDefault();

    if (!message.trim()) return;

    sendMessage(message);

    setMessage("");
  };

  return (
    <div className="chat-box">

      <div className="chat-header">
        <div>
          <h3>Messages</h3>

          <span>
            {connected
              ? "Online"
              : "Offline"}
          </span>
        </div>
      </div>

      <div className="chat-messages">

        {messages.map(
          (item, index) => (
            <div
              className="chat-message"
              key={
                item.id || index
              }
            >
              <strong>
                {item.sender_name}
              </strong>

              <p>
                {item.message}
              </p>
            </div>
          )
        )}

      </div>

      <form
        className="chat-form"
        onSubmit={handleSend}
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(event) =>
            setMessage(
              event.target.value
            )
          }
        />

        <button type="submit">
          Send
        </button>
      </form>

    </div>
  );
};

export default ChatBox;