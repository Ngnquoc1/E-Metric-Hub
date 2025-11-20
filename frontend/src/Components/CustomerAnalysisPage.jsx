import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
    fetchProductReviews,
    fetchProductInsights,
    setSelectedProduct,
    clearAnalysis
} from '../store/slices/customerAnalysisSlice';
import './CustomerAnalysisPage.css';

const CustomerAnalysisPage = () => {
    const dispatch = useDispatch();
    // ✅ Use consistent Redux auth state
    const { tokens } = useSelector((state) => state.auth);
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
    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [loadingAI, setLoadingAI] = useState(false);

    // Load products from dashboard
    useEffect(() => {
        if (dashboardData?.products) {
            setProducts(dashboardData.products.slice(0, 20));
        }
    }, [dashboardData]);

    // Load data when product selected
    useEffect(() => {
        // ✅ Use consistent auth tokens (same as Dashboard)
        const accessToken = tokens?.access_token || 'mock_access_token';
        const shopId = tokens?.shop_id || '12345';
        
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
    }, [selectedProduct, dispatch, tokens]);

    const handleProductSelect = (product) => {
        console.log('📦 Product selected:', product);
        dispatch(setSelectedProduct(product));
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    // Generate AI suggestions using Gemini
    const generateAISuggestions = async (analysisData) => {
        if (!analysisData?.statistics) return;
        
        setLoadingAI(true);
        try {
            const stats = analysisData.statistics;
            const aspectStats = stats.aspect_statistics || {};
            const sentimentDist = stats.sentiment_distribution || {};
            const keywords = stats.keywords || {};
            
            // Build context for AI
            const topKeywords = Object.entries(keywords)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word, count]) => `${word} (${count} lần)`);
            
            const negativeAspects = Object.entries(aspectStats)
                .filter(([_, data]) => data.negative > data.positive)
                .sort((a, b) => b[1].negative - a[1].negative)
                .slice(0, 3)
                .map(([aspect, data]) => `${aspect}: ${data.negative} đánh giá tiêu cực`);
            
            const positiveAspects = Object.entries(aspectStats)
                .filter(([_, data]) => data.positive > data.negative)
                .sort((a, b) => b[1].positive - a[1].positive)
                .slice(0, 3)
                .map(([aspect, data]) => `${aspect}: ${data.positive} đánh giá tích cực`);
            
            const prompt = `Bạn là chuyên gia phân tích trải nghiệm khách hàng. Dựa trên dữ liệu phân tích đánh giá sản phẩm sau, hãy đưa ra gợi ý cải thiện cụ thể:

📊 Thống kê cảm xúc:
- Tích cực: ${sentimentDist.positive} đánh giá
- Trung lập: ${sentimentDist.neutral} đánh giá  
- Tiêu cực: ${sentimentDist.negative} đánh giá

🔑 Từ khóa nổi bật: ${topKeywords.join(', ')}

⚠️ Khía cạnh tiêu cực:
${negativeAspects.length > 0 ? negativeAspects.join('\n') : 'Không có vấn đề nghiêm trọng'}

✅ Khía cạnh tích cực:
${positiveAspects.length > 0 ? positiveAspects.join('\n') : 'Chưa có điểm mạnh rõ ràng'}

Hãy trả lời theo định dạng JSON:
{
  "mainIssue": {
    "aspect": "tên khía cạnh có vấn đề nhất",
    "description": "mô tả ngắn gọn vấn đề",
    "suggestion": "gợi ý hành động cụ thể để cải thiện"
  },
  "topStrength": {
    "aspect": "tên khía cạnh tốt nhất",
    "description": "mô tả ngắn gọn điểm mạnh"
  },
  "impacts": [
    "tác động dự kiến 1",
    "tác động dự kiến 2",
    "tác động dự kiến 3"
  ]
}

Chỉ trả về JSON, không thêm text khác.`;

            const response = await axios.post('/api/ai/chat', {
                prompt: prompt,
                conversationId: `analysis-${selectedProduct.item_id}-${Date.now()}`,
                userId: 'customer-analysis-system'
            });

            // Parse JSON response
            const aiResponse = response.data.reply;
            // Extract JSON from response (remove markdown code blocks if present)
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)```/) || aiResponse.match(/\{[\s\S]*\}/);
            const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiResponse;
            const suggestions = JSON.parse(jsonStr);
            
            setAiSuggestions(suggestions);
        } catch (error) {
            console.error('Error generating AI suggestions:', error);
            // Fallback to default suggestions
            setAiSuggestions(null);
        } finally {
            setLoadingAI(false);
        }
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

    // Generate AI suggestions when sentiment analysis is ready
    useEffect(() => {
        if (sentimentAnalysis && !loading && !loadingAI) {
            generateAISuggestions(sentimentAnalysis);
        }
    }, [sentimentAnalysis, loading]);

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

    // Get top issues and strengths from AI or fallback to recommendations
    const topIssue = aiSuggestions?.mainIssue || recommendations?.issues?.[0] || {
        aspect: 'thời gian giao hàng',
        description: 'Khách hàng thường phàn nàn về thời gian giao hàng',
        suggestion: 'Nên hợp tác với đơn vị vận chuyển nhanh hơn hoặc cung cấp nhiều tùy chọn giao hàng'
    };

    const topStrength = aiSuggestions?.topStrength || recommendations?.strengths?.[0] || {
        aspect: 'bao bì và chất lượng sản phẩm',
        description: 'Khách hàng rất hài lòng về bao bì và chất lượng sản phẩm'
    };

    const impacts = aiSuggestions?.impacts || recommendations?.predicted_impact || [
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

            {/* Controls Row - Only show when logged in */}
            {tokens?.access_token && (
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
            )}

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

            {/* Not Logged In State */}
            {!tokens?.access_token && !loading && (
                <div className="empty-state">
                    <div className="empty-icon">🔒</div>
                    <h3>Vui lòng đăng nhập để sử dụng tính năng này</h3>
                    <p>Bạn cần đăng nhập vào tài khoản Shopee để xem phân tích đánh giá khách hàng và insights từ AI</p>
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
                            marginTop: '16px'
                        }}
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            )}

            {!loading && !selectedProduct && tokens?.access_token && (
                <div style={{
                    background: 'linear-gradient(135deg, #0a58d0 0%, #0284c7 100%)',
                    borderRadius: '12px',
                    padding: '32px',
                    textAlign: 'center',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(10, 88, 208, 0.3)',
                    marginTop: '20px'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px 0' }}>
                        Chọn sản phẩm để bắt đầu phân tích đánh giá
                    </h3>
                    <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6', maxWidth: '500px', margin: '0 auto' }}>
                        Hệ thống sẽ phân tích cảm xúc khách hàng và đưa ra insights chi tiết cho sản phẩm bạn chọn
                    </p>
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
                <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '320px 1fr 300px', gap: '20px', maxWidth: '1400px', margin: '0 auto' }}>
                {/* Column 1: Aspect Analysis - Clean Blue */}
                <div className="grid-column">
                    <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#0a58d0' }}>📊</span> Phân tích theo tiêu chí
                        </h3>
                        <div className="aspect-analysis">
                            {Object.entries(aspectStats)
                                .filter(([_, data]) => (data.positive + data.neutral + data.negative) > 0)
                                .map(([aspect, data]) => {
                                const total = data.positive + data.neutral + data.negative;
                                const positiveP = (data.positive / total * 100).toFixed(0);
                                const neutralP = (data.neutral / total * 100).toFixed(0);
                                const negativeP = (data.negative / total * 100).toFixed(0);
                                
                                const aspectNames = {
                                    'Price': 'Giá cả',
                                    'Shipping': 'Vận chuyển',
                                    'Outlook': 'Ngoại quan',
                                    'Quality': 'Chất lượng',
                                    'Size': 'Kích thước',
                                    'Shop_Service': 'Dịch vụ',
                                    'General': 'Tổng quan',
                                    'Others': 'Khác'
                                };
                                
                                return (
                                    <div key={aspect} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{aspectNames[aspect]}</span>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{total}</span>
                                        </div>
                                        <div style={{ display: 'flex', height: '6px', borderRadius: '3px', overflow: 'hidden', background: '#f1f5f9' }}>
                                            {parseFloat(positiveP) > 0 && (
                                                <div style={{ width: `${positiveP}%`, background: '#10b981', transition: 'width 0.5s ease' }}></div>
                                            )}
                                            {parseFloat(neutralP) > 0 && (
                                                <div style={{ width: `${neutralP}%`, background: '#f59e0b', transition: 'width 0.5s ease' }}></div>
                                            )}
                                            {parseFloat(negativeP) > 0 && (
                                                <div style={{ width: `${negativeP}%`, background: '#ef4444', transition: 'width 0.5s ease' }}></div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
                                            <span>{positiveP}% tốt</span>
                                            <span>{neutralP}% TB</span>
                                            <span>{negativeP}% kém</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Summary */}
                        <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#334155' }}>Tổng quan</div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981', marginBottom: '2px' }}>{positivePercent}%</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Tích cực</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b', marginBottom: '2px' }}>{neutralPercent}%</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Trung lập</div>
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444', marginBottom: '2px' }}>{negativePercent}%</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>Tiêu cực</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: AI Insights - Minimalist */}
                <div className="grid-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>AI Insights</span>
                        {loadingAI && <span style={{ fontSize: '12px', color: '#94a3b8' }}>(Đang phân tích...)</span>}
                    </div>
                    
                    {/* Main Issue */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb', borderLeft: '4px solid #0a58d0' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#0a58d0' }}>Vấn đề cần xử lý</div>
                        <p style={{ fontSize: '13px', lineHeight: '1.6', marginBottom: '12px', color: '#475569' }}>
                            {topIssue.description || 'Khách hàng phàn nàn về'} <strong style={{ color: '#1e293b' }}>{topIssue.aspect}</strong>
                        </p>
                        <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #0a58d0' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#334155' }}>Gợi ý hành động</div>
                            <p style={{ fontSize: '12px', lineHeight: '1.5', margin: 0, color: '#64748b' }}>{topIssue.suggestion}</p>
                        </div>
                    </div>

                    {/* Why & Strength - Side by side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ background: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#0a58d0' }}>Tại sao quan trọng?</div>
                            <div style={{ fontSize: '12px', lineHeight: '1.6', color: '#64748b' }}>
                                <div style={{ marginBottom: '6px' }}>• Ảnh hưởng {Math.round((aspectStats[topIssue.aspect]?.negative || 0) / totalReviews * 100)}% KH</div>
                                <div style={{ marginBottom: '6px' }}>• Giảm rating sản phẩm</div>
                                <div>• Retention &lt; 70%</div>
                            </div>
                        </div>

                        <div style={{ background: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#0a58d0' }}>Điểm mạnh</div>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px 0', color: '#64748b' }}>
                                KH hài lòng về <strong style={{ color: '#1e293b' }}>{topStrength.aspect}</strong>
                            </p>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                                💡 Nhấn mạnh trong marketing
                            </div>
                        </div>
                    </div>

                    {/* Impact */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#0a58d0' }}>Tác động dự kiến</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {impacts.map((impact, idx) => (
                                <div key={idx} style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#334155', lineHeight: '1.4' }}>{impact}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Column 3: Stats & Actions */}
                <div className="grid-column" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Donut Chart */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#334155' }}>Thống kê</h3>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <svg viewBox="0 0 200 200" width="160" height="160">
                                <path d={calculateDonutPath(0, positivePercent)} fill="#10b981 " />
                                <path d={calculateDonutPath(positivePercent, neutralPercent)} fill="#f59e0b " />
                                <path d={calculateDonutPath(parseFloat(positivePercent) + parseFloat(neutralPercent), negativePercent)} fill="#ef4444 " />
                                <text x="100" y="100" textAnchor="middle" style={{ fontSize: '32px', fill: '#10b981 ', fontWeight: '700' }}>{positivePercent}%</text>
                                <text x="100" y="120" textAnchor="middle" style={{ fontSize: '12px', fill: '#64748b' }}>Tích cực</text>
                            </svg>
                        </div>
                    </div>

                    {/* Top Aspects */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#0a58d0' }}>Tốt nhất</div>
                        {Object.entries(aspectStats)
                            .filter(([_, data]) => (data.positive + data.neutral + data.negative) > 0)
                            .sort((a, b) => b[1].positive - a[1].positive)
                            .slice(0, 2)
                            .map(([aspect, data]) => {
                                const aspectNames = {
                                    'Price': 'Giá cả', 'Shipping': 'Vận chuyển', 'Outlook': 'Ngoại quan',
                                    'Quality': 'Chất lượng', 'Size': 'Size', 'Shop_Service': 'Dịch vụ',
                                    'General': 'Chung', 'Others': 'Khác'
                                };
                                return (
                                    <div key={aspect} style={{ fontSize: '12px', marginBottom: '6px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{aspectNames[aspect]}</span>
                                        <strong style={{ color: '#0a58d0' }}>{data.positive}</strong>
                                    </div>
                                );
                            })}
                    </div>

                    <div style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#64748b' }}>Cần cải thiện</div>
                        {Object.entries(aspectStats)
                            .filter(([_, data]) => (data.positive + data.neutral + data.negative) > 0)
                            .sort((a, b) => b[1].negative - a[1].negative)
                            .slice(0, 2)
                            .map(([aspect, data]) => {
                                const aspectNames = {
                                    'Price': 'Giá cả', 'Shipping': 'Vận chuyển', 'Outlook': 'Ngoại quan',
                                    'Quality': 'Chất lượng', 'Size': 'Size', 'Shop_Service': 'Dịch vụ',
                                    'General': 'Chung', 'Others': 'Khác'
                                };
                                return (
                                    <div key={aspect} style={{ fontSize: '12px', marginBottom: '6px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{aspectNames[aspect]}</span>
                                        <strong style={{ color: '#94a3b8' }}>{data.negative}</strong>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button style={{ 
                            width: '100%', 
                            padding: '10px', 
                            fontSize: '13px',
                            fontWeight: '600',
                            background: '#0a58d0',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#0847b0'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#0a58d0'}>
                            Xem chi tiết
                        </button>
                        {/* <button style={{ 
                            width: '100%', 
                            padding: '10px', 
                            fontSize: '13px',
                            fontWeight: '500',
                            background: 'white',
                            color: '#0a58d0',
                            border: '1px solid #0a58d0',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#0a58d0';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = '#0a58d0';
                        }}>
                            Xuất báo cáo
                        </button> */}
                    </div>
                </div>
            </div>
            )}

        </div>
    );
};

export default CustomerAnalysisPage;
