import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await authAPI.getProfile();
            if (data.success) {
                setProfile(data.profile);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container text-center">
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p className="mt-md">Đang tải hồ sơ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <h1 className="mb-lg">👤 Hồ sơ người dùng</h1>

                {error && <div className="alert alert-error">{error}</div>}

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thông tin tài khoản</h2>
                        </div>

                        <dl className="degree-details">
                            <dt>Tên đăng nhập</dt>
                            <dd><strong>{profile?.username || user?.username}</strong></dd>

                            <dt>Vai trò</dt>
                            <dd>
                                <span className={`user-role ${profile?.ou || user?.ou}`}>
                                    {profile?.role || profile?.ou || user?.ou}
                                </span>
                            </dd>

                            <dt>MSP ID</dt>
                            <dd>{profile?.mspId || user?.mspId || 'Org1MSP'}</dd>

                            <dt>Trạng thái Enroll</dt>
                            <dd>
                                <span className={`status ${profile?.enrolled ? 'status-active' : 'status-pending'}`}>
                                    {profile?.enrolled ? 'Đã Enroll' : 'Chưa Enroll'}
                                </span>
                            </dd>

                            {profile?.createdAt && (
                                <>
                                    <dt>Ngày tạo</dt>
                                    <dd>{new Date(profile.createdAt).toLocaleString('vi-VN')}</dd>
                                </>
                            )}

                            {profile?.enrolledAt && (
                                <>
                                    <dt>Ngày Enroll</dt>
                                    <dd>{new Date(profile.enrolledAt).toLocaleString('vi-VN')}</dd>
                                </>
                            )}
                        </dl>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Chứng chỉ X.509</h2>
                        </div>

                        {profile?.certificateInfo ? (
                            <dl className="degree-details">
                                <dt>Common Name (CN)</dt>
                                <dd>{profile.certificateInfo.cn}</dd>

                                <dt>Hiệu lực từ</dt>
                                <dd>{profile.certificateInfo.validFrom ? new Date(profile.certificateInfo.validFrom).toLocaleString('vi-VN') : 'N/A'}</dd>

                                <dt>Hiệu lực đến</dt>
                                <dd>{profile.certificateInfo.validTo ? new Date(profile.certificateInfo.validTo).toLocaleString('vi-VN') : 'N/A'}</dd>

                                <dt>Serial Number</dt>
                                <dd>
                                    <code className="code-block">{profile.certificateInfo.serialNumber || 'N/A'}</code>
                                </dd>
                            </dl>
                        ) : (
                            <div className="alert alert-warning">
                                Không có thông tin chứng chỉ. Vui lòng enroll để có chứng chỉ.
                            </div>
                        )}
                    </div>

                    <div className="card" style={{ gridColumn: 'span 2' }}>
                        <div className="card-header">
                            <h2 className="card-title">Quyền hạn theo vai trò</h2>
                        </div>

                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Tính năng</th>
                                        <th>Admin</th>
                                        <th>Student</th>
                                        <th>Client</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Cấp bằng (POST /api/degrees)</td>
                                        <td><span className="status status-active">✓</span></td>
                                        <td><span className="status status-revoked">✗</span></td>
                                        <td><span className="status status-revoked">✗</span></td>
                                    </tr>
                                    <tr>
                                        <td>Thêm bảng điểm (POST /api/transcripts)</td>
                                        <td><span className="status status-active">✓</span></td>
                                        <td><span className="status status-active">✓</span></td>
                                        <td><span className="status status-revoked">✗</span></td>
                                    </tr>
                                    <tr>
                                        <td>Xác thực bằng (GET /api/verify)</td>
                                        <td><span className="status status-active">✓</span></td>
                                        <td><span className="status status-active">✓</span></td>
                                        <td><span className="status status-active">✓</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <p className="form-hint mt-md">
                            Vai trò hiện tại của bạn: <strong className={`user-role ${user?.ou}`}>{user?.ou}</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
