// Load env FIRST before anything else
import './config/env.js';

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import shopeeRoutes from './routes/shopee.js';
import aiRoutes from './routes/ai.js';
import customerAnalysisRoutes from './routes/customerAnalysis.js';
import { connectDB } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Debug
console.log('🔍 ENV loaded (server.js):');
console.log('  - USE_MOCK_MODE:', JSON.stringify(process.env.USE_MOCK_MODE));
console.log('  - PORT:', process.env.PORT);
console.log('  - FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('  - MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configured' : '❌ Not configured');
console.log('  - GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured');

// Connect DB 
let isDBConnected = false;
connectDB().then(connected => {
    isDBConnected = connected;
    if (connected) {
        console.log('✅ Database ready for AI chatbot');
    } else {
        console.warn('⚠️  AI chatbot features may not work without database');
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.get('/', (req, res) => {
    res.json({
        message: '🚀 E-Metric Hub Backend API',
        version: '1.0.0',
        mode: process.env.USE_MOCK_MODE === 'true' ? 'MOCK' : 'PRODUCTION',
        endpoints: {
            auth: '/api/auth',
            shopee: '/api/shopee',
            ai: '/api/ai',
            customerAnalysis: '/api/customer-analysis'
        }
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/shopee', shopeeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/customer-analysis', customerAnalysisRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 E-Metric Hub Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🎭 Mode: ${process.env.USE_MOCK_MODE === 'true' ? 'MOCK (Development)' : 'PRODUCTION (Real Shopee API)'}`);
    console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log('='.repeat(50));
});
