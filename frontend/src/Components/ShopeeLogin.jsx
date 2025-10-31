// Shopee Login Component - Handles mock OAuth flow with Redux
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

    const handleLogin = () => {
        setShowModal(true);
    };

    const handleContinue = async () => {
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
        Modal.confirm({
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
                        <div className="shop-info">
                            <span className="shop-name">{shopInfo?.shop_name}</span>
                            <span className="shop-id">ID: {shopInfo?.shop_id}</span>
                        </div>
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

            <Modal
                title={
                    <div className="modal-title">
                        <ShopOutlined style={{ fontSize: '28px', color: '#ee4d2d' }} />
                        <span>Đăng nhập Shopee Seller</span>
                        <Tag color="orange" icon={<LockOutlined />}>Demo Mode</Tag>
                    </div>
                }
                open={showModal}
                onCancel={() => !loading && setShowModal(false)}
                footer={[
                    <Button key="cancel" onClick={() => setShowModal(false)} disabled={loading}>
                        Hủy
                    </Button>,
                    <Button
                        key="continue"
                        type="primary"
                        icon={<ArrowRightOutlined />}
                        onClick={handleContinue}
                        loading={loading}
                        className="continue-btn"
                    >
                        Tiếp tục đăng nhập
                    </Button>,
                ]}
                width={650}
                className="shopee-login-modal"
            >
                <div className="shopee-modal-content">
                    <div className="modal-section demo-info">
                        <div className="section-icon">
                            <InfoCircleOutlined />
                        </div>
                        <div className="section-content">
                            <h4>📌 Thông tin Demo</h4>
                            <ul>
                                <li>Môi trường <strong>giả lập hoàn toàn</strong></li>
                                <li>Không cần tài khoản Shopee thật</li>
                                <li>Dữ liệu demo: <strong>50+ đơn hàng, 30+ sản phẩm</strong></li>
                                <li>Shop demo: <code>Demo Fashion Store (#123456789)</code></li>
                            </ul>
                        </div>
                    </div>

                    <div className="modal-section oauth-flow">
                        <div className="section-icon">
                            <LockOutlined />
                        </div>
                        <div className="section-content">
                            <h4>🔐 Quy trình OAuth 2.0</h4>
                            <div className="flow-steps">
                                <div className="flow-step">
                                    <span className="step-number">1</span>
                                    <span className="step-text">Chuyển hướng tới Shopee OAuth</span>
                                </div>
                                <div className="flow-step">
                                    <span className="step-number">2</span>
                                    <span className="step-text">Xác nhận cấp quyền (auto)</span>
                                </div>
                                <div className="flow-step">
                                    <span className="step-number">3</span>
                                    <span className="step-text">Nhận authorization code</span>
                                </div>
                                <div className="flow-step">
                                    <span className="step-number">4</span>
                                    <span className="step-text">Đổi code → access token</span>
                                </div>
                                <div className="flow-step">
                                    <span className="step-number">5</span>
                                    <span className="step-text">Tải dữ liệu shop về Dashboard</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-section permissions">
                        <div className="section-icon">
                            <CheckCircleOutlined />
                        </div>
                        <div className="section-content">
                            <h4>✅ Quyền truy cập</h4>
                            <div className="permission-grid">
                                <div className="permission-item">
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Thông tin Shop</span>
                                </div>
                                <div className="permission-item">
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Đơn hàng</span>
                                </div>
                                <div className="permission-item">
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Sản phẩm</span>
                                </div>
                                <div className="permission-item">
                                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                    <span>Doanh thu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ShopeeLogin;
