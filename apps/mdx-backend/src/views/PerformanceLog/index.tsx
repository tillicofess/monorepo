import { Card, Col, Row, Select, Skeleton, Space, Typography, theme } from 'antd';
import { Activity, BarChart3, Globe } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import useSWR from 'swr';
import BarChart from '@/views/PerformanceLog/components/performanceBar';
import WaterfallBarChart from '@/views/PerformanceLog/components/waterfallBar';
import { fetcher } from '@/lib/axios';
import type { PageLoadTiming, PerformanceData } from '@/views/PerformanceLog/types/performanceType';
import { METRIC_KEYS, performanceMetrics } from '@/views/PerformanceLog/types/performanceType';

const { Text, Title } = Typography;
const { Option } = Select;
const { useToken } = theme;

const PerformanceLog: React.FC = () => {
  const { token } = useToken();
  const { data: appData } = useSWR('/errorLogs/appNames', fetcher);

  const [selectedApp, setSelectedApp] = useState<string>('');
  const [selectedUrl, setSelectedUrl] = useState<string>('');

  const { data: urls } = useSWR(selectedApp ? `/errorLogs/urls/${selectedApp}` : null, fetcher);

  const { data: performanceLogs, isLoading: performanceLoading } = useSWR<PerformanceData[]>(
    selectedApp && selectedUrl
      ? `/errorLogs/pagePerformance?appName=${selectedApp}&url=${selectedUrl}`
      : null,
    fetcher,
  );

  const { data: waterfallData } = useSWR<PageLoadTiming>(
    selectedApp && selectedUrl
      ? `/errorLogs/waterfall?appName=${selectedApp}&url=${selectedUrl}`
      : null,
    fetcher,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 页面标题 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity style={{ color: '#10B981' }} />
          性能日志
        </Title>
      </div>

      {/* 项目和路由选择 */}
      <Card
        style={{
          borderRadius: 12,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
      >
        <Space wrap size="middle">
          <div>
            <Text strong style={{ marginRight: 8, display: 'block', marginBottom: 4 }}>
              <Globe size={14} style={{ marginRight: 4 }} />
              项目：
            </Text>
            <Select
              style={{ width: 200 }}
              value={selectedApp}
              onChange={(app: string) => {
                setSelectedApp(app);
                setSelectedUrl('');
              }}
              placeholder="请选择项目"
            >
              {appData?.map((app: string) => (
                <Option key={app} value={app}>
                  {app}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong style={{ marginRight: 8, display: 'block', marginBottom: 4 }}>
              <BarChart3 size={14} style={{ marginRight: 4 }} />
              路由：
            </Text>
            <Select
              style={{ minWidth: 400 }}
              value={selectedUrl}
              onChange={setSelectedUrl}
              placeholder="请选择路由"
              disabled={!selectedApp}
            >
              {urls?.map((url: string) => (
                <Option key={url} value={url}>
                  {url}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      {selectedApp && selectedUrl ? (
        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
          {/* 瀑布图 */}
          <Card
            title={
              <Space>
                <BarChart3 style={{ color: '#6366F1' }} />
                <Text strong>页面加载瀑布图</Text>
              </Space>
            }
            style={{
              borderRadius: 12,
              border: `1px solid ${token.colorBorder}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {waterfallData ? (
              <WaterfallBarChart {...waterfallData} />
            ) : (
              <div
                style={{
                  height: 400,
                  backgroundColor: token.colorBgContainer,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 8,
                }}
              >
                <Text type="secondary">暂无瀑布图数据</Text>
              </div>
            )}
          </Card>

          {/* 性能指标卡片 */}
          <Row gutter={[16, 16]}>
            {!performanceLoading && performanceLogs
              ? performanceLogs.map((metric: PerformanceData) => (
                <Col xs={24} lg={12} xl={6} key={metric.sub_type}>
                  <Card
                    title={
                      <Space>
                        <Text strong style={{ textTransform: 'uppercase' }}>
                          {metric.sub_type}
                        </Text>
                      </Space>
                    }
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${token.colorBorder}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <BarChart
                      metricKey={metric.sub_type}
                      p75={metric.p75}
                      {...performanceMetrics[metric.sub_type]}
                    />

                    <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                      <Col span={12}>
                        <Text type="secondary">
                          P75: {metric.p75}
                          {metric.sub_type !== 'cls' ? 'ms' : ''}
                        </Text>
                      </Col>
                      <Col span={12}>
                        <Text type="secondary">
                          P90: {metric.p90}
                          {metric.sub_type !== 'cls' ? 'ms' : ''}
                        </Text>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))
              : Array.from({ length: 4 }).map((_, i) => {
                return (
                  <Col xs={24} lg={12} xl={6} key={METRIC_KEYS[i]}>
                    <Card
                      title={
                        <Space>
                          <Text strong style={{ textTransform: 'uppercase' }}>
                            {METRIC_KEYS[i]}
                          </Text>
                        </Space>
                      }
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${token.colorBorder}`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                  </Col>
                );
              })}
          </Row>
        </Space>
      ) : null}
    </div>
  );
};

export default PerformanceLog;
