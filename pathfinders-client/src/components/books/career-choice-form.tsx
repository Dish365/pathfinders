'use client';

import { useState, useEffect } from 'react';
import { CareerBookmark, CareerChoice } from '@/types/book';
import { booksApi } from '@/services/books';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ChevronDownIcon } from 'lucide-react';

interface CareerChoiceFormProps {
  bookId: number;
  onChoiceMade: (choice: CareerChoice) => void;
  initialChoice?: CareerChoice | null;
  onCancel?: () => void;
}

export function CareerChoiceForm({ bookId, onChoiceMade, initialChoice, onCancel }: CareerChoiceFormProps) {
  const [bookmarks, setBookmarks] = useState<CareerBookmark[]>([]);
  const [choice1, setChoice1] = useState<number | null>(initialChoice?.career_choice_1?.id || null);
  const [choice2, setChoice2] = useState<number | null>(initialChoice?.career_choice_2?.id || null);
  const [notes, setNotes] = useState(initialChoice?.additional_notes || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBookmarks() {
      try {
        const data = await booksApi.getBookmarks(bookId);
        setBookmarks(data);
      } catch (error) {
        console.error('Failed to load bookmarks:', error);
        toast.error('Failed to load bookmarked careers');
      } finally {
        setLoading(false);
      }
    }
    loadBookmarks();
  }, [bookId]);

  const handleSubmit = async () => {
    if (!choice1) {
      toast.error('Please select at least one career choice');
      return;
    }

    try {
      const choice = await booksApi.createCareerChoice(bookId, {
        career_choice_1: choice1,
        career_choice_2: choice2 || undefined,
        additional_notes: notes.trim()
      });
      
      console.log('Server response:', choice);
      onChoiceMade(choice);
      toast.success('Career choices saved successfully');
    } catch (error) {
      console.error('Failed to save career choices:', error);
      toast.error('Failed to save career choices');
    }
  };

  if (loading) {
    return <div>Loading bookmarked careers...</div>;
  }

  if (bookmarks.length === 0) {
    return (
      <Card className="p-8 bg-gradient-to-br from-slate-900 to-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4">Make Career Choices</h2>
        <p className="text-slate-300 leading-relaxed">
          You have not bookmarked any careers yet. Read through the book and bookmark 
          careers you are interested in to make your career choices.
        </p>
        <div className="mt-6 border-t border-slate-700 pt-6">
          <Button 
            variant="outline" 
            className="text-white border-slate-600 hover:bg-slate-700"
            onClick={() => window.history.back()}
          >
            Return to Book
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-2xl border-0 rounded-2xl overflow-hidden">
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }} className="p-8 space-y-8">
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 -m-8 mb-0 p-8 border-b border-slate-800">
          <h2 className="text-2xl font-bold text-white">Select Your Career Choices</h2>
          <p className="mt-2 text-slate-300">
            Choose from your bookmarked careers to plan your future path
          </p>
        </div>

        <div className="space-y-8">
          <div className="group">
            <label className="flex items-center text-lg font-semibold text-slate-800 mb-3">
              Primary Career Choice
              <span className="text-red-500 ml-1.5">*</span>
              <span className="ml-2 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Required
              </span>
            </label>
            <div className="relative">
              <select
                aria-label="Primary Career Choice"
                value={choice1 || ''}
                onChange={(e) => setChoice1(Number(e.target.value) || null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-slate-800
                  focus:border-blue-600 focus:ring-4 focus:ring-blue-100 
                  transition-all duration-200 appearance-none hover:border-blue-400
                  shadow-sm group-hover:shadow-lg"
              >
                <option value="">Select your primary career path</option>
                {bookmarks.map((bookmark) => (
                  <option key={bookmark.id} value={bookmark.id}>
                    {bookmark.career_title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDownIcon className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center text-lg font-semibold text-slate-800 mb-3">
              Secondary Career Choice
              <span className="ml-2 px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                Optional
              </span>
            </label>
            <div className="relative">
              <select
                aria-label="Secondary Career Choice"
                value={choice2 || ''}
                onChange={(e) => setChoice2(Number(e.target.value) || null)}
                className="w-full bg-white border-2 border-slate-200 rounded-xl p-4 text-slate-800
                  focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100
                  transition-all duration-200 appearance-none hover:border-emerald-400
                  shadow-sm group-hover:shadow-lg"
              >
                <option value="">Select an alternative career path</option>
                {bookmarks.map((bookmark) => (
                  <option key={bookmark.id} value={bookmark.id}>
                    {bookmark.career_title}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <ChevronDownIcon className="h-5 w-5 text-slate-500" />
              </div>
            </div>
          </div>

          <div className="group">
            <label className="flex items-center text-lg font-semibold text-slate-800 mb-3">
              Why did you choose these careers?
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Share your thoughts on why these career paths interest you..."
              className="w-full min-h-[160px] bg-white border-2 border-slate-200 rounded-xl p-4
                text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-4 
                focus:ring-blue-100 transition-all duration-200 resize-y
                shadow-sm hover:border-blue-400 group-hover:shadow-lg"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="px-8 py-3 bg-slate-900 text-white hover:bg-slate-800 
                  font-medium transition-all duration-200 rounded-xl
                  focus:ring-4 focus:ring-slate-200 border-0"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                rounded-xl shadow-lg hover:shadow-blue-200/50 transition-all duration-200
                focus:ring-4 focus:ring-blue-100 active:transform active:scale-[0.98]"
            >
              {initialChoice ? 'Update Choices' : 'Save Choices'}
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
} 