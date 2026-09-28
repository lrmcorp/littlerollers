import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ClassFaqSection, DEFAULT_CLASS_FAQ } from './class-faq-section';

describe('ClassFaqSection', () => {
  it('shows the questions staff published, in their order and with line breaks kept', () => {
    render(
      <ClassFaqSection
        items={[
          { id: 'a', order: 1, question: 'Apakah ada parkir?', answer: 'Ya.\nGratis untuk member.' },
          { id: 'b', order: 2, question: 'Bolehkah membawa tamu?', answer: 'Boleh, dengan reservasi.' },
        ]}
      />,
    );
    const questions = screen.getAllByRole('heading', { level: 3 }).map((node) => node.textContent);
    expect(questions).toEqual(['Apakah ada parkir?', 'Bolehkah membawa tamu?']);
    expect(screen.getByText(/Gratis untuk member/)).toHaveClass('whitespace-pre-line');
    expect(screen.queryByText(DEFAULT_CLASS_FAQ[0]!.question)).toBeNull();
  });

  it.each([undefined, null, []])('falls back to the built-in questions when nothing is published (%s)', (items) => {
    render(<ClassFaqSection items={items as never} />);
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(DEFAULT_CLASS_FAQ.length);
    expect(screen.getByRole('heading', { level: 2, name: 'Pertanyaan Seputar Kelas Ini' })).toBeVisible();
  });

  it('renders text as text, never as markup', () => {
    render(
      <ClassFaqSection
        items={[{ id: 'x', order: 1, question: 'Uji <b>tebal</b>', answer: '<img src=x onerror=alert(1)>' }]}
      />,
    );
    expect(document.querySelector('b')).toBeNull();
    expect(document.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeVisible();
  });
});
