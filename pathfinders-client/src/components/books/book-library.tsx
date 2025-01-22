'use client';

import { useEffect, useState } from 'react';
import { booksApi } from '@/services/books';
import { BookWithProgress } from '@/types/book';
import { Loading } from '@/components/ui/loading';
import { BookCard } from './book-card';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

export function BookLibrary() {
  const [books, setBooks] = useState<BookWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const data = await booksApi.getMyLibrary();
        setBooks(data);
      } catch (error) {
        console.error('Failed to fetch books:', error);
        toast.error('Failed to load your books');
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="large" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No Books Available Yet
          </h3>
          <p className="text-slate-600">
            Complete your assessment to unlock your personalized book recommendations.
          </p>
        </div>
      </div>
    );
  }

  const primaryBooks = books.filter(
    book => book.access_details.access_reason === 'PRIMARY'
  );
  const secondaryBooks = books.filter(
    book => book.access_details.access_reason === 'SECONDARY'
  );

  return (
    <div className="space-y-12">
      {primaryBooks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <span className="block w-2 h-2 bg-blue-600 rounded-full"></span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Primary Gift Book
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
            {primaryBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book}
                badge={{
                  text: "Primary",
                  className: "bg-blue-50 text-blue-700"
                }}
              />
            ))}
          </div>
        </section>
      )}

      {secondaryBooks.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-1.5 bg-purple-50 rounded-lg">
              <span className="block w-2 h-2 bg-purple-600 rounded-full"></span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Secondary Gift Books
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
            {secondaryBooks.map((book) => (
              <BookCard 
                key={book.id} 
                book={book}
                badge={{
                  text: "Secondary",
                  className: "bg-purple-50 text-purple-700"
                }}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
} 