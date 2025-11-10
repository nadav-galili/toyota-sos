'use client';

import React from 'react';

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
  const { schema, className } = props;
  return (
    <div dir="rtl" className={className ?? ''} data-testid="form-renderer">
      {/* 5.3.1 scaffold: no field rendering yet */}
      {schema?.length ? null : (
        <div className="text-sm text-gray-600">לא הוגדרה סכימה לטופס זה</div>
      )}
    </div>
  );
}


