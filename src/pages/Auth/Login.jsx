import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import PageWrapper from '../../layouts/PageWrapper';
import { useAuth } from '../../features/auth/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await login({
        email,
        password,
      });

      if (response?.success) {
        navigate('/');
      }
    } catch (error) {
      setError(
        error?.response?.data?.message ||
        'Email hoặc mật khẩu không chính xác.',
      );
    }
  };

  return (
    <PageWrapper>
      <section className="min-h-screen flex">
        {/* Left - Image */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 to-dark/40 flex items-center justify-center">
            <div className="text-center px-12">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-white font-bold text-3xl">F</span>
              </div>
              <h2 className="text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">Chào mừng đến FoodHub</h2>
              <p className="text-white/70 text-lg">Đăng nhập để đặt món, đặt bàn và theo dõi đơn hàng</p>
            </div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary dark:hover:text-primary mb-8 transition-colors font-medium">
              <ArrowLeft size={18} /> Quay lại Trang chủ
            </Link>

            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="text-2xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)]">Food<span className="text-primary">Hub</span></span>
              </Link>
            </div>

            <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Đăng Nhập</h1>
            <p className="text-text-secondary dark:text-text-light mb-8">Chào mừng bạn quay trở lại!</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="your@email.com" className="w-full pl-10 pr-4 py-3.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-10 pr-12 py-3.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-primary transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-text-secondary dark:text-text-light cursor-pointer">
                  {/* <input type="checkbox" className="w-4 h-4 accent-primary rounded" /> Ghi nhớ */}
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark font-medium">Quên mật khẩu?</Link>
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <button type="submit" disabled={isLoading} className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</> : 'Đăng nhập'}
              </button>
            </form>

            {/* Social login */}
            <div className="mt-6">
              <div className="relative flex items-center my-6"><div className="flex-1 h-px bg-light-border dark:bg-dark-border" /><span className="px-4 text-text-light text-sm">hoặc</span><div className="flex-1 h-px bg-light-border dark:bg-dark-border" /></div>
              <div className="grid grid-cols-1 gap-3">
                <a href={`${import.meta.env.VITE_API_URL}/auth/google`} className="flex items-center justify-center gap-2 py-3 border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white text-sm font-medium hover:bg-light-card dark:hover:bg-dark-card transition-colors">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" /> Google
                </a>
              </div>
            </div>

            <p className="text-center text-text-secondary dark:text-text-light text-sm mt-8">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary hover:text-primary-dark font-semibold">Đăng ký ngay</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Login;
