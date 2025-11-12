import React from 'react';
import { Button, List, Typography, Divider } from 'antd';
import { PlusOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import './ConversationHistory.css';

const { Text } = Typography;

const ConversationHistory = ({ conversations, activeConvId, onSelect, onNewChat }) => {
    return (
        <div className="conversation-history">
            <div className="history-header">
                <Text strong style={{ fontSize: '16px', color: '#1a1a1a' }}>
                    💬 Lịch sử trò chuyện
                </Text>
            </div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={onNewChat}
                className="new-chat-btn"
                size="large"
            >
                Cuộc trò chuyện mới
            </Button>
            <Divider style={{ margin: '16px 0' }} />
            <div className="conversations-list">
                <List
                    dataSource={conversations}
                    renderItem={(conv) => (
                        <List.Item
                            className={`conv-item ${conv.conversationId === activeConvId ? 'active' : ''}`}
                            onClick={() => onSelect(conv.conversationId)}
                        >
                            <div className="conv-item-content">
                                <MessageOutlined className="conv-icon" />
                                <div className="conv-info">
                                    <Text className="conv-title" ellipsis>
                                        {conv.title}
                                    </Text>
                                    <Text className="conv-count" type="secondary">
                                        {conv.messageCount || conv.messages?.length || 0} tin nhắn
                                    </Text>
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default ConversationHistory;
