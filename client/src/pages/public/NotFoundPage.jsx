import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: '80vh', backgroundColor: 'var(--bg-main)' }}
    >
      <div className="gov-card text-center p-5 shadow-sm" style={{ maxWidth: '520px' }}>
        <div
          className="rounded-circle bg-warning bg-opacity-10 text-warning d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: '64px', height: '64px' }}
        >
          <FileQuestion size={36} />
        </div>
        <h3 className="fw-bold text-dark mb-2">Page Not Found (404)</h3>
        <p className="text-muted mb-4">
          The requested civic page or route does not exist or may have been relocated within the AADHIRAI portal.
        </p>
        <Link to="/" className="btn btn-gov-primary d-inline-flex align-items-center gap-2">
          <Home size={16} /> Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;

