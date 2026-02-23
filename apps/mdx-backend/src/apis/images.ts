import { http } from '@/lib/axios';

export const uploadImage = (data: FormData) => {
  return http.post('/cos/upload', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
