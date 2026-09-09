import React from 'react';
import { 
  Building2, 
  ChefHat, 
  Car, 
  Armchair, 
  Speaker, 
  Truck, 
  Grid, 
  MapPin,
  Layers,
  Map,
  List
} from 'lucide-react';
import { RESOURCE_CATEGORIES } from '../data/mockListings';

export function FilterBar({
  selectedCategory,
  onSelectCategory,
  maxRadiusKm,
  onChangeRadius,
  maxPrice,
  onChangeMaxPrice,
  viewMode,
  onChangeViewMode
}) {
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Building2': return <Building2 size={15} />;
      case 'ChefHat': return <ChefHat size={15} />;
      case 'Car': return <Car size={15} />;
      case 'Armchair': return <Armchair size={15} />;
      case 'Speaker': return <Speaker size={15} />;
      case 'Truck': return <Truck size={15} />;
      default: return <Grid size={15} />;
    }
  };

  return (
    <div className="filter-bar-sticky">
      <div className="filter-bar-inner">
        {/* Category Scroll Filter */}
        <div className="category-scroll-container">
          {RESOURCE_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                className={`category-filter-btn ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(cat.id)}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Layout Switcher */}
        <div className="filter-controls-group">
          {/* Radius Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} color="var(--text-muted)" />
            <select
              value={maxRadiusKm}
              onChange={(e) => onChangeRadius(Number(e.target.value))}
              className="select-filter-custom"
              title="Filter listings by distance"
            >
              <option value={3}>Within 3 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>All Mumbai (25 km)</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>₹</span>
            <select
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
              className="select-filter-custom"
              title="Filter by maximum price"
            >
              <option value={50000}>Any Price</option>
              <option value={2000}>Under ₹2,000</option>
              <option value={5000}>Under ₹5,000</option>
              <option value={15000}>Under ₹15,000</option>
              <option value={35000}>Under ₹35,000</option>
            </select>
          </div>

          {/* View Mode Toggle: Split vs Full List vs Full Map */}
          <div className="view-mode-toggle">
            <button 
              className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
              onClick={() => onChangeViewMode('split')}
              title="Split View: List & Map"
            >
              <Layers size={13} />
              <span>Split</span>
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => onChangeViewMode('list')}
              title="List View"
            >
              <List size={13} />
              <span>List</span>
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => onChangeViewMode('map')}
              title="Map View"
            >
              <Map size={13} />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
