import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/dynamic-pricing/analyze
 * Analyze product pricing and generate AI recommendations
 */
router.post('/analyze', async (req, res) => {
    const { productName, currentPrice, category, sales, stock, competitorPrices, timeRange } = req.body;

    console.log('📊 [Dynamic Pricing] Analyzing pricing for:', productName);
    console.log('  - Current Price:', currentPrice);
    console.log('  - Competitor Prices:', competitorPrices);
    console.log('  - Sales:', sales);
    console.log('  - Stock:', stock);
    console.log('  - Time Range:', timeRange);

    // Validation
    if (!productName || !currentPrice) {
        return res.status(400).json({ 
            error: 'productName and currentPrice are required' 
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: 'GEMINI_API_KEY is not configured on the server.' 
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        // Build comprehensive prompt for Gemini
        const prompt = `Bạn là chuyên gia phân tích giá và chiến lược định giá thương mại điện tử. Hãy phân tích tình hình giá của sản phẩm sau và đưa ra khuyến nghị:

📦 THÔNG TIN SẢN PHẨM:
- Tên sản phẩm: ${productName}
- Danh mục: ${category || 'Không xác định'}
- Giá hiện tại: ${new Intl.NumberFormat('vi-VN').format(currentPrice)}đ
- Doanh số (${timeRange || '7 ngày'}): ${sales || 0} sản phẩm
- Tồn kho: ${stock || 0} sản phẩm

💰 GIÁ THỊ TRƯỜNG (ĐỐI THỦ):
- Giá trung bình: ${new Intl.NumberFormat('vi-VN').format(competitorPrices?.average || currentPrice * 0.98)}đ
- Giá thấp nhất: ${new Intl.NumberFormat('vi-VN').format(competitorPrices?.min || currentPrice * 0.90)}đ
- Giá cao nhất: ${new Intl.NumberFormat('vi-VN').format(competitorPrices?.max || currentPrice * 1.10)}đ

YÊU CẦU PHÂN TÍCH:
1. So sánh giá hiện tại với thị trường (đối thủ)
2. Đánh giá mức độ cạnh tranh (% so với giá trung bình)
3. Dự đoán tác động nếu điều chỉnh giá
4. Đề xuất mức giá tối ưu

Trả lời ĐÚNG định dạng JSON sau (không thêm markdown code blocks):
{
  "competitiveness": {
    "percentage": 106,
    "status": "Hơi cao",
    "description": "Giá hiện tại cao hơn 6% so với thị trường"
  },
  "priceComparison": {
    "currentPrice": ${currentPrice},
    "marketAverage": ${competitorPrices?.average || currentPrice * 0.98},
    "difference": ${currentPrice - (competitorPrices?.average || currentPrice * 0.98)},
    "differencePercent": ${Math.round(((currentPrice - (competitorPrices?.average || currentPrice * 0.98)) / (competitorPrices?.average || currentPrice * 0.98)) * 100)}
  },
  "recommendation": {
    "suggestedPrice": 12220000,
    "adjustmentPercent": -3,
    "reasoning": "Giảm 3% để tăng sức cạnh tranh",
    "expectedImpact": "Tăng 8% doanh số"
  },
  "insights": "Giá hiện tại cao hơn trung bình thị trường. Giảm nhẹ sẽ tăng doanh số mà vẫn giữ lợi nhuận tốt."
}

CHỈ TRẢ VỀ JSON, KHÔNG THÊM TEXT KHÁC.`;

        console.log('🤖 [Gemini] Sending pricing analysis request...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        console.log('📥 [Gemini] Raw response:', text.substring(0, 200));

        // Clean JSON response (remove markdown code blocks if present)
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse JSON
        let analysis;
        try {
            analysis = JSON.parse(text);
        } catch (parseError) {
            console.error('❌ [Gemini] JSON parse error:', parseError);
            // Fallback to default structure
            analysis = {
                competitiveness: {
                    percentage: Math.round((currentPrice / (competitorPrices?.average || currentPrice * 0.98)) * 100),
                    status: currentPrice > (competitorPrices?.average || currentPrice * 0.98) ? "Hơi cao" : "Cạnh tranh tốt",
                    description: `Giá hiện tại ${currentPrice > (competitorPrices?.average || currentPrice * 0.98) ? 'cao hơn' : 'thấp hơn'} so với thị trường`
                },
                priceComparison: {
                    currentPrice: currentPrice,
                    marketAverage: competitorPrices?.average || currentPrice * 0.98,
                    difference: currentPrice - (competitorPrices?.average || currentPrice * 0.98),
                    differencePercent: Math.round(((currentPrice - (competitorPrices?.average || currentPrice * 0.98)) / (competitorPrices?.average || currentPrice * 0.98)) * 100)
                },
                recommendation: {
                    suggestedPrice: Math.round(currentPrice * 0.97),
                    adjustmentPercent: -3,
                    reasoning: "Giảm nhẹ để tăng sức cạnh tranh",
                    expectedImpact: "Tăng 5-8% doanh số"
                },
                insights: text // Keep raw text as insights
            };
        }

        console.log('✅ [Dynamic Pricing] Analysis completed');
        res.json({
            success: true,
            productName,
            analysis
        });

    } catch (error) {
        console.error('❌ [Dynamic Pricing] Error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze pricing',
            details: error.message 
        });
    }
});

export default router;
