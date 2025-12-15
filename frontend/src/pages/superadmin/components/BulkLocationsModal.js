import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';

const BulkLocationsModal = ({ onClose, onSubmit }) => {
  const [locationsText, setLocationsText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Parse locations from textarea (one per line)
    const lines = locationsText.split('\n').filter(line => line.trim());
    const locationsData = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        name: parts[0],
        type: parts[1] || 'city',
        country_code: parts[2] || ''
      };
    });
    
    onSubmit(locationsData);
  };

  const exampleData = `New York, city, US
Los Angeles, city, US
London, city, UK
United States, country, US
United Kingdom, country, UK`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Bulk Create Locations</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Locations Data</label>
            <textarea
              value={locationsText}
              onChange={(e) => setLocationsText(e.target.value)}
              rows={8}
              placeholder={exampleData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: Name, Type, Country Code (one per line)
            </p>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Create Locations
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BulkLocationsModal;
