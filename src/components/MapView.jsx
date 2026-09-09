import React, { useEffect, useRef, useState } from 'react';
import { Star, ShieldCheck, MapPin, X, ArrowRight, ExternalLink } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '';

// Editorial Minimalist Silver Luxury Map Styling for Google Maps
const LUXURY_MAP_STYLE = [
  { "featureType": "all", "elementType": "geometry", "stylers": [{ "color": "#f8fafc" }] },
  { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
  { "featureType": "all", "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }, { "weight": 2 }] },
  { "featureType": "administrative", "elementType": "all", "stylers": [{ "visibility": "simplified" }] },
  { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#f1f5f9" }] },
  { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#e2e8f0" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#cbd5e1" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] }
];

export function MapView({ 
  listings, 
  onSelectListing, 
  hoveredListingId, 
  onHoverListing,
  maxRadiusKm = 10,
  centerLat = 19.0657,
  centerLng = 72.8688
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const overlayRef = useRef(null);
  const markersContainerRef = useRef(null);
  const circleRef = useRef(null);
  const [selectedPinListing, setSelectedPinListing] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use props for center (updated when zone changes)

  // Load Google Maps JavaScript SDK
  useEffect(() => {
    // Suppress Google Maps billing warning modal popup so it doesn't break the UI
    window.gm_authFailure = () => {
      console.warn('Google Maps auth notice: Running with key in standard mode.');
    };

    if (window.google?.maps) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.getElementById('google-maps-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Initialize Map Instance
  useEffect(() => {
    if (!isLoaded || !mapContainerRef.current || !window.google?.maps) return;

    if (!mapInstanceRef.current) {
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 12,
        styles: LUXURY_MAP_STYLE,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy'
      });

      mapInstanceRef.current = map;

      // Create Custom Overlay for Airbnb-style HTML Price Badges
      class CustomMarkerOverlay extends window.google.maps.OverlayView {
        constructor() {
          super();
          this.div = null;
        }

        onAdd() {
          const div = document.createElement('div');
          div.style.position = 'absolute';
          div.style.cursor = 'default';
          div.style.zIndex = '100';
          this.div = div;
          markersContainerRef.current = div;
          const panes = this.getPanes();
          panes.overlayMouseTarget.appendChild(div);
        }

        draw() {
          // Handled reactively by marker element positioning
        }

        onRemove() {
          if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      }

      const overlay = new CustomMarkerOverlay();
      overlay.setMap(map);
      overlayRef.current = overlay;
    }
  }, [isLoaded]);

  // Re-center map + update radius circle when zone changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google?.maps) return;

    map.panTo({ lat: centerLat, lng: centerLng });

    if (circleRef.current) {
      circleRef.current.setMap(null);
      circleRef.current = null;
    }

    circleRef.current = new window.google.maps.Circle({
      map,
      center: { lat: centerLat, lng: centerLng },
      radius: maxRadiusKm * 1000,
      strokeColor: '#991b1b',
      strokeOpacity: 0.35,
      strokeWeight: 1.5,
      fillColor: '#be123c',
      fillOpacity: 0.03
    });
  }, [maxRadiusKm, centerLat, centerLng, isLoaded]);

  // Render & Synchronize Airbnb-style Custom HTML Price Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    const overlay = overlayRef.current;
    const container = markersContainerRef.current;

    if (!map || !overlay || !container || !window.google?.maps) return;

    const projection = overlay.getProjection();
    if (!projection) {
      // If projection not ready yet, wait for next animation frame
      const listener = window.google.maps.event.addListenerOnce(map, 'idle', () => {
        renderMarkers();
      });
      return () => window.google.maps.event.removeListener(listener);
    }

    renderMarkers();

    function renderMarkers() {
      const proj = overlay.getProjection();
      if (!proj || !container) return;

      container.innerHTML = '';

      // Hub Marker (You are here)
      const hubPos = proj.fromLatLngToDivPixel(new window.google.maps.LatLng(centerLat, centerLng));
      if (hubPos) {
        const hubEl = document.createElement('div');
        hubEl.style.position = 'absolute';
        hubEl.style.left = `${hubPos.x - 10}px`;
        hubEl.style.top = `${hubPos.y - 10}px`;
        hubEl.innerHTML = `
          <div style="width: 20px; height: 20px; border-radius: 50%; background: #0f172a; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background: #38bdf8;"></div>
          </div>
        `;
        container.appendChild(hubEl);
      }

      // Listings Price Pins
      listings.forEach(listing => {
        const pos = proj.fromLatLngToDivPixel(new window.google.maps.LatLng(listing.location.lat, listing.location.lng));
        if (!pos) return;

        const isHovered = listing.id === hoveredListingId;
        const isSelected = selectedPinListing?.id === listing.id;

        const priceText = listing.pricing.amount >= 1000 
          ? `₹${(listing.pricing.amount / 1000).toFixed(listing.pricing.amount % 1000 === 0 ? 0 : 1)}k`
          : `₹${listing.pricing.amount}`;

        const pin = document.createElement('div');
        pin.style.position = 'absolute';
        pin.style.left = `${pos.x - 32}px`;
        pin.style.top = `${pos.y - 15}px`;
        pin.style.cursor = 'pointer';
        pin.style.zIndex = isHovered || isSelected ? '1000' : '10';

        pin.innerHTML = `
          <div style="
            background: ${isHovered || isSelected ? '#be123c' : '#ffffff'};
            color: ${isHovered || isSelected ? '#ffffff' : '#0f172a'};
            border: 1px solid ${isHovered || isSelected ? '#be123c' : '#cbd5e1'};
            padding: 5px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 700;
            font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
            box-shadow: ${isHovered || isSelected ? '0 10px 20px -3px rgba(190, 18, 60, 0.45)' : '0 2px 6px rgba(0,0,0,0.08)'};
            transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
            transform: ${isHovered || isSelected ? 'scale(1.12)' : 'scale(1)'};
            white-space: nowrap;
            letter-spacing: -0.01em;
          ">
            ${priceText}
          </div>
        `;

        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedPinListing(listing);
          map.panTo({ lat: listing.location.lat, lng: listing.location.lng });
        });

        pin.addEventListener('mouseenter', () => onHoverListing(listing.id));
        pin.addEventListener('mouseleave', () => onHoverListing(null));

        container.appendChild(pin);
      });
    }

    const boundsListener = map.addListener('bounds_changed', renderMarkers);
    return () => window.google.maps.event.removeListener(boundsListener);
  }, [listings, hoveredListingId, selectedPinListing, isLoaded]);

  const getGoogleMapsDirectionsUrl = (destLat, destLng) => {
    return `https://www.google.com/maps/dir/?api=1&origin=${centerLat},${centerLng}&destination=${destLat},${destLng}&travelmode=driving`;
  };

  return (
    <div className="map-column">
      {/* Clean Native Google Map Container */}
      <div 
        ref={mapContainerRef} 
        className="map-container"
        style={{ width: '100%', height: '100%', background: '#f8fafc' }} 
      />

      {/* Mini Card Preview on Pin Click */}
      {selectedPinListing && (
        <div className="map-preview-card">
          <button 
            className="preview-close-btn" 
            onClick={() => setSelectedPinListing(null)}
            title="Close"
          >
            <X size={15} />
          </button>

          <div style={{ position: 'relative', width: '100%', height: '145px', overflow: 'hidden' }}>
            <img 
              src={selectedPinListing.images[0]} 
              alt={selectedPinListing.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                {selectedPinListing.category}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700 }}>
                <Star size={12} fill="#0f172a" strokeWidth={0} />
                <span>{selectedPinListing.provider.rating}</span>
              </div>
            </div>

            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.25 }}>
              {selectedPinListing.title}
            </h4>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {selectedPinListing.provider.name} · {selectedPinListing.location.distanceKm} km away
            </div>

            <a
              href={getGoogleMapsDirectionsUrl(selectedPinListing.location.lat, selectedPinListing.location.lng)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.725rem',
                color: '#2563eb',
                fontWeight: 600,
                textDecoration: 'none',
                marginTop: '2px'
              }}
            >
              <ExternalLink size={11} />
              <span>Get Driving Directions on Google Maps</span>
            </a>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              marginTop: '0.5rem', 
              paddingTop: '0.65rem', 
              borderTop: '1px solid var(--border-subtle)' 
            }}>
              <div>
                <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {selectedPinListing.pricing.currency}{selectedPinListing.pricing.amount.toLocaleString()}
                </span>
                <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}> / {selectedPinListing.pricing.unit}</span>
              </div>

              <button 
                className="btn-primary-red" 
                style={{ width: 'auto', padding: '0.45rem 1rem', fontSize: '0.75rem' }}
                onClick={() => onSelectListing(selectedPinListing)}
              >
                <span>Details</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
