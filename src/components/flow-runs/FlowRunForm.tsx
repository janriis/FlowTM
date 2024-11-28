import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FlowRun } from '../../types';
import LabelManager from '../labels/LabelManager';

interface FlowRunFormProps {
  onSubmit: (title: string, description: string, labels: string[]) => void;
  onClose: () => void;
  editingRun?: FlowRun;
  availableLabels?: string[];
}

export default function FlowRunForm({
  onSubmit,
  onClose,
  editingRun,
  availableLabels = [],
}: FlowRunFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (editingRun) {
      setTitle(editingRun.title);
      setDescription(editingRun.description);
      setLabels(editingRun.labels);
    }
  }, [editingRun]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(title, description, labels);
    setTitle('');
    setDescription('');
    setLabels([]);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {editingRun ? 'Edit FlowRun' : 'Create New FlowRun'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
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
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
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
              {editingRun ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}