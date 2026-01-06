import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { degreeAPI } from '../services/api';

const RevokeDegree = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        degreeId: '',
        reason: '',
    });

    // Check if user is admin
    if (user?.ou !== 'admin') {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Bạn không có quyền truy cập tính năng này. Chỉ Admin mới có thể thu hồi bằng.
                        </div>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Quay lại Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);
        setLoading(true);

        try {
            const result = await degreeAPI.revoke(formData.degreeId, formData.reason);
            if (result.success) {
                setSuccess(result);
                setFormData({ degreeId: '', reason: '' });
            }
        } catch (err) {
            setError(err.message || 'Thu hồi bằng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <h1>🚫 Thu hồi văn bằng</h1>
                </div>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thu hồi văn bằng</h2>
                            <p className="card-subtitle">Chuyển trạng thái văn bằng sang REVOKED</p>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Mã bằng (Degree ID) *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="degreeId"
                                    value={formData.degreeId}
                                    onChange={handleChange}
                                    placeholder="VD: VN.KMA.2025.001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lý do thu hồi *</label>
                                <textarea
                                    className="form-input form-textarea"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    placeholder="Nhập lý do thu hồi văn bằng..."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-danger btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : '🚫 Thu hồi văn bằng'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {success ? (
                            <div className="card">
                                <div className="verification-result" style={{ backgroundColor: 'var(--error-light)', border: '2px solid var(--error)' }}>
                                    <div className="verification-icon">🚫</div>
                                    <h2 className="verification-title" style={{ color: 'var(--error)' }}>Thu hồi thành công!</h2>
                                </div>

                                <div className="mt-lg">
                                    <h3 className="mb-md">Thông tin giao dịch</h3>
                                    <dl className="degree-details">
                                        <dt>Transaction ID</dt>
                                        <dd>
                                            <code className="code-block">{success.transactionId}</code>
                                        </dd>
                                        <dt>Mã bằng</dt>
                                        <dd>{success.degreeId}</dd>
                                        <dt>Trạng thái mới</dt>
                                        <dd>
                                            <span className="status status-revoked">REVOKED</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Lưu ý quan trọng</h2>
                                </div>
                                <div className="alert alert-warning">
                                    <strong>⚠️ Cảnh báo:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        <li>Hành động thu hồi không thể hoàn tác</li>
                                        <li>Văn bằng sẽ bị đánh dấu là REVOKED vĩnh viễn</li>
                                        <li>Lý do thu hồi sẽ được ghi lại trên blockchain</li>
                                        <li>Người thu hồi sẽ được lưu trong hệ thống</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RevokeDegree;
