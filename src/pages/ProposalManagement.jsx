import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proposalAPI } from '../services/api';

const ProposalManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('status') || '');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(''); // 'approve', 'reject', 'amend'
    const [selectedProposal, setSelectedProposal] = useState(null);
    const [comments, setComments] = useState('');
    const [amendmentData, setAmendmentData] = useState({});
    const [amendmentReason, setAmendmentReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Check if user is admin or reviewer
    const canAccess = user?.ou === 'admin' || user?.ou === 'reviewer';
    const isAdmin = user?.ou === 'admin';

    const filters = [
        { value: '', label: 'Tất cả' },
        { value: 'PENDING', label: 'Chờ duyệt' },
        { value: 'APPROVED', label: 'Đã duyệt' },
        { value: 'REJECTED', label: 'Từ chối' },
        { value: 'COMMITTED', label: 'Đã xác nhận' },
        { value: 'EXPIRED', label: 'Hết hạn' },
    ];

    useEffect(() => {
        if (canAccess) {
            fetchProposals();
        }
    }, [activeFilter, canAccess]);

    const fetchProposals = async () => {
        try {
            setLoading(true);
            const result = await proposalAPI.getAll(activeFilter || undefined);
            if (result.success) {
                setProposals(result.proposals || []);
            }
        } catch (err) {
            setError(err.message || 'Không thể tải danh sách đề xuất');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filter) => {
        setActiveFilter(filter);
        if (filter) {
            setSearchParams({ status: filter });
        } else {
            setSearchParams({});
        }
    };

    const getDeadlineStatus = (deadline) => {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffHours = (deadlineDate - now) / (1000 * 60 * 60);

        if (diffHours < 0) return 'expired';
        if (diffHours < 24) return 'warning';
        return 'safe';
    };

    const formatDeadline = (deadline) => {
        if (!deadline) return 'Không có';
        const date = new Date(deadline);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusClass = (status) => {
        const statusMap = {
            'PENDING': 'status-pending',
            'APPROVED': 'status-approved',
            'REJECTED': 'status-rejected',
            'COMMITTED': 'status-committed',
            'EXPIRED': 'status-expired',
        };
        return statusMap[status] || 'status-pending';
    };

    const openModal = (type, proposal) => {
        setModalType(type);
        setSelectedProposal(proposal);
        setComments('');
        setAmendmentReason('');
        setAmendmentData(proposal.degreeData || {});
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProposal(null);
        setModalType('');
        setComments('');
        setAmendmentData({});
        setAmendmentReason('');
    };

    const handleApprove = async () => {
        try {
            setActionLoading(true);
            await proposalAPI.approve(selectedProposal.proposalId, comments);
            closeModal();
            fetchProposals();
        } catch (err) {
            setError(err.message || 'Không thể phê duyệt đề xuất');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        try {
            setActionLoading(true);
            await proposalAPI.reject(selectedProposal.proposalId, comments);  // comments is used as reason
            closeModal();
            fetchProposals();
        } catch (err) {
            setError(err.message || 'Không thể từ chối đề xuất');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAmend = async () => {
        try {
            setActionLoading(true);
            await proposalAPI.amend(selectedProposal.proposalId, amendmentData, amendmentReason);
            closeModal();
            fetchProposals();
        } catch (err) {
            setError(err.message || 'Không thể sửa đổi đề xuất');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCommit = async (proposalId) => {
        try {
            setActionLoading(true);
            await proposalAPI.commit(proposalId);
            fetchProposals();
        } catch (err) {
            setError(err.message || 'Không thể xác nhận đề xuất');
        } finally {
            setActionLoading(false);
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
                        <h1>📋 Quản lý đề xuất</h1>
                        <p className="text-secondary">
                            Duyệt, từ chối và quản lý các đề xuất cấp bằng
                        </p>
                    </div>
                    {isAdmin && (
                        <div className="action-buttons">
                            <button className="btn btn-primary" onClick={() => navigate('/issue-degree')}>
                                ➕ Tạo đề xuất mới
                            </button>
                        </div>
                    )}
                </div>

                {/* Filter Bar */}
                <div className="filter-bar">
                    {filters.map((filter) => (
                        <button
                            key={filter.value}
                            className={`filter-btn ${activeFilter === filter.value ? 'active' : ''}`}
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {error && <div className="alert alert-error">{error}</div>}

                {loading ? (
                    <div className="card text-center">
                        <div className="spinner" style={{ margin: '0 auto' }}></div>
                        <p className="mt-md">Đang tải...</p>
                    </div>
                ) : proposals.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📭</div>
                        <p>Không có đề xuất nào</p>
                    </div>
                ) : (
                    <div>
                        {proposals.map((proposal) => (
                            <div key={proposal.proposalId} className="proposal-card">
                                <div className="proposal-header">
                                    <div>
                                        <div className="proposal-id">{proposal.proposalId}</div>
                                        <div className="proposal-type">{proposal.proposalType}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <span className={`status ${getStatusClass(proposal.organizationStatus || proposal.status)}`}>
                                            {proposal.organizationStatus || proposal.status}
                                        </span>
                                        {proposal.version > 1 && (
                                            <span className="status status-info">v{proposal.version}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Deadline */}
                                {proposal.deadline && (
                                    <div className={`deadline deadline-${getDeadlineStatus(proposal.deadline)}`}>
                                        ⏰ Hạn: {formatDeadline(proposal.deadline)}
                                    </div>
                                )}

                                {/* Degree Data Summary */}
                                {proposal.degreeData && (
                                    <dl className="degree-details mt-md">
                                        <dt>Mã bằng</dt>
                                        <dd>{proposal.degreeData.degreeId}</dd>
                                        <dt>Sinh viên</dt>
                                        <dd>{proposal.degreeData.studentName} ({proposal.degreeData.studentId})</dd>
                                        <dt>Loại bằng</dt>
                                        <dd>{proposal.degreeData.degreeType}</dd>
                                        <dt>Ngành</dt>
                                        <dd>{proposal.degreeData.major}</dd>
                                        <dt>Xếp loại</dt>
                                        <dd>{proposal.degreeData.classification}</dd>
                                    </dl>
                                )}

                                {/* Meta info */}
                                <div className="proposal-meta">
                                    <span>Tạo bởi: {proposal.createdByUsername}</span>
                                    <span>Ngày: {new Date(proposal.createdAt).toLocaleDateString('vi-VN')}</span>
                                </div>

                                {/* Action Buttons */}
                                <div className="action-buttons mt-md">
                                    {(proposal.organizationStatus || proposal.status) === 'PENDING' && (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => openModal('approve', proposal)}
                                            >
                                                ✓ Phê duyệt
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => openModal('reject', proposal)}
                                            >
                                                ✗ Từ chối
                                            </button>
                                        </>
                                    )}
                                    {(proposal.organizationStatus || proposal.status) === 'APPROVED' && isAdmin && (
                                        <button
                                            className="btn btn-primary btn-sm"
                                            onClick={() => handleCommit(proposal.proposalId)}
                                            disabled={actionLoading}
                                        >
                                            🔒 Xác nhận (Commit)
                                        </button>
                                    )}
                                    {((proposal.organizationStatus || proposal.status) === 'REJECTED' || 
                                      (proposal.organizationStatus || proposal.status) === 'EXPIRED') && isAdmin && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => openModal('amend', proposal)}
                                        >
                                            ✏️ Sửa đổi & Gửi lại
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {modalType === 'approve' && '✓ Phê duyệt đề xuất'}
                                {modalType === 'reject' && '✗ Từ chối đề xuất'}
                                {modalType === 'amend' && '✏️ Sửa đổi đề xuất'}
                            </h3>
                            <button className="modal-close" onClick={closeModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            {(modalType === 'approve' || modalType === 'reject') && (
                                <div className="form-group">
                                    <label className="form-label">Ghi chú</label>
                                    <textarea
                                        className="form-input comments-textarea"
                                        value={comments}
                                        onChange={(e) => setComments(e.target.value)}
                                        placeholder="Nhập ghi chú (tùy chọn)..."
                                    />
                                </div>
                            )}

                            {modalType === 'amend' && (
                                <>
                                    <div className="alert alert-info mb-md">
                                        Sửa đổi thông tin bên dưới và gửi lại để xét duyệt.
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Tên sinh viên</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={amendmentData.studentName || ''}
                                            onChange={(e) => setAmendmentData({ ...amendmentData, studentName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Ngành học</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={amendmentData.major || ''}
                                            onChange={(e) => setAmendmentData({ ...amendmentData, major: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Xếp loại</label>
                                        <select
                                            className="form-input form-select"
                                            value={amendmentData.classification || ''}
                                            onChange={(e) => setAmendmentData({ ...amendmentData, classification: e.target.value })}
                                        >
                                            <option value="Xuất sắc">Xuất sắc</option>
                                            <option value="Giỏi">Giỏi</option>
                                            <option value="Khá">Khá</option>
                                            <option value="Trung bình">Trung bình</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Lý do sửa đổi *</label>
                                        <textarea
                                            className="form-input comments-textarea"
                                            value={amendmentReason}
                                            onChange={(e) => setAmendmentReason(e.target.value)}
                                            placeholder="Mô tả lý do sửa đổi..."
                                            required
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>
                                Hủy
                            </button>
                            {modalType === 'approve' && (
                                <button
                                    className="btn btn-success"
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Đang xử lý...' : '✓ Phê duyệt'}
                                </button>
                            )}
                            {modalType === 'reject' && (
                                <button
                                    className="btn btn-danger"
                                    onClick={handleReject}
                                    disabled={actionLoading}
                                >
                                    {actionLoading ? 'Đang xử lý...' : '✗ Từ chối'}
                                </button>
                            )}
                            {modalType === 'amend' && (
                                <button
                                    className="btn btn-primary"
                                    onClick={handleAmend}
                                    disabled={actionLoading || !amendmentReason}
                                >
                                    {actionLoading ? 'Đang xử lý...' : '📤 Gửi lại'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProposalManagement;
