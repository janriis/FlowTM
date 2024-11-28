import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { TestCase, TestSuite, TestStep, FlowRun, UserProfile } from '../types';

type DbTestSuite = Database['public']['Tables']['test_suites']['Row'];
type DbTestCase = Database['public']['Tables']['test_cases']['Row'];
type DbTestStep = Database['public']['Tables']['test_steps']['Row'];
type DbFlowRun = Database['public']['Tables']['flow_runs']['Row'];

export const supabaseService = {
  // Test Suites
  async getTestSuites(userId: string): Promise<TestSuite[]> {
    const { data: suitesData, error } = await supabase
      .from('test_suites')
      .select(`
        *,
        assignee:assignee_id (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedSuites = await Promise.all(
      (suitesData || []).map(async suite => {
        const testCaseIds = await this.getSuiteTestCases(suite.id);
        return {
          id: suite.id,
          displayId: suite.display_id || '',
          name: suite.name,
          isExpanded: true,
          assignee: suite.assignee as UserProfile | null,
          labels: suite.labels || [],
          testCases: testCaseIds,
          createdAt: suite.created_at,
          updatedAt: suite.updated_at,
        };
      })
    );

    return transformedSuites;
  },

  // Test Cases
  async getTestCases(userId: string): Promise<TestCase[]> {
    const { data: casesData, error } = await supabase
      .from('test_cases')
      .select(`
        *,
        assignee:assignee_id (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedCases = await Promise.all((casesData || []).map(async caseData => {
      const steps = await this.getTestSteps(caseData.id);
      return {
        id: caseData.id,
        displayId: caseData.display_id || '',
        title: caseData.title,
        description: caseData.description || '',
        status: caseData.status,
        priority: caseData.priority,
        assignee: caseData.assignee as UserProfile | null,
        labels: caseData.labels || [],
        steps: steps.map(step => ({
          id: step.id,
          description: step.description,
          expectedResult: step.expected_result,
          actualResult: step.actual_result || '',
          status: step.status,
        })),
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at,
      };
    }));

    return transformedCases;
  },

  async createTestCase(
    testCase: Omit<TestCase, 'id' | 'displayId' | 'steps' | 'createdAt' | 'updatedAt'> & { 
      user_id: string;
      assignee_id?: string | null;
    }
  ): Promise<DbTestCase> {
    const { data, error } = await supabase
      .from('test_cases')
      .insert({
        title: testCase.title,
        description: testCase.description,
        status: testCase.status,
        priority: testCase.priority,
        labels: testCase.labels,
        user_id: testCase.user_id,
        assignee_id: testCase.assignee_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTestCase(
    id: string,
    updates: Partial<Omit<TestCase, 'id' | 'displayId' | 'steps' | 'createdAt' | 'updatedAt'>> & {
      assignee_id?: string | null;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('test_cases')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        labels: updates.labels,
        assignee_id: updates.assignee_id
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Flow Runs
  async getFlowRuns(userId: string): Promise<FlowRun[]> {
    const { data: runsData, error } = await supabase
      .from('flow_runs')
      .select(`
        *,
        assignee:assignee_id (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .or(`user_id.eq.${userId},assignee_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (runsData || []).map(run => ({
      id: run.id,
      title: run.title,
      description: run.description,
      status: run.status,
      startDate: run.start_date,
      endDate: run.end_date,
      assignee: run.assignee as UserProfile | null,
      labels: run.labels || [],
      createdAt: run.created_at,
      updatedAt: run.updated_at,
    }));
  },

  async createFlowRun(flowRun: Omit<FlowRun, 'id' | 'createdAt' | 'updatedAt'> & { 
    user_id: string;
    assignee_id?: string | null;
  }): Promise<DbFlowRun> {
    const { data, error } = await supabase
      .from('flow_runs')
      .insert({
        title: flowRun.title,
        description: flowRun.description,
        status: flowRun.status,
        start_date: flowRun.startDate,
        end_date: flowRun.endDate,
        labels: flowRun.labels,
        user_id: flowRun.user_id,
        assignee_id: flowRun.assignee_id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFlowRun(
    id: string,
    updates: Partial<Omit<FlowRun, 'id' | 'createdAt' | 'updatedAt'>> & {
      assignee_id?: string | null;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('flow_runs')
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        start_date: updates.startDate,
        end_date: updates.endDate,
        labels: updates.labels,
        assignee_id: updates.assignee_id
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Test Steps
  async getTestSteps(testCaseId: string): Promise<DbTestStep[]> {
    const { data, error } = await supabase
      .from('test_steps')
      .select('*')
      .eq('test_case_id', testCaseId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createTestSteps(
    steps: Array<{
      description: string;
      expectedResult: string;
      test_case_id: string;
    }>
  ): Promise<DbTestStep[]> {
    const { data, error } = await supabase
      .from('test_steps')
      .insert(steps)
      .select();

    if (error) throw error;
    return data || [];
  },

  async updateTestStep(
    id: string,
    updates: Partial<{
      description: string;
      expectedResult: string;
      actualResult: string;
      status: TestStep['status'];
    }>
  ): Promise<void> {
    const { error } = await supabase
      .from('test_steps')
      .update({
        description: updates.description,
        expected_result: updates.expectedResult,
        actual_result: updates.actualResult,
        status: updates.status,
      })
      .eq('id', id);

    if (error) throw error;
  },

  // Suite Test Cases
  async getSuiteTestCases(suiteId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('suite_test_cases')
      .select('test_case_id')
      .eq('suite_id', suiteId);

    if (error) throw error;
    return (data || []).map(row => row.test_case_id);
  },

  async addTestCaseToSuite(suiteId: string, testCaseId: string): Promise<void> {
    const { error } = await supabase
      .from('suite_test_cases')
      .insert({ suite_id: suiteId, test_case_id: testCaseId });

    if (error) throw error;
  },

  async removeTestCaseFromSuite(suiteId: string, testCaseId: string): Promise<void> {
    const { error } = await supabase
      .from('suite_test_cases')
      .delete()
      .eq('suite_id', suiteId)
      .eq('test_case_id', testCaseId);

    if (error) throw error;
  }
};