const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const;

function formatMonthYear(date: Date): string {
  return `${MONTHS_RU[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatPeriod(startDate: Date, endDate: Date | null): string {
  if (!endDate) {
    return `${formatMonthYear(startDate)} — настоящее время`;
  }
  return `${formatMonthYear(startDate)} — ${formatMonthYear(endDate)}`;
}
