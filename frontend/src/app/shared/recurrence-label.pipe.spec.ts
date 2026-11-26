import { RecurrenceLabelPipe } from './recurrence-label.pipe';

describe('RecurrenceLabelPipe', () => {
  const pipe = new RecurrenceLabelPipe();

  it('should translate each recurrence', () => {
    expect(pipe.transform('daily')).toBe('Diaria');
    expect(pipe.transform('weekly')).toBe('Semanal');
    expect(pipe.transform('monthly')).toBe('Mensual');
  });

  it('should return an empty text when the task is not recurring', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
