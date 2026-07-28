'use client';

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

export const controlClassName =
  'min-h-11 w-full rounded-dd-md border border-dd-line bg-white px-3 py-2 font-sans text-sm text-dd-ink shadow-sm outline-none transition placeholder:text-dd-muted/75 hover:border-dd-forest/40 focus:border-dd-forest focus:ring-2 focus:ring-dd-forest/15 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-dd-muted aria-[invalid=true]:border-dd-danger aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-100';

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
  children,
}: {
  label: string;
  htmlFor?: string;
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`grid min-w-0 gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-dd-ink">
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
        required={required}
        aria-invalid={Boolean(error) || undefined}
        className={`${controlClassName} ${compact ? 'min-h-10 py-1.5' : ''} ${leadingIcon ? 'pl-9' : ''} ${trailingIcon ? 'pr-9' : ''} ${className}`}
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
      required={required}
      aria-invalid={Boolean(error) || undefined}
      className={`${controlClassName} ${compact ? 'min-h-10 py-1.5' : ''} ${className}`}
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
    >
      {input}
    </FormField>
  ) : (
    input
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps
>(function Textarea(
  {
    label,
    description,
    error,
    wrapperClassName,
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
      required={required}
      aria-invalid={Boolean(error) || undefined}
      className={`${controlClassName} min-h-28 resize-y ${className}`}
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
