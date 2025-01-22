'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { assessmentApi } from '@/services/assessment';
import { AssessmentResult } from '@/types/assessment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import { RecommendedRoles } from '@/components/profile/recommended-roles';


export default function AssessmentResultsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AssessmentResult | null>(null);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const data = await assessmentApi.getLatestResults();
      setResults(data);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast.error('Failed to load assessment results');
      router.push('/dashboard/assessments');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="large" />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 mb-4">No results available</p>
        <Button onClick={() => router.push('/dashboard/assessments')}>
          Back to Assessments
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      <h1 className="text-2xl font-bold text-gray-900">Your Motivational Gifts Results</h1>

      {/* Primary Gift */}
      <Card className="p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-semibold mb-4">Primary Motivational Gift</h2>
        <div className="space-y-4">
          <p className="text-2xl font-medium text-indigo-400">{results.primary_gift}</p>
          <p className="text-gray-300">{results.descriptions.primary.description}</p>
          <div className="mt-4 bg-gray-800 p-6 rounded-lg">
            <h3 className="font-medium text-gray-200 mb-3">Key Characteristics</h3>
            <p className="text-gray-300 whitespace-pre-line">
              {results.descriptions.primary.details}
            </p>
          </div>
        </div>
      </Card>

      {/* Secondary Gifts */}
      <Card className="p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-semibold mb-4">Supporting Motivational Gifts</h2>
        <div className="space-y-6">
          {results.secondary_gifts.map((gift, index) => (
            <div key={gift} className="space-y-2">
              <p className="text-xl font-medium text-indigo-400">{gift}</p>
              <p className="text-gray-300">
                {results.descriptions.secondary[index].description}
              </p>
              <div className="mt-4 bg-gray-800 p-6 rounded-lg">
                <h3 className="font-medium text-gray-200 mb-3">Key Characteristics</h3>
                <p className="text-gray-300 whitespace-pre-line">
                  {results.descriptions.secondary[index].details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Gift Scores */}
      <Card className="p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-semibold mb-6">Gift Assessment Breakdown</h2>
        <p className="text-sm text-gray-400 mb-4">Based on the Romans 12:6-8 motivational gifts framework</p>
        <div className="space-y-4">
          {Object.entries(results.scores)
            .sort(([, a], [, b]) => b - a)
            .map(([gift, score]) => (
              <div key={gift} className="flex items-center justify-between">
                <span className="text-gray-200 font-medium">{gift}</span>
                <div className="flex items-center space-x-4">
                  <div className="w-48 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round(score * 100)}%` }}
                    />
                  </div>
                  <span className="text-indigo-400 w-12 text-right">
                    {Math.round(score * 100)}%
                  </span>
                </div>
              </div>
            ))}
        </div>
      </Card>

      {results.recommended_roles && (
        <Card className="p-6 bg-gray-900 text-white">
          <h2 className="text-2xl font-semibold mb-6">Recommended Ministry Roles</h2>
          <RecommendedRoles initialRoles={results.recommended_roles} />
        </Card>
      )}

      <div className="flex justify-center">
        <Button 
          onClick={() => router.push('/dashboard/assessments')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Back to Assessments
        </Button>
      </div>
    </div>
  );
}