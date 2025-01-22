'use client';

import { BookLibrary } from '@/components/books/book-library';
import { useAuth } from '@/contexts/auth-context';
import { Loading } from '@/components/ui/loading';
import { BookOpen } from 'lucide-react';

export default function BooksPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="large" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 
            bg-clip-text text-transparent">
            My Library
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-slate-600 text-lg">
            Books are assigned based on your primary and secondary gifts
          </p>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 
              text-blue-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              Primary Gift Book
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 
              text-purple-700 rounded-lg text-sm font-medium">
              <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
              Secondary Gift Book
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-2xl border border-slate-200/50 shadow-lg 
        overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">
              Available Books
            </h2>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {user.profile.gift_summary?.primary_gift && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span>Based on your {user.profile.gift_summary.primary_gift} gift</span>
                </div>
              )}
              {user.profile.gift_summary?.secondary_gifts?.[0] && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-600 rounded-full"></span>
                  <span>Based on your {user.profile.gift_summary.secondary_gifts[0]} gift</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">
          <BookLibrary />
        </div>
      </div>
    </div>
  );
} 