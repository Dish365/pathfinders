import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { assessmentApi } from '@/services/assessment';
import { Loading } from '@/components/ui/loading';
import { toast } from 'sonner';
import { AssessmentResult } from '@/types/assessment';
import { Gift, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface GiftSummaryProps {
  giftSummary: {
    primary_gift: string;
    secondary_gifts: string[];
    last_assessment?: string;
  };
}

export function GiftSummary({ giftSummary }: GiftSummaryProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [giftDetails, setGiftDetails] = useState<AssessmentResult | null>({
    primary_gift: giftSummary.primary_gift,
    secondary_gifts: giftSummary.secondary_gifts,
    scores: {},
    recommended_roles: {
      primary_roles: [],
      secondary_roles: [],
      ministry_areas: []
    },
    descriptions: {
      primary: { 
        gift: giftSummary.primary_gift,
        description: '', 
        details: '' 
      },
      secondary: []
    }
  });

  // Fetch gift details on component mount
  useEffect(() => {
    const fetchGiftDetails = async () => {
      try {
        setLoading(true);
        const data = await assessmentApi.getGiftDetails();
        setGiftDetails(data);
      } catch (error) {
        console.error('Failed to fetch gift details:', error);
        toast.error('Failed to load gift details');
      } finally {
        setLoading(false);
      }
    };

    fetchGiftDetails();
  }, []); // Only fetch once on mount

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loading size="large" />
      </div>
    );
  }

  if (!giftDetails) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <Gift className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Primary Gift</h3>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-lg p-4 mb-4">
          <p className="text-indigo-600 text-xl font-semibold mb-2">
            {giftDetails.primary_gift}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {giftDetails.descriptions.primary.description}
          </p>
        </div>
        
        {showDetails && (
          <div className="bg-white shadow-sm border border-slate-200/50 rounded-lg p-6 mt-4 
            space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <p className="font-medium text-slate-900">Key characteristics:</p>
            </div>
            <p className="text-slate-600 whitespace-pre-line leading-relaxed">
              {giftDetails.descriptions.primary.details}
            </p>
          </div>
        )}
      </div>

      {giftDetails.secondary_gifts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Secondary Gifts</h3>
          <div className="space-y-6">
            {giftDetails.secondary_gifts.map((gift, index) => (
              <div key={gift} className="border-l-4 border-indigo-200 pl-4">
                <p className="text-indigo-600 text-lg font-medium mb-2">{gift}</p>
                {showDetails && giftDetails.descriptions.secondary[index] && (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      {giftDetails.descriptions.secondary[index].description}
                    </p>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">Key characteristics:</p>
                      <p className="text-gray-700 whitespace-pre-line">
                        {giftDetails.descriptions.secondary[index].details}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-center gap-2 py-3
          bg-gradient-to-r from-slate-900 to-slate-800 text-white 
          hover:from-slate-800 hover:to-slate-700
          transition-all duration-200 shadow-sm hover:shadow-md"
        disabled={loading}
      >
        {loading ? (
          <Loading size="small" />
        ) : showDetails ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Show Details
          </>
        )}
      </Button>
    </div>
  );
} 