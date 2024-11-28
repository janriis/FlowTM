import React, { useState, useRef, useEffect } from 'react';
import { Tag, Search } from 'lucide-react';
import LabelBadge from './LabelBadge';

interface LabelFilterProps {
  availableLabels: string[];
  selectedLabels: string[];
  onSelectLabel: (label: string) => void;
  onRemoveLabel: (label: string) => void;
}

export default function LabelFilter({
  availableLabels,
  selectedLabels,
  onSelectLabel,
  onRemoveLabel,
}: LabelFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLabels = availableLabels
    .filter(label => 
      !selectedLabels.includes(label) && 
      label.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(true);
  };

  const handleSelectLabel = (label: string) => {
    onSelectLabel(label);
    setSearchQuery('');
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Tag className="h-4 w-4 text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Filter by Labels</span>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedLabels.map((label) => (
          <LabelBadge
            key={label}
            label={label}
            onRemove={() => onRemoveLabel(label)}
          />
        ))}
      </div>

      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search labels..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {isOpen && filteredLabels.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200">
            <ul className="py-1 max-h-48 overflow-auto">
              {filteredLabels.map((label) => (
                <li
                  key={label}
                  onClick={() => handleSelectLabel(label)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  {label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}