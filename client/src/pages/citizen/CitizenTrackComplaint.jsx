import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { Search, CheckCircle2, Clock, Building, MapPin, Tag, AlertCircle } from 'lucide-react';

const CitizenTrackComplaint = () => {
  const [searchParams] = useSearchParams();
  const [ticketId, setTicketId] = useState(searchParams.get('id') || '');
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (idToSearch) => {
    if (!idToSearch || !idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setComplaint(null);

    try {
      const res = await api.get(`/complaints/track/${idToSearch.trim().toUpperCase()}`);
      if (res.data.success) {
        setComplaint(res.data.complaint);
      } else {
        setError('Complaint not found.');
      }
    } catch (err) {
      setError(err.response?.data?.message || `No complaint record found for Ticket "${idToSearch.toUpperCase()}".`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTicketId(id);
      fetchTracking(id);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(ticketId);
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Track Grievance Redressal Live</h4>
        <p className="text-muted small mb-0">
          Enter any municipal Ticket ID to verify inspection findings and on-ground repair status.
        </p>
      </div>

      <div className="gov-card p-4 mb-4">
        <form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-2">
          <div className="input-group">
            <span className="input-group-text bg-light border-end-0">
              <Search size={18} className="text-secondary" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Enter Ticket ID (e.g. ADH-2026-101001)"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-gov-primary px-4 text-nowrap" disabled={loading}>
            {loading ? 'Searching...' : 'Track Status'}
          </button>
        </form>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {complaint && (
        <div className="gov-card p-4">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-4">
            <div>
              <span className="badge bg-dark font-monospace fs-6">{complaint.ticketId}</span>
              <span className={`badge badge-status badge-${complaint.status} ms-2`}>
                {complaint.status.replace('_', ' ')}
              </span>
            </div>
            <div className="text-muted small">
              Filed: {new Date(complaint.createdAt).toLocaleDateString()}
            </div>
          </div>

          <h5 className="fw-bold text-dark mb-3">{complaint.title}</h5>

          <div className="row g-3 mb-4">
            <div className="col-sm-6">
              <div className="p-3 bg-light rounded">
                <div className="small text-muted fw-bold">DEPARTMENT</div>
                <div className="fw-semibold text-dark mt-1">{complaint.department}</div>
              </div>
            </div>
            <div className="col-sm-6">
              <div className="p-3 bg-light rounded">
                <div className="small text-muted fw-bold">LOCALITY / AREA</div>
                <div className="fw-semibold text-dark mt-1">{complaint.location}</div>
              </div>
            </div>
          </div>

          {complaint.resolutionRemarks && (
            <div className="alert alert-success d-flex align-items-start gap-2 mb-4">
              <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-1" />
              <div>
                <h6 className="fw-bold mb-1">Official Resolution Report</h6>
                <p className="mb-0 small">{complaint.resolutionRemarks}</p>
              </div>
            </div>
          )}

          <h6 className="fw-bold mb-3 border-bottom pb-2">Status Audit Trail & Timeline</h6>
          <div className="timeline">
            {complaint.timeline?.map((event, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`badge badge-status badge-${event.newStatus}`}>
                    {event.newStatus.replace('_', ' ')}
                  </span>
                  <span className="small text-muted">{new Date(event.timestamp).toLocaleDateString()}</span>
                </div>
                <div className="small text-dark mt-1 fw-medium">{event.remarks}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenTrackComplaint;

