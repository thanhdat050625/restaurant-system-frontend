import React, { useState, useEffect } from 'react';
import { branchService } from '../../../services/admin/branchService';
import { IBranch } from '../../../types/admin/branch.type';

const Branches: React.FC = () => {
  const [branches, setBranches] = useState<IBranch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await branchService.getBranches();
      if (res?.data) {
        setBranches(res.data);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Chi nhánh</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium">
          + Thêm chi nhánh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-3 font-medium">Tên chi nhánh</th>
                <th className="p-3 font-medium">Địa chỉ</th>
                <th className="p-3 font-medium">Số điện thoại</th>
                <th className="p-3 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Chưa có chi nhánh nào
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm font-medium text-gray-900">{branch.name}</td>
                    <td className="p-3 text-sm text-gray-600">{branch.address}</td>
                    <td className="p-3 text-sm text-gray-600">{branch.phone}</td>
                    <td className="p-3 text-sm text-center">
                      <button className="text-info hover:text-blue-700 mr-3">Sửa</button>
                      <button className="text-error hover:text-red-700">Xóa</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Branches;
