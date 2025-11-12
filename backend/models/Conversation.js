import mongoose from 'mongoose';

// ============================================
// MESSAGE SCHEMA (SubSchema)
// ============================================
const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// ============================================
// CONVERSATION SCHEMA
// ============================================
const conversationSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous',
    index: true
  },
  title: {
    type: String,  // ← Fix typo: "ype" → "type"
    default: 'Cuộc trò chuyện mới',
    maxlength: 200
  },
  messages: [messageSchema],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  messageCount: {
    type: Number,
    default: 0
  }
});

// ============================================
// MIDDLEWARE
// ============================================

// Pre-save: Tự động update metadata
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.messageCount = this.messages.length;
  
  // Auto-generate title từ first user message nếu còn là default
  if (this.title === 'Cuộc trò chuyện mới' && this.messages.length > 0) {
    const firstUserMsg = this.messages.find(m => m.sender === 'user');
    if (firstUserMsg) {
      this.title = firstUserMsg.text.substring(0, 50) + 
                   (firstUserMsg.text.length > 50 ? '...' : '');
    }
  }
  
  next();
});

// Post-save: Log (optional, để debug)
conversationSchema.post('save', function(doc) {
  console.log('✅ Conversation saved:', doc.conversationId, `(${doc.messageCount} messages)`);
});

// ============================================
// VIRTUAL PROPERTIES
// ============================================

// Virtual: Lấy tin nhắn cuối cùng
conversationSchema.virtual('lastMessage').get(function() {
  if (this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Virtual: Lấy preview text (50 chars của last message)
conversationSchema.virtual('preview').get(function() {
  const last = this.lastMessage;
  if (!last) return '';
  return last.text.substring(0, 50) + (last.text.length > 50 ? '...' : '');
});

// ============================================
// INSTANCE METHODS
// ============================================

// Method: Thêm message mới
conversationSchema.methods.addMessage = function(sender, text) {
  this.messages.push({ sender, text });
  return this.save();
};

// Method: Kiểm tra có messages không
conversationSchema.methods.hasMessages = function() {
  return this.messages.length > 0;
};

// Method: Lấy N messages gần nhất
conversationSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Method: Clear messages
conversationSchema.methods.clearMessages = function() {
  this.messages = [];
  return this.save();
};

// Method: Convert messages sang format Gemini
conversationSchema.methods.toGeminiHistory = function() {
  return this.messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));
};

// ============================================
// STATIC METHODS
// ============================================

// Static: Tìm hoặc tạo conversation
conversationSchema.statics.findOrCreate = async function(conversationId, userId = 'anonymous') {
  let conv = await this.findOne({ conversationId });
  
  if (!conv) {
    conv = new this({
      conversationId,
      userId,
      messages: []
    });
    await conv.save();
    console.log('📝 Created new conversation:', conversationId);
  } else {
    console.log('📚 Found existing conversation:', conversationId, `(${conv.messages.length} messages)`);
  }
  
  return conv;
};

// Static: Lấy conversations của user
conversationSchema.statics.findByUserId = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .exec();
};

// Static: Xóa conversations cũ không active
conversationSchema.statics.deleteInactive = async function(days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  const result = await this.deleteMany({
    updatedAt: { $lt: cutoffDate },
    messageCount: 0  // Chỉ xóa conversations rỗng
  });
  
  console.log(`🗑️  Deleted ${result.deletedCount} inactive conversations`);
  return result.deletedCount;
};

// Static: Thống kê
conversationSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const withMessages = await this.countDocuments({ messageCount: { $gt: 0 } });
  const activeLastWeek = await this.countDocuments({
    updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  });
  
  return {
    total,
    withMessages,
    empty: total - withMessages,
    activeLastWeek
  };
};


// Query helper: Chỉ lấy conversations có messages
conversationSchema.query.withMessages = function() {
  return this.where('messageCount').gt(0);
};

// Query helper: Chỉ lấy conversations active trong N ngày
conversationSchema.query.activeSince = function(days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  return this.where('updatedAt').gte(cutoffDate);
};

// CONFIGURATION

// Đảm bảo virtuals được include khi convert sang JSON
conversationSchema.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;  // Xóa version key
    return ret;
  }
});

conversationSchema.set('toObject', { virtuals: true });

// EXPORT MODEL
const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
