import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  Bell,
  HelpCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const CitizenDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/citizen');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading Your Citizen Dashboard...</div>
      </div>
    );
  }

  const { metrics, recentComplaints } = data;

  return (
    <div>
      {/* Welcome Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">{t('dashboard')} - {t('CITIZEN')}</h4>
          <p className="text-muted small mb-0">
            {t('portalTitle')}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/citizen/raise-complaint" className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <PlusCircle size={16} /> {t('raiseComplaint')}
          </Link>
          <Link to="/citizen/track-complaint" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Search size={16} /> {t('trackComplaint')}
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="stat-card navy">
            <div>
              <div className="text-muted small fw-bold">TOTAL SUBMITTED</div>
              <div className="fs-3 fw-bold text-dark mt-1">{metrics.totalComplaints}</div>
              <div className="text-muted small mt-1">Complaints filed by you</div>
            </div>
            <div className="p-3 bg-light rounded-circle text-primary">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">PENDING / SUBMITTED</div>
              <div className="fs-3 fw-bold text-warning mt-1">{metrics.pendingComplaints}</div>
              <div className="text-muted small mt-1">Awaiting scrutiny</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card teal">
            <div>
              <div className="text-muted small fw-bold">UNDER REVIEW / ACTIVE</div>
              <div className="fs-3 fw-bold text-info mt-1">{metrics.inReviewComplaints}</div>
              <div className="text-muted small mt-1">With inspector / repair team</div>
            </div>
            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
              <Search size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">RESOLVED & VERIFIED</div>
              <div className="fs-3 fw-bold text-success mt-1">{metrics.resolvedComplaints}</div>
              <div className="text-muted small mt-1">Civic work completed</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <Link to="/citizen/raise-complaint" className="text-decoration-none">
            <div className="gov-card p-3 h-100 d-flex align-items-center gap-3 border-primary">
              <div className="p-3 rounded-circle bg-primary bg-opacity-10 text-primary">
                <PlusCircle size={28} />
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-1">File a Grievance</h6>
                <div className="text-muted small">Report potholes, broken lights, sewage...</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/citizen/my-complaints" className="text-decoration-none">
            <div className="gov-card p-3 h-100 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-info bg-opacity-10 text-info">
                <FileText size={28} />
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-1">My Grievance History</h6>
                <div className="text-muted small">View all complaints and audit remarks</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-md-4">
          <Link to="/citizen/support" className="text-decoration-none">
            <div className="gov-card p-3 h-100 d-flex align-items-center gap-3">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success">
                <HelpCircle size={28} />
              </div>
              <div>
                <h6 className="fw-bold text-dark mb-1">Helpdesk Support</h6>
                <div className="text-muted small">Need assistance? Open a support ticket</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Complaints */}
      <div className="gov-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">Your Recent Complaints</h6>
          <Link to="/citizen/my-complaints" className="small text-primary fw-semibold text-decoration-none">
            View All ({metrics.totalComplaints}) →
          </Link>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject & Category</th>
                <th>Department</th>
                <th>Submission Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints && recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{c.ticketId}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="small text-muted">{c.category}</div>
                    </td>
                    <td>{c.department?.name || <span className="text-muted">Awaiting assignment</span>}</td>
                    <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/citizen/track-complaint?id=${c.ticketId}`}
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Track Status
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    You have not submitted any complaints yet.{' '}
                    <Link to="/citizen/raise-complaint" className="fw-bold text-primary">
                      Raise your first complaint now.
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CitizenDashboard;

