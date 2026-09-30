import { useEffect, useRef, useState } from "react";

const useChat = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);

  useEffect(() => {
    if (!conversationId) return;

    const token = localStorage.getItem("access_token");

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages((previous) => [
        ...previous,
        data,
      ]);
    };

    socket.onclose = () => {
      setConnected(false);
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      socket.close();
    };
  }, [conversationId]);

  const sendMessage = (message) => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(
        JSON.stringify({
          message,
        })
      );
    }
  };

  return {
    messages,
    sendMessage,
    connected,
  };
};

export default useChat;