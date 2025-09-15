import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  Gavel, 
  CreditCard, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import logo from '../assets/app_logo.png';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'لوحة القيادة',
      description: 'نظرة عامة على النظام'
    },
    {
      path: '/users',
      icon: Users,
      label: 'إدارة المستخدمين',
      description: 'المستخدمين والبائعين'
    },
    {
      path: '/animals',
      icon: PawPrint,
      label: 'إدارة الحيوانات',
      description: 'الحيوانات والموافقات'
    },
    {
      path: '/auctions',
      icon: Gavel,
      label: 'إدارة المزادات',
      description: 'المزادات النشطة والمنتهية'
    },
    {
      path: '/payments',
      icon: CreditCard,
      label: 'إدارة المدفوعات',
      description: 'المعاملات والتقارير'
    },
    {
      path: '/settings',
      icon: Settings,
      label: 'الإعدادات',
      description: 'إعدادات النظام'
    }
  ];

  return (
    <div className={`fixed right-0 top-0 h-full bg-sidebar border-l border-sidebar-border transition-all duration-300 z-50 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {isOpen && (
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="شعار التطبيق" 
              className="w-8 h-8 rounded-full"
            />
            <div>
              <h2 className="font-semibold text-sidebar-foreground text-sm">
                لوحة التحكم
              </h2>
              <p className="text-xs text-sidebar-foreground/70">
                مزاد الحيوانات النادرة
              </p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors"
        >
          {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 p-3 rounded-md transition-colors group ${
                    isActive 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  
                  {isOpen && (
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {item.label}
                      </div>
                      <div className="text-xs opacity-70 truncate">
                        {item.description}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-sidebar-accent rounded-md p-3 text-center">
            <p className="text-xs text-sidebar-accent-foreground font-medium">
              الإصدار 1.0.0
            </p>
            <p className="text-xs text-sidebar-accent-foreground/70 mt-1">
              جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

