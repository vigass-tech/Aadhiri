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
        setSelectedComplaint(res.data.complaint);
      } else {
        setSelectedComplaint(complaint);
      }
    } catch (err) {
      setSelectedComplaint(complaint);
    }
    setShowDetailModal(true);
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

