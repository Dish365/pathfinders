'use client';

import { useEffect, useState, useRef } from 'react';
import { booksApi } from '@/services/books';
import { Category, ReadingProgress } from '@/types/book';
import { Loading } from '@/components/ui/loading';
import { TableOfContents } from './table-of-contents';
import { CareerList } from './career-list';
import { ReadingProgressBar } from './reading-progress-bar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface BookReaderProps {
  bookId: number;
}

export function BookReader({ bookId }: BookReaderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentProgress, setCurrentProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const readingStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    async function initializeReader() {
      try {
        setLoading(true);
        
        // Fetch table of contents first
        const toc = await booksApi.getTableOfContents(bookId);
        if (!toc || toc.length === 0) {
          setError('No content available for this book');
          return;
        }
        setCategories(toc);
        
        // Then fetch current progress
        const progress = await booksApi.getCurrentPosition(bookId);
        setCurrentProgress(progress);
        
        // Set active category
        setActiveCategory(progress?.current_category ? 
          parseInt(progress.current_category) : 
          toc[0]?.id || null
        );
        
      } catch (error) {
        console.error('Failed to initialize reader:', error);
        setError('Failed to load book content. Please try again later.');
        toast.error('Failed to load book content');
      } finally {
        setLoading(false);
      }
    }
    
    initializeReader();
  }, [bookId]);

  useEffect(() => {
    // Start tracking reading time when component mounts
    readingStartTimeRef.current = new Date();

    // Save reading time when component unmounts
    return () => {
      if (readingStartTimeRef.current && activeCategory) {
        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - readingStartTimeRef.current.getTime()) / 1000);
        
        booksApi.savePosition(bookId, {
          current_category: activeCategory,
          completion_percentage: currentProgress?.completion_percentage || 0,
          last_position: Date.now(),
          read_duration: duration
        }).catch(console.error);
      }
    };
  }, [activeCategory, bookId, currentProgress?.completion_percentage]);

  const handleCategoryChange = async (categoryId: number) => {
    // Save reading time for previous category before changing
    if (readingStartTimeRef.current && activeCategory) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - readingStartTimeRef.current.getTime()) / 1000);
      
      try {
        await booksApi.savePosition(bookId, {
          current_category: activeCategory,
          completion_percentage: currentProgress?.completion_percentage || 0,
          last_position: Date.now(),
          read_duration: duration,
          completed: true
        });
      } catch (error) {
        console.error('Failed to save reading position:', error);
        toast.error('Failed to save your progress');
      }
    }

    setActiveCategory(categoryId);
    readingStartTimeRef.current = new Date();
    try {
      const currentIndex = categories.findIndex(c => c.id === categoryId);
      const previousCategory = categories.find(c => c.id === activeCategory);
      const newProgress = ((currentIndex + 1) / categories.length) * 100;
      
      // Update local progress state
      setCurrentProgress(prev => prev ? {
        ...prev,
        current_category: categoryId.toString(),
        completion_percentage: newProgress,
        last_accessed: prev.last_accessed || null
      } : {
        current_category: categoryId.toString(),
        completion_percentage: newProgress,
        last_accessed: null
      });

      await booksApi.savePosition(bookId, {
        current_category: categoryId,
        completion_percentage: newProgress,
        last_position: Date.now(),
        completed: previousCategory ? true : false
      });
    } catch (error) {
      console.error('Failed to save reading position:', error);
      toast.error('Failed to save your progress');
    }
  };

  if (loading) {
    return <Loading size="large" />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.history.back()}>
          Return to Library
        </Button>
      </div>
    );
  }

  const currentCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Left sidebar - Table of Contents - Made narrower */}
      <div className="w-64 border-r border-slate-200 bg-white shadow-lg p-4 overflow-y-auto">
        <TableOfContents 
          categories={categories}
          activeCategory={activeCategory}
          onCategorySelect={handleCategoryChange}
        />
      </div>

      {/* Main content area - Wider with improved content styling */}
      <div className="flex-1 flex flex-col">
        <ReadingProgressBar 
          progress={currentProgress?.completion_percentage || 0}
          category={currentCategory?.title || ''}
        />
        
        <div className="flex-1 p-8 overflow-y-auto">
          {currentCategory && (
            <div className="max-w-5xl mx-auto"> {/* Increased max width */}
              {/* Category Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-3">
                  {currentCategory.title}
                </h1>
                <div className="flex items-center text-slate-600 border-b border-slate-200 pb-6">
                  <span className="text-sm font-medium">
                    Section {categories.findIndex(c => c.id === currentCategory.id) + 1} of {categories.length}
                  </span>
                </div>
              </div>

              {/* Main Content with improved typography and spacing */}
              <div className="prose max-w-none mb-12">
                <div className="text-slate-700 text-lg leading-relaxed space-y-6 
                  bg-white rounded-xl shadow-sm border border-slate-200/50 p-8"
                >
                  {currentCategory.description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-lg text-slate-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
                
              {/* Careers Section */}
              {currentCategory.careers.length > 0 && (
                <div className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-6">
                    <h2 className="text-xl font-semibold text-white">
                      Career Opportunities
                    </h2>
                    <p className="mt-1 text-slate-300 text-sm">
                      Explore potential career paths in {currentCategory.title}
                    </p>
                  </div>
                  
                  <div className="p-6">
                    <CareerList 
                      careers={currentCategory.careers}
                      bookId={bookId}
                    />
                  </div>
                </div>
              )}

              {/* Navigation Footer */}
              <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center">
                {categories.findIndex(c => c.id === currentCategory.id) > 0 && (
                  <Button
                    onClick={() => {
                      const prevIndex = categories.findIndex(c => c.id === currentCategory.id) - 1;
                      if (prevIndex >= 0) {
                        handleCategoryChange(categories[prevIndex].id);
                      }
                    }}
                    variant="outline"
                    className="px-4 py-2 bg-slate-900 text-white border-0 hover:bg-slate-800 
                      transition-all duration-200 rounded-xl"
                  >
                    ← Previous Section
                  </Button>
                )}
                {categories.findIndex(c => c.id === currentCategory.id) < categories.length - 1 && (
                  <Button
                    onClick={() => {
                      const nextIndex = categories.findIndex(c => c.id === currentCategory.id) + 1;
                      if (nextIndex < categories.length) {
                        handleCategoryChange(categories[nextIndex].id);
                      }
                    }}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next Section →
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 