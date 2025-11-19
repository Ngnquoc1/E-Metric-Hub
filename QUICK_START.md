# Quick Start - Customer Analysis Feature

## 🚀 Khởi động hệ thống (3 bước)

### Bước 1: Start Python AI Service
Mở terminal mới và chạy:
```bash
cd ai_service
python api.py
```
Đợi thấy: `Model loaded successfully!` và `Uvicorn running on http://0.0.0.0:8001`

### Bước 2: Start Backend  
Mở terminal mới và chạy:
```bash
cd backend
node server.js
```
Đợi thấy: `Server running on port 5000`

### Bước 3: Start Frontend
Mở terminal mới và chạy:
```bash
cd frontend
npm run dev
```
Mở browser: `http://localhost:5173`

## 📊 Test tính năng

1. Click vào tab **"Phân tích khách hàng"** (icon chat bubbles)
2. Chọn sản phẩm từ dropdown (ví dụ: "iPhone 15 Pro Max 256GB")
3. Đợi ~5-10 giây để AI phân tích
4. Xem kết quả:
   - **Cột 1**: Biểu đồ tròn phân tích cảm xúc
   - **Cột 2**: Từ khóa nổi bật từ reviews
   - **Cột 3**: AI suggestions (vấn đề, điểm mạnh, tác động)

## ✅ Kiểm tra nhanh

**Python API đang chạy?**
```bash
curl http://localhost:8001/health
```
Kết quả: `{"status":"healthy","model_loaded":true,...}`

**Backend đang chạy?**
```bash
curl http://localhost:5000/api/customer-analysis/health
```
Kết quả: `{"status":"connected",...}`

## 🔧 Nếu có lỗi

**Lỗi "sentiment_analysis is null":**
- Check Python API có đang chạy không
- Check backend logs có lỗi timeout không

**Lỗi "Cannot connect":**
- Đảm bảo cả 3 services đều đang chạy
- Check ports 5000, 5173, 8001 không bị chiếm

**Loading mãi không xong:**
- Lần đầu load model mất ~10 giây
- Check browser console (F12) xem có lỗi API không
- Check backend logs xem có lỗi gọi Python API không

## 📦 Sample Products để test

- **1001**: iPhone 15 Pro Max 256GB (high-end, nhiều reviews tích cực)
- **1025**: Ốp lưng iPhone (budget, reviews hỗn hợp)
- **1009**: MacBook Air M3 (mid-range)
