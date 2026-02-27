import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ChangeCodeMirrorLanguage,
  CodeToggle,
  ConditionalContents,
  CreateLink,
  codeBlockPlugin,
  codeMirrorPlugin,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
  frontmatterPlugin,
  headingsPlugin,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertImage,
  InsertTable,
  imagePlugin,
  ListsToggle,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  MDXEditor,
  type MDXEditorMethods,
  markdownShortcutPlugin,
  quotePlugin,
  Separator,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
} from '@mdxeditor/editor';
import { useRef, useState } from 'react';
import '@mdxeditor/editor/style.css';
import './editor.css';
import { Button, Card, Input, message, Spin, Typography, theme } from 'antd';
import { PenLine, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { getArticleDetail, updateArticle, uploadArticle, uploadImage } from '@/apis/index';
import { useLocale } from '@/providers/LocaleContext';

const { Title } = Typography;
const { useToken } = theme;

async function imageUploadHandler(image: File) {
  const formData = new FormData();
  formData.append('image', image);
  const response = await uploadImage(formData);
  return response.data.url;
}

function Editor() {
  const { token } = useToken();
  const ref = useRef<MDXEditorMethods>(null);
  const { themeMode } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [initialMarkdown, setInitialMarkdown] = useState('');

  const id = useParams().id;
  const navigate = useNavigate();

  const {
    data: article,
    error: articleError,
    isLoading: articleLoading,
  } = useSWR(id ? ['article', id] : null, async ([_, articleId]) => {
    const res = await getArticleDetail(articleId);
    return res.data.data;
  });

  useEffect(() => {
    if (id) {
      if (articleLoading) {
        return;
      }

      if (articleError) {
        message.error(articleError.message || '获取文章详情失败');
        navigate('/blog');
        return;
      }

      if (article) {
        setTitle(article.title || '');
        ref.current?.setMarkdown(article.content);
        setInitialMarkdown(article.content || '');
      }
    } else {
      setTitle('');
      setInitialMarkdown('Hello world');
      ref.current?.setMarkdown('Hello world');
    }
  }, [id, article, articleLoading, articleError]);

  const handleUploadArticle = async () => {
    const markdown = ref.current?.getMarkdown() || '';
    if (!markdown.trim() || !title.trim()) {
      message.warning('文章标题和内容不能为空');
      return;
    }
    setUploading(true);
    try {
      await (id
        ? updateArticle({
          id,
          title,
          content: markdown,
        })
        : uploadArticle({
          title,
          content: markdown,
        }));
      message.success(id ? '文章更新成功' : '文章上传成功');
      setTitle('');
      setInitialMarkdown('');
      ref.current?.setMarkdown('');
      navigate('/blog');
    } catch (error) {
      message.error(`${id ? '文章更新失败' : '文章上传失败'}，请重试`);
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
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
          <PenLine style={{ color: '#6366F1' }} />
          {id ? '编辑文章' : '写文章'}
        </Title>
        <Button
          type="primary"
          icon={<Save size={16} />}
          onClick={handleUploadArticle}
          loading={uploading}
          size="large"
        >
          {id ? '更新文章' : '发布文章'}
        </Button>
      </div>

      <Card
        title={
          <Input
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= 100) {
                setTitle(value);
              }
            }}
            placeholder="请输入文章标题"
            variant="borderless"
            style={{ fontSize: 18, fontWeight: 600 }}
            count={{
              show: true,
              max: 100,
              strategy: (txt) => txt.length,
            }}
          />
        }
        style={{
          flex: 1,
          borderRadius: 12,
          border: `1px solid ${token.colorBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
        }}
        styles={{ body: { flex: 1, padding: 0, position: 'relative' } }}
      >
        {(articleLoading || (uploading && id)) && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1000,
              borderRadius: '12px',
            }}
          >
            <Spin tip={id ? '获取文章...' : '正在保存文章...'} />
          </div>
        )}

        <MDXEditor
          ref={ref}
          className={`mdx-editor ${themeMode === 'dark' ? 'dark-editor dark-theme' : ''}`}
          markdown={initialMarkdown}
          plugins={[
            codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                jsx: 'JavaScript (react)',
                js: 'JavaScript',
                css: 'CSS',
                tsx: 'TypeScript (react)',
              },
            }),
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),
            linkPlugin(),
            linkDialogPlugin(),
            imagePlugin({
              imageUploadHandler,
            }),
            tablePlugin(),
            diffSourcePlugin({
              diffMarkdown: 'An older version',
              viewMode: 'rich-text',
              readOnlyDiff: true,
            }),
            toolbarPlugin({
              toolbarContents: () => (
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <CodeToggle />
                  <BlockTypeSelect />
                  <CreateLink />
                  <InsertImage />
                  <InsertTable />
                  <ListsToggle />
                  <Separator />
                  <ConditionalContents
                    options={[
                      {
                        when: (editor) => editor?.editorType === 'codeblock',
                        contents: () => <ChangeCodeMirrorLanguage />,
                      },
                      {
                        fallback: () => (
                          <>
                            <InsertCodeBlock />
                          </>
                        ),
                      },
                    ]}
                  />
                  <InsertFrontmatter />
                </DiffSourceToggleWrapper>
              ),
            }),
            markdownShortcutPlugin(),
            frontmatterPlugin(),
          ]}
        />
      </Card>
    </div>
  );
}

export default Editor;
