import { api } from '@/lib/api';
import { Question, Answer, AssessmentResult } from '@/types/assessment';

export const assessmentApi = {
  getQuestions: async (): Promise<Question[]> => {
    const response = await api.get('/api/questions/list_all/');
    return response.data;
  },

  submitAnswers: async (answers: Answer[]): Promise<AssessmentResult> => {
    try {
        const response = await api.post('/api/assessments/submit/', { 
            answers: answers 
        });
        
        if (!response.data) {
            throw new Error('No data received from server');
        }
        
        return response.data;
    } catch (error: unknown) {
        const err = error as { response?: { data?: { error?: string } } };
        if (err?.response?.data?.error) {
            throw new Error(err.response.data.error);
        }
        throw error;
    }
  },

  saveProgress: async (answers: Answer[]): Promise<void> => {
    await api.post('/api/assessments/save-progress/', { current_answers: answers });
  },

  getProgress: async (): Promise<Answer[]> => {
    const response = await api.get('/api/assessments/get-progress/');
    return response.data;
  },

  getLatestResults: async (): Promise<AssessmentResult> => {
    const response = await api.get('/api/assessments/latest-results/');
    return response.data;
  },

  getGiftDetails: async (): Promise<AssessmentResult> => {
    const response = await api.get('/api/assessments/latest-results/');
    return response.data;
  }
}; 