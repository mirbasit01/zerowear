'use client';

import { useState } from 'react';
import Image from 'next/image';

interface EventFormProps {
  initialData?: {
    title?: string;
    description?: string;
    overview?: string;
    venue?: string;
    location?: string;
    date?: string;
    time?: string;
    mode?: string;
    audience?: string;
    agenda?: string[];
    organizer?: string;
    tags?: string[];
  };
  onSubmit: (data: FormData) => Promise<void>;
  isLoading?: boolean;
}

const EventForm = ({ initialData, onSubmit, isLoading }: EventFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    overview: initialData?.overview || '',
    venue: initialData?.venue || '',
    location: initialData?.location || '',
    date: initialData?.date || '',
    time: initialData?.time || '',
    mode: initialData?.mode || 'offline',
    audience: initialData?.audience || '',
    agenda: initialData?.agenda?.join('\n') || '',
    organizer: initialData?.organizer || '',
    tags: initialData?.tags?.join(', ') || '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const form = new FormData();
    const formElements = e.currentTarget.elements as HTMLFormControlsCollection;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'agenda') {
        const agendaItems = value.split('\n').map(item => item.trim()).filter(Boolean);
        form.append(key, JSON.stringify(agendaItems));
      } else if (key === 'tags') {
        const tagItems = value.split(',').map(item => item.trim()).filter(Boolean);
        form.append(key, JSON.stringify(tagItems));
      } else {
        form.append(key, value);
      }
    });

    const imageInput = formElements.namedItem('image') as HTMLInputElement;
    if (imageInput?.files?.[0]) {
      form.append('image', imageInput.files[0]);
    }

    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold text-gray-900">
        {initialData ? 'Edit Event' : 'Create New Event'}
      </h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
            Organizer *
          </label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            value={formData.organizer}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Overview */}
      <div>
        <label htmlFor="overview" className="block text-sm font-medium text-gray-700 mb-1">
          Overview *
        </label>
        <textarea
          id="overview"
          name="overview"
          value={formData.overview}
          onChange={handleInputChange}
          rows={3}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Location & Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
            Venue *
          </label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Location *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Date, Time & Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
            Time *
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
            Mode *
          </label>
          <select
            id="mode"
            name="mode"
            value={formData.mode}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
      </div>

      {/* Audience */}
      <div>
        <label htmlFor="audience" className="block text-sm font-medium text-gray-700 mb-1">
          Target Audience *
        </label>
        <input
          type="text"
          id="audience"
          name="audience"
          value={formData.audience}
          onChange={handleInputChange}
          required
          placeholder="e.g., Developers, Students, Entrepreneurs"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Agenda */}
      <div>
        <label htmlFor="agenda" className="block text-sm font-medium text-gray-700 mb-1">
          Agenda * <span className="text-sm text-gray-500">(one item per line)</span>
        </label>
        <textarea
          id="agenda"
          name="agenda"
          value={formData.agenda}
          onChange={handleInputChange}
          rows={5}
          required
          placeholder="Opening remarks&#10;Keynote presentation&#10;Panel discussion&#10;Networking session"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags * <span className="text-sm text-gray-500">(comma separated)</span>
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          required
          placeholder="technology, networking, startup, hackathon"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Event Image *
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleImageChange}
          required={!initialData}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {imagePreview && (
          <div className="mt-2">
            <Image
              src={imagePreview}
              alt="Preview"
              width={200}
              height={150}
              className="rounded-md object-cover"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Saving...' : (initialData ? 'Update Event' : 'Create Event')}
      </button>
    </form>
  );
};

export default EventForm;