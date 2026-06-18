import { apiClient } from './api.client';
import type { Category, Interest } from '../types/auth';

export async function fetchInterests(): Promise<Interest[]> {
  const { data } = await apiClient.get<Interest[]>('/interests');
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}

export async function saveUserInterests(interestIds: string[]): Promise<Interest[]> {
  const { data } = await apiClient.put<Interest[]>('/users/me/interests', { interestIds });
  return data;
}
