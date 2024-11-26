export interface TestStep {
  id: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: 'pending' | 'passed' | 'failed';
}

export interface TestCase {
  id: string;
  title: string;
  description: string;
  status: 'no_run' | 'pending' | 'passed' | 'failed';
  suiteId: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: string | null;
  steps: TestStep[];
}

export interface TestSuite {
  id: string;
  name: string;
  isExpanded: boolean;
}