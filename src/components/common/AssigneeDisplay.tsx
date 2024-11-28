import React from 'react';
import { User } from 'lucide-react';
import { UserProfile } from '../../types';

interface AssigneeDisplayProps {
  assignee: UserProfile | null;
  className?: string;
}

export default function AssigneeDisplay({ assignee, className = '' }: AssigneeDisplayProps) {
  if (!assignee) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {assignee.avatar_url ? (
        <img
          src={assignee.avatar_url}
          alt={assignee.name || assignee.email}
          className="h-6 w-6 rounded-full"
        />
      ) : (
        <User className="h-6 w-6 text-gray-400 dark:text-gray-500" />
      )}
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {assignee.name || assignee.email}
      </span>
    </div>
  );
}