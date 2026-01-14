import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { degreeAPI, transcriptAPI, qrCodeAPI } from '../services/api';

const MyRecords = () => {
    const { user } = useAuth();
    const [degrees, setDegrees] = useState([]);
    const [transcript, setTranscript] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('degrees');

    // QR Code state
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError('');

        try {
            // Fetch both degrees and transcript in parallel
            const [degreesResult, transcriptResult] = await Promise.allSettled([
                degreeAPI.getMyDegrees(),
                transcriptAPI.getMyTranscript()
            ]);

            if (degreesResult.status === 'fulfilled' && degreesResult.value.success) {
                setDegrees(degreesResult.value.degrees || []);
            }

            if (transcriptResult.status === 'fulfilled' && transcriptResult.value.success) {
                setTranscript(transcriptResult.value.transcript);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleShowQrCode = async (degreeId) => {
        setQrLoading(true);
        try {
            const result = await qrCodeAPI.generate(degreeId);
            if (result.success) {
                setQrData(result);
                setShowQrModal(true);
            }
        } catch (err) {
            setError(err.message || 'Không thể tạo QR code');
        } finally {
            setQrLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page">
                <div className="container text-center">
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                    <p className="mt-md">Đang tải hồ sơ của bạn...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>📚 Hồ sơ của tôi</h1>
                        <p className="text-secondary">
                            Xin chào, <strong>{user?.username}</strong>! Đây là văn bằng và bảng điểm của bạn.
                        </p>
                    </div>
                    <button className="btn btn-secondary" onClick={fetchData}>
                        🔄 Làm mới
                    </button>
                </div>

                {error && <div className="alert alert-error mb-lg">{error}</div>}

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'degrees' ? 'active' : ''}`}
                        onClick={() => setActiveTab('degrees')}
                    >
                        🎓 Văn bằng ({degrees.length})
                    </button>
                    <button
                        className={`tab ${activeTab === 'transcript' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transcript')}
                    >
                        📋 Bảng điểm
                    </button>
                </div>

                {/* Degrees Tab */}
                {activeTab === 'degrees' && (
                    <div>
                        {degrees.length === 0 ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-state-icon">🎓</div>
                                    <p>Bạn chưa có văn bằng nào được cấp.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-2">
                                {degrees.map((degree, index) => (
                                    <div key={degree.degreeId || index} className="card">
                                        <div className="flex-between mb-md">
                                            <span className={`status ${degree.status === 'ACTIVE' ? 'status-active' : 'status-revoked'}`}>
                                                {degree.status || 'ACTIVE'}
                                            </span>
                                            <span className="form-hint">{degree.issueDate}</span>
                                        </div>

                                        <h3 style={{ marginBottom: '8px' }}>{degree.degreeType}</h3>
                                        <p className="form-hint" style={{ marginBottom: '16px' }}>{degree.degreeId}</p>

                                        <dl className="degree-details">
                                            <dt>Họ và tên</dt>
                                            <dd>{degree.studentName}</dd>

                                            <dt>Trường</dt>
                                            <dd>{degree.universityName}</dd>

                                            <dt>Ngành</dt>
                                            <dd>{degree.major}</dd>

                                            <dt>Xếp loại</dt>
                                            <dd>
                                                <span className="status status-active">{degree.classification}</span>
                                            </dd>
                                        </dl>

                                        <div className="action-buttons mt-md">
                                            <button
                                                className="btn btn-secondary btn-sm"
                                                onClick={() => handleShowQrCode(degree.degreeId)}
                                                disabled={qrLoading}
                                            >
                                                {qrLoading ? '...' : '📱 QR Code'}
                                            </button>
                                            <a
                                                href={`/verify/${degree.degreeId}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-secondary btn-sm"
                                            >
                                                🔗 Link xác thực
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Transcript Tab */}
                {activeTab === 'transcript' && (
                    <div>
                        {!transcript ? (
                            <div className="card">
                                <div className="empty-state">
                                    <div className="empty-state-icon">📋</div>
                                    <p>Không tìm thấy bảng điểm của bạn.</p>
                                </div>
                            </div>
                        ) : (
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
                                            <span className="status status-active" style={{ fontSize: '1.25rem', padding: '6px 16px' }}>
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
                                            </>
                                        )}
                                    </dl>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">Điểm chi tiết các môn</h2>
                                    </div>
                                    {transcript.detailedGrades && Object.keys(transcript.detailedGrades).length > 0 ? (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Môn học</th>
                                                        <th style={{ textAlign: 'center' }}>Điểm</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(transcript.detailedGrades).map(([subject, grade]) => (
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
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* QR Code Modal */}
            {showQrModal && qrData && (
                <div className="modal-overlay" onClick={() => setShowQrModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">📱 QR Code xác thực</h3>
                            <button className="modal-close" onClick={() => setShowQrModal(false)}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="qr-code-container">
                                <img src={qrData.qrCode} alt="QR Code xác thực văn bằng" />
                                <p className="mt-md"><strong>Mã bằng:</strong> {qrData.degreeId}</p>
                                <p className="qr-code-url">{qrData.verificationUrl}</p>
                            </div>
                            <div className="alert alert-info mt-md">
                                Quét mã QR này để xác thực văn bằng của bạn. Có thể chia sẻ cho nhà tuyển dụng hoặc bên thứ ba.
                            </div>
                        </div>
                        <div className="modal-footer">
                            <a
                                href={qrData.qrCode}
                                download={`qrcode-${qrData.degreeId}.png`}
                                className="btn btn-primary"
                            >
                                📥 Tải QR Code
                            </a>
                            <button className="btn btn-secondary" onClick={() => setShowQrModal(false)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyRecords;

