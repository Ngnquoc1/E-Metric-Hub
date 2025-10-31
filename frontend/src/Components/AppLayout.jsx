import React from 'react';
import { Layout, Menu, Button, ConfigProvider } from 'antd';
import { Outlet, Link, useLocation } from 'react-router-dom';
import Logo from '../assets/img/Logo.jpg';
import './AppLayout.css';

const { Header, Content } = Layout;

const AppLayout = () => {
  const location = useLocation();

  const menuItems = [
    { key: '/', label: <Link to="/">Trang chủ</Link> },
    { key: '/dashboard', label: <Link to="/dashboard">Dashboard</Link> },
    { key: '/features', label: <Link to="/features">Tính năng</Link> },
    { key: '/pricing', label: <Link to="/pricing">Bảng giá</Link> },
    { key: '/ai-assistant', label: <Link to="/ai-assistant">Trợ lý ảo</Link> },
  ];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0a58d0',
          borderRadius: 12,
        },
      }}
    >
      <Layout style={{ minHeight: '100vh' }}>
        <Header className="app-header">
          <div className="header-container">
            {/* Logo */}
            <div className="logo-section">
              <img src={Logo} alt="E-Metric Hub Logo" className="logo" />
              <span className="logo-text">E-Metric Hub</span>
            </div>

            {/* Navigation Menu */}
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              className="main-menu"
              style={{
                flex: 1,
                justifyContent: 'center',
                border: 'none',
                background: 'transparent',
              }}
            />

            {/* User Controls */}
            <div className="user-controls">
              <Link to="/login" className="login-text">
                Đăng nhập
              </Link>
              <Button type="primary" size="large" className="trial-button">
                Dùng thử miễn phí
              </Button>
            </div>
          </div>
        </Header>

        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
