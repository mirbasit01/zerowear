'use client';

import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import SearchFilter, { SearchFilters } from '@/components/SearchFilter';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { EventFields } from '@/database/event.model';

interface EventsResponse {
  events: EventFields[];
  pagination?: {
    page: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const EventsPage = () => {
  const [events, setEvents] = useState<EventFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const fetchEvents = async (filters?: SearchFilters) => {
    try {
      setSearchLoading(true);
      
      let url = '/api/events';
      if (filters && Object.keys(filters).length > 0) {
        url = '/api/events/search?';
        const params = new URLSearchParams();
        
        if (filters.query) params.append('q', filters.query);
        if (filters.location) params.append('location', filters.location);
        if (filters.mode) params.append('mode', filters.mode);
        if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters.dateTo) params.append('dateTo', filters.dateTo);
        if (filters.tags && filters.tags.length > 0) {
          filters.tags.forEach(tag => params.append('tag', tag));
        }
        
        url += params.toString();
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data: EventsResponse = await response.json();
      setEvents(data.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const extractTags = (events: EventFields[]): string[] => {
    const tagSet = new Set<string>();
    events.forEach(event => {
      event.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setAvailableTags(extractTags(events));
    }
  }, [events]);

  const handleSearch = (filters: SearchFilters) => {
    fetchEvents(filters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Discover Amazing Events</h1>
          <p className="text-xl text-gray-600">Find hackathons, conferences, and meetups near you</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilter 
            onSearch={handleSearch} 
            isLoading={searchLoading}
            availableTags={availableTags}
          />
        </div>

        {/* Results */}
        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Events</h2>
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => fetchEvents()}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find any events matching your criteria. Try adjusting your search filters.
              </p>
              <button
                onClick={() => fetchEvents()}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Show All Events
              </button>
            </div>
          </div>
        ) : (
          <>
            {searchLoading && (
              <div className="flex justify-center mb-4">
                <LoadingSpinner />
                <span className="ml-2 text-gray-600">Searching...</span>
              </div>
            )}
            
            <div className="mb-4">
              <p className="text-gray-600">
                {events.length} event{events.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div key={event.slug} className="transform transition-transform hover:scale-105">
                  <EventCard {...event} />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Load More Button - you can implement pagination later */}
        {events.length > 0 && events.length >= 20 && (
          <div className="text-center mt-12">
            <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 transition-colors">
              Load More Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;