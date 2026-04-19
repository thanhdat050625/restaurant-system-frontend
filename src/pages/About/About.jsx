import { motion } from 'framer-motion';
import { Award, Heart, Leaf, Users } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { chefs } from '../../data/restaurantData';

const values = [
  { icon: Heart, title: 'Đam Mê', desc: 'Mỗi món ăn là một tác phẩm nghệ thuật, được chế biến với tất cả đam mê.' },
  { icon: Leaf, title: 'Tươi Ngon', desc: 'Nguyên liệu tươi sạch được chọn lọc kỹ càng mỗi ngày.' },
  { icon: Award, title: 'Chất Lượng', desc: 'Cam kết mang đến trải nghiệm ẩm thực đẳng cấp nhất.' },
  { icon: Users, title: 'Phục Vụ', desc: 'Khách hàng là trung tâm của mọi hoạt động.' },
];

const About = () => {
  return (
    <PageWrapper>
      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-gradient-to-br from-dark via-dark-surface to-dark overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1920" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Về <span className="gradient-text">FoodHub</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/70 max-w-2xl mx-auto text-lg">
            Hành trình mang đến hương vị đỉnh cao từ năm 2020
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-bold text-text-primary dark:text-white font-[family-name:var(--font-heading)] mb-6">
                Câu Chuyện <span className="text-primary">Của Chúng Tôi</span>
              </h2>
              <div className="space-y-4 text-text-secondary dark:text-text-light leading-relaxed">
                <p>FoodHub được thành lập từ niềm đam mê ẩm thực và mong muốn mang đến cho mọi người những bữa ăn chất lượng, tiện lợi nhất.</p>
                <p>Từ một nhà hàng nhỏ tại Quận 1, chúng tôi đã phát triển thành một thương hiệu được yêu thích với hơn 10,000 khách hàng tin tưởng.</p>
                <p>Với đội ngũ đầu bếp giàu kinh nghiệm và dịch vụ đặt hàng online tiện lợi, FoodHub cam kết mang đến trải nghiệm ẩm thực hoàn hảo - dù bạn ăn tại nhà hay tại nhà hàng.</p>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" alt="Restaurant interior" className="w-full h-80 object-cover rounded-2xl shadow-card-hover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-light dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-text-primary dark:text-white text-center font-[family-name:var(--font-heading)] mb-12">
            Giá Trị <span className="text-primary">Cốt Lõi</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center p-6 bg-white dark:bg-dark-surface rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-2 duration-300">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <v.icon size={24} className="text-primary" />
                </div>
                <h3 className="font-bold text-text-primary dark:text-white mb-2">{v.title}</h3>
                <p className="text-text-secondary dark:text-text-light text-sm">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Chefs */}
      <section className="py-20 bg-white dark:bg-dark-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl font-bold text-text-primary dark:text-white text-center font-[family-name:var(--font-heading)] mb-12">
            Đội Ngũ <span className="text-primary">Đầu Bếp</span>
          </motion.h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {chefs.map((chef, i) => (
              <motion.div key={chef.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center group">
                <div className="relative mb-4 overflow-hidden rounded-2xl">
                  <img src={chef.image} alt={chef.name} className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg font-bold text-text-primary dark:text-white">{chef.name}</h3>
                <p className="text-primary font-medium text-sm">{chef.role}</p>
                <p className="text-text-light text-xs mt-1">{chef.experience}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

export default About;
