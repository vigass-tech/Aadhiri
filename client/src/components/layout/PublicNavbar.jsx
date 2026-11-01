import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { Menu, X, LogIn, UserPlus, LayoutDashboard, Search } from 'lucide-react';

const PublicNavbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
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
    <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top py-2 shadow-sm">
      <div className="container-fluid px-lg-5">
        <Logo size={42} showTagline={true} />

        <button
          className="navbar-toggler border-0 shadow-none d-lg-none"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show mt-3' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 fw-semibold gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link text-dark" to="/" onClick={() => setMobileMenuOpen(false)}>
                {t('home')}
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/#about" onClick={() => setMobileMenuOpen(false)}>
                {t('about')}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/#services" onClick={() => setMobileMenuOpen(false)}>
                {t('services')}
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/#how-it-works" onClick={() => setMobileMenuOpen(false)}>
                {t('howItWorks')}
              </a>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-primary fw-bold d-flex align-items-center gap-1" to="/track-complaint" onClick={() => setMobileMenuOpen(false)}>
                <Search size={16} /> {t('trackComplaint')}
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link text-dark" href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                {t('contact')}
              </a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {/* Prominent Language Switcher Icon Button */}
            <LanguageSwitcher variant="navbar" />

            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(getDashboardPath());
                }}
                className="btn btn-gov-primary"
              >
                <LayoutDashboard size={18} />
                {t('dashboard')} ({user.role.replace('_', ' ')})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LogIn size={18} />
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="btn btn-gov-primary px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserPlus size={18} />
                  {t('register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
