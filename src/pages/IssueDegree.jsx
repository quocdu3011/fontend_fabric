import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { degreeAPI } from '../services/api';

const IssueDegree = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        degreeId: '',
        studentId: '',
        degreeType: 'Kỹ sư',
        studentName: '',
        university: 'Học viện Kỹ thuật Mật mã',
        major: '',
        classification: 'Giỏi',
        issueDate: new Date().toISOString().split('T')[0],
    });

    // Check if user is admin
    if (user?.ou !== 'admin') {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Bạn không có quyền truy cập tính năng này. Chỉ Admin mới có thể cấp bằng.
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

    const generateIds = () => {
        const timestamp = Date.now();
        setFormData({
            ...formData,
            degreeId: formData.degreeId || `DEG-${timestamp}`,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);
        setLoading(true);

        try {
            // Issue degree directly
            const result = await degreeAPI.issue({
                degreeId: formData.degreeId,
                studentId: formData.studentId,
                degreeType: formData.degreeType,
                studentName: formData.studentName,
                universityName: formData.university,
                major: formData.major,
                classification: formData.classification,
                issueDate: formData.issueDate,
            });

            if (result.success) {
                setSuccess(result);
                setFormData({
                    degreeId: '',
                    studentId: '',
                    degreeType: 'Kỹ sư',
                    studentName: '',
                    university: 'Học viện Kỹ thuật Mật mã',
                    major: '',
                    classification: 'Giỏi',
                    issueDate: new Date().toISOString().split('T')[0],
                });
            }
        } catch (err) {
            setError(err.message || 'Cấp bằng thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>➕ Cấp bằng</h1>
                        <p className="text-secondary">
                            Cấp bằng chính thức cho sinh viên
                        </p>
                    </div>
                    <div className="action-buttons">
                        <button type="button" className="btn btn-secondary" onClick={generateIds}>
                            🔢 Tự động tạo ID
                        </button>
                    </div>
                </div>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thông tin bằng cấp</h2>
                            <p className="card-subtitle">Điền đầy đủ thông tin để cấp bằng</p>
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
                                <label className="form-label">Loại bằng *</label>
                                <select
                                    className="form-input form-select"
                                    name="degreeType"
                                    value={formData.degreeType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Kỹ sư">Kỹ sư</option>
                                    <option value="Cử nhân">Cử nhân</option>
                                    <option value="Thạc sĩ">Thạc sĩ</option>
                                    <option value="Tiến sĩ">Tiến sĩ</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mã sinh viên (Student ID) *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    placeholder="VD: CT070211, B18DCAT001"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tên sinh viên *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    placeholder="Nguyễn Văn A"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tên trường *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ngành học *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="major"
                                    value={formData.major}
                                    onChange={handleChange}
                                    placeholder="Công nghệ thông tin"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Xếp loại *</label>
                                <select
                                    className="form-input form-select"
                                    name="classification"
                                    value={formData.classification}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Xuất sắc">Xuất sắc</option>
                                    <option value="Giỏi">Giỏi</option>
                                    <option value="Khá">Khá</option>
                                    <option value="Trung bình">Trung bình</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Ngày cấp *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    name="issueDate"
                                    value={formData.issueDate}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : '📤 Cấp bằng'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {success && (
                            <div className="card">
                                <div className="verification-result valid">
                                    <div className="verification-icon">✅</div>
                                    <h2 className="verification-title">Cấp bằng thành công!</h2>
                                </div>

                                <div className="mt-lg">
                                    <h3 className="mb-md">Thông tin bằng cấp</h3>
                                    <dl className="degree-details">
                                        <dt>Mã bằng</dt>
                                        <dd><strong>{success.degree?.degreeId}</strong></dd>
                                        <dt>Transaction ID</dt>
                                        <dd className="text-secondary" style={{fontSize: '0.85rem', wordBreak: 'break-all'}}>
                                            {success.transactionId}
                                        </dd>
                                        <dt>Sinh viên</dt>
                                        <dd>{success.degree?.studentName}</dd>
                                        <dt>Mã SV</dt>
                                        <dd>{success.degree?.studentId}</dd>
                                        <dt>Ngành học</dt>
                                        <dd>{success.degree?.major}</dd>
                                        <dt>Xếp loại</dt>
                                        <dd>{success.degree?.classification}</dd>
                                    </dl>

                                    <div className="action-buttons mt-lg">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => navigate('/verify-degree')}
                                        >
                                            🔍 Xác minh bằng
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setSuccess(null)}
                                        >
                                            ➕ Cấp bằng mới
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IssueDegree;
