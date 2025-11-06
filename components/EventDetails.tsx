import Image from 'next/image';
import { EventFields } from '@/database/event.model';

interface EventDetailsProps {
  event: EventFields;
  onBookEvent?: () => void;
  isBookingLoading?: boolean;
  showBookingButton?: boolean;
}

const EventDetails = ({ event, onBookEvent, isBookingLoading, showBookingButton = true }: EventDetailsProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Event Image */}
      <div className="relative h-96 w-full">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
        <div className="absolute bottom-4 left-4 text-white">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          <p className="text-lg opacity-90">by {event.organizer}</p>
        </div>
      </div>

      <div className="p-8">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Image src="/icons/calendar.svg" alt="date" width={20} height={20} />
              <span className="ml-2 font-semibold text-gray-700">Date & Time</span>
            </div>
            <p className="text-gray-900">{formatDate(event.date)}</p>
            <p className="text-gray-600">{formatTime(event.time)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Image src="/icons/pin.svg" alt="location" width={20} height={20} />
              <span className="ml-2 font-semibold text-gray-700">Location</span>
            </div>
            <p className="text-gray-900">{event.venue}</p>
            <p className="text-gray-600">{event.location}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Image src="/icons/users.svg" alt="audience" width={20} height={20} />
              <span className="ml-2 font-semibold text-gray-700">Mode & Audience</span>
            </div>
            <p className="text-gray-900 capitalize">{event.mode}</p>
            <p className="text-gray-600">{event.audience}</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
          <p className="text-gray-700 leading-relaxed mb-4">{event.description}</p>
          <p className="text-gray-700 leading-relaxed">{event.overview}</p>
        </div>

        {/* Agenda */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Agenda</h2>
          <div className="space-y-2">
            {event.agenda.map((item, index) => (
              <div key={index} className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-1">
                  {index + 1}
                </span>
                <p className="text-gray-700 pt-1">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Organizer Info */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Organized by</h2>
          <p className="text-lg text-gray-700">{event.organizer}</p>
        </div>

        {/* Booking Button */}
        {showBookingButton && (
          <div className="text-center">
            <button
              onClick={onBookEvent}
              disabled={isBookingLoading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBookingLoading ? 'Booking...' : 'Book This Event'}
            </button>
          </div>
        )}

        {/* Event Meta Info */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Event created on {new Date(event.createdAt).toLocaleDateString()}</p>
          {event.updatedAt !== event.createdAt && (
            <p>Last updated on {new Date(event.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;