import { createBrowserRouter } from 'react-router-dom';
import AppLayout from '@/components/Layout.tsx';
import ProtectedRoute from '@/components/ProtectedRoute.tsx';
// import BlogPage from '@/views/Blog/Blog/BlogPage';
// import Editor from '@/views/Blog/Editor/editor';
import FileManager from '@/views/File';
import Home from '@/views/Home.tsx';
import ErrorLog from '@/views/ErrorLog';
import PerformanceLog from '@/views/PerformanceLog';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppLayout,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'fileManagement',
        element: <FileManager />,
      },
      // {
      //   path: 'blog',
      //   element: <BlogPage />,
      // },
      // {
      //   path: 'editor',
      //   element: <Editor />,
      // },
      // {
      //   path: 'editor/:id',
      //   element: <Editor />,
      // },
      {
        path: 'errorLog',
        element: (
          <ProtectedRoute requiredRoles={['user:read']}>
            <ErrorLog />
          </ProtectedRoute>
        ),
      },
      {
        path: 'performanceLog',
        element: (
          <ProtectedRoute requiredRoles={['user:read']}>
            <PerformanceLog />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
