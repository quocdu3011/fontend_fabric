import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { publicVerifyAPI } from '../services/api';

const PublicVerify = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();

    const [degreeId, setDegreeId] = useState(id || searchParams.get('id') || '');
    const [batchIds, setBatchIds] = useState('');
    const [result, setResult] = useState(null);
    const [batchResults, setBatchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('single');

    // Auto-verify if ID is provided in URL
    useEffect(() => {
        if (id) {
            handleVerify(id);
        }
    }, [id]);

    const handleVerify = async (verifyId = degreeId) => {
        if (!verifyId?.trim()) {
            setError('Vui lòng nhập mã bằng');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await publicVerifyAPI.verify(verifyId.trim());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Lỗi xác thực');
        } finally {
            setLoading(false);
        }
    };

    const handleBatchVerify = async () => {
        if (!batchIds.trim()) {
            setError('Vui lòng nhập danh sách mã bằng');
            return;
        }

        const ids = batchIds.split(/[,\n]/).map(id => id.trim()).filter(id => id);

        if (ids.length === 0) {
            setError('Không tìm thấy mã bằng hợp lệ');
            return;
        }

        setLoading(true);
        setError('');
        setBatchResults(null);

        try {
            const data = await publicVerifyAPI.batchVerify(ids);
            if (data.success) {
                setBatchResults(data.results);
            }
        } catch (err) {
            setError(err.message || 'Lỗi xác thực');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="container public-verify-container">
                <div className="text-center mb-lg">
                    <h1>🔍 Xác thực văn bằng</h1>
                    <p className="text-secondary">
                        Cổng xác thực công khai - Kiểm tra tính xác thực của văn bằng số
                    </p>
                </div>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'single' ? 'active' : ''}`}
                        onClick={() => setActiveTab('single')}
                    >
                        Xác thực đơn lẻ
                    </button>
                    <button
                        className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
                        onClick={() => setActiveTab('batch')}
                    >
                        Xác thực hàng loạt
                    </button>
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {/* Single Verification */}
                {activeTab === 'single' && (
                    <div className="card">
                        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }}>
                            <div className="form-group">
                                <label className="form-label">Mã văn bằng</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nhập mã bằng (VD: DEG-001, VN.KMA.2025.001)"
                                    value={degreeId}
                                    onChange={(e) => setDegreeId(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-block"
                                disabled={loading}
                            >
                                {loading ? 'Đang xác thực...' : '🔍 Xác thực'}
                            </button>
                        </form>

                        {/* Single Result */}
                        {result && (
                            <div className="mt-lg">
                                <div className={`verification-result ${result.verified ? 'valid' : 'invalid'}`}>
                                    <div className="verification-icon">
                                        {result.verified ? '✅' : '❌'}
                                    </div>
                                    <h2 className="verification-title">
                                        {result.verified ? 'Văn bằng hợp lệ' : 'Không tìm thấy văn bằng'}
                                    </h2>
                                </div>

                                {result.verified && (
                                    <div className="mt-lg">
                                        <h3 className="mb-md">Thông tin văn bằng</h3>
                                        <dl className="degree-details">
                                            <dt>Mã bằng</dt>
                                            <dd><strong>{result.degreeId}</strong></dd>
                                            <dt>Sinh viên</dt>
                                            <dd>{result.studentName}</dd>
                                            <dt>Mã sinh viên</dt>
                                            <dd>{result.studentId}</dd>
                                            <dt>Loại bằng</dt>
                                            <dd>{result.degreeType}</dd>
                                            <dt>Trường</dt>
                                            <dd>{result.university}</dd>
                                            <dt>Ngành</dt>
                                            <dd>{result.major}</dd>
                                            <dt>Xếp loại</dt>
                                            <dd>{result.classification}</dd>
                                            <dt>Ngày cấp</dt>
                                            <dd>{result.issueDate}</dd>
                                            <dt>Trạng thái</dt>
                                            <dd>
                                                <span className={`status ${result.isActive ? 'status-active' : 'status-revoked'}`}>
                                                    {result.isActive ? '✓ Còn hiệu lực' : '✗ Đã thu hồi'}
                                                </span>
                                            </dd>
                                            <dt>Thời điểm xác thực</dt>
                                            <dd>{new Date(result.verifiedAt).toLocaleString('vi-VN')}</dd>
                                        </dl>
                                    </div>
                                )}

                                {!result.verified && result.error && (
                                    <div className="alert alert-warning mt-lg">
                                        {result.error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Batch Verification */}
                {activeTab === 'batch' && (
                    <div className="card">
                        <div className="form-group">
                            <label className="form-label">Danh sách mã văn bằng</label>
                            <textarea
                                className="form-input form-textarea"
                                placeholder="Nhập các mã bằng, mỗi dòng một mã hoặc cách nhau bằng dấu phẩy&#10;VD:&#10;DEG-001&#10;DEG-002&#10;DEG-003"
                                value={batchIds}
                                onChange={(e) => setBatchIds(e.target.value)}
                                rows={5}
                            />
                            <p className="form-hint">Mỗi mã bằng trên một dòng hoặc cách nhau bằng dấu phẩy</p>
                        </div>
                        <button
                            className="btn btn-primary btn-lg btn-block"
                            onClick={handleBatchVerify}
                            disabled={loading}
                        >
                            {loading ? 'Đang xác thực...' : '🔍 Xác thực tất cả'}
                        </button>

                        {/* Batch Results */}
                        {batchResults && (
                            <div className="mt-lg">
                                <h3 className="mb-md">Kết quả xác thực ({batchResults.length} văn bằng)</h3>

                                {batchResults.map((item, index) => (
                                    <div
                                        key={index}
                                        className={`proposal-card ${item.verified ? '' : 'border-error'}`}
                                        style={{ borderLeftColor: item.verified ? 'var(--success)' : 'var(--error)', borderLeftWidth: '4px' }}
                                    >
                                        <div className="proposal-header">
                                            <div>
                                                <div className="proposal-id">{item.degreeId}</div>
                                                {item.verified && (
                                                    <div className="proposal-type">{item.studentName}</div>
                                                )}
                                            </div>
                                            <span className={`verification-badge ${item.verified ? 'verified' : 'not-verified'}`}>
                                                {item.verified ? '✓ Hợp lệ' : '✗ Không hợp lệ'}
                                            </span>
                                        </div>

                                        {item.verified && (
                                            <div className="proposal-meta">
                                                <span>{item.degreeType}</span>
                                                <span>{item.major}</span>
                                                <span>{item.university}</span>
                                            </div>
                                        )}

                                        {!item.verified && item.error && (
                                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
                                                {item.error}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer info */}
                <div className="text-center mt-lg text-secondary" style={{ fontSize: '0.875rem' }}>
                    <p>🔐 Dữ liệu được lưu trữ và xác thực trên mạng Blockchain</p>
                    <p>Liên hệ hỗ trợ nếu bạn phát hiện thông tin không chính xác</p>
                </div>
            </div>
        </div>
    );
};

export default PublicVerify;
