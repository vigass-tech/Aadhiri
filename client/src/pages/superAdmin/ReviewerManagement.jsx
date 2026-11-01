import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  UserCheck,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  Search,
  Building,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';

const ReviewerManagement = () => {
  const [reviewers, setReviewers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingReviewer, setEditingReviewer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    designation: '',
    address: ''
  });
  const [resetModal, setResetModal] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewersRes, deptsRes] = await Promise.all([
        api.get(`/users?role=REVIEWER&search=${search}`),
        api.get('/departments')
      ]);
      if (reviewersRes.data.success) {
        setReviewers(reviewersRes.data.users);
      }
      if (deptsRes.data.success) {
        setDepartments(deptsRes.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch reviewers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenModal = (reviewer = null) => {
    setError('');
    setSuccess('');
    if (reviewer) {
      setEditingReviewer(reviewer);
      setFormData({
        name: reviewer.name,
        email: reviewer.email,
        phone: reviewer.phone,
        password: '',
        department: reviewer.department?._id || '',
        designation: reviewer.designation || '',
        address: reviewer.address || ''
      });
    } else {
      setEditingReviewer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        department: '',
        designation: 'Senior Field Investigation Inspector',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingReviewer) {
        await api.put(`/users/${editingReviewer._id}`, formData);
        setSuccess(`Reviewer ${formData.name} updated successfully.`);
      } else {
        await api.post('/users', { ...formData, role: 'REVIEWER' });
        setSuccess(`Reviewer ${formData.name} created successfully.`);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleToggleStatus = async (reviewer) => {
    try {
      await api.patch(`/users/${reviewer._id}/status`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (reviewer) => {
    if (window.confirm(`Are you sure you want to delete reviewer "${reviewer.name}"?`)) {
      try {
        await api.delete(`/users/${reviewer._id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete reviewer.');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    try {
      await api.put(`/users/${targetUser._id}`, { password: newPassword });
      setSuccess(`Password for ${targetUser.name} reset successfully.`);
      setResetModal(false);
      setNewPassword('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Field Reviewer & Inspector Management</h4>
          <p className="text-muted small mb-0">
            Deploy on-ground inspectors to verify citizen claims, inspect site damages, and approve civic work.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Appoint Reviewer
        </button>
      </div>

      {success && (
        <div className="alert alert-success alert-dismissible fade show small py-2 mb-3">
          {success}
          <button type="button" className="btn-close py-2" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {error && (
        <div className="alert alert-danger alert-dismissible fade show small py-2 mb-3">
          {error}
          <button type="button" className="btn-close py-2" onClick={() => setError('')}></button>
        </div>
      )}

      {/* Search */}
      <div className="gov-card p-3 mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search reviewers by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Reviewers Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Inspector Name</th>
                <th>Designation</th>
                <th>Assigned Department</th>
                <th>Contact Details</th>
                <th>Office / Station</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.length > 0 ? (
                reviewers.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-bold text-dark">{r.name}</div>
                      <div className="small text-muted">{r.role}</div>
                    </td>
                    <td>{r.designation || 'Inspection Officer'}</td>
                    <td>
                      {r.department?.name ? (
                        <span className="badge bg-light text-primary border">
                          {r.department.name} ({r.department.code})
                        </span>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="small text-dark">{r.email}</div>
                      <div className="small text-muted">{r.phone}</div>
                    </td>
                    <td>{r.address || 'Divisional Inspection Office'}</td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`badge border-0 ${r.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleOpenModal(r)}
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setTargetUser(r);
                            setResetModal(true);
                          }}
                          className="btn btn-sm btn-outline-warning py-1 px-2"
                          title="Reset Password"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
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
                    No reviewers registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingReviewer ? 'Edit Reviewer Profile' : 'Appoint New Review Inspector'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Inspector Name *</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="e.g. Anandhi Devi"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Official Email *</label>
                      <input
                        type="email"
                        className="gov-input"
                        placeholder="reviewer@aadhirai.gov.in"
                        required
                        disabled={!!editingReviewer}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="gov-input"
                        placeholder="9840334455"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {!editingReviewer && (
                    <div className="mb-3">
                      <label className="gov-label">Initial Password *</label>
                      <input
                        type="password"
                        className="gov-input"
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="gov-label">Assigned Department *</label>
                    <select
                      className="gov-select"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                    <label className="gov-label">Designation</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Senior Field Investigation Inspector"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Office / Inspection Hub Address</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Divisional Inspection Office, Guindy"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    {editingReviewer ? 'Save Changes' : 'Appoint Reviewer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {resetModal && targetUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reset Reviewer Password</h5>
                <button type="button" className="btn-close" onClick={() => setResetModal(false)}></button>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body">
                  <p className="text-muted small">
                    Resetting credentials for <strong>{targetUser.name}</strong> ({targetUser.email}).
                  </p>
                  <label className="gov-label">New Password (min 6 characters) *</label>
                  <input
                    type="password"
                    className="gov-input"
                    placeholder="Enter new password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResetModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning btn-sm">
                    Confirm Reset
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

export default ReviewerManagement;

