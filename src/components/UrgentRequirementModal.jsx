import React, { useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Loader2, MapPin, PackageSearch, Siren, X } from 'lucide-react';
import { bookingEngineInstance } from '../services/bookingEngine';
import { GeminiService } from '../services/geminiService';

function haversineKm(lat1, lng1, lat2, lng2) {
  const earthRadiusKm = 6371;
  const latitudeDelta = ((lat2 - lat1) * Math.PI) / 180;
  const longitudeDelta = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos((lat1 * Math.PI) / 180)
      * Math.cos((lat2 * Math.PI) / 180)
      * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getAvailableQuantity(listing) {
  return Math.max(...listing.slots.map(slot => slot.availableQty), 0);
}

function getBestSlot(listing, requestedDate) {
  const dateMatch = requestedDate && requestedDate !== 'today'
    ? listing.slots.find(slot => slot.date === requestedDate && slot.availableQty > 0)
    : null;
  return dateMatch || listing.slots.find(slot => slot.availableQty > 0);
}

export function UrgentRequirementModal({ listings, selectedZone, onClose, onHoldCreated, onOpenLogistics }) {
  const [requirement, setRequirement] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(null);

  const selectedMatch = useMemo(
    () => matches.find(match => match.listing.id === selectedMatchId) || matches[0],
    [matches, selectedMatchId]
  );

  const findMatches = async (event) => {
    event.preventDefault();
    if (!requirement.trim()) return;

    setIsSearching(true);
    setErrorMessage('');
    try {
      const parsed = await GeminiService.parseSeekerRequirement(requirement, listings);
      const requestedQuantity = Number(parsed.requestedQuantity) || 1;
      const rankedMatches = listings
        .map(listing => {
          const bestSlot = getBestSlot(listing, parsed.requiredDate);
          const availableQuantity = getAvailableQuantity(listing);
          const distanceKm = selectedZone
            ? haversineKm(selectedZone.lat, selectedZone.lng, listing.location.lat, listing.location.lng)
            : listing.location.distanceKm;
          const categoryFit = parsed.detectedCategory === 'all' || parsed.detectedCategory === listing.category;
          const quantityFit = availableQuantity >= requestedQuantity || requestedQuantity === 1;
          const aiRank = parsed.recommendedListingIds?.indexOf(listing.id) ?? -1;

          return {
            listing,
            bestSlot,
            availableQuantity,
            distanceKm,
            categoryFit,
            quantityFit,
            score: (bestSlot ? 1000 : 0)
              + (quantityFit ? 300 : 0)
              + (categoryFit ? 180 : 0)
              + (listing.urgentFulfillment ? 100 : 0)
              + (aiRank >= 0 ? 80 - aiRank : 0)
              - distanceKm * 8
          };
        })
        .filter(match => match.bestSlot && match.categoryFit)
        .sort((left, right) => right.score - left.score)
        .slice(0, 3);

      setAiResult({ ...parsed, requestedQuantity });
      setMatches(rankedMatches);
      setSelectedMatchId(rankedMatches[0]?.listing.id || null);
      if (rankedMatches.length === 0) {
        setErrorMessage('No live slot matches this urgent request right now. Try a broader location or a smaller quantity.');
      }
    } catch (error) {
      setErrorMessage('The urgent matcher could not complete this request. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRequestNow = () => {
    if (!selectedMatch?.bestSlot) return;
    const requestedQuantity = Math.min(aiResult.requestedQuantity || 1, selectedMatch.bestSlot.availableQty);
    const result = bookingEngineInstance.createBookingHold({
      resourceId: selectedMatch.listing.id,
      slotId: selectedMatch.bestSlot.id,
      requestedQty: requestedQuantity,
      seekerName: 'Grand Horizon Hospitality Ltd.',
      seekerContact: 'Urgent Operations Desk (+91 98200 11990)',
      unitPrice: selectedMatch.listing.pricing.amount,
      notes: `URGENT request: ${requirement}`,
      isUrgent: true,
      expectedVersion: selectedMatch.bestSlot.version
    });

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    onHoldCreated(result.request);
    onOpenLogistics(selectedMatch.listing, result.request);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="urgent-modal" onClick={event => event.stopPropagation()}>
        <button className="modal-close-icon" onClick={onClose} title="Close urgent search">
          <X size={18} />
        </button>

        <div className="urgent-modal-header">
          <div className="urgent-kicker"><Siren size={14} /> URGENT MATCH</div>
          <h2>Need something immediately?</h2>
          <p>Tell Gridora what is missing. We will prioritize live capacity, proximity, quantity fit, and fastest fulfillment.</p>
        </div>

        <form className="urgent-search-form" onSubmit={findMatches}>
          <label htmlFor="urgent-requirement">Describe your urgent requirement</label>
          <textarea
            id="urgent-requirement"
            value={requirement}
            onChange={event => setRequirement(event.target.value)}
            placeholder="I urgently need 200 banquet chairs and a sound system for an event tonight in Andheri..."
            rows={4}
            disabled={isSearching}
          />
          <button className="btn-primary-red urgent-submit-btn" type="submit" disabled={isSearching || !requirement.trim()}>
            {isSearching ? <><Loader2 size={16} className="animate-spin" /> Finding fastest option...</> : <><Siren size={16} /> Find Fastest Option</>}
          </button>
        </form>

        {errorMessage && (
          <div className="urgent-error-state"><AlertCircle size={16} /><span>{errorMessage}</span></div>
        )}

        {aiResult && matches.length > 0 && (
          <div className="urgent-results">
            <div className="urgent-result-heading">
              <div>
                <span className="urgent-result-label">AI PRIORITY LIST</span>
                <h3>{aiResult.summary || 'Fastest live options for your requirement'}</h3>
              </div>
              <span className="urgent-status-pill"><CheckCircle2 size={13} /> Urgency understood</span>
            </div>

            <div className="urgent-match-list">
              {matches.map(match => {
                const isSelected = selectedMatch?.listing.id === match.listing.id;
                return (
                  <button
                    type="button"
                    key={match.listing.id}
                    className={`urgent-match-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedMatchId(match.listing.id)}
                  >
                    <div className="urgent-match-image-wrap"><img src={match.listing.images[0]} alt="" /></div>
                    <div className="urgent-match-content">
                      <strong>{match.listing.title}</strong>
                      <span><MapPin size={13} /> {match.listing.location.zone} · {match.distanceKm.toFixed(1)} km away</span>
                      <span><PackageSearch size={13} /> {match.availableQuantity} units available · {match.bestSlot.date} {match.bestSlot.time}</span>
                    </div>
                    <div className="urgent-match-price">
                      <strong>{match.listing.pricing.currency}{match.listing.pricing.amount.toLocaleString()}</strong>
                      <span>per {match.listing.pricing.unit}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="urgent-fastest-note">
              <Clock3 size={17} />
              <div><strong>Fastest practical option:</strong> {selectedMatch.listing.title} is live nearby with {selectedMatch.availableQuantity} units available. Gridora will now rank the quickest logistics partner.</div>
            </div>

            <button className="btn-primary-red urgent-request-btn" type="button" onClick={handleRequestNow}>
              <span>Request Now: {selectedMatch.listing.title}</span><ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}