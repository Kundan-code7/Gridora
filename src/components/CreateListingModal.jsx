import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  ChefHat, 
  Car, 
  Armchair, 
  Speaker, 
  Truck, 
  Plus, 
  Check, 
  UploadCloud,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { bookingEngineInstance } from '../services/bookingEngine';

export function CreateListingModal({ onClose, onListingCreated }) {
  const [category, setCategory] = useState('banquet');
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('Bandra West, Linking Road, Mumbai');
  const [zone, setZone] = useState('Bandra West');
  const [priceAmount, setPriceAmount] = useState('12000');
  const [priceUnit, setPriceUnit] = useState('hour');
  const [minRentalHours, setMinRentalHours] = useState('4');
  const [capacity, setCapacity] = useState('300 Guests');
  const [rules, setRules] = useState('No loud acoustics after 10 PM. Clean handover required.');
  const [needsPhysicalTransport, setNeedsPhysicalTransport] = useState(false);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80');

  // Initial Slot configuration
  const [slotDate, setSlotDate] = useState('2026-09-11');
  const [slotTime, setSlotTime] = useState('10:00 - 18:00');
  const [totalQty, setTotalQty] = useState('1');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newListing = bookingEngineInstance.addListing({
      title,
      category,
      provider: {
        name: 'The Grand Heritage Group',
        gstVerified: true,
        verifiedId: 'GSTIN27AAACH9102P1ZK',
        rating: 5.0,
        reviewsCount: 1,
        responseTime: '< 15 mins',
        phone: '+91 98200 88210',
        address,
        avatar: 'GH'
      },
      location: {
        lat: 19.0600 + (Math.random() - 0.5) * 0.05,
        lng: 72.8500 + (Math.random() - 0.5) * 0.05,
        zone
      },
      images: [
        imageUrl,
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      ],
      pricing: {
        amount: Number(priceAmount),
        unit: priceUnit,
        currency: '₹',
        minRentalHours: Number(minRentalHours)
      },
      specs: {
        capacity,
        rules,
        verifiedBy: 'Platform Hospitality Trust Framework'
      },
      needsPhysicalTransport,
      slots: [
        {
          id: 'slot-' + Math.random().toString(36).substring(2, 8),
          date: slotDate,
          time: slotTime,
          totalQty: Number(totalQty),
          availableQty: Number(totalQty),
          heldQty: 0,
          bookedQty: 0,
          version: 1
        }
      ]
    });

    onListingCreated(newListing);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-pdp" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose}>
          <X size={20} />
        </button>

        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              Provider Listing Workflow (Screen 3)
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>
              List Spare Capacity or Operational Asset
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Monetize idle banquet halls, off-peak commercial kitchens, event parking or equipment without phone calls.
            </p>
          </div>

          {/* Category Selector */}
          <div className="form-group-booking">
            <label className="form-label-booking">Resource Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[
                { id: 'banquet', label: 'Banquet Space' },
                { id: 'kitchen', label: 'Kitchen Capacity' },
                { id: 'parking', label: 'Valet Parking' },
                { id: 'furniture', label: 'Banquet Chairs & Ware' },
                { id: 'av', label: 'AV & Staging' },
                { id: 'vehicles', label: 'Refrigerated Fleet' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-filter-btn ${category === cat.id ? 'active' : ''}`}
                  style={{ justifyContent: 'center', fontSize: '0.75rem' }}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Description */}
          <div className="form-group-booking">
            <label className="form-label-booking">Listing Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Grand Ballroom - 300 Capacity (Off-Peak Afternoon Shift)"
              className="input-booking"
            />
          </div>

          {/* Location & Zone */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
            <div className="form-group-booking">
              <label className="form-label-booking">Address / Facility</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input-booking"
              />
            </div>
            <div className="form-group-booking">
              <label className="form-label-booking">Zone</label>
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="input-booking"
              />
            </div>
          </div>

          {/* Pricing & Min Rental Period */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group-booking">
              <label className="form-label-booking">Price (₹)</label>
              <input
                type="number"
                required
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value)}
                className="input-booking"
              />
            </div>
            <div className="form-group-booking">
              <label className="form-label-booking">Unit</label>
              <select 
                value={priceUnit} 
                onChange={(e) => setPriceUnit(e.target.value)}
                className="input-booking"
              >
                <option value="hour">per hour</option>
                <option value="day">per day</option>
                <option value="unit / day">per unit / day</option>
                <option value="bay / shift">per bay / shift</option>
              </select>
            </div>
            <div className="form-group-booking">
              <label className="form-label-booking">Min. Duration (Hrs)</label>
              <input
                type="number"
                value={minRentalHours}
                onChange={(e) => setMinRentalHours(e.target.value)}
                className="input-booking"
              />
            </div>
          </div>

          {/* Capacity Specs & Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group-booking">
              <label className="form-label-booking">Capacity / Quantity Specs</label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="input-booking"
              />
            </div>
            <div className="form-group-booking">
              <label className="form-label-booking">House Rules / Handover Terms</label>
              <input
                type="text"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
                className="input-booking"
              />
            </div>
          </div>

          {/* Initial Availability Slot */}
          <div style={{ 
            background: 'var(--bg-surface-subtle)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-md)', 
            padding: '0.875rem' 
          }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Initial Availability Slot Setup
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Date</label>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="input-booking"
                  style={{ padding: '0.4rem', fontSize: '0.8125rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Time Slot</label>
                <input
                  type="text"
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="input-booking"
                  style={{ padding: '0.4rem', fontSize: '0.8125rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Quantity</label>
                <input
                  type="number"
                  value={totalQty}
                  onChange={(e) => setTotalQty(e.target.value)}
                  className="input-booking"
                  style={{ padding: '0.4rem', fontSize: '0.8125rem' }}
                />
              </div>
            </div>
          </div>

          {/* Toggles: Physical Transport */}
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={needsPhysicalTransport}
                onChange={(e) => setNeedsPhysicalTransport(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--brand-red)' }}
              />
              <span>Requires <strong>Third-Party Freight / Logistics Carrier</strong></span>
            </label>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" className="card-cta-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary-red" style={{ width: 'auto', padding: '0.65rem 1.5rem' }}>
              Publish Resource Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
