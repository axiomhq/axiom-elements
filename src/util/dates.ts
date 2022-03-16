import format from 'date-fns/format';

export function formatIntervalDate(interval: number | string, timeZone?: string) {
  const intervalDate = new Date(interval);
  const isSameYear = intervalDate.getFullYear() === new Date().getFullYear();
  const yearOpts: Intl.DateTimeFormatOptions | undefined = isSameYear ? undefined : { year: 'numeric' };

  return new Intl.DateTimeFormat([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZone,
    ...yearOpts,
  }).format(intervalDate);
}

export function formatDateAsIso(date: number): string {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
}
