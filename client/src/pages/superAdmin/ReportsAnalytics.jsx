import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  Printer
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

const ReportsAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/dashboard/super-admin');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Compiling Statewide Analytics Report...</div>
      </div>
    );
  }

  const { metrics, charts } = data;
  const resolutionPercentage =
    metrics.totalComplaints > 0
      ? Math.round((metrics.resolvedComplaints / metrics.totalComplaints) * 100)
      : 100;

  return (
    <div className="reports-page">
      {/* Top Bar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Statewide Civic Redressal Analytics & Reports</h4>
          <p className="text-muted small mb-0">
            Performance audits, resolution turnaround efficiencies, and jurisdictional benchmarking.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button onClick={handlePrint} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">OVERALL RESOLUTION RATE</div>
            <div className="fs-3 fw-bold text-success mt-1">{resolutionPercentage}%</div>
            <div className="small text-muted">{metrics.resolvedComplaints} of {metrics.totalComplaints} Solved</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">AVG. RESOLUTION WINDOW</div>
            <div className="fs-3 fw-bold text-primary mt-1">48 - 72 Hrs</div>
            <div className="small text-muted">Across All 6 Departments</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">FIELD INSPECTIONS LOGGED</div>
            <div className="fs-3 fw-bold text-warning mt-1">{metrics.inReviewComplaints + metrics.resolvedComplaints}</div>
            <div className="small text-muted">On-ground verifications</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">REJECTION RATE</div>
            <div className="fs-3 fw-bold text-danger mt-1">
              {metrics.totalComplaints > 0
                ? Math.round((metrics.rejectedComplaints / metrics.totalComplaints) * 100)
                : 0}%
            </div>
            <div className="small text-muted">Filtered out invalid claims</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="row g-4 mb-4">
        {/* Monthly Trend */}
        <div className="col-lg-8">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Monthly Grievance Inflow vs. Resolution Trend</h6>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={charts.monthlyTrends}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="complaints" name="Complaints Filed" stroke="#0ea5e9" strokeWidth={3} />
                  <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Pie */}
        <div className="col-lg-4">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Severity & Priority Distribution</h6>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={charts.priorityBreakdown}
                    dataKey="count"
                    nameKey="priority"
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
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

        {/* Department Comparison Table */}
        <div className="col-12">
          <div className="gov-card">
            <h6 className="fw-bold text-dark mb-3">Departmental Redressal Efficiency Matrix</h6>
            <div className="gov-table-container">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Department Portfolio</th>
                    <th>Total Received</th>
                    <th>Successfully Resolved</th>
                    <th>Pending Action</th>
                    <th>Efficiency Index</th>
                  </tr>
                </thead>
                <tbody>
                  {charts.departmentPerformance.map((dept, idx) => {
                    const resolved = dept.resolved || 0;
                    const total = dept.count || 0;
                    const pending = total - resolved;
                    const eff = total > 0 ? Math.round((resolved / total) * 100) : 100;
                    return (
                      <tr key={idx}>
                        <td className="fw-bold text-dark">{dept.name}</td>
                        <td>{total}</td>
                        <td className="text-success fw-bold">{resolved}</td>
                        <td className="text-warning fw-bold">{pending}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="progress flex-grow-1" style={{ height: '8px', minWidth: '80px' }}>
                              <div
                                className={`progress-bar ${eff >= 80 ? 'bg-success' : eff >= 50 ? 'bg-warning' : 'bg-danger'}`}
                                style={{ width: `${eff}%` }}
                              ></div>
                            </div>
                            <span className="small fw-bold">{eff}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;

