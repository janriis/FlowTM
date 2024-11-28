import React, { useState, useEffect, KeyboardEvent } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TestCase, TestSuite } from '../types';
import LabelManager from './labels/LabelManager';
import UserSelect from './common/UserSelect';
import SuiteSelector from './test-repository/SuiteSelector';

interface TestFormProps {
  onSubmit: (
    title: string,
    description: string,
    priority: 'high' | 'medium' | 'low',
    steps: Array<{ description: string; expectedResult: string }>,
    labels: string[],
    assigneeId?: string | null,
    suiteId?: string
  ) => void;
  onClose: () => void;
  editingTestCase?: TestCase;
  availableLabels?: string[];
  availableSuites?: TestSuite[];
}

export default function TestForm({
  onSubmit,
  onClose,
  editingTestCase,
  availableLabels = [],
  availableSuites = [],
}: TestFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [steps, setSteps] = useState<Array<{ description: string; expectedResult: string }>>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [showSuiteSelector, setShowSuiteSelector] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);

  useEffect(() => {
    if (editingTestCase) {
      setTitle(editingTestCase.title);
      setDescription(editingTestCase.description);
      setPriority(editingTestCase.priority);
      setSteps(editingTestCase.steps.map(step => ({
        description: step.description,
        expectedResult: step.expectedResult
      })));
      setLabels(editingTestCase.labels);
      setAssigneeId(editingTestCase.assignee?.id || null);
    }
  }, [editingTestCase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      title,
      description,
      priority,
      steps,
      labels,
      assigneeId,
      selectedSuite?.id
    );
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

  const handleAddLabel = (label: string) => {
    if (!labels.includes(label)) {
      setLabels([...labels, label]);
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleExpectedResultKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const currentStep = steps[index];
      if (currentStep.description && currentStep.expectedResult) {
        addStep();
        setTimeout(() => {
          const newStepDescriptionInput = document.getElementById(`step-description-${index + 1}`);
          if (newStepDescriptionInput) {
            newStepDescriptionInput.focus();
          }
        }, 0);
      }
    }
  };

  const handleSelectSuite = (suiteId: string) => {
    const suite = availableSuites.find(s => s.id === suiteId);
    if (suite) {
      setSelectedSuite(suite);
      setShowSuiteSelector(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingTestCase ? 'Edit Test Case' : 'Add New Test Case'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-auto p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-dark text-gray-900 dark:text-white"
              placeholder="Enter test case title"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-dark text-gray-900 dark:text-white"
              placeholder="Describe the purpose of this test case"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Assignee
            </label>
            <UserSelect
              value={assigneeId}
              onChange={setAssigneeId}
              placeholder="Assign to..."
            />
          </div>

          {!editingTestCase && availableSuites.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Test Suite
              </label>
              {selectedSuite ? (
                <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{selectedSuite.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedSuite(null)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSuiteSelector(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Select Test Suite
                </button>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Labels
            </label>
            <LabelManager
              labels={labels}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-dark text-gray-900 dark:text-white"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Steps</h3>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center px-3 py-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </button>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg relative">
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Step {index + 1}: Description
                  </label>
                  <input
                    type="text"
                    id={`step-description-${index}`}
                    value={step.description}
                    onChange={(e) => updateStep(index, 'description', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-dark text-gray-900 dark:text-white"
                    placeholder="What should be done in this step?"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expected Result
                  </label>
                  <input
                    type="text"
                    value={step.expectedResult}
                    onChange={(e) => updateStep(index, 'expectedResult', e.target.value)}
                    onKeyDown={(e) => handleExpectedResultKeyDown(e, index)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-dark-border shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-white dark:bg-dark text-gray-900 dark:text-white"
                    placeholder="What should happen after this step?"
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-lighter"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {editingTestCase ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>

      {showSuiteSelector && (
        <SuiteSelector
          availableSuites={availableSuites}
          onSelectSuite={handleSelectSuite}
          onClose={() => setShowSuiteSelector(false)}
        />
      )}
    </div>
  );
}