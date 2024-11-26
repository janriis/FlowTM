import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TestStep, TestCase } from '../types';

interface TestFormProps {
  onSubmit: (
    title: string,
    description: string,
    suiteId: string,
    priority: 'high' | 'medium' | 'low',
    dueDate: string | null,
    steps: Omit<TestStep, 'id' | 'status'>[]
  ) => void;
  onClose: () => void;
  suites: Array<{ id: string; name: string }>;
  editingTestCase?: TestCase;
}

export default function TestForm({ onSubmit, onClose, suites, editingTestCase }: TestFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [suiteId, setSuiteId] = useState(suites[0]?.id || '');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [steps, setSteps] = useState<Array<{ description: string; expectedResult: string }>>([]);

  useEffect(() => {
    if (editingTestCase) {
      setTitle(editingTestCase.title);
      setDescription(editingTestCase.description);
      setSuiteId(editingTestCase.suiteId);
      setPriority(editingTestCase.priority);
      setDueDate(editingTestCase.dueDate || '');
      setSteps(editingTestCase.steps.map(step => ({
        description: step.description,
        expectedResult: step.expectedResult
      })));
    }
  }, [editingTestCase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      title,
      description,
      suiteId,
      priority,
      dueDate || null,
      steps
    );
    setTitle('');
    setDescription('');
    setDueDate('');
    setSteps([]);
  };

  const addStep = () => {
    setSteps([...steps, { description: '', expectedResult: '' }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: 'description' | 'expectedResult', value: string) => {
    setSteps(
      steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingTestCase ? 'Edit Test Case' : 'Add New Test Case'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-auto p-4 space-y-4">
          <div>
            <label htmlFor="suite" className="block text-sm font-medium text-gray-700">
              Test Suite
            </label>
            <select
              id="suite"
              value={suiteId}
              onChange={(e) => setSuiteId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              {suites.map((suite) => (
                <option key={suite.id} value={suite.id}>
                  {suite.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Test Steps</h3>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </button>
            </div>
            
            {steps.map((step, index) => (
              <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Step {index + 1}: Description
                  </label>
                  <input
                    type="text"
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter step description"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expected Result
                  </label>
                  <input
                    type="text"
                    value={step.expectedResult}
                    onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter expected result"
                    required
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {editingTestCase ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}