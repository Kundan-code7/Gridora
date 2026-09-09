import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Bell, 
  PlusCircle, 
  Clock,
  MapPin,
  ChevronDown,
  Search,
  X,
  Navigation
} from 'lucide-react';

export function Header({ 
  currentRole, 
  onToggleRole, 
  activeRequests, 
  onOpenCreateListing,
  onOpenTracker,
  activeNotificationCount,
  selectedZone,
  onChangeZone,
  zones = []
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const locationRef = useRef(null);

  const pendingHoldsCount = activeRequests.filter(r => r.status === 'HOLD_PENDING').length;

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setShowLocationPicker(false);
        setLocationSearch('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredZones = zones.filter(z =>
    z.label.toLowerCase().includes(locationSearch.toLowerCase()) ||
    z.sub.toLowerCase().includes(locationSearch.toLowerCase())
  );

  const handleSelectZone = (zone) => {
    onChangeZone(zone);
    setShowLocationPicker(false);
    setLocationSearch('');
  };

  return (
    <header className="site-header">
      <div className="header-content">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon-box">
            <Building2 size={20} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <span className="brand-title" title="Hospitality Resource Exchange">HRE Platform</span>
            <span className="brand-subtitle">B2B Capacity &amp; Equipment Network</span>
          </div>
        </div>

        {/* Clickable Location Picker */}
        <div ref={locationRef} style={{ position: 'relative' }}>
          <button
            className="header-quick-context"
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            title="Click to change your location zone"
          >
            <span className="context-pill">
              <MapPin size={13} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px', color: 'var(--brand-red)' }} />
              {selectedZone?.label || 'Select Zone'}
            </span>
            <ChevronDown 
              size={13} 
              style={{ 
                color: 'var(--text-muted)',
                transition: 'transform 0.2s ease',
                transform: showLocationPicker ? 'rotate(180deg)' : 'rotate(0deg)',
                flexShrink: 0
              }} 
            />
            <span className="context-divider"></span>
            <span className="context-pill" style={{ color: '#047857' }}>
              ● Live
            </span>
          </button>

          {/* Location Dropdown */}
          {showLocationPicker && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '300px',
              background: '#fff',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-medium)',
              zIndex: 1200,
              overflow: 'hidden',
              animation: 'popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              {/* Dropdown Header */}
              <div style={{
                padding: '0.85rem 1rem 0.6rem 1rem',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    Select Your Zone
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    Map & resources update instantly
                  </div>
                </div>
                <button
                  onClick={() => { setShowLocationPicker(false); setLocationSearch(''); }}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Search Box */}
              <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.35rem 0.65rem'
                }}>
                  <Search size={13} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search zone or area..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      fontSize: '0.8125rem',
                      color: 'var(--text-primary)',
                      width: '100%',
                      fontFamily: 'var(--font-sans)'
                    }}
                  />
                </div>
              </div>

              {/* Zone List */}
              <div style={{ maxHeight: '260px', overflowY: 'auto', padding: '0.35rem 0' }}>
                {filteredZones.length === 0 ? (
                  <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No zones found
                  </div>
                ) : (
                  filteredZones.map(zone => {
                    const isSelected = selectedZone?.id === zone.id;
                    return (
                      <button
                        key={zone.id}
                        onClick={() => handleSelectZone(zone)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.65rem',
                          padding: '0.65rem 1rem',
                          border: 'none',
                          background: isSelected ? 'var(--brand-red-subtle)' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.12s ease'
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-subtle)'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                      >
                        <MapPin 
                          size={14} 
                          style={{ 
                            flexShrink: 0, 
                            marginTop: '2px',
                            color: isSelected ? 'var(--brand-red)' : 'var(--text-muted)' 
                          }} 
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ 
                            fontWeight: isSelected ? 700 : 600, 
                            fontSize: '0.8125rem', 
                            color: isSelected ? 'var(--brand-red)' : 'var(--text-primary)'
                          }}>
                            {zone.label}
                            {isSelected && (
                              <span style={{ 
                                marginLeft: '6px', 
                                fontSize: '0.65rem', 
                                background: 'var(--brand-red)', 
                                color: '#fff', 
                                padding: '1px 5px', 
                                borderRadius: '3px',
                                fontWeight: 700,
                                verticalAlign: 'middle'
                              }}>Active</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {zone.sub}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Use My Location Footer */}
              <div style={{ 
                padding: '0.6rem 1rem',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface-subtle)'
              }}>
                <button
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          // Find closest zone by distance
                          const { latitude, longitude } = pos.coords;
                          let closest = zones[0];
                          let minDist = Infinity;
                          zones.forEach(z => {
                            const d = Math.sqrt(Math.pow(z.lat - latitude, 2) + Math.pow(z.lng - longitude, 2));
                            if (d < minDist) { minDist = d; closest = z; }
                          });
                          handleSelectZone(closest);
                        },
                        () => handleSelectZone(zones[0])
                      );
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--brand-red)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    fontFamily: 'var(--font-sans)',
                    padding: 0
                  }}
                >
                  <Navigation size={13} />
                  Use my current location
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="header-actions">
          {/* Role Switcher */}
          <div className="role-toggle-group">
            <button 
              className={`role-toggle-btn ${currentRole === 'seeker' ? 'active' : ''}`}
              onClick={() => onToggleRole('seeker')}
            >
              Seeker
            </button>
            <button 
              className={`role-toggle-btn ${currentRole === 'provider' ? 'active provider-active' : ''}`}
              onClick={() => onToggleRole('provider')}
            >
              Provider
            </button>
          </div>

          {/* Provider: List Resource button */}
          {currentRole === 'provider' && (
            <button 
              className="btn-primary-red" 
              style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
              onClick={onOpenCreateListing}
            >
              <PlusCircle size={15} />
              <span>List Resource</span>
            </button>
          )}

          {/* Orders — only visible to providers */}
          {currentRole === 'provider' && (
            <button 
              className="filter-pill-btn" 
              onClick={onOpenTracker}
              title="View incoming orders & booking holds"
            >
              <Clock size={14} />
              <span>Orders</span>
              {pendingHoldsCount > 0 && (
                <span className="badge-count-pill">
                  {pendingHoldsCount}
                </span>
              )}
            </button>
          )}

          {/* Notifications Popover */}
          <div style={{ position: 'relative' }}>
            <button 
              className="header-icon-btn" 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications &amp; Holds"
            >
              <Bell size={17} />
              {activeNotificationCount > 0 && <span className="notification-dot"></span>}
            </button>

            {showNotifications && (
              <div className="notifications-popover">
                <div className="notifications-popover-header">
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Active Notifications</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activeRequests.length} events</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '280px', overflowY: 'auto' }}>
                  {activeRequests.slice(0, 4).map(req => (
                    <div 
                      key={req.id} 
                      onClick={() => { setShowNotifications(false); onOpenTracker(); }}
                      style={{ 
                        padding: '0.65rem 0.75rem', 
                        borderRadius: 'var(--radius-sm)', 
                        background: req.status === 'HOLD_PENDING' ? 'var(--badge-hold-bg)' : 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                        <span>{req.status === 'HOLD_PENDING' ? '⏳ 15m Soft Lock Active' : req.status}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{req.resourceTitle}</div>
                    </div>
                  ))}
                  {activeRequests.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.25rem', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                      No active hold notifications
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Business Profile Trust Badge */}
          <div className="verified-business-badge" title="The Grand Heritage · GST Verified">
            <ShieldCheck size={15} />
            <span>GST Verified</span>
          </div>
        </div>
      </div>
    </header>
  );
}
