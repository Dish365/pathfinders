'use client';

import { useState } from 'react';
import { CareerChoice, CareerResearchNote } from '@/types/book';
import { booksApi } from '@/services/books';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {

} from "@/components/ui/select";
import { toast } from 'sonner';
import { BookOpen, HelpCircle, Target, Briefcase, Notebook } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResearchNotesProps {
  careerChoice: CareerChoice;
  onNoteAdded: (note: CareerResearchNote) => void;
}

const NOTE_TYPES = [
  { value: 'RESEARCH', label: 'Research Note', icon: BookOpen, color: 'text-blue-600' },
  { value: 'QUESTION', label: 'Question to Ask', icon: HelpCircle, color: 'text-purple-600' },
  { value: 'REQUIREMENT', label: 'Career Requirement', icon: Briefcase, color: 'text-emerald-600' },
  { value: 'GOAL', label: 'Career Goal', icon: Target, color: 'text-orange-600' },
  { value: 'OTHER', label: 'Other Note', icon: Notebook, color: 'text-gray-600' }
] as const;

export function ResearchNotes({ careerChoice, onNoteAdded }: ResearchNotesProps) {
  const [noteType, setNoteType] = useState<CareerResearchNote['note_type']>('RESEARCH');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!careerChoice) {
    console.warn('No career choice provided to ResearchNotes');
    return null;
  }

  const handleAddNote = async () => {
    if (!content.trim()) {
      toast.error('Please enter note content');
      return;
    }

    try {
      setIsSubmitting(true);
      const note = await booksApi.addResearchNote(careerChoice.id, {
        note_type: noteType,
        content: content.trim()
      });
      
      onNoteAdded(note);
      setContent('');
      toast.success('Research note added successfully');
    } catch (error) {
      console.error('Failed to add research note:', error);
      toast.error('Failed to add research note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-white shadow-lg border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900">Research Notes</h2>
        <p className="mt-1 text-gray-600">Track your career research and planning</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Note Form */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as CareerResearchNote['note_type'])}
                className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-gray-900
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-colors"
                aria-label="Select note type"
              >
                {NOTE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add your research notes, questions, or goals..."
                className="w-full min-h-[100px] bg-white border border-gray-300 rounded-lg p-3
                  text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 
                  focus:ring-blue-200/50 transition-colors resize-y"
              />
            </div>

            <Button
              onClick={handleAddNote}
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5
                rounded-lg shadow-sm hover:shadow transition-all duration-200"
            >
              {isSubmitting ? 'Adding Note...' : 'Add Note'}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-4">
          {careerChoice.research_notes.map((note) => (
            <div
              key={note.id}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300
                transition-colors duration-200 shadow-sm hover:shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                    {
                      'bg-blue-100 text-blue-800': note.note_type === 'RESEARCH',
                      'bg-purple-100 text-purple-800': note.note_type === 'QUESTION',
                      'bg-yellow-100 text-yellow-800': note.note_type === 'REQUIREMENT',
                      'bg-green-100 text-green-800': note.note_type === 'GOAL',
                      'bg-gray-100 text-gray-800': note.note_type === 'OTHER',
                    }
                  )}>
                    {note.note_type_display}
                  </span>
                  <p className="text-gray-900 mt-2">{note.content}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
} 