import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { degreeAPI } from '../services/api';

const VerifyDegree = () => {
    const [searchParams] = useSearchParams();
    const [degreeId, setDegreeId] = useState(searchParams.get('id') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setDegreeId(id);
            handleVerify(id);
        }
    }, [searchParams]);

    const handleVerify = async (id = degreeId) => {
        if (!id.trim()) {
            setError('Vui lòng nhập mã bằng');
            return;
        }

        setError('');
        setResult(null);
        setLoading(true);

        try {
            const data = await degreeAPI.verify(id);
            setResult(data);
        } catch (err) {
            if (err.status === 404) {
                setResult({ verified: false, notFound: true });
            } else {
                setError(err.message || 'Xác thực thất bại');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleVerify();
    };

    return (
        <div className="page">
            <div className="container">
                <div className="text-center mb-lg">
                    <h1>🔍 Xác thực văn bằng</h1>
                    <p className="text-secondary">Nhập mã bằng để kiểm tra tính hợp lệ</p>
                </div>

                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <div className="card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Mã bằng (Degree ID)</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={degreeId}
                                    onChange={(e) => setDegreeId(e.target.value)}
                                    placeholder="VD: VN.KMA.2025.001"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Đang xác thực...
                                    </>
                                ) : (
                                    '🔍 Xác thực'
                                )}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-lg">{error}</div>
                    )}

                    {result && (
                        <div className="card mt-lg">
                            {result.notFound ? (
                                <div className="verification-result invalid">
                                    <div className="verification-icon">❌</div>
                                    <h2 className="verification-title">Không tìm thấy</h2>
                                    <p className="mt-md">Mã bằng "{degreeId}" không tồn tại trong hệ thống.</p>
                                </div>
                            ) : result.verified ? (
                                <>
                                    <div className="verification-result valid">
                                        <div className="verification-icon">✅</div>
                                        <h2 className="verification-title">Văn bằng hợp lệ</h2>
                                    </div>

                                    <div className="mt-lg">
                                        <h3 className="mb-md">Thông tin văn bằng</h3>
                                        <dl className="degree-details">
                                            <dt>Mã bằng</dt>
                                            <dd><strong>{result.degree?.degreeId}</strong></dd>

                                            <dt>Loại bằng</dt>
                                            <dd>{result.degree?.degreeType}</dd>

                                            <dt>Họ và tên</dt>
                                            <dd>{result.degree?.studentName}</dd>

                                            <dt>Trường</dt>
                                            <dd>{result.degree?.university}</dd>

                                            <dt>Ngành</dt>
                                            <dd>{result.degree?.major}</dd>

                                            <dt>Xếp loại</dt>
                                            <dd>
                                                <span className="status status-active">
                                                    {result.degree?.classification}
                                                </span>
                                            </dd>

                                            <dt>Ngày cấp</dt>
                                            <dd>{result.degree?.issueDate}</dd>

                                            <dt>Trạng thái</dt>
                                            <dd>
                                                <span className={`status ${result.degree?.status === 'ACTIVE' ? 'status-active' : 'status-revoked'}`}>
                                                    {result.degree?.status || 'ACTIVE'}
                                                </span>
                                            </dd>

                                            {result.degree?.transcriptHash && (
                                                <>
                                                    <dt>Hash bảng điểm</dt>
                                                    <dd>
                                                        <code className="code-block">{result.degree.transcriptHash}</code>
                                                    </dd>
                                                </>
                                            )}
                                        </dl>
                                    </div>
                                </>
                            ) : (
                                <div className="verification-result invalid">
                                    <div className="verification-icon">⚠️</div>
                                    <h2 className="verification-title">Văn bằng đã bị thu hồi</h2>
                                    <p className="mt-md">Văn bằng này không còn hiệu lực.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyDegree;
