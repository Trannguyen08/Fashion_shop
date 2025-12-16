import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaUser } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import "bootstrap/dist/css/bootstrap.min.css";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Chúng tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (inputMessage.trim() === "") return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages([...messages, userMessage]);
    setInputMessage("");

    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage = {
        id: messages.length + 2,
        text: botResponse,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("giá") || lowerMessage.includes("bao nhiêu")) {
      return "Giá sản phẩm của chúng tôi dao động từ 200.000đ - 2.000.000đ. Bạn muốn xem sản phẩm nào cụ thể?";
    } else if (lowerMessage.includes("giao hàng") || lowerMessage.includes("ship")) {
      return "Chúng tôi có chính sách giao hàng toàn quốc. Thời gian giao hàng từ 2-5 ngày làm việc. Miễn phí ship cho đơn hàng trên 500.000đ!";
    } else if (lowerMessage.includes("đổi trả")) {
      return "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên vẹn và chưa qua sử dụng.";
    } else if (lowerMessage.includes("thanh toán")) {
      return "Chúng tôi chấp nhận thanh toán qua: Tiền mặt khi nhận hàng (COD), Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay).";
    } else if (lowerMessage.includes("size") || lowerMessage.includes("cỡ")) {
      return "Chúng tôi có đầy đủ các size từ S đến XXL. Bạn có thể tham khảo bảng size trên trang sản phẩm hoặc liên hệ trực tiếp để được tư vấn.";
    } else if (lowerMessage.includes("chào") || lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Xin chào! Rất vui được hỗ trợ bạn. Bạn cần tư vấn về sản phẩm nào?";
    } else if (lowerMessage.includes("cảm ơn") || lowerMessage.includes("thanks")) {
      return "Rất hân hạnh được phục vụ bạn! Chúc bạn mua sắm vui vẻ! 😊";
    } else {
      return "Cảm ơn bạn đã liên hệ! Đội ngũ hỗ trợ sẽ phản hồi sớm nhất có thể. Bạn có thể gọi hotline: 1900-xxxx để được hỗ trợ nhanh hơn.";
    }
  };

  const quickReplies = [
    "Chính sách giao hàng",
    "Chính sách đổi trả",
    "Phương thức thanh toán",
    "Hướng dẫn chọn size"
  ];

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <>
      {/* Chat Icon Button */}
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
          transition: "all 0.3s ease",
          zIndex: 999
        }}
      >
        <FaComments size={28} />
        <span 
          className="position-absolute bg-danger text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
          style={{
            top: "-5px",
            right: "-5px",
            width: "24px",
            height: "24px",
            fontSize: "12px",
            border: "2px solid white"
          }}
        >
          1
        </span>
      </div>

      {/* Chat Window */}
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
          {/* Header */}
          <div 
            className="chat-header text-white p-3 d-flex justify-content-between align-items-center"
            style={{
              background: "linear-gradient(135deg, #e70463 0%, #ff1744 100%)"
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <div 
                className="rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "rgba(255, 255, 255, 0.2)"
                }}
              >
                <FaUser />
              </div>
              <div>
                <h6 className="mb-0 fw-semibold">Hỗ trợ khách hàng</h6>
                <small style={{ opacity: 0.9 }}>● Online</small>
              </div>
            </div>
            <button 
              className="btn btn-link text-white p-0 rounded-circle d-flex align-items-center justify-content-center"
              onClick={toggleChat}
              style={{ 
                textDecoration: "none",
                width: "30px",
                height: "30px",
                minWidth: "30px",
                transition: "all 0.3s ease"
              }}
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="chat-messages flex-grow-1 p-3 overflow-auto"
            style={{ background: "#f8f9fa" }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex mb-3 ${message.sender === "user" ? "justify-content-end" : "justify-content-start"}`}
              >
                <div 
                  className={`rounded-4 p-3 ${message.sender === "user" ? "text-white" : "bg-white shadow-sm"}`}
                  style={{
                    maxWidth: "75%",
                    background: message.sender === "user" ? "#e70463" : "white",
                    borderBottomLeftRadius: message.sender === "bot" ? "4px" : "16px",
                    borderBottomRightRadius: message.sender === "user" ? "4px" : "16px"
                  }}
                >
                  <p className="mb-1" style={{ fontSize: "14px", lineHeight: 1.5 }}>
                    {message.text}
                  </p>
                  <small style={{ fontSize: "11px", opacity: 0.7 }}>
                    {message.timestamp}
                  </small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <div className="mt-3">
                <p className="text-muted mb-2" style={{ fontSize: "12px" }}>
                  Câu hỏi thường gặp:
                </p>
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    className="btn btn-outline-secondary btn-sm w-100 mb-2 text-start rounded-pill"
                    onClick={() => handleQuickReply(reply)}
                    style={{ fontSize: "13px" }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-top p-3 bg-white d-flex gap-2">
            <input
              type="text"
              className="form-control rounded-pill"
              placeholder="Nhập tin nhắn..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ fontSize: "14px" }}
            />
            <button 
              className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
              onClick={handleSendMessage}
              style={{
                width: "44px",
                height: "44px",
                background: "#e70463",
                border: "none",
                transition: "all 0.3s ease"
              }}
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