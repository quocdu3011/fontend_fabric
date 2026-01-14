import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { versioningAPI, bulkAPI } from '../services/api';

const DegreeHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [degreeId, setDegreeId] = useState('');
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canAccess = user?.ou === 'admin' || user?.ou === 'reviewer' || user?.ou === 'client';

    const fetchHistory = async (e) => {
        e.preventDefault();
        if (!degreeId.trim()) {
            setError('Vui lòng nhập mã bằng');
            return;
        }

        setLoading(true);
        setError('');
        setHistory(null);

        try {
            const result = await versioningAPI.getDegreeHistory(degreeId);
            if (result.success) {
                setHistory(result.history);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
        }
    };

    const handleExportHistory = async () => {
        try {
            const blob = await bulkAPI.exportDegreeHistory(degreeId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `degree_${degreeId}_history.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err.message || 'Export thất bại');
        }
    };

    if (!canAccess) {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Bạn không có quyền truy cập tính năng này.
                        </div>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Quay lại Dashboard
                        </button>
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
                        <h1>📜 Lịch sử văn bằng</h1>
                        <p className="text-secondary">
                            Xem lịch sử thay đổi của văn bằng
                        </p>
                    </div>
                </div>

                <div className="card mb-lg">
                    <form onSubmit={fetchHistory}>
                        <div className="flex gap-md">
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Nhập mã bằng (VD: DEG-001)"
                                value={degreeId}
                                onChange={(e) => setDegreeId(e.target.value)}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Đang tải...' : '🔍 Tìm kiếm'}
                            </button>
                        </div>
                    </form>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {history && (
                    <div className="card">
                        <div className="card-header">
                            <div className="flex-between">
                                <div>
                                    <h2 className="card-title">Văn bằng: {history.degreeId}</h2>
                                    <p className="card-subtitle">
                                        Tổng cộng {history.versions?.length || 0} phiên bản
                                    </p>
                                </div>
                                {(user?.ou === 'admin' || user?.ou === 'reviewer') && (
                                    <button className="btn btn-secondary btn-sm" onClick={handleExportHistory}>
                                        📥 Export CSV
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="version-timeline">
                            {history.versions?.map((version, index) => (
                                <div key={index} className="version-item">
                                    <div className="version-header">
                                        <span className="version-number">Phiên bản {version.version}</span>
                                        <span className={`version-action ${version.action?.toLowerCase()}`}>
                                            {version.action}
                                        </span>
                                    </div>
                                    <div className="version-meta">
                                        Bởi <strong>{version.modifiedBy}</strong> lúc {' '}
                                        {new Date(version.modifiedAt).toLocaleString('vi-VN')}
                                    </div>
                                    {version.data && (
                                        <dl className="degree-details">
                                            <dt>Sinh viên</dt>
                                            <dd>{version.data.studentName} ({version.data.studentId})</dd>
                                            <dt>Loại bằng</dt>
                                            <dd>{version.data.degreeType}</dd>
                                            <dt>Trường</dt>
                                            <dd>{version.data.university}</dd>
                                            <dt>Ngành</dt>
                                            <dd>{version.data.major}</dd>
                                            <dt>Xếp loại</dt>
                                            <dd>{version.data.classification}</dd>
                                            <dt>Ngày cấp</dt>
                                            <dd>{version.data.issueDate}</dd>
                                            <dt>Trạng thái</dt>
                                            <dd>
                                                <span className={`status ${version.data.isActive ? 'status-active' : 'status-revoked'}`}>
                                                    {version.data.isActive ? 'Hoạt động' : 'Đã thu hồi'}
                                                </span>
                                            </dd>
                                        </dl>
                                    )}
                                </div>
                            ))}
                        </div>

                        {(!history.versions || history.versions.length === 0) && (
                            <div className="empty-state">
                                <div className="empty-state-icon">📭</div>
                                <p>Không có lịch sử</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DegreeHistory;
