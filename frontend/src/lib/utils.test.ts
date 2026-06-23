import { formatCurrency, cn } from './utils';

describe('utils', () => {
  describe('formatCurrency', () => {
    it('formats numbers as INR currency', () => {
      expect(formatCurrency(1000)).toBe('₹1,000');
      expect(formatCurrency(5000000)).toBe('₹50,00,000');
    });
  });

  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('text-red-500', { 'bg-blue-500': true })).toBe('text-red-500 bg-blue-500');
    });
  });
});
