'use client';

import React from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { z } from 'zod';
import { adminSchema } from '@/lib/schemas/admin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import dayjs from '@/lib/dayjs';

// ---- Form schema & types ----

export const AdminFormSchema = adminSchema.extend({
  // Accept empty string or undefined for email and coerce to optional
  // Required in form (to match defaultValues), but transforms to undefined if empty
  email: z
    .union([
      z.string().email('אימייל לא תקין').max(255, 'אימייל לא יכול להכיל יותר מ-255 תווים'),
      z.literal(''),
      z.undefined(),
    ])
    .transform((val) => {
      if (!val || val.trim().length === 0) return undefined;
      return val.trim();
    }),
});

export type AdminFormValues = z.infer<typeof AdminFormSchema>;

export function formatAdminTimestamp(ts: string | null) {
  if (!ts) return '—';
  try {
    return dayjs(ts).format('DD/MM/YYYY HH:mm');
  } catch {
    return ts as string;
  }
}

// ---- Create / Edit dialog ----

export type AdminDialogMode = 'create' | 'edit';

type AdminEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AdminDialogMode;
  submitting: boolean;
  register: UseFormRegister<AdminFormValues>;
  setValue: UseFormSetValue<AdminFormValues>;
  errors: FieldErrors<AdminFormValues>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  defaultRole?: string;
};

export function AdminEditDialog({
  open,
  onOpenChange,
  mode,
  submitting,
  register,
  setValue,
  errors,
  onSubmit,
  defaultRole = 'viewer',
}: AdminEditDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {mode === 'create' ? 'יצירת מנהל חדש' : 'עריכת מנהל'}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <form className="mt-3 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <Label htmlFor="admin-name">שם מלא</Label>
            <Input
              id="admin-name"
              placeholder="שם מלא"
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-employee-id">מספר עובד</Label>
            <Input
              id="admin-employee-id"
              placeholder="לדוגמה: 1234"
              {...register('employeeId')}
            />
            {errors.employeeId ? (
              <p className="text-xs text-red-600">
                {errors.employeeId.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-role">תפקיד</Label>
            <Select
              onValueChange={(val) =>
                setValue('role', val as 'admin' | 'manager' | 'viewer')
              }
              defaultValue={defaultRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר תפקיד" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">צופה (Viewer)</SelectItem>
                <SelectItem value="manager">מנהל משימות (Manager)</SelectItem>
                <SelectItem value="admin">מנהל מערכת (Admin)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role ? (
              <p className="text-xs text-red-600">{errors.role.message}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="admin-email">
              אימייל (אופציונלי - אם ריק יווצר אוטומטית)
            </Label>
            <Input
              id="admin-email"
              type="email"
              placeholder="example@toyota.co.il"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-xs text-red-600">{errors.email.message}</p>
            ) : null}
          </div>
          <AlertDialogFooter>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={submitting}
            >
              {mode === 'create'
                ? submitting
                  ? 'יוצר...'
                  : 'צור מנהל'
                : submitting
                ? 'מעדכן...'
                : 'עדכן מנהל'}
            </Button>
            <AlertDialogCancel type="button" disabled={submitting}>
              ביטול
            </AlertDialogCancel>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---- Delete confirmation dialog ----

type DeleteAdminDialogProps = {
  deletingId: string | null;
  submitting: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAdminDialog({
  deletingId,
  submitting,
  onConfirm,
  onOpenChange,
}: DeleteAdminDialogProps) {
  return (
    <AlertDialog
      open={!!deletingId}
      onOpenChange={(open) => !open && onOpenChange(open)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>מחיקת מנהל</AlertDialogTitle>
        </AlertDialogHeader>
        <p className="mt-2 text-xs text-gray-700">
          האם אתה בטוח שברצונך למחוק את המנהל? פעולה זו אינה הפיכה.
        </p>
        <AlertDialogFooter>
          <AlertDialogAction
            type="button"
            className="bg-red-600 hover:bg-red-700"
            disabled={submitting}
            onClick={onConfirm}
          >
            מחק
          </AlertDialogAction>
          <AlertDialogCancel type="button" disabled={submitting}>
            ביטול
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

