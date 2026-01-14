import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { versioningAPI } from '../services/api';

const TranscriptHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [studentId, setStudentId] = useState('');
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canAccess = user?.ou === 'admin' || user?.ou === 'student' || user?.ou === 'client';

    const fetchHistory = async (e) => {
        e.preventDefault();

        // Students can only view their own transcript
        const searchId = user?.ou === 'student' ? user?.studentId : studentId;

        if (!searchId?.trim()) {
            setError('Vui lòng nhập mã sinh viên');
            return;
        }

        setLoading(true);
        setError('');
        setHistory(null);

        try {
            const result = await versioningAPI.getTranscriptHistory(searchId);
            if (result.success) {
                setHistory(result.history);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải lịch sử');
        } finally {
            setLoading(false);
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
                        <h1>📋 Lịch sử bảng điểm</h1>
                        <p className="text-secondary">
                            Xem lịch sử thay đổi của bảng điểm
                        </p>
                    </div>
                </div>

                <div className="card mb-lg">
                    <form onSubmit={fetchHistory}>
                        <div className="flex gap-md">
                            {user?.ou === 'student' ? (
                                <input
                                    type="text"
                                    className="form-input"
                                    value={user?.studentId || ''}
                                    disabled
                                    style={{ flex: 1 }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nhập mã sinh viên (VD: CT070211)"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    style={{ flex: 1 }}
                                />
                            )}
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
                            <h2 className="card-title">Bảng điểm: {history.studentId}</h2>
                            <p className="card-subtitle">
                                Tổng cộng {history.versions?.length || 0} phiên bản
                            </p>
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
                                            <dd>{version.data.studentName}</dd>
                                            <dt>GPA</dt>
                                            <dd><strong>{version.data.gpa}</strong></dd>
                                            <dt>Số môn học</dt>
                                            <dd>{version.data.courses?.length || 0}</dd>
                                        </dl>
                                    )}

                                    {/* Courses table for this version */}
                                    {version.data?.courses && version.data.courses.length > 0 && (
                                        <details className="mt-sm">
                                            <summary style={{ cursor: 'pointer', color: 'var(--primary)' }}>
                                                Xem chi tiết môn học
                                            </summary>
                                            <div className="table-container mt-sm">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Mã môn</th>
                                                            <th>Tên môn</th>
                                                            <th>Tín chỉ</th>
                                                            <th>Điểm</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {version.data.courses.map((course, i) => (
                                                            <tr key={i}>
                                                                <td>{course.courseId}</td>
                                                                <td>{course.courseName}</td>
                                                                <td>{course.credits}</td>
                                                                <td>{course.grade}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </details>
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

export default TranscriptHistory;
