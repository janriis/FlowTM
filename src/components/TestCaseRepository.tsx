import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { TestCase, TestSuite } from '../types';
import TestCaseItem from './TestCaseItem';
import { Trash2, FolderPlus } from 'lucide-react';
import TestForm from './TestForm';
import { labelService } from '../services/labelService';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import SuiteSelector from './test-repository/SuiteSelector';

export default function TestCaseRepository() {
  const { user } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState<TestCase | undefined>();
  const [loading, setLoading] = useState(true);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [casesData, suitesData] = await Promise.all([
        supabaseService.getTestCases(user!.id),
        supabaseService.getTestSuites(user!.id),
      ]);
      
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

      setTestCases(transformedCases);
      setTestSuites(transformedSuites);
    } catch (error) {
      toast.error('Failed to load data');
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    steps: Array<{ description: string; expectedResult: string }>,
    labels: string[]
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
        // Create new test case
        const newCase = await supabaseService.createTestCase({
          title,
          description,
          status: 'no_run',
          priority,
          labels,
          user_id: user!.id,
        });

        // Create steps
        if (newCase) {
          await supabaseService.createTestSteps(
            steps.map(step => ({
              description: step.description,
              expectedResult: step.expectedResult,
              test_case_id: newCase.id,
            }))
          );
        }

        toast.success('Test case created successfully');
      }

      await loadData();
      setShowTestForm(false);
      setEditingTestCase(undefined);
    } catch (error) {
      toast.error('Failed to save test case');
      console.error('Error saving test case:', error);
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
      toast.error('Failed to delete test case');
      console.error('Error deleting test case:', error);
    }
  };

  const handleAddToSuite = async (testCaseId: string, suiteId: string) => {
    try {
      await supabaseService.addTestCaseToSuite(suiteId, testCaseId);
      toast.success('Test case added to suite');
      await loadData();
    } catch (error) {
      toast.error('Failed to add test case to suite');
      console.error('Error adding test case to suite:', error);
    }
  };

  const handleRemoveFromSuite = async (testCaseId: string, suiteId: string) => {
    try {
      await supabaseService.removeTestCaseFromSuite(suiteId, testCaseId);
      toast.success('Test case removed from suite');
      await loadData();
    } catch (error) {
      toast.error('Failed to remove test case from suite');
      console.error('Error removing test case from suite:', error);
    }
  };

  const availableLabels = labelService.getUniqueLabels(testCases);

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());    
    return matchesSearch;
  });

  const handleSelectTestCase = (testCaseId: string) => {
    setSelectedTestCases(prev => 
      prev.includes(testCaseId) 
        ? prev.filter(id => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTestCases.length === filteredTestCases.length) {
      setSelectedTestCases([]);
    } else {
      setSelectedTestCases(filteredTestCases.map(tc => tc.id));
    }
  };

  const handleAddSelectedToSuite = async (suiteId: string) => {
    try {
      await Promise.all(
        selectedTestCases.map(testCaseId =>
          supabaseService.addTestCaseToSuite(suiteId, testCaseId)
        )
      );
      toast.success('Test cases added to suite');
      setSelectedTestCases([]);
      setShowSuiteSelector(false);
      await loadData();
    } catch (error) {
      toast.error('Failed to add test cases to suite');
      console.error('Error adding test cases to suite:', error);
    }
  };

  const getTestCaseSuites = (testCaseId: string): TestSuite[] => {
    return testSuites.filter(suite => suite.testCases.includes(testCaseId));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Test Repository</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your test cases</p>
        </div>
        <button
          onClick={() => {
            setEditingTestCase(undefined);
            setShowTestForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Test Case
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedTestCases.length === filteredTestCases.length}
              onChange={handleSelectAll}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-dark-border rounded cursor-pointer"
            />
            {selectedTestCases.length > 0 && (
              <button
                onClick={() => setShowSuiteSelector(true)}
                className="inline-flex items-center px-3 py-1.5 bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                Add to Suite ({selectedTestCases.length})
              </button>
            )}
          </div>
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search test cases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-md leading-5 bg-white dark:bg-dark-lighter placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-dark-lighter shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredTestCases.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No test cases found
              </li>
            ) : (
              filteredTestCases.map((testCase) => (
                <li key={testCase.id}>
                  <div className="flex items-center">
                    <div className="pl-4 pr-2 py-4">
                      <input
                        type="checkbox"
                        checked={selectedTestCases.includes(testCase.id)}
                        onChange={() => handleSelectTestCase(testCase.id)}
                        className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 dark:border-dark-border rounded cursor-pointer"
                      />
                    </div>
                  <TestCaseItem
                    testCase={testCase}
                    suites={getTestCaseSuites(testCase.id)}
                    availableSuites={testSuites}
                    onUpdateStatus={() => {}}
                    onUpdateStepStatus={() => {}}
                    onUpdateStepActualResult={() => {}}
                    onEdit={() => {
                      setEditingTestCase(testCase);
                      setShowTestForm(true);
                    }}
                    onAddToSuite={handleAddToSuite}
                    onRemoveFromSuite={handleRemoveFromSuite}
                    onRemove={() => handleDeleteTestCase(testCase.id)}
                    showRemoveButton={true}
                    removeIcon={<Trash2 className="h-5 w-5" />}
                    removeButtonTitle="Delete test case"
                    removeButtonClass="text-gray-400 hover:text-red-500"
                  />
                  </div>
                </li>
              ))
            )}
          </ul>
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
        />
      )}

      {showSuiteSelector && (
        <SuiteSelector
          availableSuites={testSuites}
          onSelectSuite={handleAddSelectedToSuite}
          onClose={() => setShowSuiteSelector(false)}
        />
      )}
    </div>
  );
}