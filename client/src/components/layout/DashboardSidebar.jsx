import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Logo from '../common/Logo';
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  ClipboardList,
  Users,
  FileCheck2,
  DollarSign,
  BarChart3,
  User,
  LogOut,
  PlusCircle,
  Search,
  HelpCircle,
  Bell,
  History,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

const DashboardSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (!user) return null;

  // Build menu links according to role specifications
  const getNavItems = () => {
    switch (user.role) {
      case 'SUPER_ADMIN':
        return [
          { label: t('dashboard'), path: '/super-admin/dashboard', icon: LayoutDashboard },
          { label: t('departments'), path: '/super-admin/departments', icon: Building2 },
          { label: t('admins'), path: '/super-admin/admins', icon: ShieldAlert },
          { label: t('reviewers'), path: '/super-admin/reviewers', icon: UserCheck },
          { label: t('citizens'), path: '/super-admin/citizens', icon: Users },
          { label: t('allComplaints'), path: '/super-admin/complaints', icon: ClipboardList },
          { label: t('budgets'), path: '/super-admin/budgets', icon: DollarSign },
          { label: t('reports'), path: '/super-admin/reports', icon: BarChart3 },
          { label: t('profile'), path: '/super-admin/profile', icon: User }
        ];

      case 'ADMIN':
        return [
          { label: t('dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
          { label: t('reviewers'), path: '/admin/reviewers', icon: UserCheck },
          { label: t('citizens'), path: '/admin/citizens', icon: Users },
          { label: t('allComplaints'), path: '/admin/complaints', icon: ClipboardList },
          { label: t('departments'), path: '/admin/departments', icon: Building2 },
          { label: t('budgets'), path: '/admin/budgets', icon: DollarSign },
          { label: t('reports'), path: '/admin/reports', icon: BarChart3 },
          { label: t('profile'), path: '/admin/profile', icon: User }
        ];

      case 'REVIEWER':
        return [
          { label: t('dashboard'), path: '/reviewer/dashboard', icon: LayoutDashboard },
          { label: t('assignedComplaints'), path: '/reviewer/assigned-complaints', icon: FileCheck2 },
          { label: t('reviewHistory'), path: '/reviewer/history', icon: History },
          { label: t('profile'), path: '/reviewer/profile', icon: User }
        ];

      case 'CITIZEN':
      default:
        return [
          { label: t('dashboard'), path: '/citizen/dashboard', icon: LayoutDashboard },
          { label: t('raiseComplaint'), path: '/citizen/raise-complaint', icon: PlusCircle },
          { label: t('myComplaints'), path: '/citizen/my-complaints', icon: ClipboardList },
          { label: t('trackComplaint'), path: '/citizen/track-complaint', icon: Search },
          { label: t('support'), path: '/citizen/support', icon: HelpCircle },
          { label: t('notifications'), path: '/citizen/notifications', icon: Bell },
          { label: t('profile'), path: '/citizen/profile', icon: User }
        ];
    }
  };

  const navItems = getNavItems();

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-brand">
        <Logo size={36} light={true} />
      </div>

      {/* Role Badge in Sidebar */}
      <div className="px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="d-flex align-items-center justify-content-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="text-truncate">
            <div className="text-white fw-bold small text-truncate">{user.name}</div>
            <div className="text-info text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
              {t(user.role)}
            </div>
          </div>
          <span className="badge bg-primary" style={{ fontSize: '0.65rem' }}>ACTIVE</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="flex-grow-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-50" />
            </NavLink>
          );
        })}
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-top" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 btn-sm py-2"
          style={{ borderRadius: '6px' }}
        >
          <LogOut size={16} />
          {t('signOut')}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
