  import api from './api';
  import { saveToken, removeToken } from '../storage/token';
  import { AuthResponse, User } from '../types';

  export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }

  export async function register(data: RegisterPayload): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', data);
    await saveToken(response.data.token);
    return response.data;
  }

  export async function login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', { email, password });
    await saveToken(response.data.token);
    return response.data;
  }

  export async function logout(): Promise<void> {
    await api.post('/logout');
    await removeToken();
  }

  export async function me(): Promise<{ user: User }> {
    const response = await api.get<{ user: User }>('/me');
    return response.data;
  }
