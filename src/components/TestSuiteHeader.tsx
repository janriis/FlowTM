import React from 'react';
import { FolderOpen, Edit2 } from 'lucide-react';
import { TestSuite } from '../types';
import LabelBadge from './labels/LabelBadge';

interface TestSuiteHeaderProps {
  suite: TestSuite;
  onEdit: () => void;
}

export default function TestSuiteHeader({ suite, onEdit }: TestSuiteHeaderProps) {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-t-lg border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <FolderOpen className="h-6 w-6 text-indigo-500" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">{suite.name}</h3>
          <div className="flex flex-wrap gap-2 mt-1">
            {suite.labels.map(label => (
              <LabelBadge key={label} label={label} />
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={onEdit}
        className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
        title="Edit suite"
      >
        <Edit2 className="h-5 w-5" />
      </button>
    </div>
  );
}