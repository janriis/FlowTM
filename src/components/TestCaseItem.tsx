import React, { useState } from 'react';
import { Clock, ChevronDown, ChevronRight, Edit2, MinusCircle } from 'lucide-react';
import { TestCase, TestSuite } from '../types';
import TestStepList from './TestStepList';
import LabelBadge from './labels/LabelBadge';
import AssigneeDisplay from './common/AssigneeDisplay';
import { formatDate } from '../utils/dateUtils';

interface TestCaseItemProps {
  testCase: TestCase;
  suites?: TestSuite[];
  showCheckbox?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onEdit: (testCase: TestCase) => void;
  onRemove?: () => void;
  showRemoveButton?: boolean;
  removeIcon?: React.ReactNode;
  removeButtonTitle?: string;
  removeButtonClass?: string;
}

export default function TestCaseItem({
  testCase,
  suites = [],
  showCheckbox = false,
  isSelected = false,
  onSelect,
  onEdit,
  onRemove,
  showRemoveButton = false,
  removeIcon,
  removeButtonTitle = "Remove",
  removeButtonClass = "text-gray-400 hover:text-red-500"
}: TestCaseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative border-b border-gray-100 dark:border-dark-border last:border-b-0 hover:bg-gray-50 dark:hover:bg-dark-lighter">
      <div className="flex items-start">
        {showCheckbox && (
          <div className="pl-4 pt-4 pr-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-dark-border rounded cursor-pointer"
            />
          </div>
        )}
        <div className={`flex-1 p-4`}>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{testCase.displayId}</span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{testCase.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  testCase.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                  testCase.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  {testCase.priority}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{testCase.description}</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Created: {formatDate(testCase.createdAt)}</span>
                </div>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center space-x-1 text-sm text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>{testCase.steps.length} steps</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {testCase.labels.map(label => (
                  <LabelBadge key={label} label={label} />
                ))}
                {testCase.assignee && (
                  <AssigneeDisplay assignee={testCase.assignee} />
                )}
                {suites.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Suites:</span>
                    {suites.map(suite => (
                      <span key={suite.id} className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full">
                        {suite.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(testCase)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title="Edit test case"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              {showRemoveButton && onRemove && (
                <button
                  onClick={onRemove}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark ${removeButtonClass}`}
                  title={removeButtonTitle}
                >
                  {removeIcon || <MinusCircle className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && testCase.steps.length > 0 && (
        <div className="border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark p-4">
          <TestStepList
            steps={testCase.steps}
            readOnly={true}
          />
        </div>
      )}
    </div>
  );
}