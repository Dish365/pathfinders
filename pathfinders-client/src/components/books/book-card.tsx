import { BookWithProgress } from '@/types/book';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { BookOpen, Clock, Activity } from 'lucide-react';

interface BadgeProps {
  text: string;
  className: string;
}

interface BookCardProps {
  book: BookWithProgress;
  badge?: BadgeProps;
}

export function BookCard({ book, badge }: BookCardProps) {
  return (
    <Card className="group h-full overflow-hidden bg-gradient-to-b from-white to-slate-50/50 
      border-slate-200/50 hover:border-slate-300/80 transition-all duration-200 
      hover:shadow-lg relative">
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 
        to-blue-50/20 rounded-bl-[100px] -z-0" />
      
      <div className="p-6 flex flex-col h-full relative z-10">
        {/* Badge */}
        {badge && (
          <div className={`self-end mb-4 px-3 py-1 rounded-full text-sm font-medium 
            backdrop-blur-sm shadow-sm ${badge.className}`}>
            {badge.text}
          </div>
        )}
        
        {/* Title Section */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 
            transition-colors duration-200">
            {book.title}
          </h3>
          {book.subtitle && (
            <p className="text-slate-600/90 text-sm leading-relaxed">{book.subtitle}</p>
          )}
        </div>
        
        {/* Content Section */}
        <div className="space-y-6 flex-grow">
          {/* Progress Bar */}
          <div className="bg-white/80 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-slate-600">Reading Progress</p>
              <span className="text-sm font-medium text-indigo-600">
                {book.reading_progress.completion_percentage}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-indigo-600 to-blue-500 h-2 rounded-full
                  transition-all duration-500 ease-out"
                style={{ width: `${book.reading_progress.completion_percentage}%` }}
              />
            </div>
          </div>

          {/* Career Choice Status */}
          {book.careerChoice && (
            <div className="flex items-center gap-3 py-3 px-4 rounded-lg bg-white/80 
              backdrop-blur-sm border border-slate-100">
              <Activity className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700">Career Choices</p>
                {book.careerChoice.is_final ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    Final Choice Made
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                    In Progress
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Reading Status Section */}
          <div className="bg-white/80 rounded-lg p-4 space-y-3 backdrop-blur-sm 
            border border-slate-100">
            {/* Current Reading Status */}
            {book.reading_progress.current_category && (
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Currently reading: <span className="font-medium text-slate-700">
                    {book.reading_progress.current_category}
                  </span>
                </p>
              </div>
            )}

            {/* Last Read Time */}
            {book.reading_progress.last_accessed && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400" />
                <p className="text-sm text-slate-600">
                  Last read: <span className="font-medium text-slate-700">
                    {formatDate(book.reading_progress.last_accessed)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link 
          href={`/dashboard/books/${book.id}`}
          className="mt-6 block w-full text-center bg-gradient-to-r from-indigo-600 to-blue-600 
            text-white py-2.5 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-blue-700 
            transition-all duration-200 shadow-sm hover:shadow-md"
        >
          {book.reading_progress.completion_percentage > 0 ? 'Continue Reading' : 'Start Reading'}
        </Link>
      </div>
    </Card>
  );
} 