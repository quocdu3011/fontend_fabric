import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Enroll from './pages/Enroll';
import Dashboard from './pages/Dashboard';
import IssueDegree from './pages/IssueDegree';
import RevokeDegree from './pages/RevokeDegree';
import VerifyDegree from './pages/VerifyDegree';
import Transcripts from './pages/Transcripts';
import ViewTranscript from './pages/ViewTranscript';
import GrantAccess from './pages/GrantAccess';
import RequestCorrection from './pages/RequestCorrection';
import MyRecords from './pages/MyRecords';
import Profile from './pages/Profile';
import CreateAccount from './pages/CreateAccount';

// New Advanced Feature Pages
import ImportExport from './pages/ImportExport';
import PublicVerify from './pages/PublicVerify';

import './index.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/enroll" element={<Enroll />} />
            <Route path="/verify" element={<VerifyDegree />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issue-degree" element={<IssueDegree />} />
              <Route path="/revoke-degree" element={<RevokeDegree />} />
              <Route path="/transcripts" element={<Transcripts />} />
              <Route path="/view-transcript" element={<ViewTranscript />} />
              <Route path="/grant-access" element={<GrantAccess />} />
              <Route path="/request-correction" element={<RequestCorrection />} />
              <Route path="/my-records" element={<MyRecords />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/create-account" element={<CreateAccount />} />

              {/* New Advanced Feature Routes */}
              <Route path="/import-export" element={<ImportExport />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
