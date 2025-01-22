import { Career } from '@/types/book';
import { Star, BookmarkIcon } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CareerItemProps {
  career: Career;
  onBookmark?: (careerId: number, notes: string) => void;
}

export function CareerItem({ career, onBookmark }: CareerItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setNotes('');
    }
  }, []);

  const handleBookmark = useCallback(async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onBookmark?.(career.id, notes);
      handleOpenChange(false);
    } catch (error) {
      console.error('Failed to bookmark:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [career.id, isSubmitting, notes, onBookmark, handleOpenChange]);

  // Convert possibility rating to stars and description
  const getPossibilityRating = (rating: string) => {
    switch (rating) {
      case 'HP': return {
        stars: 5,
        description: 'Highly Possible - Excellent match for your gift'
      };
      case 'VP': return {
        stars: 4,
        description: 'Very Possible - Strong match for your gift'
      };
      case 'P': return {
        stars: 3,
        description: 'Possible - Good match for your gift'
      };
      default: return {
        stars: 0,
        description: 'Rating unavailable'
      };
    }
  };

  const { stars, description } = getPossibilityRating(career.possibility_rating);

  return (
    <>
      <div className="bg-gray-900 rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xl text-white font-semibold mb-2">
            {career.title}
          </h3>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 
              text-white text-sm font-medium rounded-lg transition-all duration-200 
              hover:shadow-lg border-0 group"
          >
            <BookmarkIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
            <span>Bookmark</span>
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Possibility Rating: </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className="text-yellow-400">
                      {index < stars ? (
                        <Star className="w-5 h-5 fill-current" />
                      ) : (
                        <Star className="w-5 h-5" />
                      )}
                    </span>
                  ))}
                </TooltipTrigger>
                <TooltipContent className="bg-slate-800 text-white border-slate-700">
                  <p>{description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {career.description && (
            <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
              <h4 className="text-slate-300 font-medium mb-2 flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-400 rounded-full"></span>
                About this career
              </h4>
              <p className="text-slate-300 leading-relaxed">
                {career.description}
              </p>
            </div>
          )}

          {career.specializations && career.specializations.length > 0 && (
            <div>
              <h4 className="text-slate-400 font-medium mb-3">
                Specializations
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {career.specializations.map((spec) => (
                  <div 
                    key={spec.title}
                    className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50
                      hover:bg-slate-800/70 transition-all duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                      <span className="text-slate-200 text-sm">
                        {spec.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog 
        open={isDialogOpen} 
        onOpenChange={handleOpenChange}
      >
        <DialogContent className="bg-slate-900 text-white border-slate-800 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Add Career Bookmark
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-base">
              Add notes about why you are interested in this career path.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <label className="text-sm font-medium text-slate-400 block mb-1">
                Career
              </label>
              <p className="text-lg font-medium text-white">
                {career.title}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-400 block mb-2">
                Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this career..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500
                  focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 min-h-[120px]
                  rounded-lg resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
                className="bg-transparent border-slate-700 text-slate-300 
                  hover:bg-slate-800 hover:text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBookmark}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium
                  focus:ring-4 focus:ring-blue-600/20 transition-all duration-200"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Bookmark'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 