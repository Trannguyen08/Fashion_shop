import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/account/send-otp/', { email });
      toast.success("Mã OTP đã được gửi vào Email của bạn!");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || "Email không hợp lệ hoặc không tồn tại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/account/verify-otp/', { email, otp });
      toast.success("Xác thực OTP thành công!");
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || "Mã OTP không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Mật khẩu nhập lại không khớp!");
    }
    if (password.length < 6) {
      return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/account/reset-password/', { email, otp, password });
      toast.success("Đổi mật khẩu thành công! Hãy đăng nhập lại.");
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || "Đã xảy ra lỗi khi đổi mật khẩu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4" style={{ maxWidth: '420px', width: '100%', borderRadius: '15px' }}>
        
        {/* HEADER DỰA TRÊN STEP */}
        <div className="text-center mb-4">
          <div className="bg-primary bg-opacity-10 d-inline-block p-3 rounded-circle mb-3">
            {step === 1 && <Mail size={32} className="text-primary" />}
            {step === 2 && <KeyRound size={32} className="text-primary" />}
            {step === 3 && <Lock size={32} className="text-primary" />}
          </div>
          <h3 className="fw-bold">
            {step === 1 && "Quên mật khẩu?"}
            {step === 2 && "Xác thực OTP"}
            {step === 3 && "Đặt lại mật khẩu"}
          </h3>
          <p className="text-muted small">
            {step === 1 && "Nhập email để nhận mã xác thực."}
            {step === 2 && `Chúng tôi đã gửi mã đến ${email}`}
            {step === 3 && "Vui lòng nhập mật khẩu mới cho tài khoản của bạn."}
          </p>
        </div>

        {/* STEP 1: NHẬP EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendEmail}>
            <div className="mb-4">
              <label className="form-label fw-semibold small">Email đăng ký</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Mail size={18} /></span>
                <input type="email" className="form-control border-start-0" placeholder="name@company.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã xác thực'}
            </button>
          </form>
        )}

        {/* STEP 2: NHẬP OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="form-label fw-semibold small">Nhập mã OTP</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><KeyRound size={18} /></span>
                <input type="text" className="form-control border-start-0" placeholder="6 chữ số"
                  value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <div className="text-end mt-2">
                <button type="button" className="btn btn-link p-0 small text-decoration-none" onClick={() => setStep(1)}>Gửi lại mã?</button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>
          </form>
        )}

        {/* STEP 3: NHẬP PASSWORD MỚI */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Mật khẩu mới</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Lock size={18} /></span>
                <input type={showPass ? "text" : "password"} className="form-control border-x-0" placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
                <span className="input-group-text bg-light border-start-0" style={{cursor: 'pointer'}} onClick={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold small">Nhập lại mật khẩu mới</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0"><Lock size={18} /></span>
                <input type={showPass ? "text" : "password"} className="form-control border-start-0" placeholder="••••••••"
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mb-3" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>
        )}

        {/* FOOTER */}
        <div className="text-center">
          <Link to="/login" className="text-decoration-none text-muted small d-flex align-items-center justify-content-center">
            <ArrowLeft size={16} className="me-1" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;