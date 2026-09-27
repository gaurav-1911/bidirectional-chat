import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/chat.types';
import { resolveMediaUrl } from '../../utils/url.util';
import './MainNavBarResponsive.css';

export type TabType = 'chats' | 'people' | 'groups' | 'calls' | 'monitoring' | 'settings';

interface MainNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  currentUser: UserProfile;
  unreadCountTotal?: number;
}

export const MainNavBar: React.FC<MainNavBarProps> = ({
  activeTab,
  onTabChange,
  onProfileClick,
  onLogout,
  currentUser,
  unreadCountTotal = 0,
}) => {
  const [avatarError, setAvatarError] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [currentUser.avatar]);

  const handleTabSelect = (tab: TabType) => {
    onTabChange(tab);
    setIsDrawerOpen(false);
  };

  const navItems: Array<{ tab: TabType; label: string; icon: React.ReactNode; badge?: number }> = [
    {
      tab: 'chats',
      label: 'Chats',
      badge: unreadCountTotal > 0 ? unreadCountTotal : undefined,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      ),
    },
    {
      tab: 'people',
      label: 'People',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      ),
    },
    {
      tab: 'groups',
      label: 'Groups',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
    },
    {
      tab: 'calls',
      label: 'Calls',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      ),
    },
    {
      tab: 'monitoring',
      label: 'Monitoring',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M12 7a3 3 0 0 1 3 3"></path>
        </svg>
      ),
    },
    {
      tab: 'settings',
      label: 'Settings',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* 1. Mobile Top Navigation Header (< 768px) */}
      <div className="mobile-top-navbar">
        <button
          type="button"
          className="mobile-menu-trigger-btn"
          onClick={() => setIsDrawerOpen(true)}
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="mobile-top-brand">
          <span className="mobile-brand-icon">💬</span>
          <span className="mobile-brand-title">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
        </div>

        <div
          className="mobile-top-avatar"
          onClick={() => {
            if (onProfileClick) onProfileClick();
            else onTabChange('settings');
          }}
          role="button"
          tabIndex={0}
          title={`Profile (${currentUser.username})`}
        >
          {currentUser.avatar && !avatarError ? (
            <img
              src={resolveMediaUrl(currentUser.avatar)}
              alt={currentUser.username}
              onError={() => setAvatarError(true)}
            />
          ) : (
            <div className="avatar-letter">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* 2. Mobile Left Slide-out Drawer & Backdrop (< 768px) */}
      <div
        className={`mobile-drawer-overlay ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      >
        <div
          className={`mobile-left-drawer ${isDrawerOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mobile-drawer-header">
            <div className="drawer-user-info">
              <div className="drawer-avatar">
                {currentUser.avatar && !avatarError ? (
                  <img
                    src={resolveMediaUrl(currentUser.avatar)}
                    alt={currentUser.username}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="avatar-letter">
                    {currentUser.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="online-indicator" />
              </div>
              <div className="drawer-user-meta">
                <h4>{currentUser.username}</h4>
                <p>{currentUser.email || 'Online'}</p>
              </div>
            </div>
            <button
              type="button"
              className="drawer-close-btn"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="mobile-drawer-nav">
            {navItems.map((item) => (
              <button
                key={item.tab}
                type="button"
                className={`mobile-drawer-item ${activeTab === item.tab ? 'active' : ''}`}
                onClick={() => handleTabSelect(item.tab)}
              >
                <span className="drawer-item-icon">{item.icon}</span>
                <span className="drawer-item-label">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="drawer-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                )}
              </button>
            ))}
          </div>

          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="mobile-drawer-item logout-btn"
              onClick={() => {
                setIsDrawerOpen(false);
                if (onLogout) onLogout();
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Desktop / Tablet Left Side Rail (>= 768px) */}
      <div className="main-nav-bar">
        <div className="nav-top">
          {navItems.map((item) => (
            <button
              key={item.tab}
              className={`nav-item ${activeTab === item.tab ? 'active' : ''}`}
              onClick={() => onTabChange(item.tab)}
              title={item.label}
            >
              {item.icon}
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-item-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </button>
          ))}
        </div>

        <div className="nav-bottom">
          <div
            className={`nav-avatar ${activeTab === 'settings' ? 'active-profile' : ''}`}
            title={`Profile (${currentUser.username})`}
            onClick={() => {
              if (onProfileClick) onProfileClick();
              else onTabChange('settings');
            }}
            role="button"
            tabIndex={0}
          >
            {currentUser.avatar && !avatarError ? (
              <img
                src={resolveMediaUrl(currentUser.avatar)}
                alt={`${currentUser.username}'s profile avatar`}
                width="36"
                height="36"
                loading="lazy"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div className="avatar-placeholder">
                {currentUser.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
