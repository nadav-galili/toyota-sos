'use client';

import React, { useEffect, useMemo, useState } from 'react';

// Core option/constraints types
export type FormOption = {
  value: string | number;
  label: string;
};

export type FormConstraints = {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex string
};

// Simple dependency rules for conditional visibility/enablement
export type DependencyRule = {
  fieldId: string;
  operator: 'equals' | 'notEquals' | 'in';
  value: unknown;
};

export type DependencyConfig = {
  when: 'all' | 'any';
  rules: ReadonlyArray<DependencyRule>;
};

// Field definitions
export type FieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'number'
  | 'date'
  | 'time';

export type FormFieldBase = {
  id: string;
  type: FieldType;
  title: string;
  description?: string;
  required?: boolean;
  constraints?: FormConstraints;
  dependsOn?: DependencyConfig; // visibility/enable rules
  defaultValue?: unknown;
};

export type SelectLikeField = FormFieldBase & {
  type: 'select' | 'radio';
  options: ReadonlyArray<FormOption>;
};

export type CheckboxField = FormFieldBase & {
  type: 'checkbox';
  defaultValue?: boolean;
};

export type TextualField = FormFieldBase & {
  type: 'text' | 'textarea' | 'number' | 'date' | 'time';
};

export type FormField = SelectLikeField | CheckboxField | TextualField;
export type FormSchema = ReadonlyArray<FormField>;

// Normalized payload format
export type NormalizedFormData = Record<string, string | number | boolean | null>;

export type FormRendererProps = {
  schema: FormSchema;
  initialValues?: Record<string, unknown>;
  onChange?: (data: NormalizedFormData) => void;
  onSubmit?: (data: NormalizedFormData) => void;
  className?: string;
};

/**
 * FormRenderer (scaffold)
 * 5.3.1: Types and basic component shell. Rendering and behavior will be added in later subtasks.
 */
export function FormRenderer(props: FormRendererProps) {
  const { schema, className, initialValues, onChange, onSubmit } = props;

  const [values, setValues] = useState<NormalizedFormData>({});

  // Initialize values
  useEffect(() => {
    const init: NormalizedFormData = {};
    for (const f of schema) {
      const iv = initialValues?.[f.id];
      if (typeof iv !== 'undefined') {
        init[f.id] = coerceValue(f.type, iv);
      } else if (typeof f.defaultValue !== 'undefined') {
        init[f.id] = coerceValue(f.type, f.defaultValue);
      } else {
        init[f.id] = defaultForType(f.type);
      }
    }
    setValues(init);
  }, [schema, initialValues]);

  // Lift state changes
  useEffect(() => {
    onChange?.(values);
  }, [values, onChange]);

  const visibleSchema = useMemo(() => {
    // 5.3.3 not yet implemented — return schema as-is for now
    return schema;
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(values);
  };

  return (
    <form dir="rtl" className={className ?? ''} data-testid="form-renderer" onSubmit={handleSubmit}>
      {!visibleSchema?.length ? (
        <div className="text-sm text-gray-600">לא הוגדרה סכימה לטופס זה</div>
      ) : (
        <div className="space-y-4">
          {visibleSchema.map((f) => {
            const id = `fr-${f.id}`;
            const descId = f.description ? `${id}-desc` : undefined;
            const value = values[f.id];
            // checkbox
            if (f.type === 'checkbox') {
              const checked = Boolean(value);
              return (
                <div key={f.id} className="flex items-start gap-3">
                  <input
                    id={id}
                    type="checkbox"
                    className="mt-1 h-5 w-5"
                    checked={checked}
                    onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.checked }))}
                    aria-describedby={descId}
                  />
                  <div className="flex-1">
                    <label htmlFor={id} className="font-medium">
                      {f.title} {f.required ? <span className="text-red-600">*</span> : null}
                    </label>
                    {f.description ? (
                      <p id={descId} className="text-sm text-gray-600">
                        {f.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            }
            // radio
            if (f.type === 'radio') {
              const opts = (f as any).options as ReadonlyArray<FormOption>;
              return (
                <fieldset key={f.id} className="space-y-1">
                  <legend className="font-medium">
                    {f.title} {f.required ? <span className="text-red-600">*</span> : null}
                  </legend>
                  {f.description ? (
                    <p id={descId} className="text-sm text-gray-600">
                      {f.description}
                    </p>
                  ) : null}
                  <div className="space-y-1">
                    {opts?.map((opt) => {
                      const rid = `${id}-${String(opt.value)}`;
                      return (
                        <label key={rid} htmlFor={rid} className="flex items-center gap-2">
                          <input
                            id={rid}
                            name={id}
                            type="radio"
                            className="h-4 w-4"
                            checked={String(value ?? '') === String(opt.value)}
                            onChange={() =>
                              setValues((v) => ({ ...v, [f.id]: coerceValue(f.type, opt.value) }))
                            }
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              );
            }
            // select
            if (f.type === 'select') {
              const opts = (f as any).options as ReadonlyArray<FormOption>;
              return (
                <div key={f.id} className="space-y-1">
                  <label htmlFor={id} className="font-medium">
                    {f.title} {f.required ? <span className="text-red-600">*</span> : null}
                  </label>
                  <select
                    id={id}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    aria-describedby={descId}
                    value={String(value ?? '')}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.id]: coerceValue(f.type, e.target.value) }))
                    }
                  >
                    <option value="">בחר</option>
                    {opts?.map((opt) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {f.description ? (
                    <p id={descId} className="text-sm text-gray-600">
                      {f.description}
                    </p>
                  ) : null}
                </div>
              );
            }
            // textarea
            if (f.type === 'textarea') {
              return (
                <div key={f.id} className="space-y-1">
                  <label htmlFor={id} className="font-medium">
                    {f.title} {f.required ? <span className="text-red-600">*</span> : null}
                  </label>
                  <textarea
                    id={id}
                    className="w-full rounded-md border border-gray-300 p-2 text-sm"
                    aria-describedby={descId}
                    value={String(value ?? '')}
                    onChange={(e) =>
                      setValues((v) => ({ ...v, [f.id]: coerceValue(f.type, e.target.value) }))
                    }
                    rows={4}
                  />
                  {f.description ? (
                    <p id={descId} className="text-sm text-gray-600">
                      {f.description}
                    </p>
                  ) : null}
                </div>
              );
            }
            // text/number/date/time
            const inputType = f.type === 'text' ? 'text' : f.type;
            return (
              <div key={f.id} className="space-y-1">
                <label htmlFor={id} className="font-medium">
                  {f.title} {f.required ? <span className="text-red-600">*</span> : null}
                </label>
                <input
                  id={id}
                  type={inputType}
                  className="w-full rounded-md border border-gray-300 p-2 text-sm"
                  aria-describedby={descId}
                  value={formatValueForInput(f.type, value)}
                  onChange={(e) =>
                    setValues((v) => ({ ...v, [f.id]: coerceValue(f.type, e.target.value) }))
                  }
                />
                {f.description ? (
                  <p id={descId} className="text-sm text-gray-600">
                    {f.description}
                  </p>
                ) : null}
              </div>
            );
          })}
          {onSubmit ? (
            <div>
              <button
                type="submit"
                className="rounded-md bg-toyota-primary px-3 py-2 text-sm text-white hover:bg-red-700"
              >
                שמור
              </button>
            </div>
          ) : null}
        </div>
      )}
    </form>
  );
}

function defaultForType(t: FieldType): string | number | boolean | null {
  switch (t) {
    case 'checkbox':
      return false;
    case 'number':
      return '' as unknown as number; // empty until user inputs; coerced on change
    default:
      return '';
  }
}

function coerceValue(t: FieldType, v: unknown): string | number | boolean | null {
  if (v === null || typeof v === 'undefined') return '';
  switch (t) {
    case 'checkbox':
      return Boolean(v);
    case 'number': {
      const n = Number(v);
      return Number.isFinite(n) ? n : ('' as unknown as number);
    }
    case 'date':
    case 'time':
      return String(v);
    default:
      return String(v);
  }
}

function formatValueForInput(t: FieldType, v: unknown): string | number {
  if (v === null || typeof v === 'undefined') return '';
  if (t === 'number') {
    if (v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) ? n : '';
  }
  return String(v);
}


