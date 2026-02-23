import useSWR from 'swr';
import { getDashboardData } from '@/apis/dashboard';
import { getTimeRange } from '@/utils/utils';

export const useDashboardOverview = (overviewId: number) => {
  const { startAt, endAt, unit } = getTimeRange(overviewId);

  return useSWR(
    ['/dashboard/overview', startAt, endAt, unit],
    async ([_, startAt, endAt, unit]) => {
      const res = await getDashboardData(startAt, endAt, unit);
      const { bounces, ...overview } = res.data;
      return overview;
    },
    {
      refreshInterval: 5000,
    },
  );
};
