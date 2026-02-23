import { CalendarOutlined } from '@ant-design/icons';
import { Col, Row, Select, Space, Typography } from 'antd';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import ChartCard from '@/components/ChartCard';
import OverviewCard from '@/components/OverviewCard';
import { useDashboardChart } from '@/hooks/dashBoard/useDashboardChart';
import { useDashboardOverview } from '@/hooks/dashBoard/useDashboardOverview';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Home() {
  const [overviewId, setOverviewId] = useState<number>(
    Number(localStorage.getItem('dashboardOverviewId')) || 0,
  );

  const { data: overviewData, isLoading: overviewLoading } = useDashboardOverview(overviewId);

  const { data: chartData, isLoading: chartLoading } = useDashboardChart(overviewId);

  const changeId = (value: number) => {
    setOverviewId(value);
    localStorage.setItem('dashboardOverviewId', value.toString());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <Row gutter={[16, 16]} align="middle" justify="space-between" wrap>
        <Col xs={24} sm={12} md={8}>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarOutlined style={{ color: '#6366F1' }} />
            <FormattedMessage id="dashboard.overview" defaultMessage="数据概览" />
          </Title>
        </Col>
        <Col xs={24} sm={12} md={8} style={{ textAlign: 'right' }}>
          <Space wrap>
            <Text type="secondary">
              <FormattedMessage id="overview.timeRange" defaultMessage="时间范围" />:
            </Text>
            <Select
              value={overviewId}
              onChange={(value) => changeId(Number(value))}
              style={{ width: 140 }}
            >
              <Option value={0}>
                <FormattedMessage id="overview.all" defaultMessage="全部" />
              </Option>
              <Option value={1}>
                <FormattedMessage id="overview.1day" defaultMessage="最近1天" />
              </Option>
              <Option value={7}>
                <FormattedMessage id="overview.7day" defaultMessage="最近7天" />
              </Option>
              <Option value={30}>
                <FormattedMessage id="overview.30day" defaultMessage="最近30天" />
              </Option>
            </Select>
          </Space>
        </Col>
      </Row>

      <OverviewCard data={overviewData} loading={overviewLoading} />
      <ChartCard data={chartData || { pageviews: [], sessions: [] }} loading={chartLoading} />
    </div>
  );
}
