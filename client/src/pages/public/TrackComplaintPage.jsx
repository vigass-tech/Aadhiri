import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

const TrackComplaintPage = () => {
  const [searchParams] = useSearchParams();
  const { t, lang } = useLanguage();
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
        setError(res.data.message || 'Complaint not found.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `No record found for Ticket ID "${idToSearch.toUpperCase()}". Please verify the ID.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialId = searchParams.get('id');
    if (initialId) {
      setTicketId(initialId);
      fetchTracking(initialId);
    }
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchTracking(ticketId);
  };

  return (
    <div className="py-5" style={{ minHeight: '80vh', backgroundColor: 'var(--bg-main)' }}>
      <div className="container py-lg-4" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div className="text-center mb-4">
          <span className="text-primary fw-bold text-uppercase small letter-spacing-1">
            {t('officialPortal')}
          </span>
          <h2 className="fw-bold mt-1" style={{ color: 'var(--primary-navy)' }}>
            {t('trackHeaderTitle')}
          </h2>
          <p className="text-muted">
            {t('trackHeaderSubtitle')}
          </p>
        </div>

        {/* Search Bar Card */}
        <div className="gov-card mb-4 p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <Search size={18} className="text-secondary" />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder={t('enterTicketPrompt')}
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-gov-primary px-4 text-nowrap"
              disabled={loading}
            >
              {loading ? t('submitting') : t('trackNow')}
            </button>
          </form>

          {/* Quick sample chips for examiner testing */}
          <div className="mt-3 d-flex flex-wrap align-items-center gap-2 small text-muted">
            <span>Try sample tickets:</span>
            {['ADH-2026-101001', 'ADH-2026-101002', 'ADH-2026-101003', 'ADH-2026-101004'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => {
                  setTicketId(sample);
                  fetchTracking(sample);
                }}
                className="btn btn-sm btn-outline-secondary py-0 px-2"
                style={{ fontSize: '0.75rem' }}
              >
                {sample}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <AlertCircle size={20} className="flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Complaint Result */}
        {complaint && (
          <div className="gov-card shadow-sm mb-4">
            {/* Top Bar with Ticket ID & Status */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-3 border-bottom mb-4">
              <div>
                <span className="badge bg-dark px-3 py-2 fs-6 fw-bold letter-spacing-1">
                  {complaint.ticketId}
                </span>
                <span className={`badge badge-status badge-${complaint.status} ms-2`}>
                  {complaint.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-muted small">
                Submitted on: {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                {new Date(complaint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {/* Title & Metadata */}
            <h4 className="fw-bold mb-3 text-dark">{complaint.title}</h4>

            <div className="row g-3 mb-4">
              <div className="col-sm-6 col-md-3">
                <div className="p-3 bg-light rounded">
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Tag size={14} /> Category
                  </div>
                  <div className="fw-semibold text-dark mt-1">{complaint.category}</div>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="p-3 bg-light rounded">
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <Building size={14} /> Department
                  </div>
                  <div className="fw-semibold text-dark mt-1">{complaint.department}</div>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="p-3 bg-light rounded">
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <AlertCircle size={14} /> Priority
                  </div>
                  <div className="fw-semibold text-dark mt-1">
                    <span className={`badge badge-priority-${complaint.priority}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 col-md-3">
                <div className="p-3 bg-light rounded">
                  <div className="text-muted small d-flex align-items-center gap-1">
                    <MapPin size={14} /> Location
                  </div>
                  <div className="fw-semibold text-dark mt-1 text-truncate">{complaint.location}</div>
                </div>
              </div>
            </div>

            {/* Resolution Note if available */}
            {complaint.resolutionRemarks && (
              <div className="alert alert-success d-flex align-items-start gap-2 mb-4">
                <CheckCircle2 size={20} className="text-success flex-shrink-0 mt-1" />
                <div>
                  <h6 className="fw-bold mb-1">Official Resolution Remarks</h6>
                  <p className="mb-0 small">{complaint.resolutionRemarks}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <h5 className="fw-bold mb-3 border-bottom pb-2">Status Audit Trail & Timeline</h5>
            <div className="timeline">
              {complaint.timeline && complaint.timeline.length > 0 ? (
                complaint.timeline.map((event, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                      <span className={`badge badge-status badge-${event.newStatus}`}>
                        {event.newStatus.replace('_', ' ')}
                      </span>
                      <span className="text-muted small">
                        {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="mt-2 text-dark small fw-medium">{event.remarks}</div>
                    {event.role && (
                      <div className="text-secondary small mt-1" style={{ fontSize: '0.72rem' }}>
                        Updated by: {event.role.replace('_', ' ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-muted small">No audit transitions recorded yet.</div>
              )}
            </div>

            <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
              <span className="text-muted small">Want to view full complaint attachments or raise another?</span>
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Log In to Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaintPage;

