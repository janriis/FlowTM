import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { TestCase } from '../types';
import LabelBadge from './labels/LabelBadge';

interface TestCaseSelectorProps {
  availableTestCases: TestCase[];
  onSelectTestCase: (testCaseId: string) => void;
  onClose: () => void;
}

export default function TestCaseSelector({
  availableTestCases,
  onSelectTestCase,
  onClose,
}: TestCaseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);

  const filteredTestCases = availableTestCases.filter(testCase => {
    const matchesSearch = searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleSelectTestCase = (testCaseId: string) => {
    onSelectTestCase(testCaseId);
    setSelectedTestCases([...selectedTestCases, testCaseId]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Add Test Cases</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              title="Close and save changes"
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
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div className="overflow-y-auto max-h-[60vh] border border-gray-200 rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredTestCases.map((testCase) => {
                const isSelected = selectedTestCases.includes(testCase.id);
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
                          <span className="text-sm font-medium text-gray-500">
                            {testCase.displayId}
                          </span>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {testCase.title}
                          </h4>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {testCase.description}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {testCase.labels.map(label => (
                            <LabelBadge key={label} label={label} />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectTestCase(testCase.id)}
                        className={`ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'text-white bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        {isSelected ? 'Added' : 'Add'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}