import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { assessmentApi } from '@/services/assessment';
import CounselorAssessmentManager from './CounselorAssessmentManager';
import { AssessmentSummary, UserAssessmentData } from '@/types/assessment';
import { api } from '@/lib/api';

interface User {
  id: number;
  full_name: string;
  email: string;
}

interface UserAssessmentListProps {
  user: User;
  refreshData?: () => void;
}

const UserAssessmentList: React.FC<UserAssessmentListProps> = ({ user, refreshData }) => {
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [assessmentCount, setAssessmentCount] = useState<number | null>(null);
  const [maxAssessments, setMaxAssessments] = useState<number>(3);
  const [canTakeMore, setCanTakeMore] = useState<boolean>(true);

  useEffect(() => {
    fetchUserAssessments();
  }, [user.id]);

  const fetchUserAssessments = async () => {
    try {
      setLoading(true);
      // Use the assessment API service instead of direct API call
      const data = await assessmentApi.getUserAssessments(user.id);
      
      setAssessments(data.assessments || []);
      setAssessmentCount(data.completed_count || 0);
      setMaxAssessments(data.max_limit || 3);
      setCanTakeMore(data.can_take_more);
      setError(null);
    } catch (err) {
      console.error('Error fetching user assessments:', err);
      setError('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssessment = () => {
    setShowCreateForm(true);
  };

  const handleAssessmentCreated = () => {
    fetchUserAssessments();
    if (refreshData) {
      refreshData();
    }
    setShowCreateForm(false);
  };

  const renderAssessmentStatus = () => {
    if (assessmentCount === null) return null;
    
    return (
      <div className={`p-3 rounded-md mb-4 ${canTakeMore ? 'bg-blue-50' : 'bg-red-50'}`}>
        <p className="text-sm">
          <span className="font-medium">Assessment Status:</span> {assessmentCount} of {maxAssessments} assessments completed
          {!canTakeMore && (
            <span className="block mt-1 text-red-600 font-medium">
              This user has reached their assessment limit.
              As a counselor, you can still create assessments for them.
            </span>
          )}
        </p>
      </div>
    );
  };

  if (loading && assessments.length === 0) {
    return <div className="text-gray-500">Loading assessments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Assessments for {user.full_name}</h3>
        <button
          onClick={handleCreateAssessment}
          className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md hover:bg-blue-700"
        >
          Create New Assessment
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {renderAssessmentStatus()}
      
      {showCreateForm && (
        <CounselorAssessmentManager 
          user={user} 
          onAssessmentCreated={handleAssessmentCreated} 
        />
      )}
      
      {assessments.length === 0 ? (
        <div className="text-gray-500 p-4 bg-gray-50 rounded-md text-center">
          No assessments found for this user.
        </div>
      ) : (
        <div className="space-y-3">
          {assessments.map((assessment) => (
            <div 
              key={assessment.id} 
              className="border border-gray-200 rounded-md p-4 hover:bg-gray-50"
            >
              <div className="flex justify-between">
                <h4 className="font-medium">{assessment.title}</h4>
                <span className={`text-sm ${assessment.completion_status ? 'text-green-600' : 'text-amber-600'}`}>
                  {assessment.completion_status ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mt-1">
                Created: {new Date(assessment.created_at).toLocaleDateString()}
              </div>
              
              {assessment.counselor_notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Counselor Notes:</div>
                  <p>{assessment.counselor_notes}</p>
                </div>
              )}
              
              <div className="mt-3 flex space-x-2">
                <Link 
                  href={`/counselor/assessments/${assessment.id}`} 
                  className="text-blue-600 text-sm hover:underline"
                >
                  View Details
                </Link>
                
                {assessment.completion_status && (
                  <Link 
                    href={`/counselor/assessments/${assessment.id}/results`} 
                    className="text-blue-600 text-sm hover:underline"
                  >
                    View Results
                  </Link>
                )}
                
                {!assessment.completion_status && (
                  <Link 
                    href={`/counselor/assessments/${assessment.id}/conduct`} 
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Conduct Assessment
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserAssessmentList; 