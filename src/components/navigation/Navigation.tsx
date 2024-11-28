import React from 'react';
import { ClipboardList, Archive, PlayCircle } from 'lucide-react';

interface NavigationProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

export default function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  const modules = [
    {
      id: 'test-management',
      name: 'Test Management',
      description: 'Manage test suites and cases',
      icon: ClipboardList,
    },
    {
      id: 'test-repository',
      name: 'Test Repository',
      description: 'Browse and manage test cases',
      icon: Archive,
    },
    {
      id: 'flow-runs',
      name: 'FlowRuns',
      description: 'Execute and track test runs',
      icon: PlayCircle,
    },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-8">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => onModuleChange(module.id)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                  activeModule === module.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-medium">{module.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {module.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}