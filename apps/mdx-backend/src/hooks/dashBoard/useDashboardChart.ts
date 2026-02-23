import useSWR from 'swr';
import { getChartData } from '@/apis/dashboard';
import { fillMissingData, getTimeRange } from '@/utils/utils';

export const useDashboardChart = (overviewId: number) => {
  const { startAt, endAt, unit } = getTimeRange(overviewId);

  return useSWR(
    ['/dashboard/chart', startAt, endAt, unit],
    ([_, start, end, u]) =>
      getChartData(start, end, u).then((res) => ({
        pageviews: fillMissingData(res.data.pageviews, start, end, u),
        sessions: fillMissingData(res.data.sessions, start, end, u),
      })),
    { refreshInterval: 5000 },
  );
};
