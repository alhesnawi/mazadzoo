import { useState } from 'react';
import { 
  Bell, 
  Search, 
  Menu, 
  User, 
  LogOut, 
  Settings,
  Moon,
  Sun
} from 'lucide-react';

const Header = ({ user, onLogout, onToggleSidebar }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const notifications = [
    {
      id: 1,
      title: 'مزاد جديد',
      message: 'تم إضافة مزاد جديد للموافقة',
      time: 'منذ 5 دقائق',
      unread: true
    },
    {
      id: 2,
      title: 'دفعة جديدة',
      message: 'تم استلام دفعة بقيمة 500 دينار ليبي',
      time: 'منذ 15 دقيقة',
      unread: true
    },
    {
      id: 3,
      title: 'مستخدم جديد',
      message: 'انضم مستخدم جديد إلى المنصة',
      time: 'منذ ساعة',
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="admin-header h-16 px-6 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="البحث..."
            className="w-64 pl-4 pr-10 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md hover:bg-muted text-foreground transition-colors"
          title={darkMode ? 'الوضع الفاتح' : 'الوضع الداكن'}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-muted text-foreground transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-popover border border-border rounded-md shadow-lg z-50">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-popover-foreground">الإشعارات</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                      notification.unread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-popover-foreground text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                      {notification.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center">
                <button className="text-primary hover:text-primary/80 text-sm font-medium">
                  عرض جميع الإشعارات
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-primary-foreground" />
            </div>
            <div className="hidden md:block text-right">
              <div className="font-medium text-foreground text-sm">
                {user?.username || 'المشرف'}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute left-0 mt-2 w-48 bg-popover border border-border rounded-md shadow-lg z-50">
              <div className="p-2">
                <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-popover-foreground transition-colors">
                  <User size={16} />
                  الملف الشخصي
                </button>
                <button className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted text-popover-foreground transition-colors">
                  <Settings size={16} />
                  الإعدادات
                </button>
                <hr className="my-2 border-border" />
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showUserMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowNotifications(false);
          }}
        />
      )}
    </header>
  );
};

export default Header;

