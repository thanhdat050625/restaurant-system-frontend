import React, { useState, useEffect } from 'react';
import { tableService } from '../../../services/admin/tableService';
import { ITable } from '../../../types/admin/table.type';

const Tables: React.FC = () => {
  const [tables, setTables] = useState<ITable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const res = await tableService.getTables();
      if (res?.data) {
        setTables(res.data);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Danh sách Bàn</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors text-sm font-medium">
          + Thêm bàn
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
                <th className="p-3 font-medium">Tên/Số bàn</th>
                <th className="p-3 font-medium">Loại bàn</th>
                <th className="p-3 font-medium">Trạng thái</th>
                <th className="p-3 font-medium text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {tables.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    Chưa có bàn nào
                  </td>
                </tr>
              ) : (
                tables.map((table) => (
                  <tr key={table.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 text-sm font-medium text-gray-900">{table.name || table.tableNumber}</td>
                    <td className="p-3 text-sm text-gray-600">{table.tableType?.name || 'N/A'}</td>
                    <td className="p-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        table.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        table.status === 'OCCUPIED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {table.status}
                      </span>
                    </td>
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

export default Tables;
