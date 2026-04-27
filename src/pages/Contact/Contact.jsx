import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };

  const contactInfo = [
    { icon: MapPin, label: 'Địa chỉ', value: '123 Nguyễn Huệ, Quận 1, TP.HCM', color: 'bg-primary/10 text-primary' },
    { icon: Phone, label: 'Điện thoại', value: '0359 537 981', color: 'bg-secondary/10 text-secondary' },
    { icon: Mail, label: 'Email', value: 'datt32285@gmail.com', color: 'bg-accent/10 text-accent-dark' },
    { icon: Clock, label: 'Giờ mở cửa', value: 'T2-T6: 10:00-22:00 | T7-CN: 09:00-23:00', color: 'bg-success/10 text-success' },
  ];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-gradient-to-br from-dark via-dark-surface to-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Liên Hệ <span className="gradient-text">Với Chúng Tôi</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-lg mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {contactInfo.map((info, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-dark-surface p-5 rounded-2xl border border-light-border dark:border-dark-border hover:shadow-card-hover transition-all hover:-translate-y-1 duration-300">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${info.color}`}>
                  <info.icon size={22} />
                </div>
                <p className="text-xs text-text-light mb-1">{info.label}</p>
                <p className="text-sm font-medium text-text-primary dark:text-white">{info.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white dark:bg-dark-surface p-8 rounded-2xl border border-light-border dark:border-dark-border">
              {submitted ? (
                <div className="text-center py-12">
                  <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-text-primary dark:text-white mb-2">Đã gửi thành công!</h3>
                  <p className="text-text-secondary dark:text-text-light">Chúng tôi sẽ phản hồi sớm nhất có thể.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-6">Gửi tin nhắn</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Họ tên</label>
                        <input name="name" value={form.name} onChange={handleChange} required placeholder="Nguyễn Văn A" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Email</label>
                        <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="your@email.com" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Chủ đề</label>
                      <input name="subject" value={form.subject} onChange={handleChange} required placeholder="Chủ đề tin nhắn" className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary dark:text-white mb-1.5">Nội dung</label>
                      <textarea name="message" value={form.message} onChange={handleChange} required rows={4} placeholder="Nhập nội dung..." className="w-full px-4 py-3 bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl text-text-primary dark:text-white placeholder-text-light focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-full transition-all hover:shadow-glow flex items-center justify-center gap-2">
                      <Send size={18} /> Gửi tin nhắn
                    </button>
                  </form>
                </>
              )}
            </motion.div>

            {/* Map */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border overflow-hidden min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin size={48} className="text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary dark:text-white mb-2">Google Maps</h3>
                <p className="text-text-secondary dark:text-text-light text-sm">123 Nguyễn Huệ, Quận 1, TP.HCM</p>
                <p className="text-text-light text-xs mt-2">(Bản đồ sẽ được tích hợp khi có API key)</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default Contact;
