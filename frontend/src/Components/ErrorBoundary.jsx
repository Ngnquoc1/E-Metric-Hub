/**
 * ERROR BOUNDARY COMPONENT
 * Catches React errors and displays fallback UI
 */
import React from 'react';
import { Empty, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to console (in production, you'd send to error tracking service)
        console.error('❌ Error Boundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    padding: '24px',
                    backgroundColor: '#f5f5f5'
                }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <h2>Oops! Có lỗi xảy ra</h2>
                                <p style={{ color: '#666', marginTop: 8 }}>
                                    Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.
                                </p>
                                {process.env.NODE_ENV === 'development' && this.state.error && (
                                    <details style={{
                                        marginTop: 16,
                                        padding: 12,
                                        backgroundColor: '#fff',
                                        border: '1px solid #d9d9d9',
                                        borderRadius: 4,
                                        textAlign: 'left',
                                        maxWidth: 600
                                    }}>
                                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                            Chi tiết lỗi (Development mode)
                                        </summary>
                                        <pre style={{
                                            marginTop: 8,
                                            fontSize: 12,
                                            overflow: 'auto',
                                            color: '#ff4d4f'
                                        }}>
                                            {this.state.error.toString()}
                                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={this.handleReload}
                            size="large"
                        >
                            Tải lại trang
                        </Button>
                    </Empty>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
