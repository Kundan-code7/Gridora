import React, { useState, useEffect } from 'react';
import { 
  X, 
  Truck, 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Copy, 
  ArrowRight,
  ExternalLink,
  Info,
  Loader2,
  Cpu
} from 'lucide-react';
import { LOGISTICS_VENDORS } from '../data/mockListings';
import { GeminiService } from '../services/geminiService';

export function UrgentAILogisticsModal({ 
  listing, 
  request, 
  onClose,
  onDispatchSelected
}) {
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('log-1');
  const [isLoadingAI, setIsLoadingAI] = useState(true);
  const [aiData, setAiData] = useState(null);

  // Fetch live AI logistics recommendations from Gemini 3.5 Flash
  useEffect(() => {
    let isMounted = true;
    async function loadGeminiRecommendations() {
      setIsLoadingAI(true);
      const res = await GeminiService.getLogisticsRecommendation({
        resourceTitle: listing?.title || 'Hospitality Equipment',
        quantity: request?.requestedQty || 100,
        distanceKm: listing?.location?.distanceKm || 4.8,
        isUrgent: request?.isUrgent || listing?.urgentFulfillment || false,
        pickupAddress: listing?.provider?.address,
        dropoffAddress: 'Grand Horizon Hospitality Event Site'
      });
      if (isMounted) {
        setAiData(res);
        if (res?.vendors?.[0]?.id) {
          setSelectedVendorId(res.vendors[0].id);
        }
        setIsLoadingAI(false);
      }
    }
    loadGeminiRecommendations();
    return () => { isMounted = false; };
  }, [listing, request]);

  const vendorsList = aiData?.vendors || LOGISTICS_VENDORS;

  const handleCopyManifest = () => {
    const manifest = aiData?.officialManifest || `=== HOSPITALITY RESOURCE EXCHANGE - DISPATCH MANIFEST ===
Resource: ${listing?.title || 'Banqueting Equipment'}
Quantity: ${request?.requestedQty || 100} units
Pickup Hub: ${listing?.provider?.name || 'Marigold Event Infrastructure'}
Pickup Address: ${listing?.provider?.address || 'Marol Industrial Area, Andheri East'}
Pickup Point Contact: ${listing?.provider?.phone || '+91 98200 44122'}
Dropoff Seeker: ${request?.seekerName || 'Grand Horizon Hospitality'}
Dropoff Contact: ${request?.seekerContact || '+91 98200 11990'}
Logistics Vendor: ${vendorsList.find(v => v.id === selectedVendorId)?.name}
Gate Pass: AUTOPASS-HRE-${Math.floor(100000 + Math.random() * 900000)}
Platform Notice: The platform acts solely as an intelligent connector; carrier liability rests between parties.
======================================================`;

    navigator.clipboard?.writeText(manifest);
    setCopiedManifest(true);
    setTimeout(() => setCopiedManifest(false), 2500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-pdp" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div className="ai-header-badge">
                <Sparkles size={14} />
                <span>AI Delivery-Partner Recommendation Agent</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#047857', fontWeight: 600, background: '#ecfdf5', padding: '3px 8px', borderRadius: '999px', border: '1px solid #a7f3d0' }}>
                <Cpu size={12} />
                <span>AI Logistics Engine Active</span>
              </div>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
              Instant Third-Party Freight Matching
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {aiData?.cargoAnalysis || 'Evaluating cargo physical specifications, road transit regulations, and real-time vendor dispatch ETA...'}
            </p>
          </div>

          {/* Loading Indicator */}
          {isLoadingAI && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '2.5rem',
              background: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem'
            }}>
              <Loader2 size={24} className="animate-spin" color="var(--brand-red)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                AI Logistics Agent is calculating payload volume and ranking freight haulers...
              </span>
            </div>
          )}

          {/* Matched Summary Pill */}
          <div style={{
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8125rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Cargo:</span>{' '}
              <strong>{request?.requestedQty || 100} units ({listing?.title})</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Transit Distance:</span>{' '}
              <strong>{listing?.location?.distanceKm || 4.8} km</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Fulfillment SLA:</span>{' '}
              <strong style={{ color: 'var(--brand-red)' }}>Fast-Track &lt; 60 mins</strong>
            </div>
          </div>

          {/* 3 Ranked Logistics Vendors */}
          <div className="vendor-recommendations-list">
            {vendorsList.map((vendor, idx) => {
              const isSelected = selectedVendorId === vendor.id;
              const isBest = idx === 0;

              return (
                <div 
                  key={vendor.id}
                  className={`vendor-card ${isBest ? 'ranked-best' : ''}`}
                  style={{
                    border: isSelected ? '2px solid var(--brand-red)' : undefined,
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedVendorId(vendor.id)}
                >
                  <div className="vendor-info">
                    <div className="vendor-name-row">
                      <span>{vendor.name}</span>
                      <span className="vendor-badge-best">{vendor.badge || (isBest ? 'AI Best Match' : 'Alternative')}</span>
                    </div>
                    <div className="vendor-specs">
                      🚛 {vendor.vehicleType} · 📍 {vendor.distanceKm || 3} km away · ⏱ ETA: <strong>{vendor.etaMins || 25} mins</strong>
                    </div>
                    {vendor.aiReasoning && (
                      <div style={{ fontSize: '0.725rem', color: '#047857', marginTop: '2px', fontWeight: 500 }}>
                        ✨ AI Fit: {vendor.aiReasoning}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {vendor.features?.map((feat, fIdx) => (
                        <span key={fIdx}>✓ {feat}</span>
                      ))}
                    </div>
                  </div>

                  <div className="vendor-actions">
                    <div className="vendor-price">
                      ₹{(vendor.estimatedTotal || 1200).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Est. All-inclusive fare
                    </div>
                    <button 
                      className={`btn-counter ${isSelected ? 'active' : ''}`}
                      style={{ 
                        background: isSelected ? 'var(--brand-red)' : '#fff', 
                        color: isSelected ? '#fff' : 'inherit',
                        borderColor: isSelected ? 'var(--brand-red)' : 'var(--border-medium)',
                        marginTop: '4px',
                        padding: '0.3rem 0.75rem',
                        fontSize: '0.75rem'
                      }}
                      onClick={() => setSelectedVendorId(vendor.id)}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Platform Liability Disclaimer & Actions */}
          <div style={{
            marginTop: '1.75rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: '#fffbeb',
            border: '1px solid #fef3c7',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: '#92400e'
          }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Platform Liability Protection:</strong> As specified in Section 9, the platform operates strictly as an intelligent matching connector and holds zero transit liability. Seeker and provider coordinate direct handoff with the chosen carrier using the generated manifest.
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.5rem',
            gap: '1rem'
          }}>
            <button
              className="card-cta-btn"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={handleCopyManifest}
            >
              {copiedManifest ? <Check size={16} color="#047857" /> : <Copy size={16} />}
              <span>{copiedManifest ? 'Manifest Copied to Clipboard!' : 'Copy AI Dispatch Manifest'}</span>
            </button>

            <button
              className="btn-primary-red"
              style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
              onClick={() => {
                const vendor = vendorsList.find(v => v.id === selectedVendorId) || vendorsList[0];
                onDispatchSelected(vendor);
                onClose();
              }}
            >
              <span>Confirm Freight Partner & Update Tracker</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
