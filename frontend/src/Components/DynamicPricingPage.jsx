import React, { useState } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Lightbulb, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './DynamicPricingPage.css';
const DynamicPricingPage = () => {
    const [selectedProduct, setSelectedProduct] = useState('Laptop Dell XPS 13');
    const [timeRange, setTimeRange] = useState('7ngày');
  
    // Dữ liệu biểu đồ giá và doanh số
    const priceComparisonData = [
      { date: '01/11', currentPrice: 14050, marketPrice: 14100 },
      { date: '03/11', currentPrice: 13900, marketPrice: 14000 },
      { date: '05/11', currentPrice: 13850, marketPrice: 13950 },
      { date: '07/11', currentPrice: 13800, marketPrice: 13900 },
      { date: '09/11', currentPrice: 13750, marketPrice: 13850 },
      { date: '11/11', currentPrice: 13700, marketPrice: 13800 },
      { date: '13/11', currentPrice: 13650, marketPrice: 13750 },
    ];
  
    // Dữ liệu cho biểu đồ cột mức cạnh tranh
    const competitionData = [
      { range: '10.5k-11k', value: 15 },
      { range: '11k-11.5k', value: 28 },
      { range: '11.5k-12k', value: 45 },
      { range: '12k-12.5k', value: 68 },
      { range: '12.5k-13k', value: 92 },
      { range: '13k-13.5k', value: 106 },
      { range: '13.5k-14k', value: 85 },
    ];
  
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
  
        {/* Product Selection and Time Range */}
        <div className="controls-section">
          <div className="control-group">
            <label>Chọn sản phẩm</label>
            <select 
              className="product-select"
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
            >
              <option>Laptop Dell XPS 13</option>
              <option>MacBook Pro 14</option>
              <option>HP Spectre x360</option>
            </select>
          </div>
  
          <div className="control-group">
            <label>Khoảng thời gian so sánh</label>
            <div className="time-range-tabs">
              <button 
                className={timeRange === '7ngày' ? 'time-tab active' : 'time-tab'}
                onClick={() => setTimeRange('7ngày')}
              >
                7 ngày
              </button>
              <button 
                className={timeRange === '30ngày' ? 'time-tab active' : 'time-tab'}
                onClick={() => setTimeRange('30ngày')}
              >
                30 ngày
              </button>
            </div>
          </div>
        </div>
  
        {/* Main Content Grid */}
        <div className="pricing-content-grid">
          {/* Left Column - Charts */}
          <div className="charts-column">
            {/* Price Comparison Chart */}
            <div className="chart-card">
              <div className="card-header">
                <div className="header-title">
                  <TrendingUp size={18} />
                  <h3>So sánh giá của hàng vs Giá trung bình đối thủ</h3>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={priceComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    stroke="#999"
                    domain={[13500, 14200]}
                  />
                  <Tooltip />
                  <Legend 
                    wrapperStyle={{ fontSize: '13px' }}
                    iconType="line"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="currentPrice" 
                    stroke="#ff9800" 
                    strokeWidth={2}
                    name="Giá Thi đối thủ"
                    dot={{ fill: '#ff9800', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="marketPrice" 
                    stroke="#2196f3" 
                    strokeWidth={2}
                    name="Giá của hàng"
                    dot={{ fill: '#2196f3', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
  
            {/* Competition Level Chart */}
            <div className="chart-card">
              <div className="card-header">
                <div className="header-title">
                  <BarChart3 size={18} />
                  <h3>Mức cạnh tranh giá</h3>
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
  
          {/* Right Column - Insights and Recommendations */}
          <div className="insights-column">
            {/* Price Recommendation Card */}
            <div className="recommendation-card highlight">
              <div className="recommendation-badge">
                <BarChart3 size={14} />
                <span>Mức cạnh tranh giá</span>
              </div>
              
              <div className="price-indicator">
                <div className="gauge-container">
                  <div className="gauge">
                    <div className="gauge-fill" style={{ height: '106%' }}></div>
                    <div className="gauge-marker"></div>
                  </div>
                  <div className="gauge-label">
                    <span className="percentage high">106%</span>
                    <span className="status">Hơi cao</span>
                  </div>
                </div>
              </div>
  
              <div className="price-details">
                <div className="price-row">
                  <span className="label">Giá hiện tại:</span>
                  <span className="value">12,600,000đ</span>
                </div>
                <div className="price-row">
                  <span className="label">Giá TB thị trường:</span>
                  <span className="value">12,400,000đ</span>
                </div>
                <div className="price-row highlight-row">
                  <span className="label">Chênh lệch:</span>
                  <span className="value increase">+200,000đ (46%)</span>
                </div>
              </div>
            </div>
  
            {/* AI Insight */}
            <div className="insight-card ai-insight">
              <div className="insight-header">
                <Lightbulb size={18} />
                <h4>AI Insight</h4>
              </div>
              <p className="insight-text">
                Giá hiện tại cao hơn <span className="highlight-text">6% so</span> với thị trường.
              </p>
              <div className="suggestion">
                <span className="suggestion-icon">💡</span>
                <span className="suggestion-text">Gợi ý:</span>
              </div>
              <p className="suggestion-detail">
                Giảm 3% (xuống <strong>12,220,000đ</strong>) để tăng doanh số <strong>56 +8%</strong>
              </p>
            </div>
  
            {/* Action Buttons */}
            <div className="action-buttons">
              <button className="action-btn primary">
                <span>✓</span>
                Áp dụng giá mới
              </button>
              <button className="action-btn secondary">
                <span>📄</span>
                Lưu nhắc này
              </button>
              <button className="action-btn secondary">
                <span>📊</span>
                Xem lịch sử điều chỉnh giá
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default DynamicPricingPage;

