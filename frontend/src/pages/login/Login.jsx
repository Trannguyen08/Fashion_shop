import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import axios from 'axios'; 
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const LOGIN_URL = "http://127.0.0.1:8000/account/login/";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
    
  const { login } = useAuth(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!username.trim() || !password.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin");
      setLoading(false);
      return;
    }

    try {
        const response = await axios.post(LOGIN_URL, {
            username: username,
            password: password,
        });

        const data = response.data;
        if (data.message === "success") {
          login(data);

          window.dispatchEvent(new Event('cartStorageChange'));
          await new Promise(resolve => setTimeout(resolve, 150));

          navigate("/", { replace: true });
        } else {
          setError(data.error || "Đăng nhập thất bại");
        }
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);

        if (error.response?.data?.error) {
            alert(`Đăng nhập thất bại: ${error.response.data.error}`);
        } else {
            alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.");
        }
    } finally {
        setLoading(false);
    }
  };


  return (
    <>
      <LoadingSpinner show={loading} />
      <div className={styles.loginPage}>
        <div className={styles.overlay}></div>

        <div className={styles.loginCard}>
          <h2 className={styles.title}>ĐĂNG NHẬP</h2>

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                Tên đăng nhập
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
                Mật khẩu
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
                Quên mật khẩu?
              </a>
            </div>

            <button type="submit" className={styles.loginButton}>
              Đăng nhập
            </button>
          </form>

          <p className={styles.footerText}>
            Bạn chưa có tài khoản?{" "}
            <Link to="/register" className={styles.link}>
              Đăng ký
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
