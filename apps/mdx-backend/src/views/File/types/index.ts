import type React from 'react';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  uploadTime: string;
  isDir: boolean;
}

export interface BreadcrumbItem {
  id: string | null;
  name: React.ReactNode;
}

export interface FileNameState {
  id: string;
  name: string;
}

export interface DeleteFileState {
  id: string;
  name: string;
  isDir: boolean;
}
