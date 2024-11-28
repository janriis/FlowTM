import React, { useState, useEffect } from 'react';
import { PlusCircle, FolderPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TestCase, TestSuite, TestStep } from '../types';
import TestSuiteComponent from './TestSuite';
import TestForm from './TestForm';
import NewSuiteForm from './NewSuiteForm';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { labelService } from '../services/labelService';

export default function TestSuites() {
  const { user } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [suites, setSuites] = useState<TestSuite[]>([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showSuiteForm, setShowSuiteForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [suitesData, casesData] = await Promise.all([
        supabaseService.getTestSuites(user!.id),
        supabaseService.getTestCases(user!.id),
      ]);

      // Transform test cases
      const transformedCases: TestCase[] = await Promise.all(
        casesData.map(async caseData => {
          const steps = await supabaseService.getTestSteps(caseData.id);
          return {
            id: caseData.id,
            displayId: caseData.display_id || '',
            title: caseData.title,
            description: caseData.description || '',
            status: caseData.status,
            priority: caseData.priority,
            labels: caseData.labels || [],
            createdAt: caseData.created_at,
            updatedAt: caseData.updated_at,
            steps: steps.map(step => ({
              id: step.id,
              description: step.description,
              expectedResult: step.expected_result,
              actualResult: step.actual_result || '',
              status: step.status,
            })),
          };
        })
      );

      // Transform suites
      const transformedSuites: TestSuite[] = await Promise.all(
        suitesData.map(async suite => {
          const suiteTestCaseIds = await supabaseService.getSuiteTestCases(suite.id);
          return {
            id: suite.id,
            displayId: suite.display_id || '',
            name: suite.name,
            isExpanded: true,
            labels: suite.labels || [],
            testCases: suiteTestCaseIds,
            createdAt: suite.created_at,
            updatedAt: suite.updated_at,
          };
        })
      );

      setSuites(transformedSuites);
      setTestCases(transformedCases);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load test suites data. Please try again.');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    steps: Array<{ description: string; expectedResult: string }>,
    labels: string[],
    suiteId?: string
  ) => {
    try {
      if (editingTestCase) {
        await supabaseService.updateTestCase(editingTestCase.id, {
          title,
          description,
          priority,
          labels,
        });

        // Update steps
        for (const step of editingTestCase.steps) {
          const updatedStep = steps.find((s, index) => index === editingTestCase.steps.indexOf(step));
          if (updatedStep) {
            await supabaseService.updateTestStep(step.id, {
              description: updatedStep.description,
              expectedResult: updatedStep.expectedResult,
            });
          }
        }

        toast.success('Test case updated successfully');
      } else {
        const newCase = await supabaseService.createTestCase({
          title,
          description,
          status: 'no_run',
          priority,
          labels,
          user_id: user!.id,
        });

        if (newCase) {
          await supabaseService.createTestSteps(
            steps.map(step => ({
              description: step.description,
              expectedResult: step.expectedResult,
              test_case_id: newCase.id,
            }))
          );

          // If a suite was selected, add the test case to it
          if (suiteId) {
            await supabaseService.addTestCaseToSuite(suiteId, newCase.id);
          }
        }

        toast.success('Test case created successfully');
      }

      await loadData();
      setShowTestForm(false);
      setEditingTestCase(undefined);
    } catch (error) {
      console.error('Error saving test case:', error);
      toast.error('Failed to save test case');
    }
  };

  const handleAddSuite = async (name: string, labels: string[]) => {
    try {
      await supabaseService.createTestSuite(name, user!.id, labels);
      toast.success('Test suite created successfully');
      await loadData();
      setShowSuiteForm(false);
    } catch (error) {
      console.error('Error creating test suite:', error);
      toast.error('Failed to create test suite');
    }
  };

  const handleDeleteSuite = async (suiteId: string) => {
    if (!window.confirm('Are you sure you want to delete this test suite?')) {
      return;
    }

    try {
      await supabaseService.deleteTestSuite(suiteId);
      toast.success('Test suite deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting test suite:', error);
      toast.error('Failed to delete test suite');
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!window.confirm('Are you sure you want to delete this test case?')) {
      return;
    }

    try {
      await supabaseService.deleteTestCase(testCaseId);
      toast.success('Test case deleted successfully');
      await loadData();
    } catch (error) {
      console.error('Error deleting test case:', error);
      toast.error('Failed to delete test case');
    }
  };

  const handleAddTestCaseToSuite = async (suiteId: string, testCaseId: string) => {
    try {
      await supabaseService.addTestCaseToSuite(suiteId, testCaseId);
      toast.success('Test case added to suite');
      await loadData();
    } catch (error) {
      console.error('Error adding test case to suite:', error);
      toast.error('Failed to add test case to suite');
    }
  };

  const handleRemoveTestCaseFromSuite = async (suiteId: string, testCaseId: string) => {
    try {
      await supabaseService.removeTestCaseFromSuite(suiteId, testCaseId);
      toast.success('Test case removed from suite');
      await loadData();
    } catch (error) {
      console.error('Error removing test case from suite:', error);
      toast.error('Failed to remove test case from suite');
    }
  };

  const updateTestStepStatus = async (
    testId: string,
    stepId: string,
    status: TestStep['status']
  ) => {
    try {
      await supabaseService.updateTestStep(stepId, { status });
      await loadData();
    } catch (error) {
      console.error('Error updating step status:', error);
      toast.error('Failed to update step status');
    }
  };

  const updateTestStepActualResult = async (
    testId: string,
    stepId: string,
    actualResult: string
  ) => {
    try {
      await supabaseService.updateTestStep(stepId, { actualResult });
      await loadData();
    } catch (error) {
      console.error('Error updating step result:', error);
      toast.error('Failed to update step result');
    }
  };

  const toggleSuite = (suiteId: string) => {
    setSuites(
      suites.map(suite =>
        suite.id === suiteId ? { ...suite, isExpanded: !suite.isExpanded } : suite
      )
    );
  };

  const availableLabels = labelService.getUniqueLabels([...suites, ...testCases]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Suites</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organize and track your test cases</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSuiteForm(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
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
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          editingTestCase={editingTestCase}
          availableLabels={availableLabels}
          availableSuites={suites}
        />
      )}

      {showSuiteForm && (
        <NewSuiteForm
          onSubmit={handleAddSuite}
          onClose={() => setShowSuiteForm(false)}
          availableLabels={availableLabels}
        />
      )}

      <div className="space-y-4">
        {suites.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <FolderPlus className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Test Suites Yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Create a test suite to start organizing your test cases.</p>
          </div>
        ) : (
          suites.map(suite => (
            <TestSuiteComponent
              key={suite.id}
              suite={suite}
              testCases={testCases.filter(tc => suite.testCases.includes(tc.id))}
              availableTestCases={testCases.filter(tc => !suite.testCases.includes(tc.id))}
              isExpanded={suite.isExpanded}
              onToggle={toggleSuite}
              onUpdateStepStatus={updateTestStepStatus}
              onUpdateStepActualResult={updateTestStepActualResult}
              onEditTestCase={setEditingTestCase}
              onDeleteTestCase={handleDeleteTestCase}
              onDeleteSuite={() => handleDeleteSuite(suite.id)}
              onAddTestCase={(testCaseId) => handleAddTestCaseToSuite(suite.id, testCaseId)}
              onRemoveTestCase={(testCaseId) => handleRemoveTestCaseFromSuite(suite.id, testCaseId)}
            />
          ))
        )}
      </div>
    </div>
  );
}