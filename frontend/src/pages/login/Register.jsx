import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import styles from "./Register.module.css";
import LoadingSpinner from "../../components/LoadingSpinner";
import {
  validateUsername,
  validateFullName,
  validatePhone,
  validateEmail,
  validatePassword,
} from "../../utils/validators";


export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    let validationError;

    validationError = validateUsername(username);
    if (validationError) return validationError;

    validationError = validateFullName(fullName);
    if (validationError) return validationError;

    validationError = validatePhone(phone);
    if (validationError) return validationError;

    validationError = validateEmail(email);
    if (validationError) return validationError;

    validationError = validatePassword(password);
    if (validationError) return validationError;

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

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/account/register/",
        {
          username: username.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password.trim(),
        }
      );

      const data = response.data;
      login(data);

      setSuccess(`Đăng ký thành công! Chào mừng ${data.full_name || fullName}!`);

      // Xóa form sau khi đăng ký thành công
      setUsername("");
      setFullName("");
      setPhone("");
      setEmail("");
      setPassword("");

      navigate("/");
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Đăng ký thất bại! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingSpinner show={loading} />

      <div className={styles.page}>
        <div className={styles.overlay}></div>

        <form className={styles.card} onSubmit={handleSubmit}>
          <h2 className={styles.title}>ĐĂNG KÝ</h2>

          <label>Tên đăng nhập</label>
          <input
            type="text"
            placeholder="Nhập tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label>Họ và tên</label>
          <input
            type="text"
            placeholder="Nhập họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <label>Số điện thoại</label>
          <input
            type="tel"
            placeholder="0901234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

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

          <button type="submit" className={styles.btn} disabled={loading}>
            Đăng ký
          </button>

          <p className={styles.switchText}>
            Đã có tài khoản?
            <Link to="/login" className={styles.link}>Đăng nhập</Link>
          </p>
        </form>
      </div>
    </>
  );
}