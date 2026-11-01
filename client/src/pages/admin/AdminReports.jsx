import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, Printer } from 'lucide-react';
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

const AdminReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
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
    fetchReports();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2 text-muted">Compiling Zonal Grievance Report...</div>
      </div>
    );
  }

  const { metrics, charts } = data;

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Zonal Redressal Performance Report</h4>
          <p className="text-muted small mb-0">
            Jurisdictional resolution statistics and priority distribution analytics.
          </p>
        </div>
        <button onClick={handlePrint} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
          <Printer size={16} /> Print Report
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">TOTAL JURISDICTION GRIEVANCES</div>
            <div className="fs-3 fw-bold text-dark mt-1">{metrics.totalComplaints}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">SOLVED CASES</div>
            <div className="fs-3 fw-bold text-success mt-1">{metrics.resolvedComplaints}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">ACTIVE INVESTIGATIONS</div>
            <div className="fs-3 fw-bold text-warning mt-1">{metrics.assignedComplaints}</div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="gov-card p-3">
            <div className="text-muted small fw-bold">FIELD INSPECTORS</div>
            <div className="fs-3 fw-bold text-primary mt-1">{metrics.totalReviewers}</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Status Breakdown</h6>
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

        <div className="col-lg-5">
          <div className="gov-card h-100">
            <h6 className="fw-bold text-dark mb-3">Priority Distribution</h6>
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
      </div>
    </div>
  );
};

export default AdminReports;

