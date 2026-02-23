// src/api/dashboard.ts
import axios from 'axios';

const timezone = 'Asia/Shanghai';

export const getDashboardData = (startAt: number, endAt: number, unit: string) => {
  return axios.get(`/umami/api/websites/${import.meta.env.VITE_WEB_ID}/stats`, {
    params: { startAt, endAt, unit, timezone },
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
    },
  });
};

export const getChartData = (startAt: number, endAt: number, unit: string) => {
  return axios.get(`/umami/api/websites/${import.meta.env.VITE_WEB_ID}/pageviews`, {
    params: { startAt, endAt, unit, timezone },
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
    },
  });
};
