export interface Database {
  public: {
    Tables: {
      test_suites: {
        Row: {
          id: string;
          name: string;
          user_id: string;
          assignee_id: string | null;
          labels: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          user_id: string;
          assignee_id?: string | null;
          labels?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          user_id?: string;
          assignee_id?: string | null;
          labels?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      test_cases: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          status: 'no_run' | 'pending' | 'passed' | 'failed';
          priority: 'high' | 'medium' | 'low';
          assignee_id: string | null;
          labels: string[];
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          status: 'no_run' | 'pending' | 'passed' | 'failed';
          priority: 'high' | 'medium' | 'low';
          assignee_id?: string | null;
          labels?: string[];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          status?: 'no_run' | 'pending' | 'passed' | 'failed';
          priority?: 'high' | 'medium' | 'low';
          assignee_id?: string | null;
          labels?: string[];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      flow_runs: {
        Row: {
          id: string;
          title: string;
          description: string;
          status: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date: string | null;
          end_date: string | null;
          assignee_id: string | null;
          labels: string[];
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          status: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          labels?: string[];
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          status?: 'draft' | 'in_progress' | 'completed' | 'archived';
          start_date?: string | null;
          end_date?: string | null;
          assignee_id?: string | null;
          labels?: string[];
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
        };
      };
    };
  };
}