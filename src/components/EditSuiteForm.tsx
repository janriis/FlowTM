import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { TestSuite } from '../types';
import LabelManager from './labels/LabelManager';

interface EditSuiteFormProps {
  suite: TestSuite;
  onSubmit: (name: string, labels: string[]) => void;
  onClose: () => void;
  availableLabels?: string[];
}

export default function EditSuiteForm({
  suite,
  onSubmit,
  onClose,
  availableLabels = [],
}: EditSuiteFormProps) {
  const [name, setName] = useState(suite.name);
  const [labels, setLabels] = useState<string[]>(suite.labels);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(name, labels);
  };

  const handleAddLabel = (label: string) => {
    if (!labels.includes(label)) {
      setLabels([...labels, label]);
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Test Suite</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Suite Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="e.g., Authentication Tests"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labels
            </label>
            <LabelManager
              labels={labels}
              onAddLabel={handleAddLabel}
              onRemoveLabel={handleRemoveLabel}
            />
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}