import React, { useState } from 'react';
import { PlusCircle, FolderPlus } from 'lucide-react';
import { TestCase, TestSuite, TestStep } from '../types';
import TestSuiteComponent from './TestSuite';
import TestForm from './TestForm';
import NewSuiteForm from './NewSuiteForm';

export default function TestManagement() {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showSuiteForm, setShowSuiteForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | undefined>();

  const calculateTestCaseStatus = (steps: TestStep[]): TestCase['status'] => {
    if (steps.length === 0) return 'no_run';
    if (steps.every(step => step.status === 'pending')) return 'no_run';
    if (steps.some(step => step.status === 'failed')) return 'failed';
    if (steps.every(step => step.status === 'passed')) return 'passed';
    return 'pending';
  };

  const handleAddTestCase = (
    title: string,
    description: string,
    suiteId: string,
    priority: 'high' | 'medium' | 'low',
    dueDate: string | null,
    steps: Omit<TestStep, 'id' | 'status' | 'actualResult'>[]
  ) => {
    if (editingTestCase) {
      setTestCases(testCases.map(test => {
        if (test.id === editingTestCase.id) {
          const updatedSteps = steps.map((step, index) => ({
            ...step,
            id: test.steps[index]?.id || Math.random().toString(36).substr(2, 9),
            status: test.steps[index]?.status || 'pending',
            actualResult: test.steps[index]?.actualResult || ''
          }));
          return {
            ...test,
            title,
            description,
            suiteId,
            priority,
            dueDate,
            steps: updatedSteps,
            status: calculateTestCaseStatus(updatedSteps)
          };
        }
        return test;
      }));
      setEditingTestCase(undefined);
    } else {
      const newSteps = steps.map(step => ({
        ...step,
        id: Math.random().toString(36).substr(2, 9),
        status: 'pending',
        actualResult: ''
      }));
      const newTestCase: TestCase = {
        id: Date.now().toString(),
        title,
        description,
        status: 'no_run',
        suiteId,
        priority,
        dueDate,
        steps: newSteps
      };
      setTestCases([...testCases, newTestCase]);
    }
    setShowTestForm(false);
  };

  const handleEditTestCase = (testCase: TestCase) => {
    setEditingTestCase(testCase);
    setShowTestForm(true);
  };

  const handleAddSuite = (name: string) => {
    const newSuite: TestSuite = {
      id: Date.now().toString(),
      name,
      isExpanded: true,
    };
    setSuites([...suites, newSuite]);
    setShowSuiteForm(false);
  };

  const updateTestStepStatus = (testId: string, stepId: string, status: TestStep['status']) => {
    setTestCases(
      testCases.map((test) => {
        if (test.id === testId) {
          const updatedSteps = test.steps.map((step) =>
            step.id === stepId ? { ...step, status } : step
          );
          return {
            ...test,
            steps: updatedSteps,
            status: calculateTestCaseStatus(updatedSteps)
          };
        }
        return test;
      })
    );
  };

  const updateTestStepActualResult = (testId: string, stepId: string, actualResult: string) => {
    setTestCases(
      testCases.map((test) =>
        test.id === testId
          ? {
              ...test,
              steps: test.steps.map((step) =>
                step.id === stepId ? { ...step, actualResult } : step
              ),
            }
          : test
      )
    );
  };

  const toggleSuite = (suiteId: string) => {
    setSuites(
      suites.map((suite) =>
        suite.id === suiteId ? { ...suite, isExpanded: !suite.isExpanded } : suite
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Management</h2>
          <p className="text-sm text-gray-500 mt-1">Organize and track your test cases</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSuiteForm(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FolderPlus className="h-5 w-5 mr-2" />
            New Suite
          </button>
          <button
            onClick={() => {
              setEditingTestCase(undefined);
              setShowTestForm(true);
            }}
            disabled={suites.length === 0}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add Test Case
          </button>
        </div>
      </div>

      {showTestForm && (
        <TestForm
          onSubmit={handleAddTestCase}
          onClose={() => {
            setShowTestForm(false);
            setEditingTestCase(undefined);
          }}
          suites={suites}
          editingTestCase={editingTestCase}
        />
      )}

      {showSuiteForm && (
        <NewSuiteForm
          onSubmit={handleAddSuite}
          onClose={() => setShowSuiteForm(false)}
        />
      )}

      <div className="space-y-4">
        {suites.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <FolderPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Suites Yet</h3>
            <p className="text-gray-500">Create a test suite to start organizing your test cases.</p>
          </div>
        ) : (
          suites.map((suite) => (
            <TestSuiteComponent
              key={suite.id}
              id={suite.id}
              name={suite.name}
              testCases={testCases.filter((test) => test.suiteId === suite.id)}
              isExpanded={suite.isExpanded}
              onToggle={toggleSuite}
              onUpdateStepStatus={updateTestStepStatus}
              onUpdateStepActualResult={updateTestStepActualResult}
              onEditTestCase={handleEditTestCase}
            />
          ))
        )}
      </div>
    </div>
  );
}