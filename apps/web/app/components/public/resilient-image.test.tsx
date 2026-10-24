import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResilientImage } from './resilient-image';

describe('ResilientImage', () => {
  it('shows the requested image, and swaps to the fallback only after it fails to load', () => {
    render(<ResilientImage src="/images/public/branches/ada.png" alt="Studio" width={100} height={100} unoptimized />);
    const image = screen.getByAltText('Studio');
    expect(image.getAttribute('src')).toContain('ada.png');
    fireEvent.error(image);
    expect(screen.getByAltText('Studio').getAttribute('src')).toContain('studio-reception.png');
  });

  it('does not loop when the fallback itself fails', () => {
    render(
      <ResilientImage src="/x.png" fallbackSrc="/x.png" alt="Studio" width={100} height={100} unoptimized />,
    );
    fireEvent.error(screen.getByAltText('Studio'));
    expect(screen.getByAltText('Studio').getAttribute('src')).toContain('x.png');
  });
});
