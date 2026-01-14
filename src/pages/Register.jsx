import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Register, 2: Enroll (fallback)
    const [showAdminFields, setShowAdminFields] = useState(false);
    const [formData, setFormData] = useState({
        adminUsername: 'admin',
        adminPassword: 'adminpw',
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        studentId: '', // Mã sinh viên (Business ID)
    });
    const [enrollmentSecret, setEnrollmentSecret] = useState('');
    const [enrollSecretInput, setEnrollSecretInput] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                username: formData.username,
                password: formData.password,
                role: formData.role,
            };
            // Thêm studentId nếu có (cho sinh viên)
            if (formData.studentId.trim()) {
                userData.studentId = formData.studentId.trim();
            }
            const result = await authAPI.register(
                formData.adminUsername,
                formData.adminPassword,
                userData
            );

            if (result.success) {
                // Kiểm tra xem có tự động enroll thành công không
                if (result.enrolled) {
                    // Auto-enrollment thành công
                    setSuccess('✅ Đăng ký và kích hoạt tài khoản thành công! Đang chuyển đến trang đăng nhập...');
                    setTimeout(() => navigate('/login'), 2000);
                } else {
                    // Auto-enrollment thất bại, cần enroll thủ công
                    setEnrollmentSecret(result.enrollmentSecret);
                    setEnrollSecretInput(result.enrollmentSecret);
                    setSuccess('⚠️ Đăng ký thành công nhưng chưa kích hoạt. Vui lòng enroll để hoàn tất.');
                    setStep(2);
                }
            }
        } catch (err) {
            setError(err.message || 'Đăng ký thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await authAPI.enroll(formData.username, enrollSecretInput);

            if (result.success) {
                setSuccess('Enroll thành công! Bạn có thể đăng nhập ngay.');
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (err) {
            setError(err.message || 'Enroll thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="card auth-card">
                    <div className="auth-header">
                        <h1 className="auth-title">🎓 Đăng ký tài khoản</h1>
                        <p className="auth-subtitle">
                            {step === 1
                                ? 'Điền thông tin để tạo tài khoản mới'
                                : 'Kích hoạt tài khoản với Enrollment Secret'}
                        </p>
                    </div>

                    {error && <div className="alert alert-error">{error}</div>}
                    {success && <div className="alert alert-success">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleRegister}>
                            {/* Admin credentials - collapsed by default */}
                            <div className="form-group">
                                <button
                                    type="button"
                                    className="btn btn-link"
                                    onClick={() => setShowAdminFields(!showAdminFields)}
                                    style={{ padding: '0', textDecoration: 'underline' }}
                                >
                                    {showAdminFields ? '▼' : '▶'} Thông tin Admin (mặc định: admin/adminpw)
                                </button>
                            </div>

                            {showAdminFields && (
                                <>
                                    <div className="form-group">
                                        <label className="form-label">Tên đăng nhập Admin</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            name="adminUsername"
                                            value={formData.adminUsername}
                                            onChange={handleChange}
                                            required
                                        />
                                        <p className="form-hint">Cần quyền admin để tạo tài khoản mới</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Mật khẩu Admin</label>
                                        <input
                                            type="password"
                                            className="form-input"
                                            name="adminPassword"
                                            value={formData.adminPassword}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <hr style={{ margin: '24px 0', borderColor: 'var(--border)' }} />
                                </>
                            )}

                            <div className="form-group">
                                <label className="form-label">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Nhập tên đăng nhập"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Nhập mật khẩu"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Xác nhận mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Vai trò</label>
                                <select
                                    className="form-input form-select"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="student">Student (Sinh viên)</option>
                                    <option value="admin">Admin (Quản trị)</option>
                                    <option value="reviewer">Reviewer (Phê duyệt)</option>
                                    <option value="client">Client (Xác thực)</option>
                                </select>
                            </div>

                            {formData.role === 'student' && (
                                <div className="form-group">
                                    <label className="form-label">Mã sinh viên (Student ID)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        placeholder="VD: CT070211, B18DCAT001"
                                    />
                                    <p className="form-hint">
                                        Mã sinh viên chính thức dùng để lưu trữ văn bằng và bảng điểm.
                                        Nếu để trống, hệ thống sẽ dùng tên đăng nhập làm mã sinh viên.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xử lý...' : 'Đăng ký'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleEnroll}>
                            <div className="alert alert-warning">
                                <p><strong>⚠️ Yêu cầu kích hoạt thủ công</strong></p>
                                <p>Hệ thống không thể tự động kích hoạt tài khoản. Vui lòng sử dụng Enrollment Secret bên dưới để hoàn tất.</p>
                            </div>

                            <div className="alert alert-info">
                                <strong>Enrollment Secret của bạn:</strong>
                                <code className="code-block mt-sm">{enrollmentSecret}</code>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Tên đăng nhập</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.username}
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Enrollment Secret</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={enrollSecretInput}
                                    onChange={(e) => setEnrollSecretInput(e.target.value)}
                                    placeholder="Dán enrollment secret vào đây"
                                    required
                                />
                                <p className="form-hint">Sao chép secret từ ô phía trên hoặc từ email của bạn</p>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang kích hoạt...' : '🔓 Kích hoạt tài khoản'}
                            </button>

                            <button
                                type="button"
                                className="btn btn-secondary btn-lg btn-block mt-sm"
                                onClick={() => setStep(1)}
                            >
                                ← Quay lại
                            </button>
                        </form>
                    )}

                    <div className="auth-footer">
                        <p>
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
