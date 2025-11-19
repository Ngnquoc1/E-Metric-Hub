import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TrendingUp, Sparkles, Package } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  fetchDemandCategories,
  fetchDemandProducts,
  setSelectedCategory,
  setSelectedProduct,
  fetchDemandInsights
} from '../store/slices/DemandForecastSlice';
import jsonForecastData from './DemandForecastPage.json';
import './DemandForecastPage.css';
const TAB_DAY_MAP = {
  '7ngày': 7,
  '14ngày': 14,
  '30ngày': 30
};

const DEFAULT_INSIGHTS = [
  {
    title: 'Insight AI',
    content: 'Xu hướng tăng tương tự tháng trước',
    note: null,
  },
  {
    title: 'Xu hướng tăng dần',
    content: 'Dự kiến doanh số tăng trong tuần tới',
    note: 'Nên nhập thêm tồn kho sản phẩm',
  },
  {
    title: 'Cảnh báo tồn kho',
    content: 'Tồn kho có xu hướng biến động mạnh',
    note: 'Cần tối ưu chương trình khuyến mãi',
  },
  {
    title: 'Xu hướng theo mùa',
    content: 'Tháng cao điểm cuối năm thường tăng 28%',
    note: 'Chuẩn bị cho các dịp lễ lớn',
  },
];

const DEFAULT_ACTIONS = [
  {
    title: 'Đề ra chỉ dự bán',
    content: 'Kiến nghị tăng trưởng dựa trên thị trường',
    button_label: '+20.5%',
    button_color: 'success',
  },
  {
    title: 'Phi vụ tồn kho',
    content: 'Cân nhắc tối ưu tồn kho đang dư thừa',
    button_label: '-40.2%',
    button_color: 'warning',
  },
];

const DemandForecastPage = () => {
  const [activeTab, setActiveTab] = useState('7ngày');
  const dispatch = useDispatch();
  const {
    categories,
    products,
    selectedCategoryId,
    selectedProductId,
    loadingCategories,
    loadingProducts,
    insightsData,
    loadingInsights,
    insightsError,
  } = useSelector((state) => state.demandForecast);

  const productForecastMap = useMemo(() => {
    const map = new Map();
    (jsonForecastData?.products || []).forEach((profile) => {
      map.set(String(profile.item_id), profile);
    });
    return map;
  }, []);

  useEffect(() => {
    dispatch(fetchDemandCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchDemandProducts(selectedCategoryId));
  }, [dispatch, selectedCategoryId]);

  useEffect(() => {
    if (!products || !products.length) return;

    const firstAvailable = products.find((product) =>
      productForecastMap.has(String(product.item_id))
    );

    if (!firstAvailable) return;

    const fallbackId = String(firstAvailable.item_id);
    const hasValidSelection =
      selectedProductId &&
      selectedProductId !== 'all' &&
      productForecastMap.has(String(selectedProductId));

    if (!hasValidSelection) {
      dispatch(setSelectedProduct(fallbackId));
    }
  }, [products, selectedProductId, dispatch, productForecastMap]);

  const handleCategoryChange = (event) => {
    dispatch(setSelectedCategory(event.target.value));
  };

  const handleProductChange = (event) => {
    dispatch(setSelectedProduct(event.target.value));
  };

  const dayCount = TAB_DAY_MAP[activeTab] || 7;

  const selectedProduct = useMemo(
    () =>
      products.find((product) => String(product.item_id) === String(selectedProductId)) || null,
    [products, selectedProductId]
  );

  const selectedProductProfile = selectedProductId
    ? productForecastMap.get(String(selectedProductId))
    : null;

  const seriesKey = `${dayCount}days_series`;
  const chartData = useMemo(() => {
    // 🔑 SỬA: Lấy mảng series bằng key động
    const series = selectedProductProfile?.[seriesKey] || [];
    
    // 🔑 SỬA: Kiểm tra độ dài của series đã chọn
    if (!series.length) { 
        return [];
    }
    
    // Không cần slice thêm nữa, vì series đã được cắt sẵn
    return series; 
  }, [selectedProductProfile, seriesKey]);

  const totalStock = selectedProductProfile?.stock ?? 0;
  const recentSalesValue = selectedProductProfile?.Total_product ?? 0;
  const forecastNextMonth = selectedProductProfile?.Predic_product ?? 0;

  const formatNumber = (value) =>
    Number.isFinite(value) ? value.toLocaleString('vi-VN') : '0';

  const selectedProductName =
    selectedProduct?.item_name || selectedProductProfile?.name || 'Chưa chọn';
  
  const aiPromptData = useMemo(() => {
    if (!selectedProductProfile) return null;

    const productName = selectedProductProfile.name;
    const category = selectedProductProfile.category;
    const currentStock = selectedProductProfile.stock;
    const totalProduct = selectedProductProfile.Total_product;
    const predictedDemand = selectedProductProfile.Predic_product;
    
    // Lấy dữ liệu 30 ngày gần nhất (Actual)
    // Slicing 30 ngày đầu của 30days_series (chính là 30 ngày actual)
    const recentActualData = selectedProductProfile['30days_series']
        .slice(0, 30)
        .map(d => `Ngày ${d.date}: ${d.actual || 0}`)
        .join(', ');
        
    // Lấy dự báo 7 ngày tiếp theo
    const nextForecastData = selectedProductProfile['30days_series']
        .slice(30, 60)
        .map(d => `Ngày ${d.date}: ${d.forecast || 0}`)
        .join(', ');
        
    return {
        productName,
        category,
        currentStock,
        totalProduct,
        predictedDemand,
        recentActualData,
        nextForecastData
    };
  }, [selectedProductProfile]);
  const aiPrompt = useMemo(() => {
    if (!aiPromptData) return "Vui lòng chọn sản phẩm để phân tích.";

    return `
        Phân tích nhu cầu tồn kho cho sản phẩm sau dựa trên dữ liệu.
        
        **Yêu cầu:** Tạo ra các nội dung cho 4 Insight Card và 2 Action Card.

        --- DỮ LIỆU SẢN PHẨM ---
        Sản phẩm: ${aiPromptData.productName} (${aiPromptData.category})
        Tồn kho hiện tại (Stock): ${aiPromptData.currentStock}
        Tổng dự trữ (Total Product): ${aiPromptData.totalProduct}
        Dự báo nhu cầu 30 ngày (Predic Product): ${aiPromptData.predictedDemand}

        Doanh số thực tế 7 ngày qua: ${aiPromptData.recentActualData}
        Dự báo nhu cầu 7 ngày tới: ${aiPromptData.nextForecastData}
        
        Hãy trả lời bằng một đối tượng JSON DUY NHẤT có cấu trúc sau:
        {
            "insights": [
                {"type": "highlight", "title": "Insight AI", "content": "..." },
                {"type": "trends", "title": "Xu hướng tăng dần", "content": "...", "note": "..." },
                {"type": "warning", "title": "Cảnh báo tồn kho", "content": "...", "note": "..." },
                {"type": "event", "title": "Xu hướng theo mùa", "content": "...", "note": "..." }
            ],
            "actions": [
                {"title": "Đề xuất", "content": "...", "button_label": "+X.X%", "button_color": "success"},
                {"title": "Phí tồn kho", "content": "...", "button_label": "-Y.Y%", "button_color": "warning"}
            ]
        }
    `;
  }, [aiPromptData]);
  useEffect(() => {
    if (!aiPromptData) return;
    dispatch(fetchDemandInsights(aiPrompt));
  }, [aiPrompt, dispatch]);

  const insights = insightsData?.insights || [];
  const actions = insightsData?.actions || [];

  const resolvedInsights = useMemo(() => {
    if (loadingInsights) {
      return DEFAULT_INSIGHTS.map((fallback) => ({
        title: fallback.title,
        content: 'Đang phân tích với AI...',
        note: fallback.note ? 'Đang cập nhật dữ liệu...' : null,
      }));
    }

    if (insightsError) {
      return DEFAULT_INSIGHTS.map((fallback) => ({
        title: fallback.title,
        content: fallback.content,
        note: insightsError,
      }));
    }

    return DEFAULT_INSIGHTS.map((fallback, index) => {
      const aiInsight = insights[index];
      return {
        title: aiInsight?.title || fallback.title,
        content: aiInsight?.content || fallback.content,
        note: aiInsight?.note ?? fallback.note ?? null,
      };
    });
  }, [insights, loadingInsights, insightsError]);

  const resolvedActions = useMemo(() => {
    if (loadingInsights) {
      return DEFAULT_ACTIONS.map((fallback) => ({
        ...fallback,
        content: 'AI đang xây dựng đề xuất...',
        button_label: 'Đang xử lý...',
      }));
    }

    if (insightsError) {
      return DEFAULT_ACTIONS.map((fallback) => ({
        ...fallback,
        content: fallback.content,
        button_label: 'Thử lại',
        button_color: fallback.button_color,
      }));
    }

    return DEFAULT_ACTIONS.map((fallback, index) => {
      const aiAction = actions[index];
      return {
        title: aiAction?.title || fallback.title,
        content: aiAction?.content || fallback.content,
        button_label: aiAction?.button_label || fallback.button_label,
        button_color: aiAction?.button_color || fallback.button_color,
      };
    });
  }, [actions, loadingInsights, insightsError]);

  const getActionButtonClass = (color) => {
    if (color === 'warning') return 'action-button warning-btn';
    if (color === 'success') return 'action-button success-btn';
    return 'action-button';
  };

  return (
    <div className="demand-forecast-container">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <Package className="header-icon" />
          <h1>Dự báo nhu cầu sản phẩm</h1>
        </div>
        <div className="header-tabs">
          <button 
            className={activeTab === '7ngày' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('7ngày')}
          >
            7 ngày
          </button>
          <button 
            className={activeTab === '14ngày' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('14ngày')}
          >
            14 ngày
          </button>
          <button 
            className={activeTab === '30ngày' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('30ngày')}
          >
            30 ngày
          </button>
        </div>
      </div>

      <p className="description">Dự đoán nhu cầu của sản phẩm dựa trên AI và lịch sử bán hàng hiện có</p>

      {/* Main Content */}
      <div className="content-wrapper">
        {/* Left Side - Chart */}
        <div className="chart-section">
          {/* Product Selection */}
          <div className="product-selector">
            <label>Chọn danh mục:</label>
            <select
              className="category-select"
              value={selectedCategoryId}
              onChange={handleCategoryChange}
              disabled={loadingCategories}
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <label>Chọn sản phẩm:</label>
            <select
              className="product-select"
              value={
                selectedProductId && selectedProductId !== 'all'
                  ? String(selectedProductId)
                  : ''
              }
              onChange={handleProductChange}
              disabled={loadingProducts || !products.length}
            >
              <option value="" disabled>
                Chọn sản phẩm
              </option>
              {products.map((product) => (
                <option key={product.item_id} value={String(product.item_id)}>
                  {product.item_name}
                </option>
              ))}
            </select>
          </div>

          {/* Chart */}
          <div className="chart-container">
            <h3 className="chart-title">
              <TrendingUp size={18} />
              Doanh số thực tế và Dự báo nhu cầu
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <Tooltip />
                <Legend 
                  wrapperStyle={{ fontSize: '13px' }}
                  iconType="line"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#00bcd4" 
                  strokeWidth={2}
                  name="Doanh số thực tế"
                  dot={{ fill: '#00bcd4', r: 4 }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="forecast" 
                  stroke="#3f51b5" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Dự báo nhu cầu"
                  dot={{ fill: '#3f51b5', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <Package size={16} />
                <span>Tổng kho hiện tại</span>
              </div>
              <div className="stat-value">{formatNumber(totalStock)} sản phẩm</div>
              
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <TrendingUp size={16} />
                <span>Doanh số gần nhất</span>
              </div>
              <div className="stat-value">
                {formatNumber(recentSalesValue)} sản phẩm
              </div>
              
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Sparkles size={16} />
                <span>Dự báo tháng sau</span>
              </div>
              <div className="stat-value">
                {formatNumber(forecastNextMonth)} sản phẩm
              </div>
              
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <Package size={16} />
                <span>Sản phẩm đang xem</span>
              </div>
              <div className="stat-value">{selectedProductName}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Insights */}
        <div className="insights-section">
          <div className="insight-card highlight">
            <div className="insight-icon">💡</div>
            <div className="insight-content">
              <h4>{resolvedInsights[0]?.title}</h4>
              <p>{resolvedInsights[0]?.content}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon trends">📈</div>
            <div className="insight-content">
              <h4>{resolvedInsights[1]?.title}</h4>
              <p>{resolvedInsights[1]?.content}</p>
              {resolvedInsights[1]?.note && (
                <span className="insight-note">{resolvedInsights[1].note}</span>
              )}
            </div>
          </div>

          <div className="insight-card warning">
            <div className="insight-icon">⚠️</div>
            <div className="insight-content">
              <h4>{resolvedInsights[2]?.title}</h4>
              <p>{resolvedInsights[2]?.content}</p>
              {resolvedInsights[2]?.note && (
                <span className="insight-note">{resolvedInsights[2].note}</span>
              )}
            </div>
          </div>

          <div className="insight-card event">
            <div className="insight-icon">✨</div>
            <div className="insight-content">
              <h4>{resolvedInsights[3]?.title}</h4>
              <p>{resolvedInsights[3]?.content}</p>
              {resolvedInsights[3]?.note && (
                <span className="insight-note">{resolvedInsights[3].note}</span>
              )}
            </div>
          </div>

          <div className="action-card success">
            <div className="action-label">ĐỀ XUẤT</div>
            <h4>{resolvedActions[0]?.title}</h4>
            <p>{resolvedActions[0]?.content}</p>
            <button className={getActionButtonClass(resolvedActions[0]?.button_color)}>
              {resolvedActions[0]?.button_label}
            </button>
          </div>

          <div className="action-card success">
            <div className="action-label">ĐỀ XUẤT</div>
            <h4>{resolvedActions[1]?.title}</h4>
            <p>{resolvedActions[1]?.content}</p>
            <button className={getActionButtonClass(resolvedActions[1]?.button_color)}>
              {resolvedActions[1]?.button_label}
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="action-bar">
        <button className="action-bar-btn primary">
          <span>📊</span>
          Xuất báo cáo
        </button>
        <button className="action-bar-btn">
          <span>🔄</span>
          Cấu hình báo linh linh
        </button>
        <button className="action-bar-btn">
          <span>⚙️</span>
          Chạnh lý tồn kho
        </button>
      </div>
    </div>
  );
};

export default DemandForecastPage;