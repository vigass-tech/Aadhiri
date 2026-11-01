import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Award, Users, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="py-5" style={{ backgroundColor: 'var(--bg-main)' }}>
      <div className="container py-lg-4" style={{ maxWidth: '960px' }}>
        <div className="text-center mb-5">
          <span className="text-primary fw-bold text-uppercase small letter-spacing-1">Governance Architecture</span>
          <h1 className="fw-extrabold mt-1" style={{ color: 'var(--primary-navy)' }}>
            About AADHIRAI
          </h1>
          <p className="lead text-muted">
            Smart Citizen Complaint Management System – Redefining Citizen-Administration Redressal
          </p>
        </div>

        <div className="gov-card p-4 p-md-5 mb-4 shadow-sm">
          <h4 className="fw-bold mb-3 text-dark">Our Purpose & Mission</h4>
          <p className="text-muted leading-relaxed">
            The <strong>AADHIRAI</strong> portal was conceptualized as a state-of-the-art civic governance solution designed to address urban and rural grievance resolution. By digitizing the end-to-end complaint lifecycle, AADHIRAI eliminates the opacity and delays associated with conventional paper-based complaint lodgments.
          </p>
          <p className="text-muted leading-relaxed">
            Every submitted grievance is assigned a unique alphanumeric Ticket ID and routed based on municipal jurisdiction to specialized departments such as Public Works & Roads, Water Supply & Sewage, Electricity & Street Lighting, and Solid Waste Sanitation.
          </p>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="gov-card h-100 p-4 text-center">
              <Shield size={36} className="text-primary mb-3" />
              <h5 className="fw-bold">Transparency</h5>
              <p className="text-muted small mb-0">
                Live audit timestamps and reviewer remark tracking ensure every decision is transparent and reviewable.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gov-card h-100 p-4 text-center">
              <Target size={36} className="text-success mb-3" />
              <h5 className="fw-bold">Fast Turnaround</h5>
              <p className="text-muted small mb-0">
                Direct notification of field inspectors and department heads reduces response latency significantly.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="gov-card h-100 p-4 text-center">
              <Award size={36} className="text-info mb-3" />
              <h5 className="fw-bold">Budget Accountability</h5>
              <p className="text-muted small mb-0">
                Ties civic complaints to departmental budget allocations, ensuring public fund utilization is tracked.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link to="/register" className="btn btn-gov-primary px-4 py-2 me-2">
            Register as a Citizen
          </Link>
          <Link to="/track-complaint" className="btn btn-outline-secondary px-4 py-2">
            Track Existing Grievance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

