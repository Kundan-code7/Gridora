import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Clock, 
  Truck, 
  Building2, 
  CheckCircle2, 
  Star, 
  Flame, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export function TransactionTrackerModal({ 
  requests, 
  onClose,
  onTriggerLogistics 
}) {
  const [selectedReqId, setSelectedReqId] = useState(requests[0]?.id);
  const [activeStepOverride, setActiveStepOverride] = useState({});
  const [completedReviews, setCompletedReviews] = useState({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('Excellent equipment condition. Seamless handover and flawless logistics coordination.');

  const currentReq = requests.find(r => r.id === selectedReqId) || requests[0];

  if (!currentReq) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content-pdp" style={{ maxWidth: '600px', padding: '2.5rem', textAlign: 'center' }}>
          <button className="modal-close-icon" onClick={onClose}><X size={20} /></button>
          <Clock size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3>No Active Capacity Transactions</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            When you place a booking hold or accept an incoming request, its full transaction lifecycle will be tracked here in real time.
          </p>
        </div>
      </div>
    );
  }

  // Determine stage based on request status or override
  // Stages: 1. Requested (Hold Locked) -> 2. Accepted -> 3. In Transit / Setup -> 4. Active on Site -> 5. Completed
  const currentStep = activeStepOverride[currentReq.id] || (
    currentReq.status === 'HOLD_PENDING' ? 1 :
    currentReq.status === 'CONFIRMED' ? 2 :
    currentReq.status === 'IN_TRANSIT' ? 3 :
    currentReq.status === 'COMPLETED' ? 5 : 2
  );

  const steps = [
    { number: 1, title: 'Hold Requested', desc: 'Atomic 15m hold locked' },
    { number: 2, title: 'Provider Accepted', desc: 'Confirmed on both calendars' },
    { number: 3, title: 'In Transit / Logistics', desc: 'Freight partner dispatched' },
    { number: 4, title: 'Active On-Site', desc: 'Capacity utilized at venue' },
    { number: 5, title: 'Completed', desc: 'Settled & reviewed' }
  ];

  const advanceStep = (newStep) => {
    setActiveStepOverride({
      ...activeStepOverride,
      [currentReq.id]: newStep
    });
  };

  const handleSaveReview = (e) => {
    e.preventDefault();
    setCompletedReviews({
      ...completedReviews,
      [currentReq.id]: {
        rating: reviewRating,
        comment: reviewComment,
        date: new Date().toLocaleDateString()
      }
    });
  };

  const hasReviewed = completedReviews[currentReq.id];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-pdp" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ 
                background: 'var(--brand-red-subtle)', 
                color: 'var(--brand-red)', 
                fontSize: '0.75rem', 
                fontWeight: 700, 
                padding: '3px 8px', 
                borderRadius: '4px',
                textTransform: 'uppercase'
              }}>
                Screen 7: Transaction Tracker & Lifecycle Stepper
              </span>
              <h2 style={{ fontSize: '1.625rem', fontWeight: 800, marginTop: '0.35rem' }}>
                B2B Capacity Exchange Tracker
              </h2>
            </div>

            {/* Selector if multiple transactions */}
            {requests.length > 1 && (
              <select
                value={selectedReqId}
                onChange={(e) => setSelectedReqId(e.target.value)}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}
              >
                {requests.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.resourceTitle.substring(0, 30)}... ({r.id})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Transaction Metadata Card */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Resource
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {currentReq.resourceTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Qty: {currentReq.requestedQty} units
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Date & Shift
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {currentReq.slotDate}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {currentReq.slotTime}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Total Transaction Value
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                ₹{(currentReq.totalAmount || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Standard B2B Term (Atomic Lock Verified)
              </div>
            </div>
          </div>

          {/* Visual Lifecycle Stepper (Section 7) */}
          <div className="tracker-stepper">
            {steps.map(step => {
              const isCompleted = step.number < currentStep;
              const isActive = step.number === currentStep;

              return (
                <div 
                  key={step.number} 
                  className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="step-bubble">
                    {isCompleted ? <Check size={16} /> : step.number}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="step-title">{step.title}</div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{step.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Simulation Stepper Controls */}
          <div style={{
            background: '#fff',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                Current Operational Stage: Step {currentStep} of 5 ({steps[currentStep - 1]?.title})
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Advance status as physical handover and operations progress.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {currentStep < 5 && (
                <button 
                  className="btn-primary-red" 
                  style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.8125rem' }}
                  onClick={() => advanceStep(currentStep + 1)}
                >
                  <span>Advance to Step {currentStep + 1}</span>
                  <ArrowRight size={14} />
                </button>
              )}
              {currentStep === 5 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '0.875rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Exchange Fully Completed & Settled</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating & Review Section on Completion (Section 7) */}
          {currentStep === 5 && (
            <div style={{
              background: '#fafafa',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              animation: 'slideDown 0.3s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Sparkles size={18} color="var(--brand-red)" />
                <h3 style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                  Reciprocal B2B Rating & Partner Review
                </h3>
              </div>

              {!hasReviewed ? (
                <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Overall Experience Rating
                    </label>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '2px' }}
                        >
                          <Star 
                            size={24} 
                            fill={star <= reviewRating ? '#f59e0b' : 'none'} 
                            color={star <= reviewRating ? '#f59e0b' : '#cbd5e1'} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group-booking">
                    <label className="form-label-booking">Review & Operational Feedback</label>
                    <textarea
                      rows="3"
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="input-booking"
                      style={{ resize: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn-primary-red" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                      Submit Partner Review & Endorse GST Badge
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <CheckCircle2 size={16} />
                    <span>Review Submitted Successfully ({hasReviewed.rating} Stars)</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', marginTop: '4px', fontStyle: 'italic' }}>
                    "{hasReviewed.comment}"
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '6px' }}>
                    ✔ Trust score updated on both provider & seeker business profiles.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
