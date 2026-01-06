import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Enroll = () => {
    const [formData, setFormData] = useState({
        username: '',
        enrollmentSecret: '',
    });
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.username.trim() || !formData.enrollmentSecret.trim()) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);

        try {
            const result = await authAPI.enroll(
                formData.username.trim(),
                formData.enrollmentSecret.trim()
            );

            if (result.success) {
                setSuccess('✅ Kích hoạt tài khoản thành công! Đang chuyển đến trang đăng nhập...');
                
                // Reset form
                setFormData({
                    username: '',
                    enrollmentSecret: '',
                });

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.message || 'Kích hoạt tài khoản thất bại');
            console.error('Enroll error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <h1>🔐 Kích hoạt tài khoản</h1>
                        <p className="subtitle">
                            Sử dụng thông tin mà quản trị viên đã cung cấp để kích hoạt tài khoản của bạn
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
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
                                autoFocus
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Enrollment Secret *</label>
                            <input
                                type="text"
                                className="form-input"
                                name="enrollmentSecret"
                                value={formData.enrollmentSecret}
                                onChange={handleChange}
                                placeholder="Nhập enrollment secret từ admin"
                                required
                                disabled={loading}
                            />
                            <p className="form-hint">
                                Đây là mã bí mật mà quản trị viên đã gửi cho bạn khi tạo tài khoản
                            </p>
                        </div>

                        <div className="form-group">
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? '⏳ Đang kích hoạt...' : '🚀 Kích hoạt tài khoản'}
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Đã kích hoạt tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>

                <div className="info-card">
                    <h3>ℹ️ Hướng dẫn kích hoạt</h3>
                    <ul>
                        <li>
                            <strong>Bước 1:</strong> Nhận thông tin tài khoản từ quản trị viên (bao gồm username và enrollment secret)
                        </li>
                        <li>
                            <strong>Bước 2:</strong> Nhập username và enrollment secret vào form trên
                        </li>
                        <li>
                            <strong>Bước 3:</strong> Nhấn "Kích hoạt tài khoản" và đợi hệ thống xử lý
                        </li>
                        <li>
                            <strong>Bước 4:</strong> Sau khi kích hoạt thành công, đăng nhập với username và password
                        </li>
                    </ul>
                    
                    <div style={{ marginTop: '20px', padding: '12px', background: '#fff3cd', borderRadius: '8px', borderLeft: '4px solid #ffc107' }}>
                        <strong>⚠️ Lưu ý:</strong>
                        <p style={{ marginBottom: 0, marginTop: '8px' }}>
                            Enrollment secret chỉ sử dụng được một lần. Nếu gặp lỗi, vui lòng liên hệ quản trị viên để được hỗ trợ.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .auth-container {
                    max-width: 900px;
                    margin: 40px auto;
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                    align-items: start;
                }

                @media (max-width: 768px) {
                    .auth-container {
                        grid-template-columns: 1fr;
                    }
                }

                .auth-card {
                    background: white;
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .auth-header h1 {
                    margin: 0 0 12px 0;
                    font-size: 28px;
                    color: #2c3e50;
                }

                .subtitle {
                    color: #7f8c8d;
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.6;
                }

                .auth-form {
                    margin-bottom: 24px;
                }

                .auth-footer {
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #ecf0f1;
                }

                .auth-footer p {
                    margin: 0;
                    color: #7f8c8d;
                }

                .auth-footer a {
                    color: #3498db;
                    text-decoration: none;
                    font-weight: 500;
                }

                .auth-footer a:hover {
                    text-decoration: underline;
                }

                .info-card {
                    background: #f8f9fa;
                    border-radius: 12px;
                    padding: 30px;
                }

                .info-card h3 {
                    margin-top: 0;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }

                .info-card ul {
                    padding-left: 20px;
                    line-height: 1.8;
                    color: #495057;
                }

                .info-card li {
                    margin-bottom: 12px;
                }

                .info-card strong {
                    color: #2c3e50;
                }
            `}</style>
        </div>
    );
};

export default Enroll;
