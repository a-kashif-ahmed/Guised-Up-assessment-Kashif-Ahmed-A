import api from './api';
import { PaginatedResponse, Post } from '../types';

export async function getFeed(page = 1): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<Post>>('/feed', {
    params: { page },
  });
  return response.data;
}

export async function refreshFeed(): Promise<PaginatedResponse<Post>> {
  const response = await api.get<PaginatedResponse<Post>>('/feed/refresh');
  return response.data;
}

export async function getFeedStats(): Promise<unknown> {
  const response = await api.get('/feed/stats');
  return response.data;
}
