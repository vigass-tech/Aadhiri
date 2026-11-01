import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../../components/common/Logo';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import {
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  CheckCircle,
  AlertCircle,
  UserPlus
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    termsAccepted: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { registerCitizen } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.password
    ) {
      setError('Please provide all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the Civic Grievance Terms & Conditions to register.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerCitizen({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        address: formData.address.trim()
      });

      if (res.success) {
        navigate('/citizen/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register account. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center py-5 px-3"
      style={{
        minHeight: '90vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
      }}
    >
      <div className="gov-card shadow-lg p-4 p-md-5 w-100 position-relative" style={{ maxWidth: '580px' }}>
        {/* Language Switcher in Card Header */}
        <div className="position-absolute top-0 end-0 m-3">
          <LanguageSwitcher variant="navbar" className="btn-sm" />
        </div>

        {/* Header */}
        <div className="text-center mb-4 mt-2">
          <div className="d-flex justify-content-center mb-2">
            <Logo size={44} showTagline={false} />
          </div>
          <h4 className="fw-bold text-dark mb-1">{t('registerHeading')}</h4>
          <p className="text-muted small">
            {t('registerSubtitle')}
          </p>
        </div>

        {/* Notice: Role protection */}
        <div className="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-3">
          <CheckCircle size={16} className="text-primary flex-shrink-0" />
          <span>This portal registration creates a verified Citizen account. Administrative & Reviewer credentials are provisioned separately.</span>
        </div>

        {error && (
          <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Full Name */}
            <div className="col-12">
              <label className="gov-label">{t('fullName')} *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <User size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="name"
                  className="form-control border-start-0"
                  placeholder="Selvakumar Raman"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="col-md-6">
              <label className="gov-label">{t('emailAddress')} *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Mail size={18} className="text-muted" />
                </span>
                <input
                  type="email"
                  name="email"
                  className="form-control border-start-0"
                  placeholder="selva@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div className="col-md-6">
              <label className="gov-label">{t('phoneNumber')} *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Phone size={18} className="text-muted" />
                </span>
                <input
                  type="tel"
                  name="phone"
                  className="form-control border-start-0"
                  placeholder="9840445566"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="col-md-6">
              <label className="gov-label">{t('password')} (min. 6) *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="col-md-6">
              <label className="gov-label">{t('confirmPassword')} *</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <Lock size={18} className="text-muted" />
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control border-start-0"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="col-12">
              <label className="gov-label">{t('residentialAddress')}</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <MapPin size={18} className="text-muted" />
                </span>
                <input
                  type="text"
                  name="address"
                  className="form-control border-start-0"
                  placeholder="14/2, 3rd Cross Street, T. Nagar, Chennai"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="col-12">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="termsAccepted"
                  id="termsCheck"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  required
                />
                <label className="form-check-label small text-muted" htmlFor="termsCheck">
                  {t('acceptTerms')}
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="col-12 mt-4">
              <button
                type="submit"
                className="btn btn-gov-primary w-100 py-2 fs-6 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    {t('creatingAccount')}
                  </span>
                ) : (
                  <span className="d-flex align-items-center justify-content-center gap-2">
                    <UserPlus size={18} /> {t('registerSubmitBtn')}
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center small text-muted">
          <span>{t('haveAccountPrompt')} </span>
          <Link to="/login" className="fw-bold text-primary text-decoration-none ms-1">
            {t('signInInstead')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

