import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { DollarSign, TrendingUp, TrendingDown, Lightbulb, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Spin, message } from 'antd';
import './DynamicPricingPage.css';

const DynamicPricingPage = () => {
    // Redux: Load raw products from dashboard (same as CustomerAnalysisPage)
    const { data: dashboardData } = useSelector((state) => state.dashboard);
    const { tokens } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [timeRange, setTimeRange] = useState('7ngày');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState(null);

    // Load products from dashboard (raw products like CustomerAnalysisPage)
    useEffect(() => {
        if (dashboardData?.products) {
            // Use raw products from API, map to needed format
            const mappedProducts = dashboardData.products.map(p => ({
                key: p.item_id,
                item_id: p.item_id,
                name: p.item_name,
                price: p.price_info?.current_price || 0,
                sales: p.sales || 0,
                stock: p.stock_info?.current_stock || 0,
                category: p.category_name || 'Khác'
            }));
            setProducts(mappedProducts.slice(0, 20)); // Limit to 20 like CustomerAnalysis
        }
    }, [dashboardData]);

    // Analyze when product changes (NOT on initial load)
    useEffect(() => {
        if (selectedProduct) {
            analyzePricing();
        }
    }, [selectedProduct?.item_id]);

    const analyzePricing = async () => {
        if (!selectedProduct) {
            message.warning('Vui lòng chọn sản phẩm');
            return;
        }

        setIsAnalyzing(true);
        try {
            const currentPrice = selectedProduct.price;
            
            // ✅ FAKE COMPETITOR PRICES - Realistic based on product characteristics
            const competitorPrices = generateRealisticCompetitorPrices(selectedProduct);
            
            console.log('📊 Analyzing pricing for:', selectedProduct.name);
            console.log('💰 Competitor prices:', competitorPrices);

            // Call backend Gemini API
            const analysisResponse = await axios.post('/api/dynamic-pricing/analyze', {
                productName: selectedProduct.name,
                currentPrice: currentPrice,
                category: selectedProduct.category,
                sales: selectedProduct.sales,
                stock: selectedProduct.stock,
                competitorPrices: competitorPrices,
                timeRange: timeRange
            });

            console.log('✅ Analysis complete:', analysisResponse.data);
            
            // ✅ Generate realistic competition distribution
            const competitionData = generateCompetitionDistribution(competitorPrices);

            setAiAnalysis({
                ...analysisResponse.data.analysis,
                competitionData: competitionData
            });

        } catch (error) {
            console.error('❌ Error analyzing pricing:', error);
            message.error('Không thể phân tích giá: ' + error.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    // ✅ Generate realistic competitor prices based on product characteristics
    const generateRealisticCompetitorPrices = (product) => {
        const basePrice = product.price;
        const category = product.category;
        const sales = product.sales || 0;
        
        // Price variation based on category competition level
        const categoryCompetition = {
            'Điện Thoại & Smartphone': { variance: 0.08, avgDiscount: 0.03 },
            'Laptop & Máy Tính Bảng': { variance: 0.10, avgDiscount: 0.05 },
            'Tai Nghe & Audio': { variance: 0.15, avgDiscount: 0.08 },
            'Phụ Kiện Điện Thoại': { variance: 0.20, avgDiscount: 0.12 },
            'Phụ Kiện Laptop': { variance: 0.18, avgDiscount: 0.10 },
            'Thiết Bị Mạng': { variance: 0.12, avgDiscount: 0.07 },
            'Camera & Thiết Bị Quay': { variance: 0.10, avgDiscount: 0.06 },
            'Gaming Gear': { variance: 0.15, avgDiscount: 0.08 },
            'Thiết Bị Thông Minh': { variance: 0.12, avgDiscount: 0.05 },
            'Lưu Trữ & USB': { variance: 0.25, avgDiscount: 0.15 },
            'default': { variance: 0.15, avgDiscount: 0.08 }
        };
        
        const competition = categoryCompetition[category] || categoryCompetition['default'];
        
        // High sales = more competitive pricing (lower average)
        const salesFactor = Math.min(sales / 200, 1); // Normalize 0-1
        const competitivePressure = 0.02 * salesFactor; // Up to 2% extra discount for high-sales items
        
        const avgDiscount = competition.avgDiscount + competitivePressure;
        const variance = competition.variance;
        
        // Market average: slightly lower than current price (competitive market)
        const marketAverage = Math.round(basePrice * (1 - avgDiscount));
        
        // Min/Max based on variance
        const minPrice = Math.round(marketAverage * (1 - variance));
        const maxPrice = Math.round(marketAverage * (1 + variance));
        
        return {
            average: marketAverage,
            min: minPrice,
            max: maxPrice,
            competitorCount: Math.floor(15 + Math.random() * 25), // 15-40 competitors
            priceRange: maxPrice - minPrice
        };
    };

    // ✅ Generate realistic competition distribution (bell curve around average)
    const generateCompetitionDistribution = (competitorPrices) => {
        const { min, max, average } = competitorPrices;
        const priceRange = max - min;
        const bucketSize = priceRange / 7;
        
        const distribution = [];
        const totalCompetitors = competitorPrices.competitorCount || 30;
        
        for (let i = 0; i < 7; i++) {
            const rangeStart = min + (bucketSize * i);
            const rangeEnd = rangeStart + bucketSize;
            const rangeMid = (rangeStart + rangeEnd) / 2;
            
            // Bell curve: more competitors near average price
            const distance = Math.abs(rangeMid - average);
            const maxDistance = priceRange / 2;
            const normalizedDistance = distance / maxDistance;
            
            // Gaussian distribution
            const count = Math.round(
                totalCompetitors * Math.exp(-3 * normalizedDistance * normalizedDistance)
            );
            
            distribution.push({
                range: `${(rangeStart / 1000000).toFixed(1)}M-${(rangeEnd / 1000000).toFixed(1)}M`,
                value: Math.max(count, 2), // At least 2 competitors per bucket
                rangeStart,
                rangeEnd
            });
        }
        
        return distribution;
    };

    // Use AI analysis data or fallback to mock data
    const competitionData = aiAnalysis?.competitionData || [
      { range: '10.5k-11k', value: 15 },
      { range: '11k-11.5k', value: 28 },
      { range: '11.5k-12k', value: 45 },
      { range: '12k-12.5k', value: 68 },
      { range: '12.5k-13k', value: 92 },
      { range: '13k-13.5k', value: 106 },
      { range: '13.5k-14k', value: 85 },
    ];

    // Price positioning data for visual comparison
    const pricePositionData = [
        { label: 'Giá thấp nhất', value: aiAnalysis?.priceComparison?.marketAverage ? aiAnalysis.priceComparison.marketAverage * 0.85 : selectedProduct?.price * 0.85 || 0, color: '#4caf50' },
        { label: 'Giá TB thị trường', value: aiAnalysis?.priceComparison?.marketAverage || selectedProduct?.price * 0.98 || 0, color: '#ff9800' },
        { label: 'Giá của bạn', value: aiAnalysis?.priceComparison?.currentPrice || selectedProduct?.price || 0, color: '#2196f3' },
        { label: 'Giá cao nhất', value: aiAnalysis?.priceComparison?.marketAverage ? aiAnalysis.priceComparison.marketAverage * 1.15 : selectedProduct?.price * 1.15 || 0, color: '#f44336' }
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(Math.round(price)) + 'đ';
    };
  
    // Check if user is logged in
  const isLoggedIn = tokens?.access_token;

  return (
      <div className="dynamic-pricing-container">
        {/* Header */}
        <div className="pricing-header">
          <div className="header-left">
            <DollarSign className="header-icon" />
            <div>
              <h1>Giá bán động (Dynamic Pricing)</h1>
              <p className="header-subtitle">
                Tìm mức giá tối ưu dựa trên phân tích AI về thị trường và hiệu suất bán hàng
              </p>
            </div>
          </div>
        </div>
  
        {/* Loading State */}
        {isAnalyzing && (
          <div className="loading-state" style={{
            textAlign: 'center',
            padding: '80px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginTop: '20px'
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
              Đang phân tích giá thị trường với AI...
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Vui lòng chờ trong giây lát
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
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            marginTop: '20px'
          }}>
            <div className="empty-icon" style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 12px 0' }}>
              Vui lòng đăng nhập để sử dụng tính năng này
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 24px' }}>
              Bạn cần đăng nhập vào tài khoản Shopee để phân tích giá thị trường và nhận đề xuất định giá từ AI
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
        <div className="controls-section">
          <div className="control-group">
            <label>Chọn sản phẩm</label>
            <select 
              className="product-select"
              value={selectedProduct?.item_id || ''}
              onChange={(e) => {
                const product = products.find(p => p.item_id === parseInt(e.target.value));
                if (product) {
                  setSelectedProduct(product);
                  setAiAnalysis(null); // Clear previous analysis
                }
              }}
              disabled={!isLoggedIn || isAnalyzing || products.length === 0}
            >
              <option value="">-- Chọn sản phẩm --</option>
              {products.map(product => (
                <option key={product.item_id} value={product.item_id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        )}

        {/* Info Card - No Product Selected */}
        {!isAnalyzing && isLoggedIn && !selectedProduct && (
          <div style={{
            background: 'linear-gradient(135deg, #0a58d0 0%, #0284c7 100%)',
            borderRadius: '12px',
            padding: '32px',
            marginTop: '20px',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 4px 12px rgba(10, 88, 208, 0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💰</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
              Chọn sản phẩm để bắt đầu phân tích giá
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
              Hệ thống sẽ phân tích giá thị trường và đưa ra đề xuất định giá tối ưu cho sản phẩm bạn chọn
            </p>
          </div>
        )}
  
        {/* Main Content Grid - 3 Columns Layout */}
        {!isAnalyzing && isLoggedIn && selectedProduct && (
        <div className="pricing-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '20px' }}>
          {/* Left Column - Price Metrics */}
          <div className="charts-column">
            {/* Price Recommendation Card */}
            <div className="recommendation-card highlight">
              <div className="recommendation-badge">
                <BarChart3 size={14} />
                <span>Mức cạnh tranh giá</span>
              </div>
              
              <div className="price-indicator">
                <div className="gauge-container">
                  <div className="gauge">
                    <div 
                      className="gauge-fill" 
                      style={{ height: `${aiAnalysis?.competitiveness?.percentage || 106}%` }}
                    ></div>
                    <div className="gauge-marker"></div>
                  </div>
                  <div className="gauge-label">
                    <span className={`percentage ${(aiAnalysis?.competitiveness?.percentage || 106) > 105 ? 'high' : 'normal'}`}>
                      {aiAnalysis?.competitiveness?.percentage || 106}%
                    </span>
                    <span className="status">{aiAnalysis?.competitiveness?.status || 'Hơi cao'}</span>
                  </div>
                </div>
              </div>
  
              <div className="price-details">
                <div className="price-row">
                  <span className="label">Giá hiện tại:</span>
                  <span className="value">
                    {formatPrice(aiAnalysis?.priceComparison?.currentPrice || selectedProduct?.price || 0)}
                  </span>
                </div>
                <div className="price-row">
                  <span className="label">Giá TB thị trường:</span>
                  <span className="value">
                    {formatPrice(aiAnalysis?.priceComparison?.marketAverage || selectedProduct?.price * 0.98 || 0)}
                  </span>
                </div>
                <div className="price-row highlight-row">
                  <span className="label">Chênh lệch:</span>
                  <span className={`value ${(aiAnalysis?.priceComparison?.difference || 0) >= 0 ? 'increase' : 'decrease'}`}>
                    {(aiAnalysis?.priceComparison?.difference || 0) >= 0 ? '+' : ''}
                    {formatPrice(Math.abs(aiAnalysis?.priceComparison?.difference || 0))} 
                    ({aiAnalysis?.priceComparison?.differencePercent || 0}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Competition Level Chart */}
            <div className="chart-card" style={{ marginTop: '20px' }}>
              <div className="card-header">
                <div className="header-title">
                  <BarChart3 size={18} />
                  <h3>Phân bố giá thị trường</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={competitionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="range" 
                    tick={{ fontSize: 11 }}
                    stroke="#999"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                  />
                  <Tooltip />
                  <Bar 
                    dataKey="value" 
                    fill="#4caf50"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
  
          {/* Center Column - AI Insights (Expanded) */}
          <div className="insights-column-expanded">
            {/* AI Deep Analysis */}
            <div className="insight-card ai-insight" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="insight-header" style={{ marginBottom: '16px' }}>
                <Lightbulb size={20} />
                <h3 style={{ fontSize: '17px', fontWeight: '600', margin: 0 }}>Phân tích AI chi tiết</h3>
              </div>
              
              {/* Main Insight */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#e3f2fd', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#1976d2' }}>
                  📊 Đánh giá tổng quan
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#333' }}>
                  {aiAnalysis?.insights || 'Giá hiện tại cao hơn trung bình thị trường. Giảm nhẹ sẽ tăng doanh số mà vẫn giữ lợi nhuận tốt.'}
                </p>
              </div>

              {/* Why This Price */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#fff3e0', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#f57c00' }}>
                  💡 Vì sao nên bán với giá này?
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#ff9800', fontWeight: '600' }}>•</span>
                    <span><strong>Vị trí cạnh tranh:</strong> Giá đề xuất {formatPrice(aiAnalysis?.recommendation?.suggestedPrice || selectedProduct?.price * 0.97 || 0)} giúp bạn cạnh tranh tốt hơn {Math.abs(aiAnalysis?.recommendation?.adjustmentPercent || 3)}% so với hiện tại</span>
                  </div>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#ff9800', fontWeight: '600' }}>•</span>
                    <span><strong>Tâm lý khách hàng:</strong> Mức giá này nằm trong khoảng "ngọt" mà khách hàng sẵn sàng chi trả cho sản phẩm {selectedProduct?.category}</span>
                  </div>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#ff9800', fontWeight: '600' }}>•</span>
                    <span><strong>Cân bằng lợi nhuận:</strong> Vẫn duy trì biên lợi nhuận tốt trong khi tăng khả năng chuyển đổi mua hàng</span>
                  </div>
                </div>
              </div>

              {/* Market Factors */}
              <div style={{ marginBottom: '20px', padding: '16px', background: '#f3e5f5', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px', color: '#7b1fa2' }}>
                  📈 Yếu tố thị trường sắp tới
                </h4>
                <div style={{ fontSize: '14px', lineHeight: '1.7', color: '#333' }}>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#9c27b0', fontWeight: '600' }}>🗓️</span>
                    <span><strong>Mùa mua sắm:</strong> Gần các sự kiện lớn (Black Friday, 12.12), khách hàng có xu hướng so sánh giá nhiều hơn</span>
                  </div>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#9c27b0', fontWeight: '600' }}>📊</span>
                    <span><strong>Xu hướng ngành:</strong> Thị trường {selectedProduct?.category} đang có xu hướng cạnh tranh giá cao, giảm {Math.abs(aiAnalysis?.recommendation?.adjustmentPercent || 3)}% giúp tăng khả năng hiển thị</span>
                  </div>
                  <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'flex-start' }}>
                    <span style={{ marginRight: '8px', color: '#9c27b0', fontWeight: '600' }}>🔄</span>
                    <span><strong>Tồn kho:</strong> Với {selectedProduct?.stock || 0} sản phẩm trong kho, mức giá này giúp tăng tốc độ xoay vòng hàng tồn</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Action */}
              <div style={{ marginTop: 'auto', padding: '16px', background: '#e8f5e9', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px', color: '#2e7d32' }}>
                  ✅ Khuyến nghị hành động
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: '#333' }}>
                  {aiAnalysis?.recommendation?.reasoning || 'Giảm nhẹ giá để tăng sức cạnh tranh'} 
                  {aiAnalysis?.recommendation?.suggestedPrice && (
                    <>
                      {' → Điều chỉnh xuống '}
                      <strong style={{ color: '#2e7d32' }}>{formatPrice(aiAnalysis.recommendation.suggestedPrice)}</strong>
                      {' '}
                    </>
                  )}
                  để {aiAnalysis?.recommendation?.expectedImpact || 'cải thiện doanh số 5-8%'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Price Position */}
          <div className="charts-column">
            {/* Price Position Comparison */}
            <div className="chart-card">
              <div className="card-header">
                <div className="header-title">
                  <TrendingUp size={18} />
                  <h3>Vị trí giá</h3>
                </div>
              </div>
              <div style={{ padding: '20px' }}>
                {pricePositionData.map((item, index) => {
                  const maxValue = Math.max(...pricePositionData.map(d => d.value));
                  const width = (item.value / maxValue) * 100;
                  const isCurrentPrice = item.label === 'Giá của bạn';
                  
                  return (
                    <div key={index} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                        <span style={{ fontWeight: isCurrentPrice ? '600' : '400', color: isCurrentPrice ? '#2196f3' : '#333' }}>
                          {item.label}
                        </span>
                        <span style={{ fontWeight: '600', color: item.color }}>
                          {formatPrice(item.value)}
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: isCurrentPrice ? '14px' : '10px', 
                        background: '#f0f0f0', 
                        borderRadius: '8px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${width}%`,
                          height: '100%',
                          background: item.color,
                          borderRadius: '8px',
                          transition: 'width 0.5s ease',
                          boxShadow: isCurrentPrice ? '0 2px 4px rgba(33, 150, 243, 0.3)' : 'none'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons" style={{ marginTop: '20px' }}>
              <button className="action-btn primary" disabled={!aiAnalysis}>
                <span>✓</span>
                Áp dụng giá mới
              </button>
              <button className="action-btn secondary" disabled={!aiAnalysis}>
                <span>📄</span>
                Lưu phân tích
              </button>
              <button className="action-btn secondary">
                <span>📊</span>
                Xem lịch sử
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    );
  };

export default DynamicPricingPage;

