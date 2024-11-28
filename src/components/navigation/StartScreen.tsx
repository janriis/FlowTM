import React from 'react';
import { Archive, ClipboardList, PlayCircle } from 'lucide-react';

interface StartScreenProps {
  onModuleSelect: (module: string) => void;
}

export default function StartScreen({ onModuleSelect }: StartScreenProps) {
  const modules = [
    {
      id: 'test-repository',
      name: 'Test Repository',
      description: 'Browse and manage all test cases in a central repository',
      icon: Archive,
    },
    {
      id: 'test-suites',
      name: 'Test Suites',
      description: 'Create and manage test suites and their test cases',
      icon: ClipboardList,
    },
    {
      id: 'flow-runs',
      name: 'FlowRuns',
      description: 'Execute and track test runs with selected test cases',
      icon: PlayCircle,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Welcome to Flowthings Test Management
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <button
              key={module.id}
              onClick={() => onModuleSelect(module.id)}
              className="flex flex-col items-start p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors"
            >
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg mb-4">
                <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {module.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {module.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}