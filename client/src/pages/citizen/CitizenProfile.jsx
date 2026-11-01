import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Mail, Phone, MapPin, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

const CitizenProfile = () => {
  const { user, updateCurrentUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setLoadingProfile(true);

    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        updateCurrentUser(res.data.user);
        setProfileSuccess('Your citizen details were updated successfully.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update details.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must contain at least 6 characters.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        setPasswordSuccess('Password changed successfully.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Citizen Profile & Settings</h4>
        <p className="text-muted small mb-0">
          Update contact phone, delivery address for notifications, and security credentials.
        </p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-12">
          <div className="gov-card">
            <h5 className="fw-bold text-dark mb-3">Personal Details</h5>

            {profileSuccess && (
              <div className="alert alert-success small py-2 d-flex align-items-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="gov-label">Full Name</label>
                  <input
                    type="text"
                    className="gov-input"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="gov-label">Email Address (Locked)</label>
                  <input type="email" className="gov-input bg-light" disabled value={user?.email || ''} />
                </div>
                <div className="col-md-6">
                  <label className="gov-label">Phone Number</label>
                  <input
                    type="tel"
                    className="gov-input"
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="gov-label">Account Role</label>
                  <input type="text" className="gov-input bg-light" disabled value="CITIZEN" />
                </div>
                <div className="col-12">
                  <label className="gov-label">Residential Ward / Locality Address</label>
                  <input
                    type="text"
                    className="gov-input"
                    placeholder="14/2, 3rd Cross Street, T. Nagar"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-gov-primary btn-sm px-3" disabled={loadingProfile}>
                    {loadingProfile ? 'Saving...' : 'Save Profile Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="col-12">
          <div className="gov-card">
            <h5 className="fw-bold text-dark mb-3">Change Account Password</h5>

            {passwordSuccess && (
              <div className="alert alert-success small py-2 d-flex align-items-center gap-2 mb-3">
                <CheckCircle2 size={16} />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="alert alert-danger small py-2 d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit}>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="gov-label">Current Password</label>
                  <input
                    type="password"
                    className="gov-input"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="gov-label">New Password</label>
                  <input
                    type="password"
                    className="gov-input"
                    required
                    placeholder="Min 6 characters"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="col-md-4">
                  <label className="gov-label">Confirm New Password</label>
                  <input
                    type="password"
                    className="gov-input"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-warning btn-sm px-3" disabled={loadingPassword}>
                    {loadingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;

