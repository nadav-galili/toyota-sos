export type AdminRole = 'admin' | 'manager' | 'viewer';

export type AdminRow = {
  id: string;
  name: string | null;
  email: string | null;
  employee_id: string | null;
  role: AdminRole;
  created_at: string;
  updated_at: string;
};

