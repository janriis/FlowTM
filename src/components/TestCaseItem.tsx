import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, Calendar, ChevronDown, ChevronRight, ListChecks, Edit, MinusCircle } from 'lucide-react';
import { TestCase, TestStep } from '../types';
import TestStepList from './TestStepList';

interface TestCaseItemProps {
  testCase: TestCase;
  onUpdateStatus: (id: string, status: TestCase['status']) => void;
  onUpdateStepStatus: (testId: string, stepId: string, status: TestStep['status']) => void;
  onUpdateStepActualResult: (testId: string, stepId: string, actualResult: string) => void;
  onEdit: (testCase: TestCase) => void;
}

export default function TestCaseItem({ 
  testCase, 
  onUpdateStatus, 
  onUpdateStepStatus,
  onUpdateStepActualResult,
  onEdit
}: TestCaseItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    no_run: 'text-gray-400',
    pending: 'text-gray-400',
    passed: 'text-green-500',
    failed: 'text-red-500',
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-blue-100 text-blue-700',
  };

  const StatusIcon = {
    no_run: MinusCircle,
    pending: Clock,
    passed: CheckCircle2,
    failed: XCircle,
  }[testCase.status];

  const isOverdue = testCase.dueDate && new Date(testCase.dueDate) < new Date() && testCase.status === 'pending';

  return (
    <div className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <StatusIcon className={`h-5 w-5 ${statusColors[testCase.status]}`} />
              <h3 className="font-medium text-gray-900">{testCase.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[testCase.priority]}`}>
                {testCase.priority}
              </span>
              {isOverdue && (
                <span className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Overdue</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{testCase.description}</p>
            <div className="flex items-center space-x-4">
              {testCase.dueDate && (
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Due: {new Date(testCase.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-sm text-indigo-600 hover:text-indigo-700"
              >
                <ListChecks className="h-4 w-4" />
                <span>{testCase.steps.length} steps</span>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(testCase)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              title="Edit test case"
            >
              <Edit className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      {isExpanded && testCase.steps.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50">
          <TestStepList
            steps={testCase.steps}
            onUpdateStatus={(stepId, status) => onUpdateStepStatus(testCase.id, stepId, status)}
            onUpdateActualResult={(stepId, actualResult) => 
              onUpdateStepActualResult(testCase.id, stepId, actualResult)
            }
          />
        </div>
      )}
    </div>
  );
}