import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import API from '../../services/api.js';
import toast from 'react-hot-toast';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, login } = useAuth();
  const { theme, toggle } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingName(true);
    try {
      const res = await API.put('/user/profile', { name });
      const token = localStorage.getItem('token');
      login(token, res.data.data.user);
      toast.success('Name updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally { setSavingName(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword)
      return toast.error('New passwords do not match');
    if (passwords.newPassword.length < 6)
      return toast.error('Password must be at least 6 characters');
    setSavingPwd(true);
    try {
      await API.put('/user/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSavingPwd(false); }
  };

  const toggleShow = (field) => setShowPasswords(p => ({ ...p, [field]: !p[field] }));

  return (
    <div className="page-container page-enter">
      <div className="profile-header">
        <div className="profile-avatar-lg">
          <div className="avatar-ring">
            <div className="avatar-inner">{initials}</div>
          </div>
          <div className="avatar-glow" />
        </div>
        <div className="profile-info">
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          <span className="badge badge-primary">Active Member</span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Update Name */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <div className="card-icon">👤</div>
            <div>
              <h3>Personal Info</h3>
              <p>Update your display name</p>
            </div>
          </div>
          <form onSubmit={handleUpdateName} className="profile-form">
            <div className="form-group">
              <label>Full Name</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input value={user?.email} disabled className="input-disabled" />
              <span className="input-hint">Email cannot be changed</span>
            </div>
            <button className="btn btn-primary" type="submit" disabled={savingName}>
              {savingName ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <div className="card-icon">🔐</div>
            <div>
              <h3>Change Password</h3>
              <p>Keep your account secure</p>
            </div>
          </div>
          <form onSubmit={handleChangePassword} className="profile-form">
            {[
              { key: 'current', label: 'Current Password', field: 'currentPassword' },
              { key: 'new', label: 'New Password', field: 'newPassword' },
              { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
            ].map(({ key, label, field }) => (
              <div className="form-group" key={field}>
                <label>{label}</label>
                <div className="input-wrapper">
                  <input
                    type={showPasswords[key] ? 'text' : 'password'}
                    value={passwords[field]}
                    onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button type="button" className="eye-btn" onClick={() => toggleShow(key)}>
                    {showPasswords[key] ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" type="submit" disabled={savingPwd}>
              {savingPwd ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Theme Toggle */}
        <div className="card profile-card theme-card">
          <div className="profile-card-header">
            <div className="card-icon">{theme === 'dark' ? '🌙' : '☀️'}</div>
            <div>
              <h3>Appearance</h3>
              <p>Switch between dark and light mode</p>
            </div>
          </div>
          <div className="theme-toggle-section">
            <div className="theme-options">
              <button
                className={`theme-option ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => theme !== 'dark' && toggle()}
              >
                <div className="theme-preview dark-preview">
                  <div className="preview-bar" /><div className="preview-card" />
                </div>
                <span>Dark Mode</span>
                {theme === 'dark' && <span className="check">✓</span>}
              </button>
              <button
                className={`theme-option ${theme === 'light' ? 'active' : ''}`}
                onClick={() => theme !== 'light' && toggle()}
              >
                <div className="theme-preview light-preview">
                  <div className="preview-bar" /><div className="preview-card" />
                </div>
                <span>Light Mode</span>
                {theme === 'light' && <span className="check">✓</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="card profile-card">
          <div className="profile-card-header">
            <div className="card-icon">ℹ️</div>
            <div>
              <h3>Account Info</h3>
              <p>Your account details</p>
            </div>
          </div>
          <div className="info-rows">
            <div className="info-row">
              <span className="info-label">User ID</span>
              <span className="info-value mono">{user?.id?.slice(-8)?.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Account Status</span>
              <span className="badge badge-success">Active</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
