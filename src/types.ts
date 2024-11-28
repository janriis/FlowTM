export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
}

export interface TestStep {
  id: string;
  description: string;
  expectedResult: string;
  actualResult: string;
  status: 'pending' | 'passed' | 'failed';
}

export interface TestCase {
  id: string;
  displayId: string;
  title: string;
  description: string;
  status: 'no_run' | 'pending' | 'passed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  assignee: UserProfile | null;
  steps: TestStep[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TestSuite {
  id: string;
  displayId: string;
  name: string;
  isExpanded: boolean;
  assignee: UserProfile | null;
  labels: string[];
  testCases: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowRun {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'archived';
  startDate: string | null;
  endDate: string | null;
  assignee: UserProfile | null;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FlowRunTestCase {
  id: string;
  flowRunId: string;
  testCaseId: string;
  status: 'no_run' | 'pending' | 'passed' | 'failed';
  notes: string;
  createdAt: string;
  updatedAt: string;
}