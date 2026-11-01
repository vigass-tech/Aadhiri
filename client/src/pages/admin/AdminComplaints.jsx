import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck,
  Send,
  Building,
  Tag,
  AlertCircle
} from 'lucide-react';

const AdminComplaints = () => {
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const [assignDept, setAssignDept] = useState('');
  const [assignReviewer, setAssignReviewer] = useState('');
  const [assignPriority, setAssignPriority] = useState('MEDIUM');
  const [assignRemarks, setAssignRemarks] = useState('');

  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionRemarks, setResolutionRemarks] = useState('');

  // Human-in-the-Loop AI Override State
  const [overrideCat, setOverrideCat] = useState('Potholes and damaged roads');
  const [overrideSev, setOverrideSev] = useState('HIGH');
  const [overrideNotes, setOverrideNotes] = useState('');
  const [overrideSaving, setOverrideSaving] = useState(false);

  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = `/complaints?search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (deptFilter) query += `&department=${deptFilter}`;
      if (priorityFilter) query += `&priority=${priorityFilter}`;

      const [compRes, deptRes, revRes] = await Promise.all([
        api.get(query),
        api.get('/departments'),
        api.get('/users?role=REVIEWER')
      ]);

      if (compRes.data.success) setComplaints(compRes.data.complaints);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
      if (revRes.data.success) setReviewers(revRes.data.users);

      const directId = searchParams.get('id');
      if (directId && compRes.data.complaints) {
        const found = compRes.data.complaints.find((c) => c._id === directId || c.ticketId === directId);
        if (found) {
          openDetails(found);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, deptFilter, priorityFilter]);

  const openDetails = async (complaint) => {
    try {
      const res = await api.get(`/complaints/${complaint._id}`);
      if (res.data.success) {
        const c = res.data.complaint;
        setSelectedComplaint(c);
        setOverrideCat(c.humanReview?.verifiedCategory || c.category || 'Potholes and damaged roads');
        setOverrideSev(c.humanReview?.verifiedSeverity || c.priority || 'HIGH');
        setOverrideNotes(c.humanReview?.reviewNotes || '');
      } else {
        setSelectedComplaint(complaint);
        setOverrideCat(complaint.category || 'Potholes and damaged roads');
        setOverrideSev(complaint.priority || 'HIGH');
        setOverrideNotes('');
      }
    } catch (err) {
      setSelectedComplaint(complaint);
      setOverrideCat(complaint.category || 'Potholes and damaged roads');
      setOverrideSev(complaint.priority || 'HIGH');
      setOverrideNotes('');
    }
    setShowDetailModal(true);
  };

  const handleOverrideAI = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;
    setOverrideSaving(true);
    try {
      const res = await api.patch(`/complaints/${selectedComplaint._id}/override-ai`, {
        verifiedCategory: overrideCat,
        verifiedSeverity: overrideSev,
        reviewNotes: overrideNotes
      });
      if (res.data.success) {
        setSelectedComplaint(res.data.complaint);
        setSuccess(`Staff verification recorded for ticket ${res.data.complaint.ticketId}`);
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record verification override.');
    } finally {
      setOverrideSaving(false);
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignDept(complaint.department?._id || '');
    setAssignReviewer(complaint.assignedReviewer?._id || '');
    setAssignPriority(complaint.priority || 'MEDIUM');
    setAssignRemarks('');
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/assign`, {
        departmentId: assignDept || undefined,
        reviewerId: assignReviewer || undefined,
        priority: assignPriority,
        remarks: assignRemarks
      });
      setSuccess(`Complaint ${selectedComplaint.ticketId} assigned.`);
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign complaint.');
    }
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusRemarks('');
    setResolutionRemarks(complaint.resolutionRemarks || '');
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        remarks: statusRemarks,
        resolutionRemarks: newStatus === 'RESOLVED' ? resolutionRemarks : undefined
      });
      setSuccess(`Complaint ${selectedComplaint.ticketId} moved to ${newStatus}.`);
      setShowStatusModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Jurisdictional Grievance Registry</h4>
        <p className="text-muted small mb-0">
          Review lodged citizen complaints, dispatch inspectors, and track on-ground execution.
        </p>
      </div>

      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}

      {/* Filter and Search Bar */}
      <div className="gov-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-lg-4 col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search Ticket ID, Title, Locality..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <select
              className="gov-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="col-lg-3 col-md-6">
            <select
              className="gov-select"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>
          <div className="col-lg-2 col-md-6">
            <select
              className="gov-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>
          </div>
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
                <th>Subject & Category</th>
                <th>Department</th>
                <th>Reviewer</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
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
                      <div className="fw-semibold text-dark">{c.citizen?.name || 'Citizen'}</div>
                      <div className="small text-muted">{c.citizen?.phone}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="badge bg-light text-secondary border small">{c.category}</div>
                    </td>
                    <td>{c.department?.name || <span className="text-muted">Unassigned</span>}</td>
                    <td>{c.assignedReviewer?.name || <span className="text-muted">Unassigned</span>}</td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => openDetails(c)}
                          className="btn btn-sm btn-outline-info py-1 px-2"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => openAssignModal(c)}
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Assign"
                        >
                          <UserCheck size={14} />
                        </button>
                        <button
                          onClick={() => openStatusModal(c)}
                          className="btn btn-sm btn-outline-success py-1 px-2"
                          title="Update Status"
                        >
                          <Clock size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No complaints matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <span className="badge bg-dark font-monospace fs-6">{selectedComplaint.ticketId}</span>
                  <span className={`badge badge-status badge-${selectedComplaint.status} ms-2`}>
                    {selectedComplaint.status.replace('_', ' ')}
                  </span>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowDetailModal(false)}></button>
              </div>
              <div className="modal-body">
                <h5 className="fw-bold text-dark mb-2">{selectedComplaint.title}</h5>
                <p className="text-muted leading-relaxed mb-4">{selectedComplaint.description}</p>

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted fw-bold">CITIZEN INFO</div>
                      <div className="fw-semibold text-dark mt-1">{selectedComplaint.citizen?.name}</div>
                      <div className="small text-muted">{selectedComplaint.citizen?.phone} • {selectedComplaint.citizen?.email}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted fw-bold">LOCATION</div>
                      <div className="fw-semibold text-dark mt-1">{selectedComplaint.location}</div>
                      <div className="small text-muted">{selectedComplaint.address || 'No landmark specified'}</div>
                    </div>
                  </div>
                </div>

                {/* Evidence Photo Attachments */}
                {selectedComplaint.attachments && selectedComplaint.attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="small text-muted fw-bold mb-2">UPLOADED CITIZEN EVIDENCE PHOTO</div>
                    <div className="d-flex gap-2 flex-wrap">
                      {selectedComplaint.attachments.map((att, idx) => (
                        <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="d-inline-block">
                          <img
                            src={att.url}
                            alt="Grievance Evidence"
                            className="rounded border shadow-sm"
                            style={{ width: '160px', height: '120px', objectFit: 'cover' }}
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Machine Learning Verification Card */}
                {selectedComplaint.aiAnalysis && (
                  <div className="card border-primary mb-4 shadow-sm" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center">
                      <span className="small fw-bold">
                        🤖 AI Model Assessment ({selectedComplaint.aiAnalysis.modelVersion || 'MobileNetV3-Civic'})
                      </span>
                      <span className="badge bg-light text-dark">
                        {selectedComplaint.aiAnalysis.confidence ? `${(selectedComplaint.aiAnalysis.confidence * 100).toFixed(0)}% Confidence` : 'Verified'}
                      </span>
                    </div>
                    <div className="card-body p-3">
                      <div className="row g-2 mb-2 small">
                        <div className="col-sm-6">
                          <strong>AI Predicted Category:</strong> <span className="text-primary fw-semibold">{selectedComplaint.aiAnalysis.predictedCategory || selectedComplaint.category}</span>
                        </div>
                        <div className="col-sm-6">
                          <strong>AI Predicted Severity:</strong>{' '}
                          <span className={`badge badge-priority-${selectedComplaint.aiAnalysis.predictedSeverity || selectedComplaint.priority}`}>
                            {selectedComplaint.aiAnalysis.predictedSeverity || selectedComplaint.priority}
                          </span>
                        </div>
                      </div>
                      {selectedComplaint.aiAnalysis.explanation && (
                        <div className="small text-dark mb-1">
                          <strong>AI Explanation:</strong> {selectedComplaint.aiAnalysis.explanation}
                        </div>
                      )}
                      {selectedComplaint.aiAnalysis.recommendedAction && (
                        <div className="small text-muted">
                          <strong>Recommended Action:</strong> {selectedComplaint.aiAnalysis.recommendedAction}
                        </div>
                      )}
                      {selectedComplaint.aiAnalysis.isLowConfidence && (
                        <div className="alert alert-warning py-1 px-2 small mt-2 mb-0">
                          ⚠️ Low confidence prediction — requires human staff verification.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Human Staff Verification & Override Panel */}
                <div className="card border mb-4">
                  <div className="card-header bg-light py-2 d-flex justify-content-between align-items-center">
                    <span className="small fw-bold">🧑‍💼 Human Staff Verification & Override</span>
                    {selectedComplaint.humanReview?.isOverridden ? (
                      <span className="badge bg-success">✓ Verified by Staff</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Pending Staff Review</span>
                    )}
                  </div>
                  <div className="card-body p-3">
                    {selectedComplaint.humanReview?.isOverridden && (
                      <div className="alert alert-success py-2 px-3 small mb-3">
                        <div className="fw-bold mb-1">Current Human-Verified Record:</div>
                        <div>Category: <strong>{selectedComplaint.humanReview.verifiedCategory}</strong> | Severity: <strong>{selectedComplaint.humanReview.verifiedSeverity}</strong></div>
                        {selectedComplaint.humanReview.reviewNotes && <div>Notes: {selectedComplaint.humanReview.reviewNotes}</div>}
                        <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                          Recorded by {selectedComplaint.humanReview.reviewedBy?.name || 'Authorized Officer'} on {new Date(selectedComplaint.humanReview.reviewedAt).toLocaleString()}
                        </div>
                      </div>
                    )}

                    <form onSubmit={handleOverrideAI}>
                      <div className="row g-2 mb-2">
                        <div className="col-sm-6">
                          <label className="form-label small mb-1 fw-semibold">Override Category</label>
                          <select className="form-select form-select-sm" value={overrideCat} onChange={(e) => setOverrideCat(e.target.value)}>
                            <option value="Potholes and damaged roads">Potholes and damaged roads</option>
                            <option value="Garbage and illegal dumping">Garbage and illegal dumping</option>
                            <option value="Overflowing drainage and sewage">Overflowing drainage and sewage</option>
                            <option value="Water leakage and waterlogging">Water leakage and waterlogging</option>
                            <option value="Damaged streetlights">Damaged streetlights</option>
                            <option value="Broken public infrastructure">Broken public infrastructure</option>
                            <option value="Fallen trees and road obstructions">Fallen trees and road obstructions</option>
                            <option value="Other civic issues">Other civic issues</option>
                          </select>
                        </div>
                        <div className="col-sm-6">
                          <label className="form-label small mb-1 fw-semibold">Override Severity</label>
                          <select className="form-select form-select-sm" value={overrideSev} onChange={(e) => setOverrideSev(e.target.value)}>
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                        </div>
                      </div>
                      <div className="mb-2">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Staff verification notes (e.g. Field inspection confirmed level 3 asphalt crater)..."
                          value={overrideNotes}
                          onChange={(e) => setOverrideNotes(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-sm btn-outline-primary" disabled={overrideSaving}>
                        {overrideSaving ? 'Saving...' : '💾 Save Staff Verification & Override'}
                      </button>
                    </form>
                  </div>
                </div>

                {selectedComplaint.reviewRemarks && (
                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-1">Field Inspector Remarks:</h6>
                    <p className="mb-0 small">{selectedComplaint.reviewRemarks}</p>
                    {selectedComplaint.rejectionReason && (
                      <div className="text-danger small mt-2">
                        <strong>Rejection Reason:</strong> {selectedComplaint.rejectionReason}
                      </div>
                    )}
                  </div>
                )}

                {selectedComplaint.resolutionRemarks && (
                  <div className="alert alert-success mb-4">
                    <h6 className="fw-bold mb-1">Resolution Summary:</h6>
                    <p className="mb-0 small">{selectedComplaint.resolutionRemarks}</p>
                  </div>
                )}

                <h6 className="fw-bold mb-3 border-bottom pb-2">Status Timeline</h6>
                <div className="timeline">
                  {selectedComplaint.statusHistory?.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge badge-status badge-${h.newStatus}`}>{h.newStatus.replace('_', ' ')}</span>
                        <span className="small text-muted">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="small text-dark mt-1">{h.remarks}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Assign Department / Reviewer</h5>
                <button type="button" className="btn-close" onClick={() => setShowAssignModal(false)}></button>
              </div>
              <form onSubmit={handleAssignSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Department</label>
                    <select
                      className="gov-select"
                      value={assignDept}
                      onChange={(e) => setAssignDept(e.target.value)}
                    >
                      <option value="">-- Select Department --</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Inspector / Reviewer</label>
                    <select
                      className="gov-select"
                      value={assignReviewer}
                      onChange={(e) => setAssignReviewer(e.target.value)}
                    >
                      <option value="">-- Select Reviewer --</option>
                      {reviewers.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.name} ({r.department?.code || 'Reviewer'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Priority</label>
                    <select
                      className="gov-select"
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value)}
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Instructions / Remarks</label>
                    <textarea
                      className="gov-textarea"
                      rows="2"
                      placeholder="e.g. Inspect site coordinates and verify water pipeline damage."
                      value={assignRemarks}
                      onChange={(e) => setAssignRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAssignModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    Assign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Complaint Status</h5>
                <button type="button" className="btn-close" onClick={() => setShowStatusModal(false)}></button>
              </div>
              <form onSubmit={handleStatusSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Workflow Status</label>
                    <select
                      className="gov-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="SUBMITTED">SUBMITTED</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  {newStatus === 'RESOLVED' && (
                    <div className="mb-3">
                      <label className="gov-label">Resolution Summary *</label>
                      <textarea
                        className="gov-textarea"
                        rows="3"
                        required
                        placeholder="Detail completed repair work..."
                        value={resolutionRemarks}
                        onChange={(e) => setResolutionRemarks(e.target.value)}
                      ></textarea>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="gov-label">Remarks</label>
                    <textarea
                      className="gov-textarea"
                      rows="2"
                      placeholder="Remarks for history trail..."
                      value={statusRemarks}
                      onChange={(e) => setStatusRemarks(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowStatusModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm">
                    Update Status
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

export default AdminComplaints;

