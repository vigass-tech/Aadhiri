import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DollarSign, Plus, Edit, TrendingDown, TrendingUp, Building } from 'lucide-react';

const AdminBudgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({ totalAllocated: 0, totalUtilized: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    department: '',
    title: '',
    financialYear: '2025-2026',
    allocatedAmount: '',
    utilizedAmount: '0',
    description: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([api.get('/budgets'), api.get('/departments')]);
      if (bRes.data.success) {
        setBudgets(bRes.data.budgets);
        setSummary(bRes.data.summary);
      }
      if (dRes.data.success) {
        setDepartments(dRes.data.departments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (b = null) => {
    setError('');
    setSuccess('');
    if (b) {
      setEditingBudget(b);
      setFormData({
        department: b.department?._id || '',
        title: b.title,
        financialYear: b.financialYear,
        allocatedAmount: b.allocatedAmount,
        utilizedAmount: b.utilizedAmount,
        description: b.description || '',
        status: b.status
      });
    } else {
      setEditingBudget(null);
      setFormData({
        department: '',
        title: '',
        financialYear: '2025-2026',
        allocatedAmount: '',
        utilizedAmount: '0',
        description: '',
        status: 'ACTIVE'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const allocated = Number(formData.allocatedAmount);
    const utilized = Number(formData.utilizedAmount || 0);

    if (utilized > allocated) {
      setError('Utilized amount cannot exceed allocated capital.');
      return;
    }

    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, formData);
        setSuccess('Budget updated successfully.');
      } else {
        await api.post('/budgets', formData);
        setSuccess('Budget record created successfully.');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Departmental Works Budget Oversight</h4>
          <p className="text-muted small mb-0">
            Track civic repair allocations, contractor disbursements, and remaining operational balance.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Add Budget Record
        </button>
      </div>

      {success && <div className="alert alert-success py-2 small mb-3">{success}</div>}
      {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card teal">
            <div>
              <div className="text-muted small fw-bold">TOTAL ALLOCATED</div>
              <div className="fs-3 fw-bold text-dark mt-1">₹{summary.totalAllocated.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">FUNDS UTILIZED</div>
              <div className="fs-3 fw-bold text-warning mt-1">₹{summary.totalUtilized.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">REMAINING BALANCE</div>
              <div className="fs-3 fw-bold text-success mt-1">₹{summary.totalRemaining.toLocaleString('en-IN')}</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Scheme Title</th>
                <th>FY</th>
                <th>Allocated (₹)</th>
                <th>Utilized (₹)</th>
                <th>Remaining (₹)</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length > 0 ? (
                budgets.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="badge bg-light text-primary border">{b.department?.code || 'N/A'}</span>
                      <div className="small text-muted">{b.department?.name}</div>
                    </td>
                    <td className="fw-bold text-dark">{b.title}</td>
                    <td>{b.financialYear}</td>
                    <td>₹{b.allocatedAmount.toLocaleString('en-IN')}</td>
                    <td className="text-warning">₹{b.utilizedAmount.toLocaleString('en-IN')}</td>
                    <td className="text-success fw-bold">₹{b.remainingAmount.toLocaleString('en-IN')}</td>
                    <td>
                      <span className={`badge ${b.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleOpenModal(b)}
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
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No budget records found.
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
                  {editingBudget ? 'Edit Budget Record' : 'Create Budget Allocation'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
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
                    <label className="gov-label">Scheme Title *</label>
                    <input
                      type="text"
                      className="gov-input"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Allocated Capital (₹) *</label>
                      <input
                        type="number"
                        className="gov-input"
                        required
                        min="0"
                        value={formData.allocatedAmount}
                        onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Utilized Amount (₹)</label>
                      <input
                        type="number"
                        className="gov-input"
                        min="0"
                        value={formData.utilizedAmount}
                        onChange={(e) => setFormData({ ...formData, utilizedAmount: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    Save Budget
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

export default AdminBudgets;

