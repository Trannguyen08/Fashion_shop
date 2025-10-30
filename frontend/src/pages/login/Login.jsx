import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const LOGIN_URL = "http://127.0.0.1:8000/account/login/"; 

    try {
      const response = await fetch(LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username, 
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(`Đăng nhập thất bại: ${errorData.message || 'Sai tên đăng nhập hoặc mật khẩu.'}`);
        return; 
      }

      const data = await response.json();
      const { access_token, refresh_token, user } = data;

      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("refreshToken", refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("Đăng nhập thành công! Đã lưu tokens và user.");
      navigate("/"); 

    } catch (error) {
      console.error("Lỗi kết nối hoặc xử lý:", error);
      alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.overlay}></div>

      <div className={styles.loginCard}>
        <h2 className={styles.title}>LOGIN</h2>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              placeholder="Username..."
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password..."
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.optionsRow}>
            <a href="#forgot-password" className={styles.forgotPassword}>
              Forgot password?
            </a>
          </div>

          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{" "}
          <Link to="/register" className={styles.link}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
