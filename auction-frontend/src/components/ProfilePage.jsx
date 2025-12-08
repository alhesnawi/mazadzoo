import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Avatar, AvatarFallback } from '@/components/ui/avatar.jsx'
import { Input } from '@/components/ui/input.jsx'
import { ArrowLeft, User, Wallet, Heart, History, Settings, Plus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuction } from '../contexts/AuctionContext'
import { formatCurrency, formatTimeRemaining } from '../utils/helpers'
import appLogo from '../assets/app_logo.png'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { animals } = useAuction()
  const [myBids, setMyBids] = useState([])
  const [favorites, setFavorites] = useState([])
  const [myAnimals, setMyAnimals] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Filter animals based on user role
    if (user?.role === 'seller') {
      setMyAnimals(animals.filter(a => a.sellerId?._id === user._id || a.seller?._id === user._id))
    }
  }, [isAuthenticated, user, animals, navigate])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleAddAnimal = () => {
    navigate('/add-animal')
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة
              </Button>
              <img src={appLogo} alt="شعار التطبيق" className="h-8 w-8" />
              <h1 className="text-lg font-bold text-primary">حسابي</h1>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl">
                    {user.fullName?.charAt(0) || user.username?.charAt(0) || 'م'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user.fullName || user.username}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
                <Badge className="mt-2">
                  {user.role === 'seller' ? 'بائع' : 
                   user.role === 'buyer' ? 'مشتري' : 
                   user.role}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">الرصيد</span>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(user.balance || 0)}
                  </p>
                  <Button className="w-full mt-3" size="sm" variant="outline">
                    <Plus className="h-4 w-4 ml-1" />
                    شحن الرصيد
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رقم الهاتف</span>
                    <span className="font-medium">{user.phoneNumber || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الدولة</span>
                    <span className="font-medium">{user.country || 'ليبيا'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">تاريخ التسجيل</span>
                    <span className="font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-LY') : '-'}
                    </span>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  <Settings className="h-4 w-4 ml-2" />
                  إعدادات الحساب
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue={user.role === 'seller' ? 'my-animals' : 'my-bids'} dir="rtl">
              <TabsList className="grid w-full grid-cols-3">
                {user.role === 'seller' && (
                  <TabsTrigger value="my-animals">
                    <History className="h-4 w-4 ml-2" />
                    حيواناتي
                  </TabsTrigger>
                )}
                {user.role === 'buyer' && (
                  <TabsTrigger value="my-bids">
                    <History className="h-4 w-4 ml-2" />
                    مزايداتي
                  </TabsTrigger>
                )}
                <TabsTrigger value="favorites">
                  <Heart className="h-4 w-4 ml-2" />
                  المفضلة
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="h-4 w-4 ml-2" />
                  السجل
                </TabsTrigger>
              </TabsList>

              {/* My Animals Tab (for sellers) */}
              {user.role === 'seller' && (
                <TabsContent value="my-animals" className="space-y-4 mt-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">حيواناتي ({myAnimals.length})</h3>
                    <Button onClick={handleAddAnimal}>
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة حيوان جديد
                    </Button>
                  </div>

                  {myAnimals.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">لم تقم بإضافة أي حيوانات بعد</p>
                        <Button onClick={handleAddAnimal}>
                          <Plus className="h-4 w-4 ml-2" />
                          أضف حيوانك الأول
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myAnimals.map((animal) => (
                        <Card key={animal._id} className="hover:shadow-lg transition-shadow">
                          <CardHeader className="p-0">
                            <img
                              src={animal.images?.[0] || "https://via.placeholder.com/400x300"}
                              alt={animal.name}
                              className="w-full h-48 object-cover rounded-t-xl"
                            />
                          </CardHeader>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold">{animal.name}</h4>
                              <Badge className={
                                animal.status === 'active' ? 'bg-green-500' :
                                animal.status === 'pending' ? 'bg-yellow-500' :
                                animal.status === 'sold' ? 'bg-blue-500' :
                                'bg-gray-500'
                              }>
                                {animal.status === 'active' ? 'نشط' :
                                 animal.status === 'pending' ? 'قيد المراجعة' :
                                 animal.status === 'sold' ? 'مباع' :
                                 animal.status === 'rejected' ? 'مرفوض' :
                                 'منتهي'}
                              </Badge>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">السعر الحالي</span>
                                <span className="font-bold text-primary">
                                  {formatCurrency(animal.currentBid || animal.startPrice)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">عدد المزايدات</span>
                                <span>{animal.bidCount || 0}</span>
                              </div>
                              {animal.auctionEndDate && (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">الوقت المتبقي</span>
                                  <span>{formatTimeRemaining(animal.auctionEndDate)}</span>
                                </div>
                              )}
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/animal/${animal._id}`)}
                            >
                              عرض التفاصيل
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* My Bids Tab (for buyers) */}
              {user.role === 'buyer' && (
                <TabsContent value="my-bids" className="space-y-4 mt-6">
                  <h3 className="text-xl font-bold">مزايداتي ({myBids.length})</h3>
                  
                  {myBids.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">لم تقم بأي مزايدات بعد</p>
                        <Button onClick={() => navigate('/')}>
                          تصفح المزادات
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {myBids.map((bid) => (
                        <Card key={bid._id}>
                          <CardContent className="p-4">
                            {/* Bid details */}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Favorites Tab */}
              <TabsContent value="favorites" className="space-y-4 mt-6">
                <h3 className="text-xl font-bold">المفضلة ({favorites.length})</h3>
                
                {favorites.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">لا توجد حيوانات في المفضلة</p>
                      <Button onClick={() => navigate('/')}>
                        تصفح الحيوانات
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Favorites list */}
                  </div>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="space-y-4 mt-6">
                <h3 className="text-xl font-bold">السجل</h3>
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">لا توجد سجلات بعد</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
