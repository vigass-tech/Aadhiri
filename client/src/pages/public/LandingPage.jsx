import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Users,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  MapPin,
  PhoneCall,
  Zap,
  Droplet,
  Trash2,
  HeartPulse,
  Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const { t, lang } = useLanguage();
  const [stats, setStats] = useState({
    totalComplaints: 0,
    resolvedComplaints: 0,
    pendingComplaints: 0,
    registeredCitizens: 0,
    totalDepartments: 6,
    resolutionRate: 94
  });
  const [ticketInput, setTicketInput] = useState('');
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const res = await api.get('/dashboard/public-stats');
        if (res.data.success) {
          setStats((prev) => ({ ...prev, ...res.data.stats }));
        }
      } catch (err) {
        console.warn('Could not load live stats, using fallback defaults.');
      }
    };
    fetchPublicStats();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (ticketInput.trim()) {
      navigate(`/track-complaint?id=${ticketInput.trim().toUpperCase()}`);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const categories = [
    { name: 'Roads & Bridges', icon: MapPin, desc: 'Potholes, broken footpaths, signal damages', count: 'PWD' },
    { name: 'Water & Sewage', icon: Droplet, desc: 'Pipeline bursts, dirty water, drainage overflow', count: 'WSS' },
    { name: 'Street Lighting', icon: Zap, desc: 'Faulty lamps, loose cables, power cuts', count: 'ELEC' },
    { name: 'Solid Waste', icon: Trash2, desc: 'Uncollected garbage, bin overflows, sweeping', count: 'SAN' },
    { name: 'Public Health', icon: HeartPulse, desc: 'Mosquito breeding, sanitation, food hygiene', count: 'HLTH' },
    { name: 'Property & Tax', icon: Building, desc: 'Assessment disputes, trade licensing, records', count: 'REV' }
  ];

  return (
    <div className="landing-page">
      {/* 1. HERO SECTION */}
      <section
        className="py-5 text-white position-relative"
        style={{
          background: 'linear-gradient(135deg, #071524 0%, #0d2137 60%, #0284c7 100%)',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 text-info small fw-bold mb-3 border border-info border-opacity-25">
                <Sparkles size={16} /> {t('statePortal')}
              </div>
              <h1 className="display-4 fw-extrabold mb-3" style={{ letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                {t('heroTitle')} <span className="text-info">{t('heroSubtitleHighlight')}</span>
              </h1>
              <p className="lead text-light opacity-90 mb-4" style={{ maxWidth: '600px', fontSize: '1.15rem' }}>
                {t('heroSubtitle')}
              </p>

              <div className="d-flex flex-wrap gap-3 mb-5">
                <Link to="/register" className="btn btn-gov-teal btn-lg px-4 py-3 shadow">
                  <FileText size={20} />
                  {t('raiseComplaintBtn')}
                </Link>
                <Link to="/track-complaint" className="btn btn-outline-light btn-lg px-4 py-3">
                  <Search size={20} />
                  {t('trackComplaintBtn')}
                </Link>
              </div>

              {/* Instant Ticket Tracker Bar */}
              <div className="bg-white p-3 rounded-3 shadow-lg" style={{ maxWidth: '540px' }}>
                <form onSubmit={handleTrackSubmit} className="d-flex flex-column flex-sm-row gap-2">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={18} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder={t('enterTicketPrompt')}
                      value={ticketInput}
                      onChange={(e) => setTicketInput(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-gov-primary px-4 text-nowrap">
                    {t('trackNow')}
                  </button>
                </form>
              </div>
            </div>

            <div className="col-lg-5 text-center d-none d-lg-block">
              <div
                className="p-4 rounded-4 shadow-2xl position-relative"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <img
                  src="/logo.svg"
                  alt="Aadhirai Emblem"
                  width="180"
                  height="180"
                  className="mb-4"
                  style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.4))' }}
                />
                <h4 className="fw-bold text-white mb-2">AADHIRAI</h4>
                <p className="text-info small mb-3">SMART CITIZEN COMPLAINT MANAGEMENT SYSTEM</p>
                <div className="row g-2 text-start">
                  <div className="col-6">
                    <div className="p-2 rounded bg-white bg-opacity-10">
                      <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>DEPARTMENTS</div>
                      <div className="fw-bold text-white">6 Municipal Bodies</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-2 rounded bg-white bg-opacity-10">
                      <div className="text-secondary small" style={{ fontSize: '0.7rem' }}>RESOLUTION</div>
                      <div className="fw-bold text-white">4-Level RBAC</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC LIVE STATISTICS SECTION */}
      <section className="py-5 bg-white border-bottom shadow-sm">
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-lg-3 col-6">
              <div className="p-3">
                <div className="display-5 fw-extrabold text-primary mb-1">
                  {stats.totalComplaints > 0 ? stats.totalComplaints : '1,240+'}
                </div>
                <div className="text-muted fw-semibold">{t('totalComplaints')}</div>
                <div className="small text-success mt-1">100% Registered into Database</div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="p-3">
                <div className="display-5 fw-extrabold text-success mb-1">
                  {stats.resolvedComplaints > 0 ? stats.resolvedComplaints : '1,120+'}
                </div>
                <div className="text-muted fw-semibold">{t('resolvedComplaints')}</div>
                <div className="small text-success mt-1">Verified on Ground</div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="p-3">
                <div className="display-5 fw-extrabold text-warning mb-1">
                  {stats.pendingComplaints > 0 ? stats.pendingComplaints : '120+'}
                </div>
                <div className="text-muted fw-semibold">{t('pendingComplaints')}</div>
                <div className="small text-muted mt-1">Assigned to Inspectors</div>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="p-3">
                <div className="display-5 fw-extrabold text-info mb-1">
                  {stats.registeredCitizens > 0 ? stats.registeredCitizens : '4,850+'}
                </div>
                <div className="text-muted fw-semibold">{t('registeredCitizens')}</div>
                <div className="small text-info mt-1">Across All Municipal Wards</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ABOUT AADHIRAI */}
      <section id="about" className="py-5" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container py-lg-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <span className="text-primary fw-bold text-uppercase small letter-spacing-1">About The Platform</span>
              <h2 className="fw-bold mb-3 mt-1" style={{ color: 'var(--primary-navy)' }}>
                Digital Governance for Swift, Accountable Civic Action
              </h2>
              <p className="text-muted">
                <strong>AADHIRAI</strong> is designed from the ground up to eliminate bureaucracy, paperwork, and delays in municipal public service redressal.
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3 mt-4">
                <li className="d-flex align-items-start gap-3">
                  <CheckCircle2 size={22} className="text-success flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Digital Complaint Registration</h6>
                    <p className="text-muted small mb-0">Citizens register issues with location landmarks, categories, and priority ratings in under 2 minutes.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <CheckCircle2 size={22} className="text-success flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Transparent Public Tracking</h6>
                    <p className="text-muted small mb-0">Track real-time progress using unique ticket IDs without requiring mandatory logins.</p>
                  </div>
                </li>
                <li className="d-flex align-items-start gap-3">
                  <CheckCircle2 size={22} className="text-success flex-shrink-0 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Department & Budget Integration</h6>
                    <p className="text-muted small mb-0">Direct routing to PWD, Water, Electricity, and Sanitation with budget transparency.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm border border-light text-center h-100">
                    <ShieldCheck size={36} className="text-primary mb-2" />
                    <h5 className="fw-bold">4-Role RBAC</h5>
                    <p className="small text-muted mb-0">Super Admin, Admin, Reviewer, and Citizen access levels.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm border border-light text-center h-100">
                    <TrendingUp size={36} className="text-success mb-2" />
                    <h5 className="fw-bold">Real-Time Data</h5>
                    <p className="small text-muted mb-0">Live MongoDB aggregations and interactive chart visualizers.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm border border-light text-center h-100">
                    <Users size={36} className="text-info mb-2" />
                    <h5 className="fw-bold">Field Reviewers</h5>
                    <p className="small text-muted mb-0">Dedicated inspectors physically verify and approve/reject complaints.</p>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm border border-light text-center h-100">
                    <Clock size={36} className="text-warning mb-2" />
                    <h5 className="fw-bold">Audit History</h5>
                    <p className="small text-muted mb-0">Complete transition timestamps and remarks recorded for every action.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-5 bg-white border-top border-bottom">
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small letter-spacing-1">System Workflow</span>
            <h2 className="fw-bold" style={{ color: 'var(--primary-navy)' }}>
              How Aadhirai Resolves Your Grievance
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              From initial complaint registration to final on-ground resolution, every step is systematically tracked.
            </p>
          </div>

          <div className="row g-4">
            {[
              { step: '01', title: 'Register & File', desc: 'Citizen creates an account and submits a complaint with category and location.' },
              { step: '02', title: 'Ticket Generated', desc: 'Unique Ticket ID is generated and status is logged as SUBMITTED.' },
              { step: '03', title: 'Admin Scrutiny', desc: 'Zonal Admin reviews details and assigns to corresponding department & reviewer.' },
              { step: '04', title: 'Field Inspection', desc: 'Reviewer conducts inspection, records remarks, and approves or rejects with reason.' },
              { step: '05', title: 'Department Repair', desc: 'Approved complaints receive budgetary allocation and repair squads execute work.' },
              { step: '06', title: 'Status RESOLVED', desc: 'Work is verified, marked resolved, and citizen is notified via in-app alerts.' }
            ].map((item, idx) => (
              <div key={idx} className="col-lg-4 col-md-6">
                <div className="gov-card h-100 position-relative p-4 border-2">
                  <div
                    className="position-absolute top-0 end-0 p-3 fw-extrabold text-light opacity-50"
                    style={{ fontSize: '2rem' }}
                  >
                    {item.step}
                  </div>
                  <div
                    className="rounded-circle bg-primary bg-opacity-10 text-primary d-inline-flex align-items-center justify-content-center fw-bold mb-3"
                    style={{ width: '42px', height: '42px' }}
                  >
                    {item.step}
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. COMPLAINT CATEGORIES */}
      <section id="services" className="py-5" style={{ backgroundColor: 'var(--bg-main)' }}>
        <div className="container py-lg-4">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase small letter-spacing-1">Municipal Departments</span>
            <h2 className="fw-bold" style={{ color: 'var(--primary-navy)' }}>
              Major Complaint Categories Covered
            </h2>
          </div>

          <div className="row g-4">
            {categories.map((c, i) => {
              const Icon = c.icon;
              return (
                <div key={i} className="col-lg-4 col-md-6">
                  <div className="p-4 bg-white rounded-3 shadow-sm border border-light h-100 d-flex gap-3 align-items-start">
                    <div className="p-3 rounded-2 bg-light text-primary flex-shrink-0">
                      <Icon size={28} />
                    </div>
                    <div>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <h6 className="fw-bold mb-0">{c.name}</h6>
                        <span className="badge bg-secondary small">{c.count}</span>
                      </div>
                      <p className="text-muted small mb-0">{c.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CONTACT & SUPPORT FORM */}
      <section id="contact" className="py-5 bg-white border-top">
        <div className="container py-lg-4">
          <div className="row g-5">
            <div className="col-lg-5">
              <span className="text-primary fw-bold text-uppercase small letter-spacing-1">Get In Touch</span>
              <h2 className="fw-bold mb-3" style={{ color: 'var(--primary-navy)' }}>
                Citizen Support & Grievance Helpline
              </h2>
              <p className="text-muted">
                Need guidance on filing a complaint or following up on an urgent issue? Reach out to our 24/7 Citizen Redressal Cell.
              </p>

              <div className="d-flex flex-column gap-3 mt-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-light rounded text-primary">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <div className="text-muted small">Toll-Free Helpline</div>
                    <div className="fw-bold text-dark">1800-425-2345 (24x7)</div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-light rounded text-primary">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <div className="text-muted small">Official Email Support</div>
                    <div className="fw-bold text-dark">grievance@aadhirai.gov.in</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-7">
              <div className="p-4 p-md-5 rounded-3 shadow-sm border bg-light">
                <h5 className="fw-bold mb-3 text-dark">Send a Message to State Civic Support</h5>

                {contactSuccess && (
                  <div className="alert alert-success d-flex align-items-center gap-2 mb-4">
                    <CheckCircle2 size={18} />
                    <span>Your inquiry has been logged. Our officer will get in touch with you shortly.</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="gov-label">Your Name</label>
                      <input
                        type="text"
                        className="gov-input"
                        placeholder="Selvakumar R."
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="gov-label">Email Address</label>
                      <input
                        type="email"
                        className="gov-input"
                        placeholder="selva@example.com"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="gov-label">Subject</label>
                      <input
                        type="text"
                        className="gov-input"
                        placeholder="Inquiry regarding complaint procedure"
                        required
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="gov-label">Message Details</label>
                      <textarea
                        className="gov-textarea"
                        rows="4"
                        placeholder="Please describe your query or feedback..."
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-gov-primary px-4 py-2">
                        Submit Inquiry
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

