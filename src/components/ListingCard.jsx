import React from 'react';
import { 
  Star, 
  ShieldCheck, 
  Truck
} from 'lucide-react';

export function ListingCard({ 
  listing, 
  onSelectListing, 
  isHovered, 
  onMouseEnter, 
  onMouseLeave 
}) {
  const {
    id,
    title,
    category,
    provider,
    location,
    images,
    pricing,
    specs,
    needsPhysicalTransport,
    slots
  } = listing;

  // Calculate live available slot summary
  const availableSlotsCount = slots.filter(s => s.availableQty > 0).length;
  const hasHolds = slots.some(s => s.heldQty > 0);

  return (
    <div 
      className={`listing-card ${isHovered ? 'highlighted-from-map' : ''}`}
      onClick={() => onSelectListing(listing)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Hero Media */}
      <div className="card-media-wrapper">
        <img 
          src={images[0]} 
          alt={title} 
          className="card-hero-image"
          loading="lazy" 
        />
        <div className="card-category-badge">
          {category}
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        {/* Title & Star Rating */}
        <div className="card-header-row">
          <h3 className="card-title">{title}</h3>
          <div className="card-rating">
            <Star size={13} fill="#0f172a" strokeWidth={0} />
            <span>{provider.rating.toFixed(2)}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>({provider.reviewsCount})</span>
          </div>
        </div>

        {/* Provider Name + Verified Status */}
        <div className="provider-info-line">
          <span>{provider.name}</span>
          {provider.gstVerified && (
            <ShieldCheck size={13} className="provider-verified-icon" title="GST Registered & Verified" />
          )}
          <span>·</span>
          <span>{location.distanceKm} km ({location.zone})</span>
        </div>

        {/* Key Specs Row */}
        <div className="card-specs-row">
          {specs.capacity && <div className="spec-chip">{specs.capacity}</div>}
          {specs.areaSqFt && <div className="spec-chip">{specs.areaSqFt}</div>}
          {specs.stockAvailable && <div className="spec-chip">{specs.stockAvailable}</div>}
          {specs.totalBays && <div className="spec-chip">{specs.totalBays}</div>}
          {specs.payload && <div className="spec-chip">{specs.payload}</div>}
          {needsPhysicalTransport && (
            <div className="spec-chip" style={{ color: 'var(--brand-red)', borderColor: 'var(--brand-red-border)', background: 'var(--brand-red-subtle)' }}>
              <Truck size={12} />
              <span>Logistics Ready</span>
            </div>
          )}
        </div>

        {/* Live Slot Availability status */}
        <div className="card-slot-status">
          <div className={`status-dot ${availableSlotsCount > 0 ? 'available' : 'hold'}`}></div>
          <span style={{ color: availableSlotsCount > 0 ? '#047857' : '#b45309' }}>
            {availableSlotsCount > 0 
              ? `${availableSlotsCount} slots open today` 
              : hasHolds ? 'Holding soft-lock in progress' : 'Fully booked today'}
          </span>
          <span style={{ color: 'var(--border-medium)' }}>·</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.725rem' }}>
            Responds in {provider.responseTime}
          </span>
        </div>

        {/* Price & CTA Footer */}
        <div className="card-footer-row">
          <div className="card-pricing">
            <span className="price-main">
              {pricing.currency}{pricing.amount.toLocaleString()}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> / {pricing.unit}</span>
            </span>
            {pricing.minRentalHours && (
              <span className="price-sub">Min: {pricing.minRentalHours} hrs</span>
            )}
          </div>

          <button className="card-cta-btn" onClick={(e) => { e.stopPropagation(); onSelectListing(listing); }}>
            Check Dates
          </button>
        </div>
      </div>
    </div>
  );
}
