import React, { useState, useEffect } from 'react';
import { tableTypeService } from '../../../services/admin/tableTypeService';

const TableTypes = () => {
  const [tableTypes, setTableTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTableTypes();
  }, []);

  const fetchTableTypes = async () => {
    try {
      setLoading(true);
      const res = await tableTypeService.getTableTypes();
      if (res?.data) {
        setTableTypes(res.data);
      }
    } catch (error) {
      console.error('Error fetching table types:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Loại Bàn</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium">
          + Thêm loại bàn
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
                <th className="p-3 font-medium">ID</th>
                <th className="p-3 font-medium">Tên loại bàn</th>
                <th className="p-3 font-medium">Số chỗ ngồi</th>
                <th className="p-3 font-medium">Mô tả</th>
                <th className="p-3 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tableTypes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    Chưa có loại bàn nào
                  </td>
                </tr>
              ) : (
                tableTypes.map((type) => (
                  <tr key={type.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm text-gray-500">{type.id.substring(0, 8)}...</td>
                    <td className="p-3 text-sm font-medium text-gray-900">{type.name}</td>
                    <td className="p-3 text-sm text-gray-600">{type.seatCount}</td>
                    <td className="p-3 text-sm text-gray-600">{type.description}</td>
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

export default TableTypes;
