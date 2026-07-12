import { apiClient } from './api.client';

type UploadResponse = { url: string };

export async function uploadActivityCover(localUri: string, fileName = 'cover.jpg'): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: fileName,
  } as unknown as Blob);

  const { data } = await apiClient.post<UploadResponse>('/uploads/activity-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.url;
}
