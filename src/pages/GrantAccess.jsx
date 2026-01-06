import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transcriptAPI } from '../services/api';

const GrantAccess = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        targetMSP: 'Org2MSP',
    });

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
            const result = await transcriptAPI.grantAccess(formData.studentId, formData.targetMSP);
            if (result.success) {
                setSuccess(result);
            }
        } catch (err) {
            setError(err.message || 'Cấp quyền thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="mb-lg">🔓 Chia sẻ quyền truy cập bảng điểm</h1>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Cấp quyền xem bảng điểm</h2>
                            <p className="card-subtitle">Cho phép tổ chức khác xem bảng điểm của bạn</p>
                        </div>

                        {error && <div className="alert alert-error">{error}</div>}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Mã sinh viên *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    placeholder="VD: CT070211"
                                    required
                                />
                                <p className="form-hint">Nhập mã sinh viên của bạn</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tổ chức được cấp quyền (MSP) *</label>
                                <select
                                    className="form-input form-select"
                                    name="targetMSP"
                                    value={formData.targetMSP}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Org1MSP">Org1MSP - Tổ chức 1</option>
                                    <option value="Org2MSP">Org2MSP - Tổ chức 2</option>
                                    <option value="Org3MSP">Org3MSP - Tổ chức 3</option>
                                </select>
                                <p className="form-hint">Chọn tổ chức (VD: Nhà tuyển dụng) sẽ được xem bảng điểm</p>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : '🔓 Cấp quyền truy cập'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {success ? (
                            <div className="card">
                                <div className="verification-result valid">
                                    <div className="verification-icon">✅</div>
                                    <h2 className="verification-title">Cấp quyền thành công!</h2>
                                </div>

                                <div className="mt-lg">
                                    <h3 className="mb-md">Thông tin</h3>
                                    <dl className="degree-details">
                                        <dt>Transaction ID</dt>
                                        <dd>
                                            <code className="code-block">{success.transactionId}</code>
                                        </dd>
                                        <dt>Sinh viên</dt>
                                        <dd>{formData.studentId}</dd>
                                        <dt>Tổ chức được cấp quyền</dt>
                                        <dd>
                                            <span className="status status-active">{formData.targetMSP}</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Về tính năng chia sẻ</h2>
                                </div>
                                <div className="alert alert-info">
                                    <strong>ℹ️ Chia sẻ quyền truy cập:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        <li>Cho phép tổ chức khác (VD: Nhà tuyển dụng) xem bảng điểm của bạn</li>
                                        <li>Bảng điểm được lưu trong Private Data Collection</li>
                                        <li>Chỉ các tổ chức được bạn cấp quyền mới có thể truy cập</li>
                                        <li>Giao dịch cấp quyền được ghi lại trên blockchain</li>
                                    </ul>
                                </div>

                                <div className="alert alert-warning mt-md">
                                    <strong>⚠️ Lưu ý:</strong>
                                    <p style={{ marginTop: '4px' }}>
                                        Chỉ sinh viên mới có thể cấp quyền xem bảng điểm của chính mình.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GrantAccess;
