import { AspectRatio, Quality, Option, FilterOption } from './types';

export const ASPECT_RATIO_OPTIONS: Option<AspectRatio>[] = [
  { value: '1:1', label: 'Квадрат (1:1)' },
  { value: '16:9', label: 'Пейзаж (16:9)' },
  { value: '9:16', label: 'Портрет (9:16)' },
  { value: '4:3', label: 'Стандарт (4:3)' },
  { value: '3:4', label: 'Классический портрет (3:4)' },
];

export const QUALITY_OPTIONS: Option<Quality>[] = [
  { value: 'standard', label: 'Стандартное качество' },
  { value: 'hd', label: 'Высокое качество (HD)' },
];

export const FILTERS: FilterOption[] = [
    { value: '', label: 'Нет' },
    { value: 'grayscale', label: 'Оттенки серого' },
    { value: 'sepia', label: 'Сепия' },
    { value: 'invert', label: 'Инвертировать' },
    { value: 'saturate-200', label: 'Насыщенный' },
    { value: 'contrast-150', label: 'Контрастный' },
    { value: 'brightness-75', label: 'Темнее' },
];
