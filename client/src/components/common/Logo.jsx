import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 36, showTagline = false, light = false }) => {
  return (
    <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
      <img
        src="/logo.svg"
        alt="Aadhirai Emblem"
        width={size}
        height={size}
        style={{ filter: light ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none' }}
      />
      <div>
        <div
          className="fw-extrabold letter-spacing-1"
          style={{
            fontSize: size * 0.58,
            color: light ? '#ffffff' : 'var(--primary-navy)',
            lineHeight: 1.1,
            letterSpacing: '0.08em',
            fontWeight: 800
          }}
        >
          AADHIRAI
        </div>
        {showTagline && (
          <div
            className="small"
            style={{
              fontSize: '0.7rem',
              color: light ? '#94a3b8' : 'var(--text-muted)',
              fontWeight: 500
            }}
          >
            Your Voice. Our Responsibility.
          </div>
        )}
      </div>
    </Link>
  );
};

export default Logo;

