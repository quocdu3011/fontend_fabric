import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    // Don't show navbar on login page
    if (location.pathname === '/login') {
        return null;
    }

    const isAdmin = user?.ou === 'admin';
    const isReviewer = user?.ou === 'reviewer';
    const isStudent = user?.ou === 'student';
    const isAdminOrReviewer = isAdmin || isReviewer;

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand">
                    🎓 Hệ thống Bằng số
                </Link>

                <ul className="navbar-nav">
                    {isAuthenticated && (
                        <>
                            <li>
                                <Link
                                    to="/dashboard"
                                    className={`navbar-link ${isActive('/dashboard') ? 'active' : ''}`}
                                >
                                    Dashboard
                                </Link>
                            </li>

                            {/* Admin-only menu items */}
                            {isAdmin && (
                                <>
                                    <li>
                                        <Link
                                            to="/create-account"
                                            className={`navbar-link ${isActive('/create-account') ? 'active' : ''}`}
                                        >
                                            👤 Tạo TK
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/issue-degree"
                                            className={`navbar-link ${isActive('/issue-degree') ? 'active' : ''}`}
                                        >
                                            Cấp bằng
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/revoke-degree"
                                            className={`navbar-link ${isActive('/revoke-degree') ? 'active' : ''}`}
                                        >
                                            Thu hồi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/transcripts"
                                            className={`navbar-link ${isActive('/transcripts') ? 'active' : ''}`}
                                        >
                                            Thêm điểm
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/view-transcript"
                                            className={`navbar-link ${isActive('/view-transcript') ? 'active' : ''}`}
                                        >
                                            Xem điểm
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/import-export"
                                            className={`navbar-link ${isActive('/import-export') ? 'active' : ''}`}
                                        >
                                            📥 CSV
                                        </Link>
                                    </li>
                                </>
                            )}

                            {/* Student menu items */}
                            {isStudent && (
                                <>
                                    <li>
                                        <Link
                                            to="/my-records"
                                            className={`navbar-link ${isActive('/my-records') ? 'active' : ''}`}
                                        >
                                            Hồ sơ của tôi
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/request-correction"
                                            className={`navbar-link ${isActive('/request-correction') ? 'active' : ''}`}
                                        >
                                            Yêu cầu sửa điểm
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/grant-access"
                                            className={`navbar-link ${isActive('/grant-access') ? 'active' : ''}`}
                                        >
                                            Chia sẻ
                                        </Link>
                                    </li>
                                </>
                            )}
                        </>
                    )}
                    <li>
                        <Link
                            to="/verify"
                            className={`navbar-link ${isActive('/verify') ? 'active' : ''}`}
                        >
                            Xác thực
                        </Link>
                    </li>
                </ul>

                <div className="navbar-actions">
                    {isAuthenticated ? (
                        <>
                            <Link to="/profile" className="user-info">
                                <span>{user?.username}</span>
                                <span className={`user-role ${user?.ou}`}>{user?.ou}</span>
                            </Link>
                            <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                                Đăng xuất
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">
                            Đăng nhập
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
