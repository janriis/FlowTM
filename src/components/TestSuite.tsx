import React from 'react';
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { TestCase, TestStep } from '../types';
import TestCaseItem from './TestCaseItem';

interface TestSuiteProps {
  id: string;
  name: string;
  testCases: TestCase[];
  isExpanded: boolean;
  onToggle: (id: string) => void;
  onUpdateStepStatus: (testId: string, stepId: string, status: TestStep['status']) => void;
  onUpdateStepActualResult: (testId: string, stepId: string, actualResult: string) => void;
  onEditTestCase: (testCase: TestCase) => void;
}

export default function TestSuite({
  id,
  name,
  testCases,
  isExpanded,
  onToggle,
  onUpdateStepStatus,
  onUpdateStepActualResult,
  onEditTestCase,
}: TestSuiteProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => onToggle(id)}
        className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50"
      >
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-400" />
        )}
        <FolderOpen className="h-5 w-5 text-indigo-500" />
        <span className="font-medium text-gray-900">{name}</span>
        <span className="ml-auto text-sm text-gray-500">
          {testCases.length} tests
        </span>
      </button>
      
      {isExpanded && (
        <div className="border-t border-gray-100">
          {testCases.map((testCase) => (
            <TestCaseItem
              key={testCase.id}
              testCase={testCase}
              onUpdateStatus={() => {}}
              onUpdateStepStatus={onUpdateStepStatus}
              onUpdateStepActualResult={onUpdateStepActualResult}
              onEdit={onEditTestCase}
            />
          ))}
        </div>
      )}
    </div>
  );
}