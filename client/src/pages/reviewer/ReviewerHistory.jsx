import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { History, Search, CheckCircle2, XCircle, Send, Calendar } from 'lucide-react';

const ReviewerHistory = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [decisionFilter, setDecisionFilter] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reviews/history/all');
        if (res.data.success) {
          setReviews(res.data.reviews || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.complaint?.ticketId?.toLowerCase().includes(search.toLowerCase()) ||
      r.complaint?.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.remarks?.toLowerCase().includes(search.toLowerCase());

    const matchesDecision = decisionFilter ? r.decision === decisionFilter : true;
    return matchesSearch && matchesDecision;
  });

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Inspection & Review Audit History</h4>
        <p className="text-muted small mb-0">
          Chronological record of all evaluations, remarks, and recommendations made by you.
        </p>
      </div>

      <div className="gov-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: '380px' }}>
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by Ticket ID, Title, or Remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="gov-select"
            style={{ width: '180px' }}
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
          >
            <option value="">All Decisions</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REJECTED">Rejected Only</option>
            <option value="RECOMMENDED_ACTION">Recommended Action</option>
          </select>
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Complaint Subject</th>
                <th>Decision</th>
                <th>Inspection Remarks</th>
                <th>Recommendation</th>
                <th>Reviewed Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{r.complaint?.ticketId}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>
                        {r.complaint?.title}
                      </div>
                      <div className="small text-muted">{r.complaint?.department?.name}</div>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          r.decision === 'APPROVED'
                            ? 'bg-success'
                            : r.decision === 'REJECTED'
                            ? 'bg-danger'
                            : 'bg-primary'
                        }`}
                      >
                        {r.decision.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="small text-dark" style={{ maxWidth: '300px' }}>
                        {r.remarks}
                      </div>
                      {r.rejectionReason && (
                        <div className="small text-danger mt-1">
                          <strong>Reason:</strong> {r.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="small text-muted">{r.recommendation || '—'}</span>
                    </td>
                    <td className="small text-muted">
                      {new Date(r.reviewedAt).toLocaleDateString()} {new Date(r.reviewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No inspection reviews recorded matching criteria.
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

export default ReviewerHistory;

