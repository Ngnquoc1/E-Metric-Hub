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
git clone https://github.com/Ngnquoc1/E-Metric-Hub.git
cd E-Metric-Hub
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

#### AI Service (PhoBERT ABSA Model)
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3️⃣ Cấu hình Environment Variables

#### Backend (.env)
Tạo file `backend/.env`:

```env
PORT=5000
NODE_ENV=development
USE_MOCK_MODE=true
FRONTEND_URL=http://localhost:5173
PYTHON_API_URL=http://localhost:8001

# Shopee API (Không cần thiết trong Mock Mode)
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_PARTNER_KEY=your_partner_key
SHOPEE_REDIRECT_URL=http://localhost:5173/auth/shopee/callback
```

#### AI Service (.env)
Tạo file `ai_service/.env`:

```env
API_HOST=0.0.0.0
API_PORT=8001
USE_CUDA=false
```

### 4️⃣ Chuẩn bị Model (QUAN TRỌNG)

⚠️ **File model không có trong repository do kích thước lớn (515MB)**

**Cách 1: Sử dụng model đã train sẵn**
- Liên hệ để nhận file `model.safetensors`
- Copy vào: `ai_service/absa_phobert_model/model.safetensors`

**Cách 2: Tự train model**
- Sử dụng notebook: `archive/absa_phobert_1.ipynb`
- Training data: `archive/train_data.csv`, `archive/val_data.csv`, `archive/test_data.csv`

### 5️⃣ Chạy ứng dụng

#### Terminal 1 - AI Service (PhoBERT API)
```bash
cd ai_service
source venv/bin/activate  # Windows: venv\Scripts\activate
python api.py
```
✅ AI Service chạy tại: `http://localhost:8001`

#### Terminal 2 - Backend (Express API)
```bash
cd backend
node server.js
```
✅ Backend chạy tại: `http://localhost:5000`

#### Terminal 3 - Frontend (React App)
```bash
cd frontend
npm run dev
```
✅ Frontend chạy tại: `http://localhost:5173`

### 6️⃣ Mở trình duyệt

Truy cập: **http://localhost:5173**

---

## 🔍 Kiểm tra các service

```bash
# Check AI Service
curl http://localhost:8001/health

# Check Backend
curl http://localhost:5000/api/health

# Check Frontend
# Mở http://localhost:5173 trên trình duyệt
```

---

## 📁 Cấu trúc thư mục

```
E-Metric-Hub/
├── ai_service/                    # Python AI Service
│   ├── api.py                    # FastAPI server
│   ├── config.py                 # Configuration
│   ├── model_class.py            # PhoBERT model class
│   ├── requirements.txt          # Python dependencies
│   ├── absa_phobert_model/       # Trained model (NOT in git)
│   │   ├── config.json
│   │   ├── model.safetensors    # 515MB - Không push lên git
│   │   ├── tokenizer_config.json
│   │   └── vocab.txt
│   └── venv/                     # Python virtual environment
│
├── backend/
│   ├── server.js                 # Entry point
│   ├── routes/
│   │   ├── auth.js              # OAuth routes
│   │   ├── shopee.js            # Shopee API routes
│   │   └── customerAnalysis.js  # Customer analysis routes
│   ├── services/
│   │   ├── mockShopeeAPI.js     # Mock Shopee API
│   │   └── mockShopeeAuth.js    # Mock OAuth
│   └── mockData/
│       └── shopeeData.js        # Mock data (250 orders, 55 products)
│
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── DashboardPage.jsx           # Dashboard chính
│   │   │   ├── CustomerAnalysisPage_new.jsx # Phân tích reviews
│   │   │   ├── AIAssistantPage.jsx         # AI Assistant
│   │   │   ├── LandingPage.jsx             # Trang chủ
│   │   │   ├── ShopeeLogin.jsx             # Login component
│   │   │   └── ShopeeCallback.jsx          # OAuth callback
│   │   ├── store/
│   │   │   ├── index.js                    # Redux store
│   │   │   └── slices/
│   │   │       ├── authSlice.js            # Auth state
│   │   │       ├── dashboardSlice.js       # Dashboard data
│   │   │       └── customerAnalysisSlice.js # Analysis data
│   │   ├── services/
│   │   │   └── api.js                      # API client
│   │   └── App.jsx
│   └── package.json
│
├── archive/                       # Training data & notebooks (Optional)
│   ├── absa_phobert_1.ipynb      # Model training notebook
│   ├── train_data.csv            # Training dataset
│   ├── val_data.csv              # Validation dataset
│   └── test_data.csv             # Test dataset
│
├── .gitignore                     # Git ignore (bao gồm *.safetensors)
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

### 2. Phân tích Reviews khách hàng (AI-Powered)

#### Tính năng chính:
- 🤖 **ABSA PhoBERT Model**: Phân tích sentiment theo 8 aspects
  - Giá cả (Price)
  - Vận chuyển (Shipping)
  - Ngoại quan (Outlook)
  - Chất lượng (Quality)
  - Kích thước (Size)
  - Dịch vụ shop (Shop_Service)
  - Tổng quan (General)
  - Khác (Others)

#### Giao diện phân tích:
- 📊 **Sentiment Summary**: Positive/Neutral/Negative distribution
- 📈 **Aspect Breakdown**: Chi tiết sentiment cho từng aspect
- 🔑 **Keywords Analysis**: Top keywords từ reviews
- 💡 **AI Suggestions**: Gợi ý cải thiện dựa trên phân tích

#### Công nghệ:
- **Model**: PhoBERT-base fine-tuned for Vietnamese ABSA
- **Backend**: FastAPI (Python 3.8+)
- **Inference**: Real-time sentiment prediction
- **Data**: 154 mock reviews per product

### 3. Đăng nhập Mock OAuth

- 🔐 **OAuth 2.0 Flow** (giả lập)
- ⚡ Auto-redirect & token exchange
- 💾 LocalStorage persistence
- 🔄 Auto-refresh on page reload

### 4. State Management (Redux Toolkit)

- **authSlice**: Quản lý authentication state
- **dashboardSlice**: Transform & cache dashboard data
- **customerAnalysisSlice**: Quản lý reviews & sentiment analysis
- **Async thunks**: 
  - `checkAuth()` - Verify localStorage tokens
  - `exchangeShopeeToken()` - OAuth callback
  - `loadDashboardData()` - Fetch dashboard data
  - `fetchProductReviews()` - Get product reviews
  - `fetchProductInsights()` - Get AI sentiment analysis

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

#### Customer Analysis
```
GET  /api/customer-analysis/product/:productId/reviews
     Query: { access_token, shop_id }
     → Lấy danh sách reviews của sản phẩm

GET  /api/customer-analysis/product/:productId/insights
     Query: { access_token, shop_id }
     → Phân tích sentiment với AI (gọi Python API)
     
Response:
{
  product: { item_id, item_name, ... },
  total_reviews: 154,
  analyzed_reviews: 50,
  sentiment_summary: {
    positive: 324,
    neutral: 17,
    negative: 59
  },
  aspect_breakdown: {
    Price: { positive: 35, neutral: 8, negative: 7 },
    Shipping: { positive: 30, neutral: 5, negative: 15 },
    Quality: { positive: 40, neutral: 2, negative: 8 },
    ...
  },
  keywords: { "hàng": 15, "shop": 14, "giao": 13, ... },
  recommendations: {
    issues: [...],
    strengths: [...],
    summary: "..."
  }
}
```

### AI Service (http://localhost:8001)

#### Health Check
```
GET  /health
     
Response:
{
  status: "healthy",
  model_loaded: true,
  tokenizer_loaded: true,
  device: "cpu"
}
```

#### Sentiment Prediction
```
POST /predict
Content-Type: application/json

Body:
{
  reviews: ["Review text 1", "Review text 2", ...],
  product_id: "1001",
  include_statistics: true
}

Response:
{
  predictions: [
    {
      review_text: "Sản phẩm rất tốt, giao hàng nhanh",
      aspects: [
        {
          aspect: "Quality",
          aspect_display: "Chất lượng",
          sentiment: -1,  // -1: positive, 0: neutral, 1: negative
          sentiment_label: "positive",
          confidence: 0.9234
        },
        ...
      ],
      overall_sentiment: "positive"
    },
    ...
  ],
  statistics: {
    total_reviews: 50,
    sentiment_distribution: { positive: 324, neutral: 17, negative: 59 },
    aspect_statistics: { ... },
    keywords: { ... }
  }
}
```

---
## 📝 Notes

### Mock Mode
- Không cần Shopee Partner ID/Key thật
- Tất cả data được generate từ `backend/mockData/shopeeData.js`
- OAuth flow hoàn toàn giả lập
- 154 mock reviews mỗi sản phẩm với sentiment đa dạng

### Redux Toolkit
- State được persist trong localStorage
- Transform data trước khi lưu vào Redux
- Auto-retry khi token expired

### AI Model
- **PhoBERT-base** fine-tuned cho Vietnamese ABSA
- Model size: **515 MB** (không push lên git)
- Inference time: ~2-3s cho 50 reviews
- Hỗ trợ CPU và GPU (CUDA)

### Production Mode
- Đổi `USE_MOCK_MODE=false` trong `backend/.env`
- Cung cấp `SHOPEE_PARTNER_ID` và `SHOPEE_PARTNER_KEY` thật
- Implement real Shopee API integration
- Deploy AI service với GPU để tăng tốc độ

### Large Files (.gitignore)
```
*.safetensors          # Model weights (515MB)
archive/               # Training data & notebooks
ai_service/venv/       # Python virtual environment
```

---

## ⚠️ Troubleshooting

### Lỗi: "Model not found"
```bash
# Kiểm tra file model có tồn tại
ls -lh ai_service/absa_phobert_model/model.safetensors

# Nếu không có, yêu cầu file model hoặc tự train
```

### Lỗi: "Connection refused localhost:8001"
```bash
# Kiểm tra AI service có chạy không
curl http://localhost:8001/health

# Restart AI service
cd ai_service
python api.py
```

### Lỗi: "Module not found"
```bash
# Cài đặt lại dependencies
cd ai_service
pip install -r requirements.txt

cd backend
npm install

cd frontend
npm install
```

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

Project Link: [https://github.com/Ngnquoc1/E-Metric-Hub.git](https://github.com/Ngnquoc1/E-Metric-Hub.git)
Gmail: [nhuquoc1104@gmail.com](nhuquoc1104@gmail.com)

---

**Made with ❤️ by ICS**
