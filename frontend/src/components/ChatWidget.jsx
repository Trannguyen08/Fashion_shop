import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaUser } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("accessToken");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("http://127.0.0.1:8000/chat/messages/", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setRoomId(data.room_id);

      const history = data.messages.map(m => ({
        id: m.id,
        text: m.message,
        sender: m.sender_role === "admin" ? "bot" : "user",
        timestamp: new Date(m.created_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      }));

      setMessages(history);
    } catch (err) {
      console.error("Load chat failed", err);
    } finally {
      setLoading(false);
    }
  };


  // Toggle mở widget → load tin nhắn
  const toggleChat = async () => {
    const newState = !isOpen;
    setIsOpen(newState);

    if (newState) {
      await loadMessages();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const tempMsg = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      })
    };

    setMessages(prev => [...prev, tempMsg]);
    const text = inputMessage;
    setInputMessage("");

    try {
      await axios.post(
        `http://127.0.0.1:8000/chat/room/${roomId}/send/`,
        { message: text },
        { 
          headers: {
            Authorization: `Bearer ${token}`
          } 
        }
      );
    } catch (err) {
      console.error("Send failed", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* ICON BUTTON */}
      <div
        className={`chat-icon position-fixed rounded-circle d-flex align-items-center justify-content-center ${isOpen ? "d-none" : ""}`}
        onClick={toggleChat}
        style={{
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #e70463 0%, #ff1744 100%)",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(231, 4, 99, 0.4)",
          zIndex: 999
        }}
      >
        <FaComments size={28} />
      </div>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div
          className="chat-window position-fixed bg-white rounded-4 shadow-lg d-flex flex-column"
          style={{
            bottom: "30px",
            right: "30px",
            width: "380px",
            height: "550px",
            zIndex: 1000,
            overflow: "hidden"
          }}
        >
          {/* HEADER */}
          <div
            className="chat-header text-white p-3 d-flex justify-content-between align-items-center"
            style={{ background: "linear-gradient(135deg, #e70463 0%, #ff1744 100%)" }}
          >
            <div className="d-flex align-items-center gap-3">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px", background: "rgba(255,255,255,0.2)" }}
              >
                <FaUser />
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">Hỗ trợ khách hàng</h6>
                <small>● Online</small>
              </div>
            </div>

            <button className="btn btn-link text-white p-0" onClick={toggleChat}>
              <FaTimes size={18} />
            </button>
          </div>

          {/* MESSAGES */}
          <div className="chat-messages flex-grow-1 p-3 overflow-auto" style={{ background: "#f8f9fa" }}>
            {loading ? (
              <p className="text-center text-muted mt-3">Đang tải tin nhắn...</p>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`d-flex mb-3 ${msg.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
                >
                  <div
                    className={`rounded-4 p-3 ${msg.sender === "user" ? "text-white" : "bg-white shadow-sm"}`}
                    style={{
                      maxWidth: "75%",
                      background: msg.sender === "user" ? "#e70463" : "white"
                    }}
                  >
                    <p className="mb-1">{msg.text}</p>
                    <small style={{ opacity: 0.7 }}>{msg.timestamp}</small>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="border-top p-3 bg-white d-flex gap-2">
            <input
              className="form-control rounded-pill"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />

            <button
              className="btn rounded-circle d-flex align-items-center justify-content-center"
              onClick={handleSendMessage}
              style={{ width: "44px", height: "44px", background: "#e70463", color: "white" }}
            >
              <IoSend size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
