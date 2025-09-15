import { useState, useEffect, useCallback } from 'react';
import { animalsService } from '../services/api';
import { PawPrint, Calendar, DollarSign, Gavel, CheckCircle, XCircle, Search, RefreshCcw, Image, Video } from 'lucide-react';

const AnimalsManagement = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const fetchAnimals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      const data = await animalsService.getAnimals(params);
      setAnimals(data.animals);
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
    fetchAnimals();
  }, [fetchAnimals]);

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

  const handleApproveAnimal = async (animalId) => {
    if (window.confirm('هل أنت متأكد من الموافقة على هذا الحيوان؟')) {
      try {
        await animalsService.approveAnimal(animalId);
        fetchAnimals(); // Refresh list
      } catch (err) {
        alert(`فشل الموافقة على الحيوان: ${err.message}`);
      }
    }
  };

  const handleRejectAnimal = async (animalId) => {
    const reason = prompt('يرجى إدخال سبب الرفض:');
    if (reason) {
      try {
        await animalsService.rejectAnimal(animalId, reason);
        fetchAnimals(); // Refresh list
      } catch (err) {
        alert(`فشل رفض الحيوان: ${err.message}`);
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="status-badge status-pending">قيد المراجعة</span>;
      case 'approved':
        return <span className="status-badge status-active">موافق عليه</span>;
      case 'active':
        return <span className="status-badge status-active">نشط (مزاد)</span>;
      case 'sold':
        return <span className="status-badge status-sold">مباع</span>;
      case 'rejected':
        return <span className="status-badge status-cancelled">مرفوض</span>;
      case 'ended':
        return <span className="status-badge status-ended">منتهي</span>;
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
        <button onClick={fetchAnimals} className="admin-button-primary mt-4">
          <RefreshCcw size={16} className="ml-2" />
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة الحيوانات</h1>
      <p className="text-muted-foreground">
        عرض وإدارة الحيوانات المعروضة للبيع والمزادات.
      </p>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            name="search"
            placeholder="البحث بالاسم أو النوع..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-4 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الفئات</option>
          <option value="طيور">طيور</option>
          <option value="زواحف">زواحف</option>
          <option value="ثدييات">ثدييات</option>
          <option value="أسماك">أسماك</option>
          <option value="حشرات">حشرات</option>
          <option value="أخرى">أخرى</option>
        </select>

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">موافق عليه</option>
          <option value="active">نشط (مزاد)</option>
          <option value="sold">مباع</option>
          <option value="rejected">مرفوض</option>
          <option value="ended">منتهي</option>
        </select>

        <button onClick={fetchAnimals} className="admin-button-primary">
          <RefreshCcw size={16} className="ml-2" />
          تحديث
        </button>
      </div>

      {/* Animals Table */}
      <div className="data-table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="data-table-header">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">البائع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الفئة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">السعر الافتتاحي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">تاريخ الإضافة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {animals.length > 0 ? (
                animals.map((animal) => (
                  <tr key={animal._id} className="data-table-row">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <PawPrint size={20} className="text-primary ml-2" />
                        <span className="text-sm font-medium text-foreground">{animal.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-muted-foreground">{animal.sellerId?.username || 'غير معروف'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {animal.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <DollarSign size={16} className="text-muted-foreground ml-2" />
                        {animal.startPrice} د.ل
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(animal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar size={16} className="text-muted-foreground ml-2" />
                        {new Date(animal.createdAt).toLocaleDateString('ar-LY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {animal.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveAnimal(animal._id)}
                            className="admin-button-primary ml-2"
                          >
                            <CheckCircle size={16} className="ml-2" />
                            موافقة
                          </button>
                          <button
                            onClick={() => handleRejectAnimal(animal._id)}
                            className="admin-button-danger"
                          >
                            <XCircle size={16} className="ml-2" />
                            رفض
                          </button>
                        </>
                      )}
                      {animal.status === 'approved' && (
                        <button
                          onClick={() => animalsService.startAuction(animal._id)}
                          className="admin-button-primary"
                        >
                          <Gavel size={16} className="ml-2" />
                          بدء المزاد
                        </button>
                      )}
                      {animal.status === 'active' && (
                        <button
                          onClick={() => animalsService.endAuction(animal._id)}
                          className="admin-button-danger"
                        >
                          <Gavel size={16} className="ml-2" />
                          إنهاء المزاد
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-muted-foreground">
                    لا توجد بيانات للحيوانات.
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

export default AnimalsManagement;

