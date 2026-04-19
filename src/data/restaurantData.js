export const restaurantInfo = {
  name: 'FoodHub',
  tagline: 'Hương Vị Đỉnh Cao, Trải Nghiệm Tuyệt Vời',
  description: 'FoodHub là nhà hàng cao cấp mang đến trải nghiệm ẩm thực đa dạng từ Á đến Âu. Với đội ngũ đầu bếp tài năng và nguyên liệu tươi ngon nhất, chúng tôi cam kết mang đến cho bạn những bữa ăn đáng nhớ.',
  phone: '0123 456 789',
  email: 'hello@foodhub.vn',
  address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
  openingHours: { weekday: '10:00 - 22:00', weekend: '09:00 - 23:00' },
  socialLinks: { facebook: '#', instagram: '#', twitter: '#', youtube: '#' },
  deliveryFee: 25000,
  freeDeliveryMin: 200000,
  minOrderAmount: 50000,
};

export const reviews = [
  { id: 1, name: 'Nguyễn Văn Minh', avatar: 'https://i.pravatar.cc/100?img=11', rating: 5, comment: 'Đồ ăn ngon tuyệt vời! Giao hàng nhanh, đóng gói cẩn thận. Chắc chắn sẽ quay lại.', date: '2026-04-10' },
  { id: 2, name: 'Trần Thị Hoa', avatar: 'https://i.pravatar.cc/100?img=5', rating: 5, comment: 'Món bò Wagyu xuất sắc! Không gian nhà hàng sang trọng, phục vụ chu đáo.', date: '2026-04-08' },
  { id: 3, name: 'Lê Hoàng Nam', avatar: 'https://i.pravatar.cc/100?img=12', rating: 4, comment: 'Sushi tươi ngon, giá cả hợp lý. Đặt bàn online rất tiện lợi.', date: '2026-04-05' },
  { id: 4, name: 'Phạm Minh Anh', avatar: 'https://i.pravatar.cc/100?img=9', rating: 5, comment: 'Đặt bàn trước và order món sẵn, tới nơi chỉ cần ngồi thưởng thức. Tuyệt vời!', date: '2026-04-02' },
  { id: 5, name: 'Võ Thanh Tùng', avatar: 'https://i.pravatar.cc/100?img=15', rating: 5, comment: 'Pizza hải sản ngon nhất mình từng ăn. Nhân viên thân thiện, nhiệt tình.', date: '2026-03-28' },
  { id: 6, name: 'Huỳnh Thị Mai', avatar: 'https://i.pravatar.cc/100?img=25', rating: 4, comment: 'Tiramisu ngon xỉu! Không gian lãng mạn, phù hợp đi date.', date: '2026-03-25' },
];

export const chefs = [
  { id: 1, name: 'Chef Trần Văn Đức', role: 'Bếp Trưởng', image: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400', experience: '15 năm kinh nghiệm' },
  { id: 2, name: 'Chef Nguyễn Thị Lan', role: 'Chuyên gia Sushi', image: 'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=400', experience: '12 năm kinh nghiệm' },
  { id: 3, name: 'Chef Lê Minh Tuấn', role: 'Chuyên gia Pizza', image: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400', experience: '10 năm kinh nghiệm' },
];

export const timeSlots = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '17:00', '17:30', '18:00',
  '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
];

export default restaurantInfo;
