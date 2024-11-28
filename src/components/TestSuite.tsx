import React from 'react';
import { FolderOpen, ChevronDown, ChevronRight, Trash2, Clock, Plus, MinusCircle } from 'lucide-react';
import { TestCase, TestStep, TestSuite } from '../types';
import TestCaseItem from './TestCaseItem';
import LabelBadge from './labels/LabelBadge';
import { formatDate } from '../utils/dateUtils';
import TestCaseSelector from './TestCaseSelector';

// Define the props interface for the TestSuite component
interface TestSuiteProps {
  suite: TestSuite;                    // Current test suite data
  testCases: TestCase[];              // List of test cases in this suite
  availableTestCases: TestCase[];     // List of test cases that can be added to this suite
  isExpanded: boolean;                // Controls if the suite content is visible
  onToggle: (id: string) => void;     // Function to expand/collapse the suite
  onUpdateStepStatus: (testId: string, stepId: string, status: TestStep['status']) => void;
  onUpdateStepActualResult: (testId: string, stepId: string, actualResult: string) => void;
  onEditTestCase: (testCase: TestCase) => void;  // Function to edit a test case
  onDeleteTestCase: (testCaseId: string) => void; // Function to delete a test case
  onDeleteSuite: () => void;          // Function to delete the entire suite
  onAddTestCase: (testCaseId: string) => void;   // Function to add a test case to the suite
  onRemoveTestCase: (testCaseId: string) => void; // Function to remove a test case from the suite
}

export default function TestSuiteComponent({
  suite,
  testCases,
  availableTestCases,
  isExpanded,
  onToggle,
  onUpdateStepStatus,
  onUpdateStepActualResult,
  onEditTestCase,
  onDeleteTestCase,
  onDeleteSuite,
  onAddTestCase,
  onRemoveTestCase,
}: TestSuiteProps) {
  // State to control the visibility of the test case selector modal
  const [showSelector, setShowSelector] = React.useState(false);

  return (
    // Main container for the test suite
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Header section with suite information and controls */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side with expand/collapse button and suite info */}
        <button
          onClick={() => onToggle(suite.id)}
          className="flex items-center space-x-3 hover:bg-gray-50 flex-grow"
        >
          {/* Expand/collapse chevron icon */}
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          
          {/* Suite icon */}
          <FolderOpen className="h-5 w-5 text-indigo-500" />
          
          {/* Suite details section */}
          <div className="flex flex-col">
            {/* Suite ID and name */}
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{suite.displayId}</span>
              <span className="font-medium text-gray-900">{suite.name}</span>
            </div>
            {/* Creation date */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>Created: {formatDate(suite.createdAt)}</span>
            </div>
          </div>
          
          {/* Labels and test count */}
          <div className="flex items-center space-x-2 ml-4">
            {/* Display all labels assigned to the suite */}
            {suite.labels.map(label => (
              <LabelBadge key={label} label={label} />
            ))}
            {/* Show total number of test cases */}
            <span className="text-sm text-gray-500">
              {testCases.length} tests
            </span>
          </div>
        </button>

        {/* Right side action buttons */}
        <div className="flex items-center space-x-2">
          {/* Add test cases button */}
          <button
            onClick={() => setShowSelector(true)}
            className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-gray-100"
            title="Add test cases"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          {/* Delete suite button */}
          <button
            onClick={onDeleteSuite}
            className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100"
            title="Delete suite"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {/* Test cases list - only shown when suite is expanded */}
      {isExpanded && (
        <div className="border-t border-black-100">
          {/* Map through test cases and render each one */}
          {testCases.map((testCase) => (
            <TestCaseItem
              key={testCase.id}
              testCase={testCase}
              onEdit={onEditTestCase}
              onRemove={() => onRemoveTestCase(testCase.id)}
              showRemoveButton={true}
              removeIcon={<MinusCircle className="h-5 w-5" />}
              removeButtonTitle="Remove from suite"
              removeButtonClass="text-gray-400 hover:text-indigo-600"
            />
          ))}
          
          {/* Empty state message when no test cases exist */}
          {testCases.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No test cases in this suite. Click the + button to add test cases.
            </div>
          )}
        </div>
      )}

      {/* Test case selector modal */}
      {showSelector && (
        <TestCaseSelector
          availableTestCases={availableTestCases}
          onSelectTestCase={onAddTestCase}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}