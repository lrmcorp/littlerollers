'use client';

import { Check, ChevronDown, LoaderCircle, Search, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  forwardRef,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

export const controlClassName =
  'min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 py-2 font-sans text-sm text-dd-ink shadow-sm outline-none transition placeholder:text-dd-muted/75 hover:border-dd-forest/40 focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15 disabled:cursor-not-allowed disabled:bg-dd-surface-muted disabled:text-dd-muted aria-[invalid=true]:border-dd-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-dd-danger/20';

/** Chevron kustom agar `<select>` bawaan terlihat sama dengan `SearchSelect`. */
const selectChevronClassName =
  "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23667069%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9";

export type FieldVariant = 'default' | 'editorial';

/**
 * Kontrol bergaya editorial untuk halaman publik (persegi, garis tipis, tanpa bayangan), selaras dengan
 * input teks/tanggal di halaman itu. Tinggi dasar 48px; `compact` 44px.
 */
export const editorialControlClassName =
  'w-full rounded-none border border-ed-line bg-white px-4 py-2 font-sans text-sm text-ed-ink shadow-none outline-none transition placeholder:text-ed-muted hover:border-ed-green/40 focus:border-ed-green focus:ring-2 focus:ring-ed-green/15 disabled:cursor-not-allowed disabled:bg-ed-tint disabled:text-ed-muted aria-[invalid=true]:border-dd-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-dd-danger/20';

const controlFor = (variant: FieldVariant | undefined, compact?: boolean) =>
  variant === 'editorial'
    ? `${editorialControlClassName} ${compact ? 'min-h-11 py-1.5' : 'min-h-12'}`
    : `${controlClassName} ${compact ? 'min-h-10 py-1.5' : ''}`;

export function CheckboxInput({
  label,
  description,
  className = '',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: ReactNode;
  description?: ReactNode;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-dd-sm border border-dd-line p-3 ${className}`}
    >
      <input
        {...props}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-dd-forest focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dd-forest"
      />
      <span className="grid gap-0.5 text-sm">
        <span className="font-medium text-dd-ink">{label}</span>
        {description && <span className="text-xs text-dd-muted">{description}</span>}
      </span>
    </label>
  );
}

export function FieldHint({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs leading-5 text-dd-muted">
      {children}
    </p>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="text-xs font-medium leading-5 text-dd-danger">
      {children}
    </p>
  );
}

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required,
  className = '',
  labelClassName = '',
  variant,
  children,
}: {
  label: string;
  htmlFor?: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  labelClassName?: string;
  variant?: FieldVariant;
  children: ReactNode;
}) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className={
          labelClassName ||
          (variant === 'editorial'
            ? 'text-xs font-bold uppercase tracking-wider text-ed-ink'
            : 'text-sm font-semibold text-dd-ink')
        }
      >
        {label}
        {required && (
          <span className="ml-1 text-dd-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {description && <FieldHint>{description}</FieldHint>}
      {children}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

type SharedFieldProps = {
  label?: string;
  description?: ReactNode;
  error?: ReactNode;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  compact?: boolean;
  wrapperClassName?: string;
  labelClassName?: string;
  /** `editorial` untuk halaman publik; bawaan mengikuti gaya panel admin. */
  variant?: FieldVariant;
};

export const TextInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedFieldProps
>(function TextInput(
  {
    label,
    description,
    error,
    leadingIcon,
    trailingIcon,
    compact,
    wrapperClassName,
    labelClassName,
    variant,
    className = '',
    id: providedId,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const input = (
    <span className="relative block">
      {leadingIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dd-muted">
          {leadingIcon}
        </span>
      )}
      <input
        {...props}
        ref={ref}
        id={id}
        aria-label={props['aria-label'] ?? label}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={`${controlFor(variant, compact)} ${leadingIcon ? 'pl-9' : ''} ${trailingIcon ? 'pr-9' : ''} ${className}`}
      />
      {trailingIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dd-muted">
          {trailingIcon}
        </span>
      )}
    </span>
  );
  return label ? (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      required={required}
      className={wrapperClassName}
      labelClassName={labelClassName}
      variant={variant}
    >
      {input}
    </FormField>
  ) : (
    input
  );
});

export const SearchInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedFieldProps
>(function SearchInput(props, ref) {
  return <TextInput ref={ref} type="search" {...props} />;
});
export const DateInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedFieldProps
>(function DateInput(props, ref) {
  return <TextInput ref={ref} type="date" {...props} />;
});
export const FileInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & SharedFieldProps
>(function FileInput({ className = '', ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      type="file"
      className={`file:mr-3 file:rounded-dd-sm file:border-0 file:bg-dd-surface-muted file:px-3 file:py-2 file:font-semibold file:text-dd-forest ${className}`}
      {...props}
    />
  );
});

export const SelectInput = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement> & SharedFieldProps
>(function SelectInput(
  {
    label,
    description,
    error,
    compact,
    wrapperClassName,
    variant,
    className = '',
    id: providedId,
    required,
    children,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const input = (
    <select
      {...props}
      ref={ref}
      id={id}
      aria-label={props['aria-label'] ?? label}
      required={required}
      aria-invalid={Boolean(error) || undefined}
      className={`${controlFor(variant, compact)} ${selectChevronClassName} ${className}`}
    >
      {children}
    </select>
  );
  return label ? (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      required={required}
      className={wrapperClassName}
      variant={variant}
    >
      {input}
    </FormField>
  ) : (
    input
  );
});

export type SearchSelectOption = {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  metadata?: Record<string, unknown>;
};

export type SearchSelectProps = {
  label: string;
  options: SearchSelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  compact?: boolean;
  wrapperClassName?: string;
  /** `editorial` untuk halaman publik; bawaan mengikuti gaya panel admin. */
  variant?: FieldVariant;
  loading?: boolean;
  emptyMessage?: string;
  loadError?: string;
  nextCursor?: string;
  filterOptions?: boolean;
  onSearchChange?(query: string): void;
  onLoadMore?(): void;
  onRetry?(): void;
  onChange?(value: string, option?: SearchSelectOption): void;
};

export type AsyncSearchSelectProps = Omit<
  SearchSelectProps,
  'options' | 'loading' | 'loadError' | 'nextCursor' | 'filterOptions' | 'onLoadMore' | 'onRetry'
> & {
  selectedOption?: SearchSelectOption;
  debounceMs?: number;
  loadOptions(
    query: string,
    cursor?: string,
  ): Promise<SearchSelectOption[] | { items: SearchSelectOption[]; nextCursor?: string }>;
};

export type MultiSearchSelectProps = Omit<
  SearchSelectProps,
  'value' | 'defaultValue' | 'onChange' | 'name'
> & {
  value: string[];
  name?: string;
  onChange(value: string[], options: SearchSelectOption[]): void;
};

export type AsyncMultiSearchSelectProps = Omit<
  AsyncSearchSelectProps,
  'value' | 'defaultValue' | 'onChange' | 'name' | 'selectedOption'
> & {
  value: string[];
  name?: string;
  selectedOptions?: SearchSelectOption[];
  onChange(value: string[], options: SearchSelectOption[]): void;
};

const emptySearchSelectOptions: SearchSelectOption[] = [];

function normalizedSearch(value: string) {
  return value.trim().toLocaleLowerCase('id-ID');
}

export function SearchSelect({
  label,
  options,
  value,
  defaultValue = '',
  name,
  placeholder = 'Pilih data',
  searchPlaceholder = 'Cari…',
  description,
  error,
  required,
  disabled,
  clearable = true,
  compact,
  wrapperClassName,
  variant,
  loading,
  emptyMessage = 'Data tidak ditemukan.',
  loadError,
  nextCursor,
  filterOptions = true,
  onSearchChange,
  onLoadMore,
  onRetry,
  onChange,
}: SearchSelectProps) {
  const editorial = variant === 'editorial';
  const id = useId();
  const listId = `${id}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value === undefined ? internalValue : value;
  const selected = options.find((option) => option.id === currentValue);
  const [query, setQuery] = useState(selected?.label ?? '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedQuery = normalizedSearch(query);
  const visibleOptions = filterOptions
    ? options.filter((option) => {
        if (!normalizedQuery || query === selected?.label) return true;
        return normalizedSearch(`${option.label} ${option.description ?? ''}`).includes(
          normalizedQuery,
        );
      })
    : options;

  useEffect(() => {
    setQuery(selected?.label ?? '');
  }, [currentValue, selected?.label]);
  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
        setQuery(selected?.label ?? '');
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [selected?.label]);

  const commit = useCallback(
    (option?: SearchSelectOption) => {
      if (option?.disabled) return;
      const nextValue = option?.id ?? '';
      if (value === undefined) setInternalValue(nextValue);
      setQuery(option?.label ?? '');
      setOpen(false);
      setActiveIndex(-1);
      onChange?.(nextValue, option);
    },
    [onChange, value],
  );

  const move = (direction: 1 | -1) => {
    if (!visibleOptions.length) return;
    setActiveIndex((current) => {
      if (current < 0) return direction > 0 ? 0 : visibleOptions.length - 1;
      return Math.min(visibleOptions.length - 1, Math.max(0, current + direction));
    });
  };

  return (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      required={required}
      className={wrapperClassName}
      variant={variant}
    >
      <div ref={rootRef} className="relative min-w-0">
        {name && <input type="hidden" name={name} value={currentValue} />}
        <div className="relative">
          <Search
            className={`pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 ${editorial ? 'text-ed-muted' : 'text-dd-muted'}`}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            aria-activedescendant={activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            aria-invalid={Boolean(error) || undefined}
            required={required && !currentValue}
            disabled={disabled}
            value={query}
            placeholder={open ? searchPlaceholder : placeholder}
            className={`${controlFor(variant, compact)} pl-9 pr-16`}
            onFocus={() => {
              setOpen(true);
              setQuery('');
              onSearchChange?.('');
            }}
            onClick={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActiveIndex(0);
              onSearchChange?.(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                move(1);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                move(-1);
              } else if (event.key === 'Home' && open) {
                event.preventDefault();
                setActiveIndex(0);
              } else if (event.key === 'End' && open) {
                event.preventDefault();
                setActiveIndex(Math.max(0, visibleOptions.length - 1));
              } else if (event.key === 'Enter' && open && activeIndex >= 0) {
                event.preventDefault();
                commit(visibleOptions[activeIndex]);
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setOpen(false);
                setActiveIndex(-1);
                setQuery(selected?.label ?? '');
              }
            }}
          />
          {clearable && currentValue && !disabled ? (
            <button
              type="button"
              className="absolute right-9 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full border-0 bg-transparent text-dd-muted hover:bg-dd-surface-muted"
              aria-label={`Hapus pilihan ${label}`}
              onClick={() => {
                commit(undefined);
                inputRef.current?.focus();
              }}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
          <ChevronDown
            className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 transition-transform ${editorial ? 'text-ed-muted' : 'text-dd-muted'} ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </div>
        {open && !disabled && (
          <div
            id={listId}
            role="listbox"
            className={`absolute inset-x-0 top-full z-[140] mt-1 max-h-[min(20rem,45dvh)] overflow-y-auto border bg-white p-1 ${editorial ? 'ed-scope rounded-none border-ed-line shadow-none' : 'rounded-dd-md border-dd-line shadow-dd-float'}`}
          >
            {loading && (
              <p className="flex items-center gap-2 px-3 py-3 text-sm text-dd-muted" role="status">
                <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" /> Memuat…
              </p>
            )}
            {!loading && loadError && (
              <div className="p-3 text-sm text-dd-danger" role="alert">
                <p>{loadError}</p>
                {onRetry && (
                  <button
                    type="button"
                    className="mt-2 font-semibold text-dd-forest underline"
                    onClick={onRetry}
                  >
                    Coba lagi
                  </button>
                )}
              </div>
            )}
            {!loading && !loadError && visibleOptions.length === 0 && (
              <p className="px-3 py-4 text-sm text-dd-muted">{emptyMessage}</p>
            )}
            {!loadError &&
              visibleOptions.map((option, index) => (
                <button
                  id={`${listId}-${index}`}
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={option.id === currentValue}
                  disabled={option.disabled}
                  className={`flex w-full items-start gap-3 border-0 px-3 py-2.5 text-left disabled:cursor-not-allowed disabled:opacity-45 ${editorial ? 'rounded-none' : 'rounded-dd-sm'} ${index === activeIndex ? (editorial ? 'bg-ed-tint' : 'bg-dd-surface-muted') : editorial ? 'bg-transparent hover:bg-ed-tint' : 'bg-transparent hover:bg-dd-surface-muted'}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => commit(option)}
                >
                  <span className="min-w-0 flex-1">
                    <strong className={`block truncate text-sm ${editorial ? 'text-ed-ink' : 'text-dd-ink'}`}>{option.label}</strong>
                    {option.description && (
                      <span className={`mt-0.5 block text-xs leading-5 ${editorial ? 'text-ed-muted' : 'text-dd-muted'}`}>
                        {option.description}
                      </span>
                    )}
                  </span>
                  {option.id === currentValue && (
                    <Check className={`mt-0.5 size-4 shrink-0 ${editorial ? 'text-ed-green' : 'text-dd-forest'}`} aria-hidden="true" />
                  )}
                </button>
              ))}
            {!loading && nextCursor && onLoadMore && (
              <button
                type="button"
                className="mt-1 w-full rounded-dd-sm border-0 bg-dd-surface-muted px-3 py-2 text-sm font-semibold text-dd-forest"
                onClick={onLoadMore}
              >
                Muat berikutnya
              </button>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

export function AsyncSearchSelect({
  loadOptions,
  selectedOption,
  debounceMs = 250,
  ...props
}: AsyncSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SearchSelectOption[]>(selectedOption ? [selectedOption] : []);
  const [nextCursor, setNextCursor] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string>();
  const requestRef = useRef(0);
  const loadOptionsRef = useRef(loadOptions);
  const selectedOptionRef = useRef(selectedOption);
  useEffect(() => {
    loadOptionsRef.current = loadOptions;
    selectedOptionRef.current = selectedOption;
  }, [loadOptions, selectedOption]);

  const runLoad = useCallback(async (search: string, cursor?: string, append = false) => {
    const request = ++requestRef.current;
    setLoading(true);
    setLoadError(undefined);
    try {
      const result = await loadOptionsRef.current(search, cursor);
      if (request !== requestRef.current) return;
      const page = Array.isArray(result) ? { items: result, nextCursor: undefined } : result;
      setItems((current) => {
        const combined = append ? [...current, ...page.items] : page.items;
        const pinned = selectedOptionRef.current;
        if (pinned && !combined.some((item) => item.id === pinned.id)) {
          combined.unshift(pinned);
        }
        return [...new Map(combined.map((item) => [item.id, item])).values()];
      });
      setNextCursor(page.nextCursor);
    } catch {
      if (request === requestRef.current) setLoadError('Data belum dapat dimuat.');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void runLoad(query), debounceMs);
    return () => window.clearTimeout(timer);
  }, [debounceMs, query, runLoad]);

  return (
    <SearchSelect
      {...props}
      options={items}
      loading={loading}
      loadError={loadError}
      nextCursor={nextCursor}
      filterOptions={false}
      onSearchChange={setQuery}
      onRetry={() => void runLoad(query)}
      onLoadMore={() => nextCursor && void runLoad(query, nextCursor, true)}
    />
  );
}

export function AsyncMultiSearchSelect({
  value,
  name,
  selectedOptions = emptySearchSelectOptions,
  loadOptions,
  onChange,
  ...props
}: AsyncMultiSearchSelectProps) {
  const [knownOptions, setKnownOptions] = useState<SearchSelectOption[]>(selectedOptions);

  useEffect(() => {
    setKnownOptions((current) => [
      ...new Map([...current, ...selectedOptions].map((option) => [option.id, option])).values(),
    ]);
  }, [selectedOptions]);

  const selected = value
    .map((id) => knownOptions.find((option) => option.id === id))
    .filter((option): option is SearchSelectOption => Boolean(option));

  return (
    <div className={props.wrapperClassName}>
      {name && value.map((item) => <input key={item} type="hidden" name={name} value={item} />)}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2" aria-label={`${props.label} terpilih`}>
          {selected.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 rounded-full bg-dd-success-soft px-3 py-1 text-xs font-semibold text-dd-success"
            >
              {option.label}
              <button
                type="button"
                className="grid size-5 place-items-center rounded-full border-0 bg-transparent"
                aria-label={`Hapus ${option.label}`}
                onClick={() => {
                  const next = value.filter((item) => item !== option.id);
                  onChange(
                    next,
                    knownOptions.filter((item) => next.includes(item.id)),
                  );
                }}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <AsyncSearchSelect
        key={value.join('|')}
        {...props}
        wrapperClassName=""
        value=""
        clearable={false}
        loadOptions={async (query, cursor) => {
          const result = await loadOptions(query, cursor);
          const page = Array.isArray(result) ? { items: result, nextCursor: undefined } : result;
          const available = page.items.filter((option) => !value.includes(option.id));
          setKnownOptions((current) => [
            ...new Map([...current, ...page.items].map((option) => [option.id, option])).values(),
          ]);
          return { items: available, nextCursor: page.nextCursor };
        }}
        onChange={(item, option) => {
          if (!item || !option) return;
          const next = [...value, item];
          const options = [
            ...new Map(
              [...knownOptions, option].map((candidate) => [candidate.id, candidate]),
            ).values(),
          ];
          setKnownOptions(options);
          onChange(
            next,
            options.filter((candidate) => next.includes(candidate.id)),
          );
        }}
      />
    </div>
  );
}

export function MultiSearchSelect({
  value,
  options,
  name,
  onChange,
  ...props
}: MultiSearchSelectProps) {
  const selected = options.filter((option) => value.includes(option.id));
  const available = options.filter((option) => !value.includes(option.id));
  return (
    <div className={props.wrapperClassName}>
      {name && value.map((item) => <input key={item} type="hidden" name={name} value={item} />)}
      {selected.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2" aria-label={`${props.label} terpilih`}>
          {selected.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 rounded-full bg-dd-success-soft px-3 py-1 text-xs font-semibold text-dd-success"
            >
              {option.label}
              <button
                type="button"
                className="grid size-5 place-items-center rounded-full border-0 bg-transparent"
                aria-label={`Hapus ${option.label}`}
                onClick={() => {
                  const next = value.filter((item) => item !== option.id);
                  onChange(
                    next,
                    options.filter((item) => next.includes(item.id)),
                  );
                }}
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}
      <SearchSelect
        key={value.join('|')}
        {...props}
        wrapperClassName=""
        options={available}
        value=""
        clearable={false}
        onChange={(item, option) => {
          if (!item || !option) return;
          const next = [...value, item];
          onChange(
            next,
            options.filter((candidate) => next.includes(candidate.id)),
          );
        }}
      />
    </div>
  );
}

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps
>(function Textarea(
  {
    label,
    description,
    error,
    wrapperClassName,
    variant,
    className = '',
    id: providedId,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const input = (
    <textarea
      {...props}
      ref={ref}
      id={id}
      aria-label={props['aria-label'] ?? label}
      required={required}
      aria-invalid={Boolean(error) || undefined}
      className={`${controlFor(variant)} min-h-28 resize-y ${className}`}
    />
  );
  return label ? (
    <FormField
      label={label}
      htmlFor={id}
      description={description}
      error={error}
      required={required}
      className={wrapperClassName}
      variant={variant}
    >
      {input}
    </FormField>
  ) : (
    input
  );
});

export function RadioCard({
  label,
  description,
  className = '',
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; description?: ReactNode }) {
  return (
    <label
      className={`flex cursor-pointer gap-3 rounded-dd-md border border-dd-line bg-white p-4 transition hover:border-dd-forest has-[:checked]:border-dd-forest has-[:checked]:ring-2 has-[:checked]:ring-dd-forest/15 ${className}`}
    >
      <input
        {...props}
        aria-label={props['aria-label'] ?? label}
        type="radio"
        className="mt-1 size-4 accent-dd-forest"
      />
      <span>
        <strong className="block text-sm text-dd-ink">{label}</strong>
        {description && <span className="mt-1 block text-xs text-dd-muted">{description}</span>}
      </span>
    </label>
  );
}

export { ImageUploadField, type ImageUploadFieldProps } from './forms/image-upload-field';
export { MultiImageGalleryField, type MultiImageGalleryFieldProps } from './forms/multi-image-gallery-field';
