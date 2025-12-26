import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Circle
} from 'lucide-react';

const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token"); // Bearer token

  // Scroll xuống cuối chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ======================
  // 🔵 Load danh sách user
  // ======================
  const loadUsers = async () => {
    try {
      const { data } = await axios.get("http://127.0.0.1:8000/chat/api/users/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data.users);
      if (data.users.length > 0) setSelectedUser(data.users[0]);
    } catch (err) {
      console.error("Load users failed", err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadMessages = async (userId) => {
    if (!userId) return;
    try {
      const { data } = await axios.get(`http://127.0.0.1:8000/chat/api/${userId}/messages/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(data.messages.map(m => ({
        id: m.id,
        sender: m.sender_role === "admin" ? 'admin' : 'customer',
        content: m.message,
        timestamp: new Date(m.created_at).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
      })));
    } catch (err) {
      console.error("Load messages failed", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser.id);
  }, [selectedUser]);

  // ======================
  // 🟢 Gửi tin nhắn
  // ======================
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      content: messageInput,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');

    try {
      await axios.post(`http://127.0.0.1:8000/chat/api/room/${selectedUser.id}/send/`, 
        { message: messageInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Send message failed", err);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(u => u.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold d-flex align-items-center">
          <MessageCircle className="me-2 text-primary" size={28} /> Quản Lý Tin Nhắn
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
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className={`p-3 border-bottom ${selectedUser?.id === user.id ? 'bg-primary bg-opacity-10' : ''} cursor-pointer`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="d-flex align-items-center">
                    <div className="position-relative me-3">
                      <img 
                        src={user.avatar} 
                        alt={user.full_name} 
                        className="rounded-circle" 
                        style={{ width: '48px', height: '48px' }}
                      />
                      {user.online && (
                        <Circle size={12} className="position-absolute bottom-0 end-0 text-success" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-semibold text-truncate">{user.full_name}</h6>
                      <p className="mb-0 text-muted text-truncate">{user.last_message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT WINDOW */}
        <div className="col-md-8 col-lg-9">
          <div className="card border-0 shadow-sm h-100 ms-md-3 d-flex flex-column">
            {/* Header */}
            <div className="p-3 border-bottom d-flex align-items-center">
              <img src={selectedUser?.avatar} alt="" className="rounded-circle me-2" style={{ width: 40, height: 40 }} />
              <div>
                <h6 className="mb-0 fw-semibold">{selectedUser?.full_name}</h6>
                <small className="text-muted">{selectedUser?.online ? 'Đang hoạt động' : 'Không hoạt động'}</small>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-grow-1 p-4 overflow-auto bg-light bg-opacity-50">
              {messages.map(msg => (
                <div key={msg.id} className={`d-flex mb-3 ${msg.sender === 'admin' ? 'justify-content-end' : 'justify-content-start'}`}>
                  {msg.sender === 'customer' && (
                    <img src={selectedUser?.avatar} alt="" className="rounded-circle me-2" style={{ width: 32, height: 32 }} />
                  )}
                  <div style={{ maxWidth: '70%' }}>
                    <div className={`p-3 rounded-3 ${msg.sender === 'admin' ? 'bg-primary text-white' : 'bg-white border'}`}
                      style={{ borderRadius: msg.sender === 'admin' ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                      <p className="mb-0">{msg.content}</p>
                    </div>
                    <small className="text-muted d-block mt-1">{msg.timestamp}</small>
                  </div>
                </div>
              ))}
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
              />
              <button className="btn btn-primary" onClick={handleSendMessage} disabled={!messageInput.trim()}>
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
