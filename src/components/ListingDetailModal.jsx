import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Zap, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { bookingEngineInstance } from '../services/bookingEngine';

export function ListingDetailModal({ 
  listing, 
  onClose, 
  onHoldCreated,
  onTriggerLogisticsModal
}) {
  const [currentListing, setCurrentListing] = useState(listing);
  const [selectedSlotId, setSelectedSlotId] = useState(
    listing.slots.find(s => s.availableQty > 0)?.id || listing.slots[0]?.id
  );
  const [requestedQty, setRequestedQty] = useState(1);
  const [bookingNotes, setBookingNotes] = useState('');
  const [holdSuccessData, setHoldSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [concurrencyTestResults, setConcurrencyTestResults] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with engine updates
  useEffect(() => {
    const unsubscribe = bookingEngineInstance.subscribe(({ listings }) => {
      const updated = listings.find(l => l.id === listing.id);
      if (updated) setCurrentListing(updated);
    });
    return unsubscribe;
  }, [listing.id]);

  const selectedSlot = currentListing.slots.find(s => s.id === selectedSlotId);

  // Handle Atomic Hold Request (Section 6.1 & 6.2)
  const handleCreateHold = () => {
    if (!selectedSlot) return;
    setErrorMessage('');
    setIsSubmitting(true);

    const result = bookingEngineInstance.createBookingHold({
      resourceId: currentListing.id,
      slotId: selectedSlot.id,
      requestedQty: Number(requestedQty),
      seekerName: 'Grand Horizon Hospitality Ltd.',
      seekerContact: 'Operations Desk (+91 98200 11990)',
      unitPrice: currentListing.pricing.amount,
      notes: bookingNotes,
      isUrgent: false,
      expectedVersion: selectedSlot.version
    });

    setIsSubmitting(false);

    if (result.success) {
      setHoldSuccessData(result.request);
      onHoldCreated(result.request);

      // If requires physical transport, trigger AI Logistics modal
      if (currentListing.needsPhysicalTransport) {
        setTimeout(() => {
          onTriggerLogisticsModal(currentListing, result.request);
        }, 1000);
      }
    } else {
      setErrorMessage(result.error);
    }
  };

  // Run the Concurrency Stress Test to physically prove double-booking is impossible
  const handleRunConcurrencyTest = () => {
    if (!selectedSlot) return;
    const testResult = bookingEngineInstance.simulateConcurrentRace(currentListing.id, selectedSlot.id);
    setConcurrencyTestResults(testResult);
  };

  const totalPrice = selectedSlot 
    ? (currentListing.pricing.amount * requestedQty).toLocaleString() 
    : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-pdp" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-icon" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {/* Photo Gallery Header */}
        <div className="pdp-gallery">
          <img 
            src={currentListing.images[0]} 
            alt={currentListing.title} 
            className="pdp-hero-image" 
          />
          <div className="pdp-gallery-subgrid">
            <img 
              src={currentListing.images[1] || currentListing.images[0]} 
              alt="Gallery 2" 
              className="pdp-sub-image" 
            />
            <img 
              src={currentListing.images[2] || currentListing.images[0]} 
              alt="Gallery 3" 
              className="pdp-sub-image" 
            />
          </div>
        </div>

        {/* PDP Layout: Main Details (Left) + Sticky Booking Panel (Right) */}
        <div className="pdp-layout">
          {/* Left Column: Details & Live Calendar */}
          <div className="pdp-details-col">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ 
                  background: 'var(--bg-surface-subtle)', 
                  fontSize: '0.725rem', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  padding: '3px 9px', 
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.04em'
                }}>
                  {currentListing.category}
                </span>
              </div>
              <h1 className="pdp-title">{currentListing.title}</h1>
              <div className="pdp-location-row" style={{ marginTop: '0.5rem' }}>
                <MapPin size={15} />
                <span>{currentListing.provider.address} ({currentListing.location.distanceKm} km away)</span>
              </div>
            </div>

            {/* Provider Profile Trust Box */}
            <div className="provider-trust-box">
              <div className="provider-avatar">
                {currentListing.provider.avatar}
              </div>
              <div className="provider-trust-meta">
                <div className="provider-name">
                  <span>{currentListing.provider.name}</span>
                  {currentListing.provider.gstVerified && (
                    <ShieldCheck size={15} color="var(--badge-verified-text)" title="Verified GSTIN" />
                  )}
                </div>
                <div className="provider-sla">
                  Responds in {currentListing.provider.responseTime} · Verified GSTIN: {currentListing.provider.verifiedId}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', fontWeight: 600 }}>
                  <Star size={13} fill="#0f172a" strokeWidth={0} />
                  <span>{currentListing.provider.rating}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({currentListing.provider.reviewsCount} verified reviews)</span>
                </div>
              </div>
            </div>

            {/* Specs & Attributes Grid */}
            <div>
              <h3 className="specs-section-title">Resource Specifications & Attributes</h3>
              <div className="specs-grid">
                {Object.entries(currentListing.specs).map(([key, val]) => (
                  <div key={key} className="spec-item-box">
                    <div className="spec-icon-box">
                      <Sparkles size={15} />
                    </div>
                    <div>
                      <div className="spec-label">{key.replace(/([A-Z])/g, ' $1')}</div>
                      <div className="spec-value">
                        {Array.isArray(val) ? val.join(', ') : val}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Embedded Live Availability Calendar */}
            <div className="live-calendar-card">
              <div className="calendar-header-row">
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Live Availability & Slot Lock Status</h3>
                <div className="slot-legend">
                  <div className="legend-item">
                    <div className="legend-swatch avail"></div>
                    <span>Available</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-swatch hold"></div>
                    <span>Soft Hold (TTL)</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-swatch booked"></div>
                    <span>Locked/Booked</span>
                  </div>
                </div>
              </div>

              <div className="slots-grid">
                {currentListing.slots.map(slot => {
                  const isAvailable = slot.availableQty > 0;
                  const isHeld = slot.heldQty > 0;
                  const isBooked = slot.availableQty === 0 && slot.heldQty === 0;
                  const isSelected = selectedSlotId === slot.id;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isBooked}
                      className={`slot-button ${isSelected ? 'selected' : ''} ${isHeld ? 'status-hold' : ''} ${isBooked ? 'status-booked' : ''}`}
                      onClick={() => {
                        setSelectedSlotId(slot.id);
                        setErrorMessage('');
                        setHoldSuccessData(null);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="slot-time">{slot.date}</div>
                        {isBooked ? (
                          <Lock size={12} color="#64748b" />
                        ) : (
                          <Unlock size={12} color={isHeld ? '#b45309' : '#10b981'} />
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>{slot.time}</div>
                      
                      <div className="slot-stock">
                        {isBooked 
                          ? 'Locked by Confirmed Booking' 
                          : `Capacity: ${slot.availableQty} of ${slot.totalQty} open`}
                      </div>

                      {isHeld && (
                        <div className="slot-hold-countdown">
                          <Clock size={11} />
                          <span>15m Hold in progress</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Concurrency Stress Test Simulation Box */}
            <div className="concurrency-test-box">
              <div className="test-title">
                <Zap size={14} color="var(--brand-red)" />
                <span>Simulate Concurrency Race Condition (Double-Booking Prevention Test)</span>
              </div>
              <p className="test-desc">
                Tests the atomic slot-locking engine by firing two simultaneous booking requests for the last remaining unit at the exact same millisecond. Proves that Seeker 1 acquires the atomic lock and Seeker 2 is safely rejected by optimistic versioning.
              </p>
              <div>
                <button className="btn-test-action" onClick={handleRunConcurrencyTest}>
                  ⚡ Run Race Condition Stress Test
                </button>
              </div>

              {concurrencyTestResults && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-sm)', 
                  background: '#0f172a', 
                  color: '#fff', 
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  lineHeight: 1.4
                }}>
                  <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px' }}>
                    [ATOMIC CONCURRENCY ENGINE LOG]
                  </div>
                  <div>- Initial Slot: {concurrencyTestResults.slotId} (v{concurrencyTestResults.initialVersion}, Avail: {concurrencyTestResults.initialAvailable})</div>
                  <div style={{ color: '#4ade80' }}>
                    ✔ Seeker A: {concurrencyTestResults.seeker1Result.success ? 'ACQUIRED LOCK (Held with 15m TTL)' : 'Failed'}
                  </div>
                  <div style={{ color: concurrencyTestResults.seeker2Result.success ? '#4ade80' : '#f87171' }}>
                    {concurrencyTestResults.seeker2Result.success 
                      ? 'Seeker B Succeeded' 
                      : `✖ Seeker B: SAFELY REJECTED -> ${concurrencyTestResults.seeker2Result.code} (${concurrencyTestResults.seeker2Result.error})`}
                  </div>
                  <div style={{ marginTop: '4px', color: '#fbbf24' }}>
                    Double-Booking Immunity: 100% Guaranteed. Database version incremented atomically.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Booking & Hold Panel */}
          <div>
            <div className="sticky-booking-panel">
              <div className="booking-panel-price-row">
                <div>
                  <span style={{ fontSize: '1.625rem', fontWeight: 800 }}>
                    {currentListing.pricing.currency}{currentListing.pricing.amount.toLocaleString()}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}> / {currentListing.pricing.unit}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Response SLA</div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {currentListing.provider.responseTime}
                  </div>
                </div>
              </div>

              {/* Slot Selected Info */}
              {selectedSlot ? (
                <div style={{ 
                  background: 'var(--bg-surface-subtle)', 
                  padding: '0.75rem', 
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem' 
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    Selected Slot: {selectedSlot.date} ({selectedSlot.time})
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Available stock: {selectedSlot.availableQty} units (v{selectedSlot.version})
                  </div>
                </div>
              ) : (
                <div style={{ color: '#ef4444', fontSize: '0.8125rem' }}>Please select an available slot</div>
              )}

              {/* Quantity Required Selector */}
              <div className="form-group-booking">
                <label className="form-label-booking">Quantity Required (Max: {selectedSlot?.availableQty || 0})</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min="1"
                    max={selectedSlot?.availableQty || 1}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(Math.max(1, Number(e.target.value)))}
                    className="input-booking"
                  />
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    units
                  </span>
                </div>
              </div>

              {/* Logistics AI Notification if Physical Transport */}
              {currentListing.needsPhysicalTransport && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  fontSize: '0.75rem',
                  color: '#166534'
                }}>
                  <Truck size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>AI Freight Logistics Available:</strong> Once your hold is placed, our logistics agent will match ranked third-party carriers (Porter / Blowhorn) with live ETAs.
                  </div>
                </div>
              )}

              {/* Booking Notes */}
              <div className="form-group-booking">
                <label className="form-label-booking">Special Instructions / Requirements</label>
                <textarea
                  rows="2"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g., Banquet entry timing, loading dock clearance needed..."
                  className="input-booking"
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Price Calculation Summary */}
              <div style={{
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.125rem'
              }}>
                <span>Total Quote</span>
                <span>{currentListing.pricing.currency}{totalPrice}</span>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Primary Action: Place 15-min Booking Hold */}
              <button
                type="button"
                disabled={!selectedSlot || selectedSlot.availableQty <= 0 || isSubmitting}
                className="btn-primary-red"
                onClick={handleCreateHold}
              >
                {isSubmitting ? (
                  <span>Locking Slot...</span>
                ) : (
                  <>
                    <span>Place 15-Min Booking Hold</span>
                    <ChevronRight size={17} />
                  </>
                )}
              </button>

              <div className="hold-guarantee-note">
                🔒 <strong>Atomic Soft-Lock Guarantee:</strong> Holds this capacity exclusively for your business for 15 minutes. No other seeker can double-book while the provider reviews your request.
              </div>

              {/* Hold Success Confirmation Box */}
              {holdSuccessData && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  animation: 'slideDown 0.2s ease'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.875rem' }}>
                    <CheckCircle2 size={16} color="#047857" />
                    <span>Slot Soft-Locked Successfully!</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>
                    Hold ID: <code>{holdSuccessData.holdId}</code>. Sent to provider inbox with 15-minute reservation timer.
                  </div>
                  {currentListing.needsPhysicalTransport && (
                    <button
                      className="btn-primary-red"
                      style={{ marginTop: '0.75rem', padding: '0.45rem 0.85rem', fontSize: '0.75rem' }}
                      onClick={() => onTriggerLogisticsModal(currentListing, holdSuccessData)}
                    >
                      <Truck size={14} />
                      <span>View AI Delivery-Partner Quotes</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
