import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [otp, setOtp] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { requestRegisterOtp, register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'email') {
      const newEmail = value;

      setForm((prev) => ({
        ...prev,
        email: newEmail,
      }));

      if (newEmail.trim() !== form.email.trim()) {
        setIsOtpSent(false);
        setOtp('');
        setSuccessMessage('');
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRequestOtp = async () => {
    const email = form.email.trim();
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email không hợp lệ');
      return;
    }
    setError('');
    setSuccessMessage('');
    setIsSendingOtp(true);
    try {
      const response = await requestRegisterOtp({
        email,
      });
      if (response?.success) {
        setIsOtpSent(true);
        setSuccessMessage(
          response.message || 'Mã OTP đã được gửi đến email của bạn!',
        );
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        'Không thể gửi mã OTP. Vui lòng thử lại.',
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccessMessage('');

    const validationError = validateRegisterForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const response = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        otp,
      });

      if (response?.success) {
        setIsSuccess(true);

        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
      );
    }
  };


  const validateRegisterForm = () => {
    if (!form.fullName.trim()) {
      return 'Vui lòng nhập họ tên';
    }

    const phoneRegex = /^[0-9]{10,11}$/;

    if (!phoneRegex.test(form.phone)) {
      return 'Số điện thoại phải gồm 10-11 chữ số';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(form.email)) {
      return 'Email không hợp lệ';
    }

    if (form.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (form.password !== form.confirmPassword) {
      return 'Mật khẩu xác nhận không khớp';
    }

    if (!/^\d{6}$/.test(otp)) {
      return 'Mã OTP phải gồm 6 chữ số';
    }

    return null;
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
          <div className="w-full max-w-xl overflow-hidden relative min-h-[500px] flex items-center">

            {isSuccess ? (
              <motion.div
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
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="w-full"
              >
                <Link to="/" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary mb-6 font-medium">
                  <ArrowLeft size={18} /> Quay lại
                </Link>

                <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Đăng Ký</h1>
                <p className="text-text-secondary dark:text-text-light mb-6">Điền thông tin của bạn để tạo tài khoản</p>

                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ tên</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                      <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
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
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 disabled:bg-light" />
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={isSendingOtp || !form.email}
                        className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50 font-semibold rounded-xl text-sm whitespace-nowrap transition-colors"
                      >
                        {isSendingOtp ? 'Đang gửi...' : (isOtpSent ? 'Gửi lại mã' : 'Nhận mã OTP')}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Mã OTP (6 chữ số)</label>
                    <div className="relative">
                      <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="000000"
                        disabled={!isOtpSent}
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-sm font-bold tracking-widest text-text-primary dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  {error && <p className="text-error text-sm text-center bg-error/10 py-2 px-4 rounded-lg">{error}</p>}
                  {successMessage && <p className="text-success text-sm text-center bg-success/10 py-2 px-4 rounded-lg">{successMessage}</p>}

                  <button type="submit" disabled={isLoading || otp.length !== 6 || !isOtpSent} className="w-full py-3.5 mt-2 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-xl transition-all hover:shadow-glow flex items-center justify-center gap-2">
                    {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</> : 'Tạo tài khoản'}
                  </button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-light-border dark:border-dark-border"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-light dark:bg-dark text-text-light">Hoặc đăng ký bằng</span>
                    </div>
                  </div>

                  <a
                    href={`${import.meta.env.VITE_API_URL}/auth/google`}
                    className="mt-4 flex items-center justify-center w-full py-2.5 border border-light-border dark:border-dark-border rounded-xl shadow-sm bg-white dark:bg-dark-surface text-sm font-medium text-text-primary dark:text-white hover:bg-gray-50 dark:hover:bg-dark-border transition-colors gap-2"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </a>
                </div>

                <p className="text-center text-text-secondary dark:text-text-light text-sm mt-6">
                  Đã có tài khoản? <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">Đăng nhập</Link>
                </p>
              </motion.div>
            )}

          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Register;