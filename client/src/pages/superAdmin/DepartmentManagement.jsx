import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Users,
  FileText
} from 'lucide-react';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: '',
    email: '',
    phone: '',
    isActive: true
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/departments?search=${search}`);
      if (res.data.success) {
        setDepartments(res.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch departments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [search]);

  const handleOpenModal = (dept = null) => {
    setError('');
    setSuccess('');
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description,
        head: dept.head || '',
        email: dept.email || '',
        phone: dept.phone || '',
        isActive: dept.isActive
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        head: '',
        email: '',
        phone: '',
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, formData);
        setSuccess(`Department ${formData.name} updated successfully.`);
      } else {
        await api.post('/departments', formData);
        setSuccess(`Department ${formData.name} created successfully.`);
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed. Please check inputs.');
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      await api.put(`/departments/${dept._id}`, { isActive: !dept.isActive });
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleDelete = async (dept) => {
    if (window.confirm(`Are you sure you want to delete department "${dept.name}" (${dept.code})?`)) {
      try {
        await api.delete(`/departments/${dept._id}`);
        fetchDepartments();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete department.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Department Management</h4>
          <p className="text-muted small mb-0">
            Define civic portfolios, assign department heads, and manage municipal jurisdictions.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Add Department
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

      {/* Search Bar */}
      <div className="gov-card p-3 mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search by department name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Departments Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Head / In-charge</th>
                <th>Contact Info</th>
                <th>Complaints</th>
                <th>Staff</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length > 0 ? (
                departments.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <span className="badge bg-dark fw-bold">{d.code}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{d.name}</div>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '240px' }}>
                        {d.description}
                      </div>
                    </td>
                    <td>{d.head || <span className="text-muted">Not specified</span>}</td>
                    <td>
                      <div className="small text-dark">{d.email}</div>
                      <div className="small text-muted">{d.phone}</div>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border">
                        {d.stats?.totalComplaints || 0} Total
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {d.stats?.staffCount || 0} Members
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(d)}
                        className={`badge border-0 ${d.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle status"
                      >
                        {d.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          onClick={() => handleOpenModal(d)}
                          className="btn btn-sm btn-outline-primary py-1 px-2"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(d)}
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
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No departments found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {editingDept ? 'Edit Department' : 'Create New Department'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="gov-label">Department Name *</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="e.g. Public Works & Roads"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Department Code (Uppercase) *</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="e.g. PWD"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Description *</label>
                    <textarea
                      className="gov-textarea"
                      rows="2"
                      placeholder="Mandate and scope of operations"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="gov-label">Department Head / Officer</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="Er. R. Sundaram, Chief Engineer"
                      value={formData.head}
                      onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Official Email</label>
                      <input
                        type="email"
                        className="gov-input"
                        placeholder="pwd@aadhirai.gov.in"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Contact Phone</label>
                      <input
                        type="text"
                        className="gov-input"
                        placeholder="+91 44 2859 1001"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    {editingDept ? 'Update Department' : 'Save Department'}
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

export default DepartmentManagement;

