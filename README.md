# 🚀 E-Metric Hub - Shopee Analytics Dashboard

Dashboard phân tích dữ liệu Shopee cho người bán hàng, hỗ trợ **Redux Toolkit** và **Mock Data Mode** để phát triển.

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt & Chạy dự án](#-cài-đặt--chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tính năng](#-tính-năng)
- [Mock Data](#-mock-data)
- [API Endpoints](#-api-endpoints)

---

## 📖 Giới thiệu

**E-Metric Hub** là ứng dụng web giúp người bán hàng trên Shopee theo dõi:
- 📊 Doanh thu & Lợi nhuận
- 📦 Đơn hàng & Sản phẩm
- 📈 Phân tích xu hướng
- 🎯 Top sản phẩm bán chạy

**Demo Mode**: Không cần tài khoản Shopee thật, sử dụng dữ liệu giả lập (250 đơn hàng, 55 sản phẩm công nghệ).

---

## 🛠 Công nghệ sử dụng

### Frontend
- **React 18** + **Vite**
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Ant Design** - UI Components
- **Recharts** - Data visualization

### Backend
- **Node.js** + **Express**
- **Shopee Open API v2** (Mock Mode)
- **CORS** enabled

---

## ⚡ Cài đặt & Chạy dự án

### 1️⃣ Clone repository

```bash
git clone <repository-url>
cd AISC
```

### 2️⃣ Cài đặt dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3️⃣ Cấu hình Environment Variables

#### Backend (.env)
Tạo file `backend/.env`:

```env
PORT=5000
NODE_ENV=development
USE_MOCK_MODE=true
FRONTEND_URL=http://localhost:5173

# Shopee API (Không cần thiết trong Mock Mode)
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_PARTNER_KEY=your_partner_key
SHOPEE_REDIRECT_URL=http://localhost:5173/auth/shopee/callback
```

### 4️⃣ Chạy ứng dụng

#### Terminal 1 - Backend
```bash
cd backend
node server.js
```
✅ Backend chạy tại: `http://localhost:5000`

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend chạy tại: `http://localhost:5173`

### 5️⃣ Mở trình duyệt

Truy cập: **http://localhost:5173**

---

## 📁 Cấu trúc thư mục

```
AISC/
├── backend/
│   ├── server.js                  # Entry point
│   ├── routes/
│   │   └── auth.js               # OAuth routes
│   ├── services/
│   │   └── mockShopeeAPI.js      # Mock Shopee API
│   └── mockData/
│       └── shopeeData.js         # Mock data generator (250 orders, 55 products)
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── DashboardPage.jsx      # Dashboard chính
│   │   │   ├── LandingPage.jsx        # Trang chủ
│   │   │   ├── ShopeeLogin.jsx        # Login component
│   │   │   └── ShopeeCallback.jsx     # OAuth callback
│   │   ├── store/
│   │   │   ├── store.js               # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js       # Auth state
│   │   │       └── dashboardSlice.js  # Dashboard data
│   │   ├── services/
│   │   │   └── api.js                 # API client
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

## 🎯 Tính năng

### 1. Dashboard Analytics

#### Tab "Tổng quan"
- 📊 **4 KPI Cards**: Doanh thu, Tổng đơn, Sản phẩm, Tỷ lệ chuyển đổi
- 📈 **Biểu đồ Doanh thu & Đơn hàng**: Area chart theo tháng (Jan-Oct 2025)
- 🥧 **Phân bố Danh mục**: Pie chart 10 categories công nghệ
- 💰 **Lợi nhuận theo tháng**: Bar chart

#### Tab "Sản phẩm"
- 📦 **4 KPI Cards**: Tổng SP, SP bán chạy, Cảnh báo tồn kho, Tổng lượt bán
- 📋 **Bảng Top sản phẩm**: 
  - Tên + Danh mục
  - Số lượng bán + Doanh thu
  - Tồn kho + Trạng thái (🔥 Hot / ⚠️ Thấp / ✓ Bình thường)
  - Tăng trưởng %

### 2. Đăng nhập Mock OAuth

- 🔐 **OAuth 2.0 Flow** (giả lập)
- ⚡ Auto-redirect & token exchange
- 💾 LocalStorage persistence
- 🔄 Auto-refresh on page reload

### 3. State Management (Redux Toolkit)

- **authSlice**: Quản lý authentication state
- **dashboardSlice**: Transform & cache dashboard data
- **Async thunks**: 
  - `checkAuth()` - Verify localStorage tokens
  - `exchangeShopeeToken()` - OAuth callback
  - `loadDashboardData()` - Fetch dashboard data

---

## 📊 Mock Data

### Shop Info
- **Tên**: TechZone - Đồ Công Nghệ Chính Hãng
- **Rating**: 4.9⭐
- **Followers**: 28,750
- **Vị trí**: TP. Hồ Chí Minh

### Orders (250 đơn hàng)
- **Timeline**: 1/1/2025 - 31/10/2025 (10 tháng)
- **Status Distribution**:
  - ✅ COMPLETED: 85% (~213 đơn)
  - 🚚 SHIPPED: 8%
  - 📦 READY_TO_SHIP: 4%
  - 💳 UNPAID: 2%
  - ❌ CANCELLED: 1%
- **Tổng doanh thu**: ~3-5 tỷ VND

### Products (55 sản phẩm)

**10 Categories:**
1. 📱 **Điện Thoại** (8 sp): iPhone 15 Pro Max, Galaxy S24 Ultra, Xiaomi 14...
2. 💻 **Laptop** (8 sp): MacBook Air M3, Dell XPS 13, Asus ROG...
3. 🎧 **Tai Nghe** (6 sp): AirPods Pro 2, Sony WH-1000XM5, Bose...
4. 📱 **Phụ Kiện ĐT** (7 sp): Ốp lưng, Sạc nhanh, Pin dự phòng...
5. 💻 **Phụ Kiện Laptop** (6 sp): Chuột Logitech, Bàn phím cơ...
6. 🌐 **Thiết Bị Mạng** (3 sp): Router Wifi 6, Mesh...
7. 📷 **Camera** (3 sp): GoPro Hero 12, DJI Osmo Action...
8. 🎮 **Gaming** (5 sp): PS5, Xbox Series X, Màn hình 165Hz...
9. ⌚ **Smart Devices** (4 sp): Apple Watch 9, Galaxy Watch 6...
10. 💾 **Lưu Trữ** (5 sp): SSD Samsung 980 Pro, USB Kingston...

**Price Range**: 180K - 43M VND  
**Sales Volume**: 30-700 sản phẩm/item  
**Stock**: 20-120 sản phẩm/item

---

## 🔌 API Endpoints

### Backend (http://localhost:5000)

#### Authentication
```
GET  /api/auth/shopee/init
     → Trả về mock OAuth URL

GET  /api/auth/shopee/callback?code=xxx&shop_id=xxx
     → Exchange code → access_token
```

#### Dashboard Data
```
GET  /api/dashboard/data
     Headers: { Authorization: Bearer <access_token> }
     Query: { shop_id: 123456789 }
     
Response:
{
  shop: { shop_name, rating_star, follower_count, ... },
  orders: [{ order_sn, order_status, total_amount, ... }],
  products: [{ item_name, price_info, sales, stock_info, ... }],
  performance: { conversion_rate, return_rate, ... },
  finance: { available_balance, total_income, ... }
}
```

---

## 🧪 Testing Flow

### 1. Kiểm tra Backend
```bash
cd backend
node server.js

# Expected output:
# 🚀 E-Metric Hub Backend Server Started
# 📍 Server running at: http://localhost:5000
# 🎭 Mode: MOCK (Development)
```

### 2. Kiểm tra Frontend
```bash
cd frontend
npm run dev

# Expected output:
# VITE v5.x.x ready in xxx ms
# ➜ Local: http://localhost:5173/
```

### 3. Test Login Flow
1. Mở `http://localhost:5173`
2. Click "Đăng nhập với Shopee"
3. Modal hiển thị → Click "Tiếp tục đăng nhập"
4. Tự động redirect → Mock OAuth page
5. Auto-callback → Processing screen (20% → 100%)
6. Redirect về Dashboard ✅

### 4. Test Dashboard
- ✅ Kiểm tra 4 KPI cards hiển thị số liệu
- ✅ Kiểm tra biểu đồ Doanh thu có 10 tháng data (T1 - T10)
- ✅ Kiểm tra Pie chart có 10 categories
- ✅ Tab "Sản phẩm" hiển thị bảng với 55 items
- ✅ Refresh trang (F5) → Không bị logout

### 5. Test Logout
1. Click nút "Đăng xuất"
2. Confirm dialog
3. Quay về login screen ✅

---

## 🐛 Troubleshooting

### ❌ Backend không start
```bash
# Check port 5000 có bị chiếm không
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID <PID> /F
```

### ❌ Frontend không kết nối Backend
- Kiểm tra `backend/.env` → `FRONTEND_URL=http://localhost:5173`
- Kiểm tra `frontend/src/services/api.js` → `baseURL: 'http://localhost:5000'`

### ❌ Đã đăng nhập nhưng bị logout
- Mở DevTools → Console → Kiểm tra logs `🔍 Checking authentication...`
- Check localStorage: `localStorage.getItem('shopee_tokens')`
- Nếu null → Backend chưa lưu token, check callback handler

### ❌ Dashboard không hiển thị data
- Mở DevTools → Network → Check request `/api/dashboard/data`
- Kiểm tra response có `orders: []` hoặc `products: []` không
- Nếu có → Check `backend/mockData/shopeeData.js` line 226: `length: 250`

---

## 📝 Notes

### Mock Mode
- Không cần Shopee Partner ID/Key thật
- Tất cả data được generate từ `backend/mockData/shopeeData.js`
- OAuth flow hoàn toàn giả lập

### Redux Toolkit
- State được persist trong localStorage
- Transform data trước khi lưu vào Redux
- Auto-retry khi token expired

### Production Mode
- Đổi `USE_MOCK_MODE=false` trong `.env`
- Cung cấp `SHOPEE_PARTNER_ID` và `SHOPEE_PARTNER_KEY` thật
- Implement real Shopee API integration

---

## 🤝 Contributing

Để contribute:
1. Fork repository
2. Tạo branch mới: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Tạo Pull Request

---

## 📄 License

MIT License - Free to use for personal/commercial projects

---

## 👨‍💻 Contact

Project Link: [https://github.com/yourusername/e-metric-hub](https://github.com/yourusername/e-metric-hub)

---

**Made with ❤️ by AI & Human**
