import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { FlowRun } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { useAuth } from '../../contexts/AuthContext';
import FlowRunForm from './FlowRunForm';
import FlowRunItem from './FlowRunItem';

export default function FlowRunsList() {
  const { user } = useAuth();
  const [flowRuns, setFlowRuns] = useState<FlowRun[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRun, setEditingRun] = useState<FlowRun | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadFlowRuns();
    }
  }, [user]);

  const loadFlowRuns = async () => {
    try {
      setLoading(true);
      setError(null);
      const runsData = await supabaseService.getFlowRuns(user!.id);
      
      const transformedRuns: FlowRun[] = runsData.map(run => ({
        id: run.id,
        title: run.title,
        description: run.description,
        status: run.status,
        startDate: run.start_date,
        endDate: run.end_date,
        labels: run.labels || [],
        createdAt: run.created_at,
        updatedAt: run.updated_at,
      }));

      setFlowRuns(transformedRuns);
    } catch (error) {
      console.error('Error loading FlowRuns:', error);
      setError('Failed to load flow runs. Please try again.');
      toast.error('Failed to load FlowRuns');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlowRun = async (
    title: string,
    description: string,
    labels: string[]
  ) => {
    try {
      if (editingRun) {
        await supabaseService.updateFlowRun(editingRun.id, {
          title,
          description,
          labels,
        });
        toast.success('FlowRun updated successfully');
      } else {
        await supabaseService.createFlowRun({
          title,
          description,
          status: 'draft',
          startDate: null,
          endDate: null,
          labels,
          user_id: user!.id,
        });
        toast.success('FlowRun created successfully');
      }

      await loadFlowRuns();
      setShowForm(false);
      setEditingRun(undefined);
    } catch (error) {
      console.error('Error saving FlowRun:', error);
      toast.error('Failed to save FlowRun');
    }
  };

  const handleDeleteFlowRun = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FlowRun?')) {
      return;
    }

    try {
      await supabaseService.deleteFlowRun(id);
      toast.success('FlowRun deleted successfully');
      await loadFlowRuns();
    } catch (error) {
      console.error('Error deleting FlowRun:', error);
      toast.error('Failed to delete FlowRun');
    }
  };

  const handleUpdateStatus = async (runId: string, status: FlowRun['status']) => {
    try {
      await supabaseService.updateFlowRun(runId, {
        status,
        ...(status === 'in_progress' ? { startDate: new Date().toISOString() } : {}),
        ...(status === 'completed' ? { endDate: new Date().toISOString() } : {}),
      });
      toast.success('FlowRun status updated');
      await loadFlowRuns();
    } catch (error) {
      console.error('Error updating FlowRun status:', error);
      toast.error('Failed to update FlowRun status');
    }
  };

  const filteredRuns = flowRuns.filter(run => {
    const matchesSearch = searchQuery === '' ||
      run.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

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
          onClick={loadFlowRuns}
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">FlowRuns</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Execute and track your test runs</p>
        </div>
        <button
          onClick={() => {
            setEditingRun(undefined);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          New FlowRun
        </button>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search FlowRuns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-md leading-5 bg-white dark:bg-dark-lighter placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          />
        </div>

        <div className="bg-white dark:bg-dark-lighter shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredRuns.length === 0 ? (
              <li className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                No FlowRuns found
              </li>
            ) : (
              filteredRuns.map((run) => (
                <FlowRunItem
                  key={run.id}
                  flowRun={run}
                  onEdit={() => {
                    setEditingRun(run);
                    setShowForm(true);
                  }}
                  onDelete={() => handleDeleteFlowRun(run.id)}
                  onUpdateStatus={(status) => handleUpdateStatus(run.id, status)}
                />
              ))
            )}
          </ul>
        </div>
      </div>

      {showForm && (
        <FlowRunForm
          onSubmit={handleAddFlowRun}
          onClose={() => {
            setShowForm(false);
            setEditingRun(undefined);
          }}
          editingRun={editingRun}
        />
      )}
    </div>
  );
}