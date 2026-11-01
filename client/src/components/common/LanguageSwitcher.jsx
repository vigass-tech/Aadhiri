import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, Languages } from 'lucide-react';

const LanguageSwitcher = ({ variant = 'navbar', className = '' }) => {
  const { lang, toggleLang, t } = useLanguage();

  // Next language that clicking this button switches to
  const nextLangLabel = lang === 'ta' ? 'English' : 'தமிழ்';
  const tooltipText = lang === 'ta' ? 'Switch to English' : 'தமிழுக்கு மாறவும்';

  if (variant === 'floating') {
    return (
      <button
        onClick={toggleLang}
        className="position-fixed bottom-0 end-0 m-4 btn btn-primary rounded-pill shadow-lg d-flex align-items-center gap-2 px-3 py-2"
        style={{
          zIndex: 1090,
          background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
          border: '2px solid rgba(255,255,255,0.85)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '0.88rem',
          boxShadow: '0 8px 24px rgba(13, 148, 136, 0.35)'
        }}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Globe size={18} className="text-warning" />
        <span>{nextLangLabel}</span>
      </button>
    );
  }

  if (variant === 'header-teal') {
    // Style matching the user's uploaded screenshot in the citizen header
    return (
      <button
        onClick={toggleLang}
        className={`btn btn-sm d-flex align-items-center gap-1.5 fw-semibold px-2.5 py-1 ${className}`}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.16)',
          border: '1px solid rgba(255, 255, 255, 0.45)',
          color: '#ffffff',
          borderRadius: '6px',
          fontSize: '0.82rem',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.2s ease'
        }}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Globe size={15} style={{ opacity: 0.9 }} />
        <span>{nextLangLabel}</span>
      </button>
    );
  }

  if (variant === 'topbar') {
    return (
      <button
        onClick={toggleLang}
        className={`btn btn-light border d-flex align-items-center gap-2 px-2.5 py-1.5 rounded-pill shadow-sm ${className}`}
        style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}
        title={tooltipText}
        aria-label={tooltipText}
      >
        <Globe size={16} className="text-primary" />
        <span>{nextLangLabel}</span>
      </button>
    );
  }

  // Default navbar variant
  return (
    <button
      onClick={toggleLang}
      className={`btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold ${className}`}
      style={{ fontSize: '0.85rem' }}
      title={tooltipText}
      aria-label={tooltipText}
    >
      <Languages size={17} className="text-primary" />
      <span>{nextLangLabel}</span>
    </button>
  );
};

export default LanguageSwitcher;

