import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableActionMenu, type ActionMenuItem } from './table-action-menu';

describe('TableActionMenu', () => {
  it('renders trigger button and toggles menu on click', async () => {
    const user = userEvent.setup();
    const handleEdit = vi.fn();
    const handleDelete = vi.fn();

    const items: ActionMenuItem[] = [
      { id: 'edit', label: 'Edit item', onClick: handleEdit },
      { id: 'delete', label: 'Hapus item', onClick: handleDelete, tone: 'danger', divider: true },
    ];

    render(<TableActionMenu items={items} label="Aksi baris" />);

    const button = screen.getByRole('button', { name: 'Aksi baris' });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    await user.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Edit item/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /Hapus item/i })).toBeInTheDocument();

    await user.click(screen.getByRole('menuitem', { name: /Edit item/i }));
    expect(handleEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('closes on Escape key press', async () => {
    const user = userEvent.setup();
    const items: ActionMenuItem[] = [{ id: 'edit', label: 'Edit' }];

    render(<TableActionMenu items={items} />);

    await user.click(screen.getByRole('button', { name: 'Pilihan tindakan' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('renders links for items with href', async () => {
    const user = userEvent.setup();
    const items: ActionMenuItem[] = [
      { id: 'detail', label: 'Lihat detail', href: '/workspace/test/123' },
    ];

    render(<TableActionMenu items={items} />);

    await user.click(screen.getByRole('button', { name: 'Pilihan tindakan' }));
    const link = screen.getByRole('menuitem', { name: /Lihat detail/i });
    expect(link).toHaveAttribute('href', '/workspace/test/123');
  });

  it('returns null if all items are hidden', () => {
    const items: ActionMenuItem[] = [{ id: '1', label: 'Hidden', hidden: true }];
    const { container } = render(<TableActionMenu items={items} />);
    expect(container).toBeEmptyDOMElement();
  });
});
