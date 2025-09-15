import { useState, useEffect } from 'react';
import { 
  Users, 
  PawPrint, 
  Gavel, 
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { dashboardService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    totalRevenue: 0,
    activeAuctions: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity()
      ]);
      
      setStats(statsData);
      setRecentActivity(activityData);
    } catch {
      // Handle dashboard data loading error
    } finally {
      setLoading(false);
    }
  };

  // Sample data for charts
  const monthlyData = [
    { month: 'يناير', revenue: 12000, auctions: 45 },
    { month: 'فبراير', revenue: 15000, auctions: 52 },
    { month: 'مارس', revenue: 18000, auctions: 61 },
    { month: 'أبريل', revenue: 22000, auctions: 73 },
    { month: 'مايو', revenue: 25000, auctions: 68 },
    { month: 'يونيو', revenue: 28000, auctions: 82 }
  ];

  const categoryData = [
    { name: 'طيور', value: 35, color: '#22c55e' },
    { name: 'زواحف', value: 25, color: '#3b82f6' },
    { name: 'ثدييات', value: 20, color: '#f59e0b' },
    { name: 'أسماك', value: 15, color: '#ef4444' },
    { name: 'أخرى', value: 5, color: '#8b5cf6' }
  ];

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats.totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'إجمالي الحيوانات',
      value: stats.totalAnimals,
      icon: PawPrint,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'المزادات النشطة',
      value: stats.activeAuctions,
      icon: Gavel,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${stats.totalRevenue.toLocaleString()} د.ل`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      change: '+23%',
      changeType: 'positive'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">لوحة القيادة</h1>
          <p className="text-muted-foreground mt-2">
            نظرة عامة على أداء منصة مزادات الحيوانات النادرة
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar size={16} />
          {new Date().toLocaleDateString('ar-LY')}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp size={16} className="text-green-600 ml-1" />
                    <span className="text-sm text-green-600 font-medium">
                      {stat.change}
                    </span>
                    <span className="text-sm text-muted-foreground mr-2">
                      من الشهر الماضي
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            الإيرادات الشهرية
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            توزيع فئات الحيوانات
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Auctions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              النشاط الأخير
            </h3>
            <Activity size={20} className="text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      {activity.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.timestamp).toLocaleString('ar-LY')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>لا توجد أنشطة حديثة</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            إجراءات سريعة
          </h3>
          <div className="space-y-3">
            <button className="w-full admin-button-primary text-right">
              <PawPrint size={20} className="ml-2" />
              الموافقة على الحيوانات الجديدة
            </button>
            <button className="w-full admin-button-secondary text-right">
              <Gavel size={20} className="ml-2" />
              بدء مزاد جديد
            </button>
            <button className="w-full admin-button-secondary text-right">
              <Users size={20} className="ml-2" />
              إدارة المستخدمين
            </button>
            <button className="w-full admin-button-secondary text-right">
              <DollarSign size={20} className="ml-2" />
              مراجعة المدفوعات
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
              تنبيهات مهمة
            </h4>
            <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
              <li>• يوجد 3 حيوانات في انتظار الموافقة</li>
              <li>• مزادان سينتهيان خلال الساعة القادمة</li>
              <li>• 5 مدفوعات تحتاج إلى مراجعة</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

