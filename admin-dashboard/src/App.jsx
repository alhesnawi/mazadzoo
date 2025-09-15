import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import UsersManagement from './components/UsersManagement';
import AnimalsManagement from './components/AnimalsManagement';
import AuctionsManagement from './components/AuctionsManagement';
import PaymentsManagement from './components/PaymentsManagement';
import Settings from './components/Settings';
import Login from './components/Login';

// API Service
import { authService } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
        const userData = await authService.getProfile();
        if (userData.role === 'admin') {
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
        }
      }
    } catch {
      // Auth check failed, clear user data
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.user.role === 'admin') {
        localStorage.setItem('adminToken', response.token);
        setUser(response.user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, message: 'غير مصرح لك بالوصول إلى لوحة التحكم' };
      }
    } catch (error) {
      return { success: false, message: error.message || 'فشل في تسجيل الدخول' };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar 
            isOpen={sidebarOpen} 
            onToggle={() => setSidebarOpen(!sidebarOpen)}
          />
          
          {/* Main Content */}
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'mr-64' : 'mr-16'}`}>
            {/* Header */}
            <Header 
              user={user}
              onLogout={handleLogout}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
            
            {/* Page Content */}
            <main className="p-6">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UsersManagement />} />
                <Route path="/animals" element={<AnimalsManagement />} />
                <Route path="/auctions" element={<AuctionsManagement />} />
                <Route path="/payments" element={<PaymentsManagement />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;

