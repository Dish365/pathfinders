import { api } from '@/lib/api';
import { BookWithProgress, Category, Career, CareerChoice, CareerResearchNote, CareerBookmark } from '@/types/book';

export const booksApi = {
  getMyLibrary: async (): Promise<BookWithProgress[]> => {
    const response = await api.get('/api/books/my_library/');
    return response.data;
  },

  getTableOfContents: async (bookId: number): Promise<Category[]> => {
    try {
      const response = await api.get(`/api/books/${bookId}/table_of_contents/`);
      if (!response.data) {
        throw new Error('No data received from table of contents endpoint');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching table of contents:', error);
      throw error;
    }
  },

  getCurrentPosition: async (bookId: number) => {
    try {
      const response = await api.get(`/api/books/${bookId}/current_position/`);
      return response.data || {
        current_category: null,
        completion_percentage: 0,
        last_position: null
      };
    } catch (error) {
      console.error('Error fetching current position:', error);
      throw error;
    }
  },

  savePosition: async (bookId: number, data: {
    current_category: number;
    completion_percentage: number;
    last_position: number;
    completed?: boolean;
    read_duration?: number;
  }) => {
    const response = await api.post(`/api/books/${bookId}/save_position/`, data);
    return response.data;
  },

  getCareers: async (bookId: number): Promise<Career[]> => {
    const response = await api.get(`/api/books/${bookId}/careers/`);
    return response.data;
  },

  bookmarkCareer: async (
    bookId: number, 
    data: { 
      career_id: number;
      notes: string;
    }
  ): Promise<CareerBookmark> => {
    const response = await api.post(`/api/books/${bookId}/bookmark_career/`, data);
    return response.data;
  },

  getReadingHistory: async (bookId: number) => {
    const response = await api.get(`/api/books/${bookId}/reading_history/`);
    return response.data;
  },

  getBookmarks: async (bookId: number): Promise<CareerBookmark[]> => {
    try {
      const response = await api.get(`/api/books/${bookId}/bookmarks/`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  },

  updateBookmark: async (bookId: number, bookmarkId: number, data: { notes: string }) => {
    const response = await api.patch(
      `/api/books/${bookId}/bookmarks/${bookmarkId}/`,
      data
    );
    return response.data;
  },

  deleteBookmark: async (bookId: number, bookmarkId: number): Promise<void> => {
    try {
      await api.delete(`/api/books/${bookId}/remove_bookmark/${bookmarkId}/`);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  },

  getCareerChoices: async (bookId: number) => {
    const response = await api.get(`/api/books/${bookId}/career_choices/`);
    return response.data;
  },

  createCareerChoice: async (bookId: number, data: {
    career_choice_1?: number;
    career_choice_2?: number;
    additional_notes?: string;
  }) => {
    const response = await api.post(`/api/books/${bookId}/career_choices/`, data);
    return response.data;
  },

  updateCareerChoice: async (
    choiceId: number,
    data: Partial<CareerChoice>
  ): Promise<CareerChoice> => {
    const response = await api.patch(`/api/career-choices/${choiceId}/`, data);
    return response.data;
  },

  markCareerChoiceAsFinal: async (choiceId: number): Promise<{ status: string }> => {
    const response = await api.post(`/api/career-choices/${choiceId}/mark_as_final/`);
    return response.data;
  },

  addResearchNote: async (
    choiceId: number,
    data: {
      note_type: CareerResearchNote['note_type'];
      content: string;
    }
  ): Promise<CareerResearchNote> => {
    const response = await api.post(
      `/api/career-choices/${choiceId}/add_note/`,
      data
    );
    return response.data;
  },

  updateResearchNote: async (
    noteId: number,
    data: Partial<CareerResearchNote>
  ): Promise<CareerResearchNote> => {
    const response = await api.patch(`/api/career-notes/${noteId}/`, data);
    return response.data;
  },

  deleteResearchNote: async (noteId: number): Promise<void> => {
    await api.delete(`/api/career-notes/${noteId}/`);
  }
}; 