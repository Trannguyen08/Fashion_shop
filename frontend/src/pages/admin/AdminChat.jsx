import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Circle
} from 'lucide-react';

const token = localStorage.getItem("admin_accessToken");
const defaultAvatar = 'https://th.bing.com/th?q=%e1%ba%a2nh+M%c3%a8o+Cute&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.3&pid=InlineBlock&rm=3&mkt=en-WW&cc=VN&setlang=en&adlt=moderate&t=1&mw=247';

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [wsConnected, setWsConnected] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const messagesEndRef = useRef(null);
  const wsRef = useRef(null); // 🔥 WebSocket reference

  // Scroll xuống cuối chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔥 WebSocket Connection
  useEffect(() => {
    if (!roomId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//127.0.0.1:8000/ws/chat/${roomId}/?token=${token}`;
    
    console.log("🔌 Admin connecting to WebSocket:", wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Admin WebSocket connected");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("📩 Admin received message:", data);

      const newMsg = {
        id: Date.now() + Math.random(),
        sender: data.sender === "admin" ? "admin" : "customer",
        content: data.message,
        timestamp: data.time || new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      // Tránh duplicate
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg.content === newMsg.content && 
          Math.abs(msg.id - newMsg.id) < 1000
        );
        return exists ? prev : [...prev, newMsg];
      });

      // 🔥 Cập nhật last_message trong sidebar
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === selectedUser?.id 
            ? { ...u, last_message: data.message } 
            : u
        )
      );
    };

    ws.onerror = (error) => {
      console.error("❌ Admin WebSocket error:", error);
      setWsConnected(false);
    };

    ws.onclose = () => {
      console.log("🔌 Admin WebSocket disconnected");
      setWsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomId, selectedUser]);

  // ======================
  // 🔵 Load danh sách user
  // ======================
  const loadUsers = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/chat/api/customers/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response && response.data && response.data.customers) {
        const customers = response.data.customers;
        console.log("Loaded users:", customers);
        setUsers(customers);
        if (customers.length > 0) {
          setSelectedUser(customers[0]);
        }
      } else {
        console.error("Dữ liệu không đúng định dạng:", response.data);
      }
    } catch (err) {
      console.error("Load users failed:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ======================
  // 🔵 Load tin nhắn
  // ======================
  const loadMessages = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`http://127.0.0.1:8000/chat/api/${userId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 🔥 Lưu roomId để kết nối WebSocket
      setRoomId(data.room_id);

      setMessages(data.messages.map(m => ({
        id: m.id,
        sender: m.sender_role === "admin" ? 'admin' : 'customer',
        content: m.message,
        timestamp: new Date(m.created_at).toLocaleTimeString("vi-VN", { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      })));
    } catch (err) {
      console.error("Load messages failed", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      loadMessages(selectedUser.id);
    }
  }, [selectedUser]);

  // ======================
  // 🟢 Gửi tin nhắn
  // ======================
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const text = messageInput.trim();
    setMessageInput('');

    // 🔥 Ưu tiên gửi qua WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        message: text
      }));
      console.log("📤 Admin sent via WebSocket:", text);
    } else {
      // ⚠️ Fallback: HTTP nếu WebSocket chưa kết nối
      console.warn("⚠️ Admin WebSocket not connected, using HTTP fallback");

      const newMessage = {
        id: Date.now(),
        sender: 'admin',
        content: text,
        timestamp: new Date().toLocaleTimeString("vi-VN", { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
      };

      setMessages(prev => [...prev, newMessage]);

      try {
        await axios.post(
          `http://127.0.0.1:8000/chat/api/room/${roomId}/send/`, 
          { message: text },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        console.error("Send message failed", err);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <MessageCircle className="me-2 text-primary" size={28} /> 
          Quản Lý Tin Nhắn
          {wsConnected && (
            <span className="badge bg-success ms-3">
              <Circle size={8} fill="currentColor" className="me-1" />
              Real-time Active
            </span>
          )}
        </h2>
      </div>

      {/* CHAT LAYOUT */}
      <div className="row g-0" style={{ height: 'calc(100vh - 140px)' }}>
        {/* SIDEBAR - User List */}
        <div className="col-md-4 col-lg-3">
          <div className="card border-0 shadow-sm h-100 d-flex flex-column">
            {/* Search Box */}
            <div className="p-3 border-bottom">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0">
                  <Search size={16} />
                </span>
                <input 
                  type="text" 
                  className="form-control border-start-0" 
                  placeholder="Tìm khách hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-grow-1 overflow-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-center text-muted mt-3">Chưa có khách hàng nào</p>
              ) : (
                filteredUsers.map(user => (
                  <div 
                    key={user.id} 
                    className={`p-3 border-bottom ${
                      selectedUser?.id === user.id 
                        ? 'bg-primary bg-opacity-10' 
                        : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="position-relative me-3">
                        <img 
                          src={user.avatar || defaultAvatar} 
                          alt={user.full_name} 
                          className="rounded-circle" 
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
                        {user.online && (
                          <Circle 
                            size={12} 
                            className="position-absolute bottom-0 end-0 text-success" 
                            fill="currentColor" 
                          />
                        )}
                      </div>
                      <div className="flex-grow-1" style={{ minWidth: 0 }}>
                        <h6 className="mb-0 fw-semibold text-truncate">
                          {user.full_name}
                        </h6>
                        <p className="mb-0 text-muted small text-truncate">
                          {user.last_message || "Chưa có tin nhắn"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm h-100 ms-md-3 d-flex flex-column">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="p-3 border-bottom d-flex align-items-center">
                  <img 
                    src={selectedUser?.avatar || defaultAvatar} 
                    alt="" 
                    className="rounded-circle me-2" 
                    style={{ width: 40, height: 40, objectFit: 'cover' }} 
                  />
                  <div>
                    <h6 className="mb-0 fw-semibold">{selectedUser?.full_name}</h6>
                    <small className="text-muted">
                      {wsConnected ? '● Online' : '○ Đang kết nối...'}
                    </small>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
                  {messages.length === 0 ? (
                    <p className="text-center text-muted mt-3">Chưa có tin nhắn</p>
                  ) : (
                    messages.map(msg => (
                      <div 
                        key={msg.id} 
                        className={`d-flex mb-3 ${
                          msg.sender === 'admin' 
                            ? 'justify-content-end' 
                            : 'justify-content-start'
                        }`}
                      >
                        {msg.sender === 'customer' && (
                          <img 
                            src={selectedUser?.avatar || defaultAvatar} 
                            alt="" 
                            className="rounded-circle me-2" 
                            style={{ width: 32, height: 32, objectFit: 'cover' }} 
                          />
                        )}
                        <div style={{ maxWidth: '70%' }}>
                          <div 
                            className={`p-3 rounded-3 ${
                              msg.sender === 'admin' 
                                ? 'bg-primary text-white' 
                                : 'bg-white border'
                            }`}
                            style={{ 
                              borderRadius: msg.sender === 'admin' 
                                ? '18px 18px 4px 18px' 
                                : '18px 18px 18px 4px',
                              wordBreak: 'break-word'
                            }}
                          >
                            <p className="mb-0">{msg.content}</p>
                          </div>
                          <small className="text-muted d-block mt-1">
                            {msg.timestamp}
                          </small>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-3 border-top bg-white d-flex gap-2">
                  <textarea 
                    className="form-control" 
                    rows="1"
                    placeholder="Nhập tin nhắn..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    style={{ resize: 'none' }}
                    disabled={!wsConnected && !roomId}
                  />
                  <button 
                    className="btn btn-primary" 
                    onClick={handleSendMessage} 
                    disabled={!messageInput.trim() || (!wsConnected && !roomId)}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center justify-content-center h-100">
                <div className="text-center text-muted">
                  <MessageCircle size={64} className="mb-3 opacity-25" />
                  <h5>Chọn một khách hàng để bắt đầu trò chuyện</h5>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;