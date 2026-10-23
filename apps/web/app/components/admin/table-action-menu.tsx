'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { MoreHorizontal } from 'lucide-react';

export interface ActionMenuItem {
  id?: string;
  key?: string;
  label: string;
  icon?: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  title?: string;
  hidden?: boolean;
  divider?: boolean;
}

export function TableActionMenu({
  items,
  label = 'Pilihan tindakan',
  ariaLabel,
  align = 'right',
  size = 'md',
  disabled = false,
}: {
  items: ActionMenuItem[];
  label?: string;
  ariaLabel?: string;
  align?: 'left' | 'right';
  size?: 'sm' | 'md';
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const effectiveLabel = ariaLabel || label;

  const visibleItems = items.filter((item) => !item.hidden);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  const btnSizeClass = size === 'sm' ? 'size-8 min-h-8' : 'size-9 min-h-9';

  return (
    <div
      ref={containerRef}
      className="relative inline-block text-left"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label={effectiveLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={`grid ${btnSizeClass} cursor-pointer place-items-center rounded-dd-md border border-dd-line bg-white text-dd-muted shadow-sm transition hover:border-dd-forest/40 hover:bg-dd-surface-muted hover:text-dd-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-forest disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none`}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label={effectiveLabel}
          className={`absolute z-30 mt-1 min-w-44 rounded-dd-lg border border-dd-line bg-white p-1.5 shadow-dd-float ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {visibleItems.map((item) => {
            const toneClasses =
              item.tone === 'danger'
                ? 'text-dd-danger hover:bg-dd-danger-soft focus:bg-dd-danger-soft'
                : item.tone === 'warning'
                  ? 'text-dd-warning hover:bg-dd-warning-soft focus:bg-dd-warning-soft'
                  : item.tone === 'success'
                    ? 'text-dd-forest hover:bg-dd-surface-muted focus:bg-dd-surface-muted'
                    : 'text-dd-ink hover:bg-dd-surface-muted focus:bg-dd-surface-muted';

            const baseItemClasses = `flex w-full items-center gap-2 rounded-dd-md px-3 py-2 text-left text-xs font-semibold no-underline transition disabled:pointer-events-none disabled:opacity-40 ${toneClasses}`;

            const itemKey = item.id ?? item.key ?? item.label;

            return (
              <div key={itemKey}>
                {item.divider && <div className="my-1 border-t border-dd-line/60" />}
                {item.href ? (
                  <Link
                    role="menuitem"
                    href={item.href}
                    title={item.title}
                    className={baseItemClasses}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.icon && <span className="size-4 shrink-0 text-current">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    title={item.title}
                    className={baseItemClasses}
                    onClick={() => {
                      setOpen(false);
                      item.onClick?.();
                    }}
                  >
                    {item.icon && <span className="size-4 shrink-0 text-current">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
