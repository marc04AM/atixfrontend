const normalizeDateInput = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00`;
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.replace(' ', 'T');
  }

  return trimmed;
};

const toDate = (value?: string | number | Date): Date | null => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const normalized = normalizeDateInput(value);
  if (!normalized) return null;

  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value?: string | number | Date, fallback = ''): string => {
  const date = toDate(value);
  return date ? date.toLocaleDateString() : fallback;
};

export const formatDateTime = (value?: string | number | Date, fallback = ''): string => {
  const date = toDate(value);
  return date ? date.toLocaleString() : fallback;
};
