import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, Edit2 } from 'lucide-react';
import { TestStep } from '../types';

interface TestStepListProps {
  steps: TestStep[];
  onUpdateStatus: (stepId: string, status: TestStep['status']) => void;
  onUpdateActualResult: (stepId: string, actualResult: string) => void;
}

export default function TestStepList({ steps, onUpdateStatus, onUpdateActualResult }: TestStepListProps) {
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [tempActualResult, setTempActualResult] = useState('');

  const statusColors = {
    pending: 'text-gray-400',
    passed: 'text-green-500',
    failed: 'text-red-500',
  };

  const StatusIcon = {
    pending: Clock,
    passed: CheckCircle2,
    failed: XCircle,
  };

  const handleEdit = (step: TestStep) => {
    setEditingStepId(step.id);
    setTempActualResult(step.actualResult || '');
  };

  const handleSave = (stepId: string) => {
    onUpdateActualResult(stepId, tempActualResult);
    setEditingStepId(null);
  };

  return (
    <div className="divide-y divide-gray-100">
      {steps.map((step, index) => {
        const Icon = StatusIcon[step.status];
        const isEditing = editingStepId === step.id;

        return (
          <div key={step.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-grow mr-4">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">Step {index + 1}</span>
                  <Icon className={`h-5 w-5 ${statusColors[step.status]}`} />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">{step.description}</p>
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Expected:</span> {step.expectedResult}
                  </p>
                  <div className="text-sm">
                    <span className="font-medium text-gray-500">Actual:</span>
                    {isEditing ? (
                      <div className="mt-1 flex items-end gap-2">
                        <textarea
                          value={tempActualResult}
                          onChange={(e) => setTempActualResult(e.target.value)}
                          className="flex-grow rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                          rows={2}
                          placeholder="Enter actual result"
                        />
                        <button
                          onClick={() => handleSave(step.id)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="group relative mt-1">
                        <p className="text-gray-700 min-h-[1.5rem]">
                          {step.actualResult || 'No result recorded'}
                        </p>
                        <button
                          onClick={() => handleEdit(step)}
                          className="absolute -right-6 top-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onUpdateStatus(step.id, 'passed')}
                  className={`p-2 rounded-full transition-colors ${
                    step.status === 'passed'
                      ? 'bg-green-100 text-green-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onUpdateStatus(step.id, 'failed')}
                  className={`p-2 rounded-full transition-colors ${
                    step.status === 'failed'
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-gray-100 text-gray-400'
                  }`}
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}