'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { CareerChoice, CareerResearchNote } from '@/types/book';
import { booksApi } from '@/services/books';
import { CareerChoiceForm } from '@/components/books/career-choice-form';
import { ResearchNotes } from '@/components/books/research-notes';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PencilIcon, StarIcon } from 'lucide-react';

export default function CareerPlanningPage() {
  const params = useParams();
  const bookId = parseInt(params.id as string);
  const [loading, setLoading] = useState(true);
  const [careerChoice, setCareerChoice] = useState<CareerChoice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const choices = await booksApi.getCareerChoices(bookId);
        console.log('Career choices loaded:', choices);
        
        // Check if choices is an object (single choice) or array
        if (choices) {
          // If it's a single object, use it directly
          if (!Array.isArray(choices)) {
            setCareerChoice(choices);
          } 
          // If it's an array with items, use the first one
          else if (choices.length > 0) {
            setCareerChoice(choices[0]);
          }
          // Otherwise, leave as null for new choices
          else {
            setCareerChoice(null);
            setShowForm(true);
          }
        }
      } catch (error) {
        console.error('Failed to load career planning data:', error);
        toast.error('Failed to load career planning data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [bookId]);

  const handleChoiceMade = useCallback((choice: CareerChoice) => {
    if (!choice) {
      console.error('No choice data received');
      return;
    }
    console.log('Setting career choice:', choice);
    setCareerChoice(choice);
    setIsEditing(false);
  }, []);

  const handleNoteAdded = useCallback((note: CareerResearchNote) => {
    setCareerChoice(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        research_notes: [...prev.research_notes, note]
      };
    });
  }, []);

  // Debug log to track state changes
  useEffect(() => {
    console.log('Career choice state updated:', careerChoice);
  }, [careerChoice]);

  console.log('Current career choice:', careerChoice);

  if (loading) {
    return <Loading size="large" />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200/50 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Career Planning</h1>
            <p className="mt-2 text-gray-600">Plan and track your career journey</p>
          </div>
          {!careerChoice && !showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2"
            >
              Get Started
            </Button>
          )}
        </div>
      </div>

      {!careerChoice && !showForm && (
        <Card className="bg-white shadow-lg border-0 overflow-hidden p-6 text-center">
          <div className="max-w-md mx-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Start Your Career Planning
            </h2>
            <p className="text-gray-600 mb-6">
              Begin by identifying your career choices and creating a plan for your professional journey.
            </p>
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full md:w-auto"
            >
              Create Career Plan
            </Button>
          </div>
        </Card>
      )}

      {careerChoice && (
        <Card className="bg-white shadow-lg border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500/5 to-blue-500/5 p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Career Choices</h2>
                <p className="mt-1 text-gray-600">Selected career paths based on your interests</p>
              </div>
              {!isEditing && (
                <Button 
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  Edit Choices
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {careerChoice.career_choice_1 && (
                <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-indigo-600 uppercase tracking-wide">
                        Primary Choice
                      </h3>
                      <p className="mt-2 text-xl font-semibold text-gray-900">
                        {careerChoice.career_choice_1.title}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                      <StarIcon className="h-5 w-5 text-indigo-600" />
                    </span>
                  </div>
                </div>
              )}
              
              {careerChoice.career_choice_2 && (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-emerald-600 uppercase tracking-wide">
                        Secondary Choice
                      </h3>
                      <p className="mt-2 text-xl font-semibold text-gray-900">
                        {careerChoice.career_choice_2.title}
                      </p>
                    </div>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                      <StarIcon className="h-5 w-5 text-emerald-600" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {careerChoice.additional_notes && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">
                  Your Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-line">
                  {careerChoice.additional_notes}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {(isEditing || showForm) ? (
        <CareerChoiceForm
          bookId={bookId}
          onChoiceMade={(choice) => {
            handleChoiceMade(choice);
            setShowForm(false);
          }}
          initialChoice={careerChoice}
          onCancel={() => {
            setIsEditing(false);
            setShowForm(false);
          }}
        />
      ) : careerChoice ? (
        <ResearchNotes
          careerChoice={careerChoice}
          onNoteAdded={handleNoteAdded}
        />
      ) : null}
    </div>
  );
} 