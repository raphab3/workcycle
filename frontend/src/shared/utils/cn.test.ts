import { cn } from './cn';

describe('cn', () => {
  it('merges conditional classes', () => {
    expect(cn('px-4', false && 'hidden', 'py-2')).toBe('px-4 py-2');
  });

  it('resolves tailwind conflicts with the latest class', () => {
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });
});