import { useState, useEffect, useCallback } from 'react';
import { paymentsService } from '../services/api';
import { CreditCard, DollarSign, Calendar, RefreshCcw, Search, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const PaymentsManagement = () => {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchPaymentsAndStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const [paymentsData, statsData] = await Promise.all([
        paymentsService.getPayments(params),
        paymentsService.getPaymentStats()
      ]);
      setPayments(paymentsData.payments);
      setPagination(prev => ({
        ...prev,
        total: paymentsData.pagination.total,
        pages: paymentsData.pagination.pages
      }));
      setStats(statsData.stats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchPaymentsAndStats();
  }, [fetchPaymentsAndStats]);

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

  const handleRefund = async (paymentId) => {
    const reason = prompt('يرجى إدخال سبب الاسترداد:');
    if (reason) {
      if (window.confirm(`هل أنت متأكد من استرداد هذا المبلغ؟`)) {
        try {
          await paymentsService.processRefund(paymentId, reason);
          fetchPaymentsAndStats(); // Refresh list
        } catch (err) {
          alert(`فشل عملية الاسترداد: ${err.message}`);
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="status-badge status-active">مكتمل</span>;
      case 'pending':
        return <span className="status-badge status-pending">معلق</span>;
      case 'refunded':
        return <span className="status-badge status-cancelled">مسترد</span>;
      case 'failed':
        return <span className="status-badge status-cancelled">فشل</span>;
      default:
        return <span className="status-badge">غير معروف</span>;
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
        <button onClick={fetchPaymentsAndStats} className="admin-button-primary mt-4">
          <RefreshCcw size={16} className="ml-2" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const chartData = stats?.monthlyRevenue.map(item => ({
    month: item.month,
    revenue: item.totalAmount
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة المدفوعات</h1>
      <p className="text-muted-foreground">
        عرض وإدارة جميع المعاملات المالية وتقارير الإيرادات.
      </p>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats.totalEarned.toLocaleString()} د.ل</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المدفوعات</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats.totalPayments.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <CreditCard size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الاستردادات</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stats.totalRefunds.toLocaleString()} د.ل</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/20">
                <TrendingDown size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-4">الإيرادات الشهرية</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            name="search"
            placeholder="البحث بالوصف أو معرف الدفع..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-4 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الأنواع</option>
          <option value="deposit">إيداع</option>
          <option value="withdrawal">سحب</option>
          <option value="listing_fee">رسوم عرض</option>
          <option value="bid_fee">رسوم مزايدة</option>
          <option value="auction_win">فوز بالمزاد</option>
          <option value="refund">استرداد</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="completed">مكتمل</option>
          <option value="pending">معلق</option>
          <option value="refunded">مسترد</option>
          <option value="failed">فشل</option>
        </select>

        <button onClick={fetchPaymentsAndStats} className="admin-button-primary">
          <RefreshCcw size={16} className="ml-2" />
          تحديث
        </button>
      </div>

      {/* Payments Table */}
      <div className="data-table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="data-table-header">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">معرف الدفع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">المستخدم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">النوع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">المبلغ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment._id} className="data-table-row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      {payment._id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {payment.userId?.username || 'غير معروف'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-muted-foreground ml-2" />
                        {payment.amount} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-muted-foreground ml-2" />
                        {new Date(payment.createdAt).toLocaleString('ar-LY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'completed' && payment.type !== 'refund' && (
                        <button
                          onClick={() => handleRefund(payment._id)}
                          className="admin-button-danger"
                        >
                          استرداد
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-muted-foreground">
                    لا توجد بيانات للمدفوعات.
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

export default PaymentsManagement;

