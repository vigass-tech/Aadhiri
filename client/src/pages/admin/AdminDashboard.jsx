import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  UserCheck,
  TrendingUp,
  RefreshCw,
  Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

const COLORS = ['#0284c7', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Loading Zonal Admin Dashboard...</div>
      </div>
    );
  }

  const { metrics, charts, recentComplaints } = data;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Zonal Administrator Operations</h4>
          <p className="text-muted small mb-0">
            Jurisdictional complaint assignments, reviewer dispatch, and grievance resolution tracking.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={fetchDashboard} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <RefreshCw size={14} /> Refresh
          </button>
          <Link to="/admin/complaints" className="btn btn-gov-primary btn-sm">
            Manage Complaints
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="stat-card navy">
            <div>
              <div className="text-muted small fw-bold">TOTAL COMPLAINTS</div>
              <div className="fs-3 fw-bold text-dark mt-1">{metrics.totalComplaints}</div>
              <div className="text-secondary small mt-1">In authorized jurisdiction</div>
            </div>
            <div className="p-3 bg-light rounded-circle text-primary">
              <FileText size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card warning">
            <div>
              <div className="text-muted small fw-bold">PENDING ACTIONS</div>
              <div className="fs-3 fw-bold text-warning mt-1">{metrics.pendingComplaints}</div>
              <div className="text-muted small mt-1">Awaiting Dept Assignment</div>
            </div>
            <div className="p-3 bg-warning bg-opacity-10 rounded-circle text-warning">
              <Clock size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card teal">
            <div>
              <div className="text-muted small fw-bold">IN REVIEW / ASSIGNED</div>
              <div className="fs-3 fw-bold text-info mt-1">{metrics.assignedComplaints}</div>
              <div className="text-muted small mt-1">With Review Inspectors</div>
            </div>
            <div className="p-3 bg-info bg-opacity-10 rounded-circle text-info">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        <div className="col-md-3 col-6">
          <div className="stat-card success">
            <div>
              <div className="text-muted small fw-bold">SOLVED & VERIFIED</div>
              <div className="fs-3 fw-bold text-success mt-1">{metrics.resolvedComplaints}</div>
              <div className="text-muted small mt-1">Civic work completed</div>
            </div>
            <div className="p-3 bg-success bg-opacity-10 rounded-circle text-success">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Complaints Status Distribution</h6>
            <div style={{ width: '100%', height: 260 }}>
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

        <div className="col-lg-5">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Priority Distribution</h6>
            <div style={{ width: '100%', height: 260 }}>
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
      </div>

      {/* Recent Complaints */}
      <div className="gov-card">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="fw-bold text-dark mb-0">Jurisdictional Complaints Queue</h6>
          <Link to="/admin/complaints" className="small text-primary fw-semibold text-decoration-none">
            Manage All Complaints →
          </Link>
        </div>

        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Citizen</th>
                <th>Title / Category</th>
                <th>Priority</th>
                <th>Status</th>
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
                    <td>{c.citizen?.name || 'Citizen'}</td>
                    <td>
                      <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: '240px' }}>
                        {c.title}
                      </div>
                      <div className="small text-muted">{c.category}</div>
                    </td>
                    <td>
                      <span className={`badge badge-priority-${c.priority}`}>{c.priority}</span>
                    </td>
                    <td>
                      <span className={`badge badge-status badge-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/admin/complaints?id=${c._id}`}
                        className="btn btn-sm btn-outline-primary py-1 px-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        Review / Assign
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No active complaints in your assigned jurisdiction.
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

export default AdminDashboard;

