import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap'; 
import styles from './Login.module.css'; 
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = (event) => {
        event.preventDefault();
        // Xử lý logic đăng nhập tại đây
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Remember Me:', rememberMe);
        alert('Đăng nhập thành công (Đây là ví dụ, logic thật sẽ gọi API)');
    };

    return (
        <div className={styles.loginPageBackground}>
            <div className={styles.blurOverlay} />
            {/* Sử dụng Bootstrap Grid cho responsive và căn giữa */}
            <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
                <Row className="justify-content-center w-100">
                    <Col xs={10} sm={10} md={6} lg={6} xl={4}>
                        <div className={`${styles.loginCard} p-4 p-md-5 rounded shadow`}>
                            <h2 className="text-center mb-3">LOGIN</h2>
                            
                            {/* Thay thế <Form> bằng <form> */}
                            <form onSubmit={handleSubmit}>
                                
                                {/* Bọc input để giới hạn chiều ngang (như yêu cầu trước) */}
                                <div className="d-flex justify-content-center">
                                    <div className="w-100 w-lg-75"> 
                                        
                                        {/* Thay thế Form.Group bằng div, thêm class mb-3 */}
                                        <div className="mb-3">
                                            {/* Thay thế Form.Label bằng label */}
                                            <label htmlFor="inputEmail" className="form-label">Email</label>
                                            
                                            {/* Thay thế Form.Control bằng input, thêm class form-control */}
                                            <input
                                                type="email"
                                                className="form-control" 
                                                id="inputEmail"
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Input Password */}
                                        <div className="mb-3">
                                            <label htmlFor="inputPassword" className="form-label">Password</label>
                                            <div className="position-relative">
                                                <input
                                                    type="password"
                                                    className="form-control"
                                                    id="inputPassword"
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                {/* Icon con mắt */}
                                                <i className={`bi bi-eye-slash position-absolute ${styles.passwordToggleIcon}`}></i>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                
                                {/* Checkbox và Forgot Password */}
                                <div className="mb-3 d-flex justify-content-between align-items-center">
                                    {/* Thay thế Form.Check bằng div.form-check */}
                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="inputRememberMe"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                        />
                                        <label className="form-check-label" htmlFor="inputRememberMe">
                                            Remember me
                                        </label>
                                    </div>
                                    <a href="#forgot-password" className={`${styles.forgotPasswordLink} text-decoration-none`}>
                                        Forgot password?
                                    </a>
                                </div>

                                {/* Thay thế Button bằng button, thêm class Bootstrap btn */}
                                <button type="submit" className="btn btn-primary w-100 mt-3">
                                    Login
                                </button>
                            </form>

                            <p className="text-center text-muted mt-4">
                                Don't have an account?{' '}
                                <Link to="/register" className={`${styles.createAccountLink} text-decoration-none`}>
                                    Create one
                                </Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};