import React, { useState, useEffect } from 'react';
import { ClipboardList, Sun, Moon, Monitor, LogOut } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import TestSuites from './components/TestSuites';
import TestCaseRepository from './components/TestCaseRepository';
import FlowRunsList from './components/flow-runs/FlowRunsList';
import AuthForm from './components/auth/AuthForm';
import UserProfile from './components/auth/UserProfile';
import StartScreen from './components/navigation/StartScreen';
import Breadcrumbs from './components/navigation/Breadcrumbs';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading } = useAuth();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm />
        <Toaster position="top-right" />
      </>
    );
  }

  const getBreadcrumbs = () => {
    const items = [{ label: 'Home', onClick: () => setActiveModule(null) }];
    
    if (activeModule) {
      switch (activeModule) {
        case 'test-suites':
          items.push({ label: 'Test Suites' });
          break;
        case 'test-repository':
          items.push({ label: 'Test Repository' });
          break;
        case 'flow-runs':
          items.push({ label: 'FlowRuns' });
          break;
      }
    }
    
    return items;
  };

  const renderModule = () => {
    if (!activeModule) {
      return <StartScreen onModuleSelect={setActiveModule} />;
    }

    switch (activeModule) {
      case 'test-suites':
        return <TestSuites />;
      case 'test-repository':
        return <TestCaseRepository />;
      case 'flow-runs':
        return <FlowRunsList />;
      default:
        return <StartScreen onModuleSelect={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark transition-colors duration-200">
      <Toaster position="top-right" />
      <nav className="bg-white dark:bg-dark-lighter border-b dark:border-dark-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClipboardList className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Flowthings Test Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Streamline your testing workflow
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 dark:bg-dark rounded-lg p-1">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-2 rounded-md ${
                    theme === 'light'
                      ? 'bg-white dark:bg-dark-lighter text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title="Light mode"
                >
                  <Sun className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-2 rounded-md ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title="Dark mode"
                >
                  <Moon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`p-2 rounded-md ${
                    theme === 'system'
                      ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                  }`}
                  title="System preference"
                >
                  <Monitor className="h-5 w-5" />
                </button>
              </div>
              <UserProfile user={user} />
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Breadcrumbs items={getBreadcrumbs()} />
        {renderModule()}
      </main>
    </div>
  );
}

export default App;