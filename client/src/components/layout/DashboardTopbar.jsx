import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { Menu, Bell, User, LogOut, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardTopbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Non-critical, ignore in background
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="dashboard-topbar">
      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-light d-lg-none p-2 border"
          onClick={onToggleSidebar}
          aria-label="Toggle Menu"
        >
          <Menu size={20} />
        </button>
        <div>
          <h6 className="mb-0 fw-bold text-dark">{t('brandName')}</h6>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            {t('portalTitle')}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        {/* Prominent Bilingual Language Switcher Button */}
        <LanguageSwitcher variant="topbar" />

        {/* Notifications Dropdown */}
        <div className="position-relative">
          <button
            className="btn btn-light position-relative p-2 rounded-circle border"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            aria-label="Notifications"
          >
            <Bell size={18} className="text-secondary" />
            {unreadCount > 0 && (
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: '0.65rem' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div
              className="position-absolute end-0 mt-2 bg-white rounded shadow-lg border p-0"
              style={{ width: '320px', zIndex: 1050 }}
            >
              <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
                <span className="fw-bold small">{t('notifications')} ({unreadCount})</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="btn btn-link p-0 text-primary small text-decoration-none d-flex align-items-center gap-1"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <CheckCheck size={14} /> {t('markAllRead')}
                  </button>
                )}
              </div>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-muted small">{t('noComplaintsFound')}</div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n._id}
                      className={`p-3 border-bottom small ${!n.isRead ? 'bg-light' : ''}`}
                    >
                      <div className="fw-bold text-dark">{n.title}</div>
                      <div className="text-muted mt-1">{n.message}</div>
                      <div className="text-secondary opacity-75 mt-1" style={{ fontSize: '0.7rem' }}>
                        {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
              {user.role === 'CITIZEN' && (
                <div className="p-2 text-center border-top bg-light">
                  <Link
                    to="/citizen/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="small text-primary fw-semibold text-decoration-none"
                  >
                    {t('viewAllNotifications')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="d-flex align-items-center gap-2 ps-2 border-start">
          <div
            className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="d-none d-md-block text-start">
            <div className="fw-bold text-dark small leading-tight">{user.name}</div>
            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
              {t(user.role)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopbar;
