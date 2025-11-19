import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Conversation from '../models/Conversation.js';

const router = express.Router();


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Test endpoint to check Gemini connection
router.get('/test', async (req, res) => {
    
    if (!process.env.GEMINI_API_KEY ) {
        return res.status(500).json({ 
            success: false,
            error: 'GEMINI_API_KEY not configured',
            keyExists: !!process.env.GEMINI_API_KEY,
            keyLength: process.env.GEMINI_API_KEY?.length || 0
        });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
        const result = await model.generateContent('Say "Hello, API is working!" in Vietnamese');
        const response = await result.response;
        const text = response.text();
        
        console.log('✅ Gemini API test successful');
        res.json({ 
            success: true, 
            message: 'Gemini API connection successful',
            testResponse: text,
            model: 'gemini-2.0-flash-lite'
        });
    } catch (error) {
        console.error('❌ Gemini API test failed:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            name: error.name,
            status: error.status
        });
    }
});

router.post('/chat', async (req, res) => {
    const { prompt, conversationId, userId } = req.body;

    console.log('📨 Received chat request:');
    console.log('  - Prompt:', prompt?.substring(0, 50) + '...');
    console.log('  - Conversation ID:', conversationId);
    console.log('  - User ID:', userId || 'anonymous');

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({ error: 'Prompt is required and must be a non-empty string' });
    }

    if (!conversationId || typeof conversationId !== 'string') {
        return res.status(400).json({ error: 'conversationId is required and must be a string' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: 'GEMINI_API_KEY is not configured on the server.' 
        });
    }

    try {
        console.log('🚀 Initializing Gemini model: gemini-2.0-flash-lite');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

        // BƯỚC 1: Tìm hoặc tạo conversation trong DB
        console.log('🔍 Finding or creating conversation in database...');
        const conv = await Conversation.findOrCreate(conversationId, userId || 'anonymous');

        if (!conv) {
            throw new Error('Failed to create or find conversation in database');
        }

        // BƯỚC 2: Convert messages từ DB sang format Gemini
        console.log('🔄 Converting conversation history to Gemini format...');
        const historyForGemini = conv.toGeminiHistory();
        console.log('  - History length:', historyForGemini.length, 'messages');

        // BƯỚC 3: Gọi Gemini API với history
        console.log('💬 Starting chat session with Gemini...');
        const chat = model.startChat({
            history: historyForGemini,
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        console.log('📤 Sending message to Gemini...');
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Received response from Gemini');
        console.log('  - Response length:', text.length);

        // BƯỚC 4: Lưu user message và AI response vào DB
        console.log('💾 Saving messages to database...');
        await conv.addMessage('user', prompt);
        await conv.addMessage('ai', text);
        console.log('✅ Messages saved successfully');

        // BƯỚC 5: Trả về response
        res.json({ 
            reply: text,
            conversationId: conv.conversationId,
            messageCount: conv.messageCount
        });

    } catch (error) {
        console.error('❌ Error in chat endpoint:');
        console.error('  - Error name:', error.name);
        console.error('  - Error message:', error.message);
        console.error('  - Error status:', error.status);
        console.error('  - Stack:', error.stack);
        
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message 
        });
    }
});

// GET /conversations - Lấy danh sách conversations của user
router.get('/conversations', async (req, res) => {
    const { userId } = req.query;

    console.log('📋 Fetching conversations for user:', userId || 'anonymous');

    try {
        // findByUserId đã có .sort() và .limit() trong static method
        const conversations = await Conversation.findByUserId(userId || 'anonymous', 50);

        console.log('✅ Found', conversations.length, 'conversations');

        res.json({ 
            conversations: conversations.map(conv => ({
                conversationId: conv.conversationId,
                title: conv.title,
                messageCount: conv.messageCount,
                lastUpdated: conv.updatedAt
            }))
        });

    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        res.status(500).json({ 
            error: 'Failed to fetch conversations',
            details: error.message 
        });
    }
});

// GET /conversations/:id - Lấy chi tiết một conversation
router.get('/conversations/:id', async (req, res) => {
    const { id } = req.params;

    console.log('📖 Fetching conversation:', id);

    try {
        const conversation = await Conversation.findOne({ conversationId: id });

        if (!conversation) {
            console.log('❌ Conversation not found:', id);
            return res.status(404).json({ 
                error: 'Conversation not found' 
            });
        }

        console.log('✅ Found conversation with', conversation.messages.length, 'messages');

        res.json({ 
            conversation: {
                conversationId: conversation.conversationId,
                title: conversation.title,
                messages: conversation.messages.map(msg => ({
                    sender: msg.sender,
                    text: msg.text,
                    timestamp: msg.timestamp
                })),
                messageCount: conversation.messageCount,
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt
            }
        });

    } catch (error) {
        console.error('❌ Error fetching conversation:', error);
        res.status(500).json({ 
            error: 'Failed to fetch conversation',
            details: error.message 
        });
    }
});
//Post /simple-prompt - Lấy dự đoán cho từng sản phẩm
router.post('/simple-prompt', async (req, res) => {
    // Chỉ lấy prompt từ body request
    const { prompt } = req.body;

    console.log('📨 Received simple prompt request:');
    console.log('  - Prompt:', prompt?.substring(0, 50) + '...');

    // --- 1. Kiểm tra đầu vào ---
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ 
            error: 'GEMINI_API_KEY is not configured on the server.' 
        });
    }

    try {
        // --- 2. Khởi tạo và Cấu hình Model ---
        console.log('🚀 Initializing Gemini model: gemini-2.0-flash-exp');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Cấu hình chỉ số output (Tùy chọn)
        const generationConfig = {
            maxOutputTokens: 2000, // Tăng lên 2000 token cho các phản hồi dài hơn
        };

        // --- 3. Gọi Gemini API ---
        console.log('📤 Sending message to Gemini...');
        // Sử dụng model.generateContent thay vì model.startChat
        // vì ta không cần quản lý lịch sử (history)
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: generationConfig
        });

        const response = await result.response;
        const text = response.text();

        console.log('✅ Received response from Gemini');
        console.log('  - Response length:', text.length);

        // --- 4. Trả về response ---
        res.json({ 
            reply: text,
        });

    } catch (error) {
        console.error('❌ Error in simple-prompt endpoint:');
        console.error('  - Error message:', error.message);
        
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message 
        });
    }
});

// DELETE /conversations/:id - Xóa một conversation
router.delete('/conversations/:id', async (req, res) => {
    const { id } = req.params;

    console.log('🗑️  Deleting conversation:', id);

    try {
        const result = await Conversation.deleteOne({ conversationId: id });

        if (result.deletedCount === 0) {
            console.log('❌ Conversation not found:', id);
            return res.status(404).json({ 
                error: 'Conversation not found' 
            });
        }

        console.log('✅ Conversation deleted successfully');

        res.json({ 
            success: true,
            message: 'Conversation deleted successfully' 
        });

    } catch (error) {
        console.error('❌ Error deleting conversation:', error);
        res.status(500).json({ 
            error: 'Failed to delete conversation',
            details: error.message 
        });
    }
});

export default router;
