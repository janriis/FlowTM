import React from 'react';
import { User } from '@supabase/supabase-js';
import { User as UserIcon } from 'lucide-react';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 dark:bg-dark rounded-lg">
      <div className="flex-shrink-0">
        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {user.user_metadata.name}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {user.email}
        </span>
      </div>
    </div>
  );
}