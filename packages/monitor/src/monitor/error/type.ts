export interface MonitorError {
  category: 'js' | 'promise' | 'resource';
  type: string;
  message: string;
  stack?: string;
  fileName?: string;
  line?: number;
  column?: number;
  url?: string;
  tagName?: string;
}
