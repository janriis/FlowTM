import React, { useState, useEffect } from 'react';
import { Plus, Search, FolderPlus } from 'lucide-react';
import { TestCase, TestSuite, FlowRun } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import TestCaseSelector from '../TestCaseSelector';
import TestSuiteSelector from './TestSuiteSelector';
import FlowRunExecution from './FlowRunExecution';

interface FlowRunTestCasesProps {
  flowRun: FlowRun;
  onClose: () => void;
}

export default function FlowRunTestCases({ flowRun, onClose }: FlowRunTestCasesProps) {
  const { user } = useAuth();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [availableTestCases, setAvailableTestCases] = useState<TestCase[]>([]);
  const [availableTestSuites, setAvailableTestSuites] = useState<TestSuite[]>([]);
  const [showTestCaseSelector, setShowTestCaseSelector] = useState(false);
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [flowRunTestCases, allTestCases, allTestSuites] = await Promise.all([
        supabaseService.getFlowRunTestCases(flowRun.id),
        supabaseService.getTestCases(user!.id),
        supabaseService.getTestSuites(user!.id)
      ]);

      setTestCases(flowRunTestCases);
      setAvailableTestCases(allTestCases.filter(tc => 
        !flowRunTestCases.some(frtc => frtc.id === tc.id)
      ));
      setAvailableTestSuites(allTestSuites);
    } catch (error) {
      toast.error('Failed to load test cases');
      console.error('Error loading test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestCase = async (testCaseId: string) => {
    try {
      await supabaseService.addTestCaseToFlowRun(flowRun.id, testCaseId);
      await loadData();
      toast.success('Test case added to FlowRun');
    } catch (error) {
      toast.error('Failed to add test case');
      console.error('Error adding test case:', error);
    }
  };

  const handleAddTestSuite = async (suiteId: string) => {
    try {
      const suiteTestCases = await supabaseService.getSuiteTestCases(suiteId);
      await Promise.all(
        suiteTestCases.map(testCaseId =>
          supabaseService.addTestCaseToFlowRun(flowRun.id, testCaseId)
        )
      );
      await loadData();
      toast.success('Test suite added to FlowRun');
      setShowSuiteSelector(false);
    } catch (error) {
      toast.error('Failed to add test suite');
      console.error('Error adding test suite:', error);
    }
  };

  const handleUpdateTestCaseStatus = async (
    testCaseId: string,
    status: 'no_run' | 'pending' | 'passed' | 'failed'
  ) => {
    try {
      await supabaseService.updateFlowRunTestCase(flowRun.id, testCaseId, { status });
      await loadData();
    } catch (error) {
      toast.error('Failed to update test case status');
      console.error('Error updating test case status:', error);
    }
  };

  const filteredTestCases = testCases.filter(testCase => {
    const matchesSearch = searchQuery === '' ||
      testCase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testCase.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
          <h3 className="text-lg font-medium text-gray-900">Test Cases</h3>
          <p className="text-sm text-gray-500">{testCases.length} test cases in this FlowRun</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSuiteSelector(true)}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            <FolderPlus className="h-5 w-5 mr-2" />
            Add Test Suite
          </button>
          <button
            onClick={() => setShowTestCaseSelector(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Test Cases
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search test cases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="space-y-4">
          {filteredTestCases.map((testCase) => (
            <FlowRunExecution
              key={testCase.id}
              flowRun={flowRun}
              testCase={testCase}
              onUpdateStatus={(status) => handleUpdateTestCaseStatus(testCase.id, status)}
              onClose={onClose}
            />
          ))}
        </div>
      </div>

      {showTestCaseSelector && (
        <TestCaseSelector
          availableTestCases={availableTestCases}
          onSelectTestCase={handleAddTestCase}
          onClose={() => setShowTestCaseSelector(false)}
        />
      )}

      {showSuiteSelector && (
        <TestSuiteSelector
          availableTestSuites={availableTestSuites}
          onSelectTestSuite={handleAddTestSuite}
          onClose={() => setShowSuiteSelector(false)}
        />
      )}
    </div>
  );
}