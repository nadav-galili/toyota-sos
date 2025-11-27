import type { ChecklistSchema } from '@/components/driver/ChecklistModal';

/**
 * Return the checklist schema a driver must complete when moving a task
 * into a given status (currently only "start work" for specific task types).
 *
 * NOTE:
 * - Task types here are the DB enum values (e.g. 'licence_test'), not the
 *   Hebrew labels used in the admin UI.
 */

export function getStartChecklistForTaskType(
  taskType: string | null | undefined
): ChecklistSchema | null {
  // The DB stores the Hebrew label for task types (e.g. "ביצוע טסט")
  if (taskType === 'ביצוע טסט') {
    // "ביצוע טסט" start checklist
    return [
      {
        id: 'car_license',
        type: 'boolean',
        title: 'האם לקחת רשיון רכב?',
        required: true,
      },
      {
        id: 'client_license',
        type: 'boolean',
        title: 'האם לקחת רשיון נהיגה של הלקוח?',
        required: true,
      },
      {
        id: 'vehicle_insurance',
        type: 'boolean',
        title: 'האם לקחת ביטוח חובה של הרכב?',
        required: true,
      },
    ];
  }

  return null;
}

/**
 * Determines which special completion flow (if any) is required for a task type
 * when moving to 'completed' status.
 */
export function getCompletionFlowForTaskType(
  taskType: string | null | undefined
): 'replacement_car_delivery' | null {
  if (taskType === 'הסעת רכב חלופי') {
    return 'replacement_car_delivery';
  }
  return null;
}
