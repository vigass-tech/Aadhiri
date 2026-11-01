import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Eye, Mail, Phone, MapPin } from 'lucide-react';

const AdminCitizens = () => {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      let url = `/users?role=CITIZEN&search=${search}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.data.success) {
        setCitizens(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [search, statusFilter]);

  const handleViewHistory = async (c) => {
    try {
      const res = await api.get(`/users/${c._id}`);
      if (res.data.success) {
        setSelectedCitizen(res.data.user);
        setComplaints(res.data.complaints || []);
        setShowModal(true);
      }
    } catch (err) {
      alert('Could not fetch citizen history.');
    }
  };

  const handleToggleStatus = async (c) => {
    try {
      await api.patch(`/users/${c._id}/status`);
      fetchCitizens();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Citizen Roster & Grievance History</h4>
        <p className="text-muted small mb-0">
          Supervise registered citizens within municipal wards and inspect past grievance filing records.
        </p>
      </div>

      <div className="gov-card p-3 mb-4">
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <div className="input-group" style={{ maxWidth: '380px' }}>
            <span className="input-group-text bg-light border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search citizens by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="gov-select"
            style={{ width: '180px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Suspended Only</option>
          </select>
        </div>
      </div>

      <div className="gov-card">
        <div className="gov-table-container">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Citizen Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Registered Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {citizens.length > 0 ? (
                citizens.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="fw-bold text-dark">{c.name}</div>
                    </td>
                    <td>{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <div className="small text-muted text-truncate" style={{ maxWidth: '220px' }}>
                        {c.address || 'Address on record not supplied'}
                      </div>
                    </td>
                    <td className="small text-muted">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`badge border-0 ${c.isActive ? 'bg-success' : 'bg-secondary'}`}
                        style={{ cursor: 'pointer' }}
                      >
                        {c.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => handleViewHistory(c)}
                        className="btn btn-sm btn-outline-info py-1 px-2"
                        title="View Complaint History"
                      >
                        <Eye size={14} /> History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No citizens found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedCitizen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Citizen Details & Grievance History</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="p-3 bg-light rounded mb-4">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <div className="fw-bold fs-6 text-dark">{selectedCitizen.name}</div>
                      <div className="small text-muted mt-1"><Mail size={14} /> {selectedCitizen.email}</div>
                      <div className="small text-muted mt-1"><Phone size={14} /> {selectedCitizen.phone}</div>
                    </div>
                    <div className="col-md-6">
                      <div className="small text-muted"><MapPin size={14} /> {selectedCitizen.address || 'No address'}</div>
                      <div className="mt-2">
                        <span className={`badge ${selectedCitizen.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {selectedCitizen.isActive ? 'Active Citizen' : 'Account Suspended'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-3">Submitted Grievances ({complaints.length})</h6>
                {complaints.length > 0 ? (
                  <div className="gov-table-container">
                    <table className="gov-table">
                      <thead>
                        <tr>
                          <th>Ticket ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.map((comp) => (
                          <tr key={comp._id}>
                            <td className="fw-bold text-primary font-monospace">{comp.ticketId}</td>
                            <td>{comp.title}</td>
                            <td>{comp.category}</td>
                            <td>
                              <span className={`badge badge-status badge-${comp.status}`}>
                                {comp.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="small text-muted">
                              {new Date(comp.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted small bg-light rounded">
                    No complaints registered by this citizen.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCitizens;

