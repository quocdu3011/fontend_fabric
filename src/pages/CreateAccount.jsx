import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const CreateAccount = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        studentId: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Only admin can create accounts
    if (user?.ou !== 'admin') {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Chỉ Admin mới có quyền tạo tài khoản.
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
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                username: formData.username.trim(),
                password: formData.password,
                role: formData.role,
            };

            // Add studentId only for student role
            if (formData.role === 'student') {
                userData.studentId = formData.studentId.trim() || formData.username.trim();
            }

            const result = await authAPI.register('admin', 'adminpw', userData);

            if (result.success) {
                const roleLabel = {
                    student: 'Sinh viên',
                    admin: 'Admin',
                    reviewer: 'Reviewer',
                    client: 'Client',
                }[formData.role] || formData.role;

                let successMessage = `✅ Tạo tài khoản ${roleLabel} thành công!
                    • Username: ${userData.username}
                    • Vai trò: ${roleLabel}`;

                if (formData.role === 'student') {
                    successMessage += `\n                    • Mã SV: ${userData.studentId}`;
                }

                successMessage += `\n                    • Enrollment Secret: ${result.enrollmentSecret}
                    
                    ⚠️ Người dùng cần kích hoạt tài khoản trước khi đăng nhập.`;

                setSuccess(successMessage);

                // Reset form
                setFormData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    role: 'student',
                    studentId: '',
                });
            }
        } catch (err) {
            setError(err.message || 'Tạo tài khoản thất bại');
            console.error('Create account error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRoleDescription = () => {
        switch (formData.role) {
            case 'student':
                return 'Xem văn bằng, bảng điểm, yêu cầu sửa điểm, chia sẻ hồ sơ';
            case 'admin':
                return 'Toàn quyền: tạo tài khoản, cấp bằng, quản lý đề xuất, import/export';
            case 'reviewer':
                return 'Phê duyệt/từ chối đề xuất cấp bằng, xem thống kê';
            case 'client':
                return 'Xác thực văn bằng, xem thông tin công khai';
            default:
                return '';
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>👤 Tạo tài khoản mới</h1>
                <p className="subtitle">Tạo tài khoản cho người dùng trong hệ thống</p>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                {error && (
                    <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success" style={{ marginBottom: '20px', whiteSpace: 'pre-line' }}>
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Vai trò *</label>
                        <select
                            className="form-input form-select"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="student">👨‍🎓 Student (Sinh viên)</option>
                            <option value="admin">👑 Admin (Quản trị)</option>
                            <option value="reviewer">✅ Reviewer (Phê duyệt)</option>
                            <option value="client">🔍 Client (Xác thực)</option>
                        </select>
                        <p className="form-hint">
                            {getRoleDescription()}
                        </p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tên đăng nhập *</label>
                        <input
                            type="text"
                            className="form-input"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="VD: nguyenvana, admin2"
                            required
                            disabled={loading}
                        />
                    </div>

                    {formData.role === 'student' && (
                        <div className="form-group">
                            <label className="form-label">Mã sinh viên</label>
                            <input
                                type="text"
                                className="form-input"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                placeholder="VD: CT070211, B18DCAT001"
                                disabled={loading}
                            />
                            <p className="form-hint">
                                Mã sinh viên chính thức. Nếu để trống, sẽ dùng tên đăng nhập.
                            </p>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Mật khẩu *</label>
                        <input
                            type="password"
                            className="form-input"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Xác nhận mật khẩu *</label>
                        <input
                            type="password"
                            className="form-input"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Nhập lại mật khẩu"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg btn-block"
                            disabled={loading}
                        >
                            {loading ? '⏳ Đang tạo tài khoản...' : '✅ Tạo tài khoản'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '20px auto 0', background: '#f8f9fa' }}>
                <h3 style={{ marginTop: 0 }}>📋 Quyền hạn theo vai trò</h3>
                <table className="table" style={{ marginBottom: 0 }}>
                    <tbody>
                        <tr>
                            <td><strong>👨‍🎓 Student</strong></td>
                            <td>Xem văn bằng, bảng điểm, yêu cầu sửa, chia sẻ</td>
                        </tr>
                        <tr>
                            <td><strong>👑 Admin</strong></td>
                            <td>Toàn quyền quản lý hệ thống</td>
                        </tr>
                        <tr>
                            <td><strong>✅ Reviewer</strong></td>
                            <td>Phê duyệt đề xuất cấp bằng</td>
                        </tr>
                        <tr>
                            <td><strong>🔍 Client</strong></td>
                            <td>Xác thực văn bằng</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CreateAccount;
