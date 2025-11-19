// Load env FIRST
import '../config/env.js';

import express from 'express';
import axios from 'axios';
import { mockShopeeAPI } from '../services/mockShopeeAPI.js';

const router = express.Router();
const USE_MOCK = process.env.USE_MOCK_MODE === 'true';

// Python API configuration
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8001';

/**
 * Helper: Call Python ABSA API
 */
async function callABSAAPI(reviews) {
    try {
        const response = await axios.post(`${PYTHON_API_URL}/predict`, {
            reviews,
            include_statistics: true
        }, {
            timeout: 120000, // 120 second timeout for large review batches
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('❌ ABSA API call error:', error.message);
        throw new Error(`Failed to analyze reviews: ${error.message}`);
    }
}

/**
 * Get product reviews with sentiment analysis
 * GET /api/customer-analysis/product/:productId/reviews
 */
router.get('/product/:productId/reviews', async (req, res) => {
    try {
        const { productId } = req.params;
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        // Get product details and reviews from Shopee
        let productData;
        if (USE_MOCK) {
            productData = await mockShopeeAPI.getProductReviews(productId);
        } else {
            // In real implementation, call Shopee API to get product reviews
            // For now, using mock data
            productData = await mockShopeeAPI.getProductReviews(productId);
        }

        // Extract review texts
        const reviewTexts = productData.reviews.map(r => r.comment);
        
        // Limit to first 50 reviews for testing (remove this limit in production)
        const limitedReviewTexts = reviewTexts.slice(0, 50);

        // Analyze sentiments using ABSA model
        let sentimentAnalysis = null;
        if (limitedReviewTexts.length > 0) {
            try {
                console.log(`📊 Calling ABSA API for ${limitedReviewTexts.length} reviews...`);
                sentimentAnalysis = await callABSAAPI(limitedReviewTexts);
                console.log('✅ ABSA API success:', sentimentAnalysis ? 'has data' : 'null');
            } catch (error) {
                console.error('❌ Sentiment analysis failed:', error.message);
                console.error('Error details:', error.response?.data || error.stack);
                // Continue without sentiment analysis if API fails
            }
        }

        // Combine product data with sentiment analysis
        const response = {
            product: productData.product,
            reviews: productData.reviews,
            sentiment_analysis: sentimentAnalysis,
            total_reviews: productData.reviews.length
        };

        res.json(response);
    } catch (error) {
        console.error('❌ Get product reviews error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Analyze specific reviews
 * POST /api/customer-analysis/analyze
 */
router.post('/analyze', async (req, res) => {
    try {
        const { reviews } = req.body;

        if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
            return res.status(400).json({ error: 'Reviews array is required' });
        }

        // Call ABSA API
        const analysis = await callABSAAPI(reviews);

        res.json(analysis);
    } catch (error) {
        console.error('❌ Analyze reviews error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get customer insights for a product
 * GET /api/customer-analysis/product/:productId/insights
 */
router.get('/product/:productId/insights', async (req, res) => {
    try {
        const { productId } = req.params;
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        // Get product reviews
        let productData;
        if (USE_MOCK) {
            productData = await mockShopeeAPI.getProductReviews(productId);
        } else {
            productData = await mockShopeeAPI.getProductReviews(productId);
        }

        const reviewTexts = productData.reviews.map(r => r.comment);

        // Get sentiment analysis
        let insights = {
            product: productData.product,
            total_reviews: reviewTexts.length,
            sentiment_summary: null,
            aspect_breakdown: null,
            keywords: null,
            recommendations: []
        };

        if (reviewTexts.length > 0) {
            try {
                const analysis = await callABSAAPI(reviewTexts);
                
                if (analysis && analysis.statistics) {
                    const stats = analysis.statistics;
                    
                    insights.sentiment_summary = stats.sentiment_distribution;
                    insights.aspect_breakdown = stats.aspect_statistics;
                    insights.keywords = stats.keywords;
                    
                    // Generate AI recommendations based on negative aspects
                    insights.recommendations = generateRecommendations(stats.aspect_statistics);
                }
            } catch (error) {
                console.error('Failed to get insights:', error);
            }
        }

        res.json(insights);
    } catch (error) {
        console.error('❌ Get insights error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get aggregated customer analysis for shop
 * GET /api/customer-analysis/shop/summary
 */
router.get('/shop/summary', async (req, res) => {
    try {
        const { access_token, shop_id } = req.query;

        if (!access_token || !shop_id) {
            return res.status(400).json({ error: 'Missing access_token or shop_id' });
        }

        // Get all products
        let products;
        if (USE_MOCK) {
            const productList = await mockShopeeAPI.getProductList(access_token, shop_id, { page_size: 10 });
            products = productList.response.item;
        } else {
            const productList = await mockShopeeAPI.getProductList(access_token, shop_id, { page_size: 10 });
            products = productList.response.item;
        }

        // Aggregate reviews from all products
        const allReviews = [];
        for (const product of products.slice(0, 5)) { // Limit to 5 products for performance
            const productData = await mockShopeeAPI.getProductReviews(product.item_id);
            allReviews.push(...productData.reviews.map(r => r.comment));
        }

        // Analyze all reviews
        let summary = {
            total_products: products.length,
            total_reviews: allReviews.length,
            sentiment_overview: null,
            top_aspects: null,
            overall_recommendations: []
        };

        if (allReviews.length > 0) {
            try {
                const analysis = await callABSAAPI(allReviews);
                
                if (analysis && analysis.statistics) {
                    summary.sentiment_overview = analysis.statistics.sentiment_distribution;
                    summary.top_aspects = analysis.statistics.aspect_statistics;
                    summary.overall_recommendations = generateShopRecommendations(
                        analysis.statistics.aspect_statistics,
                        analysis.statistics.sentiment_distribution
                    );
                }
            } catch (error) {
                console.error('Failed to get shop summary:', error);
            }
        }

        res.json(summary);
    } catch (error) {
        console.error('❌ Get shop summary error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Check ABSA API health
 * GET /api/customer-analysis/health
 */
router.get('/health', async (req, res) => {
    try {
        const response = await axios.get(`${PYTHON_API_URL}/health`, { timeout: 5000 });
        res.json({
            status: 'connected',
            python_api: response.data
        });
    } catch (error) {
        res.status(503).json({
            status: 'disconnected',
            error: error.message,
            python_api_url: PYTHON_API_URL
        });
    }
});

/**
 * Helper: Generate recommendations based on aspect statistics
 */
function generateRecommendations(aspectStats) {
    const recommendations = [];
    
    for (const [aspect, sentiments] of Object.entries(aspectStats)) {
        const total = sentiments.positive + sentiments.neutral + sentiments.negative;
        const negativeRatio = sentiments.negative / total;
        
        if (negativeRatio > 0.3) { // More than 30% negative
            recommendations.push({
                aspect,
                severity: negativeRatio > 0.5 ? 'high' : 'medium',
                message: getRecommendationMessage(aspect, negativeRatio),
                action_items: getActionItems(aspect)
            });
        }
    }
    
    return recommendations.sort((a, b) => 
        (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0)
    );
}

/**
 * Helper: Get recommendation message for aspect
 */
function getRecommendationMessage(aspect, ratio) {
    const percentage = Math.round(ratio * 100);
    const messages = {
        'Price': `${percentage}% đánh giá tiêu cực về giá. Xem xét điều chỉnh giá hoặc tăng giá trị sản phẩm.`,
        'Shipping': `${percentage}% phản hồi tiêu cực về vận chuyển. Cải thiện quy trình đóng gói và giao hàng.`,
        'Outlook': `${percentage}% không hài lòng về ngoại quan. Cải thiện hình ảnh sản phẩm và mô tả.`,
        'Quality': `${percentage}% phàn nàn về chất lượng. Kiểm tra quy trình sản xuất và QC.`,
        'Size': `${percentage}% vấn đề về kích thước. Cập nhật bảng size chi tiết hơn.`,
        'Shop_Service': `${percentage}% không hài lòng về dịch vụ. Đào tạo nhân viên CSKH.`,
        'General': `${percentage}% đánh giá chung tiêu cực. Cần cải thiện tổng thể.`,
        'Others': `${percentage}% phản hồi tiêu cực khác. Xem xét chi tiết feedback.`
    };
    
    return messages[aspect] || `Cải thiện khía cạnh ${aspect}`;
}

/**
 * Helper: Get action items for aspect
 */
function getActionItems(aspect) {
    const actions = {
        'Price': ['Phân tích giá đối thủ', 'Tạo chương trình khuyến mãi', 'Bundle sản phẩm'],
        'Shipping': ['Hợp tác với đơn vị vận chuyển tốt hơn', 'Cải thiện đóng gói', 'Tracking realtime'],
        'Outlook': ['Chụp ảnh sản phẩm chuyên nghiệp', 'Video unboxing', 'Mô tả chi tiết hơn'],
        'Quality': ['Kiểm tra nhà cung cấp', 'Tăng cường QC', 'Chính sách đổi trả rõ ràng'],
        'Size': ['Cập nhật bảng size', 'Thêm video hướng dẫn chọn size', 'So sánh với size thực tế'],
        'Shop_Service': ['Đào tạo CSKH', 'Giảm thời gian phản hồi', 'Chatbot tự động'],
        'General': ['Khảo sát khách hàng', 'Cải thiện overall experience', 'Review quy trình'],
        'Others': ['Phân tích chi tiết feedback', 'Thu thập thêm dữ liệu', 'A/B testing']
    };
    
    return actions[aspect] || ['Xem xét và cải thiện'];
}

/**
 * Helper: Generate shop-level recommendations
 */
function generateShopRecommendations(aspectStats, sentimentDist) {
    const recommendations = [];
    
    // Overall sentiment health
    const totalSentiments = Object.values(sentimentDist).reduce((a, b) => a + b, 0);
    const negativeRatio = sentimentDist.negative / totalSentiments;
    
    if (negativeRatio > 0.3) {
        recommendations.push({
            priority: 'high',
            title: 'Tỷ lệ đánh giá tiêu cực cao',
            description: `${Math.round(negativeRatio * 100)}% đánh giá tiêu cực. Cần hành động ngay.`,
            actions: ['Xem xét toàn bộ quy trình', 'Liên hệ khách hàng không hài lòng', 'Cải thiện sản phẩm/dịch vụ']
        });
    }
    
    // Aspect-specific recommendations
    const aspectRecs = generateRecommendations(aspectStats);
    recommendations.push(...aspectRecs.map(rec => ({
        priority: rec.severity,
        title: `Cải thiện ${rec.aspect}`,
        description: rec.message,
        actions: rec.action_items
    })));
    
    return recommendations;
}

export default router;
