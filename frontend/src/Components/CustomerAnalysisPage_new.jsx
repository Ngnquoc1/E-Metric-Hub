import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchProductReviews,
    fetchProductInsights,
    setSelectedProduct,
    clearAnalysis
} from '../store/slices/customerAnalysisSlice';
import './CustomerAnalysisPage_new.css';

const CustomerAnalysisPage = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const {
        currentProduct,
        reviews,
        sentimentAnalysis,
        insights,
        recommendations,
        selectedProduct,
        loading,
        error
    } = useSelector((state) => state.customerAnalysis);

    const { data: dashboardData } = useSelector((state) => state.dashboard);
    const [products, setProducts] = useState([]);

    // Load products from dashboard
    useEffect(() => {
        if (dashboardData?.products) {
            setProducts(dashboardData.products.slice(0, 20));
        }
    }, [dashboardData]);

    // Load data when product selected
    useEffect(() => {
        // Use mock credentials if not logged in
        const accessToken = user?.accessToken || 'mock_access_token';
        const shopId = user?.shopId || '12345';
        
        if (selectedProduct) {
            console.log('🔄 Loading analysis for product:', selectedProduct.item_id);
            console.log('👤 Using credentials:', {
                accessToken: accessToken.substring(0, 20) + '...',
                shopId: shopId
            });
            
            // Clear previous analysis
            dispatch(clearAnalysis());
            
            // Fetch new analysis
            dispatch(fetchProductReviews({
                productId: selectedProduct.item_id,
                accessToken: accessToken,
                shopId: shopId
            })).then((result) => {
                console.log('✅ fetchProductReviews result:', result);
                if (result.error) {
                    console.error('❌ fetchProductReviews error:', result.error);
                }
            }).catch((err) => {
                console.error('❌ fetchProductReviews exception:', err);
            });
            
            dispatch(fetchProductInsights({
                productId: selectedProduct.item_id,
                accessToken: accessToken,
                shopId: shopId
            })).then((result) => {
                console.log('✅ fetchProductInsights result:', result);
            }).catch((err) => {
                console.error('❌ fetchProductInsights exception:', err);
            });
        }
    }, [selectedProduct, dispatch]);

    const handleProductSelect = (product) => {
        console.log('📦 Product selected:', product);
        dispatch(setSelectedProduct(product));
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Calculate statistics
    const stats = sentimentAnalysis?.statistics || null;
    const aspectStats = stats?.aspect_statistics || {};
    const keywords = stats?.keywords || {};
    
    const sentimentDist = stats?.sentiment_distribution || { positive: 0, neutral: 0, negative: 0 };
    const totalReviews = sentimentDist.positive + sentimentDist.neutral + sentimentDist.negative || 1;
    
    const positivePercent = ((sentimentDist.positive / totalReviews) * 100).toFixed(0);
    const neutralPercent = ((sentimentDist.neutral / totalReviews) * 100).toFixed(0);
    const negativePercent = ((sentimentDist.negative / totalReviews) * 100).toFixed(0);

    // Debug logging
    useEffect(() => {
        console.log('📊 Component State:', {
            selectedProduct: selectedProduct?.item_name,
            loading,
            error,
            hasSentimentAnalysis: !!sentimentAnalysis,
            hasStats: !!stats,
            reviewsCount: reviews.length
        });
    }, [selectedProduct, loading, error, sentimentAnalysis, stats, reviews]);

    // Top keywords data from API
    const topKeywordsArray = Object.entries(keywords)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));

    // Separate positive and negative keywords
    const positiveKeywords = topKeywordsArray.filter(k => k.count > 0).slice(0, 4);
    const negativeKeywords = Object.entries(aspectStats)
        .filter(([_, data]) => data.negative > data.positive)
        .map(([aspect, _]) => aspect)
        .slice(0, 2);

    // Get top issues and strengths from recommendations
    const topIssue = recommendations?.issues?.[0] || {
        aspect: 'thời gian giao hàng',
        description: 'Khách hàng thường phàn nàn về thời gian giao hàng',
        suggestion: 'Nên hợp tác với đơn vị vận chuyển nhanh hơn hoặc cung cấp nhiều tùy chọn giao hàng'
    };

    const topStrength = recommendations?.strengths?.[0] || {
        aspect: 'bao bì và chất lượng sản phẩm',
        description: 'Khách hàng rất hài lòng về bao bì và chất lượng sản phẩm'
    };

    const impacts = recommendations?.predicted_impact || [
        'Tăng 15% đánh giá 5 sao',
        'Giảm 60% phàn nàn giao hàng',
        'Tăng 10% tỷ lệ mua lại'
    ];

    // Calculate donut chart paths
    const calculateDonutPath = (startPercent, percent, radius = 90, innerRadius = 60) => {
        const start = (startPercent / 100) * 360;
        const angle = (percent / 100) * 360;
        const end = start + angle;
        
        const startRad = (start - 90) * Math.PI / 180;
        const endRad = (end - 90) * Math.PI / 180;
        
        const x1 = 100 + radius * Math.cos(startRad);
        const y1 = 100 + radius * Math.sin(startRad);
        const x2 = 100 + radius * Math.cos(endRad);
        const y2 = 100 + radius * Math.sin(endRad);
        
        const ix1 = 100 + innerRadius * Math.cos(startRad);
        const iy1 = 100 + innerRadius * Math.sin(startRad);
        const ix2 = 100 + innerRadius * Math.cos(endRad);
        const iy2 = 100 + innerRadius * Math.sin(endRad);
        
        const largeArc = angle > 180 ? 1 : 0;
        
        return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
    };

    return (
        <div className="customer-analysis-page-new">
            {/* Header Section */}
            <div className="page-header-new">
                <div className="header-icon-new">💬</div>
                <div className="header-content-new">
                    <h1>Phân tích phản hồi khách hàng (AI Review Insight)</h1>
                    <p>Sử dụng AI để phân tích đánh giá khách hàng và trích xuất insights cải thiện sản phẩm</p>
                </div>
            </div>

            {/* Controls Row */}
            <div className="controls-row">
                <div className="product-selector-new">
                    <label>Chọn sản phẩm</label>
                    <select 
                        value={selectedProduct?.item_id || ''}
                        onChange={(e) => {
                            const product = products.find(p => p.item_id === parseInt(e.target.value));
                            handleProductSelect(product);
                        }}
                        disabled={loading}
                    >
                        <option value="">-- Chọn sản phẩm --</option>
                        {products.map(product => (
                            <option key={product.item_id} value={product.item_id}>
                                {product.item_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="summary-cards">
                    <div className="summary-card positive-card">
                        <div className="card-emoji">😊</div>
                        <div className="card-content">
                            <div className="card-label">Tích cực</div>
                            <div className="card-value">{sentimentDist.positive} reviews</div>
                        </div>
                    </div>
                    <div className="summary-card neutral-card">
                        <div className="card-emoji">😐</div>
                        <div className="card-content">
                            <div className="card-label">Trung lập</div>
                            <div className="card-value">{sentimentDist.neutral} reviews</div>
                        </div>
                    </div>
                    <div className="summary-card negative-card">
                        <div className="card-emoji">😞</div>
                        <div className="card-content">
                            <div className="card-label">Tiêu cực</div>
                            <div className="card-value">{sentimentDist.negative} reviews</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Grid Layout */}
            {loading && (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Đang phân tích đánh giá với AI...</p>
                </div>
            )}

            {error && (
                <div className="error-banner">
                    <span>❌</span> {error}
                    <button onClick={() => dispatch(clearAnalysis())}>Thử lại</button>
                </div>
            )}

            {!loading && !selectedProduct && (
                <div className="empty-state">
                    <div className="empty-icon">📊</div>
                    <h3>Chọn sản phẩm để bắt đầu phân tích</h3>
                    <p>Vui lòng chọn một sản phẩm từ danh sách để xem phân tích chi tiết về đánh giá khách hàng</p>
                </div>
            )}

            {!loading && selectedProduct && !sentimentAnalysis && !error && (
                <div className="empty-state">
                    <div className="empty-icon">⏳</div>
                    <h3>Đang tải dữ liệu phân tích...</h3>
                    <p>Vui lòng đợi trong giây lát</p>
                </div>
            )}

            {!loading && selectedProduct && sentimentAnalysis && (
                <div className="main-grid">
                {/* Column 1: Sentiment Analysis */}
                <div className="grid-column">
                    <div className="analysis-card">
                        <h3>📊 Phân tích cảm xúc</h3>
                        <div className="donut-chart-container">
                            <svg viewBox="0 0 200 200" width="240" height="240">
                                {/* Positive */}
                                <path d={calculateDonutPath(0, positivePercent)} fill="#10b981" />
                                {/* Neutral */}
                                <path d={calculateDonutPath(positivePercent, neutralPercent)} fill="#f59e0b" />
                                {/* Negative */}
                                <path d={calculateDonutPath(parseFloat(positivePercent) + parseFloat(neutralPercent), negativePercent)} fill="#ef4444" />
                                
                                {/* Center text */}
                                <text x="100" y="95" textAnchor="middle" className="donut-label">Tích cực</text>
                                <text x="100" y="115" textAnchor="middle" className="donut-value">{positivePercent}%</text>
                            </svg>
                        </div>
                        <div className="sentiment-breakdown">
                            <div className="breakdown-item">
                                <div className="breakdown-dot positive-dot"></div>
                                <span className="breakdown-label">Tích cực</span>
                                <span className="breakdown-value">{sentimentDist.positive}</span>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-dot neutral-dot"></div>
                                <span className="breakdown-label">Trung lập</span>
                                <span className="breakdown-value">{sentimentDist.neutral}</span>
                            </div>
                            <div className="breakdown-item">
                                <div className="breakdown-dot negative-dot"></div>
                                <span className="breakdown-label">Tiêu cực</span>
                                <span className="breakdown-value">{sentimentDist.negative}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Top Keywords */}
                <div className="grid-column">
                    <div className="analysis-card">
                        <h3>💬 Từ khóa nổi bật</h3>
                        <div className="bar-chart">
                            {topKeywordsArray.length > 0 ? topKeywordsArray.filter(k => k.count > 0).map((keyword, idx) => {
                                const maxCount = Math.max(...topKeywordsArray.map(k => k.count));
                                return (
                                    <div key={idx} className="bar-item">
                                        <div className="bar-label">{keyword.name}</div>
                                        <div className="bar-container">
                                            <div 
                                                className="bar-fill" 
                                                style={{ width: `${(keyword.count / maxCount) * 100}%` }}
                                            ></div>
                                        </div>
                                        <div className="bar-count">{keyword.count}</div>
                                    </div>
                                );
                            }) : (
                                <p style={{ textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu</p>
                            )}
                        </div>
                        <div className="keyword-section">
                            <h4>Từ khóa phổ biến:</h4>
                            <div className="keyword-tags">
                                {positiveKeywords.map((keyword, idx) => (
                                    <span key={idx} className="keyword-tag positive-tag">{keyword.name}</span>
                                ))}
                                {negativeKeywords.map((keyword, idx) => (
                                    <span key={idx} className="keyword-tag negative-tag">{keyword}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: AI Suggestions */}
                <div className="grid-column">
                    <div className="analysis-card">
                        <h3>🤖 AI Suggestion</h3>
                        
                        {/* Issue Card */}
                        <div className="suggestion-card issue-card">
                            <div className="suggestion-header">
                                <span className="suggestion-icon">⚠️</span>
                                <h4>Vấn đề phát hiện</h4>
                            </div>
                            <p className="suggestion-text">
                                Khách hàng thường phàn nàn về <span className="highlight-red">{topIssue.aspect}</span>
                            </p>
                            <div className="action-box">
                                <h5>Gợi ý hành động:</h5>
                                <p>{topIssue.suggestion}</p>
                            </div>
                        </div>

                        {/* Strength Card */}
                        <div className="suggestion-card strength-card">
                            <div className="suggestion-header">
                                <span className="suggestion-icon">✅</span>
                                <h4>Điểm mạnh</h4>
                            </div>
                            <p className="suggestion-text">
                                Khách hàng rất hài lòng về <span className="highlight-green">{topStrength.aspect}</span>
                            </p>
                        </div>

                        {/* Impact Card */}
                        <div className="suggestion-card impact-card">
                            <div className="suggestion-header">
                                <span className="suggestion-icon">📈</span>
                                <h4>Tác động dự kiến:</h4>
                            </div>
                            <ul className="impact-list">
                                {impacts.map((impact, idx) => (
                                    <li key={idx}>• {impact}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Footer Section */}
            <div className="footer-actions">
                <button className="btn-primary">
                    <span className="btn-icon">🔍</span>
                    Xem chi tiết feedback
                </button>
                <button className="btn-secondary">
                    <span className="btn-icon">📝</span>
                    Tạo nhiệm vụ cải tiến
                </button>
                <button className="btn-secondary">
                    <span className="btn-icon">📊</span>
                    Xuất báo cáo insights
                </button>
            </div>
        </div>
    );
};

export default CustomerAnalysisPage;
