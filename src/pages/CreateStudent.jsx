import { useState } from 'react';
import { authAPI } from '../services/api';

const CreateStudent = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        fullName: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

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
                role: 'student',
                studentId: formData.studentId.trim() || formData.username.trim(),
            };

            const result = await authAPI.register('admin', 'adminpw', userData);

            if (result.success) {
                setSuccess(`✅ Tạo tài khoản sinh viên thành công!
                    • Username: ${userData.username}
                    • Mã SV: ${userData.studentId}
                    • Enrollment Secret: ${result.enrollmentSecret}
                    
                    ⚠️ Sinh viên cần kích hoạt tài khoản trước khi đăng nhập.
                    Vui lòng gửi thông tin trên cho sinh viên.`);

                // Reset form
                setFormData({
                    username: '',
                    password: '',
                    confirmPassword: '',
                    studentId: '',
                    fullName: '',
                });
            }
        } catch (err) {
            setError(err.message || 'Tạo tài khoản thất bại');
            console.error('Create student error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="page-header">
                <h1>👨‍🎓 Tạo tài khoản sinh viên</h1>
                <p className="subtitle">Tạo tài khoản mới cho sinh viên trong hệ thống</p>
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
                        <label className="form-label">Tên đăng nhập *</label>
                        <input
                            type="text"
                            className="form-input"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="VD: nguyenvana, CT070211"
                            required
                            disabled={loading}
                        />
                        <p className="form-hint">
                            Tên đăng nhập dùng để sinh viên login vào hệ thống
                        </p>
                    </div>

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
                            Mã sinh viên chính thức. Nếu để trống, sẽ dùng tên đăng nhập làm mã sinh viên.
                        </p>
                    </div>

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
                <h3 style={{ marginTop: 0 }}>ℹ️ Hướng dẫn</h3>
                <ul style={{ marginBottom: 0, lineHeight: '1.8' }}>
                    <li><strong>Tên đăng nhập:</strong> Sinh viên sẽ dùng để login</li>
                    <li><strong>Mã sinh viên:</strong> Dùng để quản lý và lưu trữ văn bằng</li>
                    <li><strong>Enrollment Secret:</strong> Sinh viên dùng để kích hoạt tài khoản</li>
                    <li><strong>Kích hoạt:</strong> Sinh viên truy cập trang Enroll để kích hoạt</li>
                </ul>
            </div>
        </div>
    );
};

export default CreateStudent;
