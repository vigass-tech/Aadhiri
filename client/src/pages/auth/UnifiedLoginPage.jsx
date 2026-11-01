import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../../components/common/Logo';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Shield,
  UserCheck
} from 'lucide-react';

const UnifiedLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if redirected because of expired session
  const isSessionExpired = new URLSearchParams(location.search).get('expired') === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(email.trim(), password);

      if (res.success) {
        // Redirection based on user role returned strictly from backend
        switch (res.role) {
          case 'SUPER_ADMIN':
            navigate('/super-admin/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          case 'REVIEWER':
            navigate('/reviewer/dashboard');
            break;
          case 'CITIZEN':
          default:
            navigate('/citizen/dashboard');
            break;
        }
      } else {
        setError(res.message || 'Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Authentication error. Please check your network or credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper for 1-click test credentials filling
  const fillRole = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError('');
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      <div className="gov-card shadow-lg p-4 p-md-5 w-100 position-relative" style={{ maxWidth: '480px' }}>
        {/* Language Switcher in Card Header */}
        <div className="position-absolute top-0 end-0 m-3">
          <LanguageSwitcher variant="navbar" className="btn-sm" />
        </div>

        {/* Header Branding */}
        <div className="text-center mb-4 mt-2">
          <div className="d-flex justify-content-center mb-2">
            <Logo size={48} showTagline={false} />
          </div>
          <h4 className="fw-bold text-dark mb-1">{t('loginHeading')}</h4>
          <p className="text-muted small">
            {t('loginSubtitle')}
          </p>
        </div>

        {/* Session Expired Alert */}
        {isSessionExpired && (
          <div className="alert alert-warning small py-2 d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} />
            <span>Your session has expired. Please log in again.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="mb-3">
            <label className="gov-label">{t('emailAddress')}</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Mail size={18} className="text-muted" />
              </span>
              <input
                type="email"
                className="form-control border-start-0"
                placeholder={t('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Field with Show/Hide toggle */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <label className="gov-label mb-0">{t('password')}</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="btn btn-link p-0 text-decoration-none small text-primary"
                style={{ fontSize: '0.8rem' }}
              >
                {t('forgotPassword')}
              </button>
            </div>
            <div className="input-group mt-1">
              <span className="input-group-text bg-light border-end-0">
                <Lock size={18} className="text-muted" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control border-start-0 border-end-0"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-group-text bg-light border-start-0 text-muted"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="form-check-label small text-muted" htmlFor="rememberMe">
                {t('rememberMe')}
              </label>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn btn-gov-primary w-100 py-2 fs-6 fw-bold"
            disabled={loading}
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                {t('signingIn')}
              </span>
            ) : (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <LogIn size={18} /> {t('loginBtn')}
              </span>
            )}
          </button>
        </form>

        {/* 1-Click Fast Role Credential Autofill for testing */}
        <div className="mt-4 pt-3 border-top">
          <div className="text-center mb-2 small fw-bold text-muted d-flex align-items-center justify-content-center gap-1">
            <UserCheck size={14} /> {t('demoCredentialsTitle')}
          </div>
          <div className="d-grid gap-1" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger py-1"
              style={{ fontSize: '0.72rem' }}
              onClick={() => fillRole('superadmin@aadhirai.gov.in', 'SuperAdmin@123')}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary py-1"
              style={{ fontSize: '0.72rem' }}
              onClick={() => fillRole('admin@aadhirai.gov.in', 'Admin@123')}
            >
              🏢 Admin
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-success py-1"
              style={{ fontSize: '0.72rem' }}
              onClick={() => fillRole('reviewer@aadhirai.gov.in', 'Reviewer@123')}
            >
              🔍 Reviewer
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-info py-1"
              style={{ fontSize: '0.72rem' }}
              onClick={() => fillRole('citizen@aadhirai.gov.in', 'Citizen@123')}
            >
              👤 Citizen
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-4 text-center small text-muted">
          <span>{t('noAccountPrompt')} </span>
          <Link to="/register" className="fw-bold text-primary text-decoration-none ms-1">
            {t('registerNow')}
          </Link>
          <div className="mt-2">
            <Link to="/" className="text-muted text-decoration-none">
              ← {t('returnHome')}
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Password Recovery Assistance</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small">
                  For security and audit protection of government grievance accounts, password resets
                  for administrative personnel are managed by the Chief Super Administrator.
                </p>
                <div className="p-3 bg-light rounded small">
                  <strong>For Citizens:</strong> You can contact the Toll-Free Helpline at{' '}
                  <span className="text-primary fw-bold">1800-425-2345</span> or email{' '}
                  <span className="text-primary fw-bold">support@aadhirai.gov.in</span> with your registered
                  phone number for identity verification.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowForgotModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedLoginPage;

