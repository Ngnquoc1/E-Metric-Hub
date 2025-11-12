import React, { useState, useEffect, useRef } from 'react';
import { Layout, Input, Button, Spin, Avatar, Typography, Card, Space, message } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, BulbOutlined, ThunderboltOutlined, StarOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import ConversationHistory from './ConversationHistory';
import './AIAssistantPage.css';

const { Sider, Content } = Layout;
const { Title, Paragraph } = Typography;

const AIAssistantPage = () => {
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const messagesEndRef = useRef(null);
    
    // TODO: Get userId from Redux/Auth context
    const userId = localStorage.getItem('userId') || 'demo-user';

    const activeConversation = conversations.find(c => c.conversationId === activeConvId);

    // Suggested prompts for welcome screen
    const suggestedPrompts = [
        { icon: <BulbOutlined />, text: "Giải thích cách phân tích dữ liệu bán hàng", color: "#1890ff" },
        { icon: <ThunderboltOutlined />, text: "Làm thế nào để tối ưu hóa dashboard?", color: "#52c41a" },
        { icon: <StarOutlined />, text: "Tạo báo cáo chi tiết về doanh thu", color: "#faad14" },
        { icon: <RobotOutlined />, text: "Hướng dẫn tích hợp API Shopee", color: "#eb2f96" },
    ];

    useEffect(() => {
        // Load conversations from API
        const fetchConversations = async () => {
            try {
                setIsLoadingConversations(true);
                const response = await axios.get('/api/ai/conversations', {
                    params: { userId }
                });
                
                const apiConversations = response.data.conversations || [];
                setConversations(apiConversations);
                
                if (apiConversations.length > 0) {
                    setActiveConvId(apiConversations[0].conversationId);
                } else {
                    // Create first conversation automatically
                    handleNewChat();
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
                message.error('Không thể tải lịch sử trò chuyện');
                // Create new conversation as fallback
                handleNewChat();
            } finally {
                setIsLoadingConversations(false);
            }
        };
        
        fetchConversations();
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the message list
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversation?.messages]);

    const handleNewChat = () => {
        const newId = uuidv4();
        const newConversation = {
            conversationId: newId,
            title: `Cuộc trò chuyện ${conversations.length + 1}`,
            messages: [],
            userId: userId,
        };
        setConversations([newConversation, ...conversations]);
        setActiveConvId(newId);
    };

    const handleSelectConversation = (id) => {
        setActiveConvId(id);
    };

    const handleSendMessage = async (messageText) => {
        // If messageText is provided, use it. Otherwise, use currentMessage
        const textToSend = (typeof messageText === 'string' ? messageText : currentMessage).trim();
        
        if (!textToSend || !activeConvId) return;

        const userMessage = { sender: 'user', text: textToSend, timestamp: new Date() };

        // 1. Add user's message to the conversation (optimistic update)
        setConversations(prevConvs =>
            prevConvs.map(conv =>
                conv.conversationId === activeConvId
                    ? { ...conv, messages: [...conv.messages, userMessage] }
                    : conv
            )
        );

        setCurrentMessage('');
        setIsLoading(true);
        setIsTyping(true);

        try {
            // 2. Send request to backend (backend will save to MongoDB)
            const response = await axios.post('/api/ai/chat', {
                prompt: textToSend,
                conversationId: activeConvId,
                userId: userId
            });

            // Simulate typing delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));

            const aiMessage = { sender: 'ai', text: response.data.reply, timestamp: new Date() };

            // 3. Add AI's response to the conversation (optimistic update)
            // Backend already saved both messages, this is just for immediate UI feedback
            setConversations(prevConvs =>
                prevConvs.map(conv =>
                    conv.conversationId === activeConvId
                        ? { 
                            ...conv, 
                            messages: [...conv.messages, aiMessage],
                            messageCount: response.data.messageCount,
                            updatedAt: new Date()
                        }
                        : conv
                )
            );

        } catch (error) {
            console.error('Error communicating with AI:', error);
            message.error('Không thể gửi tin nhắn. Vui lòng thử lại.');
            
            const errorMessage = { sender: 'ai', text: '❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.', timestamp: new Date() };
            
            // 4. Add error message to the conversation
            setConversations(prevConvs =>
                prevConvs.map(conv =>
                    conv.conversationId === activeConvId
                        ? { ...conv, messages: [...conv.messages, errorMessage] }
                        : conv
                )
            );
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handlePromptClick = (promptText) => {
        handleSendMessage(promptText);
    };

    return (
        <Layout className="ai-assistant-page">
            <Sider width={250} className="ai-sider">
                <ConversationHistory
                    conversations={conversations}
                    activeConvId={activeConvId}
                    onSelect={handleSelectConversation}
                    onNewChat={handleNewChat}
                />
            </Sider>
            <Layout className="chat-layout">
                <Content className="chat-content">
                    {isLoadingConversations ? (
                        // Loading state
                        <div className="welcome-screen">
                            <div className="welcome-content">
                                <Spin size="large" tip="Đang tải lịch sử trò chuyện..." />
                            </div>
                        </div>
                    ) : !activeConversation?.messages || activeConversation.messages.length === 0 ? (
                        // Welcome Screen
                        <div className="welcome-screen">
                            <div className="welcome-content">
                                <div className="ai-avatar-large">
                                    <RobotOutlined />
                                </div>
                                <Title level={2} className="welcome-title">
                                    Chào mừng đến với AI Assistant 🚀
                                </Title>
                                <Paragraph className="welcome-description">
                                    Tôi là trợ lý AI thông minh của E-Metric Hub. Tôi có thể giúp bạn:
                                </Paragraph>
                                <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 600 }}>
                                    <div className="feature-list">
                                        <div className="feature-item">✨ Phân tích dữ liệu bán hàng</div>
                                        <div className="feature-item">📊 Tạo báo cáo chi tiết</div>
                                        <div className="feature-item">💡 Đưa ra gợi ý tối ưu hóa</div>
                                        <div className="feature-item">🔧 Hỗ trợ kỹ thuật và API</div>
                                    </div>
                                </Space>
                                <Paragraph className="welcome-prompt">
                                    Bắt đầu cuộc trò chuyện bằng cách chọn một gợi ý hoặc nhập câu hỏi của bạn:
                                </Paragraph>
                                <div className="suggested-prompts">
                                    {suggestedPrompts.map((prompt, index) => (
                                        <Card
                                            key={index}
                                            className="prompt-card"
                                            hoverable
                                            onClick={() => handlePromptClick(prompt.text)}
                                            style={{ borderLeft: `4px solid ${prompt.color}` }}
                                        >
                                            <Space>
                                                <span style={{ color: prompt.color, fontSize: '20px' }}>
                                                    {prompt.icon}
                                                </span>
                                                <span>{prompt.text}</span>
                                            </Space>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Chat Messages
                        <div className="messages-list">
                            {activeConversation.messages.map((msg, index) => (
                                <div key={index} className={`message-item ${msg.sender}`}>
                                    <Avatar 
                                        className={`message-avatar ${msg.sender}`}
                                        icon={msg.sender === 'user' ? <UserOutlined /> : <RobotOutlined />}
                                        style={{
                                            backgroundColor: msg.sender === 'user' ? '#1890ff' : '#52c41a'
                                        }}
                                    />
                                    <div className="message-bubble">
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="message-item ai">
                                    <Avatar 
                                        className="message-avatar ai"
                                        icon={<RobotOutlined />}
                                        style={{ backgroundColor: '#52c41a' }}
                                    />
                                    <div className="message-bubble typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </Content>
                <div className="chat-input-container">
                    <Input.TextArea
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onPressEnter={(e) => {
                            if (!e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                        placeholder="Nhập câu hỏi của bạn ở đây..."
                        autoSize={{ minRows: 1, maxRows: 5 }}
                        disabled={isLoading}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => handleSendMessage()}
                        loading={isLoading}
                        disabled={isLoading || !currentMessage.trim()}
                    />
                </div>
            </Layout>
        </Layout>
    );
};

export default AIAssistantPage;
