'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Question, Answer } from '@/types/assessment';
import { assessmentApi } from '@/services/assessment';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';

export default function TakeAssessmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await assessmentApi.getQuestions();
      if (Array.isArray(data)) {
        setQuestions(data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load questions';
      console.error('Failed to load questions:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (value: number) => {
    const question = questions[currentIndex];
    setAnswers({
      ...answers,
      [question.id]: {
        question_id: question.id,
        answer: value,
        gift_correlation: question.gift_correlation
      }
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast.error('Please answer all questions');
      return;
    }

    setSubmitting(true);
    try {
      const formattedAnswers = Object.values(answers).map(answer => ({
        question_id: answer.question_id,
        answer: answer.answer,
        gift_correlation: Object.fromEntries(
          Object.entries(answer.gift_correlation).map(([k, v]) => [k.toUpperCase(), v])
        )
      }));

      const result = await assessmentApi.submitAnswers(formattedAnswers);
      
      if (result) {
        router.push('/dashboard/assessments/results');
      } else {
        throw new Error('No result received from assessment');
      }
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      console.error('Failed to submit assessment:', error);
      const errorMessage = err?.response?.data?.error || 
                          (error as Error)?.message || 
                          'Failed to submit assessment';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loading size="large" />
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-gray-600 mb-4">No questions available</p>
        <Button onClick={() => router.push('/dashboard/assessments')}>
          Back to Assessments
        </Button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4">
      <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <Card className="p-8 bg-white shadow-lg">
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            Question {currentIndex + 1} of {questions.length}
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {currentQuestion?.text}
          </h2>
        </div>

        <div className="space-y-3">
          {[
            { value: 0, label: "Never" },
            { value: 1, label: "Occasionally" },
            { value: 2, label: "Sometimes" },
            { value: 3, label: "Usually" },
            { value: 4, label: "Mostly" },
            { value: 5, label: "Always" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-4 text-left rounded-lg border transition-all duration-200
                ${answers[currentQuestion?.id]?.answer === option.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-indigo-200 hover:bg-gray-50 text-gray-700'
                }
                flex items-center justify-between group hover:text-gray-900
              `}
            >
              <span className={`text-base font-medium ${
                answers[currentQuestion?.id]?.answer === option.value
                  ? 'text-indigo-700'
                  : 'text-gray-700 group-hover:text-gray-900'
              }`}>
                {option.label}
              </span>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${answers[currentQuestion?.id]?.answer === option.value
                  ? 'border-indigo-500 bg-indigo-500'
                  : 'border-gray-400 group-hover:border-indigo-200'
                }`}
              >
                {answers[currentQuestion?.id]?.answer === option.value && (
                  <span className="text-white text-sm">✓</span>
                )}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="px-6"
          >
            Previous
          </Button>

          {currentIndex === questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={submitting || !answers[currentQuestion?.id]}
              className="px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              {submitting ? (
                <div className="flex items-center">
                  <Loading size="small" />
                  <span className="ml-2">Submitting...</span>
                </div>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={!answers[currentQuestion?.id]}
              className="px-6 bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </Button>
          )}
        </div>
      </Card>

      <div className="text-center text-sm text-gray-500">
        {Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete
      </div>
    </div>
  );
} 