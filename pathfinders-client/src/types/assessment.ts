export interface Question {
  id: number;
  category: string;
  text: string;
  weight: number;
  gift_correlation: Record<string, number>;
}

export interface Answer {
  question_id: number;
  answer: number;
  gift_correlation: Record<string, number>;
}

export interface GiftDescription {
  gift: string;
  description: string;
  details: string;
}

export interface RoleRecommendations {
  primary_roles: string[];
  secondary_roles: string[];
  ministry_areas: string[];
}

export interface AssessmentResult {
  scores: Record<string, number>;
  primary_gift: string;
  secondary_gifts: string[];
  descriptions: {
    primary: GiftDescription;
    secondary: GiftDescription[];
  };
  recommended_roles: RoleRecommendations;
} 