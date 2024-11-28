import React, { useState } from 'react';
import { PlayCircle, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, X } from 'lucide-react';
import { TestCase, TestStep, FlowRun } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { toast } from 'react-hot-toast';
import LabelBadge from '../labels/LabelBadge';

interface FlowRunExecutionProps {
  flowRun: FlowRun;
  testCase: TestCase;
  onUpdateStatus: (status: 'no_run' | 'pending' | 'passed' | 'failed') => void;
  onClose: () => void;
}

export default function FlowRunExecution({
  flowRun,
  testCase,
  onUpdateStatus,
  onClose,
}: FlowRunExecutionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState<TestStep[]>(testCase?.steps || []);
  const [isRunning, setIsRunning] = useState(false);

  const handleExit = () => {
    if (isRunning) {
      const confirmExit = window.confirm(
        'Test execution is in progress. Are you sure you want to exit? Any unsaved progress will be lost.'
      );
      if (!confirmExit) return;
      
      onUpdateStatus('no_run');
    }
    onClose();
  };

  const updateStepStatus = async (stepId: string, status: TestStep['status']) => {
    try {
      await supabaseService.updateTestStep(stepId, { status });
      
      setSteps(prevSteps => 
        prevSteps.map(step =>
          step.id === stepId ? { ...step, status } : step
        )
      );

      if (status === 'passed' && currentStepIndex !== null && currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      }

      const updatedSteps = steps.map(step => 
        step.id === stepId ? { ...step, status } : step
      );
      
      const allPassed = updatedSteps.every(step => step.status === 'passed');
      const anyFailed = updatedSteps.some(step => step.status === 'failed');
      const newStatus = allPassed ? 'passed' : anyFailed ? 'failed' : 'pending';
      
      if (status === 'failed' || (status === 'passed' && currentStepIndex === steps.length - 1)) {
        onUpdateStatus(newStatus);
        setIsRunning(false);
        setCurrentStepIndex(null);
      }

      toast.success(`Step marked as ${status}`);
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error('Failed to update step status');
    }
  };

  const updateStepResult = async (stepId: string, actualResult: string) => {
    try {
      await supabaseService.updateTestStep(stepId, { actualResult });
      setSteps(prevSteps =>
        prevSteps.map(step =>
          step.id === stepId ? { ...step, actualResult } : step
        )
      );
    } catch (error) {
      console.error('Error updating step result:', error);
      toast.error('Failed to update step result');
    }
  };

  const handleQuickStatus = async (status: 'passed' | 'failed') => {
    try {
      await Promise.all(
        steps.map(step => 
          supabaseService.updateTestStep(step.id, { status })
        )
      );
      
      setSteps(prevSteps =>
        prevSteps.map(step => ({ ...step, status }))
      );
      
      onUpdateStatus(status);
      setIsRunning(false);
      setCurrentStepIndex(null);
      
      toast.success(`Test case marked as ${status}`);
    } catch (error) {
      console.error('Error updating test case status:', error);
      toast.error('Failed to update test case status');
    }
  };

  const startExecution = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setIsExpanded(true);
    
    const resetSteps = steps.map(step => ({
      ...step,
      status: 'pending',
      actualResult: ''
    }));
    
    setSteps(resetSteps);
    onUpdateStatus('pending');
    toast.success('Test execution started');
  };

  if (!testCase || !testCase.steps) {
    return null;
  }

  const statusColors = {
    pending: 'text-gray-400',
    passed: 'text-green-500',
    failed: 'text-red-500',
  };

  const StatusIcon = {
    pending: Clock,
    passed: CheckCircle,
    failed: XCircle,
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {testCase.displayId}: {testCase.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                {testCase.labels?.map(label => (
                  <LabelBadge key={label} label={label} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={startExecution}
              disabled={isRunning}
              className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center space-x-1
                ${isRunning 
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              <PlayCircle className="h-4 w-4" />
              <span>Run Test</span>
            </button>
            <button
              onClick={() => handleQuickStatus('passed')}
              disabled={isRunning}
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Passed
            </button>
            <button
              onClick={() => handleQuickStatus('failed')}
              disabled={isRunning}
              className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Mark Failed
            </button>
            <button
              onClick={handleExit}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center space-x-1"
              title="Exit test execution"
            >
              <X className="h-4 w-4" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && steps.length > 0 && (
        <div className="p-4 space-y-4">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = StatusIcon[step.status];
              const isCurrent = index === currentStepIndex && isRunning;
              
              return (
                <div
                  key={step.id}
                  className={`p-4 rounded-lg border ${
                    isCurrent ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-grow">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500">
                          Step {index + 1}
                        </span>
                        <Icon className={`h-5 w-5 ${statusColors[step.status]}`} />
                        {isCurrent && (
                          <span className="text-sm font-medium text-indigo-600">
                            Current Step
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{step.description}</p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Expected:</span>{' '}
                        {step.expectedResult}
                      </p>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Actual Result
                        </label>
                        <textarea
                          value={step.actualResult || ''}
                          onChange={(e) => updateStepResult(step.id, e.target.value)}
                          disabled={!isRunning || index !== currentStepIndex}
                          className={`w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ${
                            !isRunning || index !== currentStepIndex ? 'bg-gray-50' : ''
                          }`}
                          rows={2}
                        />
                      </div>
                    </div>
                    {(isRunning && index === currentStepIndex) && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => updateStepStatus(step.id, 'passed')}
                          className="p-2 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600"
                          title="Mark step as passed"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateStepStatus(step.id, 'failed')}
                          className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600"
                          title="Mark step as failed"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
              placeholder="Add any additional notes about this test case execution..."
            />
          </div>
        </div>
      )}
    </div>
  );
}