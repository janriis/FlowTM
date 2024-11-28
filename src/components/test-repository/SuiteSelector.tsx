import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { TestSuite } from '../../types';
import LabelBadge from '../labels/LabelBadge';

interface SuiteSelectorProps {
  availableSuites: TestSuite[];
  onSelectSuite: (suiteId: string) => void;
  onClose: () => void;
}

export default function SuiteSelector({
  availableSuites,
  onSelectSuite,
  onClose,
}: SuiteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuites = availableSuites.filter(suite =>
    suite.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add to Test Suite</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search test suites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredSuites.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No test suites found</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredSuites.map((suite) => (
                  <li
                    key={suite.id}
                    className="py-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectSuite(suite.id)}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{suite.name}</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {suite.labels.map(label => (
                          <LabelBadge key={label} label={label} />
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}