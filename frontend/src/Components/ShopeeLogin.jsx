import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, message, Badge, Tag } from 'antd';
import { ShopOutlined, LoginOutlined, LogoutOutlined, InfoCircleOutlined, CheckCircleOutlined, ArrowRightOutlined, LockOutlined } from '@ant-design/icons';
import { initShopeeOAuth, logout } from '../store/slices/authSlice';
import { clearDashboardData } from '../store/slices/dashboardSlice';
import './ShopeeLogin.css';

const ShopeeLogin = ({ onLoginSuccess, onLogout }) => {
    const dispatch = useDispatch();
    const { isAuthenticated, tokens, loading: authLoading } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    
    const shopInfo = tokens ? {
        shop_id: tokens.shop_id,
        shop_name: 'Mock Shop'
    } : null;

    const handleLogin = async () => {
         setLoading(true);
        
        try {
            // Dispatch Redux action to init OAuth
            const response = await dispatch(initShopeeOAuth()).unwrap();
            
            console.log('🔐 OAuth initiated:', response);
            
            message.loading('Đang chuyển hướng đến Shopee...', 2);
            
            // Redirect after 2 seconds
            setTimeout(() => {
                window.location.href = response.auth_url;
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error initiating OAuth:', error);
            message.error('Không thể khởi tạo đăng nhập: ' + error);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        // ✅ Use Modal.confirm with explicit import
        const { confirm } = Modal;
        confirm({
            title: 'Xác nhận đăng xuất',
            content: 'Bạn có chắc chắn muốn đăng xuất khỏi Shopee?',
            okText: 'Đăng xuất',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: () => {
                // Dispatch Redux logout actions
                dispatch(logout());
                dispatch(clearDashboardData());
                message.success('Đã đăng xuất khỏi Shopee');
                
                if (onLogout) {
                    onLogout();
                }
            },
        });
    };

    return (
        <div className="shopee-login-wrapper">
            {!isAuthenticated ? (
                <Button
                    type="primary"
                    icon={<LoginOutlined />}
                    onClick={handleLogin}
                    size="large"
                    loading={loading}
                    className="shopee-login-btn"
                >
                    Đăng nhập với Shopee
                </Button>
            ) : (
                <div className="shopee-auth-info">
                    <div className="shopee-shop-badge">
                        <ShopOutlined style={{ fontSize: '20px', color: '#ee4d2d' }} />
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                            Đã kết nối
                        </Tag>
                    </div>
                    <Button
                        danger
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        size="middle"
                    >
                        Đăng xuất
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ShopeeLogin;