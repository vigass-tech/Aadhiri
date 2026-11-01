import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  Building,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [summary, setSummary] = useState({ totalAllocated: 0, totalUtilized: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    department: '',
    title: '',
    financialYear: '2025-2026',
    allocatedAmount: '',
    utilizedAmount: '',
    description: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/budgets';
      if (deptFilter) url += `?department=${deptFilter}`;
      const [bRes, dRes] = await Promise.all([api.get(url), api.get('/departments')]);
      if (bRes.data.success) {
        setBudgets(bRes.data.budgets);
        setSummary(bRes.data.summary);
      }
      if (dRes.data.success) {
        setDepartments(dRes.data.departments);
      }
    } catch (err) {
      setError('Failed to fetch budget records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptFilter]);

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

    if (isNaN(allocated) || allocated < 0) {
      setError('Allocated amount must be a positive number.');
      return;
    }

    if (isNaN(utilized) || utilized < 0) {
      setError('Utilized amount must be a positive number.');
      return;
    }

    if (utilized > allocated) {
      setError('Utilized amount cannot exceed the total allocated fund.');
      return;
    }

    try {
      if (editingBudget) {
        await api.put(`/budgets/${editingBudget._id}`, formData);
        setSuccess(`Budget "${formData.title}" updated.`);
      } else {
        await api.post('/budgets', formData);
        setSuccess(`Budget allocation "${formData.title}" created.`);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDelete = async (b) => {
    if (window.confirm(`Are you sure you want to delete budget allocation "${b.title}"?`)) {
      try {
        await api.delete(`/budgets/${b._id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete budget record.');
      }
    }
  };

  const percentUtilized =
    summary.totalAllocated > 0
      ? Math.round((summary.totalUtilized / summary.totalAllocated) * 100)
      : 0;

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Departmental Budget & Fund Oversight</h4>
          <p className="text-muted small mb-0">
            Allocate funds, monitor repair expenditures, and track remaining capital for municipal works.
          </p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-gov-primary btn-sm d-flex align-items-center gap-1">
          <Plus size={16} /> Allocate Budget
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

      {/* Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-card teal">
            <div>
              <div className="text-muted small fw-bold">TOTAL ALLOCATED FUNDS</div>
              <div className="fs-3 fw-bold text-dark mt-1">₹{summary.totalAllocated.toLocaleString('en-IN')}</div>
              <div className="text-secondary small mt-1">Across all civic portfolios</div>
            </div>
            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">FUNDS UTILIZED / DISBURSED</div>
              <div className="fs-3 fw-bold text-warning mt-1">₹{summary.totalUtilized.toLocaleString('en-IN')}</div>
              <div className="text-muted small mt-1">{percentUtilized}% of allocated capital</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <TrendingDown size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">REMAINING AVAILABLE BALANCE</div>
              <div className="fs-3 fw-bold text-success mt-1">₹{summary.totalRemaining.toLocaleString('en-IN')}</div>
              <div className="text-muted small mt-1">Ready for active works</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <label className="gov-label mb-0 small text-nowrap">Filter by Department:</label>
          <select
            className="gov-select"
            style={{ maxWidth: '300px' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Municipal Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Budgets Table */}
      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Budget Title</th>
                <th>FY</th>
                <th>Allocated (₹)</th>
                <th>Utilized (₹)</th>
                <th>Remaining (₹)</th>
                <th>Burn Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.length > 0 ? (
                budgets.map((b) => {
                  const rate = b.allocatedAmount > 0 ? Math.round((b.utilizedAmount / b.allocatedAmount) * 100) : 0;
                  return (
                    <tr key={b._id}>
                      <td>
                        <span className="badge bg-light text-primary border fw-bold">
                          {b.department?.code || 'N/A'}
                        </span>
                        <div className="small text-muted">{b.department?.name}</div>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{b.title}</div>
                        <div className="small text-muted text-truncate" style={{ maxWidth: '200px' }}>
                          {b.description || 'No description provided'}
                        </div>
                      </td>
                      <td>{b.financialYear}</td>
                      <td className="fw-bold">₹{b.allocatedAmount.toLocaleString('en-IN')}</td>
                      <td className="text-warning">₹{b.utilizedAmount.toLocaleString('en-IN')}</td>
                      <td className="fw-bold text-success">₹{b.remainingAmount.toLocaleString('en-IN')}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '6px', minWidth: '60px' }}>
                            <div
                              className={`progress-bar ${rate > 80 ? 'bg-danger' : rate > 50 ? 'bg-warning' : 'bg-primary'}`}
                              role="progressbar"
                              style={{ width: `${rate}%` }}
                            ></div>
                          </div>
                          <span className="small text-muted">{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${b.status === 'ACTIVE' ? 'bg-success' : b.status === 'DEPLETED' ? 'bg-danger' : 'bg-secondary'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <button
                            onClick={() => handleOpenModal(b)}
                            className="btn btn-sm btn-outline-primary py-1 px-2"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(b)}
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-muted">
                    No budget allocations recorded yet.
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
                  {editingBudget ? 'Edit Budget Record' : 'Allocate Departmental Budget'}
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
                    <label className="gov-label">Budget Scheme / Title *</label>
                    <input
                      type="text"
                      className="gov-input"
                      placeholder="e.g. Monsoon Storm Water Drainage Fund"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Financial Year *</label>
                      <input
                        type="text"
                        className="gov-input"
                        placeholder="2025-2026"
                        required
                        value={formData.financialYear}
                        onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Allocated Capital (₹) *</label>
                      <input
                        type="number"
                        className="gov-input"
                        placeholder="5000000"
                        required
                        min="0"
                        value={formData.allocatedAmount}
                        onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="gov-label">Utilized Amount (₹)</label>
                      <input
                        type="number"
                        className="gov-input"
                        placeholder="0"
                        min="0"
                        value={formData.utilizedAmount}
                        onChange={(e) => setFormData({ ...formData, utilizedAmount: e.target.value })}
                      />
                    </div>
                    <div className="col-6">
                      <label className="gov-label">Status</label>
                      <select
                        className="gov-select"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="DEPLETED">DEPLETED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="gov-label">Description & Scheme Notes</label>
                    <textarea
                      className="gov-textarea"
                      rows="2"
                      placeholder="Specify purpose and authorization guidelines..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-gov-primary btn-sm">
                    {editingBudget ? 'Update Budget' : 'Save Allocation'}
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

export default BudgetManagement;

