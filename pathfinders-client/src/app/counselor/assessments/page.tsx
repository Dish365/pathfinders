'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { assessmentApi } from '@/services/assessment';
import { AssessmentSummary } from '@/types/assessment';

interface CounselorAssessment {
  id: number;
  title: string;
  description?: string;
  user_name: string;
  user_id: number;
  created_at: string;
  completion_status: boolean;
  counselor_notes?: string;
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<CounselorAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/counselor-assessments/');
      setAssessments(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching assessments:', err);
      setError(err.response?.data?.error || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assessments</h1>
        <Link
          href="/counselor/assessments/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Create New Assessment
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul className="divide-y divide-gray-200">
          {assessments.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              No assessments found. Create an assessment for a user to get started.
            </li>
          ) : (
            assessments.map((assessment) => (
              <li key={assessment.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/counselor/assessments/${assessment.id}`}
                      className="text-lg font-medium text-blue-600 hover:underline"
                    >
                      {assessment.title || "Motivational Gift Assessment"}
                    </Link>
                    <p className="text-sm text-gray-500">
                      For: {assessment.user_name} · Created: {new Date(assessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full mr-4 ${
                      assessment.completion_status 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {assessment.completion_status ? 'Completed' : 'Pending'}
                    </span>
                    <div className="flex space-x-2">
                      <Link
                        href={`/counselor/assessments/${assessment.id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Link>
                      {!assessment.completion_status && (
                        <Link
                          href={`/counselor/assessments/${assessment.id}/conduct`}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          Conduct
                        </Link>
                      )}
                      {assessment.completion_status && (
                        <Link
                          href={`/counselor/assessments/${assessment.id}/results`}
                          className="text-sm text-purple-600 hover:text-purple-800"
                        >
                          Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
} 