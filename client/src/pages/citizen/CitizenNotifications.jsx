import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Bell, CheckCheck, CheckCircle2, Clock, FileText } from 'lucide-react';

const CitizenNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '840px' }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Grievance Notification Center</h4>
          <p className="text-muted small mb-0">
            Real-time status alerts, inspector review notifications, and resolution announcements.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <CheckCheck size={16} /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      <div className="gov-card">
        {loading ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm text-primary mb-2" role="status"></div>
            <div>Loading notifications...</div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-3 rounded border transition ${
                  !n.isRead ? 'bg-light border-primary' : 'bg-white'
                }`}
              >
                <div className="d-flex align-items-start justify-content-between gap-2">
                  <div className="d-flex gap-3">
                    <div className="p-2 rounded bg-primary bg-opacity-10 text-primary mt-1">
                      <Bell size={18} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-1">{n.title}</h6>
                      <p className="text-muted small mb-1">{n.message}</p>
                      <div className="d-flex align-items-center gap-3 small text-secondary">
                        <span>
                          {new Date(n.createdAt).toLocaleDateString()} at{' '}
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {n.relatedComplaint && (
                          <Link
                            to={`/citizen/track-complaint?id=${n.relatedComplaint.ticketId}`}
                            className="text-primary fw-semibold text-decoration-none"
                          >
                            Track Ticket {n.relatedComplaint.ticketId} →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(n._id)}
                      className="btn btn-link p-0 text-muted small text-decoration-none text-nowrap"
                      style={{ fontSize: '0.75rem' }}
                    >
                      Mark read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            <Bell size={36} className="opacity-25 mb-2" />
            <h6>No Notifications Yet</h6>
            <p className="small">You will receive live alerts when your grievances are reviewed or resolved.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CitizenNotifications;

