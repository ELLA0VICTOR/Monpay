import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal, TrendingUp, Users, Calendar, DollarSign, FileText } from 'lucide-react';

export default function SearchFilter({ onSearch, onFilter, totalCount = 0 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'popular',
    priceRange: 'all',
    contentType: 'all',
    hasContent: false
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      sortBy: 'popular',
      priceRange: 'all',
      contentType: 'all',
      hasContent: false
    };
    setFilters(defaultFilters);
    onFilter?.(defaultFilters);
    setSearchTerm('');
    onSearch?.('');
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy') return value !== 'popular';
    if (typeof value === 'boolean') return value;
    return value !== 'all';
  }).length;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-dimmed" />
            <input
              type="text"
              placeholder="Search creators, plans, or content..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="input pl-12 pr-4"
            />
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-dimmed hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary px-4 py-3 relative ${showFilters ? 'bg-accent/10 text-accent' : ''}`}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {(searchTerm || activeFilterCount > 0) && (
              <button
                onClick={clearFilters}
                className="btn-secondary px-4 py-3 text-error border-error/30 hover:bg-error/10"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <p className="text-sm text-text-muted">
            {totalCount} creators found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5 text-accent" />
              Advanced Filters
            </h3>
            <button
              onClick={() => setShowFilters(false)}
              className="p-2 hover:bg-card-hover rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Sort By */}
            <div>
              {/* Changed from "block ... items-center" to "flex items-center gap-2" to avoid block+flex conflict */}
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span>Sort By</span>
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="input w-full"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="subscribers">Most Subscribers</option>
                <option value="content">Most Content</option>
                <option value="revenue">Highest Revenue</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              {/* same fix here */}
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <DollarSign className="w-4 h-4 text-accent" />
                <span>Price Range</span>
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="input w-full"
              >
                <option value="all">All Prices</option>
                <option value="free">Free</option>
                <option value="0-1">0 - 1 WMON</option>
                <option value="1-5">1 - 5 WMON</option>
                <option value="5-10">5 - 10 WMON</option>
                <option value="10+">10+ WMON</option>
              </select>
            </div>

            {/* Content Type */}
            <div>
              {/* and here */}
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <FileText className="w-4 h-4 text-accent" />
                <span>Content Type</span>
              </label>
              <select
                value={filters.contentType}
                onChange={(e) => handleFilterChange('contentType', e.target.value)}
                className="input w-full"
              >
                <option value="all">All Types</option>
                <option value="video">Videos</option>
                <option value="article">Articles</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
              </select>
            </div>

            {/* Additional Filters */}
            <div>
              {/* This label should be flex because it contains icon + text */}
              <label className="flex items-center gap-2 text-sm font-medium mb-3">
                <Users className="w-4 h-4 text-accent" />
                <span>Other Filters</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasContent}
                    onChange={(e) => handleFilterChange('hasContent', e.target.checked)}
                    className="w-4 h-4 rounded border-border bg-transparent checked:bg-accent focus:ring-accent/50"
                  />
                  <span className="text-sm">Has Content</span>
                </label>
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
            <p className="text-sm text-text-muted">
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </p>
            <div className="flex gap-3">
              <button
                onClick={clearFilters}
                className="btn-secondary btn-sm"
              >
                Reset Filters
              </button>
              <button
                onClick={() => {
                  setShowFilters(false);
                  onFilter?.(filters);
                }}
                className="btn btn-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
