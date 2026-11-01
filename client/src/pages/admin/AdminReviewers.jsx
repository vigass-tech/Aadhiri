import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { UserCheck, Plus, Edit, Search, CheckCircle, XCircle } from 'lucide-react';

const AdminReviewers = () => {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [revRes, deptRes] = await Promise.all([
        api.get(`/users?role=REVIEWER&search=${search}`),
        api.get('/departments')
      ]);
      if (revRes.data.success) setReviewers(revRes.data.users);
      if (deptRes.data.success) setDepartments(deptRes.data.departments);
    } catch (err) {
      setError('Failed to fetch reviewers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenModal = (rev = null) => {
    setError('');
    setSuccess('');
    if (rev) {
      setEditingReviewer(rev);
      setFormData({
        name: rev.name,
        email: rev.email,
        phone: rev.phone,
        password: '',
        department: rev.department?._id || '',
        designation: rev.designation || '',
        address: rev.address || ''
      });
    } else {
      setEditingReviewer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        department: '',
        designation: 'Senior Field Inspector',
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
        setSuccess(`Reviewer ${formData.name} updated.`);
      } else {
        await api.post('/users', { ...formData, role: 'REVIEWER' });
        setSuccess(`Reviewer ${formData.name} appointed.`);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleToggleStatus = async (rev) => {
    try {
      await api.patch(`/users/${rev._id}/status`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Field Reviewer Deployment</h4>
          <p className="text-muted small mb-0">
            Assign inspection officers to department portfolios and monitor field verification workload.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Appoint Reviewer
        </button>
      </div>

      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      <div className="gov-card p-3 mb-4">
        <div className="input-group" style={{ maxWidth: '380px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search reviewers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Inspector Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviewers.length > 0 ? (
                reviewers.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-bold text-dark">{r.name}</div>
                      <div className="small text-muted">{r.address || 'Inspection Station'}</div>
                    </td>
                    <td>{r.designation}</td>
                    <td>
                      {r.department?.name ? (
                        <span className="badge bg-light text-primary border">{r.department.name}</span>
                      ) : (
                        <span className="text-muted">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div>{r.email}</div>
                      <div className="small text-muted">{r.phone}</div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`badge border-0 ${r.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {r.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(r)}
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No reviewers registered.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingReviewer ? 'Edit Reviewer' : 'Appoint Reviewer'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Full Name *</label>
                    <input
                      type="text"
                      className="gov-input"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Email *</label>
                      <input
                        type="email"
                        className="gov-input"
                        required
                        disabled={!!editingReviewer}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Phone *</label>
                      <input
                        type="tel"
                        className="gov-input"
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
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="gov-label">Department *</label>
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
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    Save Reviewer
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

export default AdminReviewers;

