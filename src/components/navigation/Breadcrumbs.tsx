import React from 'react';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: {
    label: string;
    onClick?: () => void;
  }[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.label}>
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.onClick ? (
            <button
              onClick={item.onClick}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {item.label}
            </button>
          ) : (
            <span>{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}