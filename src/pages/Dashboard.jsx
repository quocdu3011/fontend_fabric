import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { healthAPI } from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkHealth();
    }, []);

    const checkHealth = async () => {
        try {
            const data = await healthAPI.check();
            setHealth(data);
        } catch (err) {
            setHealth({ status: 'error', error: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>Dashboard</h1>
                        <p className="text-secondary">
                            Xin chào, <strong>{user?.username}</strong>!
                        </p>
                    </div>
                    <div className={`status ${health?.status === 'healthy' ? 'status-active' : 'status-revoked'}`}>
                        {loading ? 'Đang kiểm tra...' : health?.status === 'healthy' ? '✓ Hệ thống hoạt động' : '✗ Lỗi kết nối'}
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value">🎓</div>
                        <div className="stat-label">Cấp bằng số</div>
                        <Link to="/issue-degree" className="btn btn-primary btn-sm mt-md">
                            {user?.ou === 'admin' ? 'Cấp bằng mới' : 'Xem'}
                        </Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">🔍</div>
                        <div className="stat-label">Xác thực bằng</div>
                        <Link to="/verify" className="btn btn-secondary btn-sm mt-md">
                            Xác thực
                        </Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">📋</div>
                        <div className="stat-label">Bảng điểm</div>
                        <Link to="/transcripts" className="btn btn-secondary btn-sm mt-md">
                            Quản lý
                        </Link>
                    </div>

                    <div className="stat-card">
                        <div className="stat-value">👤</div>
                        <div className="stat-label">Hồ sơ</div>
                        <Link to="/profile" className="btn btn-secondary btn-sm mt-md">
                            Xem hồ sơ
                        </Link>
                    </div>
                </div>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thao tác nhanh</h2>
                        </div>
                        <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                            {user?.ou === 'admin' && (
                                <Link to="/issue-degree" className="btn btn-primary">
                                    ➕ Cấp bằng mới
                                </Link>
                            )}
                            <Link to="/verify" className="btn btn-secondary">
                                🔍 Xác thực bằng
                            </Link>
                            <Link to="/transcripts" className="btn btn-secondary">
                                📋 Thêm bảng điểm
                            </Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thông tin hệ thống</h2>
                        </div>
                        <dl className="degree-details">
                            <dt>Trạng thái</dt>
                            <dd>
                                <span className={`status ${health?.status === 'healthy' ? 'status-active' : 'status-revoked'}`}>
                                    {health?.status || 'Unknown'}
                                </span>
                            </dd>
                            <dt>Gateway</dt>
                            <dd>{health?.gateway || 'N/A'}</dd>
                            <dt>Vai trò của bạn</dt>
                            <dd>
                                <span className={`user-role ${user?.ou}`}>{user?.ou}</span>
                            </dd>
                            <dt>MSP ID</dt>
                            <dd>{user?.mspId || 'N/A'}</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
