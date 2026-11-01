import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Search, Users, FileText, Phone, Mail } from 'lucide-react';

const AdminDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get(`/departments?search=${search}`);
        if (res.data.success) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepts();
  }, [search]);

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Municipal Department Directories</h4>
        <p className="text-muted small mb-0">
          Portfolio mandates, contact channels, and complaint resolution performance by department.
        </p>
      </div>

      <div className="gov-card p-3 mb-4">
        <div className="input-group" style={{ maxWidth: '380px' }}>
          <span className="input-group-text bg-light border-end-0">
            <Search size={16} className="text-muted" />
          </span>
          <input
            type="text"
            className="form-control border-start-0"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="row g-4">
        {departments.map((d) => (
          <div key={d._id} className="col-lg-6">
            <div className="gov-card h-100 p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <span className="badge bg-primary fs-6 px-3 py-1 font-monospace">{d.code}</span>
                <span className={`badge ${d.isActive ? 'bg-success' : 'bg-secondary'}`}>
                  {d.isActive ? 'ACTIVE JURISDICTION' : 'INACTIVE'}
                </span>
              </div>

              <h5 className="fw-bold text-dark mb-1">{d.name}</h5>
              <p className="text-muted small mb-3">{d.description}</p>

              <div className="p-3 bg-light rounded mb-3 small">
                <div className="fw-semibold text-dark">In-charge: {d.head || 'Officer not listed'}</div>
                <div className="text-muted mt-1 d-flex align-items-center gap-1">
                  <Mail size={14} /> {d.email || 'N/A'}
                </div>
                <div className="text-muted mt-1 d-flex align-items-center gap-1">
                  <Phone size={14} /> {d.phone || 'N/A'}
                </div>
              </div>

              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>COMPLAINTS</div>
                    <div className="fw-bold text-primary">{d.stats?.totalComplaints || 0}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>RESOLVED</div>
                    <div className="fw-bold text-success">{d.stats?.resolvedComplaints || 0}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border rounded">
                    <div className="text-muted small" style={{ fontSize: '0.7rem' }}>STAFF</div>
                    <div className="fw-bold text-secondary">{d.stats?.staffCount || 0}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDepartments;

