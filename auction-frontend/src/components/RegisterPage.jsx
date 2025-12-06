import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import appLogo from '../assets/app_logo.png';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username || !formData.email || !formData.phoneNumber || !formData.password) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('كلمة المرور غير متطابقة');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        username: formData.username,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
      
      if (result.success) {
        toast.success('تم إنشاء الحساب بنجاح');
        navigate('/');
      } else {
        toast.error(result.message || 'فشل إنشاء الحساب');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100 p-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-6">
          <img src={appLogo} alt="Logo" className="h-20 w-20 object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-800">إنشاء حساب جديد</h1>
          <p className="text-gray-500 mt-2">أنشئ حسابك للمشاركة في المزادات</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium text-gray-700 block">
              اسم المستخدم <span className="text-red-500">*</span>
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="اسم المستخدم"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
              البريد الإلكتروني <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700 block">
              رقم الهاتف <span className="text-red-500">*</span>
            </label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+218xxxxxxxxx"
              value={formData.phoneNumber}
              onChange={handleChange}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
              كلمة المرور <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 block">
              تأكيد كلمة المرور <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              dir="ltr"
              className="text-left"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-amber-600 hover:bg-amber-700 mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب'}
          </Button>
          <p className="text-sm text-center text-gray-600 mt-4">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="text-amber-600 hover:text-amber-800 font-medium">
              تسجيل الدخول
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
