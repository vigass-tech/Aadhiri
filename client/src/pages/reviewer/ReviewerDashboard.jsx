import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  Eye
} from 'lucide-react';

const ReviewerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/reviewer');
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
        <div className="mt-2 text-muted">Loading Field Reviewer Desk...</div>
      </div>
    );
  }

  const { metrics, assignedComplaints } = data;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Field Inspector Review Desk</h4>
          <p className="text-muted small mb-0">
            Inspect on-site civic issues, record assessment remarks, and approve or reject complaints.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchDashboard} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/reviewer/assigned-complaints" className="btn btn-gov-primary btn-sm">
            Assigned Queue ({metrics.pendingReviews})
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="stat-card navy">
            <div>
              <div className="text-muted small fw-bold">TOTAL ASSIGNED</div>
              <div className="fs-3 fw-bold text-dark mt-1">{metrics.totalAssigned}</div>
              <div className="text-muted small mt-1">Inspection assignments</div>
            </div>
            <div className="p-3 bg-light rounded-circle text-primary">
              <FileCheck2 size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">PENDING REVIEWS</div>
              <div className="fs-3 fw-bold text-warning mt-1">{metrics.pendingReviews}</div>
              <div className="text-muted small mt-1">Awaiting your inspection</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">APPROVED CASES</div>
              <div className="fs-3 fw-bold text-success mt-1">{metrics.approvedComplaints}</div>
              <div className="text-muted small mt-1">Recommended for work</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card danger">
            <div>
              <div className="text-muted small fw-bold">REJECTED CLAIMS</div>
              <div className="fs-3 fw-bold text-danger mt-1">{metrics.rejectedComplaints}</div>
              <div className="text-muted small mt-1">Invalid or unfounded</div>
            </div>
            <div className="p-3 bg-danger bg-opacity-10 rounded-circle text-danger">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Complaints Table */}
      <div className="gov-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">Assigned Complaints For Your Evaluation</h6>
          <Link to="/reviewer/assigned-complaints" className="small text-primary fw-semibold text-decoration-none">
            Open Full Queue →
          </Link>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Citizen Details</th>
                <th>Complaint Title</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assignedComplaints && assignedComplaints.length > 0 ? (
                assignedComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{c.ticketId}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.citizen?.name || 'Citizen'}</div>
                      <div className="small text-muted">{c.citizen?.phone}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
                        {c.location}
                      </div>
                    </td>
                    <td>{c.department?.name || <span className="text-muted">General</span>}</td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/reviewer/assigned-complaints?id=${c._id}`}
                        className="btn btn-sm btn-gov-primary py-1 px-3"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Inspect & Review
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No active complaints currently assigned to you for inspection.
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

export default ReviewerDashboard;

