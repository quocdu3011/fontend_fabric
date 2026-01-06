import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transcriptAPI } from '../services/api';

const RequestCorrection = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [details, setDetails] = useState('');

    // Check if user is student
    if (user?.ou !== 'student') {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Chỉ sinh viên mới có thể gửi yêu cầu sửa điểm.
                        </div>
                        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                            Quay lại Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);

        if (!details.trim()) {
            setError('Vui lòng nhập nội dung yêu cầu');
            return;
        }

        setLoading(true);

        try {
            const result = await transcriptAPI.requestCorrection(details);
            if (result.success) {
                setSuccess(result);
                setDetails('');
            }
        } catch (err) {
            setError(err.message || 'Gửi yêu cầu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="mb-lg">📝 Gửi yêu cầu sửa bảng điểm</h1>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Nội dung yêu cầu</h2>
                            <p className="card-subtitle">
                                Mô tả chi tiết điểm cần sửa và lý do
                            </p>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Sinh viên</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={user?.username}
                                    disabled
                                />
                                <p className="form-hint">Hệ thống tự động lấy thông tin từ tài khoản của bạn</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Chi tiết yêu cầu *</label>
                                <textarea
                                    className="form-input form-textarea"
                                    value={details}
                                    onChange={(e) => setDetails(e.target.value)}
                                    placeholder="VD: Em thấy điểm môn Toán bị sai, điểm thực tế là 9.0 nhưng trong bảng điểm là 8.0. Em có bằng chứng là phiếu điểm gốc..."
                                    style={{ minHeight: '150px' }}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : '📝 Gửi yêu cầu'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {success ? (
                            <div className="card">
                                <div className="verification-result valid">
                                    <div className="verification-icon">✅</div>
                                    <h2 className="verification-title">Gửi yêu cầu thành công!</h2>
                                </div>

                                <div className="mt-lg">
                                    <p className="text-center">
                                        Yêu cầu của bạn đã được ghi nhận và sẽ được Admin xem xét.
                                    </p>
                                    <dl className="degree-details mt-lg">
                                        <dt>Mã yêu cầu</dt>
                                        <dd>
                                            <code className="code-block">{success.requestId}</code>
                                        </dd>
                                        <dt>Thời gian</dt>
                                        <dd>{success.timestamp || new Date().toLocaleString('vi-VN')}</dd>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Hướng dẫn</h2>
                                </div>
                                <div className="alert alert-info">
                                    <strong>📌 Lưu ý khi gửi yêu cầu:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        <li>Mô tả rõ ràng điểm nào cần sửa</li>
                                        <li>Cung cấp điểm đúng theo bạn</li>
                                        <li>Nêu lý do tại sao bạn cho rằng điểm bị sai</li>
                                        <li>Nếu có, đề cập đến bằng chứng (phiếu điểm gốc, v.v.)</li>
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

export default RequestCorrection;
