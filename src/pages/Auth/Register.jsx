import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, Phone, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';

const Register = () => {
  // Step 1: Điền form | Step 2: Nhập OTP | Step 3: Thành công
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [otp, setOtp] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  
  const { register, verifyOtp, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Xử lý gửi Form Đăng ký
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { 
      setError('Mật khẩu không khớp'); 
      return; 
    }
    setError('');
    try {
      const success = await register(form);
      if (success) {
        setStep(2); // Chuyển sang màn hình nhập OTP
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Xử lý gửi mã OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Mã OTP phải gồm 6 chữ số');
      return;
    }
    setError('');
    try {
      const success = await verifyOtp(form.email, otp);
      if (success) {
        setStep(3); // Hiện màn hình thành công
        setTimeout(() => navigate('/login'), 2500); // Tự động chuyển về login sau 2.5s
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
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/40 flex items-center justify-center">
            <div className="text-center px-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-3xl">F</span>
              </div>
              <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">Tham gia FoodHub</h2>
              <p className="text-white/70 text-lg">Tạo tài khoản để nhận ưu đãi và đặt hàng nhanh hơn</p>
            </div>
          </div>
        </div>

        {/* Right - Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light dark:bg-dark">
          <div className="w-full max-w-md overflow-hidden relative min-h-[500px] flex items-center">
            
            <AnimatePresence mode="wait">
              {/* BƯỚC 1: NHẬP THÔNG TIN */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <Link to="/" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary mb-6 font-medium">
                    <ArrowLeft size={18} /> Quay lại
                  </Link>
                  
                  <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Đăng Ký</h1>
                  <p className="text-text-secondary dark:text-text-light mb-6">Tạo tài khoản mới</p>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ tên</label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                          <input name="name" value={form.name} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Username</label>
                        <div className="relative">
                          <AtSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                          <input name="username" value={form.username} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Số điện thoại</label>
                      <div className="relative">
                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input name="phone" value={form.phone} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Mật khẩu</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Xác nhận mật khẩu</label>
                      <div className="relative">
                        <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                    </div>

                    {error && <p className="text-error text-sm text-center bg-error/10 p-2 rounded-lg">{error}</p>}

                    <button type="submit" disabled={isLoading} className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-2">
                      {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Xử lý...</> : 'Tiếp tục'}
                    </button>
                  </form>

                  <p className="text-center text-text-secondary dark:text-text-light text-sm mt-6">
                    Đã có tài khoản? <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">Đăng nhập</Link>
                  </p>
                </motion.div>
              )}

              {/* BƯỚC 2: NHẬP MÃ OTP */}
              {step === 2 && (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                  className="w-full text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                    <Mail size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Xác thực Email</h2>
                  <p className="text-text-secondary dark:text-text-light mb-8 text-sm px-4">
                    Chúng tôi đã gửi mã OTP gồm 6 chữ số đến email <br/>
                    <b className="text-primary">{form.email}</b>
                  </p>

                  <form onSubmit={handleOtpSubmit} className="space-y-6">
                    <div>
                      <div className="relative max-w-[200px] mx-auto">
                        <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light" />
                        <input 
                          type="text" 
                          maxLength="6"
                          value={otp} 
                          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} // Chỉ cho nhập số
                          placeholder="000000" 
                          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-dark-surface border-2 border-light-border dark:border-dark-border rounded-xl text-xl font-bold tracking-[0.5em] text-center text-text-primary dark:text-white focus:border-primary focus:ring-0 outline-none transition-all" 
                          required 
                        />
                      </div>
                    </div>

                    {error && <p className="text-error text-sm bg-error/10 py-2 px-4 rounded-lg inline-block">{error}</p>}

                    <div className="flex flex-col gap-3">
                      <button type="submit" disabled={isLoading || otp.length !== 6} className="w-full py-3.5 bg-primary hover:bg-primary-dark disabled:opacity-70 disabled:hover:shadow-none text-white font-semibold rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang kiểm tra...</> : 'Xác thực tài khoản'}
                      </button>
                      <button type="button" onClick={() => setStep(1)} className="text-text-secondary hover:text-text-primary text-sm font-medium">
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
                  <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-3">Đăng ký thành công!</h2>
                  <p className="text-text-secondary dark:text-text-light">Tài khoản của bạn đã được kích hoạt.</p>
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

export default Register;