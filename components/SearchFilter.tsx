'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SearchFilterProps {
  onSearch: (filters: SearchFilters) => void;
  isLoading?: boolean;
  availableTags?: string[];
}

export interface SearchFilters {
  query?: string;
  location?: string;
  mode?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

const SearchFilter = ({ onSearch, isLoading, availableTags = [] }: SearchFilterProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    mode: '',
    tags: [],
    dateFrom: '',
    dateTo: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags?.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...(prev.tags || []), tag]
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Clean up empty values
    const cleanedFilters: SearchFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'tags' && Array.isArray(value) && value.length > 0) {
        cleanedFilters[key as keyof SearchFilters] = value as any;
      } else if (typeof value === 'string' && value.trim()) {
        cleanedFilters[key as keyof SearchFilters] = value as any;
      }
    });

    onSearch(cleanedFilters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      location: '',
      mode: '',
      tags: [],
      dateFrom: '',
      dateTo: ''
    };
    setFilters(resetFilters);
    onSearch({});
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      return typeof value === 'string' && value.trim() !== '';
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Image src="/icons/search.svg" alt="search" width={16} height={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            name="query"
            value={filters.query}
            onChange={handleInputChange}
            placeholder="Search events by title, description, or organizer..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Quick Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={filters.location}
              onChange={handleInputChange}
              placeholder="e.g., San Francisco, Online"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
              Mode
            </label>
            <select
              id="mode"
              name="mode"
              value={filters.mode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All modes</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        filters.tags?.includes(tag)
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                {filters.tags && filters.tags.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Searching...
              </>
            ) : (
              <>
                <Image src="/icons/search.svg" alt="search" width={16} height={16} className="mr-2" />
                Search Events
              </>
            )}
          </button>

          {hasActiveFilters() && (
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Active filters summary */}
        {hasActiveFilters() && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Active filters: </span>
            {filters.query && <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">"{filters.query}"</span>}
            {filters.location && <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-1">{filters.location}</span>}
            {filters.mode && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-1">{filters.mode}</span>}
            {filters.tags && filters.tags.length > 0 && (
              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded mr-1">
                {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''}
              </span>
            )}
            {(filters.dateFrom || filters.dateTo) && (
              <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded mr-1">
                Date range
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchFilter;