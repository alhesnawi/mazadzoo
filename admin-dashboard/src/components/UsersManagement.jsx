import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../services/api';
import { User, Mail, Phone, Calendar, CheckCircle, XCircle, Search, RefreshCcw } from 'lucide-react';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const data = await usersService.getUsers(params);
      setUsers(data.users);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        pages: data.pagination.pages
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleStatusChange = async (userId, currentStatus) => {
    if (window.confirm(`هل أنت متأكد من تغيير حالة المستخدم؟`)) {
      try {
        await usersService.updateUserStatus(userId, !currentStatus);
        fetchUsers(); // Refresh list
      } catch (err) {
        alert(`فشل تغيير حالة المستخدم: ${err.message}`);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm(`هل أنت متأكد من حذف المستخدم؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      try {
        await usersService.deleteUser(userId);
        fetchUsers(); // Refresh list
      } catch (err) {
        alert(`فشل حذف المستخدم: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        <p>خطأ: {error}</p>
        <button onClick={fetchUsers} className="admin-button-primary mt-4">
          <RefreshCcw size={16} className="ml-2" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة المستخدمين</h1>
      <p className="text-muted-foreground">
        عرض وإدارة المستخدمين المسجلين في المنصة.
      </p>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            name="search"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-4 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <select
          name="role"
          value={filters.role}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الأدوار</option>
          <option value="user">مستخدم</option>
          <option value="seller">بائع</option>
          <option value="admin">مشرف</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">غير نشط</option>
        </select>

        <button onClick={fetchUsers} className="admin-button-primary">
          <RefreshCcw size={16} className="ml-2" />
          تحديث
        </button>
      </div>

      {/* Users Table */}
      <div className="data-table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="data-table-header">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الدور</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">تاريخ التسجيل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user._id} className="data-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User size={20} className="text-primary ml-2" />
                        <span className="text-sm font-medium text-foreground">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Mail size={16} className="text-muted-foreground ml-2" />
                        <span className="text-sm text-muted-foreground">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {user.role === 'admin' ? 'مشرف' : user.role === 'seller' ? 'بائع' : 'مستخدم'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${user.isActive ? 'status-active' : 'status-pending'}`}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-muted-foreground ml-2" />
                        {new Date(user.createdAt).toLocaleDateString('ar-LY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleStatusChange(user._id, user.isActive)}
                        className={`admin-button-secondary ml-2 ${user.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                      >
                        {user.isActive ? 'تعطيل' : 'تنشيط'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="admin-button-danger"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-muted-foreground">
                    لا توجد بيانات للمستخدمين.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="admin-button-secondary disabled:opacity-50"
            >
              السابق
            </button>
            <span className="text-sm text-muted-foreground">
              صفحة {pagination.page} من {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="admin-button-secondary disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;

