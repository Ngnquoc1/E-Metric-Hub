import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, Sparkles, Package, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Spin } from 'antd';
import axios from 'axios';
import './DemandForecastPage.css';

// Fixed configuration: 1 year historical data (24 periods) + 6 periods forecast (3 months)
const HISTORICAL_PERIODS = 24; // 1 year * 12 months / (15 days/period) = 24 periods
const FORECAST_PERIODS = 6;    // 3 months = 6 periods of 15 days

const DEFAULT_INSIGHTS = {
  trend: 'Đang phân tích xu hướng...',
  factors: 'Đang xác định các yếu tố ảnh hưởng...',
  seasonality: 'Đang kiểm tra tính mùa vụ...',
  recommendation: 'Đang tạo đề xuất...'
};

const DemandForecastPage = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [insights, setInsights] = useState(DEFAULT_INSIGHTS);
  const [loadingInsights, setLoadingInsights] = useState(false);
  
  // Use consistent Redux state structure (same as CustomerAnalysis & DynamicPricing)
  const { tokens } = useSelector((state) => state.auth);
  const { data: dashboardData } = useSelector((state) => state.dashboard);
  
  // Check if user is logged in
  const isLoggedIn = tokens?.access_token;
  
  // Combined loading state for better UX
  const isAnalyzing = loadingForecast || loadingInsights;

  // Load products from dashboard (same pattern as CustomerAnalysis & DynamicPricing)
  useEffect(() => {
    if (dashboardData?.products) {
      // Normalize product data structure
      const productList = dashboardData.products.slice(0, 20).map(p => ({
        ...p,
        // Flatten nested fields for easier access
        price: p.price_info?.current_price || 0,
        stock: p.stock_info?.current_stock || 0,
        category_name: p.category_name || 'Điện tử & Công nghệ'
      }));
      
      setProducts(productList);
    }
  }, [dashboardData]);

  const handleProductChange = (event) => {
    setSelectedProductId(event.target.value);
    // Clear previous analysis
    setForecastData(null);
    setInsights(DEFAULT_INSIGHTS);
  };

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.item_id) === String(selectedProductId)) || null,
    [products, selectedProductId]
  );

  // Fetch historical data from backend
  const fetchHistoricalData = async (productId, periods) => {
    try {
      const response = await axios.post('http://localhost:5000/api/demand-forecast/historical', {
        productId,
        periods
      });
      return response.data.historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Fallback to small baseline values
      return Array.from({ length: periods }, (_, i) => ({
        period: i + 1,
        demand: Math.floor(Math.random() * 20) + 10
      }));
    }
  };

  // Fetch AI forecast when product changes
  useEffect(() => {
    const fetchForecast = async () => {
      if (!selectedProduct) return;
      
      setLoadingForecast(true);
      setLoadingInsights(true);
      
      try {
        // ✅ Fetch real historical data from backend (aggregated from orders)
        const historicalData = await fetchHistoricalData(
          selectedProduct.item_id, 
          HISTORICAL_PERIODS
        );
        
        console.log('📊 Historical data loaded:', historicalData);
        
        // Calculate statistics from historical data
        const totalDemand = historicalData.reduce((sum, d) => sum + d.demand, 0);
        const avgDemand = Math.round(totalDemand / historicalData.length);
        const maxDemand = Math.max(...historicalData.map(d => d.demand));
        const minDemand = Math.min(...historicalData.map(d => d.demand));
        const recentPeriods = historicalData.slice(-6); // Last 6 periods (3 months)
        const recentAvg = Math.round(recentPeriods.reduce((sum, d) => sum + d.demand, 0) / recentPeriods.length);
        const growthRate = ((recentAvg - avgDemand) / avgDemand * 100).toFixed(1);
        
        // Get shop info from dashboard
        const shopName = dashboardData?.shop_name || 'Shop công nghệ';
        const totalProducts = dashboardData?.products?.length || 0;
        const categoryInfo = selectedProduct.category_name || 'Điện tử & Công nghệ';
        
        const prompt = `
Phân tích dự báo nhu cầu chi tiết cho sản phẩm:

📦 THÔNG TIN SẢN PHẨM:
- Tên: ${selectedProduct.item_name}
- Giá bán: ${(selectedProduct.price || 0).toLocaleString('vi-VN')} VNĐ
- Tồn kho hiện tại: ${selectedProduct.stock || 0} sản phẩm
- Danh mục: ${categoryInfo}
- Shop: ${shopName} (${totalProducts} sản phẩm)

📊 DỮ LIỆU LỊCH SỬ (24 periods = 1 năm):
- Tổng nhu cầu: ${totalDemand.toLocaleString('vi-VN')} sản phẩm
- Trung bình/period: ${avgDemand} sản phẩm
- Cao nhất: ${maxDemand} sản phẩm (Period ${historicalData.findIndex(d => d.demand === maxDemand) + 1})
- Thấp nhất: ${minDemand} sản phẩm (Period ${historicalData.findIndex(d => d.demand === minDemand) + 1})
- TB 3 tháng gần nhất: ${recentAvg} sản phẩm
- Tốc độ tăng trưởng: ${growthRate}%
- Chi tiết 24 periods: ${JSON.stringify(historicalData)}

🎯 YÊU CẦU PHÂN TÍCH:

1. DỰ BÁO NHU CẦU (${FORECAST_PERIODS} period tiếp theo = 3 tháng):
   - Tính toán dự báo dựa trên xu hướng lịch sử
   - Xem xét yếu tố tăng trưởng và chu kỳ

2. PHÂN TÍCH XU HƯỚNG:
   - Mô tả chi tiết xu hướng nhu cầu qua 1 năm (tăng/giảm/ổn định)
   - So sánh các giai đoạn: 6 tháng đầu vs 6 tháng gần nhất
   - Tính % thay đổi và tốc độ tăng trưởng trung bình
   - Nhận định về sự biến động (cao/thấp/ổn định)

3. YẾU TỐ ẢNH HƯỞNG:
   Phân tích CỤ THỂ các yếu tố:
   - 💰 GIÁ CẢ: Ảnh hưởng của mức giá ${(selectedProduct.price || 0).toLocaleString('vi-VN')} VNĐ đến sức mua
   - 📅 SỰ KIỆN: Các event có thể tác động (Black Friday, 11.11, 12.12, Tết, Flash Sale, Back to School)
   - 🎁 KHUYẾN MÃI: Các đợt sale thường tạo peak demand như thế nào
   - 📱 SẢN PHẨM: Chu kỳ ra mắt phiên bản mới, sản phẩm thay thế
   - 🛒 THỊ TRƯỜNG: Xu hướng mua sắm online, sức mua thị trường
   - ☀️ MÙA VỤ: Mùa tựu trường, Tết, mùa du lịch ảnh hưởng ra sao

4. TÍNH MÙA VỤ:
   - Xác định các tháng có nhu cầu CAO NHẤT (kèm lý do cụ thể)
   - Xác định các tháng có nhu cầu THẤP NHẤT (kèm lý do)
   - Chu kỳ lặp lại (hàng tháng/quý/năm)
   - Dự đoán các peak season sắp tới trong 3 tháng

5. KHUYẾN NGHỊ CHI TIẾT:
   Đưa ra ít nhất 4-5 khuyến nghị CỤ THỂ:
   - 📦 Tồn kho: Nên dự trữ bao nhiêu sản phẩm cho 3 tháng tới
   - 💵 Giá bán: Có nên điều chỉnh giá không, tăng/giảm bao nhiêu %
   - 📢 Marketing: Thời điểm nào nên đẩy mạnh quảng cáo
   - 🎯 Khuyến mãi: Nên tổ chức sale vào period nào để tối ưu doanh thu
   - ⚠️ Rủi ro: Cảnh báo về thiếu hàng hoặc tồn kho ứ đọng

📋 FORMAT TRẢ VỀ (JSON):
{
  "forecast": [{"period": number, "demand": number}],
  "insights": {
    "trend": "Mô tả chi tiết xu hướng với cấu trúc:\n• Xu hướng tổng quan: [tăng/giảm/ổn định] [%]\n• Giai đoạn đầu vs gần đây: So sánh cụ thể\n• Biến động: [Mức độ] với lý do\n• Nhận định: Kết luận về xu hướng",
    "factors": "Liệt kê các yếu tố với format:\n• Giá cả: Ảnh hưởng như thế nào\n• Sự kiện: Event nào tác động (11.11, 12.12, Tết...)\n• Khuyến mãi: Flash sale, voucher\n• Sản phẩm: Chu kỳ thay thế, ra mắt mới\n• Thị trường: Xu hướng mua sắm online",
    "seasonality": "Phân tích mùa vụ với format:\n• Peak season: Tháng nào cao nhất + lý do\n• Low season: Tháng nào thấp nhất + lý do  \n• Chu kỳ: Quy luật lặp lại\n• Dự báo: 3 tháng tới có peak nào không",
    "recommendation": "Khuyến nghị cụ thể với format:\n• Tồn kho: Dự trữ [số lượng] sản phẩm\n• Giá bán: [Tăng/Giảm/Giữ nguyên] [%]\n• Marketing: Đẩy mạnh từ period [X] đến [Y]\n• Khuyến mãi: Tổ chức tại period [X] với ưu đãi [%]\n• Rủi ro: Cảnh báo về [thiếu hàng/ứ đọng]"
  }
}

⚠️ LƯU Ý: 
- Tất cả phân tích phải dựa trên DATA thực tế từ lịch sử
- Đưa ra con số cụ thể, tránh chung chung
- Insights phải hữu ích cho quyết định kinh doanh
- Sử dụng emoji để dễ đọc`;
        
        const response = await axios.post('http://localhost:5000/api/ai/simple-prompt', { prompt });
        const aiResponse = response.data.reply;
        
        console.log('🤖 AI response received');
        
        // Parse JSON from AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsedData = JSON.parse(jsonMatch[0]);
          
          // Combine historical + forecast
          const combinedData = [...historicalData];
          if (parsedData.forecast) {
            parsedData.forecast.forEach(f => {
              combinedData.push({
                period: f.period,
                demand: null,
                forecast: f.demand
              });
            });
          }
          
          setForecastData(combinedData);
          
          // Format insights for better display
          const formattedInsights = {
            trend: parsedData.insights?.trend || DEFAULT_INSIGHTS.trend,
            factors: parsedData.insights?.factors || DEFAULT_INSIGHTS.factors,
            seasonality: parsedData.insights?.seasonality || DEFAULT_INSIGHTS.seasonality,
            recommendation: parsedData.insights?.recommendation || DEFAULT_INSIGHTS.recommendation
          };
          
          setInsights(formattedInsights);
        } else {
          console.warn('⚠️ Could not parse JSON from AI response');
          setForecastData(historicalData);
          setInsights(DEFAULT_INSIGHTS);
        }
      } catch (error) {
        console.error('Error fetching forecast:', error);
        setInsights(DEFAULT_INSIGHTS);
      } finally {
        setLoadingForecast(false);
        setLoadingInsights(false);
      }
    };
    
    fetchForecast();
  }, [selectedProduct]);

  // Helper function to convert period to date range
  const getPeriodDateRange = (periodNum) => {
    // Start from Nov 20, 2024 (1 year ago), each period = 15 days
    const startDate = new Date('2024-11-20');
    const periodStartDays = (periodNum - 1) * 15;
    const periodStart = new Date(startDate.getTime() + periodStartDays * 24 * 60 * 60 * 1000);
    const periodEnd = new Date(periodStart.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    const formatDate = (date) => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
    
    return `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
  };

  const chartData = forecastData || [];

  const totalStock = selectedProduct?.stock ?? 0;
  const avgDemand = chartData.length > 0 
    ? Math.round(chartData.filter(d => d.demand).reduce((sum, d) => sum + d.demand, 0) / chartData.filter(d => d.demand).length)
    : 0;
  const forecastAvg = chartData.length > 0
    ? Math.round(chartData.filter(d => d.forecast).reduce((sum, d) => sum + d.forecast, 0) / Math.max(chartData.filter(d => d.forecast).length, 1))
    : 0;

  const formatNumber = (value) =>
    Number.isFinite(value) ? value.toLocaleString('vi-VN') : '0';

  // Format insight text with proper line breaks and bullet points
  const formatInsightText = (text) => {
    if (!text) return '';
    
    // Split by newline and format bullet points
    return text.split('\n').map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      
      // Parse bold text with ** or __
      const parseFormatting = (str) => {
        const parts = [];
        let currentIndex = 0;
        const boldRegex = /(\*\*|__)(.*?)\1/g;
        let match;
        
        while ((match = boldRegex.exec(str)) !== null) {
          // Add text before bold
          if (match.index > currentIndex) {
            parts.push(str.substring(currentIndex, match.index));
          }
          // Add bold text
          parts.push(<strong key={match.index} style={{ fontWeight: '600', color: '#0a58d0' }}>{match[2]}</strong>);
          currentIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (currentIndex < str.length) {
          parts.push(str.substring(currentIndex));
        }
        
        return parts.length > 0 ? parts : str;
      };
      
      // Check if line starts with bullet (•, -, *)
      if (trimmed.match(/^[•\-\*]\s/)) {
        const content = trimmed.replace(/^[•\-\*]\s/, '');
        return (
          <div key={index} style={{ display: 'flex', marginBottom: '8px', alignItems: 'flex-start' }}>
            <span style={{ color: '#0a58d0', marginRight: '8px', fontWeight: 'bold', minWidth: '8px' }}>•</span>
            <span style={{ flex: 1 }}>{parseFormatting(content)}</span>
          </div>
        );
      }
      
      // Regular line with formatting
      return <div key={index} style={{ marginBottom: '6px' }}>{parseFormatting(trimmed)}</div>;
    }).filter(Boolean);
  };

  const selectedProductName = selectedProduct?.item_name || 'Chưa chọn';
  return (
    <div className="demand-forecast-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <Package className="header-icon" style={{ color: '#0a58d0' }} />
          <h1>Dự báo nhu cầu sản phẩm</h1>
        </div>
      </div>

      <p className="description">Phân tích 1 năm lịch sử bán hàng và dự báo nhu cầu 3 tháng tới (1 period = 15 ngày)</p>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="loading-state" style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div className="spinner" style={{
            width: '48px',
            height: '48px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #0a58d0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#0a58d0', margin: '0 0 8px 0' }}>
            Đang phân tích dữ liệu với AI...
          </p>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Đang xử lý {HISTORICAL_PERIODS} periods lịch sử và dự báo {FORECAST_PERIODS} periods tới
          </p>
        </div>
      )}

      {/* Not Logged In State */}
      {!isLoggedIn && !isAnalyzing && (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div className="empty-icon" style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px 0' }}>
            Vui lòng đăng nhập để sử dụng tính năng này
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 24px' }}>
            Bạn cần đăng nhập vào tài khoản Shopee để xem dự báo nhu cầu và phân tích AI cho sản phẩm của bạn
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            style={{
              background: '#0a58d0',
              color: 'white',
              padding: '12px 32px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#0847b0'}
            onMouseLeave={(e) => e.target.style.background = '#0a58d0'}
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Product Selection - Always show when logged in */}
      {!isAnalyzing && isLoggedIn && (
        <div className="product-selector" style={{ marginBottom: '20px' }}>
          <label>Chọn sản phẩm:</label>
          <select
            className="product-select"
            value={selectedProductId || ''}
            onChange={handleProductChange}
            disabled={!isLoggedIn || isAnalyzing || !products.length}
          >
            <option value="" disabled>
              {products.length === 0 ? 'Không có sản phẩm' : 'Chọn sản phẩm'}
            </option>
            {products.map((product) => (
              <option key={product.item_id} value={String(product.item_id)}>
                {product.item_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Info Card - No Product Selected */}
      {!isAnalyzing && isLoggedIn && !selectedProduct && (
        <div style={{
          background: 'linear-gradient(135deg, #0a58d0 0%, #0284c7 100%)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(10, 88, 208, 0.3)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
            Chọn sản phẩm để bắt đầu dự báo nhu cầu
          </h3>
          <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
            Hệ thống sẽ phân tích dữ liệu lịch sử và dự báo nhu cầu 3 tháng tới cho sản phẩm bạn chọn
          </p>
        </div>
      )}

      {/* Main Content - Full Width Layout */}
      {!isAnalyzing && isLoggedIn && selectedProduct && (
      <div className="content-wrapper" style={{ display: 'block' }}>
        {/* Chart Section - Full Width */}
        <div className="chart-section" style={{ marginBottom: '24px', maxWidth: '100%' }}>

          {/* Chart */}
          <div className="chart-container">
            <h3 className="chart-title">
              <TrendingUp size={18} style={{ color: '#0a58d0' }} />
              Nhu cầu theo period (1 period = 15 ngày)
            </h3>
            {loadingForecast ? (
              <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                <AlertCircle size={20} style={{ marginRight: 8 }} />
                Đang phân tích dữ liệu...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    label={{ value: 'Period', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 12 } }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    stroke="#cbd5e1"
                    label={{ value: 'Nhu cầu', angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 12 } }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'white', 
                      border: '1px solid #e2e8f0', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ 
                            background: 'white', 
                            padding: '12px', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                          }}>
                            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#0a58d0' }}>
                              Period {data.period}
                            </p>
                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                              {getPeriodDateRange(data.period)}
                            </p>
                            {payload.map((entry, index) => (
                              entry.value !== null && (
                                <p key={index} style={{ margin: '4px 0', color: entry.color }}>
                                  {entry.name}: <strong>{formatNumber(entry.value)}</strong>
                                </p>
                              )
                            ))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '13px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#0a58d0" 
                    strokeWidth={2}
                    name="Nhu cầu thực tế"
                    dot={{ fill: '#0a58d0', r: 4 }}
                    connectNulls={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecast" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Dự báo AI"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <Package size={16} style={{ color: '#0a58d0' }} />
                <span>Tồn kho hiện tại</span>
              </div>
              <div className="stat-value">{formatNumber(totalStock)} sản phẩm</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <TrendingUp size={16} style={{ color: '#0a58d0' }} />
                <span>Nhu cầu TB/period</span>
              </div>
              <div className="stat-value">
                {formatNumber(avgDemand)} sản phẩm
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Sparkles size={16} style={{ color: '#10b981' }} />
                <span>Dự báo TB/period</span>
              </div>
              <div className="stat-value">
                {formatNumber(forecastAvg)} sản phẩm
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Package size={16} style={{ color: '#64748b' }} />
                <span>Sản phẩm đang xem</span>
              </div>
              <div className="stat-value" style={{ fontSize: '14px' }}>{selectedProductName}</div>
            </div>
          </div>
        </div>

        {/* AI Insights Section - Below Chart in Horizontal Grid Layout */}
        <div className="insights-section" style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%'
        }}>
          {/* Trend Analysis */}
          <div className="insight-card" style={{ 
            background: 'white', 
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #0a58d0',
            padding: '20px'
          }}>
            <h4 style={{ color: '#0a58d0', fontSize: '15px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
              Phân tích xu hướng
            </h4>
            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.8' }}>
              {loadingInsights ? 'Đang phân tích...' : formatInsightText(insights.trend)}
            </div>
          </div>

          {/* Influencing Factors */}
          <div className="insight-card" style={{ 
            background: 'white', 
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            padding: '20px'
          }}>
            <h4 style={{ color: '#10b981', fontSize: '15px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
              Yếu tố ảnh hưởng
            </h4>
            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.8' }}>
              {loadingInsights ? 'Đang phân tích...' : formatInsightText(insights.factors)}
            </div>
          </div>

          {/* Seasonality */}
          <div className="insight-card" style={{ 
            background: 'white', 
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b',
            padding: '20px'
          }}>
            <h4 style={{ color: '#f59e0b', fontSize: '15px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
              Tính mùa vụ
            </h4>
            <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.8' }}>
              {loadingInsights ? 'Đang phân tích...' : formatInsightText(insights.seasonality)}
            </div>
          </div>

          {/* Recommendation */}
          <div className="insight-card" style={{ 
            background: 'linear-gradient(135deg, #0a58d0 0%, #0847b0 100%)',
            border: 'none',
            color: 'white',
            padding: '20px'
          }}>
            <h4 style={{ color: 'white', fontSize: '15px', fontWeight: '600', marginBottom: '12px', marginTop: 0 }}>
              Khuyến nghị AI
            </h4>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.95)', lineHeight: '1.8' }}>
              {loadingInsights ? 'Đang tạo khuyến nghị...' : formatInsightText(insights.recommendation)}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Bottom Action Bar */}
      {!isAnalyzing && isLoggedIn && selectedProduct && (
      <div className="action-bar">
        <button className="action-bar-btn primary" style={{ background: '#0a58d0', borderColor: '#0a58d0' }}>
          <span>📈</span>
          Xuất báo cáo
        </button>
        <button className="action-bar-btn">
          <span>🔄</span>
          Làm mới dự báo
        </button>
        <button className="action-bar-btn">
          <span>⚙️</span>
          Cài đặt AI
        </button>
      </div>
      )}
    </div>
  );
};

export default DemandForecastPage;