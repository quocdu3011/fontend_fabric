import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { transcriptAPI } from '../services/api';

const Transcripts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        gpa: '',
    });
    const [grades, setGrades] = useState([
        { subject: '', grade: '' }
    ]);
    const [personalInfo, setPersonalInfo] = useState({
        university: 'Học viện Kỹ thuật Mật mã',
        major: '',
        dateOfBirth: '',
        gender: 'Nam',
        nationality: 'Việt Nam',
        contactInfo: '',
        citizenId: '',
    });

    // Check if user is admin
    if (user?.ou !== 'admin') {
        return (
            <div className="page">
                <div className="container">
                    <div className="card">
                        <div className="alert alert-error">
                            ⛔ Chỉ Admin mới có quyền thêm bảng điểm.
                        </div>
                        <p className="mt-md mb-lg">
                            Nếu bạn là sinh viên và muốn sửa bảng điểm, vui lòng gửi yêu cầu sửa điểm.
                        </p>
                        <div className="flex gap-sm">
                            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                                Quay lại Dashboard
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/request-correction')}>
                                📝 Gửi yêu cầu sửa điểm
                            </button>
                        </div>
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

    const handlePersonalInfoChange = (e) => {
        setPersonalInfo({
            ...personalInfo,
            [e.target.name]: e.target.value,
        });
    };

    const handleGradeChange = (index, field, value) => {
        const newGrades = [...grades];
        newGrades[index][field] = value;
        setGrades(newGrades);
    };

    const addGrade = () => {
        setGrades([...grades, { subject: '', grade: '' }]);
    };

    const removeGrade = (index) => {
        if (grades.length > 1) {
            setGrades(grades.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(null);

        // Validate required personalInfo fields
        if (!personalInfo.university.trim()) {
            setError('Vui lòng nhập tên trường (university)');
            return;
        }
        if (!personalInfo.major.trim()) {
            setError('Vui lòng nhập ngành học (major)');
            return;
        }
        if (!personalInfo.dateOfBirth.trim()) {
            setError('Vui lòng nhập ngày sinh (dateOfBirth)');
            return;
        }
        if (!personalInfo.gender.trim()) {
            setError('Vui lòng chọn giới tính (gender)');
            return;
        }

        setLoading(true);

        // Convert grades array to object
        const detailedGrades = {};
        grades.forEach(g => {
            if (g.subject.trim() && g.grade.trim()) {
                detailedGrades[g.subject] = g.grade;
            }
        });

        if (Object.keys(detailedGrades).length === 0) {
            setError('Vui lòng nhập ít nhất một môn học');
            setLoading(false);
            return;
        }

        try {
            const result = await transcriptAPI.add({
                studentId: formData.studentId,
                gpa: formData.gpa,
                detailedGrades,
                personalInfo,
            });

            if (result.success) {
                setSuccess(result);
                // Reset form
                setFormData({ studentId: '', gpa: '' });
                setGrades([{ subject: '', grade: '' }]);
            }
        } catch (err) {
            setError(err.message || 'Thêm bảng điểm thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>📋 Thêm bảng điểm (Admin)</h1>
                        <p className="text-secondary">Thêm bảng điểm sinh viên vào Private Data Collection</p>
                    </div>
                </div>

                <div className="grid grid-2">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Thông tin bảng điểm</h2>
                            <p className="card-subtitle">Các trường có dấu * là bắt buộc</p>
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
                            </div>

                            <div className="form-group">
                                <label className="form-label">Điểm GPA *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    name="gpa"
                                    value={formData.gpa}
                                    onChange={handleChange}
                                    placeholder="VD: 3.8"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Điểm chi tiết các môn *</label>
                                <div className="dynamic-fields">
                                    {grades.map((grade, index) => (
                                        <div key={index} className="dynamic-field-row">
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Tên môn học"
                                                value={grade.subject}
                                                onChange={(e) => handleGradeChange(index, 'subject', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Điểm"
                                                value={grade.grade}
                                                onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                                                style={{ maxWidth: '80px' }}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() => removeGrade(index)}
                                                disabled={grades.length === 1}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" className="add-field-btn" onClick={addGrade}>
                                        + Thêm môn học
                                    </button>
                                </div>
                            </div>

                            <hr style={{ margin: '24px 0', borderColor: 'var(--border)' }} />

                            <h3 className="mb-md">Thông tin cá nhân (Bắt buộc)</h3>

                            <div className="grid grid-2" style={{ gap: '12px' }}>
                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Trường (university) *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="university"
                                        value={personalInfo.university}
                                        onChange={handlePersonalInfoChange}
                                        placeholder="Học viện Kỹ thuật Mật mã"
                                        required
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">Ngành học (major) *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="major"
                                        value={personalInfo.major}
                                        onChange={handlePersonalInfoChange}
                                        placeholder="An toàn thông tin"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Ngày sinh (dateOfBirth) *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="dateOfBirth"
                                        value={personalInfo.dateOfBirth}
                                        onChange={handlePersonalInfoChange}
                                        placeholder="2004-11-30"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Giới tính (gender) *</label>
                                    <select
                                        className="form-input form-select"
                                        name="gender"
                                        value={personalInfo.gender}
                                        onChange={handlePersonalInfoChange}
                                        required
                                    >
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Quốc tịch</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="nationality"
                                        value={personalInfo.nationality}
                                        onChange={handlePersonalInfoChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email/SĐT</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="contactInfo"
                                        value={personalInfo.contactInfo}
                                        onChange={handlePersonalInfoChange}
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                    <label className="form-label">CCCD/CMND</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        name="citizenId"
                                        value={personalInfo.citizenId}
                                        onChange={handlePersonalInfoChange}
                                        placeholder="012345678901"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block mt-lg"
                                disabled={loading}
                            >
                                {loading ? 'Đang lưu...' : '📋 Lưu bảng điểm'}
                            </button>
                        </form>
                    </div>

                    <div>
                        {success ? (
                            <div className="card">
                                <div className="verification-result valid">
                                    <div className="verification-icon">✅</div>
                                    <h2 className="verification-title">Lưu thành công!</h2>
                                </div>

                                <div className="mt-lg">
                                    <h3 className="mb-md">Thông tin giao dịch</h3>

                                    <div className="form-group">
                                        <label className="form-label">Transaction ID</label>
                                        <code className="code-block" style={{ display: 'block', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                            {success.transactionId}
                                        </code>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Transcript Hash</label>
                                        {success.transcriptHash ? (
                                            <>
                                                <code className="code-block" style={{ display: 'block', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                                    {success.transcriptHash}
                                                </code>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary btn-sm mt-sm"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(success.transcriptHash);
                                                        alert('Đã sao chép Hash!');
                                                    }}
                                                >
                                                    📋 Sao chép Hash
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-secondary">
                                                Hash chưa được tạo.
                                            </span>
                                        )}
                                    </div>

                                    <div className="alert alert-info mt-md">
                                        <strong>💡 Sử dụng Hash:</strong>
                                        <p style={{ marginTop: '4px' }}>
                                            Sao chép <strong>Transcript Hash</strong> ở trên và dán vào trường
                                            "Hash bảng điểm" khi cấp bằng để liên kết văn bằng với bảng điểm.
                                        </p>
                                    </div>

                                    <button
                                        className="btn btn-primary mt-md"
                                        onClick={() => window.location.href = '/issue-degree'}
                                    >
                                        🎓 Đến trang Cấp bằng
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Các trường bắt buộc</h2>
                                </div>
                                <div className="alert alert-warning">
                                    <strong>⚠️ Lưu ý:</strong>
                                    <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                        <li><strong>university</strong> - Tên trường</li>
                                        <li><strong>major</strong> - Ngành học</li>
                                        <li><strong>dateOfBirth</strong> - Ngày sinh</li>
                                        <li><strong>gender</strong> - Giới tính</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transcripts;
