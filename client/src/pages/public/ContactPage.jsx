import React, { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Clock } from 'lucide-react';

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
      <div className="container py-lg-4" style={{ maxWidth: '960px' }}>
        <div className="text-center mb-5">
          <span className="text-primary fw-bold text-uppercase small letter-spacing-1">Help & Inquiries</span>
          <h1 className="fw-extrabold mt-1" style={{ color: 'var(--primary-navy)' }}>
            Contact Aadhirai Administration
          </h1>
          <p className="text-muted">
            Have questions about the complaint redressal system or need urgent assistance? We are here to help.
          </p>
        </div>

        <div className="row g-5">
          <div className="col-md-5">
            <div className="gov-card p-4 h-100">
              <h5 className="fw-bold mb-4 text-dark">Administrative Office</h5>
              <div className="d-flex flex-column gap-4">
                <div className="d-flex align-items-start gap-3">
                  <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">State Municipal Headquarters</h6>
                    <p className="text-muted small mb-0">Secretariat Annexe, Anna Salai, Chennai, Tamil Nadu – 600002</p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Toll-Free Grievance Cell</h6>
                    <p className="text-muted small mb-0">1800-425-2345 (24x7 Citizen Line)</p>
                    <p className="text-muted small mb-0">+91 44 2859 1000 (Board Line)</p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Official Emails</h6>
                    <p className="text-muted small mb-0">grievance@aadhirai.gov.in</p>
                    <p className="text-muted small mb-0">admin@aadhirai.gov.in</p>
                  </div>
                </div>
                <div className="d-flex align-items-start gap-3">
                  <Clock size={20} className="text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Working Hours</h6>
                    <p className="text-muted small mb-0">Public Counters: Mon - Sat 9:30 AM to 5:30 PM</p>
                    <p className="text-muted small mb-0">Online Portal: 24 Hours / 7 Days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-7">
            <div className="gov-card p-4">
              <h5 className="fw-bold mb-3 text-dark">Send Citizen Inquiry</h5>
              {submitted ? (
                <div className="alert alert-success d-flex align-items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span>Thank you! Your message has been logged. An official will respond to your email.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="gov-label">Full Name</label>
                    <input type="text" className="gov-input" placeholder="Enter your full name" required />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Email Address</label>
                    <input type="email" className="gov-input" placeholder="name@domain.com" required />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Phone Number</label>
                    <input type="tel" className="gov-input" placeholder="+91 98765 43210" required />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Message / Inquiry</label>
                    <textarea className="gov-textarea" rows="4" placeholder="How can we assist you?" required></textarea>
                  </div>
                  <button type="submit" className="btn btn-gov-primary w-100 py-2">
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

