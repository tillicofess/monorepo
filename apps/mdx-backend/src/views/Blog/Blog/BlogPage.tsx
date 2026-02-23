import { Avatar, Button, Card, Empty, List, Modal, message, Space, Typography, theme } from 'antd';
import { Clock, Edit, FileText, Plus, Trash2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteArticle, list } from '@/apis/articles';

const { Text, Title } = Typography;
const { useToken } = theme;

interface ArticleItem {
  id: string;
  title: string;
  summary: string;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
}

const BlogList: React.FC = () => {
  const { token } = useToken();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null);
  const [confirmDeleteLoading, setConfirmDeleteLoading] = useState(false);
  const pageSize = 12;

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchArticles = async (pageToLoad: number) => {
    if (loading || !hasMore) {
      return;
    }

    setLoading(true);
    try {
      const response = await list({
        page: pageToLoad,
        pageSize: pageSize,
      });
      const result = response.data;

      setArticles((prevArticles) => [...prevArticles, ...result.data]);
      setHasMore(result.data.length >= pageSize);
      setPage(pageToLoad + 1);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      message.error('网络错误，无法获取文章列表');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page);
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          fetchArticles(page);
        }
      },
      {
        root: null,
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore, page]);

  const handleDeleteArticle = async (id: string) => {
    setConfirmDeleteLoading(true);
    try {
      await deleteArticle(id);
      message.success('删除成功');
      setArticles((prevArticles) => prevArticles.filter((article) => article.id !== id));
      setConfirmDeleteVisible(false);
      setDeleteArticleId(null);
    } catch (error) {
      console.error('Failed to delete article:', error);
      message.error('删除失败');
    } finally {
      setConfirmDeleteLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 页面标题和操作按钮 */}
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
          <FileText style={{ color: '#6366F1' }} />
          博客文章列表
        </Title>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/editor')}>
          写文章
        </Button>
      </div>

      <Card
        style={{
          borderRadius: 12,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: articles.length === 0 ? 24 : 0 }}
      >
        {articles.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" align="center">
                <FileText style={{ fontSize: 48, color: token.colorTextQuaternary }} />
                <Text type="secondary">暂无文章，点击上方按钮创建第一篇文章</Text>
              </Space>
            }
          />
        ) : (
          <List
            dataSource={articles}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: `1px solid ${token.colorBorder}`,
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = token.colorBgContainer;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<Edit size={14} />}
                    onClick={() => navigate(`/editor/${item.id}`)}
                    style={{ color: token.colorPrimary }}
                  >
                    编辑
                  </Button>,
                  <Button
                    key="delete"
                    type="text"
                    icon={<Trash2 size={14} />}
                    onClick={() => {
                      setConfirmDeleteVisible(true);
                      setDeleteArticleId(item.id);
                    }}
                    danger
                  >
                    删除
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    item.cover_image ? (
                      <Avatar
                        src={item.cover_image}
                        shape="square"
                        size={64}
                        style={{ borderRadius: 8 }}
                      />
                    ) : (
                      <Avatar
                        shape="square"
                        size={64}
                        style={{ backgroundColor: token.colorPrimary, borderRadius: 8 }}
                        icon={<FileText />}
                      />
                    )
                  }
                  title={
                    <Text strong style={{ fontSize: 16 }}>
                      {item.title}
                    </Text>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text type="secondary" ellipsis style={{ maxWidth: 600 }}>
                        {item.summary || '暂无摘要'}
                      </Text>
                      <Space size="middle">
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <Clock size={12} style={{ marginRight: 4 }} />
                          {new Date(item.created_at).toLocaleDateString()}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {/* 懒加载触发点 */}
        <div ref={loadMoreRef} style={{ height: '40px', textAlign: 'center', padding: '16px' }}>
          {loading && <Text type="secondary">加载中...</Text>}
          {!hasMore && articles.length > 0 && <Text type="secondary">没有更多了</Text>}
        </div>
      </Card>

      <Modal
        title="确认删除"
        open={confirmDeleteVisible}
        confirmLoading={confirmDeleteLoading}
        onOk={() => {
          if (deleteArticleId) {
            handleDeleteArticle(deleteArticleId);
          }
        }}
        onCancel={() => {
          setConfirmDeleteVisible(false);
          setDeleteArticleId(null);
        }}
        destroyOnHidden
      >
        <p>确定删除这篇文章吗？此操作不可恢复。</p>
      </Modal>
    </div>
  );
};

export default BlogList;
