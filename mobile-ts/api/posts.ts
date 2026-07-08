import api from './api';
import { Post } from '../types';

export async function getPosts(): Promise<{ data: Post[] }> {
  const response = await api.get('/posts');
  return response.data;
}

export async function createPost(text: string, imageUrl: string | null = null): Promise<{ data: Post }> {
  const response = await api.post('/posts', {
    text_content: text,
    image_url: imageUrl,
  });
  return response.data;
}

export async function updatePost(id: number, text: string, imageUrl: string | null = null): Promise<{ data: Post }> {
  const response = await api.put(`/posts/${id}`, {
    text_content: text,
    image_url: imageUrl,
  });
  return response.data;
}

export async function deletePost(id: number) {
  return api.delete(`/posts/${id}`);
}
