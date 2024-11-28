import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { TestCase } from '../types';
import LabelFilter from './labels/LabelFilter';
import { labelService } from '../services/labelService';
import LabelBadge from './labels/LabelBadge';

interface SuiteTestCaseSelectorProps {
  availableTestCases: TestCase[];
  selectedTestCaseIds: string[];
  onAddTestCase: (testCaseId: string) => void;
  onRemoveTestCase: (testCaseId: string) => void;
  onClose: () => void;
}

export default function SuiteTestCaseSelector({
  availableTestCases,
  selectedTestCaseIds,
  onAddTestCase,
  onRemoveTestCase,
  onClose,
}: SuiteTestCaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const availableLabels = labelService.getUniqueLabels(availableTestCases);

  const filteredTestCases = availableTestCases.filter(testCase => {
    const matchesSearch = searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLabels = selectedLabels.length === 0 ||
      selectedLabels.some(label => testCase.labels.includes(label));
    
    return matchesSearch && matchesLabels;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Add Test Cases to Suite</h3>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              {filteredTestCases.map((testCase) => {
                const isSelected = selectedTestCaseIds.includes(testCase.id);
                return (
                  <li
                    key={testCase.id}
                    className={`p-4 hover:bg-gray-50 ${
                      isSelected ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {testCase.title}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {testCase.labels.map((label) => (
                              <LabelBadge key={label} label={label} />
                            ))}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {testCase.description}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          isSelected
                            ? onRemoveTestCase(testCase.id)
                            : onAddTestCase(testCase.id)
                        }
                        className={`ml-4 inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded-md ${
                          isSelected
                            ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            : 'border-transparent text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isSelected ? 'Remove' : 'Add'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}