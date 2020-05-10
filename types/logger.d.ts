export interface Logger {
  log: (...args: any) => void;
  info: (...args: any) => void;
  warn: (...args: any) => void;
  error: (...args: any) => void;
  success: (...args: any) => void;
}
