'use client';

import { useEffect, useState, useCallback } from 'react';
import { booksApi } from '@/services/books';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loading } from '@/components/ui/loading';

interface CareerBookmark {
  id: number;
  career_title: string;
  category_title: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface CareerBookmarksProps {
  bookId: number;
}

export function CareerBookmarks({ bookId }: CareerBookmarksProps) {
  const [bookmarks, setBookmarks] = useState<CareerBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedNotes, setEditedNotes] = useState('');

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const bookmarks = await booksApi.getBookmarks(bookId);
      setBookmarks(bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
      toast.error('Failed to load career bookmarks');
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleUpdateNotes = async (bookmarkId: number) => {
    try {
      await booksApi.updateBookmark(bookId, bookmarkId, { notes: editedNotes });
      toast.success('Bookmark updated successfully');
      setEditingId(null);
      loadBookmarks();
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleDeleteBookmark = async (bookmarkId: number) => {
    if (!confirm('Are you sure you want to remove this bookmark?')) return;
    
    try {
      await booksApi.deleteBookmark(bookId, bookmarkId);
      toast.success('Bookmark removed successfully');
      loadBookmarks();
    } catch (error) {
      console.error('Failed to delete bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loading size="default" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Bookmarked Careers</h2>
        <span className="text-sm font-medium text-gray-600">
          {bookmarks.length} {bookmarks.length === 1 ? 'Career' : 'Careers'} Bookmarked
        </span>
      </div>
      
      {bookmarks.length === 0 ? (
        <Card className="p-8 text-center bg-gray-50">
          <p className="text-gray-600 font-medium mb-2">
            No bookmarked careers yet
          </p>
          <p className="text-sm text-gray-500">
            Bookmark interesting careers while reading to keep track of them here
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookmarks.map((bookmark) => (
            <Card 
              key={bookmark.id} 
              className="p-5 bg-white hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {bookmark.career_title}
                  </h3>
                  <p className="text-sm font-medium text-indigo-700">
                    {bookmark.category_title}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(bookmark.id);
                      setEditedNotes(bookmark.notes);
                    }}
                    className="bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border-gray-300 hover:border-gray-400"
                  >
                    Edit Notes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBookmark(bookmark.id)}
                    className="text-red-700 hover:bg-red-50 hover:text-red-800"
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {editingId === bookmark.id ? (
                <div className="mt-4 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add your notes about this career..."
                      className="w-full min-h-[100px] bg-white border-gray-300 focus:border-indigo-600 focus:ring-indigo-600 text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="bg-white text-gray-800 hover:bg-gray-50 border-gray-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleUpdateNotes(bookmark.id)}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-3 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {bookmark.notes ? (
                    <p className="text-gray-800 whitespace-pre-line">
                      {bookmark.notes}
                    </p>
                  ) : (
                    <p className="text-gray-600 italic">
                      No notes added yet
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 