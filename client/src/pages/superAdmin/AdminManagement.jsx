import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  ShieldAlert,
  Plus,
  Edit,
  Trash2,
  KeyRound,
  CheckCircle,
  XCircle,
  Search,
  Building
} from 'lucide-react';

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department: '',
    assignedDepartments: [],
    designation: '',
    address: ''
  });
  const [resetModal, setResetModal] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, deptsRes] = await Promise.all([
        api.get(`/users?role=ADMIN&search=${search}`),
        api.get('/departments')
      ]);
      if (adminsRes.data.success) {
        setAdmins(adminsRes.data.users);
      }
      if (deptsRes.data.success) {
        setDepartments(deptsRes.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleOpenModal = (admin = null) => {
    setError('');
    setSuccess('');
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        password: '',
        department: admin.department?._id || '',
        assignedDepartments: admin.assignedDepartments?.map((d) => d._id) || [],
        designation: admin.designation || '',
        address: admin.address || ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        department: '',
        assignedDepartments: [],
        designation: 'Zonal Administrator',
        address: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingAdmin) {
        await api.put(`/users/${editingAdmin._id}`, formData);
        setSuccess(`Administrator ${formData.name} updated successfully.`);
      } else {
        await api.post('/users', { ...formData, role: 'ADMIN' });
        setSuccess(`Administrator ${formData.name} created successfully.`);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      await api.patch(`/users/${admin._id}/status`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (admin) => {
    if (window.confirm(`Are you sure you want to delete administrator "${admin.name}"?`)) {
      try {
        await api.delete(`/users/${admin._id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
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
      await api.put(`/users/${resetTargetUser._id}`, { password: newPassword });
      setSuccess(`Password for ${resetTargetUser.name} reset successfully.`);
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
          <h4 className="fw-bold text-dark mb-1">Zonal Administrator Management</h4>
          <p className="text-muted small mb-0">
            Provision zonal admins, allocate department oversight permissions, and manage access credentials.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Create Zonal Admin
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
            placeholder="Search admins by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Admins Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Officer Name</th>
                <th>Designation</th>
                <th>Email / Phone</th>
                <th>Primary Dept</th>
                <th>Assigned Portfolios</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.length > 0 ? (
                admins.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div className="fw-bold text-dark">{a.name}</div>
                      <div className="small text-muted">{a.address || 'Zonal Office'}</div>
                    </td>
                    <td>{a.designation || 'Zonal Administrator'}</td>
                    <td>
                      <div className="small text-dark">{a.email}</div>
                      <div className="small text-muted">{a.phone}</div>
                    </td>
                    <td>
                      {a.department?.name ? (
                        <span className="badge bg-light text-primary border">{a.department.name}</span>
                      ) : (
                        <span className="text-muted">Unspecified</span>
                      )}
                    </td>
                    <td>
                      {a.assignedDepartments && a.assignedDepartments.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {a.assignedDepartments.map((d) => (
                            <span key={d._id} className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>
                              {d.code}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="small text-muted">All Portfolios</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(a)}
                        className={`badge border-0 ${a.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {a.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleOpenModal(a)}
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setResetTargetUser(a);
                            setResetModal(true);
                          }}
                          className="btn btn-sm btn-outline-warning py-1 px-2"
                          title="Reset Password"
                        >
                          <KeyRound size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(a)}
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
                    No administrators found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Admin Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingAdmin ? 'Edit Administrator Profile' : 'Create New Zonal Administrator'}
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
                      placeholder="e.g. Kumar Natarajan"
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
                        placeholder="admin@aadhirai.gov.in"
                        required
                        disabled={!!editingAdmin}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="gov-input"
                        placeholder="9840223344"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  {!editingAdmin && (
                    <div className="mb-3">
                      <label className="gov-label">Secure Initial Password *</label>
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
                    <label className="gov-label">Designation</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Zonal Municipal Commissioner"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Primary Department</label>
                    <select
                      className="gov-select"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    >
                      <option value="">-- Select Primary Department --</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Office Address / Zone</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Zone 5 Zonal Office, Anna Nagar"
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
                    {editingAdmin ? 'Save Changes' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModal && resetTargetUser && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Reset Administrator Password</h5>
                <button type="button" className="btn-close" onClick={() => setResetModal(false)}></button>
              </div>
              <form onSubmit={handleResetPassword}>
                <div className="modal-body">
                  <p className="text-muted small">
                    Resetting credentials for <strong>{resetTargetUser.name}</strong> ({resetTargetUser.email}).
                  </p>
                  <label className="gov-label">New Password (min 6 characters) *</label>
                  <input
                    type="password"
                    className="gov-input"
                    placeholder="Enter new strong password"
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
                    Confirm Password Reset
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

export default AdminManagement;

