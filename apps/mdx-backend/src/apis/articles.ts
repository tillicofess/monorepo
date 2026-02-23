import { http } from '@/lib/axios';

export const uploadArticle = async (data: { title: string; content: string }) => {
  return http.post('/articles/publish', data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const list = async (data: { page: number; pageSize: number }) => {
  return http.get('/articles/list', {
    params: data,
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getArticleDetail = async (id: string) => {
  return http.get(`/articles/detail/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const updateArticle = async (data: { id: string; title: string; content: string }) => {
  return http.put(
    `/articles/update/${data.id}`,
    {
      title: data.title,
      content: data.content,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};

export const deleteArticle = async (id: string) => {
  return http.delete(`/articles/delete/${id}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
