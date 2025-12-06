import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import appLogo from '../assets/app_logo.png';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      if (result.success) {
        toast.success('تم تسجيل الدخول بنجاح');
        navigate('/');
      } else {
        toast.error(result.message || 'فشل تسجيل الدخول');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <img src={appLogo} alt="Logo" className="h-20 w-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-800">تسجيل الدخول</h1>
          <p className="text-gray-500 mt-2">أدخل بيانات الدخول للوصول إلى حسابك</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              البريد الإلكتروني
            </label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
              كلمة المرور
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              className="text-left"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
          </Button>
          <p className="text-sm text-center text-gray-600 mt-4">
            ليس لديك حساب؟{' '}
            <Link to="/register" className="text-amber-600 hover:text-amber-800 font-medium">
              سجل الآن
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
