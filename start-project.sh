#!/bin/bash
cd "$(dirname "$0")"

# Rare Animals Auction Platform - Start Script
# منصة مزاد الحيوانات النادرة - سكريبت التشغيل

echo "🚀 بدء تشغيل منصة مزاد الحيوانات النادرة..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_status "التحقق من تثبيت Node.js..."
if ! command_exists node; then
    print_error "Node.js غير مثبت. يرجى تثبيت Node.js أولاً."
    exit 1
fi

# Check environment files
print_status "التحقق من ملفات البيئة..."

# Check backend .env file
if [ ! -f "./backend/.env" ]; then
    print_warning "ملف .env غير موجود في المجلد backend. سيتم استخدام القيم الافتراضية."
fi

# Check frontend .env file
if [ ! -f "./auction-frontend/.env" ]; then
    print_warning "ملف .env غير موجود في المجلد auction-frontend. إنشاء ملف .env..."
    cat > ./auction-frontend/.env << EOL
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=مزاد الحيوانات النادرة
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_SOCKET=true
VITE_ENABLE_REAL_TIME_BIDDING=true
VITE_ENABLE_NOTIFICATIONS=true

# Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Analytics
VITE_ENABLE_ANALYTICS=false
EOL
    print_success "تم إنشاء ملف .env في المجلد auction-frontend."
fi

# Check admin dashboard .env file
if [ ! -f "./admin-dashboard/.env" ]; then
    print_warning "ملف .env غير موجود في المجلد admin-dashboard. إنشاء ملف .env..."
    cat > ./admin-dashboard/.env << EOL
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=لوحة إدارة مزاد الحيوانات النادرة
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_SOCKET=true
VITE_ENABLE_REAL_TIME_BIDDING=true
VITE_ENABLE_NOTIFICATIONS=true

# Upload Configuration
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Analytics
VITE_ENABLE_ANALYTICS=false
EOL
    print_success "تم إنشاء ملف .env في المجلد admin-dashboard."
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 أو أحدث مطلوب. الإصدار الحالي: $(node -v)"
    exit 1
fi

print_success "Node.js مثبت: $(node -v)"

# Check if npm is installed
print_status "التحقق من تثبيت npm..."
if ! command_exists npm; then
    print_error "npm غير مثبت. يرجى تثبيت npm أولاً."
    exit 1
fi

print_success "npm مثبت: $(npm -v)"

# Check if MongoDB is running (optional)
print_status "التحقق من تشغيل MongoDB..."
if command_exists mongod; then
    if pgrep -x "mongod" > /dev/null; then
        print_success "MongoDB يعمل"
    else
        print_warning "MongoDB غير مشغل. سيتم استخدام MongoDB Atlas أو قاعدة بيانات خارجية."
    fi
else
    print_warning "MongoDB غير مثبت. سيتم استخدام MongoDB Atlas أو قاعدة بيانات خارجية."
fi

# Create necessary directories
print_status "إنشاء المجلدات المطلوبة..."
mkdir -p backend/uploads/images
mkdir -p backend/uploads/videos
mkdir -p backend/uploads/certificates
mkdir -p backend/uploads/profiles

# Install dependencies
print_status "تثبيت التبعيات..."

# Backend dependencies
print_status "تثبيت تبعيات Backend..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "فشل في تثبيت تبعيات Backend"
        exit 1
    fi
else
    print_success "تبعيات Backend مثبتة بالفعل"
fi
cd ..

# Frontend dependencies
print_status "تثبيت تبعيات Frontend..."
cd auction-frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "فشل في تثبيت تبعيات Frontend"
        exit 1
    fi
else
    print_success "تبعيات Frontend مثبتة بالفعل"
fi
cd ..

# Admin Dashboard dependencies
print_status "تثبيت تبعيات Admin Dashboard..."
cd admin-dashboard
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "فشل في تثبيت تبعيات Admin Dashboard"
        exit 1
    fi
else
    print_success "تبعيات Admin Dashboard مثبتة بالفعل"
fi
cd ..

# Mobile App dependencies
print_status "تثبيت تبعيات Mobile App..."
cd mobile-app
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        print_error "فشل في تثبيت تبعيات Mobile App"
        exit 1
    fi
else
    print_success "تبعيات Mobile App مثبتة بالفعل"
fi
cd ..

print_success "تم تثبيت جميع التبعيات بنجاح!"

kill_processes_on_ports() {
    PORTS=(5000 5173 5174)
    for port in "${PORTS[@]}"; do
        if lsof -i :$port >/dev/null 2>&1; then
            print_warning "المنفذ $port مشغول. جاري إيقاف العملية..."
            lsof -ti:$port | xargs kill -9
            print_success "تم إيقاف العملية على المنفذ $port"
        fi
    done
}

kill_processes_on_ports

# Check if ports are available
print_status "التحقق من توفر المنافذ..."

PORTS=(5000 5173 5174)
PORT_CONFLICTS=false
for port in "${PORTS[@]}"; do
    if port_in_use $port; then
        print_error "المنفذ $port مشغول بالفعل. يرجى إيقاف العملية التي تستخدم هذا المنفذ."
        PORT_CONFLICTS=true
    else
        print_success "المنفذ $port متاح"
    fi
done

if [ "$PORT_CONFLICTS" = true ]; then
    print_error "يرجى حل تعارضات المنافذ قبل المتابعة."
    print_status "يمكنك استخدام الأمر التالي لإيقاف العمليات: lsof -ti:PORT | xargs kill"
    exit 1
fi

# Start the application
print_status "بدء تشغيل التطبيق..."

# Function to start backend
start_backend() {
    print_status "تشغيل Backend على المنفذ 5000..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    sleep 3
    
    if kill -0 $BACKEND_PID 2>/dev/null; then
        print_success "Backend يعمل على http://localhost:5000"
    else
        print_error "فشل في تشغيل Backend"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "تشغيل Frontend على المنفذ 5173..."
    cd auction-frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    sleep 3
    
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        print_success "Frontend يعمل على http://localhost:5173"
    else
        print_error "فشل في تشغيل Frontend"
        exit 1
    fi
}

# Function to start admin dashboard
start_admin() {
    print_status "تشغيل Admin Dashboard على المنفذ 5174..."
    cd admin-dashboard
    npm run dev &
    ADMIN_PID=$!
    cd ..
    sleep 3
    
    if kill -0 $ADMIN_PID 2>/dev/null; then
        print_success "Admin Dashboard يعمل على http://localhost:5174"
    else
        print_error "فشل في تشغيل Admin Dashboard"
        exit 1
    fi
}

# Start all services
start_backend
start_frontend
start_admin

# Wait a moment for all services to start
sleep 5

# Display final status
echo ""
echo "🎉 تم تشغيل منصة مزاد الحيوانات النادرة بنجاح!"
echo "=========================================="
echo ""
echo "📱 الروابط المتاحة:"
echo -e "${GREEN}Frontend (التطبيق الرئيسي):${NC} http://localhost:5173"
echo -e "${GREEN}Admin Dashboard (لوحة الإدارة):${NC} http://localhost:5174"
echo -e "${GREEN}Backend API:${NC} http://localhost:5000/api"
echo -e "${GREEN}Health Check:${NC} http://localhost:5000/api/health"
echo ""
echo "📋 معلومات إضافية:"
echo "- Frontend: React + Vite"
echo "- Admin Dashboard: React + Vite"
echo "- Backend: Node.js + Express"
echo "- Database: MongoDB"
echo "- Real-time: Socket.IO"
echo ""
echo "🛑 لإيقاف التطبيق، اضغط Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    print_status "إيقاف جميع الخدمات..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        print_success "تم إيقاف Backend"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        print_success "تم إيقاف Frontend"
    fi
    
    if [ ! -z "$ADMIN_PID" ]; then
        kill $ADMIN_PID 2>/dev/null
        print_success "تم إيقاف Admin Dashboard"
    fi
    
    print_success "تم إيقاف جميع الخدمات"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep the script running
while true; do
    sleep 1
done
