import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transcriptAPI } from '../services/api';

const ViewTranscript = () => {
    const { user } = useAuth();
    const [studentId, setStudentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [transcript, setTranscript] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) {
            setError('Vui lòng nhập mã sinh viên');
            return;
        }

        setError('');
        setTranscript(null);
        setLoading(true);

        try {
            const result = await transcriptAPI.get(studentId);
            if (result.success) {
                setTranscript(result.transcript);
            } else {
                setError(result.error || 'Không tìm thấy bảng điểm');
            }
        } catch (err) {
            setError(err.message || 'Lấy bảng điểm thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <h1 className="mb-lg">📊 Xem bảng điểm</h1>

                <div className="card mb-lg" style={{ maxWidth: '600px' }}>
                    <form onSubmit={handleSearch}>
                        <div className="form-group">
                            <label className="form-label">Mã sinh viên</label>
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    className="form-input"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="VD: CT070211"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? '...' : '🔍 Tìm'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {transcript && (
                    <div className="grid grid-2">
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Thông tin sinh viên</h2>
                            </div>
                            <dl className="degree-details">
                                <dt>Mã sinh viên</dt>
                                <dd><strong>{transcript.studentId}</strong></dd>

                                <dt>Điểm GPA</dt>
                                <dd>
                                    <span className="status status-active" style={{ fontSize: '1rem', padding: '4px 12px' }}>
                                        {transcript.gpa}
                                    </span>
                                </dd>

                                {transcript.personalInfo && (
                                    <>
                                        {transcript.personalInfo.dateOfBirth && (
                                            <>
                                                <dt>Ngày sinh</dt>
                                                <dd>{transcript.personalInfo.dateOfBirth}</dd>
                                            </>
                                        )}
                                        {transcript.personalInfo.gender && (
                                            <>
                                                <dt>Giới tính</dt>
                                                <dd>{transcript.personalInfo.gender}</dd>
                                            </>
                                        )}
                                        {transcript.personalInfo.nationality && (
                                            <>
                                                <dt>Quốc tịch</dt>
                                                <dd>{transcript.personalInfo.nationality}</dd>
                                            </>
                                        )}
                                        {transcript.personalInfo.contactInfo && (
                                            <>
                                                <dt>Liên hệ</dt>
                                                <dd>{transcript.personalInfo.contactInfo}</dd>
                                            </>
                                        )}
                                        {transcript.personalInfo.citizenId && (
                                            <>
                                                <dt>CCCD</dt>
                                                <dd>{transcript.personalInfo.citizenId}</dd>
                                            </>
                                        )}
                                    </>
                                )}
                            </dl>
                        </div>

                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">Điểm chi tiết các môn</h2>
                            </div>
                            {(() => {
                                // Support both 'detailedGrades' and 'transcript' keys for grades data
                                const gradesData = transcript.detailedGrades || transcript.transcript || {};
                                return Object.keys(gradesData).length > 0 ? (
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Môn học</th>
                                                    <th style={{ textAlign: 'center' }}>Điểm</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(gradesData).map(([subject, grade]) => (
                                                    <tr key={subject}>
                                                        <td>{subject}</td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <strong>{grade}</strong>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="empty-state">
                                        <p>Không có dữ liệu điểm chi tiết</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                )}

                {!transcript && !error && !loading && (
                    <div className="card">
                        <div className="empty-state">
                            <div className="empty-state-icon">📊</div>
                            <p>Nhập mã sinh viên để xem bảng điểm</p>
                            <p className="form-hint">
                                Dữ liệu bảng điểm được lưu trong Private Data Collection và chỉ người có quyền mới xem được.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTranscript;
