// FlowRunDetails Component
// This component displays detailed information about a specific flow run and allows managing test cases within it

// Import necessary dependencies and components
import { Plus, Search, FolderPlus } from 'lucide-react';
import TestSuiteSelector from './TestSuiteSelector';

// Define the component's props interface
interface FlowRunDetailsProps {
  flowRun: FlowRun;
  onClose: () => void;
}

// Main component definition
export default function FlowRunDetails({ flowRun, onClose }: FlowRunDetailsProps) {
  // State management for component
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  const [availableTestSuites, setAvailableTestSuites] = useState<TestSuite[]>([]);

  // Load test cases and suites when component mounts
  useEffect(() => {
    loadTestCases();
  }, []);

  // Function to load test cases and available test suites
  const loadTestCases = async () => {
    try {
      const [flowRunTestCases, allTestCases, allTestSuites] = await Promise.all([
        supabaseService.getFlowRunTestCases(flowRun.id),
        supabaseService.getAllTestCases(),
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
    }
  };

  // Add the handleAddTestSuite function
  const handleAddTestSuite = async (suiteId: string) => {
    try {
      await supabaseService.addTestSuiteToFlowRun(flowRun.id, suiteId);
      await loadTestCases();
      toast.success('Test suite added to FlowRun');
      setShowSuiteSelector(false);
    } catch (error) {
      toast.error('Failed to add test suite');
      console.error('Error adding test suite:', error);
    }
  };

  // Update the buttons section in the JSX
  <div className="flex space-x-3">
    <button
      onClick={() => setShowSuiteSelector(true)}
      className="inline-flex items-center px-4 py-2 bg-teal-600 text-white border border-teal-700 rounded-md hover:bg-teal-700"
    >
      <FolderPlus className="h-5 w-5 mr-2" />
      Add Test Suite
    </button>
    <button
      onClick={() => setShowSelector(true)}
      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
    >
      <Plus className="h-5 w-5 mr-2" />
      Add Test Cases
    </button>
  </div>

  // Add the TestSuiteSelector component
  {showSuiteSelector && (
    <TestSuiteSelector
      availableTestSuites={availableTestSuites}
      onSelectTestSuite={handleAddTestSuite}
      onClose={() => setShowSuiteSelector(false)}
    />
  )}
}