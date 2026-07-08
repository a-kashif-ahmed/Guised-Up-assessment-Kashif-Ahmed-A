export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  text_content: string;
  image_url: string | null;
  authenticity_score?: number;
  score?: number;
  semantic_score?: number;
  created_at: string;
  user: User;
}

export interface PaginatedResponse<T> {
  success: boolean;
  current_page: number;
  per_page: number;
  has_more: boolean;
  count: number;
  data: T[];
}

export interface AuthResponse {
  token: string;
  user: User;
}
