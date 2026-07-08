import api from './api';

export type InteractionType = 'view' | 'reply' | 'reaction';

/**
 * Only /api/interactions actually exists on the backend.
 * (The old JS version referenced /posts/{id}/view etc. which
 * were never real routes - removed here to avoid dead 404 calls.)
 */
export async function addInteraction(postId: number, type: InteractionType) {
  const response = await api.post('/interactions', {
    post_id: postId,
    type,
  });
  return response.data;
}

export const viewPost = (postId: number) => addInteraction(postId, 'view');
export const react = (postId: number) => addInteraction(postId, 'reaction');
export const reply = (postId: number) => addInteraction(postId, 'reply');
