# 🪟 Windows Quick Start Guide

## ⚡ Cách Nhanh Nhất (Recommended)

### Từ Git Bash:
```bash
cd /c/STUDY/AISC/ai_service
C:/Python313/python.exe api.py &

cd /c/STUDY/AISC/backend
npm run dev &

cd /c/STUDY/AISC/frontend
npm run dev &
```

### Từ Command Prompt (CMD):
```cmd
REM Terminal 1 - Python API
cd C:\STUDY\AISC\ai_service
python api.py

REM Terminal 2 - Backend (New CMD window)
cd C:\STUDY\AISC\backend
npm run dev

REM Terminal 3 - Frontend (New CMD window)
cd C:\STUDY\AISC\frontend
npm run dev
```

## 📦 Setup Lần Đầu

### 1. Cài Python Packages
```bash
# Từ Git Bash
cd /c/STUDY/AISC/ai_service
python -m pip install fastapi uvicorn torch transformers pydantic numpy safetensors python-multipart
```

### 2. Cài Node Packages (nếu chưa có)
```bash
# Backend
cd /c/STUDY/AISC/backend
npm install

# Frontend  
cd /c/STUDY/AISC/frontend
npm install
```

## 🎯 Truy Cập Ứng Dụng

| Service | URL |
|---------|-----|
| **Customer Analysis** | http://localhost:5173/customer-analysis |
| Frontend | http://localhost:5173 (hoặc 5174) |
| Backend | http://localhost:5000 |
| Python API | http://localhost:8001 |

## ✅ Kiểm Tra Services

```bash
# Check Python API
curl http://localhost:8001/health

# Check Backend
curl http://localhost:5000

# Check Frontend
# Mở browser: http://localhost:5173
```

## 🛑 Dừng Services

### Từ Git Bash:
```bash
# Kill tất cả Python processes
taskkill //F //IM python.exe

# Kill tất cả Node processes  
taskkill //F //IM node.exe
```

### Từ CMD:
```cmd
taskkill /F /IM python.exe
taskkill /F /IM node.exe
```

### Hoặc Ctrl+C trong mỗi terminal

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Kill process trên port cụ thể
# Port 8001 (Python API)
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F

# Port 5000 (Backend)
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Python API không start
```bash
# Check Python version (cần >= 3.9)
python --version

# Cài lại packages
pip install --upgrade fastapi uvicorn torch transformers
```

### Model không tìm thấy
```
Đảm bảo file model tồn tại tại:
C:\STUDY\AISC\archive\absa_phobert_model\pytorch_model.bin
```

### Backend không kết nối Python API
```
Kiểm tra file: backend\.env
Phải có: PYTHON_API_URL=http://localhost:8001
```

## 📝 Environment Variables

### Backend (.env)
```env
PYTHON_API_URL=http://localhost:8001
USE_MOCK_MODE=true
PORT=5000
```

## 💡 Tips

1. **Dùng Python toàn cục** (không cần venv cho quick start)
2. **Mở 3 terminals** riêng biệt cho mỗi service
3. **Frontend có thể chạy trên port 5174** nếu 5173 bị chiếm
4. **Đợi Python API load model** (~30-60 giây lần đầu)
5. **Check logs** trong Git Bash dễ hơn CMD

## 🚀 Demo Workflow

1. Start 3 services (Python API → Backend → Frontend)
2. Mở http://localhost:5173
3. Login (mock mode, any credentials)
4. Go to Dashboard → Click "Làm mới dữ liệu"
5. Navigate to "Phân tích khách hàng" 
6. Chọn sản phẩm từ dropdown
7. Xem analysis results! ✨

## 📚 Full Documentation

- [Complete Setup Guide](CUSTOMER_ANALYSIS_SETUP.md)
- [Quick Reference](QUICK_REFERENCE.md)
- [Implementation Summary](IMPLEMENTATION_SUMMARY.md)

---

**Ready to go!** 🎉 Tất cả services đã running trên máy của bạn!
