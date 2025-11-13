export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type Quality = 'standard' | 'hd';

export interface Option<T> {
  value: T;
  label: string;
}

export interface FilterOption {
  value: string; // CSS class name
  label: string;
}
