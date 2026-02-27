// components/OverviewCard.tsx

import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, theme } from 'antd';
import type React from 'react';
import { FormattedMessage } from 'react-intl';

interface OverviewMetrics {
  pageviews: number;
  visitors: number;
  visits: number;
  totaltime: number;
}

interface OverviewData {
  pageviews: number;
  visitors: number;
  visits: number;
  totaltime: number;
  comparison: OverviewMetrics;
}

const METRIC_CONFIG = [
  { key: 'pageviews', icon: EyeOutlined, color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' },
  { key: 'visitors', icon: TeamOutlined, color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { key: 'visits', icon: FileTextOutlined, color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' },
  {
    key: 'totaltime',
    icon: ClockCircleOutlined,
    color: '#EC4899',
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
] as const;

type MetricKey = (typeof METRIC_CONFIG)[number]['key'];

const OverviewCard: React.FC<{ data: OverviewData; loading: boolean }> = ({ data, loading }) => {
  const { token } = theme.useToken();

  return (
    <Row gutter={[16, 16]}>
      {METRIC_CONFIG.map((config) => {
        const key = config.key as MetricKey;
        const value = data?.[key] ?? 0;
        const percent = data?.comparison?.[key] ?? 0;
        const isIncrease = percent >= 0;
        const IconComponent = config.icon;

        return (
          <Col xs={24} sm={12} xl={6} key={config.key}>
            <Card
              style={{
                borderRadius: 12,
                border: `1px solid ${token.colorBorderSecondary}`,
                boxShadow: token.boxShadow,
              }}
              styles={{ body: { padding: 20 } }}
            >
              {loading ? (
                <Skeleton paragraph={{ rows: 2 }} title={false} active></Skeleton>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div
                        style={{ fontSize: 13, color: token.colorTextSecondary, marginBottom: 4 }}
                      >
                        <FormattedMessage id={config.key} defaultMessage={config.key} />
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 600, color: token.colorText }}>
                        {key === 'totaltime'
                          ? `${Math.floor(value / 60)}m ${value % 60}s`
                          : value.toLocaleString()}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: config.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <IconComponent style={{ fontSize: 22, color: config.color }} />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: isIncrease ? token.colorSuccess : token.colorError,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>
                      <FormattedMessage id="overview.comparison" defaultMessage="同比" />:
                    </span>
                    {isIncrease ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(percent)}%
                  </div>
                </>
              )}
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default OverviewCard;
