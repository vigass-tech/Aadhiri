import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  PlusCircle,
  Building,
  Tag,
  AlertCircle
} from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMyComplaints = async () => {
    setLoading(true);
    try {
      let query = `/complaints?search=${search}`;
      if (statusFilter) query += `&status=${statusFilter}`;
      if (categoryFilter) query += `&category=${categoryFilter}`;
      const res = await api.get(query);
      if (res.data.success) {
        setComplaints(res.data.complaints);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, [search, statusFilter, categoryFilter]);

  const handleOpenDetails = async (c) => {
    try {
      const res = await api.get(`/complaints/${c._id}`);
      if (res.data.success) {
        setSelectedComplaint(res.data.complaint);
      } else {
        setSelectedComplaint(c);
      }
    } catch (err) {
      setSelectedComplaint(c);
    }
    setShowModal(true);
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">My Registered Grievances</h4>
          <p className="text-muted small mb-0">
            Track status transitions, inspect field remarks, and review resolution reports for your complaints.
          </p>
        </div>
        <Link to="/citizen/raise-complaint" className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
          <PlusCircle size={16} /> File New Complaint
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={16} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by Ticket ID, Title, Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
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
          <div className="col-md-4">
            <select
              className="gov-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Water Supply">Water Supply</option>
              <option value="Electricity & Lighting">Electricity & Lighting</option>
              <option value="Sanitation & Waste">Sanitation & Waste</option>
              <option value="Public Health">Public Health</option>
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
                <th>Subject & Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Submission Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{c.ticketId}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="badge bg-light text-secondary border small">{c.category}</div>
                    </td>
                    <td>{c.department?.name || <span className="text-muted">Awaiting Allocation</span>}</td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td className="small text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenDetails(c)}
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        title="View Full History"
                      >
                        <Eye size={14} /> View History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No complaints found.{' '}
                    <Link to="/citizen/raise-complaint" className="fw-bold text-primary">
                      Submit a new grievance
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details & Timeline Modal */}
      {showModal && selectedComplaint && (
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
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <h5 className="fw-bold text-dark mb-2">{selectedComplaint.title}</h5>
                <p className="text-muted leading-relaxed mb-4">{selectedComplaint.description}</p>

                <div className="row g-3 mb-4">
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted fw-bold">LOCALITY / LOCATION</div>
                      <div className="fw-semibold text-dark mt-1">{selectedComplaint.location}</div>
                      <div className="small text-muted">{selectedComplaint.address || 'No landmark specified'}</div>
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="p-3 bg-light rounded">
                      <div className="small text-muted fw-bold">DEPARTMENT & PRIORITY</div>
                      <div className="fw-semibold text-dark mt-1">
                        {selectedComplaint.department?.name || 'Awaiting Assignment'}
                      </div>
                      <div className="mt-1">
                        Priority: <span className={`badge badge-priority-${selectedComplaint.priority}`}>{selectedComplaint.priority}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approved / Remarks for citizen visibility */}
                {selectedComplaint.reviewRemarks && (
                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-1">Inspector Assessment Remarks:</h6>
                    <p className="mb-0 small">{selectedComplaint.reviewRemarks}</p>
                    {selectedComplaint.rejectionReason && (
                      <div className="text-danger small mt-2">
                        <strong>Reason:</strong> {selectedComplaint.rejectionReason}
                      </div>
                    )}
                  </div>
                )}

                {selectedComplaint.resolutionRemarks && (
                  <div className="alert alert-success mb-4">
                    <h6 className="fw-bold mb-1">Official Resolution Report:</h6>
                    <p className="mb-0 small">{selectedComplaint.resolutionRemarks}</p>
                  </div>
                )}

                <h6 className="fw-bold mb-3 border-bottom pb-2">Status Audit Trail & Timeline</h6>
                <div className="timeline">
                  {selectedComplaint.statusHistory?.map((h, i) => (
                    <div key={i} className="timeline-item">
                      <div className="timeline-dot"></div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge badge-status badge-${h.newStatus}`}>{h.newStatus.replace('_', ' ')}</span>
                        <span className="small text-muted">{new Date(h.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="small text-dark mt-1 fw-medium">{h.remarks}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyComplaints;

