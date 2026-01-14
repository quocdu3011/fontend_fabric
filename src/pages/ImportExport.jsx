import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bulkAPI } from '../services/api';

const ImportExport = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [importResult, setImportResult] = useState(null);
    const [previewData, setPreviewData] = useState(null);

    // Check if user is admin
    const isAdmin = user?.ou === 'admin';
    const canAccess = user?.ou === 'admin' || user?.ou === 'reviewer';

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

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                const headers = lines[0].split(',').map(h => h.trim());

                const data = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    const row = {};
                    headers.forEach((header, index) => {
                        row[header] = values[index] || '';
                    });
                    return row;
                });

                setPreviewData({ headers, data });
                setError('');
            } catch (err) {
                setError('Không thể đọc file CSV');
                setPreviewData(null);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!previewData?.data?.length) {
            setError('Không có dữ liệu để import');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');
        setImportResult(null);

        try {
            const result = await bulkAPI.importCSV(previewData.data);
            if (result.success) {
                setImportResult(result.result);
                setSuccess(`Import thành công ${result.result.successful?.length || 0} đề xuất!`);
                setPreviewData(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        } catch (err) {
            setError(err.message || 'Import thất bại');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type, params = {}) => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let blob;
            let filename;

            switch (type) {
                case 'degrees':
                    blob = await bulkAPI.exportDegrees();
                    filename = 'degrees_export.csv';
                    break;
                default:
                    throw new Error('Unknown export type');
            }

            // Download the blob
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setSuccess(`Đã tải xuống ${filename}`);
        } catch (err) {
            setError(err.message || 'Export thất bại');
        } finally {
            setLoading(false);
        }
    };

    const [exportDegreeId, setExportDegreeId] = useState('');

    return (
        <div className="page">
            <div className="container">
                <div className="flex-between mb-lg">
                    <div>
                        <h1>📥 Import / Export</h1>
                        <p className="text-secondary">
                            Import từ CSV và export dữ liệu ra file
                        </p>
                    </div>
                </div>

                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="grid grid-2">
                    {/* Import Section - Admin only */}
                    {isAdmin && (
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title">📤 Import từ CSV</h2>
                                <p className="card-subtitle">Upload file CSV để tạo đề xuất hàng loạt</p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Chọn file CSV</label>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    className="form-input"
                                    onChange={handleFileSelect}
                                />
                                <p className="form-hint">
                                    Định dạng: proposalId, degreeId, studentId, studentName, degreeType, university, major, classification, issueDate, deadlineDays
                                </p>
                            </div>

                            {previewData && (
                                <div className="mt-md">
                                    <h4>Xem trước ({previewData.data.length} dòng):</h4>
                                    <div className="table-container mt-sm" style={{ maxHeight: '200px', overflow: 'auto' }}>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    {previewData.headers.map((h, i) => (
                                                        <th key={i}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {previewData.data.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        {previewData.headers.map((h, j) => (
                                                            <td key={j}>{row[h]}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <button
                                        className="btn btn-primary mt-md"
                                        onClick={handleImport}
                                        disabled={loading}
                                    >
                                        {loading ? 'Đang import...' : `📤 Import ${previewData.data.length} dòng`}
                                    </button>
                                </div>
                            )}

                            {importResult && (
                                <div className={`import-result mt-md ${importResult.failed?.length > 0 ? 'error' : 'success'}`}>
                                    <p>✅ Thành công: {importResult.successful?.length || 0}</p>
                                    {importResult.failed?.length > 0 && (
                                        <p>❌ Thất bại: {importResult.failed.length}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Export Section */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">📥 Export ra CSV</h2>
                            <p className="card-subtitle">Tải xuống dữ liệu dạng CSV</p>
                        </div>

                        <div className="form-group">
                            <h4 className="mb-sm">Export văn bằng</h4>
                            <button
                                className="btn btn-secondary"
                                onClick={() => handleExport('degrees')}
                                disabled={loading}
                            >
                                📥 Tải tất cả văn bằng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportExport;
