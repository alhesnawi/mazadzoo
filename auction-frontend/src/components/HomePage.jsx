import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Search, Heart, Clock, Users, Gavel, Star, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuction } from '../contexts/AuctionContext'
import { formatCurrency, formatTimeRemaining } from '../utils/helpers'
import appLogo from '../assets/app_logo.png'

const categories = ["جميع الفئات", "طيور", "زواحف", "ثدييات", "أسماك", "حشرات"]

function HomePage() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { animals, loading, error, searchAnimals, placeBid } = useAuction()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('جميع الفئات')
  const [bidAmount, setBidAmount] = useState('')
  const [biddingFor, setBiddingFor] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)


  // Search and filter animals
  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'جميع الفئات' || animal.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Handle search
  const handleSearch = () => {
    searchAnimals(searchTerm, { category: selectedCategory !== 'جميع الفئات' ? selectedCategory : undefined })
  }

  // Handle bid placement
  const handlePlaceBid = async (animalId) => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول للمزايدة')
      return
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert('يرجى إدخال مبلغ صحيح للمزايدة')
      return
    }

    const result = await placeBid(animalId, parseFloat(bidAmount))
    if (result.success) {
      alert('تم وضع المزايدة بنجاح!')
      setBidAmount('')
      setBiddingFor(null)
    } else {
      alert(result.message || 'فشل في وضع المزايدة')
    }
  }

  // Handle navigation
  const handleLogin = () => {
    setShowLoginModal(true)
  }

  const handleLogout = () => {
    logout()
  }

  const handleStartAuction = () => {
    // Scroll to auctions section
    document.getElementById('auctions-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleViewFavorites = () => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول لرؤية المفضلة')
      return
    }
    alert('ميزة المفضلة قيد التطوير')
  }

  const handleViewDetails = (animalId) => {
    alert(`عرض تفاصيل الحيوان ${animalId}`)
  }

  const handleAddToFavorites = (animalId) => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول لإضافة للمفضلة')
      return
    }
    alert(`تم إضافة الحيوان ${animalId} للمفضلة`)
  }

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      // This will trigger re-render to update countdown
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المزادات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">خطأ في تحميل البيانات: {error}</p>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">تسجيل الدخول</h3>
            <p className="text-muted-foreground mb-4">
              ميزة تسجيل الدخول قيد التطوير. يرجى استخدام الخادم الخلفي مباشرة.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setShowLoginModal(false)} className="flex-1">
                إغلاق
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('http://localhost:5002/api/auth/login', '_blank')}
                className="flex-1"
              >
                API تسجيل الدخول
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <img src={appLogo} alt="شعار التطبيق" className="h-10 w-10" />
              <h1 className="text-xl font-bold text-primary">مزاد الحيوانات النادرة</h1>
            </div>
            <nav className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>الرئيسية</Button>
              <Button variant="ghost" onClick={handleStartAuction}>المزادات</Button>
              <Button variant="ghost" onClick={() => isAuthenticated ? alert('ميزة حسابي قيد التطوير') : handleLogin()}>حسابي</Button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className="text-sm text-muted-foreground">مرحباً، {user?.username}</span>
                  <Button variant="outline" onClick={handleLogout}>تسجيل الخروج</Button>
                </div>
              ) : (
                <Button onClick={handleLogin}>تسجيل الدخول</Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-l from-primary/10 to-accent/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            اكتشف أندر الحيوانات في العالم
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            منصة المزادات الرائدة للحيوانات النادرة والاستثنائية
          </p>
          <div className="flex justify-center space-x-4 space-x-reverse">
            <Button size="lg" className="bg-primary hover:bg-primary/90" onClick={handleStartAuction}>
              <Gavel className="ml-2 h-5 w-5" />
              ابدأ المزايدة
            </Button>
            <Button size="lg" variant="outline" onClick={handleViewFavorites}>
              <Heart className="ml-2 h-5 w-5" />
              عرض المفضلة
            </Button>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث عن الحيوانات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pr-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleSearch}>
              <Filter className="ml-2 h-4 w-4" />
              بحث
            </Button>
          </div>
        </div>
      </section>

      {/* Animals Grid */}
      <main className="py-12" id="auctions-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">المزادات النشطة</h3>
            <p className="text-muted-foreground">
              {filteredAnimals.length} من أصل {animals.length} مزاد
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <Card key={animal._id} className="auction-card fade-in">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={animal.images?.[0] || animal.image || "https://via.placeholder.com/400x300?text=صورة+الحيوان"}
                      alt={animal.name}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        animal.status === 'active' ? 'status-active' : 
                        animal.status === 'ended' ? 'status-ended' : 'status-pending'
                      }`}
                    >
                      {animal.status === 'active' ? 'نشط' : 
                       animal.status === 'ended' ? 'انتهى' : 'قيد الانتظار'}
                    </Badge>
                    <Badge className="absolute top-2 left-2 category-badge">
                      {animal.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{animal.name}</CardTitle>
                  <CardDescription className="mb-4">{animal.description}</CardDescription>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">المزايدة الحالية:</span>
                      <span className="price-display">{formatCurrency(animal.currentBid || animal.startPrice)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">الوقت المتبقي:</span>
                      <Badge className="countdown-timer">
                        {animal.auctionEndTime ? formatTimeRemaining(animal.auctionEndTime) : 'غير محدد'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{animal.bidCount || 0} مزايدة</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm">{animal.rating || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 space-y-2">
                  {animal.status === 'active' && isAuthenticated && (
                    <div className="w-full space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="مبلغ المزايدة"
                          value={biddingFor === animal._id ? bidAmount : ''}
                          onChange={(e) => {
                            setBidAmount(e.target.value)
                            setBiddingFor(animal._id)
                          }}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => handlePlaceBid(animal._id)}
                          disabled={!bidAmount || parseFloat(bidAmount) <= 0}
                          className="bid-button"
                        >
                          <Gavel className="ml-2 h-4 w-4" />
                          زايد
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDetails(animal._id)}
                    >
                      عرض التفاصيل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToFavorites(animal._id)}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {filteredAnimals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 space-x-reverse mb-4">
                <img src={appLogo} alt="شعار التطبيق" className="h-8 w-8" />
                <h3 className="font-bold">مزاد الحيوانات النادرة</h3>
              </div>
              <p className="text-muted-foreground">
                منصة المزادات الرائدة للحيوانات النادرة والاستثنائية في المنطقة
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">الرئيسية</a></li>
                <li><a href="#" className="hover:text-primary">المزادات</a></li>
                <li><a href="#" className="hover:text-primary">كيف يعمل</a></li>
                <li><a href="#" className="hover:text-primary">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-primary">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-primary">الشروط والأحكام</a></li>
                <li><a href="#" className="hover:text-primary">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-primary">الأسئلة الشائعة</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>البريد الإلكتروني: info@rareauction.ly</li>
                <li>الهاتف: +218 21 123 4567</li>
                <li>العنوان: طرابلس، ليبيا</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 مزاد الحيوانات النادرة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
