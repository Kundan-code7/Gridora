import React, { useState } from 'react';
import { ListingCard } from './ListingCard';
import { MapView } from './MapView';
import { AISearchBar } from './AISearchBar';
import { AlertCircle, MapPin } from 'lucide-react';

// Haversine distance in km between two lat/lng points
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function DiscoveryView({
  listings,
  selectedCategory,
  maxRadiusKm,
  maxPrice,
  viewMode,
  selectedZone,
  onSelectListing
}) {
  const [hoveredListingId, setHoveredListingId] = useState(null);
  const [aiFilterData, setAiFilterData] = useState(null);

  // Zone-aware filtering: use zone center + zone radius, fallback to maxRadiusKm filter
  const zoneCenter = selectedZone
    ? { lat: selectedZone.lat, lng: selectedZone.lng }
    : { lat: 19.0657, lng: 72.8688 }; // default BKC

  const effectiveRadiusKm = selectedZone?.radiusKm ?? maxRadiusKm;

  const filteredListings = listings.filter(item => {
    // If AI filter returned specific recommended IDs, prioritize them
    if (aiFilterData?.recommendedListingIds?.length > 0) {
      if (!aiFilterData.recommendedListingIds.includes(item.id)) {
        return false;
      }
    }

    // Category match
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Zone proximity — filter by haversine distance from selected zone center
    const distKm = haversineKm(
      zoneCenter.lat, zoneCenter.lng,
      item.location.lat, item.location.lng
    );
    if (distKm > effectiveRadiusKm) {
      return false;
    }

    // Max Price match
    if (item.pricing.amount > maxPrice) {
      return false;
    }

    return true;
  });

  return (
    <div className={`discovery-split-layout ${viewMode === 'list' ? 'full-list' : viewMode === 'map' ? 'full-map' : ''}`}>
      {/* Listings Scroll Column (Left) */}
      {viewMode !== 'map' && (
        <div className="listings-scroll-column">
          {/* Gemini AI Natural Language Requirement Matcher */}
          <AISearchBar 
            listings={listings} 
            onApplyAIFilters={(result) => setAiFilterData(result)} 
          />

          {/* Header Stats */}
          <div className="discovery-header-stats">
            <span className="results-count-text">
              {filteredListings.length} resource{filteredListings.length !== 1 ? 's' : ''} near {selectedZone?.label || 'your location'}
            </span>
            <span style={{ 
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '0.8125rem', color: 'var(--text-muted)', flexShrink: 0 
            }}>
              <MapPin size={12} />
              {effectiveRadiusKm} km radius
            </span>
          </div>

          {/* Cards Grid */}
          {filteredListings.length > 0 ? (
            <div className="listings-grid">
              {filteredListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  isHovered={hoveredListingId === listing.id}
                  onMouseEnter={() => setHoveredListingId(listing.id)}
                  onMouseLeave={() => setHoveredListingId(null)}
                  onSelectListing={onSelectListing}
                />
              ))}
            </div>
          ) : (
            <div className="empty-results-card">
              <AlertCircle size={38} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto', display: 'block' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                No Resources Near {selectedZone?.label || 'This Area'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.35rem' }}>
                Try selecting a broader zone from the location picker, or switch to "Mumbai Metro Belt" to see all available assets.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Map Column (Right) — passes zone center so map re-centers */}
      {viewMode !== 'list' && (
        <MapView
          listings={filteredListings}
          onSelectListing={onSelectListing}
          hoveredListingId={hoveredListingId}
          onHoverListing={setHoveredListingId}
          maxRadiusKm={effectiveRadiusKm}
          centerLat={zoneCenter.lat}
          centerLng={zoneCenter.lng}
        />
      )}
    </div>
  );
}
