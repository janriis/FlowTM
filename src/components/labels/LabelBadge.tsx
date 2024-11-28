import React from 'react';
import { X } from 'lucide-react';

interface LabelBadgeProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export default function LabelBadge({ label, onRemove, className = '' }: LabelBadgeProps) {
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 ${className}`}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 inline-flex items-center justify-center hover:bg-indigo-200 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}