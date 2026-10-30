import { formatPeriod } from './period';

describe('formatPeriod', () => {
  it('formats an open-ended job', () => {
    expect(formatPeriod(new Date('2024-04-01T00:00:00.000Z'), null)).toBe(
      'Апрель 2024 — настоящее время',
    );
  });

  it('formats a closed interval', () => {
    expect(
      formatPeriod(
        new Date('2023-10-01T00:00:00.000Z'),
        new Date('2024-04-01T00:00:00.000Z'),
      ),
    ).toBe('Октябрь 2023 — Апрель 2024');
  });
});
