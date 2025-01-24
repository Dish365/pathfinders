'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { GiftSummary } from '@/components/profile/gift-summary';
import { RecommendedRoles } from '@/components/profile/recommended-roles';
import { Loading } from '@/components/ui/loading';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 
          bg-clip-text text-transparent">
          Welcome, {user.first_name || user.username}!
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-lg rounded-xl border border-slate-200/50 overflow-hidden">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Assessment Overview</h2>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Assessments</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 
                bg-clip-text text-transparent">{user.assessment_count}</p>
            </div>
            {user.latest_assessment && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-500 mb-2">Latest Assessment</p>
                <div className="flex items-center justify-between">
                  <p className="text-base text-slate-700">
                    {new Date(user.latest_assessment.timestamp).toLocaleDateString()}
                  </p>
                  <span className={cn(
                    "px-3 py-1 text-sm rounded-full font-medium",
                    user.latest_assessment.is_complete 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "bg-blue-50 text-blue-700"
                  )}>
                    {user.latest_assessment.is_complete ? '✓ Completed' : '⋯ In Progress'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {user.profile.gift_summary ? (
          <Card className="p-6 bg-white shadow-lg rounded-xl border border-slate-200/50">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Motivational Gifts</h2>
            <GiftSummary giftSummary={user.profile.gift_summary} />
          </Card>
        ) : null}
      </div>

      {user.profile.recommended_roles ? (
        <Card className="p-6 bg-white shadow-lg rounded-xl border border-slate-200/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Ministry Areas</h2>
            <p className="text-sm text-slate-500">Based on Romans 12:6-8</p>
          </div>
          <RecommendedRoles />
        </Card>
      ) : (
        <Card className="p-8 bg-white shadow-lg rounded-xl border border-slate-200/50 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Discover Your Motivational Gifts
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Take your first assessment to discover your motivational gifts and find areas 
              where you can serve effectively.
            </p>
            <Link
              href="/dashboard/assessments"
              className="inline-flex items-center justify-center px-6 py-3 
                bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium 
                rounded-xl shadow-lg hover:from-indigo-700 hover:to-blue-700
                focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
            >
              Start Assessment
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}