import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { DiscoveryView } from './components/DiscoveryView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { UrgentAILogisticsModal } from './components/UrgentAILogisticsModal';
import { ProviderDashboard } from './components/ProviderDashboard';
import { CreateListingModal } from './components/CreateListingModal';
import { TransactionTrackerModal } from './components/TransactionTrackerModal';
import { bookingEngineInstance } from './services/bookingEngine';

// Zone definitions with center lat/lng - exported so Header & DiscoveryView can use them
export const MUMBAI_ZONES = [
  { id: 'navi-mumbai',      label: 'Navi Mumbai',              sub: 'Vashi, Kharghar, Belapur, Panvel',   lat: 19.0368, lng: 73.0158, radiusKm: 12 },
  { id: 'mumbai-metro',    label: 'Mumbai Metro Belt',         sub: 'Andheri, BKC, Lower Parel',          lat: 19.0657, lng: 72.8688, radiusKm: 10 },
  { id: 'south-mumbai',   label: 'South Mumbai',              sub: 'Colaba, Fort, Nariman Point',         lat: 18.9220, lng: 72.8347, radiusKm: 7  },
  { id: 'western-suburbs',label: 'Western Suburbs',           sub: 'Bandra, Juhu, Versova',               lat: 19.0549, lng: 72.8295, radiusKm: 8  },
  { id: 'central-mumbai', label: 'Central Mumbai',            sub: 'Dadar, Sion, Kurla',                  lat: 19.0178, lng: 72.8478, radiusKm: 6  },
  { id: 'thane',           label: 'Thane',                    sub: 'Thane City, Ghodbunder, Mira Road',   lat: 19.2183, lng: 72.9781, radiusKm: 12 },
  { id: 'lower-parel',    label: 'Lower Parel',               sub: 'Worli, Prabhadevi, Elphinstone',      lat: 19.0028, lng: 72.8311, radiusKm: 5  },
  { id: 'andheri',         label: 'Andheri / MIDC',           sub: 'Andheri East & West, Chakala',        lat: 19.1197, lng: 72.8685, radiusKm: 7  },
  { id: 'bkc',             label: 'Bandra Kurla Complex',     sub: 'BKC, Kurla, Kalina',                  lat: 19.0657, lng: 72.8688, radiusKm: 5  },
  { id: 'borivali',        label: 'Borivali / Dahisar',       sub: 'Borivali, Kandivali, Dahisar',        lat: 19.2307, lng: 72.8567, radiusKm: 8  },
];

export function App() {
  const [role, setRole] = useState('seeker'); // 'seeker' | 'provider'
  const [listings, setListings] = useState(bookingEngineInstance.getListings());
  const [requests, setRequests] = useState(bookingEngineInstance.getRequests());
  const [selectedZone, setSelectedZone] = useState(MUMBAI_ZONES[0]); // Default: Navi Mumbai

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [maxRadiusKm, setMaxRadiusKm] = useState(10);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'list' | 'map'

  // Modals & Overlays
  const [selectedListingForModal, setSelectedListingForModal] = useState(null);
  const [aiLogisticsData, setAiLogisticsData] = useState(null); // { listing, request }
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Subscribe to real-time engine changes (holds, counters, expirations)
  useEffect(() => {
    const unsubscribe = bookingEngineInstance.subscribe(({ listings: updatedListings, requests: updatedRequests }) => {
      setListings([...updatedListings]);
      setRequests([...updatedRequests]);
    });
    return unsubscribe;
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleHoldCreated = (newRequest) => {
    showToast(`Atomic 15-min Hold Created! Hold ID: ${newRequest.holdId}. Decremented inventory instantly.`);
  };

  const handleTriggerLogisticsModal = (listing, request) => {
    setAiLogisticsData({ listing, request });
  };

  const handleDispatchSelected = (vendor) => {
    showToast(`Third-party partner dispatched: ${vendor.name} (ETA: ${vendor.etaMins} mins). Status updated to In-Transit.`);
    setIsTrackerOpen(true);
  };

  return (
    <div className="app-container">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="app-toast-alert">
          <span>⚡</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Global Navigation Header */}
      <Header
        currentRole={role}
        onToggleRole={setRole}
        activeRequests={requests}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        activeNotificationCount={requests.filter(r => r.status === 'HOLD_PENDING').length}
        selectedZone={selectedZone}
        onChangeZone={setSelectedZone}
        zones={MUMBAI_ZONES}
      />

      {/* Conditional View by Role */}
      {role === 'seeker' ? (
        <>
          {/* Sticky Filter Bar */}
          <FilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            maxRadiusKm={maxRadiusKm}
            onChangeRadius={setMaxRadiusKm}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            totalResultsCount={listings.length}
          />

          {/* Discovery View (Split Map + Cards) */}
          <DiscoveryView
            listings={listings}
            selectedCategory={selectedCategory}
            maxRadiusKm={maxRadiusKm}
            maxPrice={maxPrice}
            viewMode={viewMode}
            selectedZone={selectedZone}
            onSelectListing={(listing) => setSelectedListingForModal(listing)}
          />
        </>
      ) : (
        /* Provider Dashboard View */
        <ProviderDashboard
          listings={listings}
          requests={requests}
          onOpenCreateListing={() => setIsCreateListingOpen(true)}
          onOpenTracker={() => setIsTrackerOpen(true)}
        />
      )}

      {/* PDP Listing Detail Modal */}
      {selectedListingForModal && (
        <ListingDetailModal
          listing={selectedListingForModal}
          onClose={() => setSelectedListingForModal(null)}
          onHoldCreated={handleHoldCreated}
          onTriggerLogisticsModal={handleTriggerLogisticsModal}
        />
      )}

      {/* AI Logistics Recommendation Modal */}
      {aiLogisticsData && (
        <UrgentAILogisticsModal
          listing={aiLogisticsData.listing}
          request={aiLogisticsData.request}
          onClose={() => setAiLogisticsData(null)}
          onDispatchSelected={handleDispatchSelected}
        />
      )}

      {/* Provider Create Listing Modal */}
      {isCreateListingOpen && (
        <CreateListingModal
          onClose={() => setIsCreateListingOpen(false)}
          onListingCreated={(newListing) => {
            showToast(`Resource Published! "${newListing.title}" is now discoverable on the map.`);
          }}
        />
      )}

      {/* Transaction Tracker Stepper Modal */}
      {isTrackerOpen && (
        <TransactionTrackerModal
          requests={requests}
          onClose={() => setIsTrackerOpen(false)}
          onTriggerLogistics={handleTriggerLogisticsModal}
        />
      )}
    </div>
  );
}
export default App;
