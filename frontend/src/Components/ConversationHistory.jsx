import React from 'react';
import { Button, List, Typography, Divider, Popconfirm } from 'antd';
import { PlusOutlined, MessageOutlined, DeleteOutlined } from '@ant-design/icons';
import './ConversationHistory.css';

const { Text } = Typography;

const ConversationHistory = ({ conversations, activeConvId, onSelect, onNewChat, onDelete }) => {
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
                        >
                            <div className="conv-item-content" onClick={() => onSelect(conv.conversationId)}>
                                <MessageOutlined className="conv-icon" />
                                <div className="conv-info">
                                    <Text className="conv-title" ellipsis>
                                        {conv.title}
                                    </Text>
                                    <Text className="conv-count" type="secondary">
                                        {conv.messageCount || conv.messages?.length || 0} tin nhắn
                                    </Text>
                                </div>
                                <Popconfirm
                                    title="Xóa cuộc trò chuyện?"
                                    description="Bạn có chắc muốn xóa cuộc trò chuyện này?"
                                    onConfirm={(e) => {
                                        e.stopPropagation();
                                        onDelete(conv.conversationId);
                                    }}
                                    onCancel={(e) => e.stopPropagation()}
                                    okText="Xóa"
                                    cancelText="Hủy"
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        className="conv-delete-btn"
                                        onClick={(e) => e.stopPropagation()}
                                        danger
                                    />
                                </Popconfirm>
                            </div>
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
};

export default ConversationHistory;
