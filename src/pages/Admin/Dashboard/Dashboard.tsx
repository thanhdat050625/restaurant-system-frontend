import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tổng Chi Nhánh</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tổng Loại Bàn</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Tổng Bàn</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">--</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Chào mừng đến với trang quản trị FoodHub</h2>
        <p className="text-gray-600">Chọn một mục ở menu bên trái để bắt đầu quản lý.</p>
      </div>
    </div>
  );
};

export default Dashboard;
