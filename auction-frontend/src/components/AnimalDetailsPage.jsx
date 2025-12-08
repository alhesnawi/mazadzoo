import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx'
import { ArrowLeft, Clock, Users, Gavel, MapPin, Heart, Share2, Flag } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuction } from '../contexts/AuctionContext'
import { formatCurrency, formatTimeRemaining } from '../utils/helpers'
import appLogo from '../assets/app_logo.png'

function AnimalDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const { animals, placeBid, loading } = useAuction()
  const [animal, setAnimal] = useState(null)
  const [bidAmount, setBidAmount] = useState('')
  const [bids, setBids] = useState([])
  const [biddingLoading, setBiddingLoading] = useState(false)

  useEffect(() => {
    const foundAnimal = animals.find(a => a._id === id)
    if (foundAnimal) {
      setAnimal(foundAnimal)
      // Set minimum bid amount
      setBidAmount((foundAnimal.currentBid || foundAnimal.startPrice) + 100)
    }
  }, [id, animals]) // Added animals to dependencies to update when bids are placed

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول للمزايدة')
      navigate('/login')
      return
    }

    const amount = parseFloat(bidAmount)
    const minBid = (animal.currentBid || animal.startPrice) + 100

    if (isNaN(amount) || amount <= 0) {
      alert('يرجى إدخال مبلغ صحيح')
      return
    }

    if (amount < minBid) {
      alert(`الحد الأدنى للمزايدة هو ${formatCurrency(minBid)}`)
      return
    }

    console.log('Placing bid:', { animalId: animal._id, amount })
    
    setBiddingLoading(true)
    try {
      const result = await placeBid(animal._id, amount)
      console.log('Bid result:', result)
      
      if (result.success) {
        alert('تم وضع المزايدة بنجاح! ✅')
        setBidAmount('')
        // The context will update the animal automatically
      } else {
        alert(result.message || 'فشل في وضع المزايدة')
      }
    } catch (error) {
      console.error('Bid error:', error)
      alert('حدث خطأ أثناء المزايدة')
    } finally {
      setBiddingLoading(false)
    }
  }

  const handleAddToFavorites = () => {
    if (!isAuthenticated) {
      alert('يجب تسجيل الدخول لإضافة للمفضلة')
      navigate('/login')
      return
    }
    alert('تم إضافة الحيوان للمفضلة')
  }

  if (loading || !animal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل التفاصيل...</p>
        </div>
      </div>
    )
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
              <h1 className="text-lg font-bold text-primary">مزاد الحيوانات النادرة</h1>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button variant="ghost" size="sm" onClick={handleAddToFavorites}>
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <img
                  src={animal.images?.[0] || "https://via.placeholder.com/800x600?text=صورة+الحيوان"}
                  alt={animal.name}
                  className="w-full h-96 object-cover rounded-t-xl"
                />
                <div className="grid grid-cols-4 gap-2 p-4">
                  {animal.images?.slice(1, 5).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`${animal.name} ${idx + 2}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{animal.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge>{animal.category}</Badge>
                      <Badge variant="outline">{animal.type}</Badge>
                    </div>
                  </div>
                  <Badge className={
                    animal.status === 'active' ? 'bg-green-500' :
                    animal.status === 'ended' ? 'bg-gray-500' : 'bg-yellow-500'
                  }>
                    {animal.status === 'active' ? 'نشط' :
                     animal.status === 'ended' ? 'انتهى' : 'قيد الانتظار'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description" dir="rtl">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="description">الوصف</TabsTrigger>
                    <TabsTrigger value="details">التفاصيل</TabsTrigger>
                    <TabsTrigger value="seller">البائع</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="description" className="mt-4">
                    <p className="text-muted-foreground leading-relaxed">{animal.description}</p>
                  </TabsContent>
                  
                  <TabsContent value="details" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-muted-foreground">العمر:</span>
                        <p className="font-medium">{animal.age}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">الجنس:</span>
                        <p className="font-medium">{animal.gender}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">الوزن التقريبي:</span>
                        <p className="font-medium">{animal.approximateWeight || 'غير محدد'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">الحالة الصحية:</span>
                        <p className="font-medium">{animal.healthCondition}</p>
                      </div>
                      {animal.breed && (
                        <div>
                          <span className="text-sm text-muted-foreground">السلالة:</span>
                          <p className="font-medium">{animal.breed}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-muted-foreground">الموقع:</span>
                        <p className="font-medium flex items-center">
                          <MapPin className="h-4 w-4 ml-1" />
                          {animal.location || 'ليبيا'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="seller" className="mt-4">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {animal.seller?.fullName?.charAt(0) || 'ب'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{animal.seller?.fullName || 'بائع'}</p>
                        <p className="text-sm text-muted-foreground">عضو منذ 2024</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Bidding */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>معلومات المزايدة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">المزايدة الحالية</p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(animal.currentBid || animal.startPrice)}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">الوقت المتبقي</span>
                  <Badge variant="outline" className="text-base">
                    <Clock className="h-4 w-4 ml-1" />
                    {animal.auctionEndDate ? formatTimeRemaining(animal.auctionEndDate) : 'غير محدد'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">عدد المزايدات</span>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 ml-1 text-muted-foreground" />
                    <span className="font-medium">{animal.bidCount || 0}</span>
                  </div>
                </div>

                {animal.status === 'active' && isAuthenticated && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium mb-2 block">مبلغ المزايدة</label>
                      <Input
                        type="number"
                        placeholder="أدخل المبلغ"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        min={(animal.currentBid || animal.startPrice) + 100}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        الحد الأدنى: {formatCurrency((animal.currentBid || animal.startPrice) + 100)}
                      </p>
                    </div>
                    <Button 
                      className="w-full bid-button" 
                      size="lg"
                      onClick={handlePlaceBid}
                      disabled={biddingLoading || !bidAmount || parseFloat(bidAmount) < (animal.currentBid || animal.startPrice) + 100}
                    >
                      <Gavel className="h-5 w-5 ml-2" />
                      {biddingLoading ? 'جاري المزايدة...' : 'زايد الآن'}
                    </Button>
                  </div>
                )}

                {animal.status === 'active' && !isAuthenticated && (
                  <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                    سجل دخول للمزايدة
                  </Button>
                )}

                {animal.status === 'ended' && (
                  <div className="text-center py-4">
                    <Badge variant="secondary" className="text-base">
                      انتهى المزاد
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">ملاحظات مهمة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• تأكد من قراءة التفاصيل بعناية قبل المزايدة</p>
                <p>• المزايدة نهائية ولا يمكن التراجع عنها</p>
                <p>• يجب توفر رصيد كافٍ في محفظتك</p>
                <p>• التسليم يتم بعد إغلاق المزاد</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AnimalDetailsPage
