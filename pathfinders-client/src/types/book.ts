export interface Book {
  id: number;
  title: string;
  subtitle: string;
  associated_gift: string;
  slug: string;
  publication_info: {
    publisher: string;
    year: number;
    edition?: string;
  };
  version: string;
}

export interface BookDetail extends Book {
  copyright_info: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
}

export interface Category {
  id: number;
  title: string;
  description: string;
  order: number;
  slug: string;
  careers: Career[];
}

export interface CareerSpecialization {
  title: string;
  order: number;
}

export interface Career {
  id: number;
  title: string;
  description?: string;
  possibility_rating: 'HP' | 'VP' | 'P';
  category_name: string;
  order: number;
  parent?: number;
  specializations?: CareerSpecialization[];
}

export interface ReadingProgress {
  completion_percentage: number;
  last_accessed: string | null;
  current_category: string | null;
  completed?: boolean;
  read_duration?: number;
}

export interface BookAccess {
  granted_at: string;
  access_reason: 'PRIMARY' | 'SECONDARY' | 'PURCHASED';
  expires_at: string;
}

export interface BookWithProgress extends BookDetail {
  access_details: BookAccess;
  reading_progress: ReadingProgress;
  careerChoice?: CareerChoice;
}

export interface CareerResearchNote {
  id: number;
  note_type: 'RESEARCH' | 'QUESTION' | 'REQUIREMENT' | 'GOAL' | 'OTHER';
  note_type_display: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CareerChoice {
  id: number;
  career_choice_1?: Career;
  career_choice_2?: Career;
  additional_notes?: string;
  is_final: boolean;
  created_at: string;
  updated_at: string;
  research_notes: CareerResearchNote[];
  bookmarked_careers: CareerBookmark[];
}

export interface CareerBookmark {
  id: number;
  career_title: string;
  category_title: string;
  notes: string;
  created_at: string;
  updated_at: string;
} 