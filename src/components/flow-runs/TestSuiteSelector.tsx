import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { TestSuite } from '../../types';
import LabelFilter from '../labels/LabelFilter';
import { labelService } from '../../services/labelService';
import LabelBadge from '../labels/LabelBadge';

interface TestSuiteSelectorProps {
  availableTestSuites: TestSuite[];
  onSelectTestSuite: (suiteId: string) => void;
  onClose: () => void;
}

export default function TestSuiteSelector({
  availableTestSuites,
  onSelectTestSuite,
  onClose,
}: TestSuiteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const availableLabels = labelService.getUniqueLabels(availableTestSuites);

  const filteredTestSuites = availableTestSuites.filter(suite => {
    const matchesSearch = searchQuery === '' ||
      suite.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLabels = selectedLabels.length === 0 ||
      selectedLabels.some(label => suite.labels.includes(label));
    
    return matchesSearch && matchesLabels;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-border bg-white dark:bg-dark">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add Test Suite</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search test suites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-md leading-5 bg-white dark:bg-dark-lighter placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>

          <LabelFilter
            availableLabels={availableLabels}
            selectedLabels={selectedLabels}
            onSelectLabel={(label) => setSelectedLabels([...selectedLabels, label])}
            onRemoveLabel={(label) =>
              setSelectedLabels(selectedLabels.filter((l) => l !== label))
            }
          />

          <div className="overflow-y-auto max-h-[50vh] border border-gray-200 rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTestSuites.map((suite) => (
                <li
                  key={suite.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-dark-lighter border-b dark:border-dark-border last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {suite.displayId}
                        </span>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {suite.name}
                        </h4>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suite.labels.map(label => (
                          <LabelBadge key={label} label={label} />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectTestSuite(suite.id)}
                      className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                    >
                      Add Suite
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}