import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Send
} from 'lucide-react';

const AssignedComplaints = () => {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Review Form state
  const [decision, setDecision] = useState('APPROVED');
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const fetchAssigned = async () => {
    setLoading(true);
    try {
      let query = `/complaints?search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      const res = await api.get(query);
      if (res.data.success) {
        setComplaints(res.data.complaints);

        const directId = searchParams.get('id');
        if (directId) {
          const target = res.data.complaints.find((c) => c._id === directId || c.ticketId === directId);
          if (target) openReviewModal(target);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, [search, statusFilter]);

  const openReviewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setDecision(complaint.status === 'REJECTED' ? 'REJECTED' : 'APPROVED');
    setRemarks(complaint.reviewRemarks || '');
    setRejectionReason(complaint.rejectionReason || '');
    setRecommendation('');
    setError('');
    setShowModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!remarks.trim()) {
      setError('Please provide detailed on-site inspection remarks.');
      return;
    }

    if (decision === 'REJECTED' && !rejectionReason.trim()) {
      setError('A mandatory rejection reason is required when rejecting a citizen grievance.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/${selectedComplaint._id}`, {
        decision,
        remarks: remarks.trim(),
        rejectionReason: decision === 'REJECTED' ? rejectionReason.trim() : undefined,
        recommendation: recommendation.trim()
      });

      if (res.data.success) {
        setSuccess(`Review decision "${decision}" recorded for Ticket ${selectedComplaint.ticketId}.`);
        setShowModal(false);
        fetchAssigned();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Assigned Grievance Inspection Queue</h4>
        <p className="text-muted small mb-0">
          Conduct physical on-site assessments, formulate evaluation findings, and record formal decisions.
        </p>
      </div>

      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

      {/* Filter */}
      <div className="gov-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: '380px' }}>
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by Ticket ID or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="gov-select"
            style={{ width: '200px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Review Statuses</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Citizen Details</th>
                <th>Complaint Subject</th>
                <th>Locality / Ward</th>
                <th>Priority</th>
                <th>Current Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{c.ticketId}</span>
                      <div className="small text-muted">{new Date(c.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.citizen?.name}</div>
                      <div className="small text-muted">{c.citizen?.phone}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="small text-muted">{c.category}</div>
                    </td>
                    <td>
                      <div className="small text-dark text-truncate" style={{ maxWidth: '200px' }}>
                        {c.location}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => openReviewModal(c)}
                        className="btn btn-gov-primary btn-sm py-1 px-3"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No assigned complaints match the active filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-0">Field Inspection & Decision Protocol</h5>
                  <span className="badge bg-dark font-monospace mt-1">{selectedComplaint.ticketId}</span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleReviewSubmit}>
                <div className="modal-body">
                  {/* Complaint Snapshot */}
                  <div className="p-3 bg-light rounded mb-3">
                    <h6 className="fw-bold text-dark">{selectedComplaint.title}</h6>
                    <p className="text-muted small mb-2">{selectedComplaint.description}</p>
                    <div className="row g-2 small text-muted">
                      <div className="col-md-6">
                        <strong>Citizen:</strong> {selectedComplaint.citizen?.name} ({selectedComplaint.citizen?.phone})
                      </div>
                      <div className="col-md-6">
                        <strong>Location:</strong> {selectedComplaint.location}
                      </div>
                      <div className="col-md-6">
                        <strong>Category:</strong> {selectedComplaint.category}
                      </div>
                      <div className="col-md-6">
                        <strong>Department:</strong> {selectedComplaint.department?.name || 'General'}
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Evidence Photo */}
                  {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                    <div className="mb-3">
                      <div className="small text-muted fw-bold mb-1">CITIZEN EVIDENCE PHOTO</div>
                      <div className="d-flex gap-2 flex-wrap">
                        {selectedComplaint.attachments.map((att, idx) => (
                          <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={att.url}
                              alt="Evidence"
                              className="rounded border"
                              style={{ width: '140px', height: '100px', objectFit: 'cover' }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Model Assessment Card */}
                  {selectedComplaint.aiAnalysis && (
                    <div className="card border-primary mb-3 shadow-sm bg-light">
                      <div className="card-header bg-primary text-white py-1 px-3 d-flex justify-content-between align-items-center">
                        <span className="small fw-bold">🤖 AI Model Assessment ({selectedComplaint.aiAnalysis.modelVersion || 'MobileNetV3'})</span>
                        <span className="badge bg-light text-dark">
                          {selectedComplaint.aiAnalysis.confidence ? `${(selectedComplaint.aiAnalysis.confidence * 100).toFixed(0)}% Match` : 'Verified'}
                        </span>
                      </div>
                      <div className="card-body p-2 px-3 small">
                        <div className="d-flex justify-content-between mb-1">
                          <span><strong>AI Category:</strong> {selectedComplaint.aiAnalysis.predictedCategory || selectedComplaint.category}</span>
                          <span><strong>AI Severity:</strong> <span className={`badge badge-priority-${selectedComplaint.aiAnalysis.predictedSeverity || selectedComplaint.priority}`}>{selectedComplaint.aiAnalysis.predictedSeverity || selectedComplaint.priority}</span></span>
                        </div>
                        {selectedComplaint.aiAnalysis.explanation && (
                          <div className="text-muted mb-1"><strong>Explanation:</strong> {selectedComplaint.aiAnalysis.explanation}</div>
                        )}
                        {selectedComplaint.aiAnalysis.recommendedAction && (
                          <div className="text-primary"><strong>Action:</strong> {selectedComplaint.aiAnalysis.recommendedAction}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

                  {/* Decision Selection */}
                  <div className="mb-3">
                    <label className="gov-label">Formal Review Decision *</label>
                    <div className="row g-2">
                      <div className="col-4">
                        <label
                          className={`d-flex flex-column align-items-center justify-content-center p-3 border rounded text-center cursor-pointer ${
                            decision === 'APPROVED' ? 'border-success bg-success bg-opacity-10 text-success fw-bold' : 'bg-white'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="decision"
                            value="APPROVED"
                            className="d-none"
                            checked={decision === 'APPROVED'}
                            onChange={(e) => setDecision(e.target.value)}
                          />
                          <CheckCircle2 size={24} className="mb-1" />
                          <span>Approve Claim</span>
                        </label>
                      </div>

                      <div className="col-4">
                        <label
                          className={`d-flex flex-column align-items-center justify-content-center p-3 border rounded text-center cursor-pointer ${
                            decision === 'RECOMMENDED_ACTION' ? 'border-primary bg-primary bg-opacity-10 text-primary fw-bold' : 'bg-white'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="decision"
                            value="RECOMMENDED_ACTION"
                            className="d-none"
                            checked={decision === 'RECOMMENDED_ACTION'}
                            onChange={(e) => setDecision(e.target.value)}
                          />
                          <Send size={24} className="mb-1" />
                          <span>Recommend Work</span>
                        </label>
                      </div>

                      <div className="col-4">
                        <label
                          className={`d-flex flex-column align-items-center justify-content-center p-3 border rounded text-center cursor-pointer ${
                            decision === 'REJECTED' ? 'border-danger bg-danger bg-opacity-10 text-danger fw-bold' : 'bg-white'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <input
                            type="radio"
                            name="decision"
                            value="REJECTED"
                            className="d-none"
                            checked={decision === 'REJECTED'}
                            onChange={(e) => setDecision(e.target.value)}
                          />
                          <XCircle size={24} className="mb-1" />
                          <span>Reject Claim</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Mandatory Rejection Reason if Rejected */}
                  {decision === 'REJECTED' && (
                    <div className="mb-3">
                      <label className="gov-label text-danger">Mandatory Rejection Reason *</label>
                      <textarea
                        className="gov-textarea border-danger"
                        rows="2"
                        required
                        placeholder="State why this complaint cannot be acted upon (e.g., private property dispute, duplicate ticket, outside municipal authority)..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                      ></textarea>
                    </div>
                  )}

                  {/* Remarks */}
                  <div className="mb-3">
                    <label className="gov-label">On-Site Inspection Remarks *</label>
                    <textarea
                      className="gov-textarea"
                      rows="3"
                      required
                      placeholder="Detail physical site condition, damage extent, and recommended technical specifications..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Recommendation */}
                  <div className="mb-3">
                    <label className="gov-label">Department Action Recommendation (Optional)</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="e.g. Requires 50mm bitumen patch crew and hydraulic roller."
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn btn-sm ${decision === 'REJECTED' ? 'btn-danger' : 'btn-success'}`}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting Assessment...' : 'Record Decision & Notify Citizen'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;

