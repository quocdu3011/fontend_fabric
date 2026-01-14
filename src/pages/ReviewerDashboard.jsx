import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proposalAPI } from '../services/api';

const ReviewerDashboard = () => {
    const { user } = useAuth();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Check if user is admin or reviewer
    const canAccess = user?.ou === 'admin' || user?.ou === 'reviewer';

    useEffect(() => {
        if (canAccess) {
            fetchStatistics();
        }
    }, [canAccess]);

    const fetchStatistics = async () => {
        try {
            setLoading(true);
            const result = await proposalAPI.getStatistics();
            if (result.success) {
                setStatistics(result.statistics);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    if (!canAccess) {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Bạn không có quyền truy cập tính năng này. Chỉ Admin hoặc Reviewer mới có thể xem.
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>📊 Dashboard Reviewer</h1>
                        <p className="text-secondary">
                            Tổng quan về các đề xuất trong hệ thống
                        </p>
                    </div>
                    <Link to="/proposals" className="btn btn-primary">
                        📋 Xem tất cả đề xuất
                    </Link>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {loading ? (
                    <div className="card text-center">
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                        <p className="mt-md">Đang tải thống kê...</p>
                    </div>
                ) : statistics ? (
                    <>
                        {/* Statistics Cards */}
                        <div className="reviewer-stats">
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value">{statistics.total || 0}</div>
                                <div className="reviewer-stat-label">Tổng đề xuất</div>
                            </div>
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value pending">{statistics.pending || 0}</div>
                                <div className="reviewer-stat-label">Chờ xử lý</div>
                            </div>
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value approved">{statistics.approved || 0}</div>
                                <div className="reviewer-stat-label">Đã duyệt</div>
                            </div>
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value rejected">{statistics.rejected || 0}</div>
                                <div className="reviewer-stat-label">Từ chối</div>
                            </div>
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value committed">{statistics.committed || 0}</div>
                                <div className="reviewer-stat-label">Đã xác nhận</div>
                            </div>
                            <div className="reviewer-stat-card">
                                <div className="reviewer-stat-value expired">{statistics.expired || 0}</div>
                                <div className="reviewer-stat-label">Hết hạn</div>
                            </div>
                        </div>

                        {/* Statistics by Type */}
                        {statistics.byType && (
                            <div className="grid grid-2">
                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">📊 Theo loại đề xuất</h2>
                                    </div>
                                    <dl className="degree-details">
                                        <dt>🎓 Cấp bằng</dt>
                                        <dd>{statistics.byType.DEGREE_ISSUANCE || 0}</dd>
                                        <dt>📋 Cập nhật điểm</dt>
                                        <dd>{statistics.byType.TRANSCRIPT_UPDATE || 0}</dd>
                                    </dl>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">⚡ Thao tác nhanh</h2>
                                    </div>
                                    <div className="action-buttons">
                                        <Link to="/proposals?status=PENDING" className="btn btn-primary">
                                            ⏳ Xem chờ duyệt ({statistics.pending || 0})
                                        </Link>
                                        {user?.ou === 'admin' && (
                                            <>
                                                <Link to="/batch-proposals" className="btn btn-secondary">
                                                    📦 Tạo hàng loạt
                                                </Link>
                                                <Link to="/import-export" className="btn btn-secondary">
                                                    📥 Import/Export
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>Chưa có dữ liệu thống kê</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewerDashboard;
