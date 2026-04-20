import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, Phone, ArrowLeft } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Mật khẩu không khớp'); return; }
    setError('');
    const success = await register(form);
    if (success) navigate('/');
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

        {/* Right - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-light dark:bg-dark">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 text-text-secondary dark:text-text-light hover:text-primary dark:hover:text-primary mb-8 transition-colors font-medium">
              <ArrowLeft size={18} /> Quay lại Trang chủ
            </Link>
            
            <h1 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-2">Đăng Ký</h1>
            <p className="text-text-secondary dark:text-text-light mb-8">Tạo tài khoản mới</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ và tên</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Tên đăng nhập</label>
                <div className="relative">
                  <AtSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input name="username" value={form.username} onChange={handleChange} required placeholder="foodhub_user" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Số điện thoại</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input name="phone" value={form.phone} onChange={handleChange} required placeholder="0123 456 789" className="w-full pl-10 pr-4 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-primary transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light" />
                  <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-light hover:text-text-primary transition-colors">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>

              {error && <p className="text-error text-sm">{error}</p>}

              <button type="submit" disabled={isLoading} className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                {isLoading ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Đang xử lý...</> : 'Đăng ký'}
              </button>
            </form>

            <p className="text-center text-text-secondary dark:text-text-light text-sm mt-8">
              Đã có tài khoản?{' '}<Link to="/login" className="text-primary hover:text-primary-dark font-semibold">Đăng nhập</Link>
            </p>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Register;
