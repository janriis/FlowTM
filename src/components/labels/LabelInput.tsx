import React, { useState, KeyboardEvent } from 'react';
import { Tag, Plus } from 'lucide-react';

interface LabelInputProps {
  onAddLabel: (label: string) => void;
  existingLabels?: string[];
  placeholder?: string;
}

export default function LabelInput({ 
  onAddLabel, 
  existingLabels = [], 
  placeholder = "Add label..." 
}: LabelInputProps) {
  const [input, setInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      const newLabel = input.trim().toLowerCase();
      if (!existingLabels.includes(newLabel)) {
        onAddLabel(newLabel);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInput('');
    }
  };

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Label
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Tag className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (!input.trim()) {
            setIsEditing(false);
          }
        }}
        autoFocus
        className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder={placeholder}
      />
    </div>
  );
}