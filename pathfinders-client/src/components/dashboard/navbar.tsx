'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Bell } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-50">
      <div className="max-w-[2000px] mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/dashboard" 
              className="flex items-center text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 
                text-transparent bg-clip-text hover:from-indigo-700 hover:to-blue-700 
                transition-all duration-200"
            >
              Pathfinders
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard/books"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 
                transition-colors duration-200"
            >
              Books
            </Link>

            <button 
              type="button"
              aria-label="Notifications"
              className="relative p-2 text-slate-400 hover:text-slate-600 
                transition-colors duration-200"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 
                rounded-full"></span>
            </button>

            <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
              <span className="text-sm font-medium text-slate-700">
                Welcome, {user?.username}
              </span>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="flex items-center gap-2 bg-slate-900 text-white border-0
                  hover:bg-slate-800 transition-all duration-200 font-medium
                  focus:ring-2 focus:ring-slate-900/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 