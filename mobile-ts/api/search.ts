import api from './api';
import { Post } from '../types';

export interface SearchResponse {
  success: boolean;
  query: string;
  count: number;
  data: Post[];
}

export async function search(query: string): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>('/search', {
    params: { q: query },
  });
  return response.data;
}
