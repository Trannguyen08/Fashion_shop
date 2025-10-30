import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Register.module.css";

export default function Register() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------- VALIDATE INPUT ----------------
  const validateInputs = () => {
    const nameRegex = /^[A-Za-zÀ-ỹ\s]{3,}$/u;
    if (!nameRegex.test(name.trim())) return "Tên không hợp lệ!";

    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) return "Số điện thoại không hợp lệ!";

    const emailRegex = /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "Email không hợp lệ!";

    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự.";

    return "";
  };

  // ---------------- HANDLE SUBMIT ----------------
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
          username: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (response.ok) {
        setSuccess("Đăng ký thành công! 🎉");
        setName("");
        setPhone("");
        setEmail("");
        setPassword("");
      } else {
        const err = await response.json();
        setError(err.message || "Đăng ký thất bại! Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
      setError("Không thể kết nối tới máy chủ. Vui lòng thử lại sau.");
    }
  };

  // ---------------- GIAO DIỆN ----------------
  return (
    <div className={styles.page}>
      <div className={styles.overlay}></div>

      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Register</h2>

        <label>Username</label>
        <input
          type="text"
          placeholder="Input your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
