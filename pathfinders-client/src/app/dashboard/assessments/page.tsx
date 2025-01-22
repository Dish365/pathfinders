'use client';

import { useAuth } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import Link from 'next/link';

export default function AssessmentsPage() {
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Motivational Gifts Assessment</h1>
      </div>

      <Card className="p-6 bg-white shadow-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {user.latest_assessment?.is_complete ? 'Take Another Assessment' : 'Start Your Assessment'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {user.latest_assessment?.is_complete 
            ? 'Continue exploring your Romans 12:6-8 gifts through another assessment.'
            : 'Discover your motivational gifts to better understand your purpose in life, career, and ministry.'}
        </p>

        <Link 
          href="/dashboard/assessments/take"
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent 
                   text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                   transition-colors duration-200"
        >
          {user.latest_assessment?.is_complete ? 'Take New Assessment' : 'Start Assessment'}
        </Link>
      </Card>

      {user.assessment_count > 0 && (
        <Card className="p-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Assessment History</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Assessments Completed</p>
              <p className="text-2xl font-bold text-gray-900">{user.assessment_count}</p>
            </div>
            {user.latest_assessment && (
              <div>
                <p className="text-sm font-medium text-gray-500">Latest Assessment</p>
                <p className="text-base text-gray-900">
                  {new Date(user.latest_assessment.timestamp).toLocaleDateString()}
                  <span className="ml-2 px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}