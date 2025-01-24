'use client';

import { useEffect, useState } from 'react';
import { booksApi } from '@/services/books';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';

interface HistoryData {
  total_duration: string;
  categories_completed: number;
  last_read: string | null;
  detailed_history: {
    id: number;
    category_title: string;
    completed: boolean;
    completion_date: string | null;
    read_duration: string | null;
  }[];
}

interface ReadingHistoryProps {
  bookId: number;
}

export function ReadingHistory({ bookId }: ReadingHistoryProps) {
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await booksApi.getReadingHistory(bookId);
        console.log('Reading history data:', data); // Debug log
        setHistory(data);
      } catch (error) {
        console.error('Failed to fetch reading history:', error);
        setError('Failed to load reading history');
        toast.error('Failed to load reading history');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [bookId]);

  const formatLastRead = (timestamp: string | null) => {
    if (!timestamp) return 'Not started';
    
    const date = new Date(parseInt(timestamp) * 1000); // Convert Unix timestamp to Date
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5; // Get difference in hours
    
    if (diffInHours < 24) {
      // If less than 24 hours ago, show relative time
      if (diffInHours < 1) {
        const minutes = Math.floor(diffInHours * 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      // Format date for older timestamps
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return <Loading size="default" />;
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
      </div>
    );
  }

  if (!history) {
    return (
      <div className="text-center text-gray-600 py-4">
        No reading history available
      </div>
    );
  }

  return (
    <Card className="p-6 bg-white">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Reading History</h2>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-2xl font-bold text-indigo-700">
            {history.total_duration || '0m'}
          </p>
          <p className="text-sm font-medium text-gray-700">Total Time Spent</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-2xl font-bold text-indigo-700">
            {history.categories_completed}
          </p>
          <p className="text-sm font-medium text-gray-700">Sections Completed</p>
        </div>
        <div className="text-center p-4 bg-indigo-50 rounded-lg">
          <p className="text-2xl font-bold text-indigo-700">
            {formatLastRead(history.last_read)}
          </p>
          <p className="text-sm font-medium text-gray-700">Last Read</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 mb-4">Detailed History</h3>
        {history.detailed_history.length === 0 ? (
          <p className="text-center text-gray-700 py-4 bg-gray-50 rounded-lg">
            Start reading to track your progress
          </p>
        ) : (
          history.detailed_history.map((entry) => (
            <div
              key={entry.id}
              className="border-l-4 border-indigo-500 bg-white rounded-lg shadow-sm pl-4 py-3 hover:bg-indigo-50 transition-colors"
            >
              <p className="font-medium text-gray-900">
                {entry.category_title}
              </p>
              <div className="flex justify-between text-sm mt-1">
                <span className={`font-medium ${entry.completed ? 'text-green-600' : 'text-indigo-600'}`}>
                  {entry.completed ? '✓ Completed' : '⟳ In Progress'}
                  {entry.completion_date && ` on ${new Date(entry.completion_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}`}
                </span>
                {entry.read_duration && (
                  <span className="text-gray-700 font-medium">
                    Time spent: {entry.read_duration}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
} 