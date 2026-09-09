import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  X, 
  MessageSquare, 
  Clock, 
  Flame, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  DollarSign, 
  PlusCircle, 
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2
} from 'lucide-react';
import { bookingEngineInstance } from '../services/bookingEngine';
import { GeminiService } from '../services/geminiService';

export function ProviderDashboard({ 
  listings, 
  requests, 
  onOpenCreateListing,
  onOpenTracker 
}) {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'calendar'
  const [selectedRequestForCounter, setSelectedRequestForCounter] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterNote, setCounterNote] = useState('');
  const [expandedThreadId, setExpandedThreadId] = useState(null);
  const [isDraftingAI, setIsDraftingAI] = useState(false);

  // Compute metrics
  const activeHoldsCount = requests.filter(r => r.status === 'HOLD_PENDING').length;
  const confirmedCount = requests.filter(r => r.status === 'CONFIRMED').length;
  const totalRevenue = requests
    .filter(r => r.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + (curr.totalAmount || 0), 45000); // base + confirmed

  const handleAccept = (reqId) => {
    bookingEngineInstance.acceptHold(reqId);
  };

  const handleReject = (reqId) => {
    const reason = prompt('Reason for declining this request (will release capacity back to pool):', 'Resource undergoing maintenance');
    if (reason !== null) {
      bookingEngineInstance.rejectHold(reqId, reason);
    }
  };

  const handleOpenCounter = (req) => {
    setSelectedRequestForCounter(req);
    setCounterPrice(req.unitPrice);
    setCounterQty(req.requestedQty);
    setCounterNote('We can accommodate this capacity with customized setup time.');
  };

  const handleDraftWithAI = async () => {
    if (!selectedRequestForCounter) return;
    setIsDraftingAI(true);
    const draftedText = await GeminiService.draftCounterOffer({
      seekerName: selectedRequestForCounter.seekerName,
      resourceTitle: selectedRequestForCounter.resourceTitle,
      requestedQty: counterQty || selectedRequestForCounter.requestedQty,
      requestedPrice: selectedRequestForCounter.unitPrice,
      counterPrice: counterPrice || selectedRequestForCounter.unitPrice,
      reason: 'Peak period shift adjustment with expedited setup'
    });
    setCounterNote(draftedText);
    setIsDraftingAI(false);
  };

  const handleSubmitCounter = (e) => {
    e.preventDefault();
    if (!selectedRequestForCounter) return;

    bookingEngineInstance.counterOffer(selectedRequestForCounter.id, {
      newPrice: counterPrice,
      newQty: counterQty,
      counterNote
    });

    setSelectedRequestForCounter(null);
  };

  return (
    <div className="provider-dashboard-view">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              background: '#0f172a', 
              color: '#fff', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}>
              PROVIDER PORTAL
            </span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Logged in as: The Grand Heritage Hospitality Group
            </span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '0.25rem' }}>
            Capacity Management & Request Inbox
          </h1>
        </div>

        <button 
          className="btn-primary-red"
          style={{ width: 'auto', padding: '0.65rem 1.25rem' }}
          onClick={onOpenCreateListing}
        >
          <PlusCircle size={18} />
          <span>List Spare Resource</span>
        </button>
      </div>

      {/* KPI Metrics Summary */}
      <div className="dashboard-metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Active Listed Assets</span>
          <span className="metric-val">{listings.length}</span>
          <span className="metric-trend">Across 6 categories in Mumbai</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Live Capacity Utilization</span>
          <span className="metric-val">76.4%</span>
          <span className="metric-trend">↑ 12% vs last week</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Exchanged Value</span>
          <span className="metric-val">₹{totalRevenue.toLocaleString()}</span>
          <span className="metric-trend">{confirmedCount} confirmed bookings</span>
        </div>
        <div className="metric-card" style={{ borderColor: activeHoldsCount > 0 ? 'var(--badge-hold-border)' : 'var(--border-subtle)' }}>
          <span className="metric-label">Pending 15-Min Holds</span>
          <span className="metric-val" style={{ color: activeHoldsCount > 0 ? '#b45309' : 'inherit' }}>
            {activeHoldsCount}
          </span>
          <span className="metric-trend" style={{ color: activeHoldsCount > 0 ? '#b45309' : '#10b981' }}>
            {activeHoldsCount > 0 ? 'Action required before TTL expiry' : 'All requests up to date'}
          </span>
        </div>
      </div>

      {/* Main Grid: Inbox (Left) & Unified Calendar (Right) */}
      <div className="provider-sections-grid">
        {/* Left Section: Incoming Requests List */}
        <div className="provider-section-card">
          <div className="section-card-title">
            <span>Incoming Capacity Requests & Quote Threads</span>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {requests.length} active
            </span>
          </div>

          <div className="requests-list">
            {requests.map(req => {
              const isPending = req.status === 'HOLD_PENDING';
              const isConfirmed = req.status === 'CONFIRMED';
              const isRejected = req.status === 'REJECTED';
              const isCountered = req.status === 'COUNTER_OFFERED';
              const isThreadOpen = expandedThreadId === req.id;

              return (
                <div key={req.id} className="request-item-card">
                  {/* Top Line */}
                  <div className="request-card-header">
                    <div>
                      <div className="seeker-business-name">{req.seekerName}</div>
                      <div className="request-resource-title">{req.resourceTitle}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '2px 9px',
                        borderRadius: 'var(--radius-full)',
                        background: isPending ? 'var(--badge-hold-bg)' : isConfirmed ? '#dcfce7' : isCountered ? '#fef3c7' : '#fee2e2',
                        color: isPending ? 'var(--badge-hold-text)' : isConfirmed ? '#15803d' : isCountered ? '#b45309' : '#b91c1c'
                      }}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Slot Details & Meta */}
                  <div className="request-meta-row">
                    <span>📅 <strong>{req.slotDate}</strong> ({req.slotTime})</span>
                    <span>📦 <strong>{req.requestedQty} units</strong></span>
                    <span>💰 <strong>₹{req.totalAmount.toLocaleString()}</strong> (@ ₹{req.unitPrice}/u)</span>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--bg-surface-subtle)', padding: '0.5rem', borderRadius: '4px' }}>
                      "{req.notes}"
                    </div>
                  )}

                  {/* Live TTL Soft Lock Reminder */}
                  {isPending && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: '#b45309',
                      fontWeight: 600
                    }}>
                      <Clock size={13} />
                      <span>15-Minute Soft Lock: Auto-releases if no action taken within TTL window.</span>
                    </div>
                  )}

                  {/* Actions Row (Accept / Reject / Counter-Offer) */}
                  {isPending && (
                    <div className="request-actions-row">
                      <button className="btn-accept" onClick={() => handleAccept(req.id)}>
                        ✓ Accept & Lock Slot
                      </button>
                      <button className="btn-counter" onClick={() => handleOpenCounter(req)}>
                        💬 Counter-Offer Quote
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(req.id)}>
                        ✕ Decline & Release
                      </button>
                    </div>
                  )}

                  {/* Negotiation Thread Toggle */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                    <button
                      style={{
                        border: 'none',
                        background: 'transparent',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={() => setExpandedThreadId(isThreadOpen ? null : req.id)}
                    >
                      <MessageSquare size={13} />
                      <span>Negotiation Thread ({req.negotiationThread?.length || 0} messages)</span>
                      {isThreadOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {isThreadOpen && (
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {req.negotiationThread?.map((msg, mIdx) => (
                          <div 
                            key={mIdx}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              background: msg.sender === 'provider' ? '#f1f5f9' : '#fff1f2',
                              alignSelf: msg.sender === 'provider' ? 'flex-end' : 'flex-start',
                              maxWidth: '90%'
                            }}
                          >
                            <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{msg.sender}: </span>
                            <span>{msg.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {requests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                No incoming booking holds at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Unified Airbnb-Style Master Calendar (Section 6.3) */}
        <div className="provider-section-card">
          <div className="section-card-title">
            <span>Unified Master Calendar</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#047857' }}>
              ● Live Sync
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Unified schedule merging confirmed reservations, atomic pending holds with countdowns, and available inventory across all your assets.
          </p>

          <div className="calendar-timeline">
            {listings.slice(0, 5).map(listing => (
              <div key={listing.id} style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{listing.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{listing.category}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {listing.slots.map(slot => {
                    const isBooked = slot.availableQty === 0 && slot.heldQty === 0;
                    const isHeld = slot.heldQty > 0;
                    const isAvail = slot.availableQty > 0;

                    return (
                      <div key={slot.id} className="timeline-row">
                        <div className="timeline-time">
                          <div>{slot.date.split('-').slice(1).join('/')}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{slot.time.split(' - ')[0]}</div>
                        </div>

                        <div className={`timeline-bar ${isBooked ? 'confirmed' : isHeld ? 'hold' : ''}`} style={{
                          background: isAvail && !isHeld ? '#ecfdf5' : undefined,
                          color: isAvail && !isHeld ? '#047857' : undefined,
                          borderLeft: isAvail && !isHeld ? '3px solid #10b981' : undefined
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>
                              {isBooked ? 'Confirmed Booking (Locked)' : isHeld ? `Pending 15m Hold (${slot.heldQty} held)` : `Available (${slot.availableQty}/${slot.totalQty})`}
                            </span>
                            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>v{slot.version}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Counter Offer Modal */}
      {selectedRequestForCounter && (
        <div className="modal-overlay" onClick={() => setSelectedRequestForCounter(null)}>
          <div className="modal-content-pdp" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-icon" onClick={() => setSelectedRequestForCounter(null)}>
              <X size={18} />
            </button>

            <form onSubmit={handleSubmitCounter} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Propose Counter-Offer Quote</h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Negotiate price, quantity or delivery terms with {selectedRequestForCounter.seekerName}.
                </p>
              </div>

              <div className="form-group-booking">
                <label className="form-label-booking">Proposed Price Per Unit (₹)</label>
                <input
                  type="number"
                  value={counterPrice}
                  onChange={(e) => setCounterPrice(e.target.value)}
                  className="input-booking"
                  required
                />
              </div>

              <div className="form-group-booking">
                <label className="form-label-booking">Proposed Quantity Units</label>
                <input
                  type="number"
                  value={counterQty}
                  onChange={(e) => setCounterQty(e.target.value)}
                  className="input-booking"
                  required
                />
              </div>

              <div className="form-group-booking">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <label className="form-label-booking">Negotiation Note to Seeker</label>
                  <button
                    type="button"
                    onClick={handleDraftWithAI}
                    disabled={isDraftingAI}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--brand-red)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isDraftingAI ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>AI is Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>✨ Draft with AI Assistant</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows="3"
                  value={counterNote}
                  onChange={(e) => setCounterNote(e.target.value)}
                  className="input-booking"
                  style={{ resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="card-cta-btn" 
                  onClick={() => setSelectedRequestForCounter(null)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-red" 
                  style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
                >
                  Send Counter-Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
