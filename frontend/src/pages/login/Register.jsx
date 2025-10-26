import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import styles from './Login.module.css'; 
import { Link } from 'react-router-dom';

export default function Register() {
    // ------------------- 1. TRẠNG THÁI (STATE) -------------------
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ------------------- 2. XỬ LÝ SUBMIT -------------------
    const handleSubmit = (event) => {
        event.preventDefault();
        // Xử lý logic đăng ký tại đây (gọi API)
        console.log('Name:', name);
        console.log('Phone:', phone);
        console.log('Email:', email);
        console.log('Password:', password);
        alert('Đăng ký thành công! (Đây là ví dụ, logic thật sẽ gọi API)');
    };

    return (
        <div className={styles.loginPageBackground}>
            <div className={styles.blurOverlay} />
            
            <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 position-relative">
                <Row className="justify-content-center w-100">
                    {/* Giảm kích thước Col để Form Register trông gọn hơn, ví dụ: md=7, lg=5 */}
                    <Col xs={10} sm={10} md={7} lg={5} xl={4}> 
                        <div className={`${styles.loginCard} p-4 p-md-5 rounded shadow`}>
                            <h2 className="text-center mb-3">REGISTER</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="d-flex justify-content-center">
                                    <div className="w-100 w-lg-75"> 
                                        
                                        {/* Trường 1: Tên (Name) */}
                                        <div className="mb-3">
                                            <label htmlFor="inputName" className={`form-label ${styles.mobileLabel}`}>Họ & Tên</label>
                                            <input
                                                type="text"
                                                className={`form-control ${styles.mobileInput}`}
                                                id="inputName"
                                                placeholder="Nguyễn Văn A"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Trường 2: Số điện thoại (Phone) */}
                                        <div className="mb-3">
                                            <label htmlFor="inputPhone" className={`form-label `}>Số điện thoại</label>
                                            <input
                                                type="tel"
                                                className={`form-control ${styles.mobileInput}`}
                                                id="inputPhone"
                                                placeholder="0901234567"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                        
                                        {/* Trường 3: Email */}
                                        <div className="mb-3">
                                            <label htmlFor="inputEmail" className={`form-label`}>Email</label>
                                            <input
                                                type="email"
                                                className={`form-control`} 
                                                id="inputEmail"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        {/* Trường 4: Mật khẩu (Password) */}
                                        <div className="mb-4"> {/* Dùng mb-4 để tạo khoảng trống lớn hơn trước nút */}
                                            <label htmlFor="inputPassword" className={`form-label`}>Mật khẩu</label>
                                            <div className="position-relative">
                                                <input
                                                    type="password"
                                                    className={`form-control`}
                                                    id="inputPassword"
                                                    placeholder="Mật khẩu"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <i className={`bi bi-eye-slash position-absolute ${styles.passwordToggleIcon}`}></i>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                
                                {/* Nút Đăng ký */}
                                <button type="submit" className="btn btn-success w-100 mt-3">
                                    REGISTER
                                </button>
                            </form>

                            <p className="text-center text-muted mt-4">
                                Đã có tài khoản?{' '}
                                <Link to="/login" className={`${styles.forgotPasswordLink} text-decoration-none`}>
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}