import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Users,
  ShieldCheck,
  UserCheck,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#0284c7', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/super-admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch Super Admin dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted fw-semibold">Loading Super Administrator Analytics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between">
        <div>{error || 'Unable to load dashboard data.'}</div>
        <button onClick={fetchDashboard} className="btn btn-sm btn-outline-danger">
          Retry
        </button>
      </div>
    );
  }

  const { metrics, charts, recentComplaints } = data;

  return (
    <div className="super-admin-dashboard">
      {/* Top Banner */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Super Administrator Command Center</h4>
          <p className="text-muted small mb-0">
            Real-time civic operations overview, department performance, and budget utilization.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchDashboard} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/super-admin/complaints" className="btn btn-gov-primary btn-sm">
            View All Complaints
          </Link>
        </div>
      </div>

      {/* 1. Core Metrics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-sm-6">
          <div className="stat-card navy">
            <div>
              <div className="text-muted small fw-bold">TOTAL COMPLAINTS</div>
              <div className="fs-3 fw-bold text-dark mt-1">{metrics.totalComplaints}</div>
              <div className="text-secondary small mt-1">{metrics.pendingComplaints} Pending Review</div>
            </div>
            <div className="p-3 bg-light rounded-circle text-primary">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">RESOLVED GRIEVANCES</div>
              <div className="fs-3 fw-bold text-success mt-1">{metrics.resolvedComplaints}</div>
              <div className="text-muted small mt-1">Verified on Ground</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">IN REVIEW / ACTIVE</div>
              <div className="fs-3 fw-bold text-warning mt-1">{metrics.inReviewComplaints}</div>
              <div className="text-muted small mt-1">Assigned to Inspectors</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-sm-6">
          <div className="stat-card teal">
            <div>
              <div className="text-muted small fw-bold">BUDGET ALLOCATED</div>
              <div className="fs-3 fw-bold text-info mt-1">
                ₹{(metrics.budgetOverview.totalAllocated / 100000).toFixed(1)}L
              </div>
              <div className="text-muted small mt-1">
                Utilized: ₹{(metrics.budgetOverview.totalUtilized / 100000).toFixed(1)}L
              </div>
            </div>
            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Quick Counts */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="gov-card p-3 d-flex align-items-center gap-3">
            <Building2 size={28} className="text-primary" />
            <div>
              <div className="text-muted small">Departments</div>
              <div className="fw-bold fs-5">{metrics.totalDepartments} Active</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3 d-flex align-items-center gap-3">
            <ShieldCheck size={28} className="text-danger" />
            <div>
              <div className="text-muted small">Zonal Admins</div>
              <div className="fw-bold fs-5">{metrics.totalAdmins} Officers</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3 d-flex align-items-center gap-3">
            <UserCheck size={28} className="text-warning" />
            <div>
              <div className="text-muted small">Reviewers</div>
              <div className="fw-bold fs-5">{metrics.totalReviewers} Inspectors</div>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3 d-flex align-items-center gap-3">
            <Users size={28} className="text-success" />
            <div>
              <div className="text-muted small">Registered Citizens</div>
              <div className="fw-bold fs-5">{metrics.totalCitizens} Citizens</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="row g-4 mb-4">
        {/* Status Breakdown Bar Chart */}
        <div className="col-lg-7">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <TrendingUp size={18} className="text-primary" /> Complaints by Status Breakdown
            </h6>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={charts.statusBreakdown}>
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="col-lg-5">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Complaints by Priority</h6>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={charts.priorityBreakdown}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {charts.priorityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Performance */}
        <div className="col-12">
          <div className="gov-card">
            <h6 className="fw-bold text-dark mb-3">Departmental Workload & Resolution Comparison</h6>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={charts.departmentPerformance}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Total Filed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Recent Complaints Table */}
      <div className="gov-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">Recently Lodged Complaints</h6>
          <Link to="/super-admin/complaints" className="small text-primary fw-semibold text-decoration-none">
            View All ({metrics.totalComplaints}) →
          </Link>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Citizen</th>
                <th>Title / Category</th>
                <th>Department</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentComplaints && recentComplaints.length > 0 ? (
                recentComplaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary font-monospace">{c.ticketId}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.citizen?.name || 'Anonymous'}</div>
                      <div className="small text-muted">{c.citizen?.phone}</div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                        {c.title}
                      </div>
                      <div className="badge bg-light text-secondary border small">{c.category}</div>
                    </td>
                    <td>{c.department?.name || <span className="text-muted">Unassigned</span>}</td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/super-admin/complaints?id=${c._id}`}
                        className="btn btn-outline-primary btn-sm py-1 px-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No complaints registered in the system yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

