import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UnauthorizedPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'SUPER_ADMIN':
        return '/super-admin/dashboard';
      case 'ADMIN':
        return '/admin/dashboard';
      case 'REVIEWER':
        return '/reviewer/dashboard';
      case 'CITIZEN':
      default:
        return '/citizen/dashboard';
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: '80vh', backgroundColor: 'var(--bg-main)' }}
    >
      <div className="gov-card text-center p-5 shadow-sm" style={{ maxWidth: '520px' }}>
        <div
          className="rounded-circle bg-danger bg-opacity-10 text-danger d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '64px', height: '64px' }}
        >
          <ShieldAlert size={36} />
        </div>
        <h3 className="fw-bold text-dark mb-2">Access Restricted (403)</h3>
        <p className="text-muted mb-4">
          You do not possess the required clearance level or role-based permissions to view this resource.
          Access attempts are logged for security compliance.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary d-flex align-items-center gap-2">
            <ArrowLeft size={16} /> Go Back
          </button>
          <Link to={getDashboardPath()} className="btn btn-gov-primary d-flex align-items-center gap-2">
            <Home size={16} /> My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

