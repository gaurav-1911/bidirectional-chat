import React, { useState, useEffect } from 'react';
import { UserProfile, GroupProfile, RecentGroup } from '../../types/chat.types';
import { getUserGroupsApi } from '../../services/groupService';
import { resolveMediaUrl } from '../../utils/url.util';
import './ChatsSidebarResponsive.css';

interface GroupsSidebarProps {
  currentUser: UserProfile;
  selectedGroup: GroupProfile | null;
  onSelectGroup: (group: GroupProfile) => void;
  latestMessage: any;
  unreadCounts: Record<string, number>;
  onCreateGroupClick: () => void;
  refreshTrigger?: number;
}

export function GroupsSidebar({
  currentUser,
  selectedGroup,
  onSelectGroup,
  latestMessage,
  unreadCounts,
  onCreateGroupClick,
  refreshTrigger = 0,
}: GroupsSidebarProps) {
  const [groups, setGroups] = useState<RecentGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await getUserGroupsApi(currentUser._id);
      if (res && res.success && Array.isArray(res.data)) {
        setGroups(res.data);
        
        // If current selectedGroup is not in user's valid groups, deselect it
        if (selectedGroup) {
          const stillMember = res.data.some(g => g.group._id === selectedGroup._id);
          if (!stillMember) {
            onSelectGroup(null as any);
          }
        }
      } else {
        setGroups([]);
        if (selectedGroup) {
          onSelectGroup(null as any);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [currentUser._id, refreshTrigger]);

  // Listen to new messages to re-fetch/reorder groups
  useEffect(() => {
    if (latestMessage && latestMessage.groupId) {
      fetchGroups();
    }
  }, [latestMessage]);

  const formatTime = (timeStr?: string | Date) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const filteredGroups = groups.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.group.name.toLowerCase().includes(q) ||
      (item.lastMessage && item.lastMessage.toLowerCase().includes(q))
    );
  });

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Groups</h2>
        <button 
          onClick={onCreateGroupClick}
          className="create-group-btn"
          style={{ 
            width: '34px', 
            height: '34px', 
            borderRadius: '10px', 
            background: 'var(--accent-color, #6366f1)', 
            color: '#ffffff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'pointer',
            border: 'none',
            boxShadow: '0 3px 10px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          title="Create Group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>

      {/* Responsive Search Input */}
      <div className="sidebar-search-form">
        <div className="sidebar-search-wrapper">
          <svg className="sidebar-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="sidebar-search-input"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      <div className="friends-list">
        {loading ? (
          <div className="loading-text">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="no-users-text">
            {searchQuery ? 'No groups found matching your search.' : 'You are not part of any groups yet.'}
          </div>
        ) : (
          filteredGroups.map((item) => {
            const { group, lastMessage, lastMessageTime } = item;
            const unreadCount = unreadCounts[group._id] || 0;
            const isSelected = selectedGroup?._id === group._id;

            return (
              <div
                key={group._id}
                className={`friend-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectGroup(group)}
              >
                <div className="friend-avatar">
                  {group.avatar ? (
                    <img src={resolveMediaUrl(group.avatar)} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    group.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="friend-info" style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="friend-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{group.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatTime(lastMessageTime)}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '8px' }}>
                      {lastMessage || 'No messages yet'}
                    </div>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <div className="unread-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
