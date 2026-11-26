import { RecurrenceLabelPipe } from './recurrence-label.pipe';

describe('RecurrenceLabelPipe', () => {
  const pipe = new RecurrenceLabelPipe();

  it('should show daily as Diaria', () => {
    expect(pipe.transform('daily')).toBe('Diaria');
  });

  it('should show weekly as Semanal', () => {
    expect(pipe.transform('weekly')).toBe('Semanal');
  });

  it('should show monthly as Mensual', () => {
    expect(pipe.transform('monthly')).toBe('Mensual');
  });

  it('should show nothing for a task that is not recurring', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
