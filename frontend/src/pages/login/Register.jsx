import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import styles from "./Register.module.css";

export default function Register() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const validateInputs = () => {
    const usernameRegex = /^[A-Za-z0-9_]{3,}$/;
    if (!usernameRegex.test(username.trim())) return "Tên đăng nhập không hợp lệ!";

    const nameRegex = /^[A-Za-zÀ-ỹ\s]{3,}$/u;
    if (!nameRegex.test(fullName.trim())) return "Họ tên không hợp lệ!";

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) return "Số điện thoại không hợp lệ!";

    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ!";

    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/account/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data);
        setSuccess(`Đăng ký thành công! Chào mừng ${data.full_name || fullName}!`);
        setUsername("");
        setFullName("");
        setPhone("");
        setEmail("");
        setPassword("");

        navigate("/");
      } else {
        setError(data.message || "Đăng ký thất bại! Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.overlay}></div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>ĐĂNG KÝ</h2>

        {/* --- Username --- */}
        <label>Tên đăng nhập</label>
        <input
          type="text"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        {/* --- Full Name --- */}
        <label>Họ và tên</label>
        <input
          type="text"
          placeholder="Nhập họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        {/* --- Phone --- */}
        <label>Số điện thoại</label>
        <input
          type="tel"
          placeholder="0901234567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        {/* --- Email --- */}
        <label>Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* --- Password --- */}
        <label>Mật khẩu</label>
        <input
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <button type="submit" className={styles.btn}>
          Đăng ký
        </button>

        <p className={styles.switchText}>
          Đã có tài khoản?{" "}
          <Link to="/login" className={styles.link}>
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
}
