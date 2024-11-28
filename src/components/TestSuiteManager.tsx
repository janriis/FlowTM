import React, { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { TestCase, TestSuite } from '../types';
import SuiteTestCaseSelector from './SuiteTestCaseSelector';

interface TestSuiteManagerProps {
  suite: TestSuite;
  testCases: TestCase[];
  availableTestCases: TestCase[];
  onAddTestCase: (testCaseId: string) => void;
  onRemoveTestCase: (testCaseId: string) => void;
}

export default function TestSuiteManager({
  suite,
  testCases,
  availableTestCases,
  onAddTestCase,
  onRemoveTestCase,
}: TestSuiteManagerProps) {
  const [showSelector, setShowSelector] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{suite.name}</h3>
          <p className="text-sm text-gray-500">{testCases.length} test cases</p>
        </div>
        <button
          onClick={() => setShowSelector(true)}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Test Cases
        </button>
      </div>

      {showSelector && (
        <SuiteTestCaseSelector
          availableTestCases={availableTestCases}
          selectedTestCaseIds={testCases.map(tc => tc.id)}
          onAddTestCase={onAddTestCase}
          onRemoveTestCase={onRemoveTestCase}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}