import { apiClient } from './api.client';
import type { CreateReportPayload } from '../types/auth';

export async function submitReport(payload: CreateReportPayload): Promise<{ id: string }> {
  const { data } = await apiClient.post<{ id: string }>('/reports', payload);
  return data;
}
