'use client';

import { Career } from '@/types/book';
import { CareerItem } from './career-item';
import { booksApi } from '@/services/books';
import { toast } from 'sonner';

interface CareerListProps {
  careers: Career[];
  bookId: number;
}

export function CareerList({ careers, bookId }: CareerListProps) {
  const handleBookmark = async (careerId: number, notes: string) => {
    try {
      await booksApi.bookmarkCareer(bookId, { 
        career_id: careerId,
        notes: notes 
      });
      toast.success('Career bookmarked successfully');
    } catch (error) {
      console.error('Failed to bookmark career:', error);
      toast.error('Failed to bookmark career');
    }
  };

  // Sort careers by order
  const sortedCareers = [...careers].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedCareers.map((career) => (
        <CareerItem
          key={career.id}
          career={career}
          onBookmark={handleBookmark}
        />
      ))}
    </div>
  );
} 