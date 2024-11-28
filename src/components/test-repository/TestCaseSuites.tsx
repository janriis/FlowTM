import React from 'react';
import { FolderPlus, X } from 'lucide-react';
import { TestSuite } from '../../types';
import LabelBadge from '../labels/LabelBadge';

interface TestCaseSuitesProps {
  suites: TestSuite[];
  onAddToSuite: () => void;
  onRemoveFromSuite: (suiteId: string) => void;
}

export default function TestCaseSuites({ 
  suites = [], // Provide default empty array
  onAddToSuite, 
  onRemoveFromSuite 
}: TestCaseSuitesProps) {
  if (!suites || suites.length === 0) {
    return (
      <button
        onClick={onAddToSuite}
        className="inline-flex items-center px-2 py-1 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <FolderPlus className="h-4 w-4 mr-1" />
        Add to Suite
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Test Suites:</span>
        <button
          onClick={onAddToSuite}
          className="inline-flex items-center px-2 py-1 text-sm text-indigo-600 hover:text-indigo-700"
        >
          <FolderPlus className="h-4 w-4 mr-1" />
          Add to Suite
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {suites.map(suite => (
          <div
            key={suite.id}
            className="inline-flex items-center bg-indigo-50 text-indigo-700 rounded-full px-2 py-1 text-xs"
          >
            <span className="mr-1">{suite.name}</span>
            <button
              onClick={() => onRemoveFromSuite(suite.id)}
              className="p-0.5 hover:bg-indigo-100 rounded-full"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}