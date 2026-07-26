import { describe, expect, it } from 'vitest';
import { publicClasses, publicStudios } from './public-content';

describe('public content contract', () => {
  it('only promotes studios and class types backed by the active master catalog', () => {
    expect(publicStudios.map(({ code }) => code)).toEqual(['DD-JKT', 'DD-BSD']);
    expect(publicClasses.map(({ code }) => code)).toEqual(['REFORMER', 'MAT', 'BARRE']);
    expect(JSON.stringify({ publicStudios, publicClasses })).not.toMatch(
      /Surabaya|PIK 2|Chair|Cadillac/i,
    );
  });
});
