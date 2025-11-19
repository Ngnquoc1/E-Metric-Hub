import { pipeline } from '@xenova/transformers';
import { MOCK_SHOP, MOCK_PRODUCTS, MOCK_ORDERS, CATEGORIES } from '../mockData/shopeeData.js';
import { getShopSpecificData } from '../utils/ragUtils.js'; // Utility for RAG filtering

class RAGService {
    constructor() {
        this.embedder = null;
        this.documents = [];
        this.embeddings = [];
        this.initialized = false;
        this.embeddingModel = 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'; 
    }
    /**
     * Initialize RAG service
     */
    async initialize() {
        if (this.initialized) return;

        console.log('Initializing RAG service...');
        
        // 1. Create documents from mock data
        this.documents = this.createDocumentsFromMockData();
        console.log(`Created ${this.documents.length} documents (including individual orders)`);
        
        // 2. Initialize embedding model
        try {
            console.log(`Loading embedding model: ${this.embeddingModel}...`);
            this.embedder = await pipeline('feature-extraction', this.embeddingModel, {
                quantized: true,
            });
            console.log('Embedding model loaded');
            
            // 3. Generate embeddings
            console.log('Generating embeddings for documents...');
            await this.generateEmbeddings();
            console.log(`Generated ${this.embeddings.length} embeddings`);
        } catch (error) {
            console.error('Failed to load embedding model:', error.message);
            console.log('System will operate in Keyword-Search only mode');
            this.embedder = null;
        }
        
        this.initialized = true;
    }

    /**
     * Create searchable documents from mock data
     * CẢI TIẾN: Thêm chi tiết từng đơn hàng
     */
    createDocumentsFromMockData() {
        const docs = [];
        
        // --- A. Shop Information ---
        if (MOCK_SHOP) {
            const shopText = `
THÔNG TIN CỬA HÀNG (SHOP INFO)
Tên Shop: ${MOCK_SHOP.shop_name || ''}
Mô tả: ${MOCK_SHOP.description || ''}
Đánh giá: ${MOCK_SHOP.rating_star || 0}/5
Số người theo dõi: ${MOCK_SHOP.follower_count || 0}
Vị trí: ${MOCK_SHOP.shop_location || ''}
Tỷ lệ phản hồi: ${MOCK_SHOP.response_rate || 0}%
`.trim();
            
            docs.push({
                text: shopText,
                type: 'shop_info',
                metadata: { ...MOCK_SHOP, shop_id: MOCK_SHOP.shop_id }
            });
        }
        
        // --- B. Products Summary & Details ---
        if (MOCK_PRODUCTS && MOCK_PRODUCTS.length > 0) {
            // 1. Product Summary (Tổng quan)
            const totalProducts = MOCK_PRODUCTS.length;
            const topSelling = [...MOCK_PRODUCTS]
                .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                .slice(0, 5)
                .map((p, i) => `${i + 1}. ${p.item_name} (Bán: ${p.sales})`)
                .join('\n');

            docs.push({
                text: `TỔNG QUAN SẢN PHẨM:\n- Tổng số sản phẩm: ${totalProducts}\n- Top bán chạy:\n${topSelling}`,
                type: 'product_summary',
                metadata: { total: totalProducts, shop_id: MOCK_SHOP?.shop_id }
            });

            // 2. Individual Products (Chi tiết từng sản phẩm)
            MOCK_PRODUCTS.forEach(product => {
                const productText = `
CHI TIẾT SẢN PHẨM
Tên: ${product.item_name}
Mã SKU: ${product.item_sku}
Danh mục: ${product.category_name}
Giá bán: ${(product.price_info?.current_price || 0).toLocaleString('vi-VN')} VND
Tồn kho: ${product.stock_info?.current_stock || 0}
Đã bán: ${product.sales || 0}
Đánh giá: ${product.rating_star || 0}/5
`.trim();
                
                docs.push({
                    text: productText,
                    type: 'product_detail',
                    metadata: { 
                        id: product.item_id, 
                        name: product.item_name,
                        price: product.price_info?.current_price,
                        shop_id: MOCK_SHOP?.shop_id
                    }
                });
            });
        }
        
        // --- C. Orders (CẢI TIẾN QUAN TRỌNG NHẤT) ---
        if (MOCK_ORDERS && MOCK_ORDERS.length > 0) {
            // 1. Orders Summary (Tổng quan đơn hàng)
            const completed = MOCK_ORDERS.filter(o => o.order_status === 'COMPLETED');
            const revenue = completed.reduce((sum, o) => sum + (o.total_amount || 0), 0);
            
            docs.push({
                text: `THỐNG KÊ ĐƠN HÀNG:\nTổng số đơn: ${MOCK_ORDERS.length}\nĐã hoàn thành: ${completed.length}\nDoanh thu tổng: ${revenue.toLocaleString('vi-VN')} VND`,
                type: 'orders_summary',
                metadata: { count: MOCK_ORDERS.length, revenue, shop_id: MOCK_SHOP?.shop_id }
            });

            // 2. Individual Orders (Chi tiết từng đơn hàng)
            MOCK_ORDERS.forEach(order => {
                const dateStr = new Date(order.create_time * 1000).toLocaleDateString('vi-VN');
                const itemList = order.item_list.map(i => `- ${i.item_name} (x${i.model_quantity_purchased})`).join('\n');
                
                const orderText = `
CHI TIẾT ĐƠN HÀNG
Mã đơn hàng: ${order.order_sn}
Khách hàng: ${order.recipient_address.name}
Số điện thoại: ${order.recipient_address.phone}
Địa chỉ: ${order.recipient_address.full_address}
Trạng thái: ${order.order_status}
Ngày đặt: ${dateStr}
Tổng tiền: ${order.total_amount.toLocaleString('vi-VN')} VND
Sản phẩm:
${itemList}
`.trim();

                docs.push({
                    text: orderText,
                    type: 'order_detail',
                    metadata: {
                        sn: order.order_sn,
                        buyer: order.buyer_username,
                        status: order.order_status,
                        shop_id: MOCK_SHOP?.shop_id
                    }
                });
            });
        }
        
        return docs;
    }

    /**
     * Generate embeddings in batches
     */
    async generateEmbeddings() {
        if (!this.embedder) throw new Error('Embedding model not initialized');
        this.embeddings = [];
        
        const batchSize = 10; // Process 10 docs at a time
        const texts = this.documents.map(doc => doc.text);
        
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            try {
                const output = await this.embedder(batch, { pooling: 'mean', normalize: true });
                
                // Handle Xenova output format (Tensor or Array)
                let batchEmbeddings = output.tolist ? output.tolist() : output;
                if (!Array.isArray(batchEmbeddings)) batchEmbeddings = [batchEmbeddings];
                if (!Array.isArray(batchEmbeddings[0])) batchEmbeddings = [batchEmbeddings]; // Ensure 2D array

                this.embeddings.push(...batchEmbeddings);
            } catch (err) {
                console.error(`Error embedding batch ${i}:`, err);
                // Push empty embeddings to maintain index alignment
                batch.forEach(() => this.embeddings.push([]));
            }
        }
    }

    /**
     * Cosine Similarity calculation
     */
    cosineSimilarity(vecA, vecB) {
        if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) return 0;
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < vecA.length; i++) {
            dot += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Keyword Search (Exact match boost)
     */
    keywordSearch(query, limit = 10, allowedIndices = null) {
        const queryLower = query.toLowerCase().trim();
        const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
        
        const scores = this.documents.map((doc, index) => {
            const docLower = doc.text.toLowerCase();
            let score = 0;
            
            // 1. Exact phrase match (High priority)
            if (docLower.includes(queryLower)) score += 10;
            
            // 2. Keyword match
            queryWords.forEach(word => {
                if (docLower.includes(word)) score += 1;
            });

            return { index, score, doc, type: 'keyword' };
        });
        
        return scores
            .filter(s => s.score > 0)
            .filter(s => !Array.isArray(allowedIndices) || allowedIndices.includes(s.index))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * Semantic Search (Vector match)
     */
    async semanticSearch(query, limit = 10, allowedIndices = null) {
        if (!this.embedder || this.embeddings.length === 0) return [];

        const output = await this.embedder(query, { pooling: 'mean', normalize: true });
        const queryEmbedding = output.tolist ? output.tolist()[0] : output.flat();

        const similarities = this.embeddings.map((emb, index) => ({
            index,
            score: this.cosineSimilarity(queryEmbedding, emb),
            doc: this.documents[index],
            type: 'semantic'
        }));

        return similarities
            .filter(s => s.score > 0.25) // Filter irrelevant results
            .filter(s => !Array.isArray(allowedIndices) || allowedIndices.includes(s.index))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    /**
     * HYBRID SEARCH: Combine Semantic + Keyword
     * CẢI TIẾN: Kết hợp cả 2 phương pháp để lấy kết quả tốt nhất
     */
    async retrieveContext(query, topK = 5, shopId = null) {
        if (!this.initialized) await this.initialize();

        console.log(`Retrieving context for: "${query}" (Top ${topK})`);

        // Determine allowed indices based on shopId (only include docs whose metadata.shop_id matches)
        let allowedIndices = null;
        if (shopId) {
            allowedIndices = this.documents.reduce((arr, doc, idx) => {
                if (doc.metadata && (doc.metadata.shop_id == shopId || doc.metadata.shop_id === Number(shopId))) arr.push(idx);
                return arr;
            }, []);
            console.log(`RAG allowedIndices for shop ${shopId}:`, allowedIndices.length);
            // If no allowed docs, return empty
            if (allowedIndices.length === 0) return [];
        }

        // 1. Run both searches in parallel (scoped by allowedIndices)
        const [semanticResults, keywordResults] = await Promise.all([
            this.embedder ? this.semanticSearch(query, topK * 2, allowedIndices) : [],
            Promise.resolve(this.keywordSearch(query, topK * 2, allowedIndices))
        ]);

        // 2. Combine results using a Map to handle duplicates
        const combinedMap = new Map();

        // Helper to add/update results
        const addResult = (item, weight) => {
            const existing = combinedMap.get(item.index);
            if (existing) {
                existing.finalScore += item.score * weight;
                existing.methods.push(item.type);
            } else {
                combinedMap.set(item.index, {
                    ...item,
                    finalScore: item.score * weight,
                    methods: [item.type]
                });
            }
        };

        // Add Keyword results (Weight 1.0 for simple score, but higher base values)
        // Keyword scores are integers (e.g., 10, 11), semantic are 0.0-1.0
        // We normalize slightly or prioritize keyword for exact ID matches
        keywordResults.forEach(item => addResult(item, 0.15)); // Scale down int scores slightly

        // Add Semantic results (Weight 1.0)
        semanticResults.forEach(item => addResult(item, 1.0));

        // 3. Convert back to array and sort
        const finalResults = Array.from(combinedMap.values())
            .sort((a, b) => b.finalScore - a.finalScore)
            .slice(0, topK);

        console.log(`Hybrid search found ${finalResults.length} docs. Top methods: ${finalResults.map(r => r.methods.join('+')).join(', ')}`);

        return finalResults.map(r => ({
            text: r.doc.text,
            type: r.doc.type,
            metadata: r.doc.metadata,
            score: r.finalScore
        }));
    }

    /**
     * Format context for LLM
     */
    formatContextForPrompt(retrievedDocs) {
        if (!retrievedDocs || retrievedDocs.length === 0) return '';

        const contextParts = ['=== DỮ LIỆU HỆ THỐNG E-METRIC-HUB (THAM KHẢO) ==='];
        retrievedDocs.forEach((doc, index) => {
            contextParts.push(`\n[Tài liệu ${index + 1}] (Độ phù hợp: ${doc.score.toFixed(2)})`);
            contextParts.push(doc.text);
        });
        contextParts.push('\n=== KẾT THÚC DỮ LIỆU ===\n');
        return contextParts.join('\n');
    }

    /**
     * Perform RAG query for a specific shop
     */
    async performRAG(query, user) {
        const shopId = user.shopId; // Extract shop_id from the logged-in user

        if (!shopId) {
            throw new Error('Shop ID is missing. Cannot perform RAG.');
        }

        // Retrieve data specific to the shop
        const ragResults = await getShopSpecificData(query, shopId);

        return ragResults;
    }
}

export const ragService = new RAGService();