import React, { useState, useEffect } from 'react';
import { Search, User } from 'lucide-react';
import { UserProfile } from '../../types';
import { userService } from '../../services/userService';

interface UserSelectProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  placeholder?: string;
  className?: string;
}

export default function UserSelect({
  value,
  onChange,
  placeholder = 'Assign to...',
  className = ''
}: UserSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value) {
      loadSelectedUser(value);
    }
  }, [value]);

  const loadSelectedUser = async (userId: string) => {
    try {
      const user = await userService.getUserById(userId);
      setSelectedUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setLoading(true);
      const results = await userService.searchUsers(query);
      setUsers(results);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length >= 2) {
      searchUsers(query);
    } else {
      setUsers([]);
    }
  };

  const handleSelect = (user: UserProfile) => {
    setSelectedUser(user);
    onChange(user.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    setSelectedUser(null);
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      {selectedUser ? (
        <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-dark-lighter rounded-md">
          <div className="flex items-center space-x-2">
            {selectedUser.avatar_url ? (
              <img
                src={selectedUser.avatar_url}
                alt={selectedUser.name || selectedUser.email}
                className="h-6 w-6 rounded-full"
              />
            ) : (
              <User className="h-6 w-6 text-gray-400" />
            )}
            <span className="text-sm text-gray-900 dark:text-white">
              {selectedUser.name || selectedUser.email}
            </span>
          </div>
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center space-x-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-lighter border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <User className="h-5 w-5 text-gray-400" />
          <span>{placeholder}</span>
        </button>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-dark-lighter rounded-md shadow-lg border border-gray-200 dark:border-dark-border">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md bg-white dark:bg-dark text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <ul className="max-h-60 overflow-auto py-1">
            {loading ? (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                Loading...
              </li>
            ) : users.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery.length < 2 ? 'Type to search users' : 'No users found'}
              </li>
            ) : (
              users.map(user => (
                <li
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-dark cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name || user.email}
                        className="h-6 w-6 rounded-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-gray-400" />
                    )}
                    <div>
                      {user.name && (
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}