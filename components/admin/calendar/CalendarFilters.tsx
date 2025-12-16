'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type {
  CalendarFilters,
  TaskType,
  TaskStatus,
  TaskPriority,
} from '@/types/task';
import type { Driver } from '@/types/user';
import type { Client } from '@/types/entity';

const taskTypes: TaskType[] = [
  'איסוף רכב/שינוע',
  'החזרת רכב/שינוע',
  'הסעת רכב חלופי',
  'הסעת לקוח הביתה',
  'הסעת לקוח למוסך',
  'ביצוע טסט',
  'חילוץ רכב תקוע',
  'אחר',
];

const taskStatuses: TaskStatus[] = ['בהמתנה', 'בעבודה', 'חסומה', 'הושלמה'];

const taskPriorities: TaskPriority[] = [
  'מיידי',
  'גבוהה',
  'בינונית',
  'נמוכה',
  'ללא עדיפות',
];

const statusLabels: Record<TaskStatus, string> = {
  בהמתנה: 'ממתינה',
  בעבודה: 'בביצוע',
  חסומה: 'חסומה',
  הושלמה: 'הושלמה',
};

const priorityColors: Record<TaskPriority, string> = {
  מיידי: 'bg-red-500',
  גבוהה: 'bg-orange-500',
  בינונית: 'bg-yellow-500',
  נמוכה: 'bg-green-500',
  'ללא עדיפות': 'bg-gray-400',
};

interface CalendarFiltersPanelProps {
  filters: CalendarFilters;
  onFiltersChange: (filters: CalendarFilters) => void;
  drivers: Driver[];
  clients: Client[];
}

export function CalendarFiltersPanel({
  filters,
  onFiltersChange,
  drivers,
  clients,
}: CalendarFiltersPanelProps) {
  const handleTypeToggle = (type: TaskType) => {
    const newTypes = filters.taskTypes.includes(type)
      ? filters.taskTypes.filter((t) => t !== type)
      : [...filters.taskTypes, type];
    onFiltersChange({ ...filters, taskTypes: newTypes });
  };

  const handleStatusToggle = (status: TaskStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onFiltersChange({ ...filters, statuses: newStatuses });
  };

  const handlePriorityToggle = (priority: TaskPriority) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onFiltersChange({ ...filters, priorities: newPriorities });
  };

  const handleDriverToggle = (driverId: string) => {
    const newDriverIds = filters.driverIds.includes(driverId)
      ? filters.driverIds.filter((id) => id !== driverId)
      : [...filters.driverIds, driverId];
    onFiltersChange({ ...filters, driverIds: newDriverIds });
  };

  const handleClientToggle = (clientId: string) => {
    const newClientIds = filters.clientIds.includes(clientId)
      ? filters.clientIds.filter((id) => id !== clientId)
      : [...filters.clientIds, clientId];
    onFiltersChange({ ...filters, clientIds: newClientIds });
  };

  const handleClearAll = () => {
    onFiltersChange({
      taskTypes: [],
      statuses: [],
      priorities: [],
      driverIds: [],
      clientIds: [],
    });
  };

  const hasActiveFilters =
    filters.taskTypes.length > 0 ||
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.driverIds.length > 0 ||
    filters.clientIds.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-900">סינון משימות</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4 ml-1" />
            נקה הכל
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
        {/* Task Types */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">
            סוג משימה
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {taskTypes.map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.taskTypes.includes(type)}
                  onCheckedChange={() => handleTypeToggle(type)}
                />
                <label
                  htmlFor={`type-${type}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Statuses */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">
            סטטוס
          </Label>
          <div className="space-y-2">
            {taskStatuses.map((status) => (
              <div key={status} className="flex items-center gap-2">
                <Checkbox
                  id={`status-${status}`}
                  checked={filters.statuses.includes(status)}
                  onCheckedChange={() => handleStatusToggle(status)}
                />
                <label
                  htmlFor={`status-${status}`}
                  className="text-sm text-slate-700 cursor-pointer"
                >
                  {statusLabels[status]}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priorities */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">
            עדיפות
          </Label>
          <div className="space-y-2">
            {taskPriorities.map((priority) => (
              <div key={priority} className="flex items-center gap-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={filters.priorities.includes(priority)}
                  onCheckedChange={() => handlePriorityToggle(priority)}
                />
                <label
                  htmlFor={`priority-${priority}`}
                  className="text-sm text-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${priorityColors[priority]}`}
                  />
                  {priority}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Drivers */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">
            נהג
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {drivers.map((driver) => (
              <div key={driver.id} className="flex items-center gap-2">
                <Checkbox
                  id={`driver-${driver.id}`}
                  checked={filters.driverIds.includes(driver.id)}
                  onCheckedChange={() => handleDriverToggle(driver.id)}
                />
                <label
                  htmlFor={`driver-${driver.id}`}
                  className="text-sm text-slate-700 cursor-pointer truncate"
                >
                  {driver.name || driver.email}
                </label>
              </div>
            ))}
            {drivers.length === 0 && (
              <p className="text-xs text-slate-400">אין נהגים</p>
            )}
          </div>
        </div>

        {/* Clients */}
        <div>
          <Label className="text-xs font-medium text-slate-600 mb-2 block">
            לקוח
          </Label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {clients.slice(0, 20).map((client) => (
              <div key={client.id} className="flex items-center gap-2">
                <Checkbox
                  id={`client-${client.id}`}
                  checked={filters.clientIds.includes(client.id)}
                  onCheckedChange={() => handleClientToggle(client.id)}
                />
                <label
                  htmlFor={`client-${client.id}`}
                  className="text-sm text-slate-700 cursor-pointer truncate"
                >
                  {client.name}
                </label>
              </div>
            ))}
            {clients.length === 0 && (
              <p className="text-xs text-slate-400">אין לקוחות</p>
            )}
            {clients.length > 20 && (
              <p className="text-xs text-slate-400">
                +{clients.length - 20} נוספים
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

