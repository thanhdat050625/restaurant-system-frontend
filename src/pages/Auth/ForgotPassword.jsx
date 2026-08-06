import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';

const ForgotPassword = () => {
  // Step 1: Nhập Email | Step 2: Nhập OTP & Mật khẩu mới | Step 3: Thành công
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { forgotPassword, resetPassword, resendOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  // Xử lý Step 1: Yêu cầu OTP để quên mật khẩu
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const success = await forgotPassword(email);
      if (success) {
        setStep(2);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý Step 2: Đặt lại mật khẩu
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }
    setError('');
    try {
      const success = await resetPassword(email, otp, newPassword);
      if (success) {
        setStep(3); // Hiện màn hình thành công
        setTimeout(() => navigate('/login'), 3000); // Tự động chuyển về login sau 3s
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setSuccessMessage('');
    try {
      const success = await resendOtp(email);
      if (success) {
        setSuccessMessage('Mã OTP mới đã được gửi!');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <PageWrapper>
      <section className="min-h-screen flex">
        {/* Left - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/40 flex items-center justify-center">
            <div className="text-center px-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-3xl">F</span>
              </div>
              <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">Khôi phục mật khẩu</h2>
              <p className="text-white/70 text-lg">Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập</p>
            </div>
          </div>
        </div>

        {/* Right - Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light dark:bg-dark">
          <div className="w-full max-w-md overflow-hidden relative min-h-[500px] flex items-center">
            
            <AnimatePresence mode="wait">
              {/* BƯỚC 1: NHẬP EMAIL */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <Link to="/login" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary mb-6 font-medium">
                    <ArrowLeft size={18} /> Quay lại đăng nhập
                  </Link>
                  
                  <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Quên Mật Khẩu</h1>
                  <p className="text-text-secondary dark:text-text-light mb-6">Vui lòng nhập email đã đăng ký tài khoản.</p>

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      </div>
                    </div>
                    
                    {error && <p className="text-error text-sm text-center bg-error/10 p-2 rounded-lg">{error}</p>}

                    <button type="submit" disabled={isLoading || !email} className="w-full py-3.5 mt-4 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-2">
                      {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Xử lý...</> : 'Gửi mã xác nhận'}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* BƯỚC 2: NHẬP OTP & MẬT KHẨU MỚI */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <KeyRound size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Đặt lại mật khẩu</h2>
                  <p className="text-text-secondary dark:text-text-light mb-6 text-sm px-4">
                    Nhập mã OTP gồm 6 chữ số gửi đến <b className="text-primary">{email}</b> và mật khẩu mới của bạn.
                  </p>

                  <form onSubmit={handleResetPassword} className="space-y-5 text-left">
                    <div>
                      <div className="relative max-w-[240px] mx-auto mb-4">
                        <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
                        <input 
                          type="text" 
                          maxLength="6"
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="000000" 
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-dark-surface border-2 border-light-border dark:border-dark-border rounded-xl text-xl font-bold tracking-[0.5em] text-center text-text-primary dark:text-white focus:border-primary focus:ring-0 outline-none transition-all" 
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Mật khẩu mới</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Xác nhận mật khẩu mới</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>

                    {error && <p className="text-error text-sm text-center bg-error/10 py-2 px-4 rounded-lg">{error}</p>}
                    {successMessage && <p className="text-success text-sm text-center bg-success/10 py-2 px-4 rounded-lg">{successMessage}</p>}

                    <div className="flex flex-col gap-3 pt-2 text-center">
                      <button type="submit" disabled={isLoading || otp.length !== 6 || !newPassword} className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-70 disabled:hover:shadow-none text-white font-semibold rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang cập nhật...</> : 'Cập nhật mật khẩu'}
                      </button>
                      <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-primary hover:text-primary-dark text-sm font-medium">
                        Gửi lại mã OTP
                      </button>
                      <button type="button" onClick={() => { setStep(1); setError(''); setSuccessMessage(''); }} className="text-text-secondary hover:text-text-primary text-sm font-medium mt-1">
                        Sửa lại email
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* BƯỚC 3: THÀNH CÔNG */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full text-center py-10"
                >
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={48} className="text-success" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-3">Đổi mật khẩu thành công!</h2>
                  <p className="text-text-secondary dark:text-text-light">Mật khẩu của bạn đã được cập nhật.</p>
                  <p className="text-text-light text-sm mt-4">Tự động chuyển về trang đăng nhập...</p>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default ForgotPassword;
