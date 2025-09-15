import { useState } from 'react';
import { Settings as SettingsIcon, Save, AlertCircle } from 'lucide-react';

const Settings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    platformName: 'مزاد الحيوانات النادرة',
    contactEmail: 'info@rareanimalsauction.com',
    contactPhone: '+218912345678',
    defaultAuctionDuration: 20, // minutes
    bidFee: 40, // LYD
    listingFee: 10, // LYD
    platformCommission: 5 // percentage
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true
  });
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordResetEnabled: true
  });
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', 'saving'

  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, checked } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      // Saving settings data
      setSaveStatus('success');
    } catch {
      // Handle settings save error
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
      <p className="text-muted-foreground">
        إدارة الإعدادات العامة للنظام، الإشعارات، والأمان.
      </p>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* General Settings */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <SettingsIcon size={20} />
            الإعدادات العامة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="platformName" className="block text-sm font-medium text-muted-foreground mb-1">
                اسم المنصة
              </label>
              <input
                type="text"
                id="platformName"
                name="platformName"
                value={generalSettings.platformName}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-muted-foreground mb-1">
                البريد الإلكتروني للتواصل
              </label>
              <input
                type="email"
                id="contactEmail"
                name="contactEmail"
                value={generalSettings.contactEmail}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-muted-foreground mb-1">
                رقم الهاتف للتواصل
              </label>
              <input
                type="text"
                id="contactPhone"
                name="contactPhone"
                value={generalSettings.contactPhone}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="defaultAuctionDuration" className="block text-sm font-medium text-muted-foreground mb-1">
                مدة المزاد الافتراضية (بالدقائق)
              </label>
              <input
                type="number"
                id="defaultAuctionDuration"
                name="defaultAuctionDuration"
                value={generalSettings.defaultAuctionDuration}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="bidFee" className="block text-sm font-medium text-muted-foreground mb-1">
                رسوم المزايدة (د.ل)
              </label>
              <input
                type="number"
                id="bidFee"
                name="bidFee"
                value={generalSettings.bidFee}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="listingFee" className="block text-sm font-medium text-muted-foreground mb-1">
                رسوم العرض (د.ل)
              </label>
              <input
                type="number"
                id="listingFee"
                name="listingFee"
                value={generalSettings.listingFee}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="platformCommission" className="block text-sm font-medium text-muted-foreground mb-1">
                عمولة المنصة (%)
              </label>
              <input
                type="number"
                id="platformCommission"
                name="platformCommission"
                value={generalSettings.platformCommission}
                onChange={handleGeneralChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Bell size={20} />
            إعدادات الإشعارات
          </h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="emailNotifications"
                name="emailNotifications"
                checked={notificationSettings.emailNotifications}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ml-2"
              />
              <label htmlFor="emailNotifications" className="text-sm font-medium text-foreground">
                إشعارات البريد الإلكتروني
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="smsNotifications"
                name="smsNotifications"
                checked={notificationSettings.smsNotifications}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ml-2"
              />
              <label htmlFor="smsNotifications" className="text-sm font-medium text-foreground">
                إشعارات الرسائل النصية (SMS)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inAppNotifications"
                name="inAppNotifications"
                checked={notificationSettings.inAppNotifications}
                onChange={handleNotificationChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ml-2"
              />
              <label htmlFor="inAppNotifications" className="text-sm font-medium text-foreground">
                إشعارات داخل التطبيق
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Lock size={20} />
            إعدادات الأمان
          </h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="twoFactorAuth"
                name="twoFactorAuth"
                checked={securitySettings.twoFactorAuth}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ml-2"
              />
              <label htmlFor="twoFactorAuth" className="text-sm font-medium text-foreground">
                المصادقة الثنائية (2FA)
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="passwordResetEnabled"
                name="passwordResetEnabled"
                checked={securitySettings.passwordResetEnabled}
                onChange={handleSecurityChange}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ml-2"
              />
              <label htmlFor="passwordResetEnabled" className="text-sm font-medium text-foreground">
                تمكين إعادة تعيين كلمة المرور
              </label>
            </div>
          </div>
        </div>

        {/* Save Button and Status */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="admin-button-primary flex items-center gap-2"
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <Save size={16} />
            )}
            حفظ الإعدادات
          </button>

          {saveStatus === 'success' && (
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle size={16} />
              تم الحفظ بنجاح!
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-600 flex items-center gap-1">
              <AlertCircle size={16} />
              فشل الحفظ. يرجى المحاولة مرة أخرى.
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default Settings;

