import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { Shield, Phone, Mail, MapPin, Heart } from 'lucide-react';

const PublicFooter = () => {
  return (
    <footer className="border-top" style={{ backgroundColor: 'var(--primary-navy-dark)', color: '#cbd5e1' }}>
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <Logo size={42} showTagline={true} light={true} />
            <p className="mt-3 text-secondary-light small" style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              AADHIRAI is an advanced, transparent, smart citizen complaint management platform empowering
              residents to report civic issues directly to municipal departments for fast and accountable resolution.
            </p>
            <div className="d-flex align-items-center gap-2 mt-3 text-white small">
              <Shield size={16} className="text-info" />
              <span>State Civic Governance & Public Welfare Portal</span>
            </div>
          </div>

          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 letter-spacing-1">QUICK LINKS</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/" className="text-light text-decoration-none">Home</Link></li>
              <li><a href="/#about" className="text-light text-decoration-none">About System</a></li>
              <li><a href="/#services" className="text-light text-decoration-none">Civic Services</a></li>
              <li><a href="/#how-it-works" className="text-light text-decoration-none">Workflow</a></li>
              <li><Link to="/track-complaint" className="text-light text-decoration-none">Track Status</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold mb-3 letter-spacing-1">PORTAL ACCESS</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/login" className="text-light text-decoration-none">Unified Portal Login</Link></li>
              <li><Link to="/register" className="text-light text-decoration-none">Citizen Registration</Link></li>
              <li><a href="/#track" className="text-light text-decoration-none">Public Complaint Lookup</a></li>
              <li><Link to="/contact" className="text-light text-decoration-none">Grievance Support</Link></li>
            </ul>
          </div>

          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 letter-spacing-1">CONTACT & HELPLINE</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small" style={{ color: '#94a3b8' }}>
              <li className="d-flex align-items-start gap-2">
                <MapPin size={18} className="text-info flex-shrink-0 mt-1" />
                <span>Secretariat Building, State Civic Administration, Fort St. George</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={16} className="text-info flex-shrink-0" />
                <span>Toll-Free Helpline: 1800-425-2345</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={16} className="text-info flex-shrink-0" />
                <span>support@aadhirai.gov.in</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 small text-secondary">
          <div>
            © {new Date().getFullYear()} AADHIRAI – Smart Citizen Complaint Management System. All Rights Reserved.
          </div>
          <div className="d-flex gap-3">
            <a href="#privacy" className="text-secondary text-decoration-none">Privacy Policy</a>
            <span>•</span>
            <a href="#terms" className="text-secondary text-decoration-none">Terms & Conditions</a>
            <span>•</span>
            <a href="#accessibility" className="text-secondary text-decoration-none">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;

