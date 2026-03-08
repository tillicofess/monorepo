export interface ErrorType {
  message: string;
  fileName?: string;
  line?: number;
  column?: number;
}

export interface DataType {
  key: string;
  app_name: string;
  error: ErrorType;
  time: string;
  actions: any[];
  version: string;
  count: number;
}
