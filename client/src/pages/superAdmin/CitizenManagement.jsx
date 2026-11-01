import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Calendar,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const CitizenManagement = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [citizenComplaints, setCitizenComplaints] = useState([]);
  const [detailsModal, setDetailsModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', address: '', isActive: true });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      let url = `/users?role=CITIZEN&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setCitizens(res.data.users);
      }
    } catch (err) {
      setError('Failed to fetch citizen records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [search, statusFilter]);

  const handleViewDetails = async (citizen) => {
    try {
      const res = await api.get(`/users/${citizen._id}`);
      if (res.data.success) {
        setSelectedCitizen(res.data.user);
        setCitizenComplaints(res.data.complaints || []);
        setDetailsModal(true);
      }
    } catch (err) {
      alert('Could not load citizen complaint history.');
    }
  };

  const handleOpenEdit = (citizen) => {
    setSelectedCitizen(citizen);
    setEditFormData({
      name: citizen.name,
      phone: citizen.phone,
      address: citizen.address || '',
      isActive: citizen.isActive
    });
    setEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${selectedCitizen._id}`, editFormData);
      setSuccess(`Citizen ${editFormData.name} updated successfully.`);
      setEditModal(false);
      fetchCitizens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update citizen.');
    }
  };

  const handleToggleStatus = async (citizen) => {
    try {
      await api.patch(`/users/${citizen._id}/status`);
      fetchCitizens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (citizen) => {
    if (window.confirm(`Are you sure you want to delete citizen profile "${citizen.name}"?`)) {
      try {
        await api.delete(`/users/${citizen._id}`);
        fetchCitizens();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete citizen record.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Citizen Directory & Management</h4>
          <p className="text-muted small mb-0">
            View registered citizens, inspect grievance filing histories, and manage portal access privileges.
          </p>
        </div>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show small py-2 mb-3">
          {success}
          <button type="button" className="btn-close py-2" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="gov-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: '380px' }}>
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="gov-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Account Status</option>
            <option value="true">Active Only</option>
            <option value="false">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Citizens Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Citizen Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th>Address / Ward</th>
                <th>Registered On</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {citizens.length > 0 ? (
                citizens.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-bold text-dark">{c.name}</div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                        {c.address || 'Not specified'}
                      </div>
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`badge border-0 ${c.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {c.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="btn btn-sm btn-outline-info py-1 px-2"
                          title="View Complaint History"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No citizens registered matching the query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Details & Grievance History Modal */}
      {detailsModal && selectedCitizen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Citizen Grievance Record</h5>
                <button type="button" className="btn-close" onClick={() => setDetailsModal(false)}></button>
              </div>
              <div className="modal-body">
                {/* Profile Snapshot */}
                <div className="p-3 bg-light rounded mb-4">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="fw-bold fs-6 text-dark">{selectedCitizen.name}</div>
                      <div className="small text-muted d-flex align-items-center gap-1 mt-1">
                        <Mail size={14} /> {selectedCitizen.email}
                      </div>
                      <div className="small text-muted d-flex align-items-center gap-1 mt-1">
                        <Phone size={14} /> {selectedCitizen.phone}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="small text-muted d-flex align-items-start gap-1">
                        <MapPin size={14} className="mt-1 flex-shrink-0" />
                        <span>{selectedCitizen.address || 'Address on record not supplied'}</span>
                      </div>
                      <div className="mt-2">
                        <span className={`badge ${selectedCitizen.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {selectedCitizen.isActive ? 'Account Active' : 'Account Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3 text-dark">Complaints Filed by Citizen ({citizenComplaints.length})</h6>
                {citizenComplaints.length > 0 ? (
                  <div className="gov-table-container">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {citizenComplaints.map((comp) => (
                          <tr key={comp._id}>
                            <td className="fw-bold text-primary font-monospace">{comp.ticketId}</td>
                            <td>{comp.title}</td>
                            <td>{comp.department?.name || 'Pending Dept'}</td>
                            <td>
                              <span className={`badge badge-status badge-${comp.status}`}>
                                {comp.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="small text-muted">
                              {new Date(comp.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted small bg-light rounded">
                    This citizen has not submitted any complaints yet.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetailsModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Citizen Modal */}
      {editModal && selectedCitizen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Edit Citizen Details</h5>
                <button type="button" className="btn-close" onClick={() => setEditModal(false)}></button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Full Name *</label>
                    <input
                      type="text"
                      className="gov-input"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="gov-input"
                      required
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Address</label>
                    <input
                      type="text"
                      className="gov-input"
                      value={editFormData.address}
                      onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="activeCheck"
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    />
                    <label className="form-check-label small" htmlFor="activeCheck">
                      Account Active & Verified
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    Save Changes
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

export default CitizenManagement;

